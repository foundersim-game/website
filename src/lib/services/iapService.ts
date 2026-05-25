import { NativePurchases } from '@capgo/native-purchases';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export const IAP_PRODUCT_IDS = {
    AD_FREE: "founder_sim_premium",
    STARTER_PACK: "founder_sim_starter_pack",
    CAFFEINE_DRIP: "founder_sim_caffeine",
    TITAN_INDUSTRY: "founder_sim_titan",
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
            return owned;
        }
        try {
            const { purchases } = await NativePurchases.getPurchases({ productType: "inapp" as any });
            const owned = purchases.filter(p => p.purchaseState === "1").map(p => p.productIdentifier);

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
            return owned;
        } catch (error) {
            console.warn("[IAP] Native check failed, falling back to localStorage", error);
        }
        const ownedFallback: string[] = [];
        if (localStorage.getItem("founder_sim_premium") === "true") ownedFallback.push(IAP_PRODUCT_IDS.AD_FREE);
        if (localStorage.getItem("founder_sim_caffeine") === "true") ownedFallback.push(IAP_PRODUCT_IDS.CAFFEINE_DRIP);
        if (localStorage.getItem("founder_sim_titan") === "true") ownedFallback.push(IAP_PRODUCT_IDS.TITAN_INDUSTRY);
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
            toast.success("Test Purchase Successful (Web Mode)");
            return true;
        }

        try {
            const transaction = await NativePurchases.purchaseProduct({
                productIdentifier: productId,
                productType: productId === IAP_PRODUCT_IDS.STARTER_PACK ? ("consumable" as any) : ("inapp" as any),
                autoAcknowledgePurchases: true
            });

            if (transaction.purchaseState === "1") {
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
                toast.success("Purchase Successful!", { description: "Thank you for supporting Founder Sim!" });
                return true;
            } else if (transaction.purchaseState === "0") {
                toast.info("Purchase Pending", { description: "Your payment is being processed." });
                return false;
            }
        } catch (error: any) {
            console.error("[IAP] Purchase failed", error);
            toast.error("Purchase Failed", { description: error.message || "Something went wrong." });
        }
        return false;
    }

    public async restorePurchases(): Promise<string[]> {
        if (!Capacitor.isNativePlatform()) return this.getOwnedNonConsumables();
        try {
            await NativePurchases.restorePurchases();
            const owned = await this.getOwnedNonConsumables();
            if (owned.length > 0) {
                toast.success("Purchases Restored", { description: "Your purchases were successfully synced." });
            } else {
                toast.info("No Purchases Found", { description: "We couldn't find any premium access for this account." });
            }
            return owned;
        } catch (error: any) {
            console.error("[IAP] Restore failed", error);
            toast.error("Restore Failed", { description: error.message });
        }
        return [];
    }
}

export const iapService = IAPService.getInstance();
