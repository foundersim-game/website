import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { GoogleAuth } from "google-auth-library";

initializeApp();

// Store your Google Play service account JSON as a Firebase Secret:
// firebase functions:secrets:set GOOGLE_PLAY_SERVICE_ACCOUNT
const PLAY_SERVICE_ACCOUNT = defineSecret("GOOGLE_PLAY_SERVICE_ACCOUNT");

const PACKAGE_NAME = "com.foundersim.app";

/**
 * Verifies an Android purchase token against the Google Play Developer API.
 *
 * Called from iapService.ts on Android immediately after a "successful" purchase.
 * On verification failure, the player's username is shadowbanned in Firestore — they
 * continue playing locally (don't realise) but are invisible on the Global Leaderboard.
 *
 * Returns: { valid: boolean }
 */
export const verifyAndroidPurchase = onCall(
    { secrets: [PLAY_SERVICE_ACCOUNT] },
    async (request) => {
        const { purchaseToken, productId, username } = request.data as {
            purchaseToken: string;
            productId: string;
            username: string | null;
        };

        if (!purchaseToken || !productId) {
            throw new HttpsError("invalid-argument", "purchaseToken and productId are required.");
        }

        let valid = false;

        try {
            // Authenticate using the service account key stored as a secret
            const serviceAccountKey = JSON.parse(PLAY_SERVICE_ACCOUNT.value());
            const auth = new GoogleAuth({
                credentials: serviceAccountKey,
                scopes: ["https://www.googleapis.com/auth/androidpublisher"],
            });
            const client = await auth.getClient();
            const token = await client.getAccessToken();

            // Call the Google Play Developer API to verify the purchase
            const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token.token}` },
            });

            if (res.ok) {
                const data = await res.json() as { purchaseState?: number; consumptionState?: number };
                // purchaseState 0 = PURCHASED (valid)
                // purchaseState 1 = CANCELLED
                valid = data.purchaseState === 0;
            } else {
                // 4xx from Google means the token is fake/tampered
                console.warn(`[Verify] Google Play API returned ${res.status} for token. Likely pirated.`);
                valid = false;
            }
        } catch (err) {
            // If something goes wrong server-side (network, auth), give benefit of the doubt
            console.error("[Verify] Error calling Play API:", err);
            return { valid: true };
        }

        // --- SHADOWBAN ---
        // If invalid AND the user has a leaderboard username, mark them as shadowbanned.
        // We do this silently — the app returns `valid: true` to the pirate so they
        // have no idea. Only the leaderboard query filters them out.
        if (!valid && username) {
            try {
                const db = getFirestore();
                // Shadowban the player document
                await db.doc(`players/${username}`).set(
                    {
                        shadowbanned: true,
                        shadowbannedAt: FieldValue.serverTimestamp(),
                        shadowbannedReason: `Invalid purchaseToken for ${productId}`,
                    },
                    { merge: true }
                );
                // Log the incident
                await db.collection("shadowban_log").add({
                    username,
                    productId,
                    purchaseToken,
                    detectedAt: FieldValue.serverTimestamp(),
                });
                console.log(`[Verify] Shadowbanned pirate: ${username} for product ${productId}`);
            } catch (e) {
                console.error("[Verify] Failed to write shadowban:", e);
            }

            // Return true to the pirate — they must not know
            return { valid: true };
        }

        return { valid };
    }
);
