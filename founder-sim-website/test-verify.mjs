import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';

async function test() {
    try {
        const credentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
        if (!credentialsStr) {
            console.log("No credentials");
            return;
        }
        const credentials = JSON.parse(credentialsStr);
        const auth = new GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/androidpublisher"],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        console.log("Got token!", token.token.substring(0, 10));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
