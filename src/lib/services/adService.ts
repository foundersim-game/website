import {
    AdMob,
    BannerAdOptions,
    BannerAdPosition,
    BannerAdSize,
    AdOptions,
    RewardAdOptions,
    AdMobError,
    RewardAdPluginEvents,
    AdmobConsentStatus
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
    private isPremium = false;
    private interstitialLoaded = false;
    private interstitialLoading = false;
    private rewardedLoaded: Record<string, boolean> = {};
    private rewardedLoading: Record<string, boolean> = {};
    private lastResumeTime = 0;
    private RESUME_DEBOUNCE = 3000; // 3 seconds

    setPremium(status: boolean) {
        this.isPremium = status;
        if (status) this.hideBanner();
    }

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
            // Handle UMP Consent (Google Requirement)
            try {
                const consentInfo = await AdMob.requestConsentInfo();
                if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
                    await AdMob.showConsentForm();
                }
            } catch (consentError) {
                console.warn('UMP Consent flow failed or skipped:', consentError);
            }

            // Handle iOS ATT (App Tracking Transparency)
            if (this.platform === 'ios') {
                const trackingInfo = await AdMob.trackingAuthorizationStatus();
                if (trackingInfo.status === 'notDetermined') {
                    await AdMob.requestTrackingAuthorization();
                }
            }

            await AdMob.initialize({
                initializeForTesting: false,
            });
            this.initialized = true;
            console.log('AdMob Initialized successfully on', this.platform);
            
            // Initial pre-load: Only the interstitial, as it's the most common ad.
            // Rewarded ads are now lazy-loaded on-demand to protect Show Rate.
            if (!this.isPremium) {
                this.prepareInterstitial();
            }
        } catch (e: any) {
            console.error('AdMob Initialization failed:', e);
        }
    }

    async preLoadAll() {
        if (!this.isNative || this.isPremium) return;
        console.log('Pre-loading all ads...');
        this.prepareInterstitial();
        this.prepareRewarded('energy');
        this.prepareRewarded('cash');
        this.prepareRewarded('mentor');
    }

    async resume() {
        if (!this.isNative) return;
        
        const now = Date.now();
        if (now - this.lastResumeTime < this.RESUME_DEBOUNCE) {
            console.log('AdService: Resume debounced');
            return;
        }
        this.lastResumeTime = now;
        
        console.log('AdService: Resuming ads...');
        
        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.isPremium) {
            // Re-show banner as iOS often detaches it on background
            await this.showBanner();
            // We don't preLoadAll on every resume to avoid spamming requests
            // Just ensure interstitial is ready
            if (!this.interstitialLoaded) this.prepareInterstitial();
        }
    }

    async showBanner() {
        if (!this.initialized) await this.initialize();
        if (!this.isNative || this.isPremium) return;

        const options: BannerAdOptions = {
            adId: this.platform === 'ios' ? IDS.ios.banner : IDS.android.banner,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false
        };

        try {
            // On iOS, sometimes we need to hide first to ensure the new one attaches correctly
            if (this.platform === 'ios') {
                await AdMob.hideBanner().catch(() => {});
            }
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
        if (!this.isNative || this.isPremium) return;
        if (this.interstitialLoaded || this.interstitialLoading) return;

        this.interstitialLoading = true;
        const options: AdOptions = {
            adId: this.platform === 'ios' ? IDS.ios.interstitial : IDS.android.interstitial,
            isTesting: false
        };
        try {
            await AdMob.prepareInterstitial(options);
            this.interstitialLoaded = true;
            console.log('Interstitial prepared');
        } catch (e) {
            this.interstitialLoaded = false;
            console.error('Prepare Interstitial failed', e);
        } finally {
            this.interstitialLoading = false;
        }
    }

    async showInterstitial() {
        if (!this.isNative || this.isPremium) return;
        try {
            await AdMob.showInterstitial();
            this.interstitialLoaded = false;
            // Auto-reload after show
            this.prepareInterstitial();
        } catch (e) {
            console.error('Show Interstitial failed', e);
            this.interstitialLoaded = false;
            this.prepareInterstitial();
        }
    }

    async prepareRewarded(adType: 'cash' | 'energy' | 'mentor' | 'default' = 'default') {
        if (!this.initialized) await this.initialize();
        if (!this.isNative || this.isPremium) return;
        if (this.rewardedLoaded[adType] || this.rewardedLoading[adType]) return;

        this.rewardedLoading[adType] = true;
        let adId = this.platform === 'ios' ? IDS.ios.rewarded_energy : IDS.android.rewarded_energy;
        if (this.platform === 'ios') {
            if (adType === 'cash') adId = IDS.ios.rewarded_cash;
            else if (adType === 'mentor') adId = IDS.ios.rewarded_mentor;
        } else {
            if (adType === 'cash') adId = IDS.android.rewarded_cash;
            else if (adType === 'mentor') adId = IDS.android.rewarded_mentor;
        }

        try {
            await AdMob.prepareRewardVideoAd({ adId, isTesting: false });
            this.rewardedLoaded[adType] = true;
            console.log(`Rewarded ad (${adType}) prepared`);
        } catch (e) {
            this.rewardedLoaded[adType] = false;
            console.warn(`Prepare Rewarded (${adType}) failed`, e);
        } finally {
            this.rewardedLoading[adType] = false;
        }
    }

    async showRewardedAd(onReward: () => void, adType: 'cash' | 'energy' | 'mentor' | 'default' = 'default') {
        if (!this.initialized) await this.initialize();

        if (!this.isNative) {
            toast.info("Ads available on the mobile app only.", { description: "Download the app to earn rewards via ads." });
            return;
        }

        if (this.isPremium) {
            onReward(); // Premium users get rewards instantly
            return;
        }

        try {
            // Only prepare if not already loaded or if we want to ensure freshness
            if (!this.rewardedLoaded[adType]) {
                await this.prepareRewarded(adType);
            }

            const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: any) => {
                console.log('User earned reward:', reward);
                this.rewardedLoaded[adType] = false;
                onReward();
                rewardListener.remove();
            });

            const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                console.log('Ad dismissed');
                dismissListener.remove();
                rewardListener.remove();
                // Reload next one
                this.prepareRewarded(adType);
            });

            const failedListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (err: any) => {
                console.error('Ad failed to show', err);
                toast.error("Ad not ready yet. Please try again in a few seconds.");
                failedListener.remove();
                dismissListener.remove();
                rewardListener.remove();
                this.prepareRewarded(adType);
            });

            await AdMob.showRewardVideoAd();

        } catch (e) {
            console.error('Rewarded ad failed', e);
            toast.error("Failed to load ad.");
        }
    }

    async showPrivacySettings() {
        if (!this.isNative) return;
        try {
            const consentInfo = await AdMob.requestConsentInfo();
            if (consentInfo.isConsentFormAvailable) {
                await AdMob.showConsentForm();
            } else {
                toast.info("Privacy settings are managed by your device.");
            }
        } catch (e) {
            console.error("Failed to show consent form", e);
            toast.error("Could not open privacy settings.");
        }
    }
}

export const adService = new AdService();
