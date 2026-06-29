import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS setup to allow the mobile app to call it from any origin
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { purchaseToken, productId } = request.body;

    if (!purchaseToken || !productId) {
      return response.status(400).json({ valid: false, error: 'Missing purchaseToken or productId' });
    }

    const credentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    if (!credentialsStr) {
      console.error('Missing GOOGLE_PLAY_CREDENTIALS env var on Vercel');
      return response.status(500).json({ valid: false, error: 'Server configuration error' });
    }

    const credentials = JSON.parse(credentialsStr);
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const PACKAGE_NAME = "com.foundersim.app";
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token.token}` },
    });

    if (res.ok) {
      const data = await res.json() as { purchaseState?: number; consumptionState?: number };
      // purchaseState 0 = PURCHASED (valid)
      // purchaseState 1 = CANCELLED
      const valid = data.purchaseState === 0;
      return response.status(200).json({ valid });
    } else {
      if (res.status === 400 || res.status === 404) {
        console.warn(`[Verify] Google Play API returned ${res.status} for token. Likely pirated.`);
        return response.status(200).json({ valid: false });
      } else {
        console.error(`[Verify] Google Play API returned ${res.status}. Server/Auth issue.`);
        // Return an error string so the client grants gracefully instead of flagging as pirate
        return response.status(200).json({ valid: false, error: `Google API Error: ${res.status}` });
      }
    }
  } catch (error) {
    console.error('[Verify] Exception during verification:', error);
    // Be strict: if it fails, don't grant the item. The user can retry later.
    return response.status(200).json({ valid: false, error: 'Internal verification error' });
  }
}
