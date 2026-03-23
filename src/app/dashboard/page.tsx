"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { processMonth, StartupAction, evaluateSalaryProposal, getBoardMembers, INDUSTRY_PRICING_CONFIG, PricingConfigNode, getPricingScale } from "@/lib/engine/simulation";
import { getNextFundingStage, getFundingPhase, generateFundingTerms, checkEndgame } from "@/lib/engine/funding";
import { recordExit, SCENARIOS, ScenarioId, getLegacyData } from "@/lib/engine/legacy";
import { generateAcquisitionOffer } from "@/lib/engine/manda";
import { getRandomEvent } from "@/lib/engine/events";
import { generateAIEvent, generateFounderStory } from "@/lib/engine/ai";
import { generateInitialCompetitors, simulateCompetitors, Competitor } from "@/lib/engine/competitors";
import { getEducationalAdvice, getConsultationAdvice, AdviceContent } from "@/lib/engine/mentorship";
import { checkAchievements, Achievement } from "@/lib/engine/achievements";
import { calcDynamicImpact, applyEffectsToState, type ActionUsageLog, type GameContext } from "@/lib/engine/dynamicImpact";
import { getActionDef, getOngoingProgramDef, calcFocusHours, ONGOING_PROGRAMS, IMMEDIATE_ACTIONS } from "@/lib/engine/actions";
import { processOngoingPrograms, startProgram, stopProgram, getStreakMultiplier, ongoingProgramsTotalEnergy, type ActiveProgram } from "@/lib/engine/ongoingPrograms";
import { EventModal, GameEvent, EventChoice, generateImpactSentence } from "@/components/EventModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Founder, Startup, LuxuryAsset, LifestyleToggle } from "@/lib/types/database.types";
import { SaveSlot } from "@/app/page";
import { generateCandidate, calculateHiringSuccess, Candidate, CANDIDATE_NAMES } from "@/lib/engine/negotiations";
import { generateInvestor, negotiateFunding, Investor } from "@/lib/engine/negotiations";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Users, User, GraduationCap, Award, TrendingUp, DollarSign, Briefcase, Menu, Save, RefreshCw, HelpCircle, Trash2, Plus, Check, X, Shield, Info, Rocket, AlertCircle, Percent, ChevronDown, Volume2, VolumeX, Star } from "lucide-react";
import { requestStoreReview, openStoreListing } from "@/lib/os/review";
import { HowToPlayContent } from "@/components/HowToPlay";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { adService, REWARDED_CASH_ID } from "@/lib/services/adService";
import { iapService } from "@/lib/services/iapService";
import { STRATEGY_PLAYBOOK } from "@/lib/engine/strategyPlaybook";
import { playSound, isAudioMuted, toggleAudioMute } from "@/lib/audio";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSaveDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const STAGE_COLORS: Record<string, string> = {
    "Bootstrapping": "bg-slate-100 text-slate-600",
    "Angel Investment": "bg-amber-50 text-amber-700 border-amber-200",
    "Seed Round": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Series A": "bg-blue-50 text-blue-700 border-blue-200",
    "Series B": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Series C": "bg-violet-50 text-violet-700 border-violet-200",
    "IPO Ready": "bg-rose-50 text-rose-700 border-rose-200 shadow-sm",
};

const MAX_SLOTS = 6;





// ─── Base startup state ───────────────────────────────────────────────────────
const STARTUP_BASE = {
    id: "startup-1",
    name: "New Startup",
    industry: "SaaS",
    phase: "Idea Phase",
    funding_stage: "Bootstrapping",
    valuation: 500000,
    pmf_score: 10,
    culture_score: 60,
    capTable: [{ name: "Founder", equity: 100, type: "Founder" }],
    pricing_tier: "starter",
    active_marketing_channel: "organic",
    metrics: {
        users: 0,
        revenue: 0,
        growth_rate: 0,
        burn_rate: 0,
        runway: 99,
        net_profit: 0,
        product_quality: 10,
        technical_debt: 0,
        reliability: 80,
        innovation: 10,
        feature_completion: 0,
        team_morale: 70,
        brand_awareness: 5,
        employees: 0,
        engineers: 0,
        marketers: 0,
        sales: 0,
        cash: 50000,
        pricing: 29,
        unit_sales: 0,
        founder_burnout: 0,
        founder_health: 100,
        sleep_quality: 100,
        founder_salary: 0,
    },
    employees: [],
    history: [],
} as unknown as Startup;

const FOUNDER_BASE = {
    id: "founder-1",
    name: "Alex Founder",
    background: "Engineer",
    attributes: {
        intelligence: 55,
        technical_skill: 60,
        leadership: 40,
        networking: 30,
        marketing_skill: 35,
        reputation: 40,
        risk_appetite: 65,
        stress_tolerance: 70,
    },
    xp: { technical: 0, marketing: 0, leadership: 0, fundraising: 0, total: 0 },
    personal_wealth: 25000,
    assets: [],
    activeToggles: [],
} as unknown as Founder;

// ─── Luxury & Lifestyle Catalog ──────────────────────────────────────────
const LUXURY_ASSETS: Omit<LuxuryAsset, "id" | "purchasePrice" | "currentValue">[] = [
    { name: "Vintage Chronograph", type: "Watch", emoji: "⌚", depreciationRate: 0.002, impact: { reputation: 2 } },
    { name: "Luxury SUV", type: "Car", emoji: "🚙", depreciationRate: -0.015, impact: { reputation: 3 } },
    { name: "Electric Sportscar", type: "Car", emoji: "🏎️", depreciationRate: -0.02, impact: { reputation: 5, networking: 2 } },
    { name: "Downtown Penthouse", type: "Property", emoji: "🌇", depreciationRate: 0.005, impact: { reputation: 10, networking: 5 } },
    { name: "Country Estate", type: "Property", emoji: "🏰", depreciationRate: 0.003, impact: { reputation: 8, leadership: 2 } },
    { name: "Executive Jet", type: "Jet", emoji: "🛩️", depreciationRate: -0.01, impact: { reputation: 15, networking: 10, leadership: 5 } },
    { name: "City Chopper", type: "Chopper", emoji: "🚁", depreciationRate: -0.012, impact: { reputation: 12, networking: 8 } },
    { name: "Rare Art Collection", type: "Property", emoji: "🖼️", depreciationRate: 0.008, impact: { reputation: 10, networking: 6 } },
];

const LIFESTYLE_TOGGLES: LifestyleToggle[] = [
    {
        id: "pvt_chef",
        name: "Private Chef",
        description: "Organic, nutrient-dense meals prepared daily.",
        monthlyCost: 5000,
        impact: { health: 5, burnout: -8, sleep: 5 },
        emoji: "👨‍🍳"
    },
    {
        id: "pvt_trainer",
        name: "Performance Coach",
        description: "Custom fitness and longevity optimization.",
        monthlyCost: 3500,
        impact: { health: 8, burnout: -5 },
        emoji: "🏋️"
    },
    {
        id: "tailored_clothing",
        name: "Bespoke Tailoring",
        description: "Custom suits and professional wardrobe.",
        monthlyCost: 2000,
        impact: { reputation: 10 },
        emoji: "🧵"
    },
    {
        id: "mental_health",
        name: "Concierge Therapy",
        description: "24/7 access to high-performance psychology.",
        monthlyCost: 4000,
        impact: { burnout: -15, sleep: 8 },
        emoji: "🧠"
    },
];

// ─── Helper components ────────────────────────────────────────────────────────
function StatBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                <span className={cn("text-[10px] font-black", color)}>{Math.round(value)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", color.replace("text-", "bg-"))} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function SH({ children }: { children: React.ReactNode }) {
    return <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4 first:mt-0">{children}</p>;
}

