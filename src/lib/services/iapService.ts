import { NativePurchases } from '@capgo/native-purchases';
import { toast } from 'sonner';

const PRODUCT_ID_PREMIUM = "founder_sim_premium"; // Must match Play Console ID

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

    /**
     * Initializes state and restores previous purchases if any.
     */
    public async initialize() {
        if (this.initialized) return;
        try {
            // Optional: check if billing is supported
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

    /**
     * Checks if the user is already premium.
     * Looks at native cached purchases if native is available,
     * otherwise falls back to localStorage (for web rendering/testing).
     */
    public async checkPremiumStatus(): Promise<boolean> {
        try {
            const { purchases } = await NativePurchases.getPurchases({ productType: "inapp" as any });
            const hasPremium = purchases.some(p => p.productIdentifier === PRODUCT_ID_PREMIUM && p.purchaseState === "1");
            
            if (hasPremium) {
                localStorage.setItem("founder_sim_premium", "true");
                return true;
            }
        } catch (error) {
            console.warn("[IAP] Native check failed, falling back to localStorage", error);
        }
        return localStorage.getItem("founder_sim_premium") === "true";
    }

    /**
     * Triggers the purchase flow for Premium.
     */
    public async purchasePremium(): Promise<boolean> {
        try {
            const transaction = await NativePurchases.purchaseProduct({
                productIdentifier: PRODUCT_ID_PREMIUM,
                productType: "inapp" as any, // "inapp" for one-time purchases
                autoAcknowledgePurchases: true
            });

            if (transaction.purchaseState === "1") {
                localStorage.setItem("founder_sim_premium", "true");
                toast.success("Welcome to the 1%!", { description: "Premium unlocked. Ads removed!" });
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

    /**
     * Restores previous purchases manually.
     */
    public async restorePurchases(): Promise<boolean> {
        try {
            await NativePurchases.restorePurchases();
            const premium = await this.checkPremiumStatus();
            if (premium) {
                toast.success("Purchases Restored", { description: "Your Premium status was found!" });
                return true;
            } else {
                toast.info("No Purchases Found", { description: "We couldn't find any premium access for this account." });
            }
        } catch (error: any) {
            console.error("[IAP] Restore failed", error);
            toast.error("Restore Failed", { description: error.message });
        }
        return false;
    }
}

export const iapService = IAPService.getInstance();
