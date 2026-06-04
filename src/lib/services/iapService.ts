import { NativePurchases } from '@capgo/native-purchases';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export const IAP_PRODUCT_IDS = {
    AD_FREE: "founder_sim_premium",
    STARTER_PACK: "founder_sim_starter_pack",
    CAFFEINE_DRIP: "founder_sim_caffeine",
    TITAN_INDUSTRY: "founder_sim_titan",
    GOD_MODE: "founder_sim_god_mode",
    GOV_CONTRACT: "founder_sim_gov_contract",
    SV_DARLING: "founder_sim_sv_darling",
};

export class IAPService {
    private static instance: IAPService;
    private initialized = false;

    private constructor() { }

    public static getInstance(): IAPService {
        if (!IAPService.instance) {
            IAPService.instance = new IAPService();
        }
        return IAPService.instance;
    }

    public async initialize() {
        if (this.initialized) return;
        try {
            const { isBillingSupported } = await NativePurchases.isBillingSupported();
            if (!isBillingSupported) {
                console.warn("[IAP] Billing is not supported on this device.");
                return;
            }
            this.initialized = true;
            console.log("[IAP] Initialized successfully");
        } catch (error) {
            console.error("[IAP] Initialization failed", error);
        }
    }

    public async getProducts() {
        try {
            const { products } = await NativePurchases.getProducts({
                productIdentifiers: Object.values(IAP_PRODUCT_IDS)
            });
            return products;
        } catch (error) {
            console.error("[IAP] Failed to fetch products", error);
            return [];
        }
    }

    public async getOwnedNonConsumables(): Promise<string[]> {
        if (!Capacitor.isNativePlatform()) {
            const owned: string[] = [];
            if (localStorage.getItem("founder_sim_premium") === "true") owned.push(IAP_PRODUCT_IDS.AD_FREE);
            if (localStorage.getItem("founder_sim_caffeine") === "true") owned.push(IAP_PRODUCT_IDS.CAFFEINE_DRIP);
            if (localStorage.getItem("founder_sim_titan") === "true") owned.push(IAP_PRODUCT_IDS.TITAN_INDUSTRY);
            if (localStorage.getItem("founder_sim_god_mode") === "true") owned.push(IAP_PRODUCT_IDS.GOD_MODE);
            if (localStorage.getItem("founder_sim_sv_darling") === "true") owned.push(IAP_PRODUCT_IDS.SV_DARLING);
            return owned;
        }
        try {
            const { purchases } = await NativePurchases.getPurchases({ productType: "inapp" as any });
            const isIOS = Capacitor.getPlatform() === 'ios';
            const owned = purchases.filter(p => isIOS ? !!p.transactionId : p.purchaseState === "1").map(p => p.productIdentifier);

            if (owned.includes(IAP_PRODUCT_IDS.AD_FREE)) {
                localStorage.setItem("founder_sim_premium", "true");
            }
            if (owned.includes(IAP_PRODUCT_IDS.TITAN_INDUSTRY)) {
                localStorage.setItem("founder_sim_titan", "true");
                localStorage.setItem("founder_sim_premium", "true"); // Titan also removes ads!
            }
            if (owned.includes(IAP_PRODUCT_IDS.CAFFEINE_DRIP)) {
                localStorage.setItem("founder_sim_caffeine", "true");
            }
            if (owned.includes(IAP_PRODUCT_IDS.GOD_MODE)) {
                localStorage.setItem("founder_sim_god_mode", "true");
            }
            if (owned.includes(IAP_PRODUCT_IDS.SV_DARLING)) {
                localStorage.setItem("founder_sim_sv_darling", "true");
            }
            return owned;
        } catch (error) {
            console.warn("[IAP] Native check failed, falling back to localStorage", error);
        }
        const ownedFallback: string[] = [];
        if (localStorage.getItem("founder_sim_premium") === "true") ownedFallback.push(IAP_PRODUCT_IDS.AD_FREE);
        if (localStorage.getItem("founder_sim_caffeine") === "true") ownedFallback.push(IAP_PRODUCT_IDS.CAFFEINE_DRIP);
        if (localStorage.getItem("founder_sim_titan") === "true") ownedFallback.push(IAP_PRODUCT_IDS.TITAN_INDUSTRY);
        if (localStorage.getItem("founder_sim_god_mode") === "true") ownedFallback.push(IAP_PRODUCT_IDS.GOD_MODE);
        if (localStorage.getItem("founder_sim_sv_darling") === "true") ownedFallback.push(IAP_PRODUCT_IDS.SV_DARLING);
        return ownedFallback;
    }

