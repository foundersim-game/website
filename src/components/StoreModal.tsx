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
    setFounder?: any;
}

export function StoreModal({ open, onClose, startup, setStartup, setFounder }: StoreModalProps) {
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
                { identifier: IAP_PRODUCT_IDS.TITAN_INDUSTRY, title: "Titan of Industry", description: "$100M Corporate Cash + 50% off M&A and Fundraising + Ad-Free play.", price: 19.99, priceString: "$19.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.GOD_MODE, title: "God Mode", description: "Maxes out all founder attributes permanently. 100% success rate on events.", price: 14.99, priceString: "$14.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.GOV_CONTRACT, title: "Government Contract", description: "Instantly injects $1,000,000 in cash and $1M in ARR.", price: 3.99, priceString: "$3.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.SV_DARLING, title: "Silicon Valley Darling", description: "Permanent +50% valuation multiplier on all future funding rounds.", price: 9.99, priceString: "$9.99", currencyCode: "USD" } as Product
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
                    case IAP_PRODUCT_IDS.GOD_MODE:
                        next.iap_god_mode = true;
                        if (setFounder) {
                            setFounder((prevF: any) => {
                                const nf = { ...prevF };
                                if (!nf.attributes) nf.attributes = {};
                                nf.attributes.networking = 99;
                                nf.attributes.marketing_skill = 99;
                                nf.attributes.technical_skill = 99;
                                nf.attributes.leadership = 99;
                                nf.attributes.intelligence = 99;
                                nf.attributes.stress_tolerance = 99;
                                nf.attributes.risk_appetite = 99;
                                nf.attributes.reputation = 99;
                                nf.attributes.sales_skill = 99;

                                // Unlock the entire skill web
                                nf.unlocked_skill_nodes = [
                                    "system_design", "distributed_systems", "code_quality", "security_first",
                                    "growth_hacking", "viral_loops", "brand_strategy", "pr_mastery",
                                    "people_management", "culture_builder", "executive_presence", "board_mastery",
                                    "term_sheet_reader", "valuation_mastery", "lp_relationships"
                                ];
                                return nf;
                            });
                        }
                        break;
                    case IAP_PRODUCT_IDS.GOV_CONTRACT:
                        next.metrics.cash += 1000000;
                        next.metrics.users += Math.max(1, Math.floor(1000000 / 12 / (next.metrics.pricing || 10)));
                        break;
                    case IAP_PRODUCT_IDS.SV_DARLING:
                        next.iap_sv_darling = true;
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
                if (restoredIds.includes(IAP_PRODUCT_IDS.GOD_MODE)) next.iap_god_mode = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.SV_DARLING)) next.iap_sv_darling = true;
                
                // Handle restored consumables (e.g. from promo codes redeemed outside the app)
                const starterPackCount = restoredIds.filter(id => id === IAP_PRODUCT_IDS.STARTER_PACK).length;
                if (starterPackCount > 0 && next.metrics) {
                    next.metrics.cash += 5_000_000 * starterPackCount;
                    next.metrics.founder_burnout = Math.max(0, next.metrics.founder_burnout - (100 * starterPackCount));
                    next.metrics.team_morale = Math.min(100, next.metrics.team_morale + (10 * starterPackCount));
                }
                const govContractCount = restoredIds.filter(id => id === IAP_PRODUCT_IDS.GOV_CONTRACT).length;
                if (govContractCount > 0 && next.metrics) {
                    next.metrics.cash += 1000000 * govContractCount;
                    next.metrics.users += Math.max(1, Math.floor(1000000 / 12 / (next.metrics.pricing || 10))) * govContractCount;
                }

                if (restoredIds.includes(IAP_PRODUCT_IDS.TITAN_INDUSTRY)) {
                    if (!prev.iap_titan && next.metrics) {
                        next.metrics.cash += 100_000_000;
                    }
                    next.iap_titan = true;
                    next.iap_ad_free = true; // Titan includes Ad-Free!
                }
                return next;
            });
        }
    };

    if (!open) return null;

    const adFreeOwned = startup.iap_ad_free || startup.iap_titan || localStorage.getItem("founder_sim_premium") === "true";
    const caffeineOwned = startup.iap_caffeine || localStorage.getItem("founder_sim_caffeine") === "true";
    const titanOwned = startup.iap_titan || localStorage.getItem("founder_sim_titan") === "true";
    const godModeOwned = startup.iap_god_mode || localStorage.getItem("founder_sim_god_mode") === "true";
    const svDarlingOwned = startup.iap_sv_darling || localStorage.getItem("founder_sim_sv_darling") === "true";

    const getProductUI = (id: string) => {
        const p = products.find(prod => prod.identifier === id);
        const res = p ? { ...p } : { title: "Loading...", priceString: "...", description: "..." };
        if (id === IAP_PRODUCT_IDS.STARTER_PACK) {
            res.description = "Inject $5,000,000 capital into your startup";
        }
        return res;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-8 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80svh] mb-[30px]"
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
                                <p className="text-xs text-slate-500 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.AD_FREE).description}
                                    <span className="font-bold text-slate-700 dark:text-slate-300 ml-1 block mt-0.5">(Permanently removes all banner and interstitial ads across the entire game)</span>
                                </p>
                            </div>
                            {adFreeOwned ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.AD_FREE)}
                                    disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.AD_FREE).priceString === "..."}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.STARTER_PACK).description}
                                    <span className="font-bold text-emerald-600 dark:text-emerald-500 ml-1 block mt-0.5">(+$5,000,000 Cash, -100 Burnout, +10 Team Morale. Can be purchased multiple times)</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handlePurchase(IAP_PRODUCT_IDS.STARTER_PACK)}
                                disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.STARTER_PACK).priceString === "..."}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.CAFFEINE_DRIP).description}
                                    <span className="font-bold text-indigo-500 dark:text-indigo-400 ml-1 block mt-0.5">(Permanently increases your maximum monthly Focus Hours by +100)</span>
                                </p>
                            </div>
                            {caffeineOwned ? (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.CAFFEINE_DRIP)}
                                    disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.CAFFEINE_DRIP).priceString === "..."}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.TITAN_INDUSTRY).description}
                                    <span className="font-bold text-amber-600 dark:text-amber-500 ml-1 block mt-0.5">(+$100,000,000 Cash, permanently includes Ad-Free Pro, and unlocks massive M&A discounts)</span>
                                </p>
                            </div>
                            {titanOwned ? (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.TITAN_INDUSTRY)}
                                    disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.TITAN_INDUSTRY).priceString === "..."}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {getProductUI(IAP_PRODUCT_IDS.TITAN_INDUSTRY).priceString}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* GOD MODE */}
                    <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex flex-col gap-3 relative overflow-hidden bg-white dark:bg-slate-900">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-rose-800 dark:text-rose-400 flex items-center gap-2">
                                    <span>🔥</span> {getProductUI(IAP_PRODUCT_IDS.GOD_MODE).title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.GOD_MODE).description}
                                    <span className="font-bold text-rose-600 dark:text-rose-500 ml-1 block mt-0.5">(All Attributes 99, Skill Web Fully Unlocked + Auto-pass all events)</span>
                                </p>
                            </div>
                            {godModeOwned ? (
                                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.GOD_MODE)}
                                    disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.GOD_MODE).priceString === "..."}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {getProductUI(IAP_PRODUCT_IDS.GOD_MODE).priceString}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* GOVERNMENT CONTRACT */}
                    <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 flex flex-col gap-3 relative overflow-hidden bg-white dark:bg-slate-900">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                    <span>🏛️</span> {getProductUI(IAP_PRODUCT_IDS.GOV_CONTRACT).title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.GOV_CONTRACT).description}
                                    <span className="font-bold text-emerald-600 dark:text-emerald-500 ml-1 block mt-0.5">(+$1,000,000 Cash, +$1,000,000 ARR in active users instantly)</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handlePurchase(IAP_PRODUCT_IDS.GOV_CONTRACT)}
                                disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.GOV_CONTRACT).priceString === "..."}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {getProductUI(IAP_PRODUCT_IDS.GOV_CONTRACT).priceString}
                            </button>
                        </div>
                    </div>

                    {/* SILICON VALLEY DARLING */}
                    <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col gap-3 relative overflow-hidden bg-white dark:bg-slate-900">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-indigo-800 dark:text-indigo-400 flex items-center gap-2">
                                    <span>🦄</span> {getProductUI(IAP_PRODUCT_IDS.SV_DARLING).title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {getProductUI(IAP_PRODUCT_IDS.SV_DARLING).description}
                                    <span className="font-bold text-indigo-500 dark:text-indigo-400 ml-1 block mt-0.5">(1.5x Valuation on all future Term Sheets)</span>
                                </p>
                            </div>
                            {svDarlingOwned ? (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">Owned</span>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(IAP_PRODUCT_IDS.SV_DARLING)}
                                    disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.SV_DARLING).priceString === "..."}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {getProductUI(IAP_PRODUCT_IDS.SV_DARLING).priceString}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center gap-2 shrink-0 text-center"
                    style={{ paddingBottom: adFreeOwned ? '1rem' : 'calc(env(safe-area-inset-bottom, 0px) + 60px)' }}
                >
                    <button
                        onClick={handleRestore}
                        className="text-[10px] font-black text-slate-500 uppercase hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        Restore Purchases
                    </button>
                    <p className="text-[9px] text-slate-400 w-full">Prices are displayed in your local currency. Thank you for playing!</p>
                </div>
            </motion.div>
        </div>
    );
}
