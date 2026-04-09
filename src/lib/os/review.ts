import { InAppReview } from '@capacitor-community/in-app-review';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const APP_ID = 'com.foundersim.app';
const APPLE_APP_ID = '6761432505';

export async function requestStoreReview() {
    if (Capacitor.isNativePlatform()) {
        try {
            await InAppReview.requestReview();
        } catch (e) {
            console.error("In-app review failed", e);
            // Fallback to store listing if native prompt fails
            openStoreListing();
        }
    } else {
        console.log("In-app review requested (Web Mock)");
    }
}

export async function openStoreListing() {
    if (Capacitor.getPlatform() === 'ios') {
        // Use itms-apps deep link for direct App Store open on device
        // On simulator, fall back to Browser.open with https URL
        try {
            await Browser.open({ url: `itms-apps://itunes.apple.com/app/id${APPLE_APP_ID}?action=write-review` });
        } catch {
            await Browser.open({ url: `https://apps.apple.com/app/id${APPLE_APP_ID}` });
        }
    } else {
        await Browser.open({ url: `https://play.google.com/store/apps/details?id=${APP_ID}` });
    }
}
