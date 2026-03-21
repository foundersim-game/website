import {
    AdMob,
    BannerAdOptions,
    BannerAdPosition,
    BannerAdSize,
    AdOptions,
    RewardAdOptions,
    AdMobError,
    RewardAdPluginEvents
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const BANNER_ID = 'ca-app-pub-5887294790874355/4254867630';
const INTERSTITIAL_ID = 'ca-app-pub-5887294790874355/6941720664';
const REWARDED_ID = 'ca-app-pub-5887294790874355/2086115272';
export const REWARDED_CASH_ID = 'ca-app-pub-5887294790874355/7086180579';

class AdService {
    private initialized = false;
    private isNative = false;

    async initialize() {
        if (this.initialized) return;
        this.isNative = Capacitor.isNativePlatform();

        if (!this.isNative) {
            this.initialized = true;
            return;
        }

        try {
            await AdMob.initialize({
                testingDevices: [],
                initializeForTesting: false,
            });
            this.initialized = true;
            console.log('AdMob Initialized');
        } catch (e) {
            console.error('AdMob Initialization failed', e);
        }
    }

    async showBanner() {
        if (!this.initialized) await this.initialize();
        if (!this.isNative) return;

        try {
            // Try resuming first in case it was hidden when navigating
            await AdMob.resumeBanner();
        } catch (e) {
            // If resume fails (e.g., first time or not loaded yet), recreate/show
            const options: BannerAdOptions = {
                adId: BANNER_ID,
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: false
            };
            try {
                await AdMob.showBanner(options);
            } catch (innerE) {
                console.error('Banner failed on showBanner', innerE);
            }
        }
    }

    async hideBanner() {
        if (!this.isNative) return;
        try {
            await AdMob.hideBanner();
        } catch (e) {
            console.error('Hide banner failed', e);
        }
    }

    async prepareInterstitial() {
        if (!this.initialized) await this.initialize();
        if (!this.isNative) return;

        const options: AdOptions = {
            adId: INTERSTITIAL_ID,
            isTesting: false
        };
        try {
            await AdMob.prepareInterstitial(options);
        } catch (e) {
            console.error('Prepare Interstitial failed', e);
        }
    }

    async showInterstitial() {
        if (!this.isNative) return;
        try {
            await AdMob.showInterstitial();
        } catch (e) {
            console.error('Show Interstitial failed', e);
        }
    }

    async showRewardedAd(onReward: () => void, adUnitId?: string) {
        if (!this.initialized) await this.initialize();
        
        if (!this.isNative) {
            // Web: Ads not supported outside native platform — reward not granted
            toast.info("Ads available on the mobile app only.", { description: "Download the app to earn rewards via ads." });
            return;
        }

        const options: RewardAdOptions = {
            adId: adUnitId || REWARDED_ID,
            isTesting: false
        };

        try {
            await AdMob.prepareRewardVideoAd(options);

            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: any) => {
                console.log('User earned reward:', reward);
                onReward();
                rewardListener.remove();
            });

            await AdMob.showRewardVideoAd();

        } catch (e) {
            console.error('Rewarded ad failed', e);
            toast.error("Failed to load ad.");
        }
    }
}

export const adService = new AdService();
