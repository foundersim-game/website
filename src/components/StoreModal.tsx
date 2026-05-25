import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Startup } from "@/lib/types/database.types";
import { iapService, IAP_PRODUCT_IDS } from "@/lib/services/iapService";
import { toast } from "sonner";
import { Product } from "@capgo/native-purchases";
import { Capacitor } from "@capacitor/core";

interface StoreModalProps {
    open: boolean;
    onClose: () => void;
    startup: Startup;
    setStartup: (s: Startup | ((prev: Startup) => Startup)) => void;
}

export function StoreModal({ open, onClose, startup, setStartup }: StoreModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadProducts();
        }
    }, [open]);

    const loadProducts = async () => {
        setIsLoading(true);
        if (Capacitor.isNativePlatform()) {
            await iapService.initialize();
            const prods = await iapService.getProducts();
            setProducts(prods);
        } else {
            // Mock products for Web
            setProducts([
                { identifier: IAP_PRODUCT_IDS.AD_FREE, title: "Ad-Free Pro", description: "Remove all banners and interstitials.", price: 4.99, priceString: "$4.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.STARTER_PACK, title: "Founder's Starter Pack", description: "Get $5,000,000 instantly to kickstart your journey.", price: 1.99, priceString: "$1.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.CAFFEINE_DRIP, title: "Caffeine IV Drip", description: "+100 Max Focus Hours permanently.", price: 9.99, priceString: "$9.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TITAN_INDUSTRY, title: "Titan of Industry", description: "$100M Corporate Cash + 50% off M&A and Fundraising.", price: 19.99, priceString: "$19.99", currencyCode: "USD" } as Product
            ]);
        }
        setIsLoading(false);
    };

    const handlePurchase = async (productId: string) => {
        const success = await iapService.purchaseProduct(productId);
        if (success) {
            setStartup((prev: Startup) => {
                const next = { ...prev };
                if (!next.metrics) return next;

                switch (productId) {
                    case IAP_PRODUCT_IDS.AD_FREE:
                        next.iap_ad_free = true;
                        import('@/lib/services/adService').then(({ adService }) => adService.setPremium(true));
                        break;
                    case IAP_PRODUCT_IDS.STARTER_PACK:
                        next.metrics.cash += 5_000_000;
                        next.employees = next.employees.map(e => ({
                            ...e,
                            morale: Math.min(100, e.morale + 10)
                        }));
                        next.metrics.founder_burnout = Math.max(0, next.metrics.founder_burnout - 100);
                        break;
                    case IAP_PRODUCT_IDS.CAFFEINE_DRIP:
                        next.iap_caffeine = true;
                        break;
                    case IAP_PRODUCT_IDS.TITAN_INDUSTRY:
                        next.iap_titan = true;
                        next.iap_ad_free = true; // Titan includes Ad-Free!
                        next.metrics.cash += 100_000_000;
                        import('@/lib/services/adService').then(({ adService }) => adService.setPremium(true));
                        break;
                }
                return next;
            });
        }
    };

    const handleRestore = async () => {
        const restoredIds = await iapService.restorePurchases();
        if (restoredIds.length > 0) {
            setStartup((prev: Startup) => {
                const next = { ...prev };
                if (restoredIds.includes(IAP_PRODUCT_IDS.AD_FREE)) next.iap_ad_free = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.CAFFEINE_DRIP)) next.iap_caffeine = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.TITAN_INDUSTRY)) {
                    next.iap_titan = true;
                    next.iap_ad_free = true; // Titan includes Ad-Free!
                }
                return next;
            });
        }
    };

    if (!open) return null;

    const adFreeOwned = startup.iap_ad_free || localStorage.getItem("founder_sim_premium") === "true";
    const caffeineOwned = startup.iap_caffeine;
    const titanOwned = startup.iap_titan;

    const getProductUI = (id: string) => {
        const p = products.find(prod => prod.identifier === id);
        return p || { title: "Loading...", priceString: "...", description: "..." };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
                <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-6 text-center text-white relative shrink-0">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-20">
                        ✕
                    </button>
                    <h2 className="text-2xl font-black tracking-tight relative z-10 flex items-center justify-center gap-2">
                        <span>💎</span> Premium Store
                    </h2>
                    <p className="text-amber-100 text-sm font-medium mt-1 relative z-10">Exclusive Founder Upgrades</p>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-4">
                    {/* AD FREE */}
                    <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col gap-3 relative overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <span>🚫</span> {getProductUI(IAP_PRODUCT_IDS.AD_FREE).title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{getProductUI(IAP_PRODUCT_IDS.AD_FREE).description}</p>
                            </div>
                            {adFreeOwned ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.AD_FREE)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95"
                                >
                                    {getProductUI(IAP_PRODUCT_IDS.AD_FREE).priceString}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* STARTER PACK */}
                    <div className="p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                    <span>🚀</span> {getProductUI(IAP_PRODUCT_IDS.STARTER_PACK).title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{getProductUI(IAP_PRODUCT_IDS.STARTER_PACK).description}</p>
                            </div>
                            <button
                                onClick={() => handlePurchase(IAP_PRODUCT_IDS.STARTER_PACK)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0"
                            >
                                {getProductUI(IAP_PRODUCT_IDS.STARTER_PACK).priceString}
                            </button>
                        </div>
                    </div>

                    {/* CAFFEINE DRIP */}
                    <div className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/50 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-indigo-800 dark:text-indigo-400 flex items-center gap-2">
                                    <span>☕</span> {getProductUI(IAP_PRODUCT_IDS.CAFFEINE_DRIP).title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{getProductUI(IAP_PRODUCT_IDS.CAFFEINE_DRIP).description}</p>
                            </div>
                            {caffeineOwned ? (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.CAFFEINE_DRIP)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0"
                                >
                                    {getProductUI(IAP_PRODUCT_IDS.CAFFEINE_DRIP).priceString}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* TITAN OF INDUSTRY */}
                    <div className="p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                    <span>👑</span> {getProductUI(IAP_PRODUCT_IDS.TITAN_INDUSTRY).title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{getProductUI(IAP_PRODUCT_IDS.TITAN_INDUSTRY).description}</p>
                            </div>
                            {titanOwned ? (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.TITAN_INDUSTRY)}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0"
                                >
                                    {getProductUI(IAP_PRODUCT_IDS.TITAN_INDUSTRY).priceString}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
                    <button
                        onClick={handleRestore}
                        className="text-[10px] font-black text-slate-500 uppercase hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        Restore Purchases
                    </button>
                    <p className="text-[9px] text-slate-400 max-w-[200px] text-right">Prices are displayed in your local currency. Thank you for playing!</p>
                </div>
            </motion.div>
        </div>
    );
}