function BigMetric({ label, value, sub, color, icon, explanation, isExpanded, onToggle }: { label: string; value: string; sub?: string; color: string; icon: string; explanation?: string; isExpanded?: boolean; onToggle?: () => void }) {
    return (
        <div
            onClick={onToggle}
            className={cn("rounded-2xl p-3 border transition-all cursor-pointer", color, isExpanded ? "ring-2 ring-indigo-500 ring-offset-2 scale-[1.02]" : "hover:border-slate-300")}
        >
            <div className="flex justify-between items-start">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{icon} {label}</p>
                {explanation && <span className="text-[10px] text-slate-400">?</span>}
            </div>
            <p className="text-xl font-black italic text-slate-900 leading-none mt-0.5">{value}</p>
            {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}

            <AnimatePresence>
                {isExpanded && explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="text-[10px] text-slate-600 mt-3 pt-3 border-t border-black/5 leading-relaxed font-medium">
                            {explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SheetRow({ emoji, label, sub, onPress, active }: { emoji: string; label: string; sub?: string; onPress: () => void; active?: boolean }) {
    return (
        <div onClick={onPress} className={cn(
            "flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] mb-2",
            active ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-100 hover:border-slate-200"
        )}>
            <span className="text-2xl w-8 text-center">{emoji}</span>
            <div className="flex-1">
                <p className={cn("text-sm font-bold", active ? "text-indigo-700" : "text-slate-800")}>{label}</p>
                {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
            </div>
            {active && <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"><span className="text-white text-[8px] font-black">✓</span></div>}
        </div>
    );
}

function StatRow({ label, value, color, explanation, isExpanded, onToggle }: { label: string; value: string; color?: string; explanation?: string; isExpanded?: boolean; onToggle?: () => void }) {
    return (
        <div className="border-b border-slate-50 last:border-0">
            <div
                onClick={onToggle}
                className={cn("flex justify-between items-center py-2 cursor-pointer transition-all", explanation ? "hover:bg-slate-50/50 px-1 -mx-1 rounded-lg" : "")}
            >
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">{label}</span>
                    {explanation && <span className="text-[9px] text-slate-300">?</span>}
                </div>
                <span className={cn("text-xs font-black", color || "text-slate-900")}>{value}</span>
            </div>
            <AnimatePresence>
                {isExpanded && explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="text-[9px] text-slate-500 pb-2 leading-relaxed italic">
                            {explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BreakdownRow({ label, value, sign = "", color = "" }: { label: string; value: number | string; sign?: string; color?: string }) {
    return (
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 last:border-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className={cn("text-[10px] font-black tabular-nums", color)}>
                {sign}{value}h
            </span>
        </div>
    );
}

function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
    const [displayedText, setDisplayedText] = useState("");
    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i++;
            if (i > text.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <>{displayedText}</>;
}

// ─── ActionSheet ──────────────────────────────────────────────────────────────
type SheetCategory = "product" | "marketing" | "hiring" | "funding" | "stats" | "founder" | "market" | "lifestyle";

type ActionSheetProps = {
    category: SheetCategory;
    startup: any; founder: any; m: any;
    selectedAction: any; setSelectedAction: (a: any) => void;
    selectedEmpIdx: number; setSelectedEmpIdx: (f: ((i: number) => number) | number) => void;
    handleTrainEmployee: (id: string) => void;
    handlePromoteEmployee: (id: string) => void;
    handleFireEmployee: (id: string) => void;
    handleIncrementSalary: (id: string) => void;
    setIsTeamOpen: (b: boolean) => void;
    setIsFinancialsOpen: (b: boolean) => void;
    competitors: any[];
    handleImmediateAction: (id: string) => void;
    handleToggleOngoingProgram: (id: string) => void;
    ongoingPrograms: ActiveProgram[];
    actionUsageLog: ActionUsageLog;
    focusHoursUsed: number;
    setStartup: (s: any) => void;
    addTimelineEvent: (t: string, monthOverride?: number) => void;
    setIsEndgameOpen: (b: boolean) => void;
    month: number;
    salaryInput: string;
    setSalaryInput: (s: string) => void;
    setIsBoardModalOpen: (b: boolean) => void;
    setLastProposalResult: (r: any) => void;
    setVotingMembers: (m: any[]) => void;
    handlePurchaseAsset: (asset: Omit<LuxuryAsset, "id" | "purchasePrice" | "currentValue">, price: number) => void;
    handleToggleLifestyle: (id: string) => void;
    setFocusHoursUsed: (n: number) => void;
    handleActionClick: (action: StartupAction, forcedCandidate?: Candidate) => void;
    handleAllocateESOP: () => void;
    expandedMetric: string | null;
    setExpandedMetric: (s: string | null) => void;
    currentTime: number;
    cashGrants: number[];
    setCashGrants: React.Dispatch<React.SetStateAction<number[]>>;
    energyRefills: number[];
    setEnergyRefills: React.Dispatch<React.SetStateAction<number[]>>;
    setConfirmDialog: (d: any) => void;
    isOnline: boolean;
    rejectedCandidates: string[];
    allEmployees: any[];
};

function ActionSheet({ category, startup, founder, m, selectedAction, setSelectedAction,
    selectedEmpIdx, setSelectedEmpIdx, handleTrainEmployee, handlePromoteEmployee,
    handleFireEmployee, handleIncrementSalary, setIsTeamOpen, setIsFinancialsOpen,
    competitors, handleImmediateAction, handleToggleOngoingProgram, ongoingPrograms,
    actionUsageLog, focusHoursUsed, setFocusHoursUsed, setStartup, addTimelineEvent, setIsEndgameOpen, month,
    salaryInput, setSalaryInput, setIsBoardModalOpen, setLastProposalResult, setVotingMembers,
    handlePurchaseAsset, handleToggleLifestyle, handleActionClick, handleAllocateESOP, expandedMetric, setExpandedMetric, currentTime, cashGrants, setCashGrants, energyRefills, setEnergyRefills, setConfirmDialog, isOnline, rejectedCandidates, allEmployees }: ActionSheetProps) {

    const employees = allEmployees;
    const liveRevenue = m.users * (m.pricing || 0);
    const liveNetProfit = liveRevenue - (m.cogs || 0) - (m.opex || 0);
    const profitable = liveNetProfit >= 0;

    const safeIdx = Math.min(selectedEmpIdx, Math.max(0, employees.length - 1));
    const emp = employees[safeIdx];

    const sheetHeader = (emoji: string, title: string, sub: string) => (
        <div className="mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{title}</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
                </div>
            </div>
        </div>
    );

    const renderOngoingProgramUI = (prog: any, mult: number) => {
        const phaseMult = Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000)));
        const costLabel = prog.monthlyCost > 0 ? ` · ${formatMoney(prog.monthlyCost * phaseMult)}/mo` : "";
        const isSLG = startup.gtm_motion === "SLG";

        const pmf = startup.metrics.pmf_score || 10;
        const qual = startup.metrics.product_quality || 10;
        const growthMult = (0.5 + pmf / 100) * (0.5 + qual / 100);

        const effectsList = Object.entries(prog.baseMonthlyEffect)
            .map(([key, val]) => {
                if (val === undefined || key === "cash") return null;
                const isUsers = key.toLowerCase() === 'users';
                const isGrowthMetric = isUsers || ['brand_awareness', 'reputation'].includes(key.toLowerCase());
                const isPercentageMetric = ['brand_awareness', 'reputation', 'product_quality', 'reliability', 'pmf_score', 'culture_score', 'innovation', 'marketing_skill', 'technical_skill', 'leadership', 'sales_skill', 'founder_health', 'founder_burnout', 'team_morale'].includes(key.toLowerCase());
                const applyPhaseScale = (isGrowthMetric || key.toLowerCase() === 'revenue') && !isPercentageMetric;

                let finalMult = mult;
                if (isGrowthMetric) {
                    finalMult *= growthMult;
                    if (isUsers && startup.industry && startup.gtm_motion) {
                        finalMult *= getPricingScale(startup.industry, startup.gtm_motion);
                    }
                }
                
                let scaleVal = (val as number) > 0 ? Math.max(1, Math.round((val as number) * finalMult)) : Math.min(-1, Math.round((val as number) * finalMult));
                scaleVal *= (applyPhaseScale ? phaseMult : 1);
                
                let uiKey = key;
                if (isUsers && isSLG) uiKey = "leads";
                
                const sign = scaleVal > 0 ? "+" : "";
                const label = uiKey.replace(/_/g, " ")
                    .replace("brand awareness", "Brand")
                    .replace("reputation", "Rep")
                    .replace("technical debt", "Debt")
                    .replace("product quality", "Quality");
                return `${sign}${scaleVal} ${label.replace(/\b\w/g, c => c.toUpperCase())}`;
            })
            .filter(Boolean)
            .join(" · ");

        return (
            <div>
                <p className="text-[9px] text-slate-500 font-bold mb-0.5">{prog.description}</p>
                <p className="text-[9px] text-indigo-600 font-black">{effectsList}{costLabel}</p>
            </div>
        );
    };

    // ── PRODUCT ────────────────────────────────────────────────────────────────
    if (category === "product") {
        const actions = IMMEDIATE_ACTIONS.filter(a => a.category === "product");
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);

        return (
            <div>
                {sheetHeader("🔧", "Product", "Instant technical execution")}
                <p className="text-[9px] text-slate-400 mb-3 tracking-widest uppercase font-black">Requires Focus Energy</p>

                <div className="space-y-1.5 mb-6">
                    {actions.map(action => {
                        const usedCount = actionUsageLog.thisMonth[action.id] ?? 0;
                        const isOver = (focusHoursUsed + action.energyCost) > maxHours * 1.2;

                        // Calculate dynamic impact for the label
                        const ctx = { month, startup, founder, m: startup.metrics };
                        const { scaledEffects } = calcDynamicImpact(action, actionUsageLog, ctx);

                        // Format the dynamic label
                        const dynamicImpact = Object.entries(scaledEffects)
                            .filter(([k, v]) => v && v !== 0 && k !== "cash")
                            .slice(0, 4)
                            .map(([k, v]) => {
                                const val = v as number;
                                const sign = val > 0 ? "+" : "";
                                let key = k.replace(/_/g, " ");
                                return `${sign}${val} ${key}`;
                            }).join(", ");

                        return (
                            <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                                className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                    isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50")}>
                                <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{action.label}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">
                                        {dynamicImpact}
                                        {scaledEffects.cash && (
                                            <span className="font-bold text-rose-600"> (Cost: ${Math.round(Math.abs(scaledEffects.cash)).toLocaleString()})</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                    {scaledEffects.technical_debt && scaledEffects.technical_debt < 0 && (
                                        <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 shadow-sm mb-1">⬇️ DEBT</span>
                                    )}
                                    <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded-full opacity-90">⚡{action.energyCost}h</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-col items-center gap-1 mb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Pricing Strategy</p>
                    <div className={cn("px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
                        startup.gtm_motion === "PLG" ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-emerald-50 border-emerald-100 text-emerald-600")}>
                        {startup.gtm_motion === "PLG" ? "✨ Product-Led Growth Active" : "🤝 Sales-Led Growth Active"}
                    </div>
                </div>
                <div className="w-full max-w-[250px] mx-auto mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                    {(() => {
                        const ind = startup.industry || "SaaS Platform";
                        const isPLG = startup.gtm_motion === "PLG";
                        const cfgBase = INDUSTRY_PRICING_CONFIG[ind] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
                        const cfg = isPLG ? cfgBase.PLG : cfgBase.SLG;

                        return (
                            <div className="w-full">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{cfg.label}</span>
                                    <span className="text-xl font-black text-slate-800 tracking-tighter">
                                        {cfg.unit === "%" ? `${m.pricing}%` : `$${m.pricing}`}
                                        <span className="text-xs text-slate-400 font-normal tracking-normal lowercase"> {cfg.unit}</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max={cfg.maxPrice} step="1"
                                    value={m.pricing || 0}
                                    onChange={(e) => {
                                        const newPrice = Number(e.target.value);
                                        setStartup((s: any) => ({
                                            ...s,
                                            metrics: { ...s.metrics, pricing: newPrice }
                                        }));
                                    }}
                                    className="w-full mt-2 accent-indigo-600 cursor-pointer"
                                />
                                <div className="flex justify-between w-full mt-1 px-1 text-[8px] font-black text-slate-400 uppercase">
                                    <span>Free</span>
                                    <span>${Math.round(cfg.maxPrice / 2)}</span>
                                    <span>${cfg.maxPrice}</span>
                                </div>

                                {/* Sub-sliders (like Ad Frequency) */}
                                {cfg.sliders && cfg.sliders.map(sl => (
                                    <div key={sl.key} className="mt-4 pt-4 border-t border-slate-200/60 w-full">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{sl.label}</span>
                                            <span className="text-xs font-black text-slate-700">{m[sl.key] || 0}{sl.unit}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={sl.min} max={sl.max} step={sl.step}
                                            value={m[sl.key] || 0}
                                            onChange={(e) => {
                                                const v = Number(e.target.value);
                                                setStartup((s: any) => ({
                                                    ...s,
                                                    metrics: { ...s.metrics, [sl.key]: v }
                                                }));
                                            }}
                                            className="w-full accent-indigo-500 cursor-pointer"
                                        />
                                    </div>
                                ))}

                                {(() => {
                                    const { conversion, churn, loopPower } = cfg.calc(m.pricing || 0, m);

                                    return (
                                        <div className="mt-3 pt-3 border-t border-slate-200 w-full grid grid-cols-3 gap-1 text-center">
                                            <div className="flex flex-col justify-center items-center">
                                                <span className="text-[7px] font-black text-slate-400 uppercase leading-tight mb-[2px]">
                                                    {isPLG ? "Virality" : "Sales Conversion"}
                                                </span>
                                                <span className={cn("text-[10px] font-black leading-none", conversion < 0.5 ? "text-rose-600" : conversion > 1.2 ? "text-emerald-500" : "text-amber-600")}>
                                                    {conversion.toFixed(1)}x
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-center items-center border-l border-slate-200">
                                                <span className="text-[7px] font-black text-slate-400 uppercase leading-tight mb-[2px]">Churn</span>
                                                <span className={cn("text-[10px] font-black leading-none", churn > 0.06 ? "text-rose-600" : "text-emerald-500")}>
                                                    {(churn * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-center items-center border-l border-slate-200">
                                                <span className="text-[7px] font-black text-slate-400 uppercase leading-tight mb-[2px]">
                                                    {isPLG ? "Loop Power" : "Net Score"}
                                                </span>
                                                <span className={cn("text-[10px] font-black leading-none", loopPower < 0 ? "text-rose-500" : "text-indigo-600")}>
                                                    {loopPower > 0 ? '+' : ''}{loopPower.toFixed(0)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })()}

                    {/* Dynamic Pricing Insights */}
                    {(() => {
                        const ind = startup.industry || "SaaS Platform";
                        const isPLG = startup.gtm_motion === "PLG";
                        const cfgBase = INDUSTRY_PRICING_CONFIG[ind] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
                        const cfg = isPLG ? cfgBase.PLG : cfgBase.SLG;
                        const ratio = m.pricing / cfg.maxPrice;
                        
                        let label = "⚖️ Balanced Pricing";
                        let pros = "Solid margins with steady, predictable growth.";
                        let cons = "Standard competition levels apply.";
                        
                        if (ratio < 0.25) {
                            label = "🚀 Growth Pricing (Under-priced)";
                            pros = "Accelerated virality & high user conversion.";
                            cons = "Low cash revenue per user limits burn capacity.";
                        } else if (ratio > 0.75) {
                            label = "💎 Premium Pricing (Over-priced)";
                            pros = "Maximizes cash revenue and contract sizes.";
                            cons = "Slows down organic virality & yields higher churn.";
                        }

                        return (
                            <div className="w-full mt-3 px-2 py-1.5 bg-indigo-50/50 border border-indigo-100/60 rounded-xl">
                                <p className="text-[8px] font-black text-indigo-700 uppercase tracking-wide">{label}</p>
                                <p className="text-[8px] text-emerald-600 mt-0.5"><span className="font-bold">Pro:</span> {pros}</p>
                                <p className="text-[8px] text-rose-500"><span className="font-bold">Con:</span> {cons}</p>
                            </div>
                        );
                    })()}

                    <div
                        onClick={() => setStartup((s: any) => ({ ...s, metrics: { ...s.metrics, annual_billing: !s.metrics.annual_billing } }))}
                        className={cn("mt-4 w-full p-2.5 rounded-xl border-2 text-center cursor-pointer transition text-[9px] font-black tracking-wide uppercase",
                            m.annual_billing ? "bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-50" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}
                    >
                        {m.annual_billing ? "💸 Annual Billing (Upfront Cash)" : "📅 Monthly Billing (Default)"}
                    </div>
                </div>

                {/* Strategy Playbook Card */}
                {(() => {
                    const key = `${startup.industry}_${startup.gtm_motion}`;
                    const pb = STRATEGY_PLAYBOOK[key];
                    if (!pb) return null;
                    return (
                        <div className="mt-3 bg-slate-800 rounded-2xl p-4">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">📖 Strategy Playbook — {pb.model}</p>
                            <div className="space-y-2">
                                <div className="flex gap-2"><span className="text-[9px] shrink-0">👤</span><div><p className="text-[8px] font-black text-slate-400 uppercase">Your Customers</p><p className="text-[10px] text-slate-200 leading-tight">{pb.customers}</p></div></div>
                                <div className="flex gap-2"><span className="text-[9px] shrink-0">💵</span><div><p className="text-[8px] font-black text-slate-400 uppercase">MRR Formula</p><p className="text-[10px] text-emerald-300 font-bold leading-tight">{pb.mrrFormula}</p></div></div>
                                <div className="flex gap-2"><span className="text-[9px] shrink-0">🚀</span><div><p className="text-[8px] font-black text-slate-400 uppercase">Growth Lever</p><p className="text-[10px] text-slate-200 leading-tight">{pb.growthLever}</p></div></div>
                                <div className="flex gap-2"><span className="text-[9px] shrink-0">⚠️</span><div><p className="text-[8px] font-black text-slate-400 uppercase">Main Risk</p><p className="text-[10px] text-rose-300 leading-tight">{pb.mainRisk}</p></div></div>
                            </div>
                        </div>
                    );
                })()}

                {m.pricing > 199 && m.b2b_pipeline && (
                    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 space-y-1">
                        <p className="text-[9px] font-black text-indigo-800 uppercase tracking-widest mb-2">🤝 B2B Sales Pipeline</p>
                        <StatRow label="Leads" value={m.b2b_pipeline.leads.toLocaleString()} color="text-indigo-600" />
                        <StatRow label="Active Deals" value={m.b2b_pipeline.active_deals.toLocaleString()} color="text-amber-600" />
                        <StatRow label="Deals Won" value={m.b2b_pipeline.closed_won.toLocaleString()} color="text-emerald-600" />
                        <p className="text-[8px] text-indigo-500 mt-2 pt-2 border-t border-indigo-100 leading-tight">Enterprise sales takes 1-3 months. Win rate depends on quality & sales team.</p>
                    </div>
                )}

                <div className="mt-3 bg-slate-50 rounded-2xl p-3 space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Stats</p>
                    <StatRow label="Quality" value={`${Math.round(m.product_quality || 0)}%`} color="text-indigo-600" />
                    <StatRow label="Reliability" value={`${Math.round(m.reliability || 0)}%`} color="text-cyan-600" />
                    <StatRow label="Tech Debt" value={`${Math.round(m.technical_debt || 0)}%`} color={m.technical_debt > 50 ? "text-rose-600" : "text-slate-700"} />
                    <StatRow label="PMF Score" value={`${Math.round(startup.pmf_score || 10)}`} color="text-violet-600" />
                </div>
            </div>
        );
    }

    // ── MARKETING ──────────────────────────────────────────────────────────────
    if (category === "marketing") {
        const actions = IMMEDIATE_ACTIONS.filter(a => a.category === "marketing_skill");
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);

        // Ongoing marketing programs
        const mktPrograms = ONGOING_PROGRAMS.filter(p => p.category_ui === "Marketing");

        return (
            <div>
                {sheetHeader("📈", "Marketing", "Actions + Ongoing Programs")}

                {/* ── Marketing Stats Panel ── */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-emerald-700 leading-none">{Math.round(founder.attributes.marketing_skill || 10)}</p>
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wide mt-0.5">Mkt Skill</p>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-pink-700 leading-none">{Math.round(m.brand_awareness || 0)}%</p>
                        <p className="text-[8px] font-black text-pink-500 uppercase tracking-wide mt-0.5">Brand</p>
                    </div>
                    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-violet-700 leading-none">{startup.employees?.filter((e: any) => e.role === "marketer").length || 0}</p>
                        <p className="text-[8px] font-black text-violet-500 uppercase tracking-wide mt-0.5">Marketers</p>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 mb-4 flex justify-between items-center">
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Growth Rate</p>
                        <p className="text-xs font-black text-slate-700">{(m.growth_rate * 100).toFixed(1)}%/mo</p>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">CAC</p>
                        <p className="text-xs font-black text-slate-700">${(m.cac || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">LTV</p>
                        <p className="text-xs font-black text-slate-700">${(m.ltv || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">PMF Score</p>
                        <p className={cn("text-xs font-black", (startup.pmf_score || 0) < 30 ? "text-rose-600" : (startup.pmf_score || 0) < 60 ? "text-amber-600" : "text-emerald-600")}>{Math.round(startup.pmf_score || 0)}</p>
                    </div>
                </div>

                {/* Marketing Strategy Context */}
                {(() => {
                    const key = `${startup.industry}_${startup.gtm_motion}`;
                    const pb = STRATEGY_PLAYBOOK[key];
                    if (!pb) return null;
                    return (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mb-1.5">🎯 Your Growth Playbook</p>
                            <p className="text-[10px] text-emerald-800 leading-tight font-semibold mb-1">{pb.growthLever}</p>
                            <p className="text-[9px] text-emerald-600 leading-tight">{pb.marketingTip}</p>
                        </div>
                    );
                })()}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Instant Action (Costs Energy)</p>
                <div className="space-y-1.5">
                    {actions.map(action => {
                        const usedCount = actionUsageLog.thisMonth[action.id] ?? 0;
                        const isOver = (focusHoursUsed + action.energyCost) > maxHours * 1.2;
                        
                        const ctx = { month, startup, founder, m: startup.metrics };
                        const { scaledEffects } = calcDynamicImpact(action, actionUsageLog, ctx);
                        const dynamicImpact = Object.entries(scaledEffects)
                            .filter(([k, v]) => v && v !== 0 && k !== "cash")
                            .map(([k, v]) => {
                                const val = v as number;
                                let key = k.replace(/_/g, " ");
                                if (key === "leads") return `${val > 0 ? "+" : ""}${val} Leads`;
                                return `${val > 0 ? "+" : ""}${val} ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                            }).join(", ");

                        return (
                            <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                                className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                    isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50")}>
                                <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{action.label}</p>
                                    <p className="text-[9px] text-slate-400">
                                        {action.description.replace(/\s*\(\$\d+(?:,\d+)?\)/i, "")}
                                        {scaledEffects.cash && (
                                            <span className="font-bold text-rose-600"> (Cost: ${Math.round(Math.abs(scaledEffects.cash)).toLocaleString()})</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                    <p className="text-[9px] font-black text-emerald-600 tracking-tighter">{dynamicImpact}</p>
                                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-full opacity-90">⚡{action.energyCost}h</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">🔄 Ongoing Programs</p>
                {mktPrograms.map(prog => {
                    const active = ongoingPrograms.some(p => p.id === prog.id);
                    const ap = ongoingPrograms.find(p => p.id === prog.id);
                    const streak = ap?.streakMonths || 0;
                    const mult = getStreakMultiplier(prog, streak);
                    return (
                        <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                            className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all mb-2",
                                active ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-100 hover:border-slate-200")}>
                            <span className="text-xl">{prog.emoji}</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{prog.label}</p>
                                {renderOngoingProgramUI(prog, mult)}
                            </div>
                            {active && streak > 0 && <span className="text-[10px] font-black text-emerald-600">🔥{streak}mo ×{mult.toFixed(0)}</span>}
                            <div className={cn("w-10 h-5 rounded-full transition-all relative", active ? "bg-emerald-500" : "bg-slate-200")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", active ? "left-5" : "left-0.5")} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── HIRING ──────────────────────────────────────────────────────────────────────────────
    if (category === "hiring") {
        const employees = allEmployees;
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);

        const configRef = INDUSTRY_PRICING_CONFIG[startup.industry] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
        const activeConfig = startup.gtm_motion === "PLG" ? configRef.PLG : configRef.SLG;

        // Generate 3 candidate profiles per role for the pipeline
        const ROLE_DEFS = [
            { role: "engineer" as const, emoji: "👨‍💻", label: "Software Engineer", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", tagBg: "bg-blue-100" },
            { role: "marketer" as const, emoji: "📣", label: "Growth Marketer", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", tagBg: "bg-pink-100" },
            { role: "sales" as const, emoji: "🤝", label: activeConfig.salesRoleName, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", tagBg: "bg-emerald-100" },
        ];

        const seed = (startup.name.length + (employees?.length || 0) + (m?.users || 0)); // deterministic-ish seed
        const SKILL_TIERS = [
            { label: "Senior", skillBase: 75, salaryBase: 10000, cultureFit: 85 },
            { label: "Mid", skillBase: 55, salaryBase: 7000, cultureFit: 72 },
            { label: "Junior", skillBase: 35, salaryBase: 4000, cultureFit: 65 },
        ];

        return (
            <div>
                {sheetHeader("👥", "Hiring Pipeline", `${employees.length} on team · ${m.team_morale || 0}% morale`)}
                {/* Hiring Strategy Context */}
                {(() => {
                    const key = `${startup.industry}_${startup.gtm_motion}`;
                    const pb = STRATEGY_PLAYBOOK[key];
                    if (!pb) return null;
                    return (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                            <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">🎯 Hiring Priority for {pb.model}</p>
                            <p className="text-[10px] text-blue-800 font-semibold leading-tight">{pb.hiringPriority}</p>
                        </div>
                    );
                })()}

                {/* === OPTION POOL MANAGEMENT === */}
                <div className="mb-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5" /> Option Pool
                        </p>
                        <span className={cn("text-xs font-black", (m.option_pool || 0) < 1 ? "text-rose-500" : "text-indigo-600")}>
                            {(m.option_pool || 0).toFixed(1)}% Available
                        </span>
                    </div>
                    <p className="text-[8px] text-indigo-600 leading-tight mb-3">
                        Required for hiring & compensation. Expand via dilution if pool is too low.
                    </p>
                    <button
                        onClick={handleAllocateESOP}
                        className="w-full py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        Allocate ESOP (+10% Dilution)
                    </button>
                    {(m.option_pool || 0) < 1 && (
                        <p className="text-[7px] font-black text-rose-500 uppercase mt-2 animate-pulse text-center">
                            ⚠️ Insufficient PooL! You cannot hire without expansion.
                        </p>
                    )}
                </div>

                {/* === DEPARTMENT POWER BOARD === */}
                {(() => {
                    const eng = employees.filter((e: any) => e.role === "engineer");
                    const mkt = employees.filter((e: any) => e.role === "marketer");
                    const sal = employees.filter((e: any) => e.role === "sales");
                    const cxoEng = (startup as any).cxoTeam?.["CTO"] ? 1 : 0;
                    const cxoMkt = (startup as any).cxoTeam?.["CMO"] ? 1 : 0;
                    const cxoSal = (startup as any).cxoTeam?.["COO"] ? 1 : 0;

                    const avgSkill = (arr: any[], key: string) =>
                        arr.length === 0 ? 0 : Math.round(arr.reduce((s: number, e: any) => s + ((e.skills?.[key] || 0) * (e.performance / 100)), 0) / arr.length);

                    const engAvg = avgSkill(eng, "technical");
                    const mktAvg = avgSkill(mkt, "marketing");
                    const salAvg = avgSkill(sal, "sales");

                    // Power = avg_skill * headcount * performance_weight (1.0 = no CXO, +20% with CXO) * Morale
                    const teamEfficiency = Math.max(0.3, (m.team_morale || 100) / 100);
                    const engPow = Math.round(engAvg * (eng.length + cxoEng) * (cxoEng ? 1.20 : 1.0) * teamEfficiency);
                    const mktPow = Math.round(mktAvg * (mkt.length + cxoMkt) * (cxoMkt ? 1.20 : 1.0) * teamEfficiency);
                    const salPow = Math.round(salAvg * (sal.length + cxoSal) * (cxoSal ? 1.20 : 1.0) * teamEfficiency);

                    const DeptCard = ({ emoji, label, count, avgSk, power, drives, color, bg, border }: any) => (
                        <div className={`rounded-2xl border-2 ${bg} ${border} p-3 mb-2`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base">{emoji}</span>
                                    <p className={`text-[10px] font-black uppercase tracking-wide ${color}`}>{label}</p>
                                </div>
                                <span className={`text-[9px] font-black ${color} bg-white px-2 py-0.5 rounded-full border`}>{count} {count === 1 ? "person" : "people"}</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 text-center bg-white rounded-xl p-2 border border-slate-100">
                                    <p className={`text-sm font-black ${count === 0 ? "text-slate-300" : color}`}>{count === 0 ? "–" : avgSk}</p>
                                    <p className="text-[7px] font-black text-slate-400 uppercase mt-0.5">Avg Skill</p>
                                </div>
                                <div className="flex-1 text-center bg-white rounded-xl p-2 border border-slate-100">
                                    <p className={`text-sm font-black ${count === 0 ? "text-slate-300" : color}`}>{count === 0 ? "–" : power}</p>
                                    <p className="text-[7px] font-black text-slate-400 uppercase mt-0.5">Dept Power</p>
                                </div>
                                <div className="flex-1.5 bg-white rounded-xl p-2 border border-slate-100 flex-[2]">
                                    <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Drives</p>
                                    <p className="text-[8px] font-semibold text-slate-600 leading-tight">{drives}</p>
                                </div>
                            </div>
                            {count === 0 && (
                                <p className="text-[8px] text-slate-400 mt-1.5 leading-tight italic">No team yet — solo founder contributes minimal power here.</p>
                            )}
                        </div>
                    );

                    return (
                        <div className="mb-4">
                            {/* ── Team & Culture Stats Panel ── */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5 text-center">
                                    <p className="text-lg font-black text-emerald-700 leading-none">{employees.length}</p>
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-wide mt-0.5">Team Size</p>
                                </div>
                                <div className="bg-pink-50 border border-pink-100 rounded-2xl p-2.5 text-center">
                                    <p className="text-lg font-black text-pink-700 leading-none">{Math.round(m.team_morale || 0)}%</p>
                                    <p className="text-[8px] font-black text-pink-500 uppercase tracking-wide mt-0.5">Morale</p>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-2.5 text-center">
                                    <p className="text-lg font-black text-indigo-700 leading-none">{Math.round(startup.culture_score || 60)}%</p>
                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-wide mt-0.5">Culture</p>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">🏢 Department Power</p>
                            <p className="text-[8px] text-slate-400 mb-3 leading-tight">Each dept's power = avg skill × headcount × performance. Power directly multiplies the attribute it drives every month.</p>
                            <DeptCard
                                emoji="👨‍💻" label="Engineering" count={eng.length} avgSk={engAvg} power={engPow}
                                drives="Product Quality · Tech Debt Reduction · Reliability"
                                color="text-blue-700" bg="bg-blue-50" border="border-blue-200"
                            />
                            <DeptCard
                                emoji="📣" label="Marketing" count={mkt.length} avgSk={mktAvg} power={mktPow}
                                drives="Monthly Growth Rate · Brand Awareness · CAC"
                                color="text-pink-700" bg="bg-pink-50" border="border-pink-200"
                            />
                            <DeptCard
                                emoji="🤝" label={activeConfig.salesRoleName} count={sal.length} avgSk={salAvg} power={salPow}
                                drives={activeConfig.salesRoleDescription}
                                color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200"
                            />
                            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                <p className="text-[8px] text-amber-700 leading-tight"><span className="font-black">Tip:</span> Hire Senior talent for faster power gains. CXOs give +20% power to their dept. Avg skill is weighted by performance — unhappy teams underperform.</p>
                            </div>
                        </div>
                    );
                })()}


                {/* 3-candidate pipeline per role */}
                {ROLE_DEFS.map((roleDef, ri) => (
                    <div key={roleDef.role} className="mb-5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{roleDef.emoji} {roleDef.label} — Choose a Candidate</p>
                        <div className="space-y-2">
                            {SKILL_TIERS.map((tier, ti) => {
                                const candId = `${ri}-${ti}`;
                                if (rejectedCandidates.includes(candId)) return null;

                                const nameIdx = (seed + ri * 3 + ti) % CANDIDATE_NAMES.length;
                                const skillVariance = ((seed + ri + ti) % 15) - 7;
                                const skill = Math.max(20, Math.min(99, tier.skillBase + skillVariance));
                                const salary = tier.salaryBase + ((seed + ti) % 500);
                                const cultureFit = Math.max(50, Math.min(99, tier.cultureFit + ((seed + ri) % 15) - 7));
                                const isOver = focusHoursUsed + 20 > maxHours * 1.2;
                                const candidateAction = roleDef.role === "engineer" ? "hire_engineer" : roleDef.role === "marketer" ? "hire_marketer" : "hire_sales";
                                return (
                                    <div
                                        key={ti}
                                        onClick={() => {
                                            if (isOver) return;

                                            const basePct = tier.label === "Lead" ? 0.8 : tier.label === "Senior" ? 0.4 : tier.label === "Mid" ? 0.2 : 0.1;
                                            const vScale = Math.sqrt(Math.max(1, startup.valuation / 1000000));
                                            let expectedPct = basePct / vScale;

                                            // Cap the total dollar value of the equity grant (4-year package)
                                            // This provides a baseline expectation that can be traded for salary.
                                            const maxValue = tier.label === "Lead" ? 600000 : tier.label === "Senior" ? 350000 : tier.label === "Mid" ? 150000 : 75000;
                                            const currentValue = (expectedPct / 100) * startup.valuation;
                                            if (currentValue > maxValue) {
                                                expectedPct = (maxValue / startup.valuation) * 100;
                                            }

                                            const personalities: ("Stable" | "Ambitious" | "Creative")[] = ["Stable", "Ambitious", "Creative"];

                                            const candidate: Candidate = {
                                                name: CANDIDATE_NAMES[nameIdx] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".",
                                                role: roleDef.role,
                                                level: tier.label as any,
                                                experience: tier.label === "Lead" ? 10 : tier.label === "Senior" ? 7 : tier.label === "Mid" ? 4 : 1,
                                                expectedSalary: salary * 12,
                                                expectedEquity: parseFloat(Math.max(0.001, expectedPct).toFixed(3)),
                                                personality: personalities[(seed + ri + ti) % personalities.length],
                                                candId: candId
                                            };

                                            handleActionClick(candidateAction as any, candidate);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                            isOver ? "opacity-30 cursor-not-allowed border-slate-100 bg-slate-50" : `${roleDef.bg} ${roleDef.border} hover:shadow-sm`
                                        )}
                                    >
                                        <div className={`w-9 h-9 rounded-xl ${roleDef.tagBg} flex items-center justify-center font-black text-sm ${roleDef.text} shrink-0`}>
                                            {CANDIDATE_NAMES[nameIdx].charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800">{CANDIDATE_NAMES[nameIdx]} · <span className={roleDef.text}>{tier.label}</span></p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] text-slate-500">💪 {skill}%</span>
                                                <span className="text-[9px] text-slate-400">·</span>
                                                <span className="text-[9px] text-slate-500">❤️ {cultureFit}% fit</span>
                                                <span className="text-[9px] text-slate-400">·</span>
                                                <span className="text-[9px] font-bold text-slate-600">${salary.toLocaleString()}/mo</span>
                                            </div>
                                            <p className="text-[8px] text-slate-400 mt-0.5">4yr vest · 1yr cliff</p>
                                        </div>
                                        <span className={cn("text-[9px] font-black px-2 py-1 rounded-full", roleDef.tagBg, roleDef.text)}>➕ Hire</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Manage existing team */}
                {employees.length > 0 && (
                    <button onClick={() => setIsTeamOpen(true)}
                        className="w-full py-2.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-xs font-black uppercase">
                        View &amp; Manage Team ({employees.length})
                    </button>
                )}

                {/* Culture Programs */}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">🔄 Culture Programs</p>
                {ONGOING_PROGRAMS.filter(p => p.category_ui === "Culture").map(prog => {
                    const active = ongoingPrograms.some(p => p.id === prog.id);
                    const ap = ongoingPrograms.find(p => p.id === prog.id);
                    const phaseMult = Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000)));
                    const streak = ap?.streakMonths || 0;
                    const mult = getStreakMultiplier(prog, streak);
                    const label = prog.monthlyCost === -1
                        ? formatMoney((employees.length || 1) * 300) + "/mo"
                        : prog.monthlyCost > 0 ? formatMoney(prog.monthlyCost * phaseMult) + "/mo" : "Free";
                    return (
                        <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                            className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer mb-2",
                                active ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-100")}>
                            <span className="text-xl">{prog.emoji}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-bold text-slate-800">{prog.label}</p>
                                    {prog.monthlyEnergy > 0 && (
                                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded-full">
                                            ⚡{prog.monthlyEnergy}h/mo
                                        </span>
                                    )}
                                </div>
                                {renderOngoingProgramUI(prog, mult)}
                            </div>
                            {active && streak > 0 && <span className="text-[10px] font-black text-indigo-600">🔥{streak} ×{mult.toFixed(0)}</span>}
                            <div className={cn("w-10 h-5 rounded-full relative", active ? "bg-indigo-500" : "bg-slate-200")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", active ? "left-5" : "left-0.5")} />
                            </div>
                        </div>
                    );
                })}

                {/* ★ CXO HIRING */}
                <div className="mt-5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">🏆 Hire CXO Leadership</p>
                    <p className="text-[9px] text-slate-400 mb-3">CXOs multiply department strength. Each slot can only be filled once.</p>
                    {([
                        { role: "CTO", emoji: "💻", desc: "Cuts tech debt · boosts product quality", salary: 18000, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
                        { role: "CMO", emoji: "✉️", desc: "Boosts brand · reduces CAC", salary: 15000, bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
                        { role: "COO", emoji: "⚙️", desc: "Reduces burnout · boosts focus (+40h)", salary: 16000, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
                        { role: "CFO", emoji: "📊", desc: "Optimises burn · improves runway", salary: 14000, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
                        { role: "CPO", emoji: "🎯", desc: "Accelerates features · improves PMF", salary: 15000, bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
                        { role: "EA", emoji: "📅", desc: "Executive Assistant · boosts focus (+30h)", salary: 8000, bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
                    ] as const).map(cxo => {
                        const cxoTeam: Record<string, boolean> = (startup as any).cxoTeam || {};
                        const isHired = cxoTeam[cxo.role];
                        return (
                            <div
                                key={cxo.role}
                                onClick={() => {
                                    if (isHired) return;
                                    if (startup.metrics.cash < cxo.salary * 3) {
                                        addTimelineEvent(`❌ Need $${(cxo.salary * 3).toLocaleString()} cash reserve to hire ${cxo.role}`);
                                        return;
                                    }
                                    setStartup((s: any) => ({
                                        ...s,
                                        metrics: { ...s.metrics, cash: s.metrics.cash - cxo.salary * 3 },
                                        cxoTeam: { ...(s.cxoTeam || {}), [cxo.role]: true },
                                        employees: [...(s.employees || []), {
                                            id: `cxo_${cxo.role.toLowerCase()}`,
                                            name: `${cxo.role} (Executive)`,
                                            role: cxo.role.toLowerCase(),
                                            salary: cxo.salary * 12,
                                            performance: 90,
                                            skills: { technical: 80, marketing: 70, sales: 60 },
                                            isCXO: true
                                        }]
                                    }));
                                    addTimelineEvent(`🏆 Hired ${cxo.role} — ${cxo.desc}`);
                                }}
                                className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer mb-2 transition-all active:scale-[0.98]",
                                    isHired ? "opacity-60 cursor-default bg-slate-50 border-slate-100" : `${cxo.bg} ${cxo.border} hover:shadow-sm`)}
                            >
                                <span className="text-2xl">{cxo.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-xs font-black", isHired ? "text-slate-400" : cxo.text)}>{cxo.role}{isHired ? " ✅ Active" : ""}</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{cxo.desc}</p>
                                </div>
                                {!isHired && (
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-black text-slate-700">${cxo.salary.toLocaleString()}/mo</p>
                                        <p className="text-[8px] text-slate-400">3mo deposit</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ★ CO-FOUNDER RECRUITMENT */}
                {!(startup as any).hasCoFounder && (
                    <div className="mt-5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">🤝 Recruit a Co-Founder</p>
                        <p className="text-[9px] text-slate-400 mb-3">A co-founder gives up equity but halves your burnout and boosts your weakest skill.</p>
                        {([
                            { arch: "Tech-First", emoji: "🧑‍💻", equity: 20, desc: "+25 Tech, +50h Focus, halves tech debt" },
                            { arch: "GTM-First", emoji: "🧑‍💼", equity: 20, desc: "+25 Marketing, +50h Focus, 2× growth" },
                            { arch: "Balanced", emoji: "🤼", equity: 25, desc: "+15 Skills, +50h Focus, +20 Morale" },
                        ] as const).map((cf) => (
                            <div
                                key={cf.arch}
                                onClick={() => {
                                    const newCap = [...(startup.capTable || [{ name: "Founder", equity: 100, type: "Founder" }])];
                                    const fe = newCap.find((e: any) => e.type === "Founder");
                                    if (fe) fe.equity -= cf.equity;
                                    newCap.push({ name: `Co-Founder (${cf.arch})`, equity: cf.equity, type: "Co-Founder" });
                                    setStartup((s: any) => ({
                                        ...s,
                                        capTable: newCap,
                                        hasCoFounder: true,
                                        metrics: {
                                            ...s.metrics,
                                            founder_burnout: Math.max(0, (s.metrics.founder_burnout || 0) * 0.5),
                                            team_morale: Math.min(100, (s.metrics.team_morale || 70) + (cf.arch === "Balanced" ? 20 : 10)),
                                        },
                                    }));
                                    addTimelineEvent(`🤝 Recruited ${cf.arch} Co-Founder — ${cf.equity}% equity. ${cf.desc}`);
                                }}
                                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50 cursor-pointer mb-2 hover:border-indigo-300 transition-all active:scale-[0.98]"
                            >
                                <span className="text-2xl">{cf.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-indigo-800">{cf.arch} Co-Founder</p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{cf.desc}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-black text-rose-500">-{cf.equity}% equity</p>
                                    <p className="text-[8px] text-slate-400">½ burnout</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {(startup as any).hasCoFounder && (
                    <div className="mt-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3">
                        <p className="text-xs font-black text-indigo-700">🤝 Co-Founder Active</p>
                        <p className="text-[9px] text-slate-500 mt-1">Check Financials → Cap Table for equity split.</p>
                    </div>
                )}
            </div>
        );
    }

    // ── FUNDING ────────────────────────────────────────────────────────────────
    if (category === "funding") {
        const stage = startup.funding_stage;
        const capTable = startup.capTable || [{ name: "Founder", equity: 100, type: "Founder" }];
        const founderEquity = capTable.find((e: any) => e.type === "Founder")?.equity || 100;

        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);
        const fundCost = 40;

        let nextRound = getNextFundingStage(stage);
        
        // Smart Repair: Fix corrupted sequencing or "IPO Ready" overrides.
        const raisedRounds = capTable.filter((e: any) => e.type !== "Founder").length;
        if (stage === "IPO Ready" || stage === "Late Stage Round" || nextRound === "Late Stage Round") {
            if (raisedRounds === 0) nextRound = "Angel Investment";
            else if (raisedRounds === 1) nextRound = "Seed Round";
            else if (raisedRounds === 2) nextRound = "Series A";
            else if (raisedRounds === 3) nextRound = "Series B";
            else if (raisedRounds === 4) nextRound = "Series C";
            else if (raisedRounds === 5) nextRound = "Series D";
            else if (raisedRounds === 6) nextRound = "Series E";
            else nextRound = "Series F";
        }

        const pitchActions = [];
        if (nextRound && founderEquity > 5) {
            let emoji = "📈";
            let sub = "Late Stage Growth Capital";
            
            if (nextRound.includes("Angel")) { emoji = "👼"; sub = "$50K–$500K · 5–15% equity"; }
            else if (nextRound.includes("Seed")) { emoji = "🌱"; sub = "$500K–$2M · 15–25% equity"; }
            else if (nextRound === "Series A") { emoji = "⚡"; sub = "$2M–$15M · 20–30% equity"; }
            else if (nextRound === "Series B") { emoji = "📈"; sub = "$15M–$150M · 15–25% equity"; }
            else if (nextRound === "Series C") { emoji = "💎"; sub = "$150M–$500M · 10–20% equity"; }
            else if (nextRound.includes("Series") || nextRound.includes("Round")) {
                emoji = "🏛️";
                sub = "Institutional Scaling Capital · 5-10% equity";
            }
            
            pitchActions.push({ 
                action: "pitch_investors", 
                emoji, 
                label: `Pitch ${nextRound}`, 
                sub: `${sub} · Dynamic Leads (Net, Rep, Inno)` 
            });
        }
        
        const maxed = !nextRound && founderEquity < 5;

        return (
            <div>
                {sheetHeader("🏦", "Funding", `Stage: ${stage} · ${founderEquity.toFixed(0)}% founder equity`)}
                {maxed ? (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
                        <p className="text-2xl mb-2">🦄</p>
                        <p className="text-sm font-black text-amber-700">Maximum Funding Reached</p>
                        <p className="text-[10px] text-amber-500 mt-1">Focus on IPO preparation or acquisition</p>
                    </div>
                ) : (
                    <div className="space-y-1.5 mb-3">
                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">💰</span>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Emergency Grant</p>
                                    <p className="text-[8px] font-bold text-emerald-500 uppercase mt-0.5">Watch ad for +$50,000</p>
                                </div>
                            </div>
                            {(() => {
                                const hourAgo = currentTime - 60 * 60 * 1000;
                                const validGrants = (cashGrants || []).filter(t => t > hourAgo);
                                const isLimited = validGrants.length >= 2;

                                let countdownStr = "";
                                if (isLimited) {
                                    const nextAvail = validGrants[0] + 60 * 60 * 1000;
                                    const msLeft = Math.max(0, nextAvail - currentTime);
                                    const mins = Math.floor(msLeft / 60000);
                                    const secs = Math.floor((msLeft % 60000) / 1000);
                                    countdownStr = `${mins}:${String(secs).padStart(2, '0')}`;
                                }

                                return (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!isOnline}
                                        className={`h-6 text-[8px] font-black uppercase tracking-widest ${!isOnline ? 'bg-slate-100 border-slate-200 text-slate-400 grayscale' : 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200'}`}
                                        onClick={() => {
                                            if (!isOnline) {
                                                setConfirmDialog({
                                                    open: true,
                                                    title: "Action Unavailable",
                                                    description: "Grant ads require an active internet connection. Connect and try again!",
                                                    confirmText: "UNDERSTOOD",
                                                    type: "offline",
                                                    onConfirm: () => { }
                                                });
                                                return;
                                            }
                                            if (isLimited) {
                                                toast.error("Grant Limit Reached", { description: "You can claim 2 grants per hour maximum!" });
                                                return;
                                            }

                                            adService.showRewardedAd(() => {
                                                setStartup((s: any) => ({
                                                    ...s,
                                                    metrics: {
                                                        ...s.metrics,
                                                        cash: s.metrics.cash + 50000
                                                    }
                                                }));
                                                addTimelineEvent(`💰 Emergency Grant: +$50,000 received from strategic advisors.`);
                                                toast.success("Emergency Grant Received!", { description: "+$50,000 added to your balance.", icon: "💰" });
                                                setCashGrants([...validGrants, Date.now()]); // Update rates limit
                                            }, REWARDED_CASH_ID);
                                        }}
                                    >
                                        {isLimited ? (
                                            <span className="text-rose-600 font-bold">{countdownStr}</span>
                                        ) : "Claim (Ads)"}
                                    </Button>
                                );
                            })()}
                        </div>

                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instant Action (Costs Energy)</p>
                        {pitchActions.map((pa, idx) => {
                            const isOver = focusHoursUsed + fundCost > maxHours * 1.2;
                            return (
                                <div key={idx} onClick={() => isOver ? null : setSelectedAction("pitch_investors")}
                                    className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                        isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-amber-200 hover:bg-amber-50")}>
                                    <span className="text-xl w-7 text-center shrink-0">{pa.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{pa.label}</p>
                                        <p className="text-[9px] text-slate-400 truncate">{pa.sub}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <p className="text-[9px] font-black text-amber-600 tracking-tighter">-10 Innovation</p>
                                        <span className="text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full opacity-90">⚡{fundCost}h</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="mt-4 bg-slate-50 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cap Table</p>
                        <p className="text-[9px] font-black text-indigo-500">Pool: {m.option_pool || 0}%</p>
                    </div>
                    {capTable.map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full",
                                e.type === "Founder" ? "bg-indigo-100 text-indigo-700" : e.type === "Co-Founder" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700")}>
                                {e.type === "Founder" ? "👤" : e.type === "Co-Founder" ? "🤝" : "💼"}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 flex-1">{e.name}</span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${e.equity}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-800 w-10 text-right">{e.equity.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>

                {/* Investor Pipeline Tracker */}
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-3">
                    <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-2">📈 Fundraising Pipeline</p>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-white rounded-xl p-2 border border-amber-100">
                            <p className="text-lg font-black text-amber-700">{m.investor_pipeline?.leads || 0}</p>
                            <p className="text-[8px] font-black text-amber-500 uppercase">Leads</p>
                        </div>
                        <div className="bg-white rounded-xl p-2 border border-amber-100">
                            <p className="text-lg font-black text-amber-700">{m.investor_pipeline?.meetings || 0}</p>
                            <p className="text-[8px] font-black text-amber-500 uppercase">Meetings</p>
                        </div>
                        <div className="bg-white rounded-xl p-2 border border-emerald-100">
                            <p className="text-lg font-black text-emerald-700">{m.investor_pipeline?.term_sheets || 0}</p>
                            <p className="text-[8px] font-black text-emerald-500 uppercase">Term Sheets</p>
                        </div>
                    </div>
                    <p className="text-[8px] text-amber-600 leading-tight">Pitch investors to grow your pipeline. Term sheets take 2-4 months to generate.</p>
                    
                    {/* Access point to the negotiation game from the pipeline */}
                    {(m.investor_pipeline?.term_sheets || 0) > 0 && (
                        <button
                            onClick={() => handleActionClick("negotiate_round")}
                            className="w-full mt-3 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 animate-pulse"
                        >
                            🤝 Negotiate Term Sheet ({m.investor_pipeline.term_sheets})
                        </button>
                    )}
                </div>


                {/* ── M&A ACQUISITION OFFERS ── */}
                {(startup.acquisition_offers?.length ?? 0) > 0 && (
                    <div className="mt-4">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2">🔔 Acquisition Offers</p>
                        {startup.acquisition_offers!.map((offer: any) => {
                            const typeEmoji = offer.type === "big_tech" ? "🏢" : offer.type === "strategic" ? "🤝" : "💼";
                            const typeBg = offer.type === "big_tech" ? "bg-violet-50 border-violet-300" : offer.type === "strategic" ? "bg-emerald-50 border-emerald-300" : "bg-blue-50 border-blue-200";
                            const typeText = offer.type === "big_tech" ? "text-violet-800" : offer.type === "strategic" ? "text-emerald-800" : "text-blue-800";
                            return (
                                <div key={offer.id} className={`rounded-2xl border-2 ${typeBg} p-3 mb-3`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{typeEmoji}</span>
                                        <div className="flex-1">
                                            <p className={`text-xs font-black ${typeText}`}>{offer.acquirer}</p>
                                            <p className="text-[8px] text-slate-400 capitalize">{offer.type.replace("_", " ")} Acquisition · expires in {offer.expires_in}mo</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-white rounded-xl p-2 text-center border border-slate-100">
                                            <p className="text-sm font-black text-slate-800">{formatMoney(offer.offer_amount)}</p>
                                            <p className="text-[7px] text-slate-400 uppercase font-black">Total Offer</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-2 text-center border border-slate-100">
                                            <p className="text-sm font-black text-emerald-700">{formatMoney(offer.founder_take)}</p>
                                            <p className="text-[7px] text-slate-400 uppercase font-black">Your Take</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl"
                                            onClick={() => {
                                                if ((startup.ipo_stage || 0) > 0) {
                                                    toast.error("Cannot accept acquisition while IPO is in progress!");
                                                    return;
                                                }
                                                setStartup((s: any) => ({
                                                    ...s, outcome: "acquired",
                                                    acquisition_offers: (s.acquisition_offers || []).map((o: any) =>
                                                        o.id === offer.id ? { ...o, negotiated: true } : o
                                                    )
                                                }));

                                                const points = recordExit({ ...startup, outcome: "acquired" }, founder.name);
                                                toast.success(`Legendary! You earned ${points} Legacy XP.`);

                                                addTimelineEvent(`🤝 ACQUIRED by ${offer.acquirer} for ${formatMoney(offer.offer_amount)}! Founder take: ${formatMoney(offer.founder_take)}.`);
                                                setIsEndgameOpen(true);
                                            }}>
                                            Accept ✅
                                        </button>
                                        {!offer.negotiated && (
                                            <button
                                                className="flex-1 py-2 bg-amber-500 text-white text-[10px] font-black uppercase rounded-xl"
                                                onClick={() => {
                                                    // Link success to Founder Stats
                                                    const baseChance = 0.5; // Increased base chance
                                                    const networkBonus = (founder.attributes.networking / 100) * 0.3;
                                                    const reputationBonus = (founder.attributes.reputation / 100) * 0.2;
                                                    const successChance = Math.min(0.95, baseChance + networkBonus + reputationBonus);

                                                    const rand = Math.random();
                                                    const success = rand < successChance;
                                                    const hardFail = rand > (successChance + 0.4); // Lowered walk-out probability

                                                    setStartup((s: any) => ({
                                                        ...s,
                                                        acquisition_offers: (s.acquisition_offers || []).map((o: any) =>
                                                            o.id === offer.id ? {
                                                                ...o,
                                                                negotiated: true,
                                                                offer_amount: success ? Math.floor(o.offer_amount * 1.25) : o.offer_amount,
                                                                founder_take: success ? Math.floor(o.founder_take * 1.25) : o.founder_take,
                                                                expires_in: hardFail ? 0 : o.expires_in
                                                            } : o
                                                        ).filter((o: any) => o.expires_in > 0)
                                                    }));

                                                    if (success) {
                                                        addTimelineEvent(`💪 Negotiated! ${offer.acquirer} raised offer 25% to ${formatMoney(offer.offer_amount * 1.25)}.`);
                                                        toast.success("Offer increased!");
                                                    } else if (hardFail) {
                                                        addTimelineEvent(`❌ ${offer.acquirer} walked away from negotiations.`);
                                                        toast.error("They walked away.");
                                                    } else {
                                                        addTimelineEvent(`⚠️ ${offer.acquirer} refused to budge on the valuation.`);
                                                        toast.info("Offer remains firm.");
                                                    }
                                                }}>
                                                Negotiate 💬
                                            </button>
                                        )}
                                        <button
                                            className="px-3 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-xl"
                                            onClick={() => {
                                                setStartup((s: any) => ({
                                                    ...s,
                                                    acquisition_offers: (s.acquisition_offers || []).filter((o: any) => o.id !== offer.id)
                                                }));
                                                addTimelineEvent(`🚫 Declined acquisition offer from ${offer.acquirer}.`);
                                            }}>
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── IPO READINESS ── */}
                {(() => {
                    const liveArr = (m.users * (m.pricing || 0)) * 12;
                    const ipoChecks = [
                        { label: "$50M ARR", pass: liveArr >= 50_000_000 },
                        { label: "10K+ Users", pass: m.users >= 10_000 },
                        { label: "PMF Score ≥ 60", pass: (m.pmf_score ?? 0) >= 60 },
                        { label: "Tech Debt < 40%", pass: (m.technical_debt ?? 0) < 40 },
                        { label: "Series A+ Raised", pass: ["Series A", "Series B", "Series C", "IPO Ready"].includes(startup.funding_stage) },
                    ];
                    const passed = ipoChecks.filter(c => c.pass).length;
                    const ipoStage = startup.ipo_stage ?? 0;
                    const IPO_STAGE_LABELS = ["", "📝 Pre-IPO Planning", "📄 S-1 Filing & Roadshow", "💰 Pricing & Lock-Up", "🏛️ IPO Day!"];
                    return (
                        <div className="mt-4 bg-violet-50 border border-violet-200 rounded-2xl p-3">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] font-black text-violet-800 uppercase tracking-widest">🏛️ IPO Readiness</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${passed >= 5 ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-600"}`}>{passed}/5</span>
                            </div>
                            {ipoStage > 0 && (
                                <div className="mb-2 bg-violet-100 rounded-xl px-3 py-1.5">
                                    <p className="text-[9px] font-black text-violet-700">Stage {ipoStage}/4: {IPO_STAGE_LABELS[ipoStage]}</p>
                                </div>
                            )}
                            <div className="space-y-1 mb-3">
                                {ipoChecks.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-sm">{c.pass ? "✅" : "⬜"}</span>
                                        <p className={`text-[9px] font-semibold ${c.pass ? "text-emerald-700" : "text-slate-400"}`}>{c.label}</p>
                                    </div>
                                ))}
                            </div>
                            {passed >= 4 && ipoStage === 0 && (
                                <button
                                    onClick={() => {
                                        const currentMonth = startup.history?.length ?? 0;
                                        setStartup((s: any) => ({
                                            ...s,
                                            ipo_stage: 1,
                                            ipo_attempt_month: currentMonth
                                        }));
                                        addTimelineEvent(`🏛️ IPO Process Started! Filed intent with underwriters. 5-month journey begins.`);
                                    }}
                                    className="w-full py-2 bg-violet-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-violet-700 transition"
                                >
                                    File S-1 & Begin IPO Process →
                                </button>
                            )}
                            {passed < 4 && <p className="text-[8px] text-violet-500 leading-tight">Meet {4 - passed} more criteria to unlock the IPO process.</p>}
                        </div>
                    );
                })()}

                {/* ── WIND-DOWN ── */}
                <div className="mt-4">
                    <button
                        onClick={() => {
                            setConfirmDialog({
                                open: true,
                                title: "Wind Down?",
                                description: "Remaining assets will be distributed to shareholders. This cannot be undone.",
                                confirmText: "WIND DOWN",
                                type: "exit",
                                onConfirm: () => {
                                    setStartup((s: any) => ({ ...s, outcome: "wound_down" }));
                                    addTimelineEvent("🔒 Company wound down. Remaining cash distributed to shareholders.");
                                    setIsEndgameOpen(true);
                                }
                            });
                        }}
                        className="w-full py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                    >
                        🔒 Wind Down Company
                    </button>
                </div>

                {/* Investor Relations Programs */}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">🔄 Investor Relations</p>

                {ONGOING_PROGRAMS.filter(p => p.category_ui === "Funding").map(prog => {
                    const active = ongoingPrograms.some(p => p.id === prog.id);
                    const ap = ongoingPrograms.find(p => p.id === prog.id);
                    return (
                        <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                            className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer mb-2 transition-all active:scale-[0.98]",
                                active ? "bg-amber-50 border-amber-300 shadow-sm" : "bg-white border-slate-100 hover:border-amber-200")}>
                            <span className="text-2xl">{prog.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{prog.label}</p>
                                {renderOngoingProgramUI(prog, getStreakMultiplier(prog, ap?.streakMonths || 0))}
                                <div className="flex flex-wrap gap-1.5">
                                    {prog.monthlyCost > 0 && <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">-{formatMoney(prog.monthlyCost * Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000))))}/mo</span>}
                                    <span className="bg-amber-50 border border-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">⚡ {prog.monthlyEnergy}h/mo</span>
                                    {Object.entries(prog.baseMonthlyEffect).map(([k, v]) => (
                                        <span key={k} className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">+{v} {k.replace(/_/g, " ")}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={cn("w-10 h-5 rounded-full relative shrink-0", active ? "bg-amber-500" : "bg-slate-200")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", active ? "left-5" : "left-0.5")} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    if (category === "stats") {
        const toggle = (m: string) => setExpandedMetric(expandedMetric === m ? null : m);

        return (
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">📊</span>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Stats</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Tap any card or label for a plain-english explanation
                </p>
                {/* Revenue model context */}
                {(() => {
                    const key = `${startup.industry}_${startup.gtm_motion}`;
                    const pb = STRATEGY_PLAYBOOK[key];
                    if (!pb) return null;
                    return (
                        <div className="mb-4 p-3 bg-violet-50 border border-violet-100 rounded-2xl">
                            <p className="text-[8px] font-black text-violet-600 uppercase tracking-widest mb-1">💵 Your Revenue Model — {pb.model}</p>
                            <p className="text-[10px] font-bold text-violet-800 mb-1">{pb.mrrFormula}</p>
                            <p className="text-[9px] text-violet-600 leading-tight">{pb.statFocus}</p>
                        </div>
                    );
                })()}

                <div className="flex items-center gap-4 mb-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
                    <span>Legend:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Watch</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>Danger</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <BigMetric
                        label="Cash" value={formatMoney(m.cash)} color="bg-emerald-50 border-emerald-100" icon="💵"
                        explanation="Your company bank account. When this hits zero, game over. Try to keep at least 3 months of expenses in reserve."
                        isExpanded={expandedMetric === "cash"}
                        onToggle={() => toggle("cash")}
                    />
                    <BigMetric
                        label={profitable ? "Net Profit" : "Monthly Burn"}
                        value={formatMoney(Math.abs(liveNetProfit || 0))}
                        color={profitable ? "bg-green-50 border-green-100" : (liveNetProfit < 0 ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100")}
                        icon={profitable ? "📈" : (liveNetProfit < 0 ? "🔥" : "⚖️")}
                        explanation="Monthly Profit/Loss. Positive means you are gaining cash; negative (Burn) means you are losing it. Hire a CFO to optimize expenses."
                        isExpanded={expandedMetric === "burn"}
                        onToggle={() => toggle("burn")}
                    />
                    <BigMetric
                        label="Valuation" value={formatMoney(startup.valuation)} color="bg-violet-50 border-violet-100" icon="🏆"
                        explanation="The estimated market value of your startup. Driven by user growth, revenue, product quality, and market conditions."
                        isExpanded={expandedMetric === "valuation"}
                        onToggle={() => toggle("valuation")}
                    />
                    <BigMetric
                        label="Runway" value={profitable ? "∞" : `${m.runway}mo`} color="bg-blue-50 border-blue-100" icon="⏱️"
                        explanation="How many months you can survive at current burn before running out of cash. ∞ means you are profitable."
                        isExpanded={expandedMetric === "runway"}
                        onToggle={() => toggle("runway")}
                    />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-3 mb-3">
                    <StatRow label={startup.gtm_motion === "SLG" ? "Deals Closed" : "Users"} value={m.users.toLocaleString()} color="text-indigo-600"
                        explanation={startup.gtm_motion === "SLG" ? "Number of active enterprise contracts or licenses." : "Number of active users. The primary driver of MRR and valuation in PLG models."}
                        isExpanded={expandedMetric === "users"} onToggle={() => toggle("users")}
                    />
                    {startup.gtm_motion === "PLG" && (
                        <StatRow label="Paid Users" value={(m.paid_users || 0).toLocaleString()} color="text-violet-600"
                            explanation="Number of users who have converted from free to paid tiers (e.g. 5% Freemium conversion rate)."
                            isExpanded={expandedMetric === "paid_users"} onToggle={() => toggle("paid_users")}
                        />
                    )}
                    <StatRow label="MRR" value={formatMoney(liveRevenue || 0)} color="text-emerald-600"
                        explanation={startup.gtm_motion === "SLG" ? "Monthly Recurring Revenue. Calculated as Deals × Contract Size." : "Monthly Recurring Revenue. Calculated as Paid Users × Pricing."}
                        isExpanded={expandedMetric === "mrr"} onToggle={() => toggle("mrr")}
                    />
                    <StatRow label="Growth Rate" value={`${((m.growth_rate || 0) * 100).toFixed(0)}%/mo`} color="text-teal-600"
                        explanation="Month-over-month user growth. Investors look for 15%+ to consider you 'Fast Growth'."
                        isExpanded={expandedMetric === "growth"} onToggle={() => toggle("growth")}
                    />
                    <StatRow label="Product Quality" value={`${Math.round(m.product_quality || 0)}%`} color="text-blue-600"
                        explanation="How well your product works. High quality reduces churn and increases organic virality."
                        isExpanded={expandedMetric === "pq"} onToggle={() => toggle("pq")}
                    />
                    <StatRow label="Tech Debt" value={`${Math.round(m.technical_debt || 0)}%`} color={m.technical_debt > 50 ? "text-rose-600" : "text-slate-600"}
                        explanation="Invisible cost of messy code. High debt slows down development and increases reliability issues."
                        isExpanded={expandedMetric === "debt"} onToggle={() => toggle("debt")}
                    />
                    <StatRow label="Reliability" value={`${Math.round(m.reliability || 80)}%`} color="text-cyan-600"
                        explanation="Uptime and stability. If this drops below 80%, you will lose users due to crashes."
                        isExpanded={expandedMetric === "reliability"} onToggle={() => toggle("reliability")}
                    />
                    <StatRow label="Brand Awareness" value={`${Math.round(m.brand_awareness || 0)}%`} color="text-pink-600"
                        explanation="How many people know your company. Driven by marketing efforts and organic word-of-mouth."
                        isExpanded={expandedMetric === "brand"} onToggle={() => toggle("brand")}
                    />
                    <StatRow label="Team Morale" value={`${Math.round(m.team_morale || 0)}%`} color={m.team_morale < 50 ? "text-rose-600" : "text-emerald-600"}
                        explanation="Happy employees are more productive. Low morale reduces Department output."
                        isExpanded={expandedMetric === "morale"} onToggle={() => toggle("morale")}
                    />
                    <StatRow label="PMF Score" value={`${Math.round(startup.pmf_score || 10)}`} color="text-violet-600"
                        explanation="Product-Market Fit. Scales from 0-100. High scores unlock faster organic growth."
                        isExpanded={expandedMetric === "pmf"} onToggle={() => toggle("pmf")}
                    />
                </div>

                <button onClick={() => { setExpandedMetric(null); setIsFinancialsOpen(true); }}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-700 text-xs font-black uppercase">
                    Full Financials →
                </button>
            </div>
        );
    }

    // ── FOUNDER ───────────────────────────────────────────────────────────────
    if (category === "founder") {
        const attrs = founder.attributes;
        const burnout = m.founder_burnout || 0;
        const health = m.founder_health || 100;
        const HBar = ({ label, v, color }: { label: string; v: number; color: string }) => (
            <div className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-[10px] font-bold text-slate-500 w-24 uppercase shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.round(v)}%` }} />
                </div>
                <span className={cn("text-[10px] font-black w-6 text-right shrink-0", color.replace("bg-", "text-"))}>{Math.round(v)}</span>
            </div>
        );
        const maxHours = calcFocusHours(burnout, startup.employees || [], (startup as any).hasCoFounder);
        const energyPct = Math.min(100, (focusHoursUsed / maxHours) * 100);
        const usageColors = ["text-emerald-700 bg-emerald-50 border-emerald-200", "text-blue-700 bg-blue-50 border-blue-200", "text-amber-700 bg-amber-50 border-amber-200", "text-rose-700 bg-rose-50 border-rose-200", "text-slate-500 bg-slate-50 border-slate-200"];
        const usageLabels = ["Max Impact", "High Impact", "Low Impact", "Minimal Impact", "No Effect"];
        const ACTION_GROUPS = [
            { label: "Intelligence", category: "intelligence" as const },
            { label: "Technical", category: "technical" as const },
            { label: "Leadership", category: "leadership" as const },
            { label: "Networking", category: "networking" as const },
            { label: "Marketing", category: "founder_marketing" as const },
            { label: "Health", category: "health" as const },
            { label: "Burnout Recovery", category: "burnout" as const },
        ];
        // Founder ongoing programs — SHOWN FIRST
        const founderPrograms = ONGOING_PROGRAMS.filter(p => p.category_ui === "Founder" || p.category_ui === "Product");
        const activeFounderPrograms = founderPrograms.filter(p => ongoingPrograms.some(op => op.id === p.id));
        const inactiveFounderPrograms = founderPrograms.filter(p => !ongoingPrograms.some(op => op.id === p.id));

        // State for collapsed groups — stored in parent via a mini local map
        const [collapsedGroups, setCollapsedGroups] = [startup._collapsedFounderGroups || {}, (g: Record<string, boolean>) => setStartup((s: any) => ({ ...s, _collapsedFounderGroups: g }))];
        const toggleGroup = (key: string) => setCollapsedGroups(collapsedGroups[key] === false ? {} : { [key]: false });

        return (
            <div>
                {sheetHeader("👤", founder.name, `⚡ ${focusHoursUsed}h / ${maxHours}h focus used this month`)}

                {/* Focus bar */}
                <div className="mb-3 bg-rose-50 rounded-2xl p-3 border border-rose-100">
                    <div className="flex justify-between items-center mb-1.5">
                        <div>
                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">⚡ Monthly Focus Energy</p>
                            <span className={cn("text-[10px] font-black", energyPct > 80 ? "text-rose-600" : "text-slate-600")}>{focusHoursUsed}h / {maxHours}h</span>
                        </div>
                        {focusHoursUsed > 0 && (() => {
                                const hourAgo = Date.now() - 3600_000;
                                const validRefills = (energyRefills || []).filter((t: number) => t > hourAgo);
                                const isRefillLimited = validRefills.length >= 1;
                                return (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-[8px] font-black uppercase tracking-widest bg-rose-100 border-rose-200 text-rose-600 hover:bg-rose-200"
                                        disabled={isRefillLimited}
                                        onClick={() => {
                                            if (isRefillLimited) {
                                                toast.error("Refill Limit Reached", { description: "You can refill energy once per hour." });
                                                return;
                                            }
                                            adService.showRewardedAd(() => {
                                                setFocusHoursUsed(0);
                                                setEnergyRefills([...validRefills, Date.now()]);
                                                toast.success("Energy Refilled!", { description: "You've earned a fresh 100% focus for this month!", icon: "⚡" });
                                            });
                                        }}
                                    >
                                        {isRefillLimited ? "Cooldown (1/hr)" : "Refill Energy (Ads)"}
                                    </Button>
                                );
                            })()}
                    </div>
                    <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", energyPct > 80 ? "bg-rose-500" : "bg-rose-400")} style={{ width: `${energyPct}%` }} />
                    </div>
                    {burnout > 60 && <p className="text-[9px] text-rose-500 mt-1.5 font-bold animate-pulse">⚠️ High burnout — take a month off to restore health!</p>}
                </div>

                {/* Rest & Recharge - Month Goal */}
                <div className="mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Strategy</p>
                    <div onClick={() => setSelectedAction(selectedAction === "rest_and_recharge" ? "none" : "rest_and_recharge")}
                        className={cn("p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                            selectedAction === "rest_and_recharge" ? "bg-indigo-600 border-indigo-700 text-white shadow-lg scale-[1.02]" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-800")}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">😴</span>
                            <div>
                                <p className={cn("text-xs font-black uppercase tracking-tight", selectedAction === "rest_and_recharge" ? "text-white" : "text-slate-900")}>Rest & Recharge</p>
                                <p className={cn("text-[8px] font-bold uppercase tracking-widest", selectedAction === "rest_and_recharge" ? "text-indigo-100" : "text-slate-400")}>Dedicate this whole month to recovery</p>
                            </div>
                        </div>
                        <div className={cn("text-[9px] font-black px-2 py-1 rounded-full border",
                            selectedAction === "rest_and_recharge" ? "bg-white/20 border-white/40 text-white" : "bg-indigo-50 border-indigo-100 text-indigo-600")}>
                            {selectedAction === "rest_and_recharge" ? "SELECTED" : "CHOOSE"}
                        </div>
                    </div>
                    <p className="text-[7px] text-slate-400 mt-1.5 px-1 leading-tight">Resting restores massive Health, Sleep, and Burnout, but halts all company progress for the month.</p>
                </div>

                {/* Salary Input & Board Approval */}
                <div className="w-full mb-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Monthly Salary Draw</p>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 mb-3 shadow-inner">
                        <span className="text-xl font-black text-indigo-600 shrink-0">$</span>
                        <input
                            type="number"
                            value={salaryInput}
                            onChange={(e) => setSalaryInput(e.target.value)}
                            placeholder="0"
                            className="flex-1 min-w-0 text-2xl font-black text-slate-800 focus:outline-none bg-transparent tracking-tighter"
                        />
                        <span className="text-[10px] text-slate-400 font-bold uppercase italic shrink-0">/ mo</span>
                    </div>

                    <Button
                        onClick={() => {
                            const amount = parseInt(salaryInput || "0");
                            const proposal = evaluateSalaryProposal(startup, founder, amount);
                            setVotingMembers(getBoardMembers(startup));
                            setLastProposalResult(proposal);
                            setIsBoardModalOpen(true);

                            if (proposal.status === "approved") {
                                setStartup((s: any) => ({
                                    ...s,
                                    metrics: { ...s.metrics, founder_salary: amount }
                                }));
                                addTimelineEvent(`📜 Board approved salary draw: ${formatMoney(amount)}/mo`);
                                toast.success("Board approved your salary increase!");
                            } else {
                                toast.error("The Board rejected your salary proposal.");
                            }
                        }}
                        disabled={parseInt(salaryInput || "0") === startup.metrics.founder_salary}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        {parseInt(salaryInput || "0") === startup.metrics.founder_salary ? "Current Salary" : "Propose to Board"}
                    </Button>

                    <p className="text-[8px] text-slate-400 mt-3 text-center leading-relaxed">
                        Changes must be approved by the **Board of Directors** (Founders, CXOs, and Investors).
                    </p>
                </div>

                {/* Attributes */}
                <div className="mb-3 bg-white rounded-2xl border border-slate-100 p-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attributes</p>
                    <HBar label="Intelligence" v={attrs.intelligence} color="bg-indigo-500" />
                    <HBar label="Technical" v={attrs.technical_skill} color="bg-blue-500" />
                    <HBar label="Leadership" v={attrs.leadership} color="bg-violet-500" />
                    <HBar label="Networking" v={attrs.networking} color="bg-cyan-500" />
                    <HBar label="Marketing" v={attrs.marketing_skill} color="bg-pink-500" />
                    <HBar label="Reputation" v={attrs.reputation ?? 50} color="bg-amber-500" />
                    <div className="mt-2 pt-2 border-t border-slate-50 space-y-0.5">
                        <HBar label="Health" v={health} color={health < 40 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"} />
                        <HBar label="Burnout" v={burnout} color={burnout > 60 ? "bg-rose-500 animate-pulse" : "bg-amber-500"} />
                        <HBar label="Sleep" v={m.sleep_quality ?? 100} color={(m.sleep_quality ?? 100) < 40 ? "bg-rose-500 animate-pulse" : "bg-blue-400"} />
                    </div>
                </div>

                {/* Founder Net Worth Card */}
                <div className="mt-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <div className="flex-1 bg-indigo-600 rounded-2xl p-3 shadow-sm shadow-indigo-100">
                            <p className="text-[8px] font-black text-indigo-200 uppercase tracking-widest leading-none">Founder Wealth</p>
                            <p className="text-lg font-black text-white mt-1">
                                {formatMoney((founder.personal_wealth || 0) + (founder.assets || []).reduce((acc: number, a: any) => acc + a.currentValue, 0))}
                            </p>
                            <p className="text-[8px] text-indigo-200 mt-0.5 font-bold">Total Net Worth</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Liquid Cash</p>
                            <p className="text-sm font-black text-indigo-800 tracking-tighter mt-0.5">
                                {formatMoney(founder.personal_wealth || 0)}
                            </p>
                            <p className="text-[8px] text-indigo-400 mt-0.5">cash on hand</p>
                        </div>
                        <div className="flex-1 bg-violet-50 border border-violet-100 rounded-2xl p-3">
                            <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest">Paper Value</p>
                            <p className="text-sm font-black text-violet-800 tracking-tighter mt-0.5">
                                {formatMoney((startup.capTable?.find((e: any) => e.type === "Founder")?.equity ?? 100) / 100 * startup.valuation)}
                            </p>
                            <p className="text-[8px] text-violet-400 mt-0.5">equity stake</p>
                        </div>
                    </div>
                </div>

                {/* ★ ONGOING PROGRAMS FIRST — active ones highlighted */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">🔄 Active Programs</p>
                        {activeFounderPrograms.length > 0 && (
                            <span className="text-[8px] font-black bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{activeFounderPrograms.length} running</span>
                        )}
                    </div>

                    {/* Active programs — always visible */}
                    {activeFounderPrograms.map(prog => {
                        const ap = ongoingPrograms.find(p => p.id === prog.id);
                        const streak = ap?.streakMonths || 0;
                        const mult = getStreakMultiplier(prog, streak);
                        return (
                            <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-violet-300 bg-violet-50 cursor-pointer mb-2">
                                <span className="text-xl">{prog.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">{prog.label}</p>
                                    {renderOngoingProgramUI(prog, mult)}
                                </div>
                                {streak > 0 && <span className="text-[10px] font-black text-violet-600">🔥{streak}m ×{mult.toFixed(0)}</span>}
                                <div className="w-10 h-5 rounded-full relative bg-violet-500">
                                    <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white shadow" />
                                </div>
                            </div>
                        );
                    })}

                    {activeFounderPrograms.length === 0 && (
                        <div className="text-center py-3 rounded-2xl border-2 border-dashed border-slate-100 text-[10px] text-slate-300 font-bold">
                            No active programs — start one below
                        </div>
                    )}
                </div>

                {/* ★ COLLAPSIBLE ACTION GROUPS */}
                <div className="mb-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">⚡ One-Time Actions</p>
                    {ACTION_GROUPS.map(group => {
                        const groupActions = IMMEDIATE_ACTIONS.filter(a => a.category === group.category);
                        if (groupActions.length === 0) return null;
                        const isCollapsed = collapsedGroups[group.category] !== false; // default collapsed
                        const groupEmojis: Record<string, string> = { intelligence: "🧠", technical: "💻", leadership: "🏆", networking: "🔗", marketing_skill: "📢", health: "💪", burnout: "😴" };
                        return (
                            <div key={group.category} className="mb-2">
                                {/* Collapsible header button */}
                                <button
                                    onClick={() => toggleGroup(group.category)}
                                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 transition-all",
                                        !isCollapsed ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200")}
                                >
                                    <span className="text-base">{groupEmojis[group.category] || "📌"}</span>
                                    <span className={cn("flex-1 text-xs font-black uppercase tracking-wide text-left", !isCollapsed ? "text-indigo-700" : "text-slate-600")}>{group.label}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{groupActions.length} actions</span>
                                    <span className={cn("text-slate-400 text-xs transition-transform", !isCollapsed ? "rotate-90" : "")}>›</span>
                                </button>

                                {/* Expanded actions */}
                                {!isCollapsed && (
                                    <div className="space-y-1.5 mt-1.5 ml-1">
                                        {groupActions.map(action => {
                                            const usedCount = actionUsageLog.thisMonth[action.id] ?? 0;
                                            const isOver = (focusHoursUsed + action.energyCost) > maxHours;
                                            const uIdx = Math.min(usedCount, 4);

                                            const { scaledEffects } = calcDynamicImpact(action, actionUsageLog, {
                                                month: startup.history?.length || 0,
                                                startup,
                                                founder,
                                                m: startup.metrics
                                            });

                                            return (
                                                <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                                                    className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                                        isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50")}>
                                                    <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 truncate">{action.label}</p>
                                                        {(() => {
                                                            const effectsList = Object.entries(scaledEffects)
                                                                .map(([key, val]) => {
                                                                    if (!val || key === "cash") return null;
                                                                    const sign = val > 0 ? "+" : "";
                                                                    const label = key.replace(/_/g, " ")
                                                                        .replace("intelligence", "Int")
                                                                        .replace("technical skill", "Tech")
                                                                        .replace("leadership", "Lead")
                                                                        .replace("networking", "Net")
                                                                        .replace("marketing skill", "Mkt")
                                                                        .replace("founder burnout", "Burnout")
                                                                        .replace("founder health", "Health")
                                                                        .replace("product quality", "Qual")
                                                                        .replace("technical debt", "Debt")
                                                                        .replace("reliability", "Rel")
                                                                        .replace("brand awareness", "Brand");
                                                                    return `${sign}${val} ${label}`;
                                                                })
                                                                .filter(Boolean)
                                                                .join(" · ");

                                                            return (
                                                                <p className="text-[9px] text-slate-500 font-bold">
                                                                    {effectsList}
                                                                </p>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">⚡{action.energyCost}h</span>
                                                        {scaledEffects.technical_debt && scaledEffects.technical_debt < 0 && (
                                                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 shadow-sm flex items-center gap-0.5">⬇️ DEBT</span>
                                                        )}
                                                        {usedCount > 0 && <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-md border", usageColors[uIdx])}>{usageLabels[uIdx]}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Inactive ongoing programs at bottom */}
                {inactiveFounderPrograms.length > 0 && (
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">➕ Start a Program</p>
                        {inactiveFounderPrograms.map(prog => (
                            <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-100 bg-white cursor-pointer mb-2 hover:border-indigo-100 hover:bg-indigo-50/50">
                                <span className="text-xl">{prog.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700">{prog.label}</p>
                                    {renderOngoingProgramUI(prog, 1)}
                                </div>
                                <div className="w-10 h-5 rounded-full relative bg-slate-200">
                                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── MARKET ───────────────────────────────────────────────────────────────
    if (category === "market") {
        return (
            <div>
                {sheetHeader("⚔️", "Market & Rivals", "Track your competition")}
                <div className="space-y-3">
                    {competitors.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                            <span className="text-4xl">🌫️</span>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2">The market is quiet... for now.</p>
                        </div>
                    )}
                    {competitors.map(comp => {
                        const isActive = comp.status === "active";
                        const isIPO = comp.status === "ipo";
                        const isFailed = comp.status === "failed";
                        return (
                            <div key={comp.id} className={cn(
                                "p-3 rounded-2xl border-2 transition-all",
                                isActive ? "bg-white border-slate-100 shadow-sm" :
                                    isIPO ? "bg-indigo-50 border-indigo-200" :
                                        "bg-slate-50 border-slate-100 opacity-60"
                            )}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {comp.id === 'chadly' ? (
                                            <div className="w-9 h-9 rounded-full border-2 border-indigo-400 overflow-hidden bg-indigo-100 shadow-sm flex-shrink-0">
                                                <img src="/characters/chad_rival.png" alt="Chad" className="object-cover w-full h-full" />
                                            </div>
                                        ) : (
                                            <span className="text-lg">{isFailed ? "💀" : isIPO ? "🚀" : "🏢"}</span>
                                        )}
                                        <div>
                                            <p className="text-xs font-black text-slate-800">{comp.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">{comp.industry}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                                        isActive ? "bg-emerald-100 text-emerald-700" :
                                            isIPO ? "bg-indigo-600 text-white" :
                                                "bg-rose-100 text-rose-700"
                                    )}>
                                        {comp.status}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                        <p className="text-[7px] font-black text-slate-400 uppercase">Valuation</p>
                                        <p className="text-xs font-black text-slate-700">{formatMoney(comp.valuation)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                        <p className="text-[7px] font-black text-slate-400 uppercase">Users</p>
                                        <p className="text-xs font-black text-slate-700">{comp.users.toLocaleString()}</p>
                                    </div>
                                </div>
                                {comp.last_action && (
                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                        <p className="text-[8px] font-bold text-slate-500 italic">
                                            Last Move: <span className="text-indigo-600">{(comp.last_action as string).replace(/_/g, " ")}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── LIFESTYLE ────────────────────────────────────────────────────────────
    if (category === "lifestyle") {
        return (
            <div>
                {sheetHeader("💎", "Personal Lifestyle", "Spend your personal wealth")}

                <div className="bg-indigo-600 rounded-3xl p-4 mb-6 shadow-lg shadow-indigo-100">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none">Liquid Cash</p>
                    <p className="text-2xl font-black text-white mt-1">{formatMoney(founder.personal_wealth)}</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <SH>Active Lifestyle</SH>
                        <div className="space-y-2">
                            {LIFESTYLE_TOGGLES.map(tg => {
                                const isActive = (founder.activeToggles || []).includes(tg.id);
                                return (
                                    <div key={tg.id} onClick={() => handleToggleLifestyle(tg.id)}
                                        className={cn(
                                            "p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between",
                                            isActive ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100"
                                        )}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tg.emoji}</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{tg.name}</p>
                                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                                                        {formatMoney(tg.monthlyCost)}/mo
                                                    </p>
                                                    {Object.entries(tg.impact).map(([key, val]) => {
                                                        const isPositive = key === 'burnout' ? val < 0 : val > 0;
                                                        return (
                                                            <span key={key} className={cn("text-[9px] font-black uppercase tracking-tighter", isPositive ? "text-emerald-500" : "text-rose-500")}>
                                                                {val > 0 ? "+" : ""}{val} {key === 'reputation' ? 'REP' : key === 'burnout' ? 'BURN' : key.toUpperCase()}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={isActive ? "text-indigo-600" : "text-slate-300"}>
                                            {isActive ? <div className="bg-indigo-600 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-100" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <SH>Your Luxury Assets</SH>
                        <div className="grid grid-cols-2 gap-3">
                            {(founder.assets || []).map((asset: LuxuryAsset) => {
                                const change = ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100;
                                const isUp = change >= 0;
                                return (
                                    <div key={asset.id} className="p-3 rounded-2xl border-2 border-slate-100 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-2xl">{asset.emoji}</span>
                                            <div className={cn(
                                                "px-1.5 py-0.5 rounded-lg text-[8px] font-black",
                                                isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {isUp ? "+" : ""}{change.toFixed(1)}%
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-800 truncate">{asset.name}</p>
                                        <p className="text-[12px] font-black text-slate-900 mt-1">{formatMoney(asset.currentValue)}</p>
                                    </div>
                                );
                            })}
                            {(founder.assets || []).length === 0 && (
                                <div className="col-span-2 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-center opacity-40">
                                    <p className="text-[10px] font-black uppercase tracking-widest">No assets yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <SH>Luxury Catalog</SH>
                        <div className="space-y-3">
                            {LUXURY_ASSETS.map((asset, idx) => {
                                // Price generation for demo if not fixed
                                const basePrice =
                                    asset.type === "Watch" ? 15000 :
                                        asset.type === "Car" ? 120000 :
                                            asset.type === "Property" ? 2500000 :
                                                asset.type === "Jet" ? 15000000 : 3500000;

                                const price = basePrice * (1 + (idx * 0.2)); // Some variety

                                return (
                                    <div key={idx} className="p-3 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{asset.emoji}</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{asset.name}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                    <p className="text-[10px] font-bold text-indigo-600">{formatMoney(price)}</p>
                                                    {asset.impact && Object.entries(asset.impact).map(([key, val]) => (
                                                        <span key={key} className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                                                            +{val} {key === 'reputation' ? 'REP' : key === 'networking' ? 'NET' : 'LDR'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePurchaseAsset(asset, price)}
                                            disabled={(founder.personal_wealth || 0) < price}
                                            className="px-3 py-1.5 bg-indigo-600 disabled:bg-slate-200 text-white rounded-xl text-[10px] font-black uppercase"
                                        >
                                            Buy
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const router = useRouter();
    const [startup, setStartup] = useState<Startup>(STARTUP_BASE as unknown as Startup);
    const [founder, setFounder] = useState<Founder>(FOUNDER_BASE as unknown as Founder);
    const [month, setMonth] = useState(1);
    const [eventsTimeline, setEventsTimeline] = useState<{ month: number; text: string }[]>([]);
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
    const [isSamModalOpen, setIsSamModalOpen] = useState(false);
    const [samAdvice, setSamAdvice] = useState<AdviceContent | null>(null);

    // --- LIVE COUNTDOWN TIMER ---
    const [currentTime, setCurrentTime] = useState(Date.now());
    useEffect(() => {
        const i = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(i);
    }, []);
    const [hasSeenIntro, setHasSeenIntro] = useState(false);
    const [samConsults, setSamConsults] = useState<number[]>([]);
    const [cashGrants, setCashGrants] = useState<number[]>([]); // Cash Grant rate limits
    const [energyRefills, setEnergyRefills] = useState<number[]>([]); // Energy Refill rate limits
    const [isChadModalOpen, setIsChadModalOpen] = useState(false);
    const [chadAdvice, setChadAdvice] = useState<{ title: string; message: string; buttonText: string } | null>(null);
    const [selectedAction, setSelectedAction] = useState<StartupAction>("none");
    const [isProcessing, setIsProcessing] = useState(false);
    const [endgameStory, setEndgameStory] = useState<string | null>(null);
    const [isEndgameOpen, setIsEndgameOpen] = useState(false);
    const [isFocusBreakdownOpen, setIsFocusBreakdownOpen] = useState(false);
    const [dismissedEndgame, setDismissedEndgame] = useState(false);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [actionCategory, setActionCategory] = useState<SheetCategory | null>(null);
    const [monthSummary, setMonthSummary] = useState<any | null>(null);
    const [pendingCandidate, setPendingCandidate] = useState<Candidate | null>(null);
    const [rejectedCandidates, setRejectedCandidates] = useState<string[]>([]);
    const [hiringOffer, setHiringOffer] = useState({ salary: 0, equity: 0 });
    const [isMilestoneExpanded, setIsMilestoneExpanded] = useState(false);
    const [pendingInvestor, setPendingInvestor] = useState<Investor | null>(null);
    const [fundingOffer, setFundingOffer] = useState({ valuation: 0, equity: 0 });
    const [pendingCounterOffer, setPendingCounterOffer] = useState<{ valuation: number; equity: number } | null>(null);
    const [confirmedFunding, setConfirmedFunding] = useState<{ valuation: number; equity: number } | null>(null);
    const [confirmedHire, setConfirmedHire] = useState<Candidate | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        type?: "delete" | "fire" | "exit" | "warning" | "offline" | "premium";
    }>({ open: false, title: "", description: "", onConfirm: () => { } });
    const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => !isAudioMuted());

    const [isPremium, setIsPremium] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("founder_sim_premium") === "true";
        }
        return false;
    });
    const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);

    useEffect(() => {
        iapService.initialize().then(() => {
            iapService.checkPremiumStatus().then(premium => {
                if (premium) setIsPremium(true);
            });
        });
    }, []);

    const allEmployees = useMemo(() => {
        const baseEmployees = startup.employees || [];
        const cxoConfig = [
            { role: "CTO", name: "CTO (Executive)", salary: 18000 },
            { role: "CMO", name: "CMO (Executive)", salary: 15000 },
            { role: "COO", name: "COO (Executive)", salary: 16000 },
            { role: "CFO", name: "CFO (Executive)", salary: 14000 },
            { role: "CPO", name: "CPO (Executive)", salary: 15000 },
            { role: "EA", name: "Executive Assistant", salary: 8000 },
        ];
        const activeCxos = cxoConfig.filter(cxo => (startup as any).cxoTeam?.[cxo.role]);
        const synthesizedCxos = activeCxos.filter(cxo => !baseEmployees.some(e => e.id === `cxo_${cxo.role.toLowerCase()}`)).map(cxo => ({
            id: `cxo_${cxo.role.toLowerCase()}`,
            name: cxo.name,
            role: cxo.role.toLowerCase(),
            salary: cxo.salary * 12,
            performance: 95,
            skills: { technical: 85, marketing: 85, sales: 85 },
            isCXO: true,
            morale: 95,
            joined_at: 1
        }));
        return [...baseEmployees, ...synthesizedCxos];
    }, [startup.employees, (startup as any).cxoTeam]);

    const getDisplayRoleName = (role: string, plural: boolean = false) => {
        if (role !== "sales") return plural ? role + "s" : role;
        const configRef = INDUSTRY_PRICING_CONFIG[startup.industry] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
        const salesName = (startup.gtm_motion === "PLG" ? configRef.PLG : configRef.SLG).salesRoleName;
        if (!plural) return salesName;
        if (salesName.endsWith("Sales") || salesName.endsWith("Growth") || salesName.endsWith("Success") || salesName.endsWith("Advocate") || salesName.endsWith("Analyst") || salesName.endsWith(" Partnership")) {
            if (salesName.endsWith("Sales") || salesName.endsWith("Growth") || salesName.endsWith("Success")) return salesName;
            if (salesName.endsWith("Partnership")) return salesName.replace("Partnership", "Partnerships");
            return salesName + "s";
        }
        return salesName + "s";
    };
    const [investorMessage, setInvestorMessage] = useState<string | null>(null);
    useEffect(() => {
        if (!pendingInvestor) {
            setPendingCounterOffer(null);
            setInvestorMessage(null);
        }
    }, [pendingInvestor]);
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [teamDeptFilter, setTeamDeptFilter] = useState<string>("cxo");
    const [selectedEmpIdx, setSelectedEmpIdx] = useState(0);
    const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

    // --- CONNECTIVITY MONITOR ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => {
            setIsOnline(false);
            setConfirmDialog({
                open: true,
                title: "📶 Signal Lost!",
                description: "You've drifted into a Wi-Fi dead zone! The server basement is dark and cold. AI Mentor Sam is unreachable, and those Emergency Grants are stuck in the pipes until you find a signal.",
                confirmText: "STAY CALM",
                type: "offline",
                onConfirm: () => { }
            });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Global Interaction Sound Effects Listener
    useEffect(() => {
        const handleGlobalInteraction = (e: PointerEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("button") || target.closest("[role='menuitem']") || target.closest(".cursor-pointer")) {
                playSound("click");
            }
        };
        document.addEventListener("pointerdown", handleGlobalInteraction, { capture: true });
        return () => document.removeEventListener("pointerdown", handleGlobalInteraction, { capture: true });
    }, []);
    const handlePurchaseAsset = (asset: Omit<LuxuryAsset, "id" | "purchasePrice" | "currentValue">, price: number) => {
        if (founder.personal_wealth < price) {
            toast.error("Insufficient Personal Wealth", { description: "You need more cash in your personal bank account." });
            return;
        }

        const newAsset: LuxuryAsset = {
            ...asset,
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            purchasePrice: price,
            currentValue: price,
            depreciationRate: asset.depreciationRate || 0
        };

        setFounder(prev => {
            const nextAttrs = { ...prev.attributes };
            if (asset.impact) {
                if (asset.impact.reputation) nextAttrs.reputation = Math.min(100, (nextAttrs.reputation || 0) + asset.impact.reputation);
                if (asset.impact.networking) nextAttrs.networking = Math.min(100, (nextAttrs.networking || 0) + asset.impact.networking);
                if (asset.impact.leadership) nextAttrs.leadership = Math.min(100, (nextAttrs.leadership || 0) + asset.impact.leadership);
            }

            return {
                ...prev,
                personal_wealth: (prev.personal_wealth || 0) - price,
                attributes: nextAttrs,
                assets: [...(prev.assets || []), newAsset]
            };
        });

        addTimelineEvent(`💎 Purchased ${asset.name} for ${formatMoney(price)}`);
        toast.success(`Success! You now own a ${asset.name}. Stats boosted!`, { icon: asset.emoji });
    };

    const handleToggleLifestyle = (id: string) => {
        setFounder(prev => {
            const isClosing = (prev.activeToggles || []).includes(id);
            const nextToggles = isClosing
                ? (prev.activeToggles || []).filter(tid => tid !== id)
                : [...(prev.activeToggles || []), id];

            const service = LIFESTYLE_TOGGLES.find(t => t.id === id);
            if (service) {
                if (!isClosing) {
                    toast.success(`${service.name} Activated`, { description: `Cost: ${formatMoney(service.monthlyCost)}/mo`, icon: service.emoji });
                } else {
                    toast.info(`${service.name} Deactivated`);
                }
            }

            return {
                ...prev,
                activeToggles: nextToggles
            };
        });
    };
    const [financialTab, setFinancialTab] = useState<"summary" | "pnl" | "captable">("summary");
    const [founderMeta, setFounderMeta] = useState({ logo: "⚡", brandColor: "#a855f7" });
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [availableSaves, setAvailableSaves] = useState<SaveSlot[]>([]);

    useEffect(() => {
        // Fullscreen for mobile + detect iOS
        const enableFullscreen = async () => {
            const { Capacitor } = await import('@capacitor/core');
            const platform = Capacitor.getPlatform();
            if (platform === 'ios') setIsIOS(true);
            if (Capacitor.isNativePlatform()) {
                const { StatusBar } = await import('@capacitor/status-bar');
                try {
                    await StatusBar.hide();
                } catch (e) {
                    console.warn("StatusBar hide failed", e);
                }
            }
        };
        enableFullscreen();

        // AdMob Initialization (Serves mock on web)
        const initAds = async () => {
            try {
                await adService.initialize();
                if (!isPremium) {
                    await adService.showBanner();
                    await adService.prepareInterstitial();
                } else {
                    await adService.hideBanner();
                }
            } catch (e) {
                console.error("AdMob initialization failed", e);
            }
        };
        initAds();

        return () => {
            adService.hideBanner();
        };
    }, []);

    // Watch for premium changes to hide ads immediately
    useEffect(() => {
        if (isPremium) {
            adService.hideBanner();
        } else if (isLoaded) {
            adService.showBanner();
        }
    }, [isPremium, isLoaded]);
    const [saveConfirmOverwrite, setSaveConfirmOverwrite] = useState<string | null>(null);


    // Action Engine State
    const [actionUsageLog, setActionUsageLog] = useState<ActionUsageLog>({ thisMonth: {}, lastUsedMonth: {} });
    const [ongoingPrograms, setOngoingPrograms] = useState<ActiveProgram[]>([]);
    const [focusHoursUsed, setFocusHoursUsed] = useState(0);
    const [immediateActionFeedback, setImmediateActionFeedback] = useState<{ text: string; color: string } | null>(null);

    // Board & Salary Proposal State
    const [salaryInput, setSalaryInput] = useState<string>(startup.metrics.founder_salary?.toString() || "0");
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [lastProposalResult, setLastProposalResult] = useState<any>(null);
    const [votingMembers, setVotingMembers] = useState<any[]>([]);

    // Load state
    useEffect(() => {
        const premium = localStorage.getItem("founder_sim_premium") === "true";
        setIsPremium(premium);

        const fullState = localStorage.getItem("founder_sim_state");
        if (fullState) {
            try {
                const d = JSON.parse(fullState);
                if (d.startup) {
                    // Retroactive sync for SLG: ensure closed_won matches users if it is 0
                    if (d.startup.gtm_motion === "SLG" && d.startup.metrics?.b2b_pipeline) {
                        if ((d.startup.metrics.b2b_pipeline.closed_won || 0) === 0 && d.startup.metrics.users > 0) {
                            d.startup.metrics.b2b_pipeline.closed_won = d.startup.metrics.users;
                        }
                    }
                    setStartup({
                        ...d.startup,
                        pricing_tier: d.startup.pricing_tier || "starter",
                        active_marketing_channel: d.startup.active_marketing_channel || "organic",
                        pmf_score: d.startup.pmf_score || 10,
                        culture_score: d.startup.culture_score || 60,
                        capTable: d.startup.capTable || [{ name: "Founder", equity: 100, type: "Founder" }],
                        metrics: {
                            ...d.startup.metrics,
                            pricing: d.startup.metrics.pricing ?? 19,
                            unit_sales: d.startup.metrics.unit_sales || 0,
                            founder_burnout: d.startup.metrics.founder_burnout || 0,
                            founder_health: d.startup.metrics.founder_health ?? 100,
                            sleep_quality: d.startup.metrics.sleep_quality ?? 100,
                            founder_salary: d.startup.metrics.founder_salary ?? 0,
                        },
                        employees: d.startup.employees || [],
                    });
                }
                if (d.founder) setFounder({
                    ...d.founder,
                    personal_wealth: d.founder.personal_wealth || 0,
                    assets: d.founder.assets || [],
                    activeToggles: d.founder.activeToggles || [],
                });
                if (d.startup && d.startup.metrics) setSalaryInput(d.startup.metrics.founder_salary?.toString() || "0");
                if (d.month) setMonth(d.month);
                if (d.eventsTimeline) setEventsTimeline(d.eventsTimeline);
                if (d.focusHoursUsed !== undefined) setFocusHoursUsed(d.focusHoursUsed);
                if (d.actionUsageLog) setActionUsageLog(d.actionUsageLog);
                if (d.competitors) setCompetitors(d.competitors);
                if (d.unlockedAchievements) setUnlockedAchievements(d.unlockedAchievements);
                if (d.seenEventIds) setSeenEventIds(d.seenEventIds);
                if (d.ongoingPrograms) {
                    setOngoingPrograms(d.ongoingPrograms);
                    // Prioritize persisted hours, fallback to recalculation from programs
                    if (d.focusHoursUsed !== undefined) {
                        setFocusHoursUsed(d.focusHoursUsed);
                    } else {
                        const committedEnergy = ongoingProgramsTotalEnergy(d.ongoingPrograms);
                        setFocusHoursUsed(committedEnergy);
                    }
                }
                if (d.founderMeta) setFounderMeta(d.founderMeta);

                // If loading into a dead/won state, immediately force the endgame modal open
                if (d.startup && d.startup.outcome && d.startup.outcome !== "active") {
                    setIsEndgameOpen(true);
                    setDismissedEndgame(false);
                }
                setIsLoaded(true);
            } catch (e) {
                console.error("Failed to load game state", e);
                setIsLoaded(true);
            }
        } else {
            setIsLoaded(true);
            const onboardingData = localStorage.getItem("founder_data");
            if (onboardingData) {
                try {
                    const d = JSON.parse(onboardingData);
                    const isSLG = d.gtmMotion === "SLG";
                    const isPLG = d.gtmMotion === "PLG";
                    const scenarioId = d.scenario || "classic";
                    const scenario = SCENARIOS[scenarioId as ScenarioId] || SCENARIOS.classic;
                    const mods = scenario.startingModifiers || {};

                    const initialLeads = isSLG ? (d.background === "Engineer" ? 2 : d.background === "Hustler" || d.background === "MBA" ? 8 : 4) : 0;

                    const perks = d.perks || [];

                    setFounder(f => {
                        let newAttrs = {
                            ...f.attributes,
                            sales_skill: isSLG ? f.attributes.sales_skill + 15 : f.attributes.sales_skill,
                        };

                        // Apply Perks to attributes
                        if (perks.includes("charismatic_leader")) {
                            newAttrs.leadership = (newAttrs.leadership || 50) + 15;
                        }
                        if (perks.includes("technical_prodigy")) {
                            newAttrs.technical_skill = (newAttrs.technical_skill || 50) + 20;
                            newAttrs.intelligence = (newAttrs.intelligence || 50) + 20;
                        }

                        return {
                            ...f,
                            name: d.name,
                            background: d.background,
                            attributes: newAttrs
                        };
                    });

                    setStartup(s => {
                        let baseCash = mods.cash ?? (isSLG ? 75000 : s.metrics.cash);
                        if (perks.includes("rich_founder")) {
                            baseCash += 100000;
                        }

                        let baseMorale = s.metrics.team_morale;
                        if (perks.includes("charismatic_leader")) {
                            baseMorale += 15;
                        }

                        return {
                            ...s,
                            name: d.startupName || d.name,
                            industry: d.industry,
                            gtm_motion: d.gtmMotion || "PLG",
                            scenario: scenarioId,
                            unlocked_perks: perks,
                            metrics: {
                                ...s.metrics,
                                cash: baseCash,
                                team_morale: baseMorale,
                                users: mods.users ?? s.metrics.users,
                                technical_debt: mods.tech_debt ?? s.metrics.technical_debt,
                                innovation: mods.innovation ?? s.metrics.innovation,
                                pmf_score: mods.pmf ?? s.metrics.pmf_score,
                                pricing: isSLG ? 250 : 29,
                                b2b_pipeline: isSLG ? { leads: initialLeads, active_deals: 1, closed_won: s.metrics.users } : s.metrics.b2b_pipeline,
                                sleep_quality: 100,
                                founder_salary: 0,
                            }
                        };
                    });

                    setFounderMeta({ logo: d.logo || "⚡", brandColor: d.brandColor || "#a855f7" });
                    setEventsTimeline([{ month: 1, text: `Founded ${d.startupName || d.name} as a ${d.background} in ${d.industry}. Scenario: ${scenario.label}. GTM: ${d.gtmMotion === 'PLG' ? 'Product-Led Growth' : 'Sales-Led Growth'}.` }]);
                } catch (e) { }
            } else {
                setEventsTimeline([{ month: 1, text: "Startup founded! Focus on building an MVP." }]);
            }
            // Also try loading logo/color if available
            try {
                const d = JSON.parse(localStorage.getItem("founder_data") || "{}");
                if (d.logo) setFounderMeta({ logo: d.logo, brandColor: d.brandColor || "#6366f1" });
            } catch { }
            setCompetitors(generateInitialCompetitors(3));
        }
    }, []);

    // --- SAM INTRO MENTOR SETUP (AUTO-TRIGGER) ---
    useEffect(() => {
        if (isLoaded && month === 1 && startup.id && (!startup.history || startup.history.length === 0) && !isSamModalOpen) {
            const intro = getEducationalAdvice(startup, founder);
            if (intro && !seenEventIds.includes(intro.trigger)) {
                setSamAdvice(intro);
                setIsSamModalOpen(true);
                setSeenEventIds(prev => [...prev, intro.trigger]);
            }
        }
    }, [isLoaded, month, startup, founder, isSamModalOpen, seenEventIds]);

    // Autosave - Trigger on any significant game state change
    useEffect(() => {
        if (startup.name !== "New Startup" && isLoaded) {
            localStorage.setItem("founder_sim_state", JSON.stringify({
                startup,
                founder,
                month,
                eventsTimeline,
                competitors,
                unlockedAchievements,
                ongoingPrograms,
                seenEventIds,
                founderMeta,
                focusHoursUsed,
                actionUsageLog
            }));
        }
    }, [month, startup, founder, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds, founderMeta, focusHoursUsed, isLoaded]);

    const handleResetGame = () => {
        setConfirmDialog({
            open: true,
            title: "Reset Progress?",
            description: "This will permanently delete your current startup and founder data. This cannot be undone.",
            confirmText: "RESET EVERYTHING",
            type: "delete",
            onConfirm: () => {
                localStorage.removeItem("founder_sim_state");
                localStorage.removeItem("founder_data");
                router.push("/");
            }
        });
    };

    const handleRateAndClaim = () => {
        if (!startup.hasRateRewardClaimed) {
            setStartup(prev => ({
                ...prev,
                hasRateRewardClaimed: true,
                metrics: {
                    ...prev.metrics,
                    cash: prev.metrics.cash + 50000,
                    pmf_score: Math.min(100, (prev.metrics.pmf_score || 0) + 5)
                }
            }));

            // Focus Boost: Give back 50 hours of focus
            const newFocusUsed = Math.max(0, focusHoursUsed - 50);
            setFocusHoursUsed(newFocusUsed);

            toast.success("Support Applied!", { 
                description: "Gained $50k Cash, +50h focus refill, and +5 PMF for supporting the devs!" 
            });
            playSound("success");
            
            // Record to persistent storage immediately
            const updatedStartup = { ...startup, hasRateRewardClaimed: true };
            localStorage.setItem("founder_sim_state", JSON.stringify({ 
                startup: updatedStartup, 
                founder, 
                month, 
                eventsTimeline, 
                competitors, 
                unlockedAchievements, 
                ongoingPrograms, 
                seenEventIds, 
                founderMeta, 
                focusHoursUsed: newFocusUsed, 
                actionUsageLog 
            }));
        }
        openStoreListing();
    };

    const addTimelineEvent = (text: string, monthOverride?: number) => {
        setEventsTimeline(prev => [...prev, { month: monthOverride ?? month, text }]);
    };

    const handleSaveAndQuit = () => {
        if (startup.name !== "New Startup") {
            localStorage.setItem("founder_sim_state", JSON.stringify({ startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds, founderMeta, focusHoursUsed, actionUsageLog }));
        }
        router.push("/");
    };

    const handleOpenSaveModal = () => {
        try {
            const raw = JSON.parse(localStorage.getItem("founder_sim_saves") || "[]") as SaveSlot[];
            setAvailableSaves(raw.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch { setAvailableSaves([]); }
        setIsSaveModalOpen(true);
    };

    const handleDeleteSave = (id: string) => {
        const updated = availableSaves.filter(s => s.id !== id);
        localStorage.setItem("founder_sim_saves", JSON.stringify(updated));
        setAvailableSaves(updated);
    };

    const handleSaveGame = (slotIdToOverwrite?: string) => {
        const timestamp = new Date().toISOString();
        const newSave: SaveSlot = {
            id: slotIdToOverwrite || `save_${Date.now()}`,
            date: timestamp,
            companyName: startup.name || "Unknown Startup",
            stage: startup.funding_stage || "Bootstrapping",
            valuation: startup.valuation || 0,
            brandColor: founderMeta.brandColor,
            logo: founderMeta.logo,
            data: { startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds, founderMeta, focusHoursUsed, actionUsageLog }
        };

        const existingSavesRaw = localStorage.getItem("founder_sim_saves");
        const existingSaves: SaveSlot[] = existingSavesRaw ? JSON.parse(existingSavesRaw) : [];
        let updatedSaves;

        if (slotIdToOverwrite) {
            updatedSaves = existingSaves.map(s => s.id === slotIdToOverwrite ? newSave : s);
        } else {
            updatedSaves = [...existingSaves, newSave];
        }

        // Enforce max slots
        if (updatedSaves.length > MAX_SLOTS) {
            updatedSaves = updatedSaves.slice(0, MAX_SLOTS);
        }

        localStorage.setItem("founder_sim_saves", JSON.stringify(updatedSaves));
        setAvailableSaves(updatedSaves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast.success("Game Saved!", { description: `${newSave.companyName} at Month ${month}` });
        setSaveConfirmOverwrite(null);
        setIsSaveModalOpen(false);
    };

    // ── Immediate Action Handler ───────────────────────────────────────────────
    const handleImmediateAction = (actionId: string) => {
        const def = getActionDef(actionId);
        if (!def) return;
        const ctx: GameContext = { month, startup, founder, m: startup.metrics };
        const { scaledEffects, multiplier, hints } = calcDynamicImpact(def, actionUsageLog, ctx);
        const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);
        const newHoursUsed = focusHoursUsed + def.energyCost;
        
        if (newHoursUsed > maxHours) {
            toast.error("Not enough focus energy!", { description: "You cannot exceed maximum focus hours." });
            return;
        }
        const { startup: ns, founder: nf } = applyEffectsToState(scaledEffects, startup, founder);
        if (newHoursUsed > maxHours) {
            ns.metrics.founder_burnout = Math.min(100, (ns.metrics.founder_burnout || 0) + (newHoursUsed - maxHours) * 0.3);
        }
        setStartup(ns); setFounder(nf); setFocusHoursUsed(newHoursUsed);
        setActionUsageLog(prev => ({
            thisMonth: { ...prev.thisMonth, [actionId]: (prev.thisMonth[actionId] ?? 0) + 1 },
            lastUsedMonth: { ...prev.lastUsedMonth, [actionId]: month },
        }));
        const multPct = Math.round(multiplier * 100);
        const hint = hints[0] || "";
        const parts = Object.entries(scaledEffects).filter(([, v]) => v && v !== 0).slice(0, 2)
            .map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k.replace(/_/g, ' ')}`).join(' · ');
        const feedbackText = `${def.emoji} ${def.label}  ·  ${parts}${hint ? `  ·  ${hint}` : ''}`;
        setImmediateActionFeedback({ text: feedbackText, color: multiplier >= 1 ? '#16a34a' : multiplier >= 0.5 ? '#d97706' : '#dc2626' });
        addTimelineEvent(`${def.emoji} ${def.label}: ${def.description}. Result: ${parts}`);
        setTimeout(() => setImmediateActionFeedback(null), 3000);
    };

    // ── Ongoing Program Toggle ─────────────────────────────────────────────────
    const handleToggleOngoingProgram = (id: string) => {
        const isActive = ongoingPrograms.some(p => p.id === id);
        const def = getOngoingProgramDef(id);
        if (!def) return;

        if (isActive) {
            setOngoingPrograms(prev => stopProgram(prev, id));
            setFocusHoursUsed(prev => Math.max(0, prev - (def.monthlyEnergy || 0)));
            toast.info(`Stopped: ${def.label}`, { description: "Focus hours released." });
        } else {
            const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);
            const energyToCommit = def.monthlyEnergy || 0;

            if (focusHoursUsed + energyToCommit > maxHours) {
                toast.error("Not enough focus energy!", { description: "You cannot exceed your maximum focus hours." });
                return;
            }

            setOngoingPrograms(prev => startProgram(prev, id, month));
            setFocusHoursUsed(prev => prev + energyToCommit);
            toast.success(`Started: ${def.label}`, { description: "Commitment added to your monthly focus." });
        }
    };

    // ── Hiring ────────────────────────────────────────────────────────────────
    const handleActionClick = (action: StartupAction, forcedCandidate?: Candidate) => {
        if (action.startsWith("hire_")) {
            const role = action.split("_")[1];
            const candidate = forcedCandidate || generateCandidate(role, startup.funding_stage);
            setPendingCandidate(candidate);
            // Initialize with expectation, but clamp to pool if needed (or just start at 0 if no pool)
            const initialEquity = Math.min(startup.metrics.option_pool || 0, candidate.expectedEquity);
            setHiringOffer({ salary: candidate.expectedSalary, equity: initialEquity });
        } else if (action === "pitch_investors") {
            const nextStage = getNextFundingStage(startup.funding_stage);
            if (!nextStage) { toast.error("Maximum funding reached!"); return; }

            const fundCost = 40;
            const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);
            if (focusHoursUsed + fundCost > maxHours * 1.1) {
                toast.error("Not enough energy!", { description: "You need 40 focus hours to prep the deck and pitch." });
                return;
            }

            // Dynamic Lead Calculation
            const baseLeads = 5;
            const networkingBonus = (founder.attributes.networking || 50) / 10;
            const reputationBonus = (founder.attributes.reputation || 50) / 20;
            const marketingBonus = (founder.attributes.marketing_skill || 50) / 25;
            const innovationValue = startup.metrics.innovation || 0;
            const innovationBonus = Math.min(10, innovationValue / 10);

            const timesThisMonth = actionUsageLog.thisMonth["pitch_investors"] || 0;
            const diminish = Math.pow(0.7, timesThisMonth);

            const newLeads = Math.max(1, Math.floor((baseLeads + networkingBonus + reputationBonus + marketingBonus + innovationBonus) * diminish));

            setFocusHoursUsed(prev => prev + fundCost);
            setStartup((s: any) => ({
                ...s,
                metrics: {
                    ...s.metrics,
                    innovation: Math.max(0, (s.metrics.innovation || 0) - 10),
                    investor_pipeline: {
                        ...(s.metrics.investor_pipeline || { leads: 0, meetings: 0, term_sheets: 0 }),
                        leads: (s.metrics.investor_pipeline?.leads || 0) + newLeads
                    }
                }
            }));

            setActionUsageLog(prev => ({
                ...prev,
                thisMonth: { ...prev.thisMonth, pitch_investors: (prev.thisMonth.pitch_investors || 0) + 1 }
            }));

            toast.success("Pitching Started!", { 
                description: `Added ${newLeads} leads to your pipeline. (Based on Networking, Rep, and Innovation)`,
                duration: 5000 
            });
        } else if (action === "negotiate_round") {
            const nextStage = getNextFundingStage(startup.funding_stage);
            if (!nextStage) { toast.error("Maximum funding reached!"); return; }

            const investor = generateInvestor(startup.funding_stage);
            const mktTerms = generateFundingTerms(startup, nextStage);

            setPendingInvestor(investor);
            setFundingOffer({ valuation: mktTerms.valuation, equity: mktTerms.equityGiven });
            setInvestorMessage(null);
            setPendingCounterOffer(null);

        } else {
            setSelectedAction(action);
        }
    };

    const handleAllocateESOP = () => {
        const amount = 10;
        setStartup(s => {
            const currentPool = (s.metrics.option_pool || 0);
            const currentCapSum = (s.capTable || []).reduce((sum: number, e: any) => sum + e.equity, 0);

            // Dilute existing shareholders to make room for 10% more in the pool
            // Factor = (100 - (currentPool + amount)) / (100 - currentPool)
            const dilutionFactor = (100 - currentPool - amount) / (100 - currentPool);

            const newCap = (s.capTable || [{ name: "Founder", equity: 100, type: "Founder" }]).map((e: any) => ({
                ...e,
                equity: parseFloat((e.equity * dilutionFactor).toFixed(1))
            }));

            return {
                ...s,
                capTable: newCap,
                metrics: {
                    ...s.metrics,
                    option_pool: currentPool + amount
                }
            };
        });
        addTimelineEvent(`📈 Expanded Employee Option Pool by ${amount}%. All shareholders diluted.`);
        toast.success(`Option Pool Expanded!`, { description: `Added ${amount}% to pool.` });
    };

        const handleHiringConfirm = () => {
            if (!pendingCandidate) return;

            // Energy check so they don't go into negative hours
            // Energy check: hiring is intense, can't be done if already burned out
            if (focusHoursUsed + 10 > maxHours * 1.1) {
                toast.error("Not enough focus energy!", { description: "You are too burned out to manage new hires. Advance to next month to refill energy." });
                return;
            }

            const cohortSize = 1;
            const totalEquity = hiringOffer.equity * cohortSize;
            const poolAvailable = startup.metrics.option_pool || 0;
            // Epsilon check: if they offer effectively 0%, don't block them
            if (totalEquity > 0.001 && poolAvailable < totalEquity) {
                toast.error("Insufficient Option Pool!", { description: `You need ${totalEquity.toFixed(3)}% but only have ${poolAvailable.toFixed(3)}%` });
                return;
            }

            const result = calculateHiringSuccess(pendingCandidate, hiringOffer, startup, founder);
            if (result.success) {
                toast.success("Hired!", { description: result.reason });
                const skillBase = pendingCandidate.level === "Lead" ? 90 : pendingCandidate.level === "Senior" ? 75 : pendingCandidate.level === "Mid" ? 55 : 35;
                const skillRandom = () => skillBase + Math.floor(Math.random() * 10);

                const newEmployees = [{
                    id: `emp_${Date.now()}`,
                    name: pendingCandidate.name,
                    role: pendingCandidate.role as "engineer" | "marketer" | "sales",
                    level: pendingCandidate.level as "Senior" | "Mid" | "Junior" | "Lead",
                    salary: hiringOffer.salary,
                    equity: hiringOffer.equity,
                    experience: pendingCandidate.experience,
                    performance: 70 + Math.floor(Math.random() * 20),
                    morale: 90 + Math.floor(Math.random() * 10),
                    skills: {
                        technical: pendingCandidate.role === "engineer" ? 60 : 20,
                        marketing: pendingCandidate.role === "marketer" ? 60 : 20,
                        sales: pendingCandidate.role === "sales" ? 60 : 20,
                    },
                    joined_at: month,
                }];

                setStartup(s => {
                    const ns = {
                        ...s,
                        employees: [...(s.employees || []), ...newEmployees],
                        metrics: {
                            ...s.metrics,
                            employees: s.metrics.employees + cohortSize,
                            option_pool: Math.max(0, (s.metrics.option_pool || 0) - (hiringOffer.equity * cohortSize))
                        }
                    };
                    if (pendingCandidate.role === "engineer") ns.metrics.engineers += cohortSize;
                    else if (pendingCandidate.role === "marketer") ns.metrics.marketers += cohortSize;
                    else if (pendingCandidate.role === "sales") ns.metrics.sales += cohortSize;
                    return ns;
                });
                const displayRole = getDisplayRoleName(pendingCandidate.role, cohortSize > 1);
                addTimelineEvent(`Personnel: ${`${pendingCandidate.name} as ${displayRole}`} joined.`);
                setFocusHoursUsed(curr => curr + 20);
                if (pendingCandidate.candId) setRejectedCandidates(prev => [...prev, pendingCandidate.candId as string]); // Remove from list
                setSelectedAction("none");
                setPendingCandidate(null);
                setHiringOffer({ salary: 0, equity: 0 });
            } else {
                toast.error("Offer Rejected", { description: result.reason });
                const displayRole = getDisplayRoleName(pendingCandidate.role, false);
                addTimelineEvent(`Personnel: Failed to hire ${displayRole}.`);
                setFocusHoursUsed(curr => curr + 10);
                if (pendingCandidate.candId) setRejectedCandidates(prev => [...prev, pendingCandidate.candId as string]); // Remove from list
                setSelectedAction("none");
                setPendingCandidate(null);
            }
        };
        const handleFundingConfirm = async () => {
            if (!pendingInvestor) return;

            const result = negotiateFunding(pendingInvestor, startup, fundingOffer.valuation, fundingOffer.equity);

            toast.dismiss();
            setInvestorMessage(result.message);

            if (result.success) {
                const nextStage = getNextFundingStage(startup.funding_stage) || startup.funding_stage;
                const postMoney = fundingOffer.valuation;
                const equityGiven = fundingOffer.equity;
                const raised = Math.floor(postMoney * (equityGiven / 100));

                setStartup((s: any) => {
                    const ns = { ...s, valuation: postMoney, metrics: { ...s.metrics, cash: s.metrics.cash + raised } };
                    ns.funding_stage = nextStage;
                    ns.phase = getFundingPhase(nextStage);

                    const investorEquity = equityGiven;
                    const founderDiluted = 100 - investorEquity;
                    const existingEntries = (ns.capTable || []).filter((e: any) => e.type !== "Founder");
                    ns.capTable = [
                        { name: "Founder", equity: parseInt(founderDiluted.toFixed(0)), type: "Founder" },
                        ...existingEntries,
                        { name: pendingInvestor.name, equity: parseInt(investorEquity.toFixed(0)), type: "Investor" },
                    ];
                    if (ns.metrics?.investor_pipeline) {
                        ns.metrics.investor_pipeline = { leads: 0, meetings: 0, term_sheets: 0 };
                    }
                    return ns;
                });

                addTimelineEvent(`Raised ${nextStage} from ${pendingInvestor.name}: ${formatMoney(raised)} at ${formatMoney(postMoney)} post-money!`);
                toast.success(`Raised ${formatMoney(raised)}!`, { description: `Post-money valuation: ${formatMoney(postMoney)}` });

                setFocusHoursUsed(curr => curr + 40);
                setSelectedAction("none");
                setPendingInvestor(null);
                setPendingCounterOffer(null);
            } else if (result.counterValuation) {
                toast.info("Investor Countered", { description: "Review their terms below." });
                setPendingCounterOffer({ valuation: result.counterValuation, equity: result.counterEquity! });
            } else {
                toast.error("Pitch Rejected", { description: result.message });
                setFocusHoursUsed(curr => curr + 10);
            }
        };

        const handleAcceptCounter = () => {
            if (!pendingInvestor || !pendingCounterOffer) return;

            const nextStage = getNextFundingStage(startup.funding_stage) || startup.funding_stage;
            const postMoney = pendingCounterOffer.valuation;
            const equityGiven = pendingCounterOffer.equity;
            const raised = Math.floor(postMoney * (equityGiven / 100));

            setStartup((s: any) => {
                const ns = { ...s, valuation: postMoney, metrics: { ...s.metrics, cash: s.metrics.cash + raised } };
                ns.funding_stage = nextStage;
                ns.phase = getFundingPhase(nextStage);

                const investorEquity = equityGiven;
                const founderDiluted = 100 - investorEquity;
                const existingEntries = (ns.capTable || []).filter((e: any) => e.type !== "Founder");
                ns.capTable = [
                    { name: "Founder", equity: parseInt(founderDiluted.toFixed(0)), type: "Founder" },
                    ...existingEntries,
                    { name: pendingInvestor.name, equity: parseInt(investorEquity.toFixed(0)), type: "Investor" },
                ];
                if (ns.metrics?.investor_pipeline) {
                    ns.metrics.investor_pipeline = { leads: 0, meetings: 0, term_sheets: 0 };
                }
                return ns;
            });

            addTimelineEvent(`Raised ${nextStage} from ${pendingInvestor.name} (Counter Accepted): ${formatMoney(raised)} at ${formatMoney(postMoney)} post-money!`);
            toast.success(`Deal Closed!`, { description: `Raised ${formatMoney(raised)}` });

            setFocusHoursUsed(curr => curr + 30);
            setSelectedAction("none");
            setPendingInvestor(null);
            setPendingCounterOffer(null);
        };

        const handleFireEmployee = (id: string) => {
            const empToFire = startup.employees?.find(e => e.id === id);
            if (!empToFire) return;

            setConfirmDialog({
                open: true,
                title: `Fire ${empToFire.name}?`,
                description: "This will hurt morale and you'll lose their specialized skills.",
                confirmText: "FIRE EMPLOYEE",
                type: "fire",
                onConfirm: () => {
                    setStartup(s => ({
                        ...s,
                        employees: s.employees?.filter(e => e.id !== id) || [],
                        metrics: { ...s.metrics, team_morale: Math.max(0, s.metrics.team_morale - 15), employees: s.metrics.employees - 1 },
                    }));
                    toast.error("Employee Terminated");
                }
            });
        };

        const handleTrainEmployee = (id: string) => {
            const cost = 2000;
            if (startup.metrics.cash < cost) { toast.error("Not enough cash!"); return; }
            setStartup(s => ({
                ...s,
                metrics: { ...s.metrics, cash: s.metrics.cash - cost },
                employees: s.employees?.map(e => e.id === id ? {
                    ...e,
                    performance: Math.min(100, e.performance + 10),
                    morale: Math.min(100, (e.morale ?? 70) + 5),
                    skills: {
                        technical: e.role === "engineer" ? Math.min(100, e.skills.technical + 5) : e.skills.technical,
                        marketing: e.role === "marketer" ? Math.min(100, e.skills.marketing + 5) : e.skills.marketing,
                        sales: e.role === "sales" ? Math.min(100, e.skills.sales + 5) : e.skills.sales,
                    }
                } : e),
            }));
            toast.success("Training complete!", { description: "-$2,000" });
        };

        const handlePromoteEmployee = (id: string) => {
            setStartup(s => ({
                ...s,
                employees: s.employees?.map(e => {
                    if (e.id !== id) return e;
                    const levels: any = ["Junior", "Mid", "Senior", "Lead"];
                    const idx = levels.indexOf(e.level);
                    if (idx === levels.length - 1) {
                        return {
                            ...e,
                            isCXO: true,
                            salary: Math.floor(e.salary * 1.5),
                            performance: Math.min(100, e.performance + 10),
                            morale: 100
                        };
                    }
                    return {
                        ...e,
                        level: levels[idx + 1],
                        salary: Math.floor(e.salary * 1.3),
                        performance: Math.min(100, e.performance + 5),
                        morale: Math.min(100, (e.morale ?? 70) + 10)
                    };
                }),
            }));
            toast.success("Promoted! Salary +30%");
        };

        const handleIncrementSalary = (id: string) => {
            setStartup(s => ({
                ...s,
                employees: s.employees?.map(e => e.id === id ? {
                    ...e,
                    salary: Math.floor(e.salary * 1.15),
                    performance: Math.min(100, e.performance + 5),
                    morale: Math.min(100, (e.morale ?? 70) + 20),
                    last_increment_at: month
                } : e),
            }));
            toast.success("Salary +15%", { description: "Employee morale stabilized." });
        };

        const handleGrantEquity = (id: string, amount: number) => {
            if ((startup.metrics.option_pool || 0) < amount) {
                toast.error("Not enough equity in Option Pool!");
                return;
            }

            setStartup(s => ({
                ...s,
                metrics: { ...s.metrics, option_pool: (s.metrics.option_pool || 0) - amount },
                employees: s.employees?.map(e => e.id === id ? {
                    ...e,
                    equity: (e.equity || 0) + amount,
                    performance: Math.min(100, e.performance + 10),
                    morale: Math.min(100, (e.morale ?? 70) + 15)
                } : e),
            }));
            toast.success(`Granted ${amount}% Equity!`, { description: "Retention and performance increased." });
        };

        // ── Next Month ─────────────────────────────────────────────────────────────
        const handleNextMonth = async () => {
            if (isProcessing) return;
            if (startup.outcome && startup.outcome !== "active" && !dismissedEndgame) {
                // Failsafe: if the user somehow clicks this inside a dead state, just re-open the model.
                setIsEndgameOpen(true);
                return;
            }

            setIsProcessing(true);
            setRejectedCandidates([]);
            try {
                const nextMonth = month + 1;


                // Process ongoing programs first
                const { startup: spAfter, founder: foAfter, log: progLog } = processOngoingPrograms(ongoingPrograms, month, startup, founder);
                progLog.forEach(l => addTimelineEvent(`🔄 ${l}`, nextMonth));

                // Apply burnout penalty if over-committed from ongoing programs
                const maxEnergy = calcFocusHours(spAfter.metrics.founder_burnout || 0, spAfter.employees || [], (spAfter as any).hasCoFounder);
                const currentCommitment = ongoingProgramsTotalEnergy(ongoingPrograms);
                if (currentCommitment > maxEnergy) {
                    const penalty = (currentCommitment - maxEnergy) * 0.5;
                    spAfter.metrics.founder_burnout = Math.min(100, (spAfter.metrics.founder_burnout || 0) + penalty);
                    addTimelineEvent(`⚠️ Over-committed! Ongoing programs caused +${penalty.toFixed(1)} founder burnout.`, nextMonth);
                }

                const result = processMonth(foAfter, spAfter, selectedAction);
                const newStartup = result.newStartup;
                result.notices.forEach(n => addTimelineEvent(`⚠️ ${n}`, nextMonth));

                // --- IPO PROGRESSION ---
                if (newStartup.ipo_stage && newStartup.ipo_stage > 0 && newStartup.ipo_stage < 4) {
                    newStartup.ipo_stage += 1;
                    const IPO_MESSAGES = [
                        "",
                        "📝 Pre-IPO Planning complete. Setting up data rooms.",
                        "📄 S-1 Filing submitted. SEC review in progress.",
                        "💰 Roadshow complete. Investor demand is high!",
                        "🏛️ IPO DAY! The bell is ringing!"
                    ];
                    addTimelineEvent(IPO_MESSAGES[newStartup.ipo_stage], nextMonth);

                    if (newStartup.ipo_stage === 4) {
                        playSound("success");
                        newStartup.outcome = "ipo";
                        const pts = recordExit(newStartup, founder.name);
                        toast.success(`MARKET CAP EXPLOSION! +${pts} Legacy XP earned.`);
                        setStartup(newStartup);
                        setIsEndgameOpen(true);
                        setIsProcessing(false);
                        return;
                    }
                }

                // Removed old queued selectedAction logic due to Instant Execution system
                setSelectedAction("none");

                // Runway alerts
                const runway = newStartup.metrics.runway;
                const profitable = (newStartup.metrics.net_profit || 0) >= 0;
                if (!profitable && runway <= 3 && runway > 0) {
                    toast.error("⚠️ Critical Runway!", { description: `Only ${runway} months left!` });
                    addTimelineEvent(`Crisis: Runway below 3 months — emergency mode.`, nextMonth);
                } else if (!profitable && runway <= 6) {
                    toast.warning("⚡ Low Runway", { description: `${runway} months remaining.` });
                }

                // Sam Mentor Advice Trigger
                if (isOnline) {
                    const samAlert = getEducationalAdvice(newStartup, founder);
                    if (samAlert) {
                        setSamAdvice(samAlert);
                        playSound("popup");
                        setIsSamModalOpen(true);
                    }
                }

                // Burnout game-over
                if ((newStartup.metrics.founder_burnout || 0) >= 100) {
                    playSound("fail");
                    newStartup.outcome = "burnout";
                    setStartup(newStartup);
                    const pts = recordExit(newStartup, founder.name);
                    const finalTimeline = [...eventsTimeline, { month: nextMonth, text: `Game Over: Founder burned out completely. +${pts} XP earned.` }];
                    setEventsTimeline(finalTimeline);
                    toast("Game Over — Burnout", { description: `You worked yourself to the ground. Earned ${pts} XP.` });
                    const story = isOnline ? await generateFounderStory(founder.name, newStartup.name, finalTimeline.map(e => `Month ${e.month}: ${e.text}`)) : null;
                    setEndgameStory(story); setIsEndgameOpen(true); setIsProcessing(false);
                    return;
                }

                const endgame = checkEndgame(newStartup);
                if (endgame) {
                    playSound(endgame === "acquired" ? "success" : "fail");
                    newStartup.outcome = endgame === "bankrupt" ? "bankrupt" : "other";
                    setStartup(newStartup);
                    const pts = recordExit(newStartup, founder.name);
                    const finalTimeline = [...eventsTimeline, { month: nextMonth, text: `Game Over: ${endgame.toUpperCase()}! +${pts} XP earned.` }];
                    setEventsTimeline(finalTimeline);
                    toast("Game Over - " + endgame.toUpperCase(), { description: `Generating your founder story... Earned ${pts} XP.` });
                    const story = isOnline ? await generateFounderStory(founder.name, newStartup.name, finalTimeline.map(e => `Month ${e.month}: ${e.text}`)) : null;
                    setEndgameStory(story); setIsEndgameOpen(true); setIsProcessing(false);
                    return;
                }

                // Random events (AI First, Fallback to Predefined)
                let ev: GameEvent | null = null;
                if (isOnline && process.env.NEXT_PUBLIC_OPENAI_API_KEY && process.env.NEXT_PUBLIC_OPENAI_API_KEY !== "dummy") {
                    const aiEvent = await generateAIEvent(newStartup, founder, seenEventIds);
                    if (aiEvent) ev = aiEvent as GameEvent;
                }

                if (!ev) {
                    ev = getRandomEvent(newStartup.phase, seenEventIds, newStartup.scenario);
                }

                if (ev) {
                    playSound("popup");
                    setActiveEvent(ev);
                    if (ev.event_id) setSeenEventIds(prev => [...prev, ev.event_id!]);
                    else if (ev.title) setSeenEventIds(prev => [...prev, ev.title]);
                }

                // Competitors
                const { updated, news, rivalActions } = simulateCompetitors(competitors, newStartup.metrics.users);
                setCompetitors(updated);
                news.forEach(n => addTimelineEvent(n, nextMonth));
                
                let nextFounder = { ...founder, attributes: { ...founder.attributes } };
                
                rivalActions.forEach(({ action, competitorName }) => {
                    if (competitorName.toLowerCase().includes("chadly")) {
                        setChadAdvice({
                            title: "⚔️ CHADLY ATTACKS!",
                            message: `"${(action as any).banter || ''}"\n\nChadly just ${action.description}`,
                            buttonText: "I'LL CRUSH HIM"
                        });
                        playSound("popup");
                        setIsChadModalOpen(true);
                    }

                    // Specific handlers for comprehensive rival actions
                    if (action.type === "vulture_talent" && newStartup.employees.length > 0) {
                        const targetIndex = Math.floor(Math.random() * newStartup.employees.length);
                        const poached = newStartup.employees[targetIndex];
                        newStartup.employees = newStartup.employees.filter((_, i) => i !== targetIndex);
                        
                        toast.error(`💔 Poached! ${poached.name} was hired by ${competitorName}`, {
                            description: "You lost a valuable team member."
                        });
                        addTimelineEvent(`💔 Staff Poached: ${poached.name} left to join ${competitorName}`, nextMonth);
                    } else if (action.type === "price_cut") {
                        if (newStartup.gtm_motion === "SLG" && newStartup.metrics.b2b_pipeline) {
                            const lostDeals = Math.max(1, Math.floor((newStartup.metrics.b2b_pipeline.closed_won || 0) * 0.05));
                            newStartup.metrics.b2b_pipeline.closed_won = Math.max(0, (newStartup.metrics.b2b_pipeline.closed_won || 0) - lostDeals);
                            toast.error(`💸 Lost ${lostDeals} Deals to ${competitorName}'s price cuts!`);
                            addTimelineEvent(`💸 Lost ${lostDeals} Enterprise Deals to ${competitorName} (Price Cut)`, nextMonth);
                        } else {
                            newStartup.metrics.users = Math.max(0, Math.floor(newStartup.metrics.users * 0.96)); // 4% churn
                        }
                        newStartup.metrics.pricing = Math.max(5, Math.floor(newStartup.metrics.pricing * 0.95)); // Pricing pressure
                    } else if (action.type === "massive_marketing") {
                        newStartup.metrics.brand_awareness = Math.max(0, (newStartup.metrics.brand_awareness || 0) - 10);
                        if (newStartup.gtm_motion === "SLG" && newStartup.metrics.b2b_pipeline) {
                            newStartup.metrics.b2b_pipeline.leads = Math.max(0, Math.floor((newStartup.metrics.b2b_pipeline.leads || 0) * 0.8));
                            toast.error(`📉 Lead Pipeline drained by ${competitorName}'s ad blitz!`);
                        } else {
                            newStartup.metrics.users = Math.max(0, Math.floor(newStartup.metrics.users * 0.94)); // 6% churn
                        }
                    } else if (action.type === "feature_launch") {
                        newStartup.metrics.product_quality = Math.max(0, (newStartup.metrics.product_quality || 10) - 5);
                        newStartup.metrics.team_morale = Math.max(0, (newStartup.metrics.team_morale || 50) - 5);
                    } else if (action.type === "ai_pivot") {
                        newStartup.metrics.innovation = Math.max(0, (newStartup.metrics.innovation || 10) - 8);
                        newStartup.metrics.technical_debt = Math.min(100, (newStartup.metrics.technical_debt || 0) + 5);
                        newStartup.metrics.team_morale = Math.max(0, (newStartup.metrics.team_morale || 50) - 8);
                    } else if (action.type === "press_attack") {
                        newStartup.metrics.brand_awareness = Math.max(0, (newStartup.metrics.brand_awareness || 0) - 15);
                        newStartup.metrics.team_morale = Math.max(0, (newStartup.metrics.team_morale || 50) - 10);
                        if (nextFounder.attributes) {
                            nextFounder.attributes.reputation = Math.max(0, (nextFounder.attributes.reputation || 50) - 5);
                        }
                        if (newStartup.gtm_motion === "SLG" && newStartup.metrics.b2b_pipeline) {
                             newStartup.metrics.b2b_pipeline.active_deals = Math.max(0, Math.floor((newStartup.metrics.b2b_pipeline.active_deals || 0) * 0.9));
                        } else {
                             newStartup.metrics.users = Math.max(0, Math.floor(newStartup.metrics.users * 0.95));
                        }
                    }

                    // Fallback generic multipliers (if any new actions are added without specific handlers)
                    if (!["price_cut", "massive_marketing", "feature_launch", "ai_pivot", "press_attack", "vulture_talent"].includes(action.type)) {
                        if (action.impactUser !== 0) newStartup.metrics.users = Math.max(0, Math.floor(newStartup.metrics.users * (1 + action.impactUser)));
                        if (action.impactMorale !== 0) newStartup.metrics.team_morale = Math.max(0, Math.min(100, newStartup.metrics.team_morale + action.impactMorale));
                        if (action.impactBrand !== 0) newStartup.metrics.brand_awareness = Math.max(0, Math.min(100, (newStartup.metrics.brand_awareness || 0) + action.impactBrand));
                    }

                    // Real-time feedback for rival moves
                    toast.error(`⚔️ Rival Move: ${competitorName}`, {
                        description: action.description,
                        duration: 5000
                    });
                    addTimelineEvent(`⚔️ ${competitorName}: ${(action as any).title || action.description}`, nextMonth);
                });

                // --- LIFESTYLE & ASSETS ---

                // 1. Lifestyle Toggles (Costs & Impacts)
                let totalLifestyleCost = 0;
                const activeServices = LIFESTYLE_TOGGLES.filter(t => (nextFounder.activeToggles || []).includes(t.id));
                activeServices.forEach(s => {
                    totalLifestyleCost += s.monthlyCost;
                    if (s.impact.health) newStartup.metrics.founder_health = Math.min(100, Math.max(0, (newStartup.metrics.founder_health || 0) + s.impact.health));
                    if (s.impact.burnout) newStartup.metrics.founder_burnout = Math.min(100, Math.max(0, (newStartup.metrics.founder_burnout || 0) + s.impact.burnout));
                    if (s.impact.sleep) newStartup.metrics.sleep_quality = Math.min(100, Math.max(0, (newStartup.metrics.sleep_quality || 0) + s.impact.sleep));
                    if (s.impact.reputation) nextFounder.attributes.reputation = Math.min(100, Math.max(0, (nextFounder.attributes.reputation || 0) + s.impact.reputation));
                });

                if (totalLifestyleCost > nextFounder.personal_wealth) {
                    addTimelineEvent(`⚠️ Lifestyle cut! Insufficient funds to maintain active services.`, nextMonth);
                    nextFounder.activeToggles = []; // Cut all if can't afford
                } else {
                    nextFounder.personal_wealth -= totalLifestyleCost;
                }

                // 2. Asset Appreciation/Depreciation
                const updatedAssets = (nextFounder.assets || []).map(asset => {
                    // Find rate from catalog if missing (for legacy data)
                    const rate = asset.depreciationRate ?? (LUXURY_ASSETS.find(la => la.name === asset.name)?.depreciationRate || 0);
                    return {
                        ...asset,
                        depreciationRate: rate,
                        currentValue: Math.max(0, asset.currentValue * (1 + rate))
                    };
                });

                setFounder({
                    ...nextFounder,
                    assets: updatedAssets
                });

                // Achievements
                const newAchievements = checkAchievements(newStartup, unlockedAchievements);
                newAchievements.forEach((a: Achievement) => {
                    toast.success(`Achievement: ${a.title}!`, { description: a.description });
                    addTimelineEvent(`🏆 Achievement: ${a.title}`, nextMonth);
                    setUnlockedAchievements(prev => [...prev, a.id]);
                });

                // Phase
                const mu = newStartup.metrics.users; const mr = newStartup.metrics.revenue; const mv = newStartup.valuation;
                let newPhase = newStartup.phase;
                if (mv >= 100_000_000 || mu >= 100_000) newPhase = "Scaling";
                else if (mv >= 10_000_000 || mr >= 50_000 || mu >= 10_000) newPhase = "Growth";
                else if (mr >= 5_000 || mu >= 1_000) newPhase = "Traction";
                else if (mu >= 100) newPhase = "Early Startup";
                else newPhase = "Idea Phase";
                if (newPhase !== newStartup.phase) {
                    addTimelineEvent(`⚡ Phase unlocked: ${newPhase}!`, nextMonth);
                    toast.success(`New Phase: ${newPhase}!`, { description: "Your startup just leveled up." });
                }
                newStartup.phase = newPhase as typeof newStartup.phase;

                setStartup(newStartup);
                setFounder({ ...foAfter }); // Ensure founder state (wealth, skills) updates
                setSelectedAction("none");
                const committedEnergy = ongoingProgramsTotalEnergy(ongoingPrograms);
                setFocusHoursUsed(committedEnergy);
                setActionUsageLog(prev => ({ thisMonth: {}, lastUsedMonth: prev.lastUsedMonth }));

                if (month % 3 === 0 && !isPremium) {
                    await adService.showInterstitial();
                    adService.prepareInterstitial();
                }

                setMonth(nextMonth);

                // M&A Offer Generation Check
                const newOffer = generateAcquisitionOffer(newStartup, founder);
                if (newOffer) {
                    setStartup(s => ({
                        ...s,
                        acquisition_offers: [...(s.acquisition_offers || []), newOffer]
                    }));
                    toast("🤝 Incoming Acquisition Offer!", {
                        description: `${newOffer.acquirer} is interested in buying ${newStartup.name} for ${formatMoney(newOffer.offer_amount)}!`,
                        duration: 10000
                    });
                    addTimelineEvent(`Negotiation: Received acquisition offer from ${newOffer.acquirer}.`, nextMonth);
                }
            } catch (error) {
                toast.error("Error processing turn");
            } finally {
                setIsProcessing(false);
            }
        };

        const handleEventResolution = (choice: EventChoice) => {
            const multiplier = startup.phase === "Scaling" ? 10 : startup.phase === "Growth" ? 3 : 1;
            const impactString = generateImpactSentence(choice.text, choice.effects, multiplier, activeEvent?.title);

            // Use functional updates to ensure we have the absolute latest state
            setStartup(prevStartup => {
                const metrics = { ...prevStartup.metrics };

                Object.entries(choice.effects).forEach(([key, val]) => {
                    const numVal = Number(val);
                    if (isNaN(numVal)) {
                        console.warn(`[handleEventResolution] Skipping invalid effect value for ${key}:`, val);
                        return;
                    }
                    
                    let adjustedVal = numVal;
                    if (['cash', 'burn_rate', 'revenue', 'monthlyCost', 'salary'].includes(key.toLowerCase())) {
                        adjustedVal *= multiplier;
                    }

                    if (key in metrics) {
                        const cur = (metrics as any)[key] || 0;
                        (metrics as any)[key] = cur + adjustedVal;
                    }
                });

                // Catch-all clamping for metrics
                ['founder_burnout', 'founder_health', 'team_morale', 'reliability', 'product_quality', 'pmf_score', 'reputation'].forEach(k => {
                    if (k in metrics) (metrics as any)[k] = Math.min(100, Math.max(0, (metrics as any)[k]));
                });
                ['users', 'revenue', 'cash', 'brand_awareness', 'technical_debt'].forEach(k => {
                    if (k in metrics) (metrics as any)[k] = Math.max(0, (metrics as any)[k]);
                });

                return { ...prevStartup, metrics };
            });

            setFounder(prevFounder => {
                const attrs = { ...prevFounder.attributes };
                Object.entries(choice.effects).forEach(([key, val]) => {
                    const numVal = Number(val);
                    if (!isNaN(numVal) && key in attrs) {
                        (attrs as any)[key] += numVal;
                    }
                });
                // Every attribute is [0, 100]
                Object.keys(attrs).forEach(k => {
                    (attrs as any)[k] = Math.min(100, Math.max(0, (attrs as any)[k]));
                });
                return { ...prevFounder, attributes: attrs };
            });

            addTimelineEvent(impactString);
        };

        const m = startup.metrics;
        const liveRevenue = m.users * (m.pricing || 0);
        const liveNetProfit = liveRevenue - (m.cogs || 0) - (m.opex || 0);
        const profitable = liveNetProfit >= 0;
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder);
        const energyPct = Math.min(100, (focusHoursUsed / maxHours) * 100);

        return (
            <div className="min-h-[100dvh] flex flex-col h-[100dvh] overflow-hidden pt-0 sm:pt-0" style={{ backgroundColor: '#f7f8fc' }}>

                {/* HEADER */}
                <div className="shrink-0 bg-white border-b border-slate-100 px-4 flex items-center justify-between shadow-sm" style={{ paddingBottom: '10px', paddingTop: isIOS ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '8px' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100" style={{ background: `${founderMeta.brandColor}15` }}>
                            {founderMeta.logo}
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 leading-none">{startup.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Month {month} · {startup.industry} {isPremium && <span className="text-indigo-600 ml-1">🚀 PREMIUM</span>}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">

                        {(() => {
                            const hourAgo = currentTime - 60 * 60 * 1000;
                            const validConsults = (samConsults || []).filter(t => t > hourAgo);
                            const isLimited = validConsults.length >= 2;

                            let countdownStr = "";
                            if (isLimited) {
                                const nextAvail = validConsults[0] + 60 * 60 * 1000;
                                const msLeft = Math.max(0, nextAvail - currentTime);
                                const mins = Math.floor(msLeft / 60000);
                                const secs = Math.floor((msLeft % 60000) / 1000);
                                countdownStr = `${mins}:${String(secs).padStart(2, '0')}`;
                            }

                            return (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!isOnline}
                                    className={`h-7 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm px-2 pr-2.5 ${!isOnline ? 'bg-slate-50 border-slate-200 text-slate-400 grayscale' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'}`}
                                    onClick={() => {
                                        if (!isOnline) {
                                            setConfirmDialog({
                                                open: true,
                                                title: "📶 Signal Lost in the Void",
                                                description: "You've entered a Wi-Fi dead zone! The AI grid is offline, and Sam's frequency is scrambled. Find a better uplink to continue the consultation.",
                                                confirmText: "UNDERSTOOD",
                                                type: "offline",
                                                onConfirm: () => { }
                                            });
                                            return;
                                        }
                                        const now = Date.now();
                                        const hourAgo = now - 60 * 60 * 1000;
                                        const validConsults = samConsults.filter(t => t > hourAgo);

                                        if (validConsults.length >= 2) {
                                            setConfirmDialog({
                                                open: true,
                                                title: "🧠 Sam is Processing...",
                                                description: "Even a super-mentor needs a break! Sam is currently synthesizing market data from your last session. Check back in a bit.",
                                                confirmText: "LET HIM COOK",
                                                onConfirm: () => { }
                                            });
                                            return;
                                        }

                                        const consultAction = () => {
                                            setSamConsults([...validConsults, now]);
                                            const advice = getConsultationAdvice(startup);
                                            setSamAdvice(advice);
                                            setIsSamModalOpen(true);
                                        };

                                        if (isPremium) {
                                            consultAction();
                                        } else {
                                            adService.showRewardedAd(consultAction);
                                        }
                                    }}
                                >
                                    <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-200 shrink-0">
                                        <img src="/characters/sam_mentor.png" alt="Sam" className="w-full h-full object-cover scale-125" />
                                    </div>
                                    {isLimited ? (
                                        <span className="text-rose-600 font-bold ml-0.5">{countdownStr}</span>
                                    ) : (
                                        <span className="ml-0.5">CONSULT SAM</span>
                                    )}
                                </Button>
                            );
                        })()}
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black px-2.5 py-1 rounded-full">{formatMoney(m.cash)}</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center justify-center transition-colors">
                                <Menu className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mr-2 shadow-xl border-slate-200">
                                <div className="px-2 py-1.5 font-black text-xs text-slate-400 uppercase tracking-widest cursor-default select-none">Game Menu</div>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                {!isPremium && (
                                    <DropdownMenuItem
                                        className="rounded-xl cursor-pointer py-2 focus:bg-indigo-50 focus:text-indigo-600 font-bold transition-colors text-indigo-600"
                                        onClick={() => {
                                            setConfirmDialog({
                                                open: true,
                                                title: "🚀 Rocket to the Top!",
                                                description: "For $3.99, remove all interruptions. Focus like a pro with 2 ad-free Sam consults per hour and zero banner or interstitial ads throughout your journey.",
                                                confirmText: "GO PREMIUM — $3.99",
                                                cancelText: "Maybe Later",
                                                type: "premium",
                                                onConfirm: () => {
                                                    iapService.purchasePremium().then(success => {
                                                        if (success) {
                                                            setIsPremium(true);
                                                            adService.hideBanner();
                                                        }
                                                    });
                                                }
                                            });
                                        }}
                                    >
                                        <Rocket className="mr-2 h-4 w-4" /> Remove Ads
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-indigo-50 focus:text-indigo-600 font-bold transition-colors" onClick={handleOpenSaveModal}>
                                    <Save className="mr-2 h-4 w-4" /> Save Game
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 focus:text-rose-600 font-bold transition-colors" onClick={handleSaveAndQuit}>
                                    <Menu className="mr-2 h-4 w-4" /> Save & Return to Title
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-indigo-50 focus:text-indigo-600 font-bold transition-colors" onClick={handleResetGame}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> New Game
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-slate-50 focus:text-slate-800 font-bold transition-colors" onClick={(e) => {
                                    e.preventDefault();
                                    const newMute = toggleAudioMute();
                                    setSfxEnabled(!newMute);
                                    if (!newMute) playSound("click");
                                }}>
                                    {sfxEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />} Sound Effects: {sfxEnabled ? "ON" : "OFF"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-emerald-50 focus:text-emerald-600 font-bold transition-colors" onClick={() => setIsHowToPlayOpen(true)}>
                                    <HelpCircle className="mr-2 h-4 w-4" /> How To Play
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-amber-50 focus:text-amber-600 font-bold transition-colors" onClick={handleRateAndClaim}>
                                    <Star className="mr-2 h-4 w-4" /> Rate & Support {!startup.hasRateRewardClaimed && "🎁"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 focus:text-rose-600 font-bold transition-colors" onClick={() => setIsRoadmapOpen(true)}>
                                    <Rocket className="mr-2 h-4 w-4" /> V2 Roadmap (Coming Soon)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                                                {/* Collapsible Milestone Card */}
                <div 
                    onClick={() => setIsMilestoneExpanded(!isMilestoneExpanded)} 
                    className="shrink-0 bg-white p-4 border-b border-slate-100 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 transition-all select-none"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{
                                startup.funding_stage === "Bootstrapping" ? "🏠" : 
                                startup.funding_stage === "Angel Investment" ? "🚀" : 
                                startup.funding_stage === "Seed Round" ? "📈" : "🏢"
                            }</span>
                            <div>
                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none">Current Milestone</p>
                                <p className="text-sm font-black text-slate-900 mt-0.5">
                                    {startup.funding_stage === "Bootstrapping" ? "Garage" : 
                                     startup.funding_stage === "Angel Investment" ? "Traction" : 
                                     startup.funding_stage === "Seed Round" ? "PMF" : "Scaling"} 
                                    <span className="text-slate-300 font-medium text-[9px] ml-1">
                                        → Next: {
                                            startup.funding_stage === "Bootstrapping" ? "Traction" : 
                                            startup.funding_stage === "Angel Investment" ? "PMF" : 
                                            startup.funding_stage === "Seed Round" ? "Scaling" : "Exit / IPO 🦄"
                                        }
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ 
                                    width: startup.funding_stage === "Bootstrapping" ? "25%" : 
                                           startup.funding_stage === "Angel Investment" ? "50%" : 
                                           startup.funding_stage === "Seed Round" ? "75%" : "100%" 
                                }} />
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform", isMilestoneExpanded ? "rotate-180" : "")} />
                        </div>
                    </div>
                    {isMilestoneExpanded && (
                        <div className="bg-slate-50 rounded-xl p-3 mt-1">
                            <p className="text-[10px] text-slate-600 font-medium leading-normal">
                                {
                                    startup.funding_stage === "Bootstrapping" ? "You are building the foundation in your garage. Validate your idea, build the MVP, and gather initial organic users to prove demand." : 
                                    startup.funding_stage === "Angel Investment" ? "You've got initial validation. Now test channels, expand user onboarding streams, and prepare to scale server operations." : 
                                    startup.funding_stage === "Seed Round" ? "Institutional backing setup. Accelerate growth rates, expand active marketing departments, and scale structural hires." : 
                                    "Scale aggressively, optimize unit economics, and prepare for market domination or exit opportunities."
                                }
                            </p>
                        </div>
                    )}
                </div>


                {/* FOCUS HEADER & CORE STATS */}
                <div className="shrink-0 flex flex-col">
                    {/* Dedicated Focus Hours Bar */}
                    <div className="px-4 py-2 bg-indigo-50 flex items-center justify-between border-b border-indigo-100">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-indigo-100/50 transition-colors rounded-xl p-1 -m-1"
                            onClick={() => setIsFocusBreakdownOpen(true)}
                        >
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="text-xl leading-none">⚡</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-black text-indigo-900 leading-none">Focus Energy</p>
                                    <Info className="w-2.5 h-2.5 text-indigo-400" />
                                </div>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">Available to spend</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-baseline gap-1">
                                <span className={cn("text-3xl font-black tracking-tighter leading-none", energyPct > 80 ? 'text-rose-600' : 'text-indigo-700')}>
                                    {maxHours - focusHoursUsed}h
                                </span>
                                <span className="text-sm font-bold text-indigo-400">/ {maxHours}</span>
                            </div>
                            {focusHoursUsed > 0 && (() => {
                                    const hourAgo = Date.now() - 3600_000;
                                    const validRefills = (energyRefills || []).filter(t => t > hourAgo);
                                    const isRefillLimited = validRefills.length >= 1;
                                    return (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[9px] font-black uppercase tracking-widest bg-indigo-100 border-indigo-200 text-indigo-700 hover:bg-indigo-200 ml-2"
                                            disabled={isRefillLimited}
                                            onClick={() => {
                                                if (isRefillLimited) {
                                                    toast.error("Refill Limit Reached", { description: "You can refill energy once per hour." });
                                                    return;
                                                }
                                                adService.showRewardedAd(() => {
                                                    setFocusHoursUsed(0);
                                                    setEnergyRefills([...validRefills, Date.now()]);
                                                    toast.success("Energy Refilled!", { description: "You've earned a fresh 100% focus for this month!", icon: "⚡" });
                                                });
                                            }}
                                        >
                                            {isRefillLimited ? "Cooldown (1/hr)" : "Refill ⚡"}
                                        </Button>
                                    );
                                })()}
                        </div>
                    </div>

                    {/* Core Stats Overview */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-2 bg-slate-50 border-b border-slate-100">
                        {[
                            { icon: '👤', label: formatNumber(m.users), sub: 'Users', color: 'text-slate-800' },
                            { icon: '💵', label: formatMoney(m.users * m.pricing), sub: 'MRR', color: 'text-emerald-700' },
                            { icon: '🔥', label: `${Math.round(m.founder_burnout || 0)}%`, sub: 'Burnout', color: (m.founder_burnout || 0) > 60 ? 'text-rose-600' : 'text-amber-600' },
                        ].map((stat, i) => (
                            <div key={i} className="flex-1 shrink-0 bg-white rounded-xl px-3 py-2 flex items-center justify-center gap-2 border border-slate-200 shadow-sm min-w-[90px]">
                                <span className="text-lg">{stat.icon}</span>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-black leading-none", stat.color)}>{stat.label}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{stat.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* IMMEDIATE ACTION FEEDBACK BANNER */}
                {immediateActionFeedback && (
                    <div className="shrink-0 px-3 py-1.5 border-b border-slate-100" style={{ backgroundColor: immediateActionFeedback.color + '15' }}>
                        <p className="text-[10px] font-bold text-center" style={{ color: immediateActionFeedback.color }}>{immediateActionFeedback.text}</p>
                    </div>
                )}

                {/* LOGS FEED — BitLife Style: events grouped by month */}
                <div className="flex-1 flex flex-col-reverse overflow-y-auto px-3 pt-3 pb-5">
                    {eventsTimeline.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <div className="text-4xl mb-3">⚡</div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Your journey begins</p>
                            <p className="text-[10px] text-slate-300 mt-1">Take actions below or advance to the next month</p>
                        </div>
                    ) : (() => {
                        // Group events by month, show most recent month first
                        const byMonth: Record<number, typeof eventsTimeline> = {};
                        eventsTimeline.forEach(ev => {
                            if (!byMonth[ev.month]) byMonth[ev.month] = [];
                            byMonth[ev.month].push(ev);
                        });
                        const sortedMonths = Object.keys(byMonth).map(Number).sort((a, b) => b - a);

                        const getEventStyle = (text: string) => {
                            if (text.includes("Raised") || text.includes("Funding") || text.includes("Series")) return { strip: "#7c3aed", bg: "#faf5ff", label: "Funding" };
                            if (text.includes("⚠️") || text.includes("Crisis") || text.includes("Emergency") || text.includes("Burnout")) return { strip: "#dc2626", bg: "#fff1f2", label: "Crisis" };
                            if (text.includes("🏆") || text.includes("Achievement") || text.includes("Milestone") || text.includes("Champion")) return { strip: "#d97706", bg: "#fffbeb", label: "Win" };
                            if (text.includes("hired") || text.includes("Hire") || text.includes("🤝") || text.includes("team")) return { strip: "#0284c7", bg: "#f0f9ff", label: "Team" };
                            if (text.includes("Founded") || text.includes("Phase") || text.includes("⚡")) return { strip: "#059669", bg: "#f0fdf4", label: "Milestone" };
                            if (text.includes("competitor") || text.includes("rival") || text.includes("⚔️")) return { strip: "#ea580c", bg: "#fff7ed", label: "Market" };
                            return { strip: "#6366f1", bg: "#eef2ff", label: "Event" };
                        };

                        const items = sortedMonths.map(monthNum => {
                            const events = byMonth[monthNum];
                            const isCurrentMonth = monthNum === month;
                            return (
                                <div key={monthNum} className="mb-4">
                                    {/* Month Header — BitLife style */}
                                    <div className={`flex items-center gap-2 mb-2 py-1 ${isCurrentMonth ? "" : ""}`}>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCurrentMonth ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "bg-slate-200 text-slate-600"}`}>
                                            Month {monthNum}{isCurrentMonth ? " · Now" : ""}
                                        </div>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>

                                    {/* Events in this month */}
                                    <div className="space-y-2">
                                        {events.map((ev, i) => {
                                            const style = getEventStyle(ev.text);
                                            return (
                                                <div key={i} className="flex gap-0 items-stretch rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                                    {/* Colored left strip — BitLife signature */}
                                                    <div className="w-1 shrink-0 rounded-l-lg" style={{ backgroundColor: style.strip }} />
                                                    <div className="flex-1 px-3 py-2.5" style={{ backgroundColor: style.bg }}>
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: style.strip }}>{style.label}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-800 font-semibold leading-snug">{ev.text}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        });
                        return items;
                    })()}
                </div>

                {/* PROCEED BUTTON */}
                <div className="shrink-0 px-3 py-2 bg-white border-t border-slate-100">
                    {selectedAction !== "none" && (
                        <div className="flex items-center justify-center mb-1.5">
                            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[9px] font-black text-indigo-700 uppercase">{selectedAction.replaceAll("_", " ")} queued for month end</span>
                                <button onClick={() => setSelectedAction("none")} className="text-indigo-400 text-[10px] ml-1">✕</button>
                            </div>
                        </div>
                    )}
                    <button onClick={handleNextMonth} disabled={isProcessing}
                        className="w-full h-12 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
                        style={{ background: isProcessing ? 'linear-gradient(135deg, #818cf8, #a78bfa)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                        {isProcessing ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simulating Month {month}...</> : <>Advance to Month {month + 1} ▶</>}
                    </button>
                </div>

                {/* ACTION GRID */}
                <div className="shrink-0 bg-white border-t border-slate-100 px-3 pt-2" style={{ paddingBottom: isIOS ? 'calc(env(safe-area-inset-bottom, 0px) + 80px)' : '1rem' }}>
                    <div className="grid grid-cols-4 gap-2">
                        {([
                            { id: "product", emoji: "🔧", label: "Product", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
                            { id: "marketing", emoji: "📈", label: "Growth", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
                            { id: "market", emoji: "⚔️", label: "Rivals", color: "#fff7ed", border: "#ffedd5", text: "#9a3412" },
                            { id: "hiring", emoji: "👥", label: "Hire", color: "#fefce8", border: "#fde68a", text: "#b45309" },
                            { id: "funding", emoji: "💰", label: "Funding", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce" },
                            { id: "stats", emoji: "📊", label: "Stats", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1" },
                            { id: "founder", emoji: "👤", label: "Founder", color: "#fff1f2", border: "#fecdd3", text: "#be123c" },
                            { id: "lifestyle", emoji: "💎", label: "Lifestyle", color: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9" },
                        ] as const).map(cat => (
                            <button key={cat.id} onClick={() => setActionCategory(actionCategory === cat.id ? null : cat.id)}
                                className="h-14 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95"
                                style={{ backgroundColor: actionCategory === cat.id ? cat.border : cat.color, borderColor: actionCategory === cat.id ? cat.text : cat.border }}>
                                <span className="text-lg leading-none">{cat.emoji}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: cat.text }}>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* BOTTOM SHEET */}
                <AnimatePresence>
                    {actionCategory !== null && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setActionCategory(null)} className="fixed inset-0 bg-black/20 z-40" />
                            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 pb-[calc(1rem+env(safe-area-inset-bottom,0px)+60px)]"
                                style={{ maxHeight: '85vh' }}>
                                <div className="flex justify-center pt-2.5 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-slate-200" />
                                </div>
                                <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: 'calc(80vh - 40px)' }}>
                                    <ActionSheet
                                        category={actionCategory}
                                        startup={startup}
                                        founder={founder}
                                        m={m}
                                        allEmployees={allEmployees}
                                        selectedAction={selectedAction}
                                        rejectedCandidates={rejectedCandidates}
                                        setSelectedAction={(action) => {
                                            handleActionClick(action as any);
                                            const c = actionCategory || "";
                                            if (!["product", "marketing", "hiring", "funding", "market"].includes(c)) {
                                                setActionCategory(null);
                                            }
                                        }}
                                        selectedEmpIdx={selectedEmpIdx}
                                        setSelectedEmpIdx={setSelectedEmpIdx}
                                        handleTrainEmployee={handleTrainEmployee}
                                        handlePromoteEmployee={handlePromoteEmployee}
                                        handleFireEmployee={handleFireEmployee}
                                        handleIncrementSalary={handleIncrementSalary}
                                        setIsTeamOpen={setIsTeamOpen}
                                        setIsFinancialsOpen={setIsFinancialsOpen}
                                        competitors={competitors}
                                        expandedMetric={expandedMetric}
                                        setExpandedMetric={setExpandedMetric}
                                        handleImmediateAction={handleImmediateAction}
                                        handleToggleOngoingProgram={handleToggleOngoingProgram}
                                        ongoingPrograms={ongoingPrograms}
                                        actionUsageLog={actionUsageLog}
                                        focusHoursUsed={focusHoursUsed}
                                        setFocusHoursUsed={setFocusHoursUsed}
                                        setStartup={setStartup}
                                        addTimelineEvent={addTimelineEvent}
                                        setIsEndgameOpen={setIsEndgameOpen}
                                        month={month}
                                        salaryInput={salaryInput}
                                        setSalaryInput={setSalaryInput}
                                        setIsBoardModalOpen={setIsBoardModalOpen}
                                        setLastProposalResult={setLastProposalResult}
                                        setVotingMembers={setVotingMembers}
                                        handlePurchaseAsset={handlePurchaseAsset}
                                        handleToggleLifestyle={handleToggleLifestyle}
                                        handleActionClick={handleActionClick}
                                        handleAllocateESOP={handleAllocateESOP}
                                        currentTime={currentTime}
                                        cashGrants={cashGrants}
                                        setCashGrants={setCashGrants}
                                        energyRefills={energyRefills}
                                        setEnergyRefills={setEnergyRefills}
                                        setConfirmDialog={setConfirmDialog}
                                        isOnline={isOnline}
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <EventModal event={activeEvent} onResolve={handleEventResolution} onClose={() => setActiveEvent(null)} multiplier={startup.phase === "Scaling" ? 10 : startup.phase === "Growth" ? 3 : 1} />


                {isChadModalOpen && chadAdvice && (
                    <Dialog open={isChadModalOpen} onOpenChange={setIsChadModalOpen}>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-indigo-600 border-4 shadow-xl shadow-indigo-100/50">
                            <DialogHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-indigo-400 overflow-hidden bg-indigo-50 shadow-sm flex items-center justify-center">
                                        <img src="/characters/chad_rival.png" alt="Chad" className="object-cover h-full" />
                                    </div>
                                </div>
                                <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">{chadAdvice.title}</DialogTitle>
                                <DialogDescription className="mt-2 text-slate-600 font-medium whitespace-pre-line text-sm min-h-[80px]">
                                    <TypewriterText text={chadAdvice.message} />
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 flex flex-col gap-2">
                                <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl" onClick={() => setIsChadModalOpen(false)}>
                                    {chadAdvice.buttonText}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {isSamModalOpen && samAdvice && (
                    <Dialog open={isSamModalOpen} onOpenChange={setIsSamModalOpen}>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                            <DialogHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full border-2 border-indigo-500 overflow-hidden bg-indigo-50 shadow-sm flex item-center justify-center">
                                        <img src="/characters/sam_mentor.png" alt="Sam" className="object-cover h-full" />
                                    </div>
                                </div>
                                <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">{samAdvice.title.replace(/{name}/g, founder.name || "Founder")}</DialogTitle>
                                <DialogDescription className="mt-2 text-slate-600 font-medium whitespace-pre-line text-sm min-h-[80px]">
                                    <TypewriterText text={samAdvice.message.replace(/{name}/g, founder.name || "Founder")} />
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 flex flex-col gap-2">
                                <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl" onClick={() => {
                                    setIsSamModalOpen(false);
                                    if (month === 1) {
                                        setChadAdvice({
                                            title: "⚔️ A RIVAL APPEARS!",
                                            message: `I heard you're trying to build in my space, ${founder.name}. Big mistake. I've got more capital, more hustle, and zero respect for 'burnout'. See you at the finish line—if you make it that far.`,
                                            buttonText: "BRING IT ON"
                                        });
                                        setIsChadModalOpen(true);
                                    }
                                }}>
                                    {samAdvice.buttonText}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* FOCUS BREAKDOWN MODAL */}
                <Dialog open={isFocusBreakdownOpen} onOpenChange={setIsFocusBreakdownOpen}>
                    <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
                                ⚡ Focus Breakdown
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Monthly Capacity vs. Commitments
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="mt-4 max-h-[50vh] pr-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity (Max: {maxHours}h)</h3>
                                    <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                                        <BreakdownRow label="Base Focus" value={100} sign="+" color="text-emerald-600" />
                                        {m.founder_burnout > 0 && (
                                            <BreakdownRow label={`Burnout Penalty (${Math.round(m.founder_burnout)}%)`} value={-Math.round(Math.max(0, m.founder_burnout) * 1.2)} sign="" color="text-rose-600" />
                                        )}
                                        {(startup as any).hasCoFounder && (
                                            <BreakdownRow label="Co-Founder Focus" value={50} sign="+" color="text-indigo-600" />
                                        )}
                                        {startup.employees?.some((e: any) => e.role?.toUpperCase() === "COO") && (
                                            <BreakdownRow label="COO Delegation Bonus" value={40} sign="+" color="text-indigo-600" />
                                        )}
                                        {startup.employees?.some((e: any) => e.role?.toUpperCase() === "EA") && (
                                            <BreakdownRow label="EA Efficiency Bonus" value={30} sign="+" color="text-indigo-600" />
                                        )}
                                    </div>
                                </div>

                                {ongoingPrograms.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ongoing Programs (-{focusHoursUsed}h)</h3>
                                        <div className="bg-indigo-50/50 rounded-2xl p-3 space-y-2">
                                            {ongoingPrograms.map(p => {
                                                const def = getOngoingProgramDef(p.id);
                                                return (
                                                    <BreakdownRow
                                                        key={p.id}
                                                        label={def?.label || p.id}
                                                        value={-(def?.monthlyEnergy || 0)}
                                                        sign=""
                                                        color="text-indigo-700"
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center px-1">
                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Available Focus</span>
                                    <span className="text-xl font-black text-indigo-700">{maxHours - focusHoursUsed}h</span>
                                </div>
                            </div>
                        </ScrollArea>

                        <Button
                            className="mt-6 w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl"
                            onClick={() => setIsFocusBreakdownOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogContent>
                </Dialog>

                {/* HIRING MODAL */}
                <Dialog open={!!pendingCandidate} onOpenChange={(open) => !open && setPendingCandidate(null)}>
                    <DialogContent className="sm:max-w-md bg-white border-indigo-500 border-4 rounded-[2rem] p-6 shadow-2xl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic">
                                    Negotiate: {pendingCandidate?.name}
                                </DialogTitle>
                                <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    Pool: {(startup.metrics.option_pool || 0).toFixed(1)}%
                                </div>
                            </div>
                            <DialogDescription className="text-xs font-bold text-slate-500 uppercase">
                                
                                {pendingCandidate?.level} {getDisplayRoleName(pendingCandidate?.role || "", false)} · {pendingCandidate?.experience}Y exp
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            {(() => {
                                const cohortSize = 1;
                                return (
                                    <>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-xs font-black uppercase text-slate-400">Monthly Salary</label>
                                                <span className="text-sm font-black text-indigo-600">{formatMoney(Math.floor(hiringOffer.salary * cohortSize / 12))}/mo</span>
                                            </div>
                                            <input type="range" min={Math.floor((pendingCandidate?.expectedSalary || 40000) * 0.6 / 12)} max={Math.floor((pendingCandidate?.expectedSalary || 200000) * 4.0 / 12)} value={Math.floor(hiringOffer.salary / 12)} onChange={(e) => setHiringOffer({ ...hiringOffer, salary: parseInt(e.target.value) * 12 })} className="w-full accent-indigo-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-xs font-black uppercase text-slate-400">Equity Grant</label>
                                                <span className="text-sm font-black text-indigo-600">{(hiringOffer.equity * cohortSize).toFixed(1)}%</span>
                                            </div>
                                            <input type="range" min={0} max={cohortSize > 1 ? (10 / cohortSize) : 5.0} step={0.01} value={hiringOffer.equity} onChange={(e) => setHiringOffer({ ...hiringOffer, equity: parseFloat(e.target.value) })} className="w-full accent-indigo-500" />
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        {pendingCandidate && (() => {
                            let score = 50;
                            const EQUITY_VALUE = startup.valuation * 0.01;

                            let salaryWeight = 1.2;
                            let equityWeight = 0.8;

                            if (pendingCandidate.personality === "Stable") {
                                salaryWeight = 1.5;
                                equityWeight = 0.3;
                            } else if (pendingCandidate.personality === "Ambitious") {
                                salaryWeight = 0.8;
                                equityWeight = 1.2;
                            } else if (pendingCandidate.personality === "Creative") {
                                salaryWeight = 1.0;
                                equityWeight = 1.0;
                            }

                            // Calculate independent ratios
                            // Calculate independent ratios
                            const salaryRatio = hiringOffer.salary / pendingCandidate.expectedSalary;
                            const equityRatio = (pendingCandidate.expectedEquity || 0) > 0 
                                ? hiringOffer.equity / pendingCandidate.expectedEquity
                                : 1.0;

                            // Salary Score: Match (1.0x) = 70. Premium (2.0x) = 100.
                            const salaryScore = salaryRatio >= 1 
                                ? 70 + Math.min(30, (salaryRatio - 1) * 30)
                                : 70 * Math.pow(salaryRatio, 1.5);

                            // Equity Score: Relative to expectation
                            const equityScore = equityRatio >= 1
                                ? 70 + Math.min(30, (equityRatio - 1) * 30)
                                : 70 * equityRatio;

                            // Weights based on personality
                            let sw = 1.0, ew = 1.0;
                            if (pendingCandidate.personality === "Stable") { sw = 1.5; ew = 0.5; }
                            else if (pendingCandidate.personality === "Ambitious") { sw = 0.7; ew = 1.3; }

                            let combinedScore = (salaryScore * sw + equityScore * ew) / (sw + ew);

                            // Compensation Trade-off floors
                            if (salaryRatio >= 2.0) combinedScore = Math.max(combinedScore, 95);
                            else if (salaryRatio >= 1.5) combinedScore = Math.max(combinedScore, 80);
                            else if (salaryRatio >= 1.2) combinedScore = Math.max(combinedScore, 65);
                            else if (salaryRatio >= 1.0 && (hiringOffer.equity || 0) <= 0.001) combinedScore = Math.max(combinedScore, 45); // Floor for matching salary with 0% equity

                            score = combinedScore + ((founder.attributes.reputation || 50) - 50) / 2;
                            score = Math.min(100, Math.max(0, score));

                            let sentimentText = "";
                            let sentimentColor = "";
                            if (score >= 80) { sentimentText = `Very High Chance (${Math.round(score)}%)`; sentimentColor = "text-emerald-700 bg-emerald-50 border-emerald-200"; }
                            else if (score >= 60) { sentimentText = `Good Chance (${Math.round(score)}%)`; sentimentColor = "text-green-700 bg-green-50 border-green-200"; }
                            else if (score >= 40) { sentimentText = `Fair Chance (${Math.round(score)}%)`; sentimentColor = "text-amber-700 bg-amber-50 border-amber-200"; }
                            else if (score >= 20) { sentimentText = `Low Chance (${Math.round(score)}%)`; sentimentColor = "text-orange-700 bg-orange-50 border-orange-200"; }
                            else { sentimentText = `Very Low Chance (${Math.round(score)}%)`; sentimentColor = "text-rose-700 bg-rose-50 border-rose-200"; }

                            return (
                                <>
                                    <div className={cn("mt-4 p-2.5 rounded-xl border flex items-center justify-between", sentimentColor)}>
                                        <span className="text-[10px] font-black uppercase tracking-wider">Candidate Sentiment</span>
                                        <span className={"text-xs font-black"}>{sentimentText}</span>
                                    </div>

                                    {(() => {
                                        const required = hiringOffer.equity;
                                        const available = startup.metrics.option_pool || 0;
                                        // Epsilon check to hide "Insufficient" banner if offer is 0%
                                        if (required > 0.001 && available < required) {
                                            return (
                                                <div className="mt-4 p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl animate-in zoom-in-95 duration-200">
                                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <AlertCircle className="w-3.5 h-3.5" /> Insufficient Option Pool
                                                    </p>
                                                    <p className="text-[9px] text-rose-500 leading-tight mb-3 font-medium">
                                                        You need {required}% but only have {available.toFixed(1)}% available.
                                                    </p>
                                                    <Button 
                                                        onClick={handleAllocateESOP}
                                                        className="w-full h-9 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase rounded-xl border-b-4 border-rose-800 active:border-b-0 transition-all"
                                                    >
                                                        Expand Pool (+10% Dilution)
                                                    </Button>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {/* ── Vesting Disclaimer Note ── */}
                                    <div className="mt-4 bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 flex items-start gap-1.5">
                                        <span className="text-sm">💡</span>
                                        <p className="text-[8px] font-medium text-slate-600 leading-tight">
                                            <span className="font-bold text-indigo-700">Vesting Terms:</span> Offers follow standard 1-year cliff & 4-year linear timelines. Should employees leave pre-cliff, 100% of unvested equity restores to the option pool automatically safely.
                                        </p>
                                    </div>
                                </>
                            );
                        })()}
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setPendingCandidate(null)}>Withdraw</Button>
                            <Button className="flex-1 rounded-xl h-12 font-black bg-indigo-600 hover:bg-indigo-700 uppercase" onClick={handleHiringConfirm}>Extend Offer (⚡10-20h)</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* FUNDING MODAL — Restyled */}
                <Dialog open={!!pendingInvestor} onOpenChange={(open) => !open && setPendingInvestor(null)}>
                    <DialogContent className="sm:max-w-md bg-white border-0 rounded-3xl p-0 shadow-2xl overflow-hidden">
                        {/* Dark colored header strip */}
                        <div className="bg-gradient-to-r from-violet-700 to-purple-700 px-6 pt-6 pb-10 relative">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-sm">
                                    💼
                                </div>
                                <div>
                                    <p className="text-white font-black text-lg leading-tight">{pendingInvestor?.name}</p>
                                    <p className="text-purple-200 text-[11px] font-bold">{pendingInvestor?.firm} · {pendingInvestor?.type}</p>
                                </div>
                            </div>
                            {investorMessage && (
                                <div className="mt-4 bg-white/10 rounded-2xl px-4 py-3 text-white text-xs font-semibold italic leading-relaxed border border-white/20">
                                    “{investorMessage}”
                                </div>
                            )}
                        </div>

                        {/* Content card overlapping the header */}
                        <div className="-mt-5 bg-white rounded-t-3xl px-6 pt-5 pb-6 space-y-5">

                            {/* Counter-Offer Alert Section */}
                            {pendingCounterOffer && (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center">
                                        <Zap className="w-3.5 h-3.5 fill-amber-500" /> Investor Counter-Offer
                                    </p>
                                    <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm px-4 py-3 rounded-2xl border border-amber-100 mb-4 shadow-sm">
                                        <div className="text-center flex-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Valuation</p>
                                            <p className="text-base font-black text-amber-700">{formatMoney(pendingCounterOffer.valuation)}</p>
                                        </div>
                                        <div className="w-px h-8 bg-amber-200/50 mx-2" />
                                        <div className="text-center flex-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Equity</p>
                                            <p className="text-base font-black text-amber-700">{pendingCounterOffer.equity}%</p>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black h-12 rounded-2xl uppercase text-[11px] tracking-wider shadow-lg shadow-amber-200/50 active:scale-95 transition-all"
                                        onClick={handleAcceptCounter}
                                    >
                                        Accept Counter-Offer
                                    </Button>
                                </div>
                            )}

                            {/* Equity bar visual */}
                            <div className={cn(pendingCounterOffer ? "opacity-50 pointer-events-none grayscale-[0.3]" : "")}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership After Deal</span>
                                </div>
                                <div className="h-6 rounded-full overflow-hidden flex shadow-inner bg-slate-100">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center transition-all duration-500" style={{ width: `${Math.max(0, 100 - fundingOffer.equity)}%` }}>
                                        <span className="text-[9px] font-black text-white">{Math.max(0, 100 - fundingOffer.equity)}% You</span>
                                    </div>
                                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center transition-all duration-500" style={{ width: `${fundingOffer.equity}%` }}>
                                        {fundingOffer.equity > 5 && <span className="text-[9px] font-black text-white">{fundingOffer.equity}% Inv</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Sliders */}
                            <div>
                                <div className="flex justify-between mb-1"><label className="text-xs font-black uppercase text-slate-500">Post-Money Valuation</label><span className="text-sm font-black text-violet-600">{formatMoney(fundingOffer.valuation)}</span></div>
                                <input type="range" min={Math.floor(startup.valuation * 0.5)} max={Math.floor(startup.valuation * 2.5)} step={100000} value={fundingOffer.valuation} onChange={(e) => setFundingOffer({ ...fundingOffer, valuation: parseInt(e.target.value) })} className="w-full accent-violet-600" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1"><label className="text-xs font-black uppercase text-slate-500">Equity to Investor</label><span className="text-sm font-black text-violet-600">{fundingOffer.equity}%</span></div>
                                <input type="range" min={1} max={40} step={1} value={fundingOffer.equity} onChange={(e) => setFundingOffer({ ...fundingOffer, equity: parseInt(e.target.value) })} className="w-full accent-violet-600" />
                            </div>

                            {/* Investment amount display */}
                            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 flex items-center justify-between">
                                <span className="text-xs font-black text-violet-600 uppercase">Investment Amount</span>
                                <span className="text-base font-black text-violet-700">{formatMoney((fundingOffer.valuation * fundingOffer.equity) / 100)}</span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex gap-3">
                                <button onClick={() => {
                                    setStartup((s: any) => ({ ...s, metrics: { ...s.metrics, investor_pipeline: { ...(s.metrics.investor_pipeline || {}), term_sheets: Math.max(0, (s.metrics.investor_pipeline?.term_sheets || 0) - 1) } } }));
                                    setPendingInvestor(null);
                                }} className="flex-1 h-13 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm uppercase tracking-wide active:scale-95 transition-all">Walk Away</button>
                                <button onClick={handleFundingConfirm} className="flex-1 h-13 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-sm uppercase tracking-wide shadow-lg shadow-violet-200 active:scale-95 transition-all">Submit Pitch</button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* BOARD VOTING MODAL */}
                <Dialog open={isBoardModalOpen} onOpenChange={setIsBoardModalOpen}>
                    <DialogContent className="sm:max-w-md bg-white border-0 rounded-3xl p-0 shadow-2xl overflow-hidden">
                        <div className={cn("px-6 py-8 text-center", lastProposalResult?.status === "approved" ? "bg-emerald-500" : "bg-rose-500")}>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">
                                {lastProposalResult?.status === "approved" ? "✅" : "❌"}
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase whitespace-pre-wrap">
                                {lastProposalResult?.status === "approved" ? "Salary Approved!" : "Proposal Rejected"}
                            </h2>
                            <p className="text-white/80 font-bold text-xs mt-1 uppercase tracking-widest">
                                Board Resolution · {formatMoney(parseInt(salaryInput || "0"))} / mo
                            </p>
                        </div>

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Board Member</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vote</span>
                            </div>

                            {votingMembers.map((member, idx) => {
                                const voteData = lastProposalResult?.votes?.find((v: any) => v.memberId === member.id);
                                return (
                                    <div key={member.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-4 transition-all hover:bg-white hover:shadow-md">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 shrink-0">
                                            {member.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="font-black text-sm text-slate-800 truncate">{member.name}</p>
                                                {voteData?.vote === "yes" ? (
                                                    <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase">
                                                        <Check className="w-3 h-3" /> Yes
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-rose-500 font-black text-[10px] uppercase">
                                                        <X className="w-3 h-3" /> No
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-2">
                                                {member.type} · Stake: {member.equityWeight.toFixed(1)}%
                                            </p>
                                            <div className="bg-white/60 p-2 rounded-lg border border-slate-100 italic text-[10px] text-slate-600 leading-relaxed font-medium">
                                                “{voteData?.reason || "No comment."}”
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                            <Button
                                className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                onClick={() => setIsBoardModalOpen(false)}
                            >
                                Understood
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* TEAM MODAL - REDESIGNED */}
                <Dialog open={isTeamOpen} onOpenChange={(open) => { setIsTeamOpen(open); if (!open) { setTeamSearch(""); setTeamDeptFilter("cxo"); } }}>
                    <DialogContent className="sm:max-w-md bg-white border-emerald-500 border-4 rounded-[2rem] p-0 shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[85vh] min-h-0">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="text-xl font-black text-slate-900 uppercase italic flex items-center justify-between">
                                <span className="flex items-center gap-2"><Users className="size-5 text-emerald-600" />Company Roster</span>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                                        😊 Morale: {Math.round(startup.metrics.team_morale)}%
                                    </span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        ESOP: {(startup.metrics.option_pool || 0).toFixed(1)}%
                                    </span>
                                    {((startup.metrics as any).former_employee_equity || 0) > 0 && (
                                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            Alumni: {((startup.metrics as any).former_employee_equity as number).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Filters */}
                        {/* Filters */}
                        <div className="p-4 space-y-3 bg-slate-50/50 border-y border-slate-100 mt-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                // className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                                <Menu className="absolute left-3 top-2.5 size-4 text-slate-400" />
                            </div>
                            <div className="flex flex-wrap gap-1.5 pb-1">
                                {["cxo", "engineer", "marketer", "sales"].map((dept) => {
                                    const label = dept === "cxo" ? "CXOs" : getDisplayRoleName(dept, true);
                                    return (
                                        <button
                                            key={dept}
                                            onClick={() => setTeamDeptFilter(dept)}
                                            className={cn(
                                                "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border",
                                                teamDeptFilter === dept
                                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-4 py-2 min-h-0">
                            {(() => {
                                const allEmployeesForRoster = allEmployees;

                                const filtered = allEmployeesForRoster.filter((e: any) => {
                                    const matchesSearch = e.name.toLowerCase().includes(teamSearch.toLowerCase());
                                    const matchesDept = teamDeptFilter === "cxo" ? e.isCXO : e.role === teamDeptFilter;
                                    return matchesSearch && matchesDept;
                                });

                                if (filtered.length === 0) {
                                    return (
                                        <div className="text-center py-12">
                                            <p className="text-sm font-bold text-slate-400">No matching employees found.</p>
                                        </div>
                                    );
                                }

                                const cxos = filtered.filter((e: any) => e.isCXO);
                                const staff = filtered.filter((e: any) => !e.isCXO);

                                const renderCXOCard = (emp: any) => {
                                    const skillVal = emp.role === "engineer" ? emp.skills.technical : emp.role === "marketer" ? emp.skills.marketing : emp.skills.sales;
                                    const monthsSinceRaise = month - (emp.last_increment_at ?? emp.joined_at);
                                    const isDissatisfied = monthsSinceRaise > 12;
                                    const tenure = typeof emp.joined_at === "number" ? Math.max(0, month - emp.joined_at) : 0;

                                    return (
                                        <div key={emp.id} className="rounded-2xl border-2 border-emerald-100 bg-white p-3 flex flex-col gap-2 relative overflow-hidden bg-gradient-to-br from-emerald-50/20 to-transparent">
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl shrink-0 outline outline-2 outline-white shadow-sm",
                                                    emp.role === "engineer" ? "bg-blue-100 text-blue-600" : emp.role === "marketer" ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-600"
                                                )}>
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <p className="font-black text-slate-900 text-xs truncate uppercase">{emp.name}</p>
                                                        <span className="text-xs" title={`Morale: ${Math.round(emp.morale || 70)}%`}>
                                                            {(emp.morale ?? 70) >= 80 ? "😊" : (emp.morale ?? 70) >= 60 ? "😐" : (emp.morale ?? 70) >= 40 ? "😟" : "😤"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                        👑 {getDisplayRoleName(emp.role, false).replace(" Specialist", " (EXEC)")}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-slate-400 mt-0.5">{formatMoney(Math.floor(emp.salary / 12))}/mo</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none">Perf</p>
                                                    <p className={cn("text-xs font-black", emp.performance > 80 ? "text-emerald-500" : emp.performance > 50 ? "text-amber-500" : "text-rose-500")}>
                                                        {emp.performance}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-4 gap-1.5 mt-1 border-t border-dashed border-slate-100 pt-2">
                                                <div className="bg-slate-50/50 rounded-lg p-1.5 border border-slate-100 text-center">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Skill</p>
                                                    <p className="text-[11px] font-black text-indigo-600">{skillVal}%</p>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-lg p-1.5 border border-slate-100 text-center">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Morale</p>
                                                    <p className={cn("text-[11px] font-black", (emp.morale ?? 70) >= 80 ? "text-emerald-500" : (emp.morale ?? 70) >= 50 ? "text-amber-500" : "text-rose-500")}>
                                                        {Math.round(emp.morale || 70)}%
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-lg p-1.5 border border-slate-100 text-center">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Equity</p>
                                                    <p className="text-[11px] font-black text-violet-600">{(emp.equity || 0).toFixed(1)}%</p>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-lg p-1.5 border border-slate-100 text-center">
                                                    <p className="text-[7px] font-black text-slate-400 uppercase">Tenure</p>
                                                    <p className="text-[11px] font-black text-slate-600">{tenure}mo</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-1 mt-1 border-t border-dashed border-slate-100 pt-2">
                                                <button onClick={() => handleTrainEmployee(emp.id)} className="py-1 rounded-lg bg-white text-indigo-600 text-[8px] font-black uppercase border border-indigo-100 hover:bg-indigo-50 transition-all">Train</button>
                                                <button onClick={() => handlePromoteEmployee(emp.id)} className="py-1 rounded-lg bg-white text-amber-600 text-[8px] font-black uppercase border border-amber-100 hover:bg-amber-50 transition-all">Promote</button>
                                                <button
                                                    onClick={() => handleIncrementSalary(emp.id)}
                                                    className={cn(
                                                        "py-1 rounded-lg text-[8px] font-black uppercase border transition-all",
                                                        isDissatisfied ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                                    )}
                                                >
                                                    +15% Pay
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="py-1 px-2 rounded-lg bg-white text-slate-500 text-[8px] font-black uppercase border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-1">
                                                        Manage <Plus className="size-3" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-xl border-slate-200">
                                                        <DropdownMenuItem onClick={() => handleGrantEquity(emp.id, 0.5)} className="text-[10px] font-bold p-2 cursor-pointer">🎁 Grant 0.5% Equity</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleGrantEquity(emp.id, 1.0)} className="text-[10px] font-bold p-2 cursor-pointer">🎁 Grant 1.0% Equity</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleFireEmployee(emp.id)} className="text-[10px] font-bold p-2 text-rose-600 cursor-pointer">👋 Fire Employee</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                };

                                const renderStaffCard = (emp: any) => {
                                    const skillVal = emp.role === "engineer" ? emp.skills.technical : emp.role === "marketer" ? emp.skills.marketing : emp.skills.sales;
                                    const isExpanded = selectedEmpIdx === startup.employees.findIndex(original => original.id === emp.id);
                                    const monthsSinceRaise = month - (emp.last_increment_at ?? emp.joined_at);
                                    const isDissatisfied = monthsSinceRaise > 12;
                                    const tenure = typeof emp.joined_at === "number" ? Math.max(0, month - emp.joined_at) : 0;

                                    return (
                                        <div key={emp.id} className={cn(
                                            "rounded-2xl border-2 transition-all overflow-hidden mb-2",
                                            isExpanded ? "border-emerald-200 shadow-md transform scale-[1.01]" : "border-slate-50 bg-white hover:border-slate-100"
                                        )}>
                                            <button
                                                onClick={() => setSelectedEmpIdx(isExpanded ? -1 : startup.employees.findIndex(original => original.id === emp.id))}
                                                className="w-full text-left p-3 cursor-pointer flex items-center gap-3 bg-white"
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0",
                                                    emp.role === "engineer" ? "bg-blue-100 text-blue-600" : emp.role === "marketer" ? "bg-pink-100 text-pink-600" : "bg-emerald-100 text-emerald-600"
                                                )}>
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-slate-900 text-sm truncate uppercase">{emp.name}</p>
                                                        <span className="text-xs" title={`Morale: ${Math.round(emp.morale || 70)}%`}>
                                                            {(emp.morale ?? 70) >= 80 ? "😊" : (emp.morale ?? 70) >= 60 ? "😐" : (emp.morale ?? 70) >= 40 ? "😟" : "😤"}
                                                        </span>
                                                        {isDissatisfied && <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-black border border-rose-100 animate-pulse">RAISE</span>}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                        {emp.level} {getDisplayRoleName(emp.role, false)} · {formatMoney(Math.floor(emp.salary / 12))}/mo
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Perf</p>
                                                    <p className={cn("text-xs font-black", emp.performance > 80 ? "text-emerald-500" : emp.performance > 50 ? "text-amber-500" : "text-rose-500")}>
                                                        {emp.performance}%
                                                    </p>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                                        className="px-3 pb-3 pt-1 border-t border-slate-50 bg-slate-50/30"
                                                    >
                                                        <div className="grid grid-cols-4 gap-2 mb-3 mt-2">
                                                            <div className="bg-white rounded-xl p-2 border border-slate-100 text-center">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase">Skill</p>
                                                                <p className="text-sm font-black text-indigo-600">{skillVal}%</p>
                                                            </div>
                                                            <div className="bg-white rounded-xl p-2 border border-slate-100 text-center">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase">Morale</p>
                                                                <p className={cn("text-sm font-black", (emp.morale ?? 70) >= 80 ? "text-emerald-500" : (emp.morale ?? 70) >= 50 ? "text-amber-500" : "text-rose-500")}>
                                                                    {Math.round(emp.morale || 70)}%
                                                                </p>
                                                            </div>
                                                            <div className="bg-white rounded-xl p-2 border border-slate-100 text-center">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase">Equity</p>
                                                                <p className="text-sm font-black text-violet-600">{(emp.equity || 0).toFixed(1)}%</p>
                                                            </div>
                                                            <div className="bg-white rounded-xl p-2 border border-slate-100 text-center">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase">Tenure</p>
                                                                <p className="text-sm font-black text-slate-600">{tenure}mo</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button onClick={() => handleTrainEmployee(emp.id)} className="py-2.5 rounded-xl bg-white text-indigo-600 text-[9px] font-black uppercase border-2 border-indigo-50 hover:bg-indigo-50 transition-all">Train $2K</button>
                                                            <button onClick={() => handlePromoteEmployee(emp.id)} className="py-2.5 rounded-xl bg-white text-amber-600 text-[9px] font-black uppercase border-2 border-amber-50 hover:bg-amber-50 transition-all">Promote</button>
                                                            <button
                                                                onClick={() => handleIncrementSalary(emp.id)}
                                                                className={cn(
                                                                    "py-2.5 rounded-xl text-[9px] font-black uppercase border-2 transition-all",
                                                                    isDissatisfied ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white text-emerald-600 border-emerald-50 hover:bg-emerald-50"
                                                                )}
                                                            >
                                                                +15% Salary
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger className="py-2.5 px-4 rounded-xl bg-white text-slate-500 text-[9px] font-black uppercase border-2 border-slate-50 hover:bg-slate-50 transition-all flex items-center justify-center gap-1">
                                                                    Manage <Plus className="size-3" />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-xl border-slate-200">
                                                                    <DropdownMenuItem onClick={() => handleGrantEquity(emp.id, 0.5)} className="text-[10px] font-bold p-2 cursor-pointer">🎁 Grant 0.5% Equity</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleGrantEquity(emp.id, 1.0)} className="text-[10px] font-bold p-2 cursor-pointer">🎁 Grant 1.0% Equity</DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleFireEmployee(emp.id)} className="text-[10px] font-bold p-2 text-rose-600 cursor-pointer">👋 Fire Employee</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                };

                                return (
                                    <div className="space-y-4 pb-6">
                                        {cxos.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 flex items-center gap-1">
                                                    👑 Core Team (CXOs)
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {cxos.map(renderCXOCard)}
                                                </div>
                                            </div>
                                        )}
                                        {staff.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 mt-4 flex items-center gap-1">
                                                    👥 General Staff
                                                </p>
                                                <div className="space-y-2">
                                                    {staff.map(renderStaffCard)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                        </ScrollArea>
                    </DialogContent>
                </Dialog>

                {/* FINANCIALS MODAL */}
                <Dialog open={isFinancialsOpen} onOpenChange={setIsFinancialsOpen}>
                    <DialogContent className="sm:max-w-md bg-white border-0 rounded-3xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-5 pb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">📊</div>
                                <div>
                                    <p className="text-white font-black text-base">{startup.name} Financials</p>
                                    <p className="text-blue-200 text-[11px] font-bold">Month {month} · {startup.funding_stage}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab bar */}
                        <div className="-mt-4 mx-4 bg-white rounded-2xl shadow-lg border border-slate-100 flex p-1 shrink-0">
                            <button onClick={() => setFinancialTab("summary")} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all", financialTab === "summary" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400")}>
                                Overview
                            </button>
                            <button onClick={() => setFinancialTab("pnl")} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all", financialTab === "pnl" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400")}>
                                P&amp;L
                            </button>
                            <button onClick={() => setFinancialTab("captable")} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all", financialTab === "captable" ? "bg-violet-500 text-white shadow-sm" : "text-slate-400")}>
                                Cap Table
                            </button>
                        </div>

                        <div className="space-y-2 mt-4 px-4 pb-6 overflow-y-auto flex-1">
                            {financialTab === "summary" && (
                                <div className="space-y-2">
                                    {/* Key metrics grid */}
                                    {(() => {
                                        const netProfit = m.net_profit ?? 0;
                                        return (
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { label: "Cash", val: formatMoney(m.cash), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", explanation: "Your company bank account. Maintain at least 3 months of runway." },
                                                    { label: "MRR", val: formatMoney(m.users * m.pricing), color: "text-green-600", bg: "bg-green-50 border-green-100", explanation: "Monthly Recurring Revenue. Lifeblood of the business." },
                                                    { label: "Valuation", val: formatMoney(startup.valuation), color: "text-violet-600", bg: "bg-violet-50 border-violet-100", explanation: "Calculated based on MRR, growth, and product quality." },
                                                    { label: "Runway", val: netProfit > 0 ? "∞ Profitable" : (netProfit < 0 ? `${m.runway}mo` : "—"), color: netProfit > 0 ? "text-emerald-600" : (netProfit < 0 ? (m.runway <= 3 ? "text-rose-600" : "text-amber-600") : "text-slate-400"), bg: netProfit > 0 ? "bg-emerald-50 border-emerald-100" : (netProfit < 0 ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100"), explanation: "Time until cash runs out. Increase this by raising funds or reaching profitability." },
                                                ].map(r => (
                                                    <div
                                                        key={r.label}
                                                        onClick={() => setExpandedMetric(expandedMetric === r.label ? null : r.label)}
                                                        className={cn("p-3 rounded-2xl border transition-all cursor-pointer", r.bg, expandedMetric === r.label ? "ring-2 ring-blue-500 scale-[1.02]" : "hover:shadow-sm")}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.label}</p>
                                                            <span className="text-[9px] text-slate-300">?</span>
                                                        </div>
                                                        <p className={`text-base font-black ${r.color}`}>{r.val}</p>
                                                        <AnimatePresence>
                                                            {expandedMetric === r.label && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                    <p className="text-[9px] text-slate-600 mt-2 pt-2 border-t border-black/5 leading-tight">{r.explanation}</p>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                    {/* Detail rows */}
                                    <div className="bg-white rounded-2xl border border-slate-100 p-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit Economics</p>
                                        {(() => {
                                            const toggle = (m: string) => setExpandedMetric(expandedMetric === m ? null : m);
                                            return (
                                                <>
                                                    <StatRow label="Gross Margin" value={m.cogs ? `${Math.round(((liveRevenue - m.cogs) / (liveRevenue + 1)) * 100)}%` : "—"} color="text-emerald-600"
                                                        explanation="Revenue minus direct costs (COGS). Higher is better." isExpanded={expandedMetric === "gm"} onToggle={() => toggle("gm")} />
                                                    <StatRow label="COGS" value={formatMoney(m.cogs || 0)} color="text-rose-500"
                                                        explanation="Cost of Goods Sold. Direct expenses like server costs and API fees." isExpanded={expandedMetric === "cogs"} onToggle={() => toggle("cogs")} />
                                                    <StatRow label="OpEx" value={formatMoney(m.opex || 0)} color="text-rose-400"
                                                        explanation="Operating Expenses. Indirect costs like office rent and software." isExpanded={expandedMetric === "opex"} onToggle={() => toggle("opex")} />
                                                    <StatRow label={"Net " + (liveNetProfit > 0 ? "Profit" : (liveNetProfit < 0 ? "Loss" : "Income"))} value={formatMoney(liveNetProfit || 0)} color={liveNetProfit > 0 ? "text-emerald-600" : (liveNetProfit < 0 ? "text-rose-600" : "text-slate-500")}
                                                        explanation="Total monthly profit or loss after all expenses." isExpanded={expandedMetric === "net"} onToggle={() => toggle("net")} />
                                                    <StatRow label="CAC" value={m.cac ? formatMoney(m.cac) : "N/A"} color="text-slate-500"
                                                        explanation="Customer Acquisition Cost. Marketing spend per new user." isExpanded={expandedMetric === "cac"} onToggle={() => toggle("cac")} />
                                                    <StatRow label="LTV" value={m.ltv ? formatMoney(m.ltv) : "N/A"} color="text-blue-600"
                                                        explanation="Lifetime Value. Total revenue expected from a user." isExpanded={expandedMetric === "ltv"} onToggle={() => toggle("ltv")} />
                                                    <StatRow label="LTV:CAC" value={m.cac && m.ltv ? `${(m.ltv / m.cac).toFixed(1)}x` : "N/A"} color={(m.cac && m.ltv && m.ltv / m.cac >= 3) ? "text-emerald-600" : "text-amber-600"}
                                                        explanation="Ratio of LTV to CAC. 3x+ is healthy business. Hire a CFO to optimize." isExpanded={expandedMetric === "ltvcac"} onToggle={() => toggle("ltvcac")} />
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                            {financialTab === "captable" && (
                                <>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ownership Distribution</p>
                                    {/* Visual bar */}
                                    <div className="h-6 rounded-full overflow-hidden flex mb-3">
                                        {(startup.capTable || []).map((e: any, i: number) => {
                                            const colors = ["bg-indigo-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500", "bg-sky-500"];
                                            return <div key={i} className={`h-full ${colors[i % colors.length]} transition-all`} style={{ width: `${e.equity}%` }} title={`${e.name}: ${e.equity.toFixed(0)}%`} />;
                                        })}
                                    </div>
                                    {(startup.capTable || []).map((e: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                            <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm", e.type === "Founder" ? "bg-indigo-100" : "bg-amber-100")}>{e.type === "Founder" ? "👤" : "💼"}</span>
                                            <span className="text-sm text-slate-700 flex-1 font-semibold">{e.name}</span>
                                            <span className="text-sm font-black text-slate-800">{e.equity.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {financialTab === "pnl" && (
                                <>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly P&amp;L (Last 6 Months)</p>
                                    <div className="space-y-3">
                                        {(startup.history || []).slice(-6).reverse().map((entry: any, i: number) => (
                                            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                                <div className={`h-1 w-full ${entry.netIncome >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
                                                <div className="p-3">
                                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Month {entry.month}</p>
                                                    <StatRow label="Revenue" value={formatMoney(entry.revenue)} color="text-green-600" />
                                                    <StatRow label="COGS" value={formatMoney(-entry.cogs)} color="text-rose-400" />
                                                    <StatRow label="Gross Profit" value={formatMoney(entry.grossProfit)} color="text-slate-700" />
                                                    <StatRow label="OpEx" value={formatMoney(-entry.opex)} color="text-rose-500" />
                                                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between">
                                                        <span className="text-xs font-black uppercase text-slate-500">Net Income</span>
                                                        <span className={cn("text-xs font-black", entry.netIncome >= 0 ? "text-emerald-600" : "text-rose-600")}>{entry.netIncome >= 0 ? "+" : ""}{formatMoney(entry.netIncome)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!startup.history || startup.history.length === 0) && (
                                            <div className="text-center py-8 text-slate-400 text-xs font-bold">No history yet. Advance to next month.</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ════════════ ENDGAME MODAL ════════════ */}
                {isEndgameOpen && (() => {
                    const { computeLegacyScore } = require("../../lib/engine/legacyScore");
                    const outcome = startup.outcome ?? (endgameStory ? "wound_down" : "active");
                    const monthsPlayed = startup.history?.length ?? 0;
                    const legacy = computeLegacyScore(founder, startup, monthsPlayed);
                    const founderTake = startup.acquisition_offers?.find((o: any) => o.negotiated)?.founder_take
                        ?? (outcome === "ipo" ? Math.floor(startup.valuation * 0.20 * ((startup.capTable?.find((e: any) => e.type === "Founder")?.equity ?? 80) / 100)) : 0);

                    const OUTCOME_META: Record<string, { emoji: string; label: string; bg: string; text: string }> = {
                        ipo: { emoji: "🏛️", label: "IPO Success!", bg: "bg-violet-600", text: "text-violet-600" },
                        acquired: { emoji: "🤝", label: "Acquired!", bg: "bg-emerald-600", text: "text-emerald-600" },
                        wound_down: { emoji: "🔒", label: "Wound Down", bg: "bg-amber-500", text: "text-amber-600" },
                        bankrupt: { emoji: "💀", label: "Bankrupt", bg: "bg-rose-600", text: "text-rose-600" },
                        active: { emoji: "🏁", label: "Game Over", bg: "bg-slate-600", text: "text-slate-600" },
                    };
                    const meta = OUTCOME_META[outcome] ?? OUTCOME_META["active"];

                    return (
                        <div className="fixed inset-0 z-[100] bg-black/90 flex items-end justify-center sm:items-center p-4">
                            <div className="bg-white rounded-[2.5rem] w-full max-w-sm max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-4 border-slate-100">
                                {/* Header - fixed height */}
                                <div className={`${meta.bg} shrink-0 p-5 text-center`}>
                                    <p className="text-5xl mb-2">{meta.emoji}</p>
                                    <p className="text-white font-black text-xl uppercase tracking-wide">{meta.label}</p>
                                    <p className="text-white/80 text-sm mt-1">{startup.name} · Month {monthsPlayed}</p>
                                </div>

                                {/* Content - scrollable */}
                                <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                    {/* Founder Take */}
                                    {founderTake > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Your Personal Payout</p>
                                            <p className="text-3xl font-black text-emerald-700 mt-1">
                                                {formatMoney(founderTake)}
                                            </p>
                                            <p className="text-[9px] text-emerald-500 mt-0.5">after dilution</p>
                                        </div>
                                    )}

                                    {/* Peak Metrics */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                            <p className="text-sm font-black text-slate-800">{formatMoney(startup.peak_valuation ?? startup.valuation)}</p>
                                            <p className="text-[8px] text-slate-400 uppercase font-black mt-0.5">Peak Value</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                            <p className="text-sm font-black text-slate-800">{formatNumber(startup.peak_users ?? startup.metrics.users)}</p>
                                            <p className="text-[8px] text-slate-400 uppercase font-black mt-0.5">Peak Users</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                            <p className="text-sm font-black text-slate-800">{allEmployees.length}</p>
                                            <p className="text-[8px] text-slate-400 uppercase font-black mt-0.5">Team Size</p>
                                        </div>
                                    </div>

                                    {/* Legacy Score */}
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Legacy Score</p>
                                                <p className="text-3xl font-black text-indigo-800">{legacy.score}<span className="text-sm font-normal text-indigo-400">/100</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl">{legacy.tier.emoji}</p>
                                                <p className="text-xs font-black text-indigo-700">{legacy.tier.name}</p>
                                            </div>
                                        </div>
                                        {/* Score bar */}
                                        <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${legacy.score}%` }} />
                                        </div>
                                        {/* Breakdown */}
                                        <div className="space-y-1">
                                            {Object.entries(legacy.breakdown).map(([k, v]) => (
                                                <div key={k} className="flex justify-between items-center">
                                                    <p className="text-[9px] text-indigo-500">{k}</p>
                                                    <p className="text-[9px] font-black text-indigo-700">{v as number} pts</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Flavour Text */}
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        <p className="text-xs text-slate-600 leading-relaxed italic">{legacy.tier.flavourText}</p>
                                        <div className="mt-3 bg-white border border-amber-200 rounded-xl px-3 py-2">
                                            <p className="text-[8px] font-black text-amber-600 uppercase">Next Run Perk 🎁</p>
                                            <p className="text-[9px] text-slate-600 mt-0.5">{legacy.tier.perk}</p>
                                        </div>
                                    </div>

                                    {/* Founder Story */}
                                    {endgameStory && (
                                        <div className="bg-white border border-slate-100 rounded-2xl p-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">📖 Your Story</p>
                                            <p className="text-xs text-slate-600 leading-relaxed">{endgameStory}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer buttons - fixed bottom with safe area */}
                                <div className="p-5 border-t border-slate-100 space-y-2 shrink-0 bg-white pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
                                    {(outcome === "ipo" || outcome === "acquired") && (
                                        <button
                                            onClick={() => { setIsEndgameOpen(false); setDismissedEndgame(true); }}
                                            className="w-full py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-sm hover:bg-slate-50 transition active:scale-[0.98]"
                                        >
                                            Explore My Startup (Sandbox)
                                        </button>
                                    )}
                                    <button
                                        onClick={handleResetGame}
                                        className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wider text-sm hover:bg-indigo-700 transition active:scale-[0.98]"
                                    >
                                        Start New Game →
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <Toaster position="top-center" duration={3000} style={{ marginTop: '60px' }} toastOptions={{ className: 'font-sans shadow-xl' }} />
                {/* HOW TO PLAY MODAL */}
                <Dialog open={isHowToPlayOpen} onOpenChange={setIsHowToPlayOpen}>
                    <DialogContent className="sm:max-w-2xl bg-white border-slate-200 border-4 rounded-[2rem] p-0 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col items-stretch [&>button]:hidden">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 relative">
                            <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={() => setIsHowToPlayOpen(false)}>✕</div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-none">How To Play</h2>
                            <p className="text-indigo-200 text-sm font-medium">Your guide to building a unicorn.</p>
                        </div>

                        <HowToPlayContent />

                        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                            <Button className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 h-12 w-full sm:w-auto px-10 shadow-lg shadow-indigo-600/20" onClick={() => setIsHowToPlayOpen(false)}>GOT IT, LET'S BUILD</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* V2 ROADMAP MODAL */}
                <Dialog open={isRoadmapOpen} onOpenChange={setIsRoadmapOpen}>
                    <DialogContent className="sm:max-w-xl bg-white border-slate-200 border-4 rounded-[2.5rem] p-0 shadow-2xl overflow-hidden [&>button]:hidden font-sans max-h-[92vh] flex flex-col">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-10 relative overflow-hidden shrink-0">
                            {/* Decorative background element */}
                            <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/10 select-none pointer-events-none italic">V2</div>
                            
                            <div className="absolute top-6 right-6 text-white/50 hover:text-white cursor-pointer select-none bg-black/10 rounded-full p-2 transition-colors" onClick={() => setIsRoadmapOpen(false)}>
                                <X className="size-5" />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Rocket className="size-3" /> Upcoming Expansion
                                </div>
                                <h2 className="text-4xl font-black tracking-tight text-white mb-2 leading-tight">The Addiction Update</h2>
                                <p className="text-indigo-100 text-sm font-medium max-w-md">We're transforming Founder Sim into a global empire tycoon. Here's what's landing in your garage soon.</p>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="group bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-indigo-300 transition-all duration-300 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-2xl shadow-lg">In Development</div>
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🎭</div>
                                    <div>
                                        <p className="text-base font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">The Talent Roster Update</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Unique executive traits, legendary hires, and internal politics. Will you hire the toxic genius who builds 10x faster but destroys your team's soul?</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-purple-300 transition-all duration-300 shadow-sm relative overflow-hidden">
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🏛️</div>
                                    <div>
                                        <p className="text-base font-black text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">The Empire Expansion</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Unlock the "War Room" UI. Delegate tasks to VPs, engage in hostile takeovers, lobby the government, and lead your company to a public offering.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-rose-300 transition-all duration-300 shadow-sm relative overflow-hidden">
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">⚡</div>
                                    <div>
                                        <p className="text-base font-black text-slate-800 mb-1 group-hover:text-rose-600 transition-colors">Dynamic Crisis Engine</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">CEO burnout meltdowns, viral PR nightmares, and aggressive competitor espionage. Your choices now carry permanent weight.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-emerald-300 transition-all duration-300 shadow-sm relative overflow-hidden">
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🧠</div>
                                    <div>
                                        <p className="text-base font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">Founder Skill Web</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">A massive RPG-style skill tree. Spec into "Growth Hacking", "Product Visionary", or "Cold-Blooded Dealmaker" to unlock unique perks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-slate-100 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.02)] shrink-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">Targeting Q2 2026 Drop</p>
                            <Button className="rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white px-12 h-12 shadow-xl shadow-indigo-600/20 transition-all active:scale-95" onClick={() => setIsRoadmapOpen(false)}>
                                LET'S SCALE →
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* SAVE GAME MODAL */}
                <AnimatePresence>
                    {isSaveModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => { setIsSaveModalOpen(false); setSaveConfirmOverwrite(null); }}
                        >
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                className="w-full max-w-sm bg-white rounded-t-[2rem] p-6 shadow-2xl max-h-[85dvh] flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
                                <h2 className="text-lg font-black text-slate-900 mb-1">Save Game</h2>
                                <p className="text-[11px] text-slate-400 mb-4">{availableSaves.length}/{MAX_SLOTS} slots used</p>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                    {/* Filled Slots */}
                                    {availableSaves.map(save => (
                                        <div key={save.id} className="relative">
                                            {saveConfirmOverwrite === save.id ? (
                                                <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50 flex items-center justify-between">
                                                    <p className="text-sm font-bold text-amber-900">Overwrite this save?</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setSaveConfirmOverwrite(null)} className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm active:scale-95 transition-all">Cancel</button>
                                                        <button onClick={() => handleSaveGame(save.id)} className="text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-amber-500 shadow-sm shadow-amber-500/30 active:scale-95 transition-all">Overwrite</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => setSaveConfirmOverwrite(save.id)}
                                                    className="p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: save.brandColor ? `${save.brandColor}20` : '#eef2ff' }}>
                                                            {save.logo || '⚡'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-black text-slate-900 text-sm truncate">{save.companyName}</p>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">{formatSaveDate(save.date)}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STAGE_COLORS[save.stage] || "bg-slate-100 text-slate-600"}`}>
                                                                    {save.stage}
                                                                </span>
                                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                                    {formatMoney(save.valuation)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSave(save.id); }}
                                                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition-colors shrink-0 z-10"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Empty Slots */}
                                    {Array.from({ length: MAX_SLOTS - availableSaves.length }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-white transition-colors active:scale-[0.98]"
                                            onClick={() => handleSaveGame()}
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Plus className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Empty Slot</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Click to save game</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => { setIsSaveModalOpen(false); setSaveConfirmOverwrite(null); }}
                                    className="mt-4 w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CONFIRMATION MODAL */}
                <ConfirmModal
                    isOpen={confirmDialog.open}
                    onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
                    title={confirmDialog.title}
                    description={confirmDialog.description}
                    confirmText={confirmDialog.confirmText}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                />
            </div>
        );
    }
