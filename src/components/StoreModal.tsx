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
import { useTranslation } from "react-i18next";

interface StoreModalProps {
    open: boolean;
    onClose: () => void;
    startup: Startup;
    setStartup: (s: Startup | ((prev: Startup) => Startup)) => void;
    setFounder?: any;
}

export function StoreModal({ open, onClose, startup, setStartup, setFounder }: StoreModalProps) {
    const { t } = useTranslation();
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
                { identifier: IAP_PRODUCT_IDS.AD_FREE, title: t('store.ad_free_title'), description: t('store.ad_free_desc'), price: 4.99, priceString: "$4.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.STARTER_PACK, title: t('store.starter_pack_title'), description: t('store.starter_pack_desc'), price: 1.99, priceString: "$1.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.CAFFEINE_DRIP, title: t('store.caffeine_drip_title'), description: t('store.caffeine_drip_desc'), price: 9.99, priceString: "$9.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TITAN_INDUSTRY, title: t('store.titan_title'), description: t('store.titan_desc'), price: 19.99, priceString: "$19.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.GOD_MODE, title: t('store.god_mode_title'), description: t('store.god_mode_desc'), price: 14.99, priceString: "$14.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.GOV_CONTRACT, title: t('store.gov_contract_title'), description: t('store.gov_contract_desc'), price: 3.99, priceString: "$3.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.SV_DARLING, title: t('store.sv_darling_title'), description: t('store.sv_darling_desc'), price: 9.99, priceString: "$9.99", currencyCode: "USD" } as Product,
                
                // Contextual Mock Products
                { identifier: IAP_PRODUCT_IDS.PR_FIXER, title: t('store.pr_fixer_title'), description: t('store.pr_fixer_desc'), price: 0.99, priceString: "$0.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TIKTOK_VIRAL, title: t('store.tiktok_viral_title'), description: t('store.tiktok_viral_desc'), price: 1.99, priceString: "$1.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.BALI_RETREAT, title: t('store.bali_retreat_title'), description: t('store.bali_retreat_desc'), price: 1.99, priceString: "$1.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.POACH_10X, title: t('store.poach_rockstar'), description: t('store.poach_rockstar_desc'), price: 2.99, priceString: "$2.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.BRIBE_SENATOR, title: t('store.bribe_senator_title'), description: t('store.bribe_senator_desc'), price: 4.99, priceString: "$4.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TRAIN_BOUTIQUE, title: t('store.train_boutique_title'), description: t('store.train_boutique_desc'), price: 0.99, priceString: "$0.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TRAIN_CORPORATE, title: t('store.train_corporate_title'), description: t('store.train_corporate_desc'), price: 2.99, priceString: "$2.99", currencyCode: "USD" } as Product,
                { identifier: IAP_PRODUCT_IDS.TRAIN_GLOBAL, title: t('store.train_global_title'), description: t('store.train_global_desc'), price: 4.99, priceString: "$4.99", currencyCode: "USD" } as Product,
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
                if (!next.metrics) return next;

                if (restoredIds.includes(IAP_PRODUCT_IDS.AD_FREE)) next.iap_ad_free = true;
                if (restoredIds.includes(IAP_PRODUCT_IDS.CAFFEINE_DRIP)) next.iap_caffeine = true;
                
                if (restoredIds.includes(IAP_PRODUCT_IDS.SV_DARLING)) {
                    if (!prev.iap_sv_darling) {
                        next.valuation = Math.floor((next.valuation || 500000) * 1.5);
                    }
                    next.iap_sv_darling = true;
                }
                
                if (restoredIds.includes(IAP_PRODUCT_IDS.TITAN_INDUSTRY)) {
                    if (!prev.iap_titan) {
                        next.metrics.cash += 100_000_000;
                    }
                    next.iap_titan = true;
                    next.iap_ad_free = true;
                }

                if (restoredIds.includes(IAP_PRODUCT_IDS.GOD_MODE)) {
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
                            if (!nf.unlocked_skill_nodes || nf.unlocked_skill_nodes.length < 15) {
                                nf.unlocked_skill_nodes = [
                                    "system_design", "distributed_systems", "code_quality", "security_first",
                                    "growth_hacking", "viral_loops", "brand_strategy", "pr_mastery",
                                    "people_management", "culture_builder", "executive_presence", "board_mastery",
                                    "term_sheet_reader", "valuation_mastery", "lp_relationships"
                                ];
                            }
                            return nf;
                        });
                    }
                }

                // Restore Consumables
                if (restoredIds.includes(IAP_PRODUCT_IDS.STARTER_PACK)) {
                    next.metrics.cash += 5_000_000;
                    next.employees = next.employees.map(e => ({ ...e, morale: Math.min(100, e.morale + 10) }));
                    next.metrics.founder_burnout = Math.max(0, next.metrics.founder_burnout - 100);
                }
                if (restoredIds.includes(IAP_PRODUCT_IDS.GOV_CONTRACT)) {
                    const addedUsers = Math.max(1, Math.floor(1000000 / 12 / (next.metrics.pricing || 10)));
                    next.metrics.cash += 1000000;
                    next.metrics.users += addedUsers;
                    next.metrics.paid_users = (next.metrics.paid_users || 0) + addedUsers;
                    next.valuation = (next.valuation || 500000) + 1000000 * 10; 
                }
                if (restoredIds.includes(IAP_PRODUCT_IDS.PR_FIXER)) {
                    (next.metrics as any).board_anger = 0;
                    next.active_lawsuits = [];
                    if (setFounder) {
                        setFounder((prevF: any) => ({
                            ...prevF,
                            attributes: { ...prevF.attributes, reputation: Math.max(prevF.attributes?.reputation || 0, 50) }
                        }));
                    }
                }
                if (restoredIds.includes(IAP_PRODUCT_IDS.BALI_RETREAT)) {
                    next.metrics.team_morale = 100;
                    next.employees = next.employees.map(e => ({ ...e, morale: 100 }));
                }

                return next;
            });
            toast.success("Purchases Restored!");
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
        
        // Use JSON localized strings if available, falling back to native IAP SDK strings
        const LOCALES: Record<string, { title: string, desc: string }> = {
            [IAP_PRODUCT_IDS.AD_FREE]: { title: 'store.ad_free_title', desc: 'store.ad_free_desc' },
            [IAP_PRODUCT_IDS.CAFFEINE_DRIP]: { title: 'store.caffeine_drip_title', desc: 'store.caffeine_drip_desc' },
            [IAP_PRODUCT_IDS.TITAN_INDUSTRY]: { title: 'store.titan_title', desc: 'store.titan_desc' },
            [IAP_PRODUCT_IDS.GOD_MODE]: { title: 'store.god_mode_title', desc: 'store.god_mode_desc' },
            [IAP_PRODUCT_IDS.SV_DARLING]: { title: 'store.sv_darling_title', desc: 'store.sv_darling_desc' },
            [IAP_PRODUCT_IDS.STARTER_PACK]: { title: 'store.starter_pack_title', desc: 'store.starter_pack_desc' },
            [IAP_PRODUCT_IDS.GOV_CONTRACT]: { title: 'store.gov_contract_title', desc: 'store.gov_contract_desc' },
            [IAP_PRODUCT_IDS.PR_FIXER]: { title: 'store.pr_fixer_title', desc: 'store.pr_fixer_desc' },
            [IAP_PRODUCT_IDS.BRIBE_SENATOR]: { title: 'store.bribe_senator_title', desc: 'store.bribe_senator_desc' },
            [IAP_PRODUCT_IDS.BALI_RETREAT]: { title: 'store.bali_retreat_title', desc: 'store.bali_retreat_desc' },
            [IAP_PRODUCT_IDS.POACH_10X]: { title: 'store.poach_rockstar', desc: 'store.poach_rockstar_desc' },
            [IAP_PRODUCT_IDS.TRAIN_BOUTIQUE]: { title: 'store.training_agency', desc: 'store.training_agency_desc' },
            [IAP_PRODUCT_IDS.TRAIN_CORPORATE]: { title: 'store.training_agency', desc: 'store.training_agency_desc' },
            [IAP_PRODUCT_IDS.TRAIN_GLOBAL]: { title: 'store.training_agency', desc: 'store.training_agency_desc' }
        };

        if (LOCALES[id]) {
            res.title = t(LOCALES[id].title, { defaultValue: res.title });
            res.description = t(LOCALES[id].desc, { 
                count: (startup.employees || []).length, 
                defaultValue: res.description 
            });
        }
        
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
                            <span>💎</span> {t('store.premium_store')}
                        </h2>
                        <p className="text-slate-300 text-sm font-medium mt-1">{t('store.premium_store_desc')}</p>
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
                            {t('store.permanent_upgrades')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ItemCard id={IAP_PRODUCT_IDS.AD_FREE} icon="🚫" owned={adFreeOwned} descriptionOverride={t('store.ad_free_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.CAFFEINE_DRIP} icon="☕" owned={caffeineOwned} descriptionOverride={t('store.caffeine_drip_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.TITAN_INDUSTRY} icon="👑" owned={titanOwned} descriptionOverride={t('store.titan_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.SV_DARLING} icon="🦄" owned={svDarlingOwned} descriptionOverride={t('store.sv_darling_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.GOD_MODE} icon="🔥" owned={godModeOwned} descriptionOverride={t('store.god_mode_override')} />
                        </div>
                    </section>

                    {/* SECTION: EMERGENCY CAPITAL */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            {t('store.emergency_fixes')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ItemCard id={IAP_PRODUCT_IDS.STARTER_PACK} icon="🚀" descriptionOverride={t('store.starter_pack_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.GOV_CONTRACT} icon="🏛️" descriptionOverride={t('store.gov_contract_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.PR_FIXER} icon="🎭" descriptionOverride={t('store.pr_fixer_override')} />
                            <ItemCard id={IAP_PRODUCT_IDS.BRIBE_SENATOR} icon="💼" descriptionOverride={t('store.bribe_senator_override')} />
                        </div>
                    </section>

                    {/* SECTION: HIRING & TEAM */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            {t('store.hiring_team')}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Poach 10x Rockstar Custom Layout */}
                            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>🌟</span> {t('store.poach_rockstar')}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {t('store.poach_rockstar_desc')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-end w-full lg:w-auto">
                                    {["engineer", "marketer", "sales"].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handlePurchase(IAP_PRODUCT_IDS.POACH_10X, { role: role as any })}
                                            disabled={isLoading || getProductUI(IAP_PRODUCT_IDS.POACH_10X).priceString === "..."}
                                            className="flex-1 min-w-[100px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[0.625rem] font-black uppercase shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                        >
                                            <span>{t('store.hire')} {role}</span>
                                            <span className="opacity-80 text-[0.5rem]">{getProductUI(IAP_PRODUCT_IDS.POACH_10X).priceString}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ItemCard id={IAP_PRODUCT_IDS.BALI_RETREAT} icon="🏝️" descriptionOverride={t('store.bali_retreat_override')} />
                                
                                {empCount === 0 ? (
                                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm flex flex-col gap-2">
                                        <h3 className="font-black text-slate-400 dark:text-slate-600 flex items-center gap-2">🎓 {t('store.training_agency')}</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-600">{t('store.training_agency_req')}</p>
                                    </div>
                                ) : (
                                    <ItemCard 
                                        id={trainingProductId} 
                                        icon="🎓" 
                                        descriptionOverride={t('store.training_agency_desc', { count: empCount })} 
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SECTION: GROWTH */}
                    <section>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-1 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                            {t('store.growth')}
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
                        {t("store.restore_purchases", { defaultValue: "RESTORE PURCHASES" })}
                    </button>
                    <p className="text-[0.625rem] text-slate-400 mt-2">{t("store.footer_text", { defaultValue: "Prices are displayed in your local currency. Thank you for playing Founder Sim!" })}</p>
                </div>
            </div>
        </div>
    );
}
