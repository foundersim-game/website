"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { processMonth, StartupAction, evaluateSalaryProposal, getBoardMembers } from "@/lib/engine/simulation";
import { attemptFunding, checkEndgame } from "@/lib/engine/funding";
import { recordExit, SCENARIOS, ScenarioId, getLegacyData } from "@/lib/engine/legacy";
import { generateAcquisitionOffer } from "@/lib/engine/manda";
import { getRandomEvent } from "@/lib/engine/events";
import { generateCrisisEvent, generateFounderStory } from "@/lib/engine/ai";
import { generateInitialCompetitors, simulateCompetitors, Competitor } from "@/lib/engine/competitors";
import { checkAchievements, Achievement } from "@/lib/engine/achievements";
import { calcDynamicImpact, applyEffectsToState, type ActionUsageLog, type GameContext } from "@/lib/engine/dynamicImpact";
import { getActionDef, getOngoingProgramDef, calcFocusHours, ONGOING_PROGRAMS, IMMEDIATE_ACTIONS } from "@/lib/engine/actions";
import { processOngoingPrograms, startProgram, stopProgram, getStreakMultiplier, ongoingProgramsTotalEnergy, type ActiveProgram } from "@/lib/engine/ongoingPrograms";
import { EventModal, GameEvent, EventChoice } from "@/components/EventModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Founder, Startup, LuxuryAsset, LifestyleToggle } from "@/lib/types/database.types";
import { SaveSlot } from "@/app/page";
import { generateCandidate, calculateHiringSuccess, Candidate } from "@/lib/engine/negotiations";
import { generateInvestor, Investor } from "@/lib/engine/negotiations";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Users, User, GraduationCap, Award, TrendingUp, DollarSign, Briefcase, Menu, Save, RefreshCw, HelpCircle, Trash2, Plus, Check, X, Shield } from "lucide-react";
import { HowToPlayContent } from "@/components/HowToPlay";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { adService, REWARDED_CASH_ID } from "@/lib/services/adService";

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
        growth_rate: 0.05,
        burn_rate: 5000,
        runway: 12,
        net_profit: 0,
        product_quality: 10,
        technical_debt: 15,
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

