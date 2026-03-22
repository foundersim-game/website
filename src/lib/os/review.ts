import { InAppReview } from '@capacitor-community/in-app-review';
import { Capacitor } from '@capacitor/core';

const APP_ID = 'com.foundersim.app';

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

export function openStoreListing() {
    const url = Capacitor.getPlatform() === 'ios'
        ? `https://apps.apple.com/app/idYOUR_APPLE_ID` // Update after iOS submission
        : `https://play.google.com/store/apps/details?id=${APP_ID}`;
    
    window.open(url, '_blank');
}
