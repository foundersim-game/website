import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import https from 'https';

// Helper function to safely fetch using native https to avoid node-fetch environment issues
function nativeFetch(url: string, token: string): Promise<{ status: number, data: any }> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode || 500, data: {} });
        }
      });
    }).on('error', reject);
  });
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS setup
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
    // We can return error strings for invalid requests, since the mobile app won't hit this path directly
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { purchaseToken, productId } = request.body;

    if (!purchaseToken || !productId) {
      // Return strict valid: false without 'error' so the mobile app blocks it
      return response.status(200).json({ valid: false });
    }

    const credentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    if (!credentialsStr) {
      console.error('Missing GOOGLE_PLAY_CREDENTIALS env var on Vercel');
      // If we return 'error' here, the mobile app will gracefully grant the item to everyone!
      // We must be strict to stop pirates.
      return response.status(200).json({ valid: false });
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

    // Retry loop for 404s (Google Play propagation delay for legitimate purchases)
    let attempt = 0;
    let maxAttempts = 3;
    let resStatus = 500;
    let resData: any = {};

    while (attempt < maxAttempts) {
      try {
        const result = await nativeFetch(url, token.token as string);
        resStatus = result.status;
        resData = result.data;

        if (resStatus === 404) {
          attempt++;
          if (attempt < maxAttempts) {
            console.log(`[Verify] 404 Not Found. Retrying in 2 seconds... (Attempt ${attempt}/${maxAttempts})`);
            await new Promise(r => setTimeout(r, 2000));
          }
        } else {
          break; // Break on 200 OK or 400 Bad Request
        }
      } catch (networkError) {
        console.error('[Verify] Native fetch failed:', networkError);
        break; // Stop retrying on hard network failures
      }
    }

    if (resStatus === 200) {
      // purchaseState 0 = PURCHASED (valid)
      // purchaseState 1 = CANCELLED
      const valid = resData.purchaseState === 0;
      return response.status(200).json({ valid });
    } else {
      console.warn(`[Verify] Google Play API returned ${resStatus} for token. Likely pirated or invalid.`);
      // Return STRICT {valid: false}. Do NOT include an 'error' property! 
      // If we include 'error', the mobile app will gracefully grant the item!
      return response.status(200).json({ valid: false });
    }
  } catch (error: any) {
    console.error('[Verify] Exception during verification:', error);
    // Be incredibly strict. Do not return 'error' property so the mobile app blocks it!
    return response.status(200).json({ valid: false });
  }
}