function BigMetric({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) {
    return (
        <div className={cn("rounded-2xl p-3 border", color)}>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{icon} {label}</p>
            <p className="text-xl font-black italic text-slate-900 leading-none mt-0.5">{value}</p>
            {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
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

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-xs font-semibold text-slate-500">{label}</span>
            <span className={cn("text-xs font-black", color || "text-slate-900")}>{value}</span>
        </div>
    );
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
};

function ActionSheet({ category, startup, founder, m, selectedAction, setSelectedAction,
    selectedEmpIdx, setSelectedEmpIdx, handleTrainEmployee, handlePromoteEmployee,
    handleFireEmployee, handleIncrementSalary, setIsTeamOpen, setIsFinancialsOpen,
    competitors, handleImmediateAction, handleToggleOngoingProgram, ongoingPrograms,
    actionUsageLog, focusHoursUsed, setFocusHoursUsed, setStartup, addTimelineEvent, setIsEndgameOpen, month,
    salaryInput, setSalaryInput, setIsBoardModalOpen, setLastProposalResult, setVotingMembers,
    handlePurchaseAsset, handleToggleLifestyle }: ActionSheetProps) {

    const employees = startup.employees || [];
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

    // ── PRODUCT ────────────────────────────────────────────────────────────────
    if (category === "product") {
        const actions = IMMEDIATE_ACTIONS.filter(a => a.category === "product");
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);

        return (
            <div>
                {sheetHeader("🔧", "Product", "Instant technical execution")}
                <p className="text-[9px] text-slate-400 mb-3 tracking-widest uppercase font-black">Requires Focus Energy</p>

                <div className="space-y-1.5 mb-6">
                    {actions.map(action => {
                        const usedCount = actionUsageLog.thisMonth[action.id] ?? 0;
                        const isOver = (focusHoursUsed + action.energyCost) > maxHours * 1.5;
                        
                        // Calculate dynamic impact for the label
                        const ctx = { month, startup, founder, m: startup.metrics };
                        const { scaledEffects } = calcDynamicImpact(action, actionUsageLog, ctx);
                        
                        // Format the dynamic label
                        const dynamicImpact = Object.entries(scaledEffects)
                            .filter(([k, v]) => v && v !== 0 && k !== "technical_debt") // Hide debt in short label for brevity
                            .slice(0, 3)
                            .map(([k, v]) => {
                                const val = v as number;
                                const sign = val > 0 ? "+" : "";
                                let key = k.replace(/_/g, " ");
                                if (key === "cash") return `${val < 0 ? "-" : "+"}$${Math.abs(val / 1000).toFixed(1)}k ${startup.metrics.net_profit >= 0 ? "Cash" : "Burn"}`;
                                return `${sign}${val} ${key}`;
                            }).join(", ");

                        return (
                            <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                                className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                    isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50")}>
                                <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{action.label}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{dynamicImpact || action.impact}</p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
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
                    <span className="text-xl font-black text-slate-800 tracking-tighter">${m.pricing} <span className="text-xs text-slate-400 font-normal tracking-normal lowercase">/ user</span></span>
                    <input
                        type="range"
                        min="0" max="500" step="1"
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
                        <span>$250</span>
                        <span>$500</span>
                    </div>

                    {(() => {
                        const isPLG = startup.gtm_motion === "PLG";
                        const p = m.pricing || 0;
                        const brandGain = p === 0 ? 5 : Math.max(-15, (30 - p) * 0.1);
                        const churn = p === 0 ? 0.01 : Math.min(0.30, 0.02 + (p / 200) * 0.10);
                        const conversion = p === 0 ? 5.0 : Math.max(0.01, (isPLG ? 50 : 35) / (p + 10));

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
                                    <span className={cn("text-[10px] font-black leading-none", brandGain < 0 ? "text-rose-500" : "text-indigo-600")}>
                                        {brandGain > 0 ? '+' : ''}{brandGain.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="w-full mt-3 px-1">
                        {startup.gtm_motion === "PLG" ? (
                            <p className="text-[7px] text-slate-400 text-center italic">Best for low price & mass adoption. Higher conversion & lower tech debt growth.</p>
                        ) : (
                            <p className="text-[7px] text-slate-400 text-center italic">Best for high-ticket sales. Unlocks B2B pipeline & win-rate bonuses.</p>
                        )}
                    </div>

                    <div
                        onClick={() => setStartup((s: any) => ({ ...s, metrics: { ...s.metrics, annual_billing: !s.metrics.annual_billing } }))}
                        className={cn("mt-4 w-full p-2.5 rounded-xl border-2 text-center cursor-pointer transition text-[9px] font-black tracking-wide uppercase",
                            m.annual_billing ? "bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-50" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}
                    >
                        {m.annual_billing ? "💸 Annual Billing (Upfront Cash)" : "📅 Monthly Billing (Default)"}
                    </div>
                </div>

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
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);

        // Ongoing marketing programs
        const mktPrograms = ONGOING_PROGRAMS.filter(p => p.category_ui === "Marketing");

        return (
            <div>
                {sheetHeader("📈", "Marketing", "Actions + Ongoing Programs")}

                {/* ── Marketing Stats Panel ── */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-emerald-700 leading-none">{founder.attributes.marketing_skill}</p>
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

                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Instant Action (Costs Energy)</p>
                <div className="space-y-1.5">
                    {actions.map(action => {
                        const usedCount = actionUsageLog.thisMonth[action.id] ?? 0;
                        const isOver = (focusHoursUsed + action.energyCost) > maxHours * 1.5;
                        const uIdx = Math.min(usedCount, 4);
                        return (
                            <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                                className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                    isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50")}>
                                <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{action.label}</p>
                                    <p className="text-[9px] text-slate-400">{action.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                    <p className="text-[9px] font-black text-emerald-600 tracking-tighter">{action.impact}</p>
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
                                {(() => {
                                    const phaseMult = Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000)));
                                    const costLabel = prog.monthlyCost > 0 ? ` · ${formatMoney(prog.monthlyCost * phaseMult)}/mo` : "";
                                    return (
                                        <p className="text-[9px] text-slate-400">{prog.description}{costLabel}</p>
                                    );
                                })()}
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
        const employees = startup.employees || [];
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);

        // Generate 3 candidate profiles per role for the pipeline
        const ROLE_DEFS = [
            { role: "engineer" as const, emoji: "👨‍💻", label: "Software Engineer", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", tagBg: "bg-blue-100" },
            { role: "marketer" as const, emoji: "📣", label: "Growth Marketer", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", tagBg: "bg-pink-100" },
            { role: "sales" as const, emoji: "🤝", label: "Sales Rep", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", tagBg: "bg-emerald-100" },
        ];

        const seed = (startup.name.length + employees.length + m.users); // deterministic-ish seed
        const NAMES = ["Aarav", "Priya", "Jordan", "Mei", "Samuel", "Aisha", "Liam", "Riya", "Chris", "Nadia", "Tyler", "Zara"];
        const SKILL_TIERS = [
            { label: "Senior", skillBase: 75, salaryBase: 7500, cultureFit: 85 },
            { label: "Mid", skillBase: 55, salaryBase: 5000, cultureFit: 72 },
            { label: "Junior", skillBase: 35, salaryBase: 3000, cultureFit: 65 },
        ];

        return (
            <div>
                {sheetHeader("👥", "Hiring Pipeline", `${employees.length} on team · ${m.team_morale || 0}% morale`)}

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

                    // Power = avg_skill * headcount * performance_weight (1.0 = no CXO, +20% with CXO)
                    const engPow = Math.round(engAvg * (eng.length + cxoEng) * (cxoEng ? 1.20 : 1.0));
                    const mktPow = Math.round(mktAvg * (mkt.length + cxoMkt) * (cxoMkt ? 1.20 : 1.0));
                    const salPow = Math.round(salAvg * (sal.length + cxoSal) * (cxoSal ? 1.20 : 1.0));

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
                                emoji="🤝" label="Sales" count={sal.length} avgSk={salAvg} power={salPow}
                                drives="New User Conversions · B2B Pipeline Win Rate"
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
                                const nameIdx = (seed + ri * 3 + ti) % NAMES.length;
                                const skillVariance = ((seed + ri + ti) % 15) - 7;
                                const skill = Math.max(20, Math.min(99, tier.skillBase + skillVariance));
                                const salary = tier.salaryBase + ((seed + ti) % 500);
                                const cultureFit = Math.max(50, Math.min(99, tier.cultureFit + ((seed + ri) % 15) - 7));
                                const isOver = focusHoursUsed + 20 > maxHours * 1.5;
                                const candidateAction = roleDef.role === "engineer" ? "hire_engineer" : roleDef.role === "marketer" ? "hire_marketer" : "hire_sales";
                                return (
                                    <div
                                        key={ti}
                                        onClick={() => {
                                            if (isOver) return;
                                            // Store candidate choice in a temporary state and trigger the action
                                            setSelectedAction(candidateAction as any);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                            isOver ? "opacity-30 cursor-not-allowed border-slate-100 bg-slate-50" : `${roleDef.bg} ${roleDef.border} hover:shadow-sm`
                                        )}
                                    >
                                        <div className={`w-9 h-9 rounded-xl ${roleDef.tagBg} flex items-center justify-center font-black text-sm ${roleDef.text} shrink-0`}>
                                            {NAMES[nameIdx].charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800">{NAMES[nameIdx]} · <span className={roleDef.text}>{tier.label}</span></p>
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
                                <p className="text-sm font-bold text-slate-800">{prog.label}</p>
                                <p className="text-[9px] text-slate-400">{prog.description} · {label}</p>
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
                        { role: "COO", emoji: "⚙️", desc: "Reduces burnout · boosts morale", salary: 16000, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
                        { role: "CFO", emoji: "📊", desc: "Optimises burn · improves runway", salary: 14000, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
                        { role: "CPO", emoji: "🎯", desc: "Accelerates features · improves PMF", salary: 15000, bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
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
                            { arch: "Tech-First", emoji: "🧑‍💻", equity: 20, desc: "+25 Technical, halves tech debt growth" },
                            { arch: "GTM-First", emoji: "🧑‍💼", equity: 20, desc: "+25 Marketing, 2× brand growth speed" },
                            { arch: "Balanced", emoji: "🤼", equity: 25, desc: "+15 all skills, +20 team morale" },
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
        const stageOrder = ["Bootstrapping", "Angel Investment", "Seed Round", "Series A", "Series B"];
        const stageIdx = stageOrder.indexOf(stage);
        const canAngelFund = stageIdx === 0;
        const canSeed = stageIdx === 1;
        const canSeriesA = stageIdx === 2;
        const canSeriesB = stageIdx === 3;
        const maxed = stageIdx >= 4;

        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);
        const fundCost = 40;
        const capTable = startup.capTable || [{ name: "Founder", equity: 100, type: "Founder" }];
        const founderEquity = capTable.find((e: any) => e.type === "Founder")?.equity || 100;

        const pitchActions = [];
        if (canAngelFund) pitchActions.push({ action: "pitch_investors", emoji: "👼", label: "Find Angel Investors", sub: "$50K–$500K · 5–15% equity" });
        if (canSeed) pitchActions.push({ action: "pitch_investors", emoji: "🌱", label: "Pitch Seed Round", sub: "$500K–$2M · 15–25% equity" });
        if (canSeriesA) pitchActions.push({ action: "pitch_investors", emoji: "⚡", label: "Pitch Series A", sub: "$2M–$15M · 20–30% equity" });
        if (canSeriesB) pitchActions.push({ action: "pitch_investors", emoji: "📈", label: "Pitch Series B", sub: "$15M–$50M · 15–25% equity" });

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
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-[8px] font-black uppercase tracking-widest bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200"
                                onClick={() => {
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
                                    }, REWARDED_CASH_ID);
                                }}
                            >
                                Claim (Ads)
                            </Button>
                        </div>

                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instant Action (Costs Energy)</p>
                        {pitchActions.map((pa, idx) => {
                            const isOver = focusHoursUsed + fundCost > maxHours * 1.5;
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
                                        <p className="text-[9px] font-black text-amber-600 tracking-tighter">-10 Tech Boost</p>
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
                </div>

                {/* Close Round if Term Sheet available */}
                {(m.investor_pipeline?.term_sheets || 0) > 0 && (
                    <div className="mt-3 p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                        <p className="text-xs font-black text-emerald-800">🎉 Term Sheet Ready!</p>
                        <p className="text-[9px] text-emerald-600 mt-1 mb-3">Raise $1.5M at {formatMoney(startup.valuation)} valuation. Dilution: 20% + 10% Option Pool.</p>
                        <button
                            onClick={() => {
                                const raiseAmount = 1500000;
                                const newCap = (startup.capTable || [{ name: "Founder", equity: 100, type: "Founder" }]).map((e: any) => ({
                                    ...e,
                                    equity: parseFloat((e.equity * 0.80).toFixed(1))
                                }));
                                const founderEntry = newCap.find((e: any) => e.type === "Founder");
                                if (founderEntry) founderEntry.equity = parseFloat((founderEntry.equity - 10).toFixed(1));
                                newCap.push({ name: `VC — Seed Round`, equity: 20, type: "Investor" });
                                setStartup((s: any) => ({
                                    ...s,
                                    capTable: newCap,
                                    funding_stage: "Seed Round",
                                    metrics: {
                                        ...s.metrics,
                                        cash: s.metrics.cash + raiseAmount,
                                        option_pool: (s.metrics.option_pool || 0) + 10,
                                        investor_pipeline: { ...s.metrics.investor_pipeline, term_sheets: s.metrics.investor_pipeline.term_sheets - 1 }
                                    }
                                }));
                                addTimelineEvent(`💰 Closed Seed Round! Raised $1.5M. 20% dilution + 10% Option Pool created.`);
                            }}
                            className="w-full py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-700 transition active:scale-[0.98]"
                        >
                            Accept &amp; Close Seed Round →
                        </button>
                    </div>
                )}

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
                    const arrNow = (m.revenue ?? 0) * 12;
                    const ipoChecks = [
                        { label: "$50M ARR", pass: arrNow >= 50_000_000 },
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
                                            ipo_attempt_month: currentMonth,
                                            funding_stage: "IPO Ready"
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
                            if (window.confirm("Wind down the company? Remaining assets will be distributed to shareholders. This cannot be undone.")) {
                                setStartup((s: any) => ({ ...s, outcome: "wound_down" }));
                                addTimelineEvent("🔒 Company wound down. Remaining cash distributed to shareholders.");
                                setIsEndgameOpen(true);
                            }
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
                    return (
                        <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                            className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer mb-2 transition-all active:scale-[0.98]",
                                active ? "bg-amber-50 border-amber-300 shadow-sm" : "bg-white border-slate-100 hover:border-amber-200")}>
                            <span className="text-2xl">{prog.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{prog.label}</p>
                                <p className="text-[9px] text-slate-500 truncate mb-1.5">{prog.description}</p>
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
        const profitable = (m.net_profit || 0) >= 0;
        return (
            <div>
                {sheetHeader("📊", "Stats", "Full company overview")}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <BigMetric label="Cash" value={formatMoney(m.cash)} color="bg-emerald-50 border-emerald-100" icon="💵" />
                    <BigMetric label={profitable ? "Net Profit" : "Monthly Burn"} value={formatMoney(Math.abs(m.net_profit || m.burn_rate))} color={profitable ? "bg-green-50 border-green-100" : "bg-rose-50 border-rose-100"} icon={profitable ? "📈" : "🔥"} />
                    <BigMetric label="Valuation" value={formatMoney(startup.valuation)} color="bg-violet-50 border-violet-100" icon="🏆" />
                    <BigMetric label="Runway" value={profitable ? "∞" : `${m.runway}mo`} color="bg-blue-50 border-blue-100" icon="⏱️" />
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-0">
                    <StatRow label="Users" value={m.users.toLocaleString()} color="text-indigo-600" />
                    <StatRow label="MRR" value={formatMoney(m.users * m.pricing)} color="text-emerald-600" />
                    <StatRow label="Growth Rate" value={`${(m.growth_rate * 100).toFixed(0)}%/mo`} color="text-teal-600" />
                    <StatRow label="Product Quality" value={`${Math.round(m.product_quality || 0)}%`} color="text-blue-600" />
                    <StatRow label="Tech Debt" value={`${Math.round(m.technical_debt || 0)}%`} color={m.technical_debt > 50 ? "text-rose-600" : "text-slate-600"} />
                    <StatRow label="Reliability" value={`${Math.round(m.reliability || 80)}%`} color="text-cyan-600" />
                    <StatRow label="Brand Awareness" value={`${Math.round(m.brand_awareness || 0)}%`} color="text-pink-600" />
                    <StatRow label="Team Morale" value={`${Math.round(m.team_morale || 0)}%`} color={m.team_morale < 50 ? "text-rose-600" : "text-emerald-600"} />
                    <StatRow label="PMF Score" value={`${Math.round(startup.pmf_score || 10)}`} color="text-violet-600" />
                </div>
                <button onClick={() => setIsFinancialsOpen(true)}
                    className="mt-3 w-full py-2.5 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-700 text-xs font-black uppercase">
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
        const maxHours = calcFocusHours(burnout, startup.employees || []);
        const energyPct = Math.min(100, (focusHoursUsed / maxHours) * 100);
        const usageColors = ["text-emerald-700 bg-emerald-50 border-emerald-200", "text-blue-700 bg-blue-50 border-blue-200", "text-amber-700 bg-amber-50 border-amber-200", "text-rose-700 bg-rose-50 border-rose-200", "text-slate-500 bg-slate-50 border-slate-200"];
        const usageLabels = ["Max Impact", "High Impact", "Low Impact", "Minimal Impact", "No Effect"];
        const ACTION_GROUPS = [
            { label: "Intelligence", category: "intelligence" as const },
            { label: "Technical", category: "technical" as const },
            { label: "Leadership", category: "leadership" as const },
            { label: "Networking", category: "networking" as const },
            { label: "Marketing Skill", category: "marketing_skill" as const },
            { label: "Health", category: "health" as const },
            { label: "Burnout Recovery", category: "burnout" as const },
        ];
        // Founder ongoing programs — SHOWN FIRST
        const founderPrograms = ONGOING_PROGRAMS.filter(p => p.category_ui === "Founder" || p.category_ui === "Product");
        const activeFounderPrograms = founderPrograms.filter(p => ongoingPrograms.some(op => op.id === p.id));
        const inactiveFounderPrograms = founderPrograms.filter(p => !ongoingPrograms.some(op => op.id === p.id));

        // State for collapsed groups — stored in parent via a mini local map
        const [collapsedGroups, setCollapsedGroups] = [startup._collapsedFounderGroups || {}, (g: Record<string, boolean>) => setStartup((s: any) => ({ ...s, _collapsedFounderGroups: g }))];
        const toggleGroup = (key: string) => setCollapsedGroups({ ...collapsedGroups, [key]: !collapsedGroups[key] });

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
                        {focusHoursUsed > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-[8px] font-black uppercase tracking-widest bg-rose-100 border-rose-200 text-rose-600 hover:bg-rose-200"
                                onClick={() => {
                                    adService.showRewardedAd(() => {
                                        setFocusHoursUsed(0);
                                        toast.success("Energy Refilled!", { description: "You've earned a fresh 100% focus for this month!", icon: "⚡" });
                                    });
                                }}
                            >
                                Refill Energy (Ads)
                            </Button>
                        )}
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
                                    {(() => {
                                        const phaseMult = Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000)));
                                        const costLabel = prog.monthlyCost > 0 ? ` · ${formatMoney(prog.monthlyCost * phaseMult)}/mo` : "";
                                        return (
                                            <p className="text-[9px] text-slate-400">{prog.description}{costLabel}</p>
                                        );
                                    })()}
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
                                            const isOver = (focusHoursUsed + action.energyCost) > maxHours * 1.5;
                                            const uIdx = Math.min(usedCount, 4);
                                            return (
                                                <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                                                    className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                                        isOver ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50")}>
                                                    <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 truncate">{action.label}</p>
                                                        {(() => {
                                                            const { scaledEffects } = calcDynamicImpact(action, actionUsageLog, { 
                                                                month: startup.history?.length || 0, 
                                                                startup, 
                                                                founder, 
                                                                m 
                                                            });
                                                            const impactStr = action.impact;
                                                            // We try to replace the cash part of the string if it's there, or just append it
                                                            return (
                                                                <p className="text-[9px] text-slate-400">
                                                                    {scaledEffects.cash ? `${impactStr.replace(/-?\$?[\d.]+k?\s?(Cash|Burn)/i, "").trim()} · ${formatMoney(scaledEffects.cash)}` : impactStr}
                                                                </p>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">⚡{action.energyCost}h</span>
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
                                    {(() => {
                                        const phaseMult = Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000)));
                                        const costLabel = prog.monthlyCost > 0 ? ` · ${formatMoney(prog.monthlyCost * phaseMult)}/mo` : "";
                                        return (
                                            <p className="text-[9px] text-slate-400">{prog.description}{costLabel}</p>
                                        );
                                    })()}
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
                                        <span className="text-lg">{isFailed ? "💀" : isIPO ? "🚀" : "🏢"}</span>
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
    const [selectedAction, setSelectedAction] = useState<StartupAction>("none");
    const [isProcessing, setIsProcessing] = useState(false);
    const [endgameStory, setEndgameStory] = useState<string | null>(null);
    const [isEndgameOpen, setIsEndgameOpen] = useState(false);
    const [dismissedEndgame, setDismissedEndgame] = useState(false);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
    const [actionCategory, setActionCategory] = useState<SheetCategory | null>(null);
    const [monthSummary, setMonthSummary] = useState<any | null>(null);
    const [pendingCandidate, setPendingCandidate] = useState<Candidate | null>(null);
    const [hiringOffer, setHiringOffer] = useState({ salary: 0, equity: 0 });
    const [pendingInvestor, setPendingInvestor] = useState<Investor | null>(null);
    const [fundingOffer, setFundingOffer] = useState({ valuation: 0, equity: 0 });
    const [confirmedFunding, setConfirmedFunding] = useState<{ valuation: number; equity: number } | null>(null);
    const [confirmedHire, setConfirmedHire] = useState<Candidate | null>(null);
    const [investorMessage, setInvestorMessage] = useState<string | null>(null);
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [teamDeptFilter, setTeamDeptFilter] = useState<string>("all");
    const [selectedEmpIdx, setSelectedEmpIdx] = useState(0);
    const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);

    // ── LIFESTYLE HANDLERS ──────────────────────────────────────────────────
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
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [availableSaves, setAvailableSaves] = useState<SaveSlot[]>([]);

    useEffect(() => {
        // Fullscreen for mobile
        const enableFullscreen = async () => {
            const { Capacitor } = await import('@capacitor/core');
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
            await adService.initialize();
            await adService.showBanner();
        };
        initAds();
    }, []);
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
        const fullState = localStorage.getItem("founder_sim_state");
        if (fullState) {
            try {
                const d = JSON.parse(fullState);
                if (d.startup) {
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
                if (d.competitors) setCompetitors(d.competitors);
                if (d.unlockedAchievements) setUnlockedAchievements(d.unlockedAchievements);
                if (d.seenEventIds) setSeenEventIds(d.seenEventIds);
                if (d.ongoingPrograms) {
                    setOngoingPrograms(d.ongoingPrograms);
                    const committedEnergy = ongoingProgramsTotalEnergy(d.ongoingPrograms);
                    setFocusHoursUsed(committedEnergy);
                }

                // If loading into a dead/won state, immediately force the endgame modal open
                if (d.startup && d.startup.outcome && d.startup.outcome !== "active") {
                    setIsEndgameOpen(true);
                    setDismissedEndgame(false);
                }
            } catch (e) { console.error("Failed to load game state", e); }
        } else {
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
                                b2b_pipeline: isSLG ? { leads: initialLeads, active_deals: 1, closed_won: 0 } : s.metrics.b2b_pipeline,
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

    // Autosave
    useEffect(() => {
        if (startup.name !== "New Startup") {
            localStorage.setItem("founder_sim_state", JSON.stringify({ startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds }));
        }
    }, [startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds]);

    const handleResetGame = () => {
        if (confirm("Reset all progress? This cannot be undone.")) {
            localStorage.removeItem("founder_sim_state");
            localStorage.removeItem("founder_data");
            router.push("/");
        }
    };

    const addTimelineEvent = (text: string, monthOverride?: number) => {
        setEventsTimeline(prev => [...prev, { month: monthOverride ?? month, text }]);
    };

    const handleSaveAndQuit = () => {
        if (startup.name !== "New Startup") {
            localStorage.setItem("founder_sim_state", JSON.stringify({ startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds }));
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
            data: { startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds }
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
        const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || []);
        const newHoursUsed = focusHoursUsed + def.energyCost;
        if (newHoursUsed > maxHours * 1.3) toast.warning("⚡ Over capacity!", { description: "Burnout will spike." });
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
        addTimelineEvent(`${def.emoji} ${def.label}${multPct < 80 ? ` (×${multPct}%)` : ''}`);
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
            const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || []);
            const energyToCommit = def.monthlyEnergy || 0;

            if (focusHoursUsed + energyToCommit > maxHours * 1.5) {
                toast.error("Not enough focus energy!", { description: "You are already too over-committed." });
                return;
            }

            if (focusHoursUsed + energyToCommit > maxHours) {
                toast.warning("⚡ Over capacity!", { description: "Starting this will spike your burnout." });
            }

            setOngoingPrograms(prev => startProgram(prev, id, month));
            setFocusHoursUsed(prev => prev + energyToCommit);
            toast.success(`Started: ${def.label}`, { description: "Commitment added to your monthly focus." });
        }
    };

    // ── Hiring ────────────────────────────────────────────────────────────────
    const handleActionClick = (action: StartupAction) => {
        if (action.startsWith("hire_")) {
            const role = action.split("_")[1];
            const candidate = generateCandidate(role, startup.funding_stage);
            setPendingCandidate(candidate);
            setHiringOffer({ salary: candidate.expectedSalary, equity: candidate.expectedEquity });
        } else if (action === "pitch_investors") {
            const investor = generateInvestor(startup.funding_stage);
            setPendingInvestor(investor);
            setFundingOffer({ valuation: startup.valuation, equity: 20 });
            setInvestorMessage(null);
        } else {
            setSelectedAction(action);
        }
    };

    const handleHiringConfirm = () => {
        if (!pendingCandidate) return;

        const cohortSize = startup.phase === "Scaling" ? 10 : startup.phase === "Growth" ? 3 : 1;
        const totalEquity = hiringOffer.equity * cohortSize;
        if ((startup.metrics.option_pool || 0) < totalEquity) {
            toast.error("Insufficient Option Pool!", { description: `You need ${totalEquity}% but only have ${(startup.metrics.option_pool || 0).toFixed(1)}%` });
            return;
        }

        const result = calculateHiringSuccess(pendingCandidate, hiringOffer, startup, founder);
        if (result.success) {
            const cohortSize = startup.phase === "Scaling" ? 10 : startup.phase === "Growth" ? 3 : 1;
            toast.success(cohortSize > 1 ? `Hired Team of ${cohortSize}!` : "Hired!", { description: result.reason });
            const skillBase = pendingCandidate.level === "Lead" ? 80 : pendingCandidate.level === "Senior" ? 60 : pendingCandidate.level === "Mid" ? 40 : 20;
            const skillRandom = () => skillBase + Math.floor(Math.random() * 20);

            const newEmployees = Array.from({ length: cohortSize }).map((_, i) => ({
                id: `emp_${Date.now()}_${i}`,
                name: cohortSize > 1 ? (i === 0 ? pendingCandidate.name : `${pendingCandidate.name}'s Hire #${i}`) : pendingCandidate.name,
                role: pendingCandidate.role as "engineer" | "marketer" | "sales",
                level: pendingCandidate.level as "Senior" | "Mid" | "Junior" | "Lead",
                salary: hiringOffer.salary,
                equity: hiringOffer.equity,
                experience: pendingCandidate.experience,
                performance: 70 + Math.floor(Math.random() * 20),
                morale: 90 + Math.floor(Math.random() * 10),
                skills: {
                    technical: pendingCandidate.role === "engineer" ? skillRandom() : 20,
                    marketing: pendingCandidate.role === "marketer" ? skillRandom() : 20,
                    sales: pendingCandidate.role === "sales" ? skillRandom() : 20,
                },
                joined_at: month,
            }));

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
            addTimelineEvent(`Personnel: ${cohortSize > 1 ? `A team of ${pendingCandidate.role}s` : `${pendingCandidate.name} as ${pendingCandidate.role}`} joined.`);
            setFocusHoursUsed(curr => curr + 20);
            setSelectedAction("none");
            setPendingCandidate(null);
            setHiringOffer({ salary: 0, equity: 0 });
        } else {
            toast.error("Offer Rejected", { description: result.reason });
            addTimelineEvent(`Personnel: Failed to hire ${pendingCandidate.role}.`);
            setFocusHoursUsed(curr => curr + 10);
            setSelectedAction("none");
            setPendingCandidate(null);
        }
    };
    const handleFundingConfirm = async () => {
        if (!pendingInvestor) return;
        const investorUpdateProg = ongoingPrograms.find(p => p.id === "investor_updates");
        const streak = investorUpdateProg ? investorUpdateProg.streakMonths : 0;
        const result = attemptFunding(founder, startup, streak);

        toast.dismiss();
        if (!result) {
            toast.error("Investor passed", { description: "Adjust your terms or build more traction." });
            setInvestorMessage("We really like what you're building, but it's a bit too early for us. Keep us updated on your next round.");
            return;
        }

        setInvestorMessage(`We're in! We'd like to invest ${formatMoney(result.raised)} for ${result.equityGiven}% equity at a ${formatMoney(result.valuation)} valuation.`);

        // Map FundingRound result to State
        setStartup((s: any) => {
            const ns = { ...s, metrics: { ...s.metrics, cash: s.metrics.cash + result.raised } };
            ns.funding_stage = result.type;

            const investorEquity = result.equityGiven;
            const founderDiluted = 100 - investorEquity;
            const existingEntries = (ns.capTable || []).filter((e: any) => e.type !== "Founder");
            ns.capTable = [
                { name: "Founder", equity: parseInt(founderDiluted.toFixed(0)), type: "Founder" },
                ...existingEntries,
                { name: `${result.type} Investor`, equity: parseInt(investorEquity.toFixed(0)), type: "Investor" },
            ];
            return ns;
        });

        addTimelineEvent(`Raised ${result.type} round: ${formatMoney(result.raised)} at ${formatMoney(result.valuation)} valuation!`);
        toast.success(`Raised ${formatMoney(result.raised)}!`, { description: `Funds are immediately available.` });
        setFocusHoursUsed(curr => curr + 40);
        setSelectedAction("none");
        setConfirmedFunding(null); setFundingOffer({ valuation: 0, equity: 0 });
        setInvestorMessage(null); setPendingInvestor(null);
    };

    const handleFireEmployee = (id: string) => {
        const empToFire = startup.employees?.find(e => e.id === id);
        if (!empToFire) return;
        if (!confirm(`Fire ${empToFire.name}? This will hurt morale.`)) return;
        setStartup(s => ({
            ...s,
            employees: s.employees?.filter(e => e.id !== id) || [],
            metrics: { ...s.metrics, team_morale: Math.max(0, s.metrics.team_morale - 15), employees: s.metrics.employees - 1 },
        }));
        toast.error("Employee Terminated");
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
                if (idx === levels.length - 1) return e;
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
        try {
            const nextMonth = month + 1;

            // Trigger interstitial ad every 2 months
            if (nextMonth % 2 === 0) {
                adService.prepareInterstitial().then(() => {
                    adService.showInterstitial();
                });
            }

            // Process ongoing programs first
            const { startup: spAfter, founder: foAfter, log: progLog } = processOngoingPrograms(ongoingPrograms, month, startup, founder);
            progLog.forEach(l => addTimelineEvent(`🔄 ${l}`, nextMonth));

            // Apply burnout penalty if over-committed from ongoing programs
            const maxEnergy = calcFocusHours(spAfter.metrics.founder_burnout || 0, spAfter.employees || []);
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

            // Burnout game-over
            if ((newStartup.metrics.founder_burnout || 0) >= 100) {
                newStartup.outcome = "burnout";
                setStartup(newStartup);
                const pts = recordExit(newStartup, founder.name);
                const finalTimeline = [...eventsTimeline, { month: nextMonth, text: `Game Over: Founder burned out completely. +${pts} XP earned.` }];
                setEventsTimeline(finalTimeline);
                toast("Game Over — Burnout", { description: `You worked yourself to the ground. Earned ${pts} XP.` });
                const story = await generateFounderStory(founder.name, newStartup.name, finalTimeline.map(e => `Month ${e.month}: ${e.text}`));
                setEndgameStory(story); setIsEndgameOpen(true); setIsProcessing(false);
                return;
            }

            const endgame = checkEndgame(newStartup);
            if (endgame) {
                newStartup.outcome = endgame === "bankrupt" ? "bankrupt" : "other";
                setStartup(newStartup);
                const pts = recordExit(newStartup, founder.name);
                const finalTimeline = [...eventsTimeline, { month: nextMonth, text: `Game Over: ${endgame.toUpperCase()}! +${pts} XP earned.` }];
                setEventsTimeline(finalTimeline);
                toast("Game Over - " + endgame.toUpperCase(), { description: `Generating your founder story... Earned ${pts} XP.` });
                const story = await generateFounderStory(founder.name, newStartup.name, finalTimeline.map(e => `Month ${e.month}: ${e.text}`));
                setEndgameStory(story); setIsEndgameOpen(true); setIsProcessing(false);
                return;
            }

            // Random events
            if (Math.random() < 0.05 && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
                const crisis = await generateCrisisEvent(newStartup.industry, newStartup.metrics.users, newStartup.metrics.runway);
                if (crisis) setActiveEvent(crisis as GameEvent);
            } else {
                const ev = getRandomEvent(newStartup.phase, seenEventIds, newStartup.scenario);
                if (ev) {
                    setActiveEvent(ev);
                    if (ev.event_id) setSeenEventIds(prev => [...prev, ev.event_id!]);
                }
            }

            // Competitors
            const { updated, news, rivalActions } = simulateCompetitors(competitors, newStartup.metrics.users);
            setCompetitors(updated);
            news.forEach(n => addTimelineEvent(n, nextMonth));
            rivalActions.forEach(({ action, competitorName }) => {
                if (action.impactUser !== 0) newStartup.metrics.users = Math.max(0, Math.floor(newStartup.metrics.users * (1 + action.impactUser)));
                if (action.impactMorale !== 0) newStartup.metrics.team_morale = Math.max(0, Math.min(100, newStartup.metrics.team_morale + action.impactMorale));
                if (action.impactBrand !== 0) newStartup.metrics.brand_awareness = Math.max(0, Math.min(100, (newStartup.metrics.brand_awareness || 0) + action.impactBrand));
                
                // Real-time feedback for rival moves
                toast.error(`⚔️ Rival Move: ${competitorName}`, { 
                    description: action.description,
                    duration: 5000 
                });
            });

            // --- LIFESTYLE & ASSETS ---
            const nextFounder = { ...founder };
            
            // 1. Lifestyle Toggles (Costs & Impacts)
            let totalLifestyleCost = 0;
            const activeServices = LIFESTYLE_TOGGLES.filter(t => (nextFounder.activeToggles || []).includes(t.id));
            activeServices.forEach(s => {
                totalLifestyleCost += s.monthlyCost;
                if (s.impact.health) newStartup.metrics.founder_health = Math.min(100, (newStartup.metrics.founder_health || 0) + s.impact.health);
                if (s.impact.burnout) newStartup.metrics.founder_burnout = Math.max(0, (newStartup.metrics.founder_burnout || 0) + s.impact.burnout);
                if (s.impact.sleep) newStartup.metrics.sleep_quality = Math.min(100, (newStartup.metrics.sleep_quality || 0) + s.impact.sleep);
                if (s.impact.reputation) nextFounder.attributes.reputation = Math.min(100, (nextFounder.attributes.reputation || 0) + s.impact.reputation);
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
        const metrics = { ...startup.metrics };
        const attrs = { ...founder.attributes };

        const multiplier = startup.phase === "Scaling" ? 10 : startup.phase === "Growth" ? 3 : 1;

        const impactParts: string[] = [];
        Object.entries(choice.effects).forEach(([key, val]) => {
            let adjustedVal = val;
            if (['cash', 'burn_rate', 'revenue', 'monthlyCost', 'salary'].includes(key.toLowerCase())) {
                adjustedVal *= multiplier;
            }

            if (key in metrics) (metrics as any)[key] += adjustedVal;
            if (key in attrs) (attrs as any)[key] += adjustedVal;

            const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const isMoney = ['cash', 'revenue', 'monthlyCost', 'salary'].includes(key.toLowerCase());
            const displayVal = isMoney ? `${formatMoney(adjustedVal)}` : Math.abs(adjustedVal).toString();
            const sign = adjustedVal >= 0 ? '+' : '-';
            impactParts.push(`${formattedKey} ${sign}${displayVal}`);
        });

        setStartup({ ...startup, metrics }); setFounder({ ...founder, attributes: attrs });

        const impactString = impactParts.length > 0 ? ` (${impactParts.join(', ')})` : '';
        addTimelineEvent(`Resolved Event: ${activeEvent?.title}${impactString}`);
        // Let the EventModal handle its own closing state now to show the impact!
    };

    const m = startup.metrics;
    const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);
    const energyPct = Math.min(100, (focusHoursUsed / maxHours) * 100);

    return (
        <div className="min-h-[100dvh] flex flex-col h-[100dvh] overflow-hidden pb-[50px] md:pb-0" style={{ backgroundColor: '#f7f8fc' }}>

            {/* HEADER */}
            <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100" style={{ background: `${founderMeta.brandColor}15` }}>
                        {founderMeta.logo}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{startup.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Month {month} · {startup.industry}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black px-2.5 py-1 rounded-full">{formatMoney(m.cash)}</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center justify-center transition-colors">
                            <Menu className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mr-2 shadow-xl border-slate-200">
                            <div className="px-2 py-1.5 font-black text-xs text-slate-400 uppercase tracking-widest cursor-default select-none">Game Menu</div>
                            <DropdownMenuSeparator className="bg-slate-100" />
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
                            <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-emerald-50 focus:text-emerald-600 font-bold transition-colors" onClick={() => setIsHowToPlayOpen(true)}>
                                <HelpCircle className="mr-2 h-4 w-4" /> How To Play
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* FOCUS HEADER & CORE STATS */}
            <div className="shrink-0 flex flex-col">
                {/* Dedicated Focus Hours Bar */}
                <div className="px-4 py-3 bg-indigo-50 flex items-center justify-between border-b border-indigo-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <span className="text-xl leading-none">⚡</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-indigo-900 leading-none">Focus Energy</p>
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
                        {focusHoursUsed > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-[9px] font-black uppercase tracking-widest bg-indigo-100 border-indigo-200 text-indigo-700 hover:bg-indigo-200 ml-2"
                                onClick={() => {
                                    adService.showRewardedAd(() => {
                                        setFocusHoursUsed(0);
                                        toast.success("Energy Refilled!", { description: "You've earned a fresh 100% focus for this month!", icon: "⚡" });
                                    });
                                }}
                            >
                                Refill ⚡
                            </Button>
                        )}
                    </div>
                </div>

                {/* Core Stats Overview */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-2.5 bg-slate-50 border-b border-slate-100">
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
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-32">
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

                    return sortedMonths.map(monthNum => {
                        const events = byMonth[monthNum];
                        const isCurrentMonth = monthNum === month;
                        return (
                            <div key={monthNum} className="mb-4">
                                {/* Month Header — BitLife style */}
                                <div className={`flex items-center gap-2 mb-2 sticky top-0 py-1 ${isCurrentMonth ? "" : ""}`}>
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
            <div className="shrink-0 bg-white border-t border-slate-100 px-3 pt-2 pb-4">
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
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200"
                            style={{ maxHeight: '80vh' }}>
                            <div className="flex justify-center pt-2.5 pb-1">
                                <div className="w-10 h-1 rounded-full bg-slate-200" />
                            </div>
                            <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: 'calc(80vh - 40px)' }}>
                                <ActionSheet
                                    category={actionCategory}
                                    startup={startup}
                                    founder={founder}
                                    m={m}
                                    selectedAction={selectedAction}
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
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <EventModal event={activeEvent} onResolve={handleEventResolution} onClose={() => setActiveEvent(null)} />

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
                            {startup.phase === "Scaling" ? "Cohort of 10 " : startup.phase === "Growth" ? "Pod of 3 " : ""}
                            {pendingCandidate?.level} {pendingCandidate?.role}s · {pendingCandidate?.experience}Y exp
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {(() => {
                            const cohortSize = startup.phase === "Scaling" ? 10 : startup.phase === "Growth" ? 3 : 1;
                            return (
                                <>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-xs font-black uppercase text-slate-400">Monthly Salary {cohortSize > 1 ? `(×${cohortSize})` : ""}</label>
                                            <span className="text-sm font-black text-indigo-600">{formatMoney(Math.floor(hiringOffer.salary * cohortSize / 12))}/mo</span>
                                        </div>
                                        <input type="range" min={Math.floor((pendingCandidate?.expectedSalary || 40000) * 0.6 / 12)} max={Math.floor((pendingCandidate?.expectedSalary || 200000) * 1.6 / 12)} step={100} value={Math.floor(hiringOffer.salary / 12)} onChange={(e) => setHiringOffer({ ...hiringOffer, salary: parseInt(e.target.value) * 12 })} className="w-full accent-indigo-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-xs font-black uppercase text-slate-400">Equity Grant {cohortSize > 1 ? `(×${cohortSize})` : ""}</label>
                                            <span className="text-sm font-black text-indigo-600">{(hiringOffer.equity * cohortSize).toFixed(1)}%</span>
                                        </div>
                                        <input type="range" min={0} max={5} step={0.1} value={hiringOffer.equity} onChange={(e) => setHiringOffer({ ...hiringOffer, equity: parseFloat(e.target.value) })} className="w-full accent-indigo-500" />
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    {pendingCandidate && (() => {
                        let score = 50;
                        const EQUITY_VALUE = 10000;
                        const expectedTotalComp = pendingCandidate.expectedSalary + (pendingCandidate.expectedEquity * EQUITY_VALUE);
                        const offeredTotalComp = hiringOffer.salary + (hiringOffer.equity * EQUITY_VALUE);
                        const compRatio = offeredTotalComp / expectedTotalComp;
                        if (compRatio >= 1.2) score += 40;
                        else if (compRatio >= 1) score += 20;
                        else if (compRatio >= 0.8) score -= 10;
                        else if (compRatio >= 0.6) score -= 30;
                        else score -= 60;
                        score += ((founder.attributes.reputation || 50) - 50) / 2;

                        let sentimentText = "";
                        let sentimentColor = "";
                        if (score >= 80) { sentimentText = "Very High Chance"; sentimentColor = "text-emerald-700 bg-emerald-50 border-emerald-200"; }
                        else if (score >= 60) { sentimentText = "Good Chance"; sentimentColor = "text-green-700 bg-green-50 border-green-200"; }
                        else if (score >= 40) { sentimentText = "Fair Chance"; sentimentColor = "text-amber-700 bg-amber-50 border-amber-200"; }
                        else if (score >= 20) { sentimentText = "Low Chance"; sentimentColor = "text-orange-700 bg-orange-50 border-orange-200"; }
                        else { sentimentText = "Very Low Chance"; sentimentColor = "text-rose-700 bg-rose-50 border-rose-200"; }

                        return (
                            <div className={cn("mt-4 p-2.5 rounded-xl border flex items-center justify-between", sentimentColor)}>
                                <span className="text-[10px] font-black uppercase tracking-wider">Candidate Sentiment</span>
                                <span className={"text-xs font-black"}>{sentimentText}</span>
                            </div>
                        );
                    })()}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setPendingCandidate(null)}>Withdraw</Button>
                        <Button className="flex-1 rounded-xl h-12 font-black bg-indigo-600 hover:bg-indigo-700 uppercase" onClick={handleHiringConfirm}>Extend Offer</Button>
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

                        {/* Equity bar visual */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership After Deal</span>
                            </div>
                            <div className="h-6 rounded-full overflow-hidden flex">
                                <div className="h-full bg-indigo-500 flex items-center justify-center transition-all" style={{ width: `${Math.max(0, 100 - fundingOffer.equity)}%` }}>
                                    <span className="text-[9px] font-black text-white">{Math.max(0, 100 - fundingOffer.equity)}% You</span>
                                </div>
                                <div className="h-full bg-purple-400 flex items-center justify-center transition-all" style={{ width: `${fundingOffer.equity}%` }}>
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
                            <button onClick={() => setPendingInvestor(null)} className="flex-1 h-13 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm uppercase tracking-wide active:scale-95 transition-all">Walk Away</button>
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
            <Dialog open={isTeamOpen} onOpenChange={(open) => { setIsTeamOpen(open); if (!open) { setTeamSearch(""); setTeamDeptFilter("all"); } }}>
                <DialogContent className="sm:max-w-md bg-white border-emerald-500 border-4 rounded-[2rem] p-0 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-black text-slate-900 uppercase italic flex items-center justify-between">
                            <span className="flex items-center gap-2"><Users className="size-5 text-emerald-600" />Core Team</span>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                                    😊 Morale: {Math.round(startup.metrics.team_morale)}%
                                </span>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    ESOP: {(startup.metrics.option_pool || 0).toFixed(1)}%
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Filters */}
                    <div className="p-4 space-y-3 bg-slate-50/50 border-y border-slate-100 mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={teamSearch}
                                onChange={(e) => setTeamSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                            <Menu className="absolute left-3 top-2.5 size-4 text-slate-400" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {["all", "engineer", "marketer", "sales"].map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setTeamDeptFilter(dept)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap border",
                                        teamDeptFilter === dept 
                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    {dept === "all" ? "Everyone" : dept + "s"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-4 py-2">
                        {(() => {
                            const filtered = (startup.employees || []).filter(e => {
                                const matchesSearch = e.name.toLowerCase().includes(teamSearch.toLowerCase());
                                const matchesDept = teamDeptFilter === "all" || e.role === teamDeptFilter;
                                return matchesSearch && matchesDept;
                            });

                            if (filtered.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <p className="text-sm font-bold text-slate-400">No matching employees found.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-3 pb-6">
                                    {filtered.map((emp) => {
                                        const skillVal = emp.role === "engineer" ? emp.skills.technical : emp.role === "marketer" ? emp.skills.marketing : emp.skills.sales;
                                        const isExpanded = selectedEmpIdx === startup.employees.findIndex(original => original.id === emp.id);
                                        const monthsSinceRaise = month - (emp.last_increment_at ?? emp.joined_at);
                                        const isDissatisfied = monthsSinceRaise > 12;

                                        return (
                                            <div key={emp.id} className={cn(
                                                "rounded-2xl border-2 transition-all overflow-hidden",
                                                isExpanded ? "border-emerald-200 shadow-md transform scale-[1.01]" : "border-slate-50 bg-white hover:border-slate-100"
                                            )}>
                                                <div 
                                                    onClick={() => setSelectedEmpIdx(isExpanded ? -1 : startup.employees.findIndex(original => original.id === emp.id))}
                                                    className="p-3 cursor-pointer flex items-center gap-3"
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
                                                            {isDissatisfied && <span className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-black border border-rose-100 animate-pulse">RAISE DUE</span>}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                            {emp.level} {emp.role} · {formatMoney(Math.floor(emp.salary / 12))}/mo
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Perf</p>
                                                        <p className={cn("text-xs font-black", emp.performance > 80 ? "text-emerald-500" : emp.performance > 50 ? "text-amber-500" : "text-rose-500")}>
                                                            {emp.performance}%
                                                        </p>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div 
                                                            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                                            className="px-3 pb-3 pt-1 border-t border-slate-50 bg-slate-50/30"
                                                        >
                                                            <div className="grid grid-cols-4 gap-2 mb-3 mt-2">
                                                                <div className="bg-white rounded-xl p-2 border border-slate-100">
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Skill</p>
                                                                    <p className="text-sm font-black text-indigo-600">{skillVal}%</p>
                                                                </div>
                                                                <div className="bg-white rounded-xl p-2 border border-slate-100">
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Morale</p>
                                                                    <p className={cn("text-sm font-black", (emp.morale ?? 70) >= 80 ? "text-emerald-500" : (emp.morale ?? 70) >= 50 ? "text-amber-500" : "text-rose-500")}>
                                                                        {Math.round(emp.morale || 70)}%
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white rounded-xl p-2 border border-slate-100">
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Equity</p>
                                                                    <p className="text-sm font-black text-violet-600">{(emp.equity || 0).toFixed(1)}%</p>
                                                                </div>
                                                                <div className="bg-white rounded-xl p-2 border border-slate-100">
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Tenure</p>
                                                                    <p className="text-sm font-black text-slate-600">{month - emp.joined_at}mo</p>
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
                                    })}
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
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Cash", val: formatMoney(m.cash), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                                        { label: "MRR", val: formatMoney(m.users * m.pricing), color: "text-green-600", bg: "bg-green-50 border-green-100" },
                                        { label: "Valuation", val: formatMoney(startup.valuation), color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
                                        { label: "Runway", val: (m.net_profit ?? 0) >= 0 ? "∞ Profitable" : `${m.runway}mo`, color: (m.net_profit ?? 0) >= 0 ? "text-emerald-600" : m.runway <= 3 ? "text-rose-600" : "text-amber-600", bg: (m.net_profit ?? 0) >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100" },
                                    ].map(r => (
                                        <div key={r.label} className={`p-3 rounded-2xl border ${r.bg}`}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.label}</p>
                                            <p className={`text-base font-black mt-1 ${r.color}`}>{r.val}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Detail rows */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit Economics</p>
                                    <StatRow label="Gross Margin" value={m.cogs ? `${Math.round(((m.users * m.pricing - m.cogs) / (m.users * m.pricing + 1)) * 100)}%` : "—"} color="text-emerald-600" />
                                    <StatRow label="COGS" value={formatMoney(m.cogs || 0)} color="text-rose-500" />
                                    <StatRow label="OpEx" value={formatMoney(m.opex || 0)} color="text-rose-400" />
                                    <StatRow label={"Net " + ((m.net_profit ?? 0) >= 0 ? "Profit" : "Loss")} value={formatMoney(m.net_profit || 0)} color={(m.net_profit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"} />
                                    <StatRow label="CAC" value={m.cac ? formatMoney(m.cac) : "N/A"} color="text-slate-500" />
                                    <StatRow label="LTV" value={m.ltv ? formatMoney(m.ltv) : "N/A"} color="text-blue-600" />
                                    <StatRow label="LTV:CAC" value={m.cac && m.ltv ? `${(m.ltv / m.cac).toFixed(1)}x` : "N/A"} color={(m.cac && m.ltv && m.ltv / m.cac >= 3) ? "text-emerald-600" : "text-amber-600"} />
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
                        <div className="bg-white rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto shadow-2xl">
                            {/* Header */}
                            <div className={`${meta.bg} rounded-t-3xl p-5 text-center`}>
                                <p className="text-5xl mb-2">{meta.emoji}</p>
                                <p className="text-white font-black text-xl uppercase tracking-wide">{meta.label}</p>
                                <p className="text-white/80 text-sm mt-1">{startup.name} · Month {monthsPlayed}</p>
                            </div>

                            <div className="p-5 space-y-4">
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
                                        <p className="text-sm font-black text-slate-800">{startup.employees?.length ?? 0}</p>
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

                                <div className="space-y-2">
                                    {startup.outcome !== "ipo" && startup.outcome !== "acquired" && (
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
                    </div>
                );
            })()}

            <Toaster position="bottom-center" duration={3000} toastOptions={{ className: 'font-sans' }} />
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
        </div>
    );
}
