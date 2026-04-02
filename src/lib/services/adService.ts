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

const ADMOB_PUBLISHER = '5887294790874355';

const IDS = {
    android: {
        banner: `ca-app-pub-${ADMOB_PUBLISHER}/4254867630`,
        interstitial: `ca-app-pub-${ADMOB_PUBLISHER}/6941720664`,
        rewarded_cash: `ca-app-pub-${ADMOB_PUBLISHER}/7086180579`,
        rewarded_energy: `ca-app-pub-${ADMOB_PUBLISHER}/2086115272`,
        rewarded_mentor: `ca-app-pub-${ADMOB_PUBLISHER}/2280658604`,
    },
    ios: {
        banner: `ca-app-pub-${ADMOB_PUBLISHER}/2915011014`,
        interstitial: `ca-app-pub-${ADMOB_PUBLISHER}/6703046939`,
        rewarded_cash: `ca-app-pub-${ADMOB_PUBLISHER}/5389965267`,
        rewarded_energy: `ca-app-pub-${ADMOB_PUBLISHER}/5102190652`,
        rewarded_mentor: `ca-app-pub-${ADMOB_PUBLISHER}/1677649646`,
    }
};

class AdService {
    private initialized = false;
    private isNative = false;
    private platform: 'ios' | 'android' | 'web' = 'web';

    async initialize() {
        if (this.initialized) return;
        this.isNative = Capacitor.isNativePlatform();
        
        if (this.isNative) {
            this.platform = Capacitor.getPlatform() as 'ios' | 'android';
        }

        if (!this.isNative) {
            this.initialized = true;
            return;
        }

        try {
            if (this.platform === 'ios') {
                const trackingInfo = await AdMob.trackingAuthorizationStatus();
                if (trackingInfo.status === 'notDetermined') {
                    await AdMob.requestTrackingAuthorization();
                }
            }

            await AdMob.initialize({
                testingDevices: [],
                initializeForTesting: false, 
            });
            this.initialized = true;
        } catch (e) {
            console.error('AdMob Initialization failed', e);
        }
    }

    async showBanner() {
        if (!this.initialized) await this.initialize();
        if (!this.isNative) return;

        const options: BannerAdOptions = {
            adId: this.platform === 'ios' ? IDS.ios.banner : IDS.android.banner,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false
        };

        try {
            await AdMob.showBanner(options);
        } catch (e: any) {
            console.error('showBanner failed', e);
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
            adId: this.platform === 'ios' ? IDS.ios.interstitial : IDS.android.interstitial,
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

    async showRewardedAd(onReward: () => void, adType: 'cash' | 'energy' | 'mentor' | 'default' = 'default') {
        if (!this.initialized) await this.initialize();
        
        if (!this.isNative) {
            toast.info("Ads available on the mobile app only.", { description: "Download the app to earn rewards via ads." });
            return;
        }

        let adId = IDS.android.rewarded_energy; // Default to energy/general
        if (this.platform === 'ios') {
            if (adType === 'cash') adId = IDS.ios.rewarded_cash;
            else if (adType === 'energy') adId = IDS.ios.rewarded_energy;
            else if (adType === 'mentor') adId = IDS.ios.rewarded_mentor;
            else adId = IDS.ios.rewarded_energy; // Use energy rewarded ID for default, NOT banner
        } else {
            // Android platform
            if (adType === 'cash') adId = IDS.android.rewarded_cash;
            else if (adType === 'energy') adId = IDS.android.rewarded_energy;
            else if (adType === 'mentor') adId = IDS.android.rewarded_mentor;
        }

        const options: RewardAdOptions = {
            adId: adId,
            isTesting: false
        };

        try {
            await AdMob.prepareRewardVideoAd(options);

            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: any) => {
                console.log('User earned reward:', reward);
                onReward();
                rewardListener.remove();
            });

            const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                console.log('Ad dismissed');
                dismissListener.remove();
                rewardListener.remove();
            });

            const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (err: any) => {
                console.error('Ad failed to show', err);
                toast.error("Ad failed to show. Try again.");
                failedListener.remove();
                dismissListener.remove();
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
