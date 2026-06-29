import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Startup } from "@/lib/types/database.types";
import { iapService, IAP_PRODUCT_IDS } from "@/lib/services/iapService";
import { toast } from "sonner";
import { Product } from "@capgo/native-purchases";
import { Capacitor } from "@capacitor/core";
import { analyticsService } from "@/lib/services/analyticsService";
import { CANDIDATE_NAMES } from "@/lib/engine/negotiations";
import { playSound } from "@/lib/audio";

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
                { identifier: IAP_PRODUCT_IDS.SV_DARLING, title: "Silicon Valley Darling", description: "Permanent +50% valuation multiplier on all future funding rounds.", price: 9.99, priceString: "$9.99", currencyCode: "USD" } as Product,
                
                // Contextual Mock Products
                { identifier: IAP_PRODUCT_IDS.PR_FIXER, title: "The PR Fixer", description: "Instantly settle lawsuits and restore your CEO Reputation.", price: 0.99, priceString: "$0.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TIKTOK_VIRAL, title: "Viral TikTok Moment", description: "Instantly gain massive traction.", price: 1.99, priceString: "$1.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.BALI_RETREAT, title: "Corporate Retreat to Bali", description: "Max out team morale to 100%.", price: 1.99, priceString: "$1.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.POACH_10X, title: "Poach 10x Rockstar", description: "Instantly hire a Senior Genius.", price: 2.99, priceString: "$2.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.BRIBE_SENATOR, title: "Bribe a Senator", description: "Force a global Bull Market for 12 months.", price: 4.99, priceString: "$4.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TRAIN_BOUTIQUE, title: "Training Agency (Boutique)", description: "Mass train a small team (+25 perf).", price: 0.99, priceString: "$0.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TRAIN_CORPORATE, title: "Training Agency (Corporate)", description: "Mass train a medium team (+25 perf).", price: 2.99, priceString: "$2.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TRAIN_GLOBAL, title: "Training Agency (Global)", description: "Mass train a large team (+25 perf).", price: 4.99, priceString: "$4.99", currencyCode: "USD" } as Product,
            ]);
        }
        setIsLoading(false);
    };

    const handlePurchase = async (productId: string, metadata?: { role: "engineer"|"marketer"|"sales" }) => {
        const success = await iapService.purchaseProduct(productId);
        
        if (success) {
            playSound("success");
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
                        next.employees = next.employees.map(e => ({ ...e, morale: Math.min(100, e.morale + 10) }));
                        next.metrics.founder_burnout = Math.max(0, next.metrics.founder_burnout - 100);
                        break;
                    case IAP_PRODUCT_IDS.CAFFEINE_DRIP:
                        next.iap_caffeine = true;
                        break;
                    case IAP_PRODUCT_IDS.TITAN_INDUSTRY:
                        next.iap_titan = true;
                        next.iap_ad_free = true;
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
                    case IAP_PRODUCT_IDS.GOV_CONTRACT: {
                        const addedUsers = Math.max(1, Math.floor(1000000 / 12 / (next.metrics.pricing || 10)));
                        next.metrics.cash += 1000000;
                        next.metrics.users += addedUsers;
                        next.metrics.paid_users = (next.metrics.paid_users || 0) + addedUsers;
                        next.valuation = (next.valuation || 500000) + 1000000 * 10; 
                        break;
                    }
                    case IAP_PRODUCT_IDS.SV_DARLING:
                        if (!prev.iap_sv_darling) {
                            next.valuation = Math.floor((next.valuation || 500000) * 1.5);
                        }
                        next.iap_sv_darling = true;
                        break;
                    
                    // New Contextual IAPs
                    case IAP_PRODUCT_IDS.TIKTOK_VIRAL: {
                        const viralUsers = (next as any).gtm_motion === "SLG" ? 250 : 50000;
                        next.metrics.brand_awareness = Math.min(100, (next.metrics.brand_awareness || 0) + 50);
                        next.metrics.users = (next.metrics.users || 0) + viralUsers;
                        break;
                    }
                    case IAP_PRODUCT_IDS.BRIBE_SENATOR:
                        next.metrics.current_season = 'Bull Market';
                        const currentMonth = (startup.history?.length || 0) + 1;
                        next.metrics.season_locked_until = currentMonth + 12;
                        break;
                    case IAP_PRODUCT_IDS.PR_FIXER:
                        (next.metrics as any).board_anger = 0;
                        next.active_lawsuits = [];
                        if (setFounder) {
                            setFounder((prevF: any) => {
                                const nf = { ...prevF };
                                nf.attributes.reputation = Math.max(nf.attributes.reputation || 0, 50);
                                return nf;
                            });
                        }
                        break;
                    case IAP_PRODUCT_IDS.POACH_10X: {
                        const role = metadata?.role || "engineer";
                        const newEmployee = {
                            id: `emp_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
                            name: CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)],
                            role: role,
                            level: "Senior",
                            salary: role === "engineer" ? 15000 : 12000,
                            equity: 0,
                            performance: 100,
                            morale: 100,
                            isCXO: false,
                            traits: ["Genius", "loyalist"],
                            skills: {
                                technical: role === "engineer" ? 100 : 50,
                                marketing: role === "marketer" ? 100 : 50,
                                sales: role === "sales" ? 100 : 50,
                            },
                            joined_at: Date.now()
                        };
                        next.employees = [...(next.employees || []), newEmployee as any];
                        break;
                    }
                    case IAP_PRODUCT_IDS.BALI_RETREAT:
                        next.metrics.team_morale = 100;
                        next.employees = next.employees.map(e => ({ ...e, morale: 100 }));
                        break;
                    case IAP_PRODUCT_IDS.TRAIN_BOUTIQUE:
                    case IAP_PRODUCT_IDS.TRAIN_CORPORATE:
                    case IAP_PRODUCT_IDS.TRAIN_GLOBAL:
                        next.employees = next.employees.map(e => ({
                            ...e,
                            performance: Math.min(100, e.performance + 25),
                            morale: Math.min(100, (e.morale ?? 70) + 25),
                            skills: {
                                technical: e.role === "engineer" ? Math.min(100, (e.skills?.technical || (e as any).skill || 40) + 15) : (e.skills?.technical || (e as any).skill || 40),
                                marketing: e.role === "marketer" ? Math.min(100, (e.skills?.marketing || (e as any).skill || 40) + 15) : (e.skills?.marketing || (e as any).skill || 40),
                                sales: e.role === "sales" ? Math.min(100, (e.skills?.sales || (e as any).skill || 40) + 15) : (e.skills?.sales || (e as any).skill || 40),
                                legal: e.role === "legal" ? Math.min(100, (e.skills?.legal || (e as any).skill || 40) + 15) : (e.skills?.legal || (e as any).skill || 40),
                            }
                        }));
                        break;
                }
                return next;
            });
        }
    };

    const handleRestore = async () => {
        const restoredIds = await iapService.restorePurchases();
        // ... omitted restore logic for brevity since it's the same, I'll copy the existing one. Wait I need to actually implement it.
        if (restoredIds.length > 0) {
            setStartup((prev: Startup) => {
                const next = { ...prev };
                if (restoredIds.includes(IAP_PRODUCT_IDS.AD_FREE)) next.iap_ad_free = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.CAFFEINE_DRIP)) next.iap_caffeine = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.GOD_MODE)) next.iap_god_mode = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.SV_DARLING)) next.iap_sv_darling = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.TITAN_INDUSTRY)) {
                    next.iap_titan = true;
                    next.iap_ad_free = true;
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
        return res;
    };

    // Calculate dynamic training agency product
    const empCount = (startup.employees || []).length;
    const trainingProductId = empCount <= 20 
        ? IAP_PRODUCT_IDS.TRAIN_BOUTIQUE 
        : empCount <= 100 
            ? IAP_PRODUCT_IDS.TRAIN_CORPORATE 
            : IAP_PRODUCT_IDS.TRAIN_GLOBAL;
    const trainingProductUI = getProductUI(trainingProductId);

    const ItemCard = ({ id, icon, descriptionOverride, owned, overrideBuyAction }: { id: string, icon: string, descriptionOverride?: string, owned?: boolean, overrideBuyAction?: React.ReactNode }) => {
        const ui = getProductUI(id);
        return (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div className="pr-4">
                        <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{icon}</span> {ui.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {ui.description}
                            {descriptionOverride && <span className="font-bold text-slate-700 dark:text-slate-300 ml-1 block mt-0.5">{descriptionOverride}</span>}
                        </p>
                    </div>
                    {owned ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[0.625rem] font-black uppercase shrink-0">Owned</span>
                    ) : overrideBuyAction ? (
                        overrideBuyAction
                    ) : (
                        <button
                            onClick={() => handlePurchase(id)}
                            disabled={isLoading || ui.priceString === "..."}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-xs font-black uppercase shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            {ui.priceString}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header Sticky */}
            <div className="bg-slate-900 dark:bg-black px-6 pt-[calc(env(safe-area-inset-top,40px)+2rem)] pb-8 text-center text-white relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-rose-500/20 opacity-50"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                
                <div className="max-w-4xl mx-auto relative z-10 flex justify-between items-center">
                    <div className="flex flex-col items-start">
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                            <span>💎</span> Premium Store
                        </h2>
                        <p className="text-slate-300 text-sm font-medium mt-1">Exclusive Founder Upgrades & Capital Injections</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                        <span className="text-xl font-bold">✕</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-8 relative">
                <div className="max-w-4xl mx-auto space-y-10">
                    
                    {/* SECTION: PERMANENT UPGRADES */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            ✨ Permanent Upgrades
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ItemCard id={IAP_PRODUCT_IDS.AD_FREE} icon="🚫" owned={adFreeOwned} descriptionOverride="(Permanently removes all banner and interstitial ads)" />
                            <ItemCard id={IAP_PRODUCT_IDS.CAFFEINE_DRIP} icon="☕" owned={caffeineOwned} descriptionOverride="(Permanently +100 Max Focus Hours)" />
                            <ItemCard id={IAP_PRODUCT_IDS.TITAN_INDUSTRY} icon="👑" owned={titanOwned} descriptionOverride="(+$100M Cash, Ad-Free Pro, huge M&A discounts)" />
                            <ItemCard id={IAP_PRODUCT_IDS.SV_DARLING} icon="🦄" owned={svDarlingOwned} descriptionOverride="(1.5x Valuation on all future Term Sheets)" />
                            <ItemCard id={IAP_PRODUCT_IDS.GOD_MODE} icon="🔥" owned={godModeOwned} descriptionOverride="(All Attributes 99, Fully Unlocked Skill Web)" />
                        </div>
                    </section>

                    {/* SECTION: EMERGENCY CAPITAL */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            💰 Emergency Fixes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ItemCard id={IAP_PRODUCT_IDS.STARTER_PACK} icon="🚀" descriptionOverride="(+$5M Cash, -100 Burnout, +10 Morale)" />
                            <ItemCard id={IAP_PRODUCT_IDS.GOV_CONTRACT} icon="🏛️" descriptionOverride="(+$1M Cash, +$1M ARR instantly)" />
                            <ItemCard id={IAP_PRODUCT_IDS.PR_FIXER} icon="🎭" descriptionOverride="(Crisis averted! Drops lawsuits, restores CEO Reputation)" />
                            <ItemCard id={IAP_PRODUCT_IDS.BRIBE_SENATOR} icon="💼" descriptionOverride="(Forces a Bull Market for the next 12 months)" />
                        </div>
                    </section>

                    {/* SECTION: HIRING & TEAM */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            👥 Hiring & Team
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Poach 10x Rockstar Custom Layout */}
                            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>🌟</span> Poach a 10x Rockstar
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Instantly hire a Senior Genius with 0% Equity requirement. They will never resign.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {["engineer", "marketer", "sales"].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handlePurchase(IAP_PRODUCT_IDS.POACH_10X, { role: role as any })}
                                            disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.POACH_10X).priceString === "..."}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[0.625rem] font-black uppercase shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                        >
                                            <span>Hire {role}</span>
                                            <span className="opacity-80 text-[0.5rem]">{getProductUI(IAP_PRODUCT_IDS.POACH_10X).priceString}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ItemCard id={IAP_PRODUCT_IDS.BALI_RETREAT} icon="🏝️" descriptionOverride="(Instantly sets team morale to 100%)" />
                                
                                {empCount === 0 ? (
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm flex flex-col gap-2">
                                        <h3 className="font-black text-slate-400 dark:text-slate-600 flex items-center gap-2">🎓 Training Agency</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-600">Hire at least one employee before using the Training Agency.</p>
                                    </div>
                                ) : (
                                    <ItemCard 
                                        id={trainingProductId} 
                                        icon="🎓" 
                                        descriptionOverride={`(Dynamic pricing based on your team size: ${empCount} employees)`} 
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SECTION: GROWTH */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            📈 Growth
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ItemCard 
                                id={IAP_PRODUCT_IDS.TIKTOK_VIRAL} 
                                icon="📱" 
                                descriptionOverride={`(+50% Brand Awareness & ${(startup as any).gtm_motion === 'SLG' ? '250 Enterprise Leads' : '50,000 Active Users'})`} 
                            />
                        </div>
                    </section>

                </div>
                
                <div className="max-w-4xl mx-auto mt-12 mb-8 text-center flex flex-col items-center border-t border-slate-200 dark:border-slate-800 pt-6">
                    <button
                        onClick={handleRestore}
                        className="text-xs font-black text-slate-500 uppercase hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        Restore Purchases
                    </button>
                    <p className="text-[0.625rem] text-slate-400 mt-2">Prices are displayed in your local currency. Thank you for playing Founder Sim!</p>
                </div>
            </div>
        </div>
    );
}
