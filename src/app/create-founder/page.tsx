"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Rocket, Briefcase, PenTool, Cpu, Sparkles, ShoppingBag, User, TrendingUp, Building2, Megaphone, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { PerkModal } from "@/components/PerkModal";
import { getLegacyData, buyPerk, LegacyData } from "@/lib/engine/legacy";
import { adService } from "@/lib/services/adService";
import { analyticsService } from "@/lib/services/analyticsService";
import { playSound, playSynthSound } from "@/lib/audio";
import { useTranslation } from "react-i18next";

// ─── Data ──────────────────────────────────────────────────────────────────────

const getBackgrounds = (t: any) => [
    { id: "Engineer", label: t("onboarding.bg_eng", { defaultValue: "Engineer" }), icon: Cpu, desc: t("onboarding.bg_eng_desc", { defaultValue: "+25 Tech · -15 Network" }), color: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10", textColor: "text-blue-700 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { id: "MBA", label: t("onboarding.bg_mba", { defaultValue: "MBA / Business" }), icon: Briefcase, desc: t("onboarding.bg_mba_desc", { defaultValue: "+20 Network · -15 Tech" }), color: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10", textColor: "text-indigo-700 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { id: "Designer", label: t("onboarding.bg_des", { defaultValue: "Designer" }), icon: PenTool, desc: t("onboarding.bg_des_desc", { defaultValue: "+15 Marketing · +10 Tech" }), color: "border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10", textColor: "text-pink-700 dark:text-pink-400", iconBg: "bg-pink-100 dark:bg-pink-900/30" },
    { id: "Serial Founder", label: t("onboarding.bg_ser", { defaultValue: "Serial Founder" }), icon: Sparkles, desc: t("onboarding.bg_ser_desc", { defaultValue: "+20 Rep · +10 Stress Tol" }), color: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10", textColor: "text-amber-700 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
    { id: "Hustler", label: t("onboarding.bg_hus", { defaultValue: "Sales Hustler" }), icon: ShoppingBag, desc: t("onboarding.bg_hus_desc", { defaultValue: "+25 Network · -15 Intel" }), color: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10", textColor: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { id: "Finance", label: t("onboarding.bg_fin", { defaultValue: "Finance / VC" }), icon: TrendingUp, desc: t("onboarding.bg_fin_desc", { defaultValue: "+25 Network · +15 Intel" }), color: "border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10", textColor: "text-violet-700 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-900/30" },
];

const getIndustries = (t: any) => [
    {
        id: "SaaS Platform", label: t("howToPlay.industries_saas_name", { defaultValue: "SaaS Platform" }), emoji: "☁️", diff: "Medium", capital: "Low", desc: t("howToPlay.industries_saas_desc", { defaultValue: "Subscription software solving B2B or B2C pain" }),
        detail: { what: t("onboarding.saas_what"), who: t("onboarding.saas_who"), revenue: t("onboarding.saas_rev"), cogs: t("onboarding.saas_cogs"), opex: t("onboarding.saas_opex"), growth: t("onboarding.saas_grow"), risk: t("onboarding.saas_risk") }
    },
    {
        id: "AI Platform", label: t("howToPlay.industries_ai_name", { defaultValue: "AI Platform" }), emoji: "🤖", diff: "Hard", capital: "High", desc: t("howToPlay.industries_ai_desc", { defaultValue: "Machine learning APIs, copilots, or AI-native tools" }),
        detail: { what: t("onboarding.ai_what"), who: t("onboarding.ai_who"), revenue: t("onboarding.ai_rev"), cogs: t("onboarding.ai_cogs"), opex: t("onboarding.ai_opex"), growth: t("onboarding.ai_grow"), risk: t("onboarding.ai_risk") }
    },
    {
        id: "OTT / Streaming", label: t("howToPlay.industries_ott_name", { defaultValue: "OTT / Streaming" }), emoji: "📺", diff: "Hard", capital: "Very High", desc: t("howToPlay.industries_ott_desc", { defaultValue: "Video streaming or content subscription platform" }),
        detail: { what: t("onboarding.ott_what"), who: t("onboarding.ott_who"), revenue: t("onboarding.ott_rev"), cogs: t("onboarding.ott_cogs"), opex: t("onboarding.ott_opex"), growth: t("onboarding.ott_grow"), risk: t("onboarding.ott_risk") }
    },
    {
        id: "Mobile Game", label: t("howToPlay.industries_game_name", { defaultValue: "Mobile Game" }), emoji: "🎮", diff: "Medium", capital: "Medium", desc: t("howToPlay.industries_game_desc", { defaultValue: "F2P mobile game with in-app purchases & ads" }),
        detail: { what: t("onboarding.game_what"), who: t("onboarding.game_who"), revenue: t("onboarding.game_rev"), cogs: t("onboarding.game_cogs"), opex: t("onboarding.game_opex"), growth: t("onboarding.game_grow"), risk: t("onboarding.game_risk") }
    },
    {
        id: "FinTech", label: t("howToPlay.industries_fintech_name", { defaultValue: "FinTech App" }), emoji: "💳", diff: "Hard", capital: "High", desc: t("howToPlay.industries_fintech_desc", { defaultValue: "Payments, banking, or investment platform" }),
        detail: { what: t("onboarding.fintech_what"), who: t("onboarding.fintech_who"), revenue: t("onboarding.fintech_rev"), cogs: t("onboarding.fintech_cogs"), opex: t("onboarding.fintech_opex"), growth: t("onboarding.fintech_grow"), risk: t("onboarding.fintech_risk") }
    },
    {
        id: "EdTech", label: t("howToPlay.industries_edtech_name", { defaultValue: "EdTech Platform" }), emoji: "📚", diff: "Medium", capital: "Low", desc: t("howToPlay.industries_edtech_desc", { defaultValue: "Online learning, tutoring, or skill development" }),
        detail: { what: t("onboarding.edtech_what"), who: t("onboarding.edtech_who"), revenue: t("onboarding.edtech_rev"), cogs: t("onboarding.edtech_cogs"), opex: t("onboarding.edtech_opex"), growth: t("onboarding.edtech_grow"), risk: t("onboarding.edtech_risk") }
    },
    {
        id: "Dev Tools", label: t("howToPlay.industries_devtools_name", { defaultValue: "Developer Tools" }), emoji: "⚡", diff: "Hard", capital: "Low", desc: t("howToPlay.industries_devtools_desc", { defaultValue: "Infrastructure, APIs, or SDKs for developers" }),
        detail: { what: t("onboarding.devtools_what"), who: t("onboarding.devtools_who"), revenue: t("onboarding.devtools_rev"), cogs: t("onboarding.devtools_cogs"), opex: t("onboarding.devtools_opex"), growth: t("onboarding.devtools_grow"), risk: t("onboarding.devtools_risk") }
    },
    {
        id: "Marketplace", label: t("howToPlay.industries_marketplace_name", { defaultValue: "Marketplace" }), emoji: "🌐", diff: "Medium", capital: "Medium", desc: t("howToPlay.industries_marketplace_desc", { defaultValue: "Two-sided marketplace connecting buyers and sellers" }),
        detail: { what: t("onboarding.market_what"), who: t("onboarding.market_who"), revenue: t("onboarding.market_rev"), cogs: t("onboarding.market_cogs"), opex: t("onboarding.market_opex"), growth: t("onboarding.market_grow"), risk: t("onboarding.market_risk") }
    },
];

const getIndustryStrategies = (t: any): Record<string, { id: string; label: string; icon: any; sub: string; desc: string; pros: string[]; cons: string[] }[]> => ({
    "SaaS Platform": [
        { id: "PLG", label: t("howToPlay.ind_saas_viral_title"), icon: Sparkles, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_saas_viral_drivers"), pros: (t("onboarding.saas_plg_pros") as string).split('|'), cons: (t("onboarding.saas_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_saas_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_saas_sales_drivers"), pros: (t("onboarding.saas_slg_pros") as string).split('|'), cons: (t("onboarding.saas_slg_cons") as string).split('|') },
    ],
    "AI Platform": [
        { id: "PLG", label: t("howToPlay.ind_ai_viral_title"), icon: Sparkles, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_ai_viral_drivers"), pros: (t("onboarding.ai_plg_pros") as string).split('|'), cons: (t("onboarding.ai_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_ai_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_ai_sales_drivers"), pros: (t("onboarding.ai_slg_pros") as string).split('|'), cons: (t("onboarding.ai_slg_cons") as string).split('|') },
    ],
    "OTT / Streaming": [
        { id: "PLG", label: t("howToPlay.ind_ott_viral_title"), icon: User, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_ott_viral_drivers"), pros: (t("onboarding.ott_plg_pros") as string).split('|'), cons: (t("onboarding.ott_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_ott_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_ott_sales_drivers"), pros: (t("onboarding.ott_slg_pros") as string).split('|'), cons: (t("onboarding.ott_slg_cons") as string).split('|') },
    ],
    "Mobile Game": [
        { id: "PLG", label: t("howToPlay.ind_game_viral_title"), icon: Sparkles, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_game_viral_drivers"), pros: (t("onboarding.game_plg_pros") as string).split('|'), cons: (t("onboarding.game_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_game_sales_title"), icon: Trophy, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_game_sales_drivers"), pros: (t("onboarding.game_slg_pros") as string).split('|'), cons: (t("onboarding.game_slg_cons") as string).split('|') },
    ],
    "FinTech": [
        { id: "PLG", label: t("howToPlay.ind_fintech_viral_title"), icon: User, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_fintech_viral_drivers"), pros: (t("onboarding.fintech_plg_pros") as string).split('|'), cons: (t("onboarding.fintech_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_fintech_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_fintech_sales_drivers"), pros: (t("onboarding.fintech_slg_pros") as string).split('|'), cons: (t("onboarding.fintech_slg_cons") as string).split('|') },
    ],
    "EdTech": [
        { id: "PLG", label: t("howToPlay.ind_edtech_viral_title"), icon: Sparkles, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_edtech_viral_drivers"), pros: (t("onboarding.edtech_plg_pros") as string).split('|'), cons: (t("onboarding.edtech_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_edtech_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_edtech_sales_drivers"), pros: (t("onboarding.edtech_slg_pros") as string).split('|'), cons: (t("onboarding.edtech_slg_cons") as string).split('|') },
    ],
    "Dev Tools": [
        { id: "PLG", label: t("howToPlay.ind_devtools_viral_title"), icon: Sparkles, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_devtools_viral_drivers"), pros: (t("onboarding.devtools_plg_pros") as string).split('|'), cons: (t("onboarding.devtools_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_devtools_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_devtools_sales_drivers"), pros: (t("onboarding.devtools_slg_pros") as string).split('|'), cons: (t("onboarding.devtools_slg_cons") as string).split('|') },
    ],
    "Marketplace": [
        { id: "PLG", label: t("howToPlay.ind_marketplace_viral_title"), icon: User, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_marketplace_viral_drivers"), pros: (t("onboarding.market_plg_pros") as string).split('|'), cons: (t("onboarding.market_plg_cons") as string).split('|') },
        { id: "SLG", label: t("howToPlay.ind_marketplace_sales_title"), icon: Building2, sub: t("onboarding.gtm_plg_sub"), desc: t("howToPlay.ind_marketplace_sales_drivers"), pros: (t("onboarding.market_slg_pros") as string).split('|'), cons: (t("onboarding.market_slg_cons") as string).split('|') },
    ],
});


const LOGOS = ["🚀", "🤖", "🎮", "📺", "💡", "🦄", "🌐", "⚡"];

const BRAND_COLORS = [
    { id: "#6366f1", label: "Indigo", cls: "bg-indigo-500" },
    { id: "#8b5cf6", label: "Violet", cls: "bg-violet-500" },
    { id: "#f43f5e", label: "Rose", cls: "bg-rose-500" },
    { id: "#f59e0b", label: "Amber", cls: "bg-amber-500" },
    { id: "#14b8a6", label: "Teal", cls: "bg-teal-500" },
    { id: "#0ea5e9", label: "Sky", cls: "bg-sky-500" },
    { id: "#10b981", label: "Emerald", cls: "bg-emerald-500" },
    { id: "#f97316", label: "Orange", cls: "bg-orange-500" },
    { id: "#d946ef", label: "Fuchsia", cls: "bg-fuchsia-500" },
    { id: "#64748b", label: "Slate", cls: "bg-slate-500" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

import { SCENARIOS, ScenarioId, SCENARIOS as SCENARIO_DEFS } from "@/lib/engine/legacy";

const TOTAL_STEPS = 7;

export default function CreateFounder() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState<'fairytale' | 'realistic' | null>(null);
    const { t } = useTranslation();
    const [legacyData, setLegacyData] = useState<LegacyData | null>(null);
    const [showPerksModal, setShowPerksModal] = useState(false);
    const [unlockedThisRun, setUnlockedThisRun] = useState<string[]>([]);

    // Load legacy data on mount
    useEffect(() => {
        adService.hideBanner();
        setLegacyData(getLegacyData());
    }, []);

    const [formData, setFormData] = useState({
        gameMode: "realistic" as "fairytale" | "realistic",
        name: "",
        age: "28",
        background: "Engineer",
        industry: "SaaS Platform",
        gtmMotion: "PLG",
        scenario: "classic" as ScenarioId,
        startupName: "",
        logo: "⚡",
        brandColor: "#6366f1",
        perks: [] as string[],
    });

    const handleBuyPerk = (perkId: string) => {
        if (unlockedThisRun.includes(perkId)) {
            toast.error("Already unlocked for this run!");
            return;
        }
        if (buyPerk(perkId)) {
            setLegacyData(getLegacyData());
            setUnlockedThisRun(prev => [...prev, perkId]);
            toast.success("Perk Unlocked for this run!");
        } else {
            toast.error("Not enough XP.");
        }
    };


    const next = () => {
        playSound("click");
        playSynthSound("ui_step");
        setStep(s => Math.min(s + 1, TOTAL_STEPS));
    };
    const prev = () => {
        playSound("click");
        if (step === 1) {
            router.push("/");
            return;
        }
        setStep(s => Math.max(s - 1, 1));
    };

    const canAdvance = () => {
        if (step === 1) return formData.gameMode !== null;
        if (step === 2) return formData.name.trim().length > 0;
        if (step === TOTAL_STEPS) return formData.startupName.trim().length > 0;
        return true;
    };

    const handleLaunch = () => {
        playSound("click");
        playSynthSound("ui_launch");

        // --- ANALYTICS: Track Industry & Game Start ---
        analyticsService.logEvent("industry_selected", { industry: formData.industry });
        analyticsService.logEvent("game_start", {
            game_mode: formData.gameMode,
            background: formData.background,
            industry: formData.industry,
            gtm_motion: formData.gtmMotion,
            scenario: formData.scenario,
            startup_name: formData.startupName
        });

        const prevStarts = parseInt(localStorage.getItem("founder_sim_games_started") || "0", 10);
        localStorage.setItem("founder_sim_games_started", (prevStarts + 1).toString());

        // Clear previous run state so dashboard initializes fresh
        localStorage.removeItem("founder_sim_state");
        localStorage.removeItem("founder_sim_story_state");
        localStorage.removeItem("founder_sim_achievements");
        localStorage.removeItem("founder_sim_ad_owed");
        
        localStorage.setItem("founder_data", JSON.stringify({ ...formData, perks: unlockedThisRun }));
        localStorage.setItem("founder_sim_game_mode", formData.gameMode);
        router.replace("/dashboard");
    };
    const progress = (step / TOTAL_STEPS) * 100;

    const STEP_LABELS = [
        t("onboarding.step_1_label", { defaultValue: "Reality" }),
        t("onboarding.step_2_label", { defaultValue: "Founder" }),
        t("onboarding.step_3_label", { defaultValue: "Background" }),
        t("onboarding.step_4_label", { defaultValue: "Mission" }),
        t("onboarding.step_5_label", { defaultValue: "Strategy" }),
        t("onboarding.step_6_label", { defaultValue: "Challenge" }),
        t("onboarding.step_7_label", { defaultValue: "Vision" })
    ];

    return (
        <div className="h-[100dvh] bg-white dark:bg-slate-950 flex flex-col overflow-hidden transition-colors duration-300">
            {/* Top Progress Bar */}
            <div className="shrink-0 px-6 pt-8 pb-4 border-b border-slate-50 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <img src="/app-logo.png" alt="Founder Sim" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{t(`onboarding.step_${step}_of_7`, { defaultValue: `Step ${step} of ${TOTAL_STEPS} - ${STEP_LABELS[step - 1]}` })}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>
                {/* Step dots */}
                <div className="flex justify-between mt-2 px-0.5">
                    {STEP_LABELS.map((label, i) => (
                        <div key={i} className={cn("flex flex-col items-center gap-0.5 cursor-pointer", i + 1 <= step ? "opacity-100" : "opacity-30")} onClick={() => i + 1 < step && setStep(i + 1)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full transition-all",
                                i + 1 < step ? "bg-indigo-500" :
                                    i + 1 === step ? "bg-violet-500 ring-4 ring-violet-500/20 dark:ring-violet-500/10" :
                                        "bg-slate-200 dark:bg-slate-700")} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Step header */}
                        <div className="mb-6 mt-2">
                            {step !== 1 && (
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic drop-shadow-sm">
                                    {step > 1 && t(`onboarding.title_${step}`)}
                                </h1>
                            )}
                            {step !== 1 && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                                    {step > 1 && t(`onboarding.desc_${step}`)}
                                </p>
                            )}
                        </div>

                        {/* STEP 1: Game Mode */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-6 px-1">
                                    <span className="text-[0.625rem] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                        {t("onboarding.step_1_of_7", { defaultValue: "Step 1 of 7 - Reality" })}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider italic mb-2">
                                    {t("onboarding.title_reality", { defaultValue: "THE REALITY" })}
                                </h2>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8">
                                    {t("onboarding.desc_reality", { defaultValue: "Choose your difficulty." })}
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => { playSound("click"); setFormData({ ...formData, gameMode: "fairytale" }); }}
                                        className={cn(
                                            "group relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer",
                                            formData.gameMode === "fairytale" 
                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700/50"
                                        )}
                                    >
                                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧚</div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">{t("onboarding.fairytale_mode", { defaultValue: "FAIRYTALE MODE" })}</p>
                                        <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 leading-snug mb-3 px-2">{t("onboarding.fairytale_desc", { defaultValue: "Investors love you, users adore you, and everything works out. Just like the movies." })}</p>
                                        <div className={cn("w-full rounded-xl px-3 py-2 border", formData.gameMode === "fairytale" ? "bg-purple-100 border-purple-200 dark:bg-purple-950/60 dark:border-purple-800/60" : "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50")}>
                                            <p className={cn("text-[0.5625rem] font-bold uppercase tracking-widest leading-snug", formData.gameMode === "fairytale" ? "text-purple-600 dark:text-purple-400" : "text-slate-500")}>{t("onboarding.fairytale_tags", { defaultValue: "CASUAL • FORGIVING • NO LEADERBOARD" })}</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { playSound("click"); setFormData({ ...formData, gameMode: "realistic" }); }}
                                        className={cn(
                                            "group relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer",
                                            formData.gameMode === "realistic" 
                                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" 
                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-700/50"
                                        )}
                                    >
                                        <h3 className="text-[0.6875rem] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                            <span className="text-lg">🔥</span> {t("onboarding.realistic_mode", { defaultValue: "REALISTIC MODE" })}
                                        </h3>
                                        <p className="text-xs font-semibold text-amber-600/80 dark:text-amber-500/80 leading-relaxed max-w-[280px] mx-auto">
                                            {t("onboarding.realistic_desc", { defaultValue: "No safety net. No shortcuts. This is what building actually feels like." })}
                                        </p>
                                        <div className="px-4 py-2 border-t border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/20 w-full mt-4">
                                            <p className="text-[0.5625rem] font-black text-amber-500/80 uppercase tracking-widest">
                                                {t("onboarding.realistic_tags", { defaultValue: "BRUTAL • AUTHENTIC • LEADERBOARD ELIGIBLE" })}
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Identity */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t("onboarding.your_name", { defaultValue: "Your Name" })}</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder={t("onboarding.your_name_placeholder", { defaultValue: "e.g. Priya Mehta" })}
                                            className="w-full h-14 pl-11 pr-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-white text-base font-black italic text-slate-900 placeholder:text-slate-300 transition-colors"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t("onboarding.age", { defaultValue: "Age" })}</label>
                                    <input
                                        type="number"
                                        min="18" max="65"
                                        className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-white text-base font-black italic text-slate-900 transition-colors"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 mt-2">
                                    <p className="text-xs font-black italic text-indigo-700">{t("onboarding.welcome_title", { defaultValue: "👋 Welcome to FounderSim" })}</p>
                                    <p className="text-[0.6875rem] text-indigo-600/80 mt-1 leading-relaxed">{t("onboarding.welcome_desc", { defaultValue: "Build a realistic startup from nothing. Every decision has real consequences — hiring, fundraising, personal life, and market forces all affect your journey." })}</p>
                                </div>

                                {legacyData && (
                                    <button
                                        onClick={() => { playSound("click"); setShowPerksModal(true); }}
                                        className="w-full h-14 rounded-2xl bg-amber-50 text-amber-700 font-bold text-sm uppercase tracking-widest border-2 border-amber-200 hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        <Trophy className="size-4 fill-amber-500" />
                                        {t("onboarding.spend_legacy", { defaultValue: "Spend Legacy XP" })} ({legacyData.unspentPoints} {t("onboarding.available", { defaultValue: "Available" })})
                                    </button>
                                )}
                            </div>
                        )}

                        {/* STEP 3: Background */}
                        {step === 3 && (
                            <div className="space-y-2.5">
                                {getBackgrounds(t).map((bg: any) => (
                                    <button
                                        key={bg.id}
                                        onClick={() => { playSound("click"); setFormData({ ...formData, background: bg.id }); }}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98]",
                                            formData.background === bg.id
                                                ? `${bg.color} border-indigo-500/50 dark:border-indigo-500/50`
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", bg.iconBg)}>
                                            <bg.icon className={cn("size-5", bg.textColor)} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("font-black text-sm uppercase italic", formData.background === bg.id ? bg.textColor : "text-slate-800 dark:text-slate-200 transition-colors")}>{bg.label}</p>
                                            <p className="text-[0.625rem] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{bg.desc}</p>
                                        </div>
                                        {formData.background === bg.id && (
                                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", bg.iconBg)}>
                                                <ChevronRight className={cn("size-3", bg.textColor)} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* STEP 4: Industry */}
                        {step === 4 && (
                            <div className="space-y-2.5">
                                {getIndustries(t).map((ind: any) => (
                                    <div key={ind.id}>
                                        <button
                                            onClick={() => {
                                                playSound("click");
                                                setFormData({ ...formData, industry: ind.id });
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98] shadow-sm",
                                                formData.industry === ind.id
                                                    ? "border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/10"
                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                            )}
                                        >
                                            <span className="text-2xl w-10 text-center shrink-0 drop-shadow-sm">{ind.emoji}</span>
                                            <div className="flex-1">
                                                <p className={cn("font-black text-sm uppercase italic transition-colors", formData.industry === ind.id ? "text-indigo-700 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200")}>{ind.label}</p>
                                                <p className="text-[0.625rem] text-slate-400 dark:text-slate-500 font-medium mt-0.5 leading-relaxed">{ind.desc}</p>
                                                <div className="flex gap-2 mt-1.5">
                                                    <span className={cn("text-[0.5rem] font-black px-2 py-0.5 rounded-full uppercase transition-colors", ind.diff === "Hard" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30")}>
                                                        {ind.diff} Difficulty
                                                    </span>
                                                    <span className="text-[0.5rem] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">{ind.capital} Capital</span>
                                                </div>
                                            </div>
                                            {formData.industry === ind.id && (
                                                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                                    <ChevronRight className="size-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                        {formData.industry === ind.id && (ind as any).detail && (
                                            <div className="mx-1 p-3.5 bg-indigo-600 dark:bg-indigo-900 rounded-b-2xl border-x-2 border-b-2 border-indigo-400 dark:border-indigo-800 -mt-2 pt-5 shadow-inner">
                                                <p className="text-[0.5rem] font-black text-indigo-200 dark:text-indigo-400 uppercase tracking-widest mb-2">{t("onboarding.what_you_building", { defaultValue: "📋 What You're Building" })}</p>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">🏗️</span><p className="text-[0.625rem] text-white dark:text-indigo-50 font-semibold leading-tight">{(ind as any).detail.what}</p></div>
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">👤</span><p className="text-[0.625rem] text-indigo-100 dark:text-indigo-200/80 leading-tight">{(ind as any).detail.who}</p></div>
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">💵</span><p className="text-[0.625rem] text-indigo-100 dark:text-indigo-200/80 leading-tight">{(ind as any).detail.revenue}</p></div>
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">💸</span><p className="text-[0.625rem] text-indigo-100 dark:text-indigo-200/80 leading-tight"><span className="text-indigo-300 dark:text-indigo-400 font-black">COGS:</span> {(ind as any).detail.cogs}</p></div>
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">🏢</span><p className="text-[0.625rem] text-indigo-100 dark:text-indigo-200/80 leading-tight"><span className="text-indigo-300 dark:text-indigo-400 font-black">OPEX:</span> {(ind as any).detail.opex}</p></div>
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">🚀</span><p className="text-[0.625rem] text-indigo-100 dark:text-indigo-200/80 leading-tight">{(ind as any).detail.growth}</p></div>
                                                    <div className="flex gap-2"><span className="text-[0.5625rem] shrink-0">⚠️</span><p className="text-[0.625rem] text-rose-200 dark:text-rose-400 leading-tight">{(ind as any).detail.risk}</p></div>
                                                </div>
                                                <p className="text-[0.5rem] text-indigo-300 dark:text-indigo-500 mt-2.5 text-right font-bold italic">{t("onboarding.next_pick_gtm", { defaultValue: "Next → pick your go-to-market strategy" })}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STEP 5: GTM Motion */}
                        {step === 5 && (
                            <div className="space-y-4">
                                {(getIndustryStrategies(t)[formData.industry] || getIndustryStrategies(t)["SaaS Platform"]).map((gtm: any) => (
                                    <button
                                        key={gtm.id}
                                        onClick={() => { playSound("click"); setFormData({ ...formData, gtmMotion: gtm.id }); }}
                                        className={cn(
                                            "w-full p-5 rounded-2xl border-2 transition-all text-left active:scale-[0.98] shadow-sm",
                                            formData.gtmMotion === gtm.id
                                                ? "border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/10"
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner", formData.gtmMotion === gtm.id ? "bg-indigo-500" : "bg-slate-100 dark:bg-slate-800")}>
                                                <gtm.icon className={cn("size-5", formData.gtmMotion === gtm.id ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                                            </div>
                                            <div>
                                                <p className={cn("font-black text-sm uppercase italic transition-colors", formData.gtmMotion === gtm.id ? "text-indigo-700 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200")}>{gtm.label}</p>
                                                <p className="text-[0.625rem] text-slate-400 dark:text-slate-500 font-medium tracking-tight uppercase">{gtm.sub}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{gtm.desc}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[0.5rem] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">{t("onboarding.advantages", { defaultValue: "Advantages" })}</p>
                                                {gtm.pros.map((p: string) => <p key={p} className="text-[0.625rem] text-slate-500 dark:text-slate-400 leading-tight">✓ {p}</p>)}
                                            </div>
                                            <div>
                                                <p className="text-[0.5rem] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1">{t("onboarding.tradeoffs", { defaultValue: "Trade-offs" })}</p>
                                                {gtm.cons.map((c: string) => <p key={c} className="text-[0.625rem] text-slate-400 dark:text-slate-500 leading-tight">× {c}</p>)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* STEP 6: Scenario */}
                        {step === 6 && (
                            <div className="space-y-3">
                                {Object.values(SCENARIOS).map(scen => (
                                    <button
                                        key={scen.id}
                                        onClick={() => { playSound("click"); setFormData({ ...formData, scenario: scen.id }); }}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98] shadow-sm",
                                            formData.scenario === scen.id
                                                ? "border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10"
                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={cn("font-black text-sm uppercase italic transition-colors", formData.scenario === scen.id ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-200")}>{t(`onboarding.scen_${scen.id}`, { defaultValue: scen.label })}</p>
                                                <span className={cn(
                                                    "text-[0.5rem] font-black px-1.5 py-0.5 rounded uppercase shadow-sm",
                                                    scen.difficulty === "Extreme" ? "bg-red-500 text-white" :
                                                        scen.difficulty === "Hard" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                                )}>
                                                    {scen.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-[0.625rem] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{t(`onboarding.scen_${scen.id}_desc`, { defaultValue: scen.description })}</p>
                                        </div>
                                        {formData.scenario === scen.id && (
                                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                                <ChevronRight className="size-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* STEP 7: Vision — Name + Logo + Color */}
                        {step === 7 && (
                            <div className="space-y-6">
                                {/* Startup Name */}
                                <div>
                                    <label className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t("onboarding.your_startup_name", { defaultValue: "Startup Name" })}</label>
                                    <div className="relative">
                                        <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder={t("onboarding.startup_name_placeholder", { defaultValue: "e.g. Pied Piper" })}
                                            className="w-full h-14 pl-11 pr-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-white text-base font-black italic text-slate-900 placeholder:text-slate-300 transition-colors"
                                            value={formData.startupName}
                                            onChange={e => setFormData({ ...formData, startupName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Logo Picker */}
                                <div>
                                    <label className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400 mb-3 block">{t("onboarding.pick_logo", { defaultValue: "Choose Logo" })}</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {LOGOS.map(logo => (
                                            <button
                                                key={logo}
                                                onClick={() => { playSound("click"); setFormData({ ...formData, logo }); }}
                                                className={cn(
                                                    "aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90 border-2",
                                                    formData.logo === logo ? "border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100" : "border-slate-100 bg-white hover:border-slate-200"
                                                )}
                                            >
                                                {logo}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div>
                                    <label className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400 mb-3 block">{t("onboarding.brand_color", { defaultValue: "Brand Color" })}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {BRAND_COLORS.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => { playSound("click"); setFormData({ ...formData, brandColor: color.id }); }}
                                                className={cn(
                                                    "w-9 h-9 rounded-full transition-all active:scale-90 border-4",
                                                    color.cls,
                                                    formData.brandColor === color.id ? "border-white scale-110 shadow-lg" : "border-transparent"
                                                )}
                                                title={color.label}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Preview Card */}
                                {formData.startupName && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
                                    >
                                        <p className="text-[0.625rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Preview</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border"
                                                style={{
                                                    background: `${formData.brandColor}20`,
                                                    borderColor: `${formData.brandColor}40`
                                                }}
                                            >
                                                {formData.logo}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white transition-colors">{formData.startupName}</p>
                                                <p className="text-[0.625rem] text-slate-400 dark:text-slate-500">{formData.industry} · {formData.background} · {formData.scenario}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="shrink-0 px-6 pb-8 pt-4 border-t border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950 flex gap-3 transition-colors duration-300">
                <button
                    onClick={prev}
                    className="h-14 w-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all shrink-0"
                >
                    <ChevronLeft className="size-5" />
                </button>

                {step < TOTAL_STEPS ? (
                    <button
                        onClick={next}
                        disabled={!canAdvance()}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black uppercase tracking-[0.15em] disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20"
                    >
                        {t("onboarding.btn_continue", { defaultValue: "CONTINUE" })}
                        <ChevronRight className="size-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleLaunch}
                        disabled={!canAdvance()}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black uppercase tracking-[0.15em] disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20"
                    >
                        {t("onboarding.btn_launch", { defaultValue: "LAUNCH STARTUP" })}
                        <Rocket className="size-4" />
                    </button>
                )}
            </div>
            <PerkModal
                open={showPerksModal}
                setOpen={(val) => { playSound("click"); setShowPerksModal(val); }}
                unspent={legacyData?.unspentPoints || 0}
                unlocked={unlockedThisRun}
                onBuy={(id) => { playSound("click"); handleBuyPerk(id); }}
            />
            <Toaster position="top-center" />
        </div>
    );
}
