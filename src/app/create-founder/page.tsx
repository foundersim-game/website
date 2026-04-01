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
import { playSound, playSynthSound } from "@/lib/audio";

// ─── Data ──────────────────────────────────────────────────────────────────────

const BACKGROUNDS = [
    { id: "Engineer", label: "Engineer", icon: Cpu, desc: "+15 Tech · -5 Network", color: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10", textColor: "text-blue-700 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { id: "MBA", label: "MBA / Business", icon: Briefcase, desc: "+15 Network · -5 Tech", color: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10", textColor: "text-indigo-700 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { id: "Designer", label: "Designer", icon: PenTool, desc: "+10 Marketing · +5 Tech", color: "border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10", textColor: "text-pink-700 dark:text-pink-400", iconBg: "bg-pink-100 dark:bg-pink-900/30" },
    { id: "Serial Founder", label: "Serial Founder", icon: Sparkles, desc: "+10 Rep · -5 Stress", color: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10", textColor: "text-amber-700 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
    { id: "Hustler", label: "Sales Hustler", icon: ShoppingBag, desc: "+15 Network · -5 Intel", color: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10", textColor: "text-emerald-700 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { id: "Finance", label: "Finance / VC", icon: TrendingUp, desc: "+10 Fundraising · +5 Net", color: "border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10", textColor: "text-violet-700 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-900/30" },
];

const INDUSTRIES = [
    { id: "SaaS Platform", label: "SaaS Platform", emoji: "☁️", diff: "Medium", capital: "Low", desc: "Subscription software solving B2B or B2C pain",
      detail: { what: "Web/mobile software product solving a recurring pain point.", who: "PLG: SMBs & professionals. SLG: mid-large companies.", revenue: "Subscriptions — small payers (PLG) or large contracts (SLG).", cogs: "Low (15%) — Standard hosting & support costs.", opex: "Balanced — Engineering & marketing drive burn.", growth: "PLG: free trials & virality. SLG: outbound demos.", risk: "PLG: churn risk. SLG: long sales cycles." } },
    { id: "AI Platform", label: "AI Platform", emoji: "🤖", diff: "Hard", capital: "High", desc: "Machine learning APIs, copilots, or AI-native tools",
      detail: { what: "AI models or tools automating knowledge work.", who: "PLG: developers. SLG: enterprise CIOs.", revenue: "PLG: usage billing. SLG: fixed enterprise contracts.", cogs: "High (35%) — Heavy GPU compute levels eat margins.", opex: "Technical-Heavy — Model R&D & engineering.", growth: "PLG: dev community. SLG: enterprise sales.", risk: "PLG: high direct cost rate. SLG: long procurement." } },
    { id: "OTT / Streaming", label: "OTT / Streaming", emoji: "📺", diff: "Hard", capital: "Very High", desc: "Video streaming or content subscription platform",
      detail: { what: "Content streaming platform or media delivery infrastructure.", who: "PLG: individual subscribers. SLG: platforms buying licenses.", revenue: "PLG: user subs. SLG: content licensing deals.", cogs: "Medium (15%) — CDN bandwidth fees.", opex: "Heavy — Massive upfront content investment.", growth: "PLG: viral content. SLG: B2B partnerships.", risk: "PLG: massive content spend. SLG: capped upside." } },
    { id: "Mobile Game", label: "Mobile Game", emoji: "🎮", diff: "Medium", capital: "Medium", desc: "F2P mobile game with in-app purchases & ads",
      detail: { what: "Mobile game monetized through IAPs and ads.", who: "PLG: casual gamers. SLG: studios licensing your engine.", revenue: "PLG: ad revenue + 3% whale IAPs. SLG: engine licensing fees.", cogs: "Very Low (5%) — Low server overhead per player.", opex: "Creative-Heavy — Design, art, and ad spend.", growth: "PLG: app store, viral loops. SLG: brand deals.", risk: "PLG: hits-driven. SLG: royalties cut margin." } },
    { id: "FinTech", label: "FinTech App", emoji: "💳", diff: "Hard", capital: "High", desc: "Payments, banking, or investment platform",
      detail: { what: "Financial tooling — payments or infrastructure.", who: "PLG: consumers & freelancers. SLG: B2B platforms.", revenue: "PLG: interchange fees. SLG: monthly infra sub.", cogs: "Medium (20%) — Payment rail Interchange fees.", opex: "Heavy — Regulatory compliance & fraud audits.", growth: "PLG: referral bonuses. SLG: B2B integrations.", risk: "PLG: low margins. SLG: long legal reviews." } },
    { id: "EdTech", label: "EdTech Platform", emoji: "📚", diff: "Medium", capital: "Low", desc: "Online learning, tutoring, or skill development",
      detail: { what: "Online learning platform for courses or tutoring.", who: "PLG: individual learners. SLG: schools & HR deps.", revenue: "PLG: course sales. SLG: per-seat annual contracts.", cogs: "Low (15%) — Course hosting & bandwidth.", opex: "Ops-Heavy — Instructor payouts, content SEO.", growth: "PLG: SEO & organic previews. SLG: institutional teams.", risk: "PLG: high CAC. SLG: slow procurement." } },
    { id: "Dev Tools", label: "Developer Tools", emoji: "⚡", diff: "Hard", capital: "Low", desc: "Infrastructure, APIs, or SDKs for developers",
      detail: { what: "Tools helping devs write, ship, or monitor software.", who: "PLG: individual devs. SLG: enterprise engineering orgs.", revenue: "PLG: hosting sub. SLG: enterprise contracts.", cogs: "Low (15%) — Managed cloud server overhead.", opex: "Tech-Heavy — Product depth is the biggest cost.", growth: "PLG: GitHub, Hacker News. SLG: outbound sales.", risk: "PLG: hard to monetize free users. SLG: stalled roadmap." } },
    { id: "Marketplace", label: "Marketplace", emoji: "🌐", diff: "Medium", capital: "Medium", desc: "Two-sided marketplace connecting buyers and sellers",
      detail: { what: "Platform connecting service providers with buyers.", who: "PLG: organic buyers/sellers. SLG: verified vendors.", revenue: "PLG: take-rate % on GMV. SLG: monthly suppliers fee.", cogs: "Low (15%) — Transaction & verification costs.", opex: "Ops-Heavy — Support & manual vendor vetting.", growth: "PLG: SEO, Supply growth. SLG: direct onboarding.", risk: "PLG: cold-start gap. SLG: ops heavy." } },
];

/*
### Universal Font Synchronization
- **Global Font**: Replaced `Geist` with `Inter` as the root font for the entire application. This ensures that the Home screen, Load Game modal, and Setup Wizard all share the same typography as the in-game dashboard.
- **Removed Overrides**: Cleaned up the `Dashboard` component by removing hardcoded font styles, allowing it to inherit the new global `Inter` style natively.
- **Aesthetic Refinement**: All screens now use the premium, tech-focused aesthetic previously only seen inside the game.
*/
const INDUSTRY_STRATEGIES: Record<string, { id: string; label: string; icon: any; sub: string; desc: string; pros: string[]; cons: string[] }[]> = {
    "SaaS Platform": [
        { id: "PLG", label: "Self-Serve SaaS", icon: Sparkles, sub: "Strategic direction for your mission", desc: "Freemium → viral loops → self-serve upgrades. Your product is your sales channel.", pros: ["Fast early traction", "Low CAC", "Viral potential"], cons: ["Need excellent UX", "Slower enterprise deals"] },
        { id: "SLG", label: "Enterprise SaaS", icon: Building2, sub: "Strategic direction for your mission", desc: "Outbound demos → complex contracts → high ACV deals.", pros: ["High revenue per customer", "Predictable pipeline", "Stronger retention"], cons: ["Long sales cycles", "Needs sales team early"] },
    ],
    "AI Platform": [
        { id: "PLG", label: "Self-Serve API Model", icon: Sparkles, sub: "Strategic direction for your mission", desc: "Simple API access for developers to build on your models. Pay-as-you-go.", pros: ["Massive throughput", "Low touch sales", "Network of apps"], cons: ["High infra cost", "Easy for users to switch"] },
        { id: "SLG", label: "Enterprise AI Solutions", icon: Building2, sub: "Strategic direction for your mission", desc: "Custom fine-tuned models and on-prem deployments for big corporations.", pros: ["Huge deal sizes", "Proprietary moat", "Stickier Integration"], cons: ["Manual setup needed", "Slow deployment cycle"] },
    ],
    "OTT / Streaming": [
        { id: "PLG", label: "Direct-to-Consumer", icon: User, sub: "Strategic direction for your mission", desc: "Broad library access for monthly subscribers. Focus on churn and content loops.", pros: ["Compound revenue", "Direct user data", "Brand loyalty"], cons: ["Massive content spend", "High churn risk"] },
        { id: "SLG", label: "Content Licensing", icon: Building2, sub: "Strategic direction for your mission", desc: "Selling content rights to other platforms and distributors.", pros: ["Large upfront cash", "Fixed revenue", "Lower marketing cost"], cons: ["Capped upside", "Less brand ownership"] },
    ],
    "Mobile Game": [
        { id: "PLG", label: "F2P Viral Growth", icon: Sparkles, sub: "Strategic direction for your mission", desc: "Free-to-play with aggressive ad-mediation and IAP hooks.", pros: ["Massive scale", "High ad revenue", "Social loops"], cons: ["Unpredictable hits", "Short lifecycle"] },
        { id: "SLG", label: "Branded / IP Games", icon: Trophy, sub: "Strategic direction for your mission", desc: "Working with movie studios or brands to build high-quality licensed games.", pros: ["Guaranteed audience", "Brand funding", "Higher LTV"], cons: ["Royalties eat margin", "Limited creative freedom"] },
    ],
    "FinTech": [
        { id: "PLG", label: "Consumer Neo-bank", icon: User, sub: "Strategic direction for your mission", desc: "Elegant mobile banking for Gen-Z and digital nomads.", pros: ["Strong brand affinity", "High daily usage", "Word-of-mouth"], cons: ["Low margins", "Heavy regulatory cost"] },
        { id: "SLG", label: "B2B Infrastructure", icon: Building2, sub: "Strategic direction for your mission", desc: "Embedded finance APIs and payment rails for other companies.", pros: ["High transaction vol", "Deep moats", "B2B stickiness"], cons: ["Long legal reviews", "Invisible brand"] },
    ],
    "EdTech": [
        { id: "PLG", label: "Direct-to-Learner", icon: Sparkles, sub: "Strategic direction for your mission", desc: "Self-paced courses and community-led learning for individuals.", pros: ["Fast go-to-market", "Organic growth", "Flexible content"], cons: ["High CAC", "Lower completion rates"] },
        { id: "SLG", label: "Institutional Sales", icon: Building2, sub: "Strategic direction for your mission", desc: "Selling whole-school or corporate-training licenses.", pros: ["Stable contracts", "High seat count", "Budget predictability"], cons: ["Slow procurement", "Top-down friction"] },
    ],
    "Dev Tools": [
        { id: "PLG", label: "Open Source Core", icon: Sparkles, sub: "Strategic direction for your mission", desc: "Free oss tool that developers love, charging for hosting/cloud.", pros: ["Developer love", "Community support", "Organic adoption"], cons: ["Hard to monetize", "Support overhead"] },
        { id: "SLG", label: "Enterprise Cloud", icon: Building2, sub: "Strategic direction for your mission", desc: "Managed deployments with security, SSO, and compliance for huge teams.", pros: ["Big ticket deals", "Compliance moat", "SSO/SAML uplift"], cons: ["Complex dev cycles", "Sales-led roadmap"] },
    ],
    "Marketplace": [
        { id: "PLG", label: "Community Growth", icon: User, sub: "Strategic direction for your mission", desc: "Niche marketplace growing through user reviews and social trust.", pros: ["Organic liquidity", "Low supply cost", "Brand defensibility"], cons: ["Slow start", "Hard to moderate"] },
        { id: "SLG", label: "Managed Supply", icon: Building2, sub: "Strategic direction for your mission", desc: "Vetting and managing supply directly to guarantee high-quality service.", pros: ["High unit margins", "Quality control", "Premium pricing"], cons: ["Operations heavy", "Scaling friction"] },
    ],
};

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

const TOTAL_STEPS = 6;

export default function CreateFounder() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [legacyData, setLegacyData] = useState<LegacyData | null>(null);
    const [showPerksModal, setShowPerksModal] = useState(false);
    const [unlockedThisRun, setUnlockedThisRun] = useState<string[]>([]);

    // Load legacy data on mount
    useEffect(() => {
        adService.hideBanner();
        setLegacyData(getLegacyData());
    }, []);

    const [formData, setFormData] = useState({
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
        setStep(s => Math.max(s - 1, 1));
    };

    const canAdvance = () => {
        if (step === 1) return formData.name.trim().length > 0;
        if (step === TOTAL_STEPS) return formData.startupName.trim().length > 0;
        return true;
    };

    const handleLaunch = () => {
        playSound("click");
        playSynthSound("ui_launch");
        localStorage.setItem("founder_data", JSON.stringify({ ...formData, perks: unlockedThisRun }));
        router.replace("/dashboard");
    };
    const progress = (step / TOTAL_STEPS) * 100;

    const STEP_LABELS = ["Founder", "Background", "Mission", "Strategy", "Challenge", "Vision"];

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
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}</span>
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
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic drop-shadow-sm">
                                {step === 1 && "The Founder"}
                                {step === 2 && "The Path"}
                                {step === 3 && "The Mission"}
                                {step === 4 && "The Strategy"}
                                {step === 5 && "The Challenge"}
                                {step === 6 && "The Vision"}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                                {step === 1 && "Who are you building for?"}
                                {step === 2 && "Your professional background shapes your starting stats."}
                                {step === 3 && "Which market will you disrupt?"}
                                {step === 4 && "How will you acquire your first customers?"}
                                {step === 5 && "Choose your starting market conditions and difficulty."}
                                {step === 6 && "Name your startup, pick your brand."}
                            </p>
                        </div>

                        {/* STEP 1: Identity */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Your Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="e.g. Priya Mehta"
                                            className="w-full h-14 pl-11 pr-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-white text-base font-black italic text-slate-900 placeholder:text-slate-300 transition-colors"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Age</label>
                                    <input
                                        type="number"
                                        min="18" max="65"
                                        className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-white text-base font-black italic text-slate-900 transition-colors"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 mt-2">
                                    <p className="text-xs font-black italic text-indigo-700">👋 Welcome to FounderSim</p>
                                    <p className="text-[11px] text-indigo-600/80 mt-1 leading-relaxed">Build a realistic startup from nothing. Every decision has real consequences — hiring, fundraising, personal life, and market forces all affect your journey.</p>
                                </div>

                                {legacyData && (
                                    <button
                                        onClick={() => { playSound("click"); setShowPerksModal(true); }}
                                        className="w-full h-14 rounded-2xl bg-amber-50 text-amber-700 font-bold text-sm uppercase tracking-widest border-2 border-amber-200 hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        <Trophy className="size-4 fill-amber-500" />
                                        Spend Legacy XP ({legacyData.unspentPoints} Available)
                                    </button>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Background */}
                        {step === 2 && (
                            <div className="space-y-2.5">
                                {BACKGROUNDS.map(bg => (
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
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{bg.desc}</p>
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

                        {/* STEP 3: Industry */}
                        {step === 3 && (
                            <div className="space-y-2.5">
                                {INDUSTRIES.map(ind => (
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
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 leading-relaxed">{ind.desc}</p>
                                                <div className="flex gap-2 mt-1.5">
                                                    <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase transition-colors", ind.diff === "Hard" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30")}>
                                                        {ind.diff} Difficulty
                                                    </span>
                                                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">{ind.capital} Capital</span>
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
                                                <p className="text-[8px] font-black text-indigo-200 dark:text-indigo-400 uppercase tracking-widest mb-2">📋 What You're Building</p>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">🏗️</span><p className="text-[10px] text-white dark:text-indigo-50 font-semibold leading-tight">{(ind as any).detail.what}</p></div>
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">👤</span><p className="text-[10px] text-indigo-100 dark:text-indigo-200/80 leading-tight">{(ind as any).detail.who}</p></div>
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">💵</span><p className="text-[10px] text-indigo-100 dark:text-indigo-200/80 leading-tight">{(ind as any).detail.revenue}</p></div>
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">💸</span><p className="text-[10px] text-indigo-100 dark:text-indigo-200/80 leading-tight"><span className="text-indigo-300 dark:text-indigo-400 font-black">COGS:</span> {(ind as any).detail.cogs}</p></div>
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">🏢</span><p className="text-[10px] text-indigo-100 dark:text-indigo-200/80 leading-tight"><span className="text-indigo-300 dark:text-indigo-400 font-black">OPEX:</span> {(ind as any).detail.opex}</p></div>
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">🚀</span><p className="text-[10px] text-indigo-100 dark:text-indigo-200/80 leading-tight">{(ind as any).detail.growth}</p></div>
                                                    <div className="flex gap-2"><span className="text-[9px] shrink-0">⚠️</span><p className="text-[10px] text-rose-200 dark:text-rose-400 leading-tight">{(ind as any).detail.risk}</p></div>
                                                </div>
                                                <p className="text-[8px] text-indigo-300 dark:text-indigo-500 mt-2.5 text-right font-bold italic">Next → pick your go-to-market strategy</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STEP 4: GTM Motion */}
                        {step === 4 && (
                            <div className="space-y-4">
                                {(INDUSTRY_STRATEGIES[formData.industry] || INDUSTRY_STRATEGIES["SaaS Platform"]).map(gtm => (
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
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight uppercase">{gtm.sub}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{gtm.desc}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">Advantages</p>
                                                {gtm.pros.map(p => <p key={p} className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">✓ {p}</p>)}
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1">Trade-offs</p>
                                                {gtm.cons.map(c => <p key={c} className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">× {c}</p>)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* STEP 5: Scenario */}
                        {step === 5 && (
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
                                                <p className={cn("font-black text-sm uppercase italic transition-colors", formData.scenario === scen.id ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-200")}>{scen.label}</p>
                                                <span className={cn(
                                                    "text-[8px] font-black px-1.5 py-0.5 rounded uppercase shadow-sm",
                                                    scen.difficulty === "Extreme" ? "bg-red-500 text-white" :
                                                        scen.difficulty === "Hard" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                                )}>
                                                    {scen.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{scen.description}</p>
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

                        {/* STEP 6: Vision — Name + Logo + Color */}
                        {step === 6 && (
                            <div className="space-y-6">
                                {/* Startup Name */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Startup Name</label>
                                    <div className="relative">
                                        <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="e.g. Pied Piper"
                                            className="w-full h-14 pl-11 pr-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:outline-none bg-white text-base font-black italic text-slate-900 placeholder:text-slate-300 transition-colors"
                                            value={formData.startupName}
                                            onChange={e => setFormData({ ...formData, startupName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Logo Picker */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Choose Logo</label>
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Brand Color</label>
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
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Preview</p>
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
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">{formData.industry} · {formData.background} · {formData.scenario}</p>
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
                    disabled={step === 1}
                    className="h-14 w-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all shrink-0"
                >
                    <ChevronLeft className="size-5" />
                </button>

                {step < TOTAL_STEPS ? (
                    <button
                        onClick={next}
                        disabled={!canAdvance()}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black uppercase tracking-[0.15em] disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20"
                    >
                        Continue
                        <ChevronRight className="size-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleLaunch}
                        disabled={!canAdvance()}
                        className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black uppercase tracking-[0.15em] disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20"
                    >
                        Launch Startup
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