    public async purchaseProduct(productId: string): Promise<boolean> {
        // For development/web simulation
        if (!Capacitor.isNativePlatform()) {
            if (productId === IAP_PRODUCT_IDS.AD_FREE) {
                localStorage.setItem("founder_sim_premium", "true");
            }
            if (productId === IAP_PRODUCT_IDS.TITAN_INDUSTRY) {
                localStorage.setItem("founder_sim_titan", "true");
                localStorage.setItem("founder_sim_premium", "true"); // Titan also removes ads!
            }
            if (productId === IAP_PRODUCT_IDS.CAFFEINE_DRIP) {
                localStorage.setItem("founder_sim_caffeine", "true");
            }
            if (productId === IAP_PRODUCT_IDS.GOD_MODE) {
                localStorage.setItem("founder_sim_god_mode", "true");
            }
            if (productId === IAP_PRODUCT_IDS.SV_DARLING) {
                localStorage.setItem("founder_sim_sv_darling", "true");
            }
            toast.success("Test Purchase Successful (Web Mode)");
            return true;
        }

        try {
            const transaction = await NativePurchases.purchaseProduct({
                productIdentifier: productId,
                productType: (productId === IAP_PRODUCT_IDS.STARTER_PACK || productId === IAP_PRODUCT_IDS.GOV_CONTRACT) ? ("consumable" as any) : ("inapp" as any),
                autoAcknowledgePurchases: true
            });

            const isIOS = Capacitor.getPlatform() === 'ios';
            const isPurchased = isIOS ? !!transaction.transactionId : transaction.purchaseState === "1";

            if (isPurchased) {
                if ((productId === IAP_PRODUCT_IDS.STARTER_PACK || productId === IAP_PRODUCT_IDS.GOV_CONTRACT) && !isIOS && transaction.purchaseToken) {
                    try {
                        await NativePurchases.consumePurchase({ purchaseToken: transaction.purchaseToken });
                    } catch (e) {
                        console.error("[IAP] Failed to consume Starter Pack on Android", e);
                    }
                }
                if (productId === IAP_PRODUCT_IDS.AD_FREE) {
                    localStorage.setItem("founder_sim_premium", "true");
                }
                if (productId === IAP_PRODUCT_IDS.TITAN_INDUSTRY) {
                    localStorage.setItem("founder_sim_titan", "true");
                    localStorage.setItem("founder_sim_premium", "true"); // Titan also removes ads!
                }
                if (productId === IAP_PRODUCT_IDS.CAFFEINE_DRIP) {
                    localStorage.setItem("founder_sim_caffeine", "true");
                }
                if (productId === IAP_PRODUCT_IDS.GOD_MODE) {
                    localStorage.setItem("founder_sim_god_mode", "true");
                }
                if (productId === IAP_PRODUCT_IDS.SV_DARLING) {
                    localStorage.setItem("founder_sim_sv_darling", "true");
                }
                toast.success("Purchase Successful!", { description: "Thank you for supporting Founder Sim!" });
                return true;
            } else if (!isIOS && transaction.purchaseState === "0") {
                toast.info("Purchase Pending", { description: "Your payment is being processed." });
                return false;
            }
        } catch (error: any) {
            console.error("[IAP] Purchase failed", error);
            const msg = error?.message?.toLowerCase() || "";
            if (msg.includes("cancel") || msg.includes("canceled") || msg.includes("user canceled")) {
                console.log("[IAP] Purchase cancelled by user.");
            } else {
                toast.error("Purchase Failed", { description: "There was a problem processing your request. Please try again." });
            }
        }
        return false;
    }

    public async restorePurchases(): Promise<string[]> {
        if (!Capacitor.isNativePlatform()) return this.getOwnedNonConsumables();
        try {
            await NativePurchases.restorePurchases();
            
            let extraRestored: string[] = [];
            try {
                // Fetch all purchases to see if there are unprocessed consumables (like promo codes)
                const { purchases } = await NativePurchases.getPurchases({ productType: "inapp" as any });
                const isIOS = Capacitor.getPlatform() === 'ios';
                
                for (const p of purchases) {
                    const txId = isIOS ? p.transactionId : p.purchaseToken;
                    if (!txId) continue;
                    
                    if (p.productIdentifier === IAP_PRODUCT_IDS.STARTER_PACK || p.productIdentifier === IAP_PRODUCT_IDS.GOV_CONTRACT) {
                        const processedKey = `processed_consumable_${txId}`;
                        if (localStorage.getItem(processedKey) !== "true") {
                            localStorage.setItem(processedKey, "true");
                            extraRestored.push(p.productIdentifier);
                            
                            // Try to consume it natively on Android
                            if (!isIOS && p.purchaseToken) {
                                try {
                                    await NativePurchases.consumePurchase({ purchaseToken: p.purchaseToken });
                                } catch (e) {
                                    console.error("[IAP] Failed to consume restored consumable", e);
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("[IAP] Failed to process consumables during restore", err);
            }

            const owned = await this.getOwnedNonConsumables();
            const allRestored = [...owned, ...extraRestored];
            
            if (allRestored.length > 0) {
                toast.success("Purchases Restored", { description: "Your purchases were successfully synced." });
            } else {
                toast.info("No Purchases Found", { description: "We couldn't find any premium access for this account." });
            }
            return allRestored;
        } catch (error: any) {
            console.error("[IAP] Restore failed", error);
            toast.error("Restore Failed", { description: error.message });
        }
        return [];
    }
}

export const iapService = IAPService.getInstance();
