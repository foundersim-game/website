"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { processMonth, calculateFinancials, StartupAction, evaluateSalaryProposal, evaluateResolution, getBoardMembers, INDUSTRY_PRICING_CONFIG, PricingConfigNode, getPricingScale } from "@/lib/engine/simulation";
import { getNextFundingStage, getFundingPhase, generateFundingTerms, checkEndgame } from "@/lib/engine/funding";
import { recordExit, SCENARIOS, ScenarioId, getLegacyData } from "@/lib/engine/legacy";
import { generateAcquisitionOffer, generateMnATargets, MnATarget } from "@/lib/engine/manda";
import { getRandomEvent } from "@/lib/engine/events";
import { generateAIEvent, generateFounderStory, generateChadBanter } from "@/lib/engine/ai";
import { generateInitialCompetitors, simulateCompetitors, Competitor, generateNewCompetitor } from "@/lib/engine/competitors";
import { getEducationalAdvice, getConsultationAdvice, AdviceContent } from "@/lib/engine/mentorship";
import { CharacterDialog } from "@/components/CharacterDialog";
import { PostIpoCinematicModal } from "@/components/PostIpoCinematicModal";
import { EarningsCallModal } from "@/components/EarningsCallModal";
import { getStorylineDialog, StorylineState, StorylineDialog, getSamConsultDialog, TUTORIAL_STEPS } from "@/lib/engine/storyline";
import { PublicMarketTicker } from "@/components/PublicMarketTicker";
import { checkAchievements, Achievement } from "@/lib/engine/achievements";
import { initializeMarketStocks, processMarketMonth, executeTrade, checkMacroEventSpawn, getPlayerOwnershipPct, checkPoisonPill, executeTenderOffer, getControlThreshold, createSubsidiaryStock } from "@/lib/engine/publicMarket";
import { calcDynamicImpact, applyEffectsToState, getDepartmentPower, type ActionUsageLog, type GameContext } from "@/lib/engine/dynamicImpact";
import { ReviewTriggers } from "@/lib/services/reviewService";
import { getActionDef, getOngoingProgramDef, calcFocusHours, ONGOING_PROGRAMS, IMMEDIATE_ACTIONS, type ActionDef } from "@/lib/engine/actions";
import { processOngoingPrograms, startProgram, stopProgram, getStreakMultiplier, ongoingProgramsTotalEnergy, type ActiveProgram } from "@/lib/engine/ongoingPrograms";
import { resolveCrisisChoice, getCurrentCrisisStage, CRISIS_LABELS, CRISIS_EMOJIS, getCeoReputationLabel, getCrisisStageCount, spawnLawsuit } from "@/lib/engine/crisisEngine";
import { SKILL_NODES, SKILL_NODE_MAP, SKILL_BRANCHES, getAvailableSkillPoints, calculateTotalSkillPoints, canUnlockNode, type SkillNode, type SkillBranch } from "@/lib/engine/skillWeb";
import { EventModal, GameEvent, EventChoice, generateImpactSentence } from "@/components/EventModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Founder, Startup, LuxuryAsset, LifestyleToggle, EmployeeTrait, MarketStock, Lawsuit } from "@/lib/types/database.types";
import { SaveSlot } from "@/app/page";
import { generateCandidate, calculateHiringSuccess, Candidate, CANDIDATE_NAMES } from "@/lib/engine/negotiations";
import { generateInvestor, negotiateFunding, Investor } from "@/lib/engine/negotiations";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Users, User, GraduationCap, Award, TrendingUp, DollarSign, Briefcase, Menu, Save, RefreshCw, HelpCircle, Trash2, Plus, Check, X, Shield, Info, Rocket, AlertCircle, Percent, ChevronDown, Volume2, VolumeX, Star, Sun, Moon, Loader2, Landmark, Sparkles, Instagram, Bug } from "lucide-react";
import { HowToPlayContent } from "@/components/HowToPlay";
import StockMarketView from "@/components/StockMarketView";
import { StoreModal } from "@/components/StoreModal";
import { ManageSubsidiaryModal } from "@/components/ManageSubsidiaryModal";
import { ReportBugModal } from "@/components/ReportBugModal";
import { requestStoreReview, openStoreListing } from "@/lib/os/review";

// ── SUBSIDIARY SERIALIZATION HELPER ──────────────────────────────────────────
// Subsidiary string format (v2): name::valuation::revenue::expenses::risk::dividendRatio
// Legacy format (v1):            name::valuation::monthlySynergy::risk  (auto-migrated)
const parseSubsidiary = (subStr: string) => {
    if (subStr.includes("::")) {
        const parts = subStr.split("::");
        const name = parts[0];
        const valuation = parseInt(parts[1]) || 45000000;

        // Detect v2 format: 6 parts OR 5th part is a float (dividendRatio) after a risk keyword
        const isV2 = parts.length >= 5 && !(parseFloat(parts[4]) > 0 && parseFloat(parts[4]) <= 1);
        // v2: name::val::revenue::expenses::risk::divRatio
        // v1: name::val::synergy::risk::divRatio
        let revenue: number, expenses: number, integrationRisk: "Low" | "Medium" | "High", dividendRatio: number;

        if (parts.length >= 5 && (parts[4] === "Low" || parts[4] === "Medium" || parts[4] === "High")) {
            // v2 format
            revenue = parseInt(parts[2]) || 200000;
            expenses = parseInt(parts[3]) || 80000;
            integrationRisk = parts[4] as "Low" | "Medium" | "High";
            dividendRatio = parseFloat(parts[5]) || 0.25;
        } else {
            // v1 format — migrate: derive revenue/expenses from monthlySynergy
            const synergy = parseInt(parts[2]) || 120000;
            integrationRisk = (parts[3] || "Low") as "Low" | "Medium" | "High";
            dividendRatio = parseFloat(parts[4]) || 0.25;
            if (synergy >= 0) {
                // Profitable: revenue = synergy / 0.3 (30% margin), expenses = revenue - synergy
                revenue = Math.round(synergy / 0.3);
                expenses = revenue - synergy;
            } else {
                // Cash drain: no revenue, all expenses
                revenue = 0;
                expenses = Math.abs(synergy);
            }
        }

        const netIncome = revenue - expenses;
        return { name, valuation, revenue, expenses, netIncome, integrationRisk, dividendRatio, raw: subStr };
    }
    // Default fallback for legacy plain strings
    const revenue = 400000;
    const expenses = 160000;
    return {
        name: subStr,
        valuation: 45000000,
        revenue,
        expenses,
        netIncome: revenue - expenses,
        integrationRisk: "Low" as const,
        dividendRatio: 0.25,
        raw: subStr
    };
};

// Helper to serialize a subsidiary back to the v2 string format
const serializeSubsidiary = (s: {
    name: string; valuation: number; revenue: number; expenses: number;
    integrationRisk: string; dividendRatio: number;
}) => `${s.name}::${s.valuation}::${s.revenue}::${s.expenses}::${s.integrationRisk}::${s.dividendRatio}`;

// ── TALENT ROSTER: TraitBadge component ───────────────────────────────────────────────
const TRAIT_META: Record<EmployeeTrait, { label: string; color: string; description: string }> = {
    toxic_genius: { label: "⚡ Toxic Genius", color: "bg-rose-100 text-rose-700 border-rose-200", description: "+3 product quality/mo, -4 team morale/mo" },
    loyalist: { label: "🛡️ Loyalist", color: "bg-blue-100 text-blue-700 border-blue-200", description: "Will never resign. Requires formal firing." },
    mercenary: { label: "💸 Mercenary", color: "bg-amber-100 text-amber-700 border-amber-200", description: "Resigns if no raise for 6+ months." },
    cultural_anchor: { label: "🌟 Cultural Anchor", color: "bg-emerald-100 text-emerald-700 border-emerald-200", description: "+3 team morale/mo for the whole team." },
    bug_prone: { label: "🐛 Bug Prone", color: "bg-orange-100 text-orange-700 border-orange-200", description: "+2 technical debt/mo." },
    evangelist: { label: "📢 Evangelist", color: "bg-violet-100 text-violet-700 border-violet-200", description: "+4 brand awareness/mo (marketers only)." },
    burnout_magnet: { label: "🔥 Burnout Magnet", color: "bg-red-100 text-red-700 border-red-200", description: "+2 founder burnout/mo." },
};

function TraitBadge({ trait }: { trait: EmployeeTrait }) {
    const meta = TRAIT_META[trait];
    if (!meta) return null;
    return (
        <span
            title={meta.description}
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest cursor-help select-none ${meta.color}`}
        >
            {meta.label}
        </span>
    );
}
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { adService } from "@/lib/services/adService";
import { analyticsService } from "@/lib/services/analyticsService";
import { iapService } from "@/lib/services/iapService";
import { STRATEGY_PLAYBOOK } from "@/lib/engine/strategyPlaybook";
import { playSound, isAudioMuted, toggleAudioMute } from "@/lib/audio";
import { NetworkStatusOverlay } from "@/components/NetworkStatusOverlay";
import { App } from "@capacitor/app";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSaveDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatCooldown(nextAvail: number, currentTime: number) {
    const diff = Math.max(0, nextAvail - currentTime);
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const STAGE_COLORS: Record<string, string> = {
    "Bootstrapping": "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    "Angel Investment": "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    "Seed Round": "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    "Series A": "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    "Series B": "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
    "Series C": "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/50",
    "IPO Ready": "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 shadow-sm",
};

type RivalryAction = {
    id: string;
    label: string;
    emoji: string;
    description: string;
    energyCost: number;
    cashCost: number;
    successRate: number; // 0.0 to 1.0 (hidden from UI)
    effect: (ctx: { startup: Startup, founder: Founder, chadly: Competitor }) => { newStartup: Startup, newFounder: Founder, newChadly: Competitor, message: string };
    onFailure: (ctx: { startup: Startup, founder: Founder, chadly: Competitor }) => { newStartup: Startup, newFounder: Founder, newChadly: Competitor, message: string };
};

const RIVALRY_ACTIONS: RivalryAction[] = [
    {
        id: "analyze_rival_stack",
        label: "Analyze Stack",
        emoji: "🔎",
        description: "Find technical weaknesses in Chadly's product.",
        energyCost: 10,
        cashCost: 0,
        successRate: 0.35,
        effect: ({ startup, founder, chadly }) => {
            const newChadly = { ...chadly, valuation: Math.floor(chadly.valuation * 0.94) };
            const newFounder = { ...founder, attributes: { ...founder.attributes, technical_skill: Math.min(100, (founder.attributes.technical_skill || 0) + 3) } };
            return { newStartup: startup, newFounder, newChadly, message: "CRITICAL FIND: You exposed a recursive dependency flaw in Chadly's stack! His valuation dropped 6%." };
        },
        onFailure: ({ startup, founder, chadly }) => {
            const newStartup = { ...startup, metrics: { ...startup.metrics, founder_burnout: Math.min(100, (startup.metrics.founder_burnout || 0) + 5), brand_awareness: Math.max(0, (startup.metrics.brand_awareness || 0) - 5) } };
            return { newStartup, newFounder: founder, newChadly: chadly, message: "EXPOSED: Chadly's security team caught you probing their infra! You're hit with a cease-and-desist and a brand hit." };
        }
    },
    {
        id: "poach_rival_talent",
        label: "Poach Talent",
        emoji: "🎣",
        description: "Convince a key engineer to jump ship.",
        energyCost: 20,
        cashCost: 5000,
        successRate: 0.25,
        effect: ({ startup, founder, chadly }) => {
            const newChadly = { ...chadly, growth_rate: Math.max(1.01, (chadly.growth_rate || 1.15) - 0.05) };
            const newStartup = { ...startup, metrics: { ...startup.metrics, engineers: (startup.metrics.engineers || 0) + 1, employees: (startup.metrics.employees || 0) + 1 } };
            return { newStartup, newFounder: founder, newChadly, message: "HEIST SUCCESS: Chadly's Lead Architect just joined your team! Their growth slowed by 5%." };
        },
        onFailure: ({ startup, founder, chadly }) => {
            const newFounder = { ...founder, attributes: { ...founder.attributes, reputation: Math.max(0, (founder.attributes.reputation || 0) - 10) } };
            return { newStartup: startup, newFounder, newChadly: chadly, message: "SCANDAL: The engineer leaked your poaching attempt to the press. Your reputation took a major hit." };
        }
    },
    {
        id: "product_shadowing",
        label: "Feature Shadow",
        emoji: "👥",
        description: "Implement Chadly's best features with your own twist.",
        energyCost: 12,
        cashCost: 0,
        successRate: 0.45,
        effect: ({ startup, founder, chadly }) => {
            const newStartup = { ...startup, metrics: { ...startup.metrics, product_quality: Math.min(100, (startup.metrics.product_quality || 0) + 4), pmf_score: Math.min(100, (startup.metrics.pmf_score || 0) + 2) } };
            return { newStartup, newFounder: founder, newChadly: chadly, message: "SHADOW SUCCESS: You shipped a 'Chadly-Killer' feature. Quality & PMF increased." };
        },
        onFailure: ({ startup, founder, chadly }) => {
            const newStartup = { ...startup, metrics: { ...startup.metrics, product_quality: Math.max(0, (startup.metrics.product_quality || 0) - 5) } };
            const newFounder = { ...founder, attributes: { ...founder.attributes, reputation: Math.max(0, (founder.attributes.reputation || 0) - 5) } };
            return { newStartup, newFounder, newChadly: chadly, message: "COPYCAT FAIL: Users mocked your low-quality clone of Chadly's UI. Quality and Reputation dropped." };
        }
    },
    {
        id: "counter_pr",
        label: "Neutralize PR",
        emoji: "🛡️",
        description: "Clean up the mess after a rival's hit piece.",
        energyCost: 8,
        cashCost: 2000,
        successRate: 0.60,
        effect: ({ startup, founder, chadly }) => {
            const newFounder = { ...founder, attributes: { ...founder.attributes, reputation: Math.min(100, (founder.attributes.reputation || 0) + 5) } };
            const newStartup = { ...startup, metrics: { ...startup.metrics, brand_awareness: Math.min(100, (startup.metrics.brand_awareness || 0) + 5) } };
            return { newStartup, newFounder, newChadly: chadly, message: "PR RECOVERY: You successfully flipped the narrative. Reputation restored." };
        },
        onFailure: ({ startup, founder, chadly }) => {
            const newFounder = { ...founder, attributes: { ...founder.attributes, reputation: Math.max(0, (founder.attributes.reputation || 0) - 10) } };
            return { newStartup: startup, newFounder, newChadly: chadly, message: "PR BACKFIRE: Your attempt to counter-narrative looked desperate. Reputation hit -10." };
        }
    },

];

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
        current_season: "Normal",
        has_legal_dept: false,
    },
    employees: [],
    history: [],
} as unknown as Startup;

const FOUNDER_BASE = {
    id: "founder-1",
    name: "Alex Founder",
    background: "Engineer",

    attributes: {
        intelligence: 45,
        technical_skill: 40,
        leadership: 40,
        networking: 40,
        marketing_skill: 40,
        reputation: 40,
        risk_appetite: 65,
        stress_tolerance: 70,
    },
    xp: { technical: 0, marketing: 0, leadership: 0, fundraising: 0, total: 0 },
    personal_wealth: 25000,
    assets: [],
    activeToggles: [],
    wealth_profile: {
        portfolio: [],
        margin_loan_balance: 0,
        philanthropy_score: 0,
        active_10b51_plans: []
    }
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
    return <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-4 first:mt-0">{children}</p>;
}

function BigMetric({ label, value, sub, color, icon, explanation, isExpanded, onToggle, onInfoClick }: { label: string; value: string; sub?: string; color: string; icon: string; explanation?: string; isExpanded?: boolean; onToggle?: () => void; onInfoClick?: (e: React.MouseEvent) => void }) {
    return (
        <div
            onClick={onToggle}
            className={cn("rounded-2xl p-3 border transition-all cursor-pointer",
                color,
                color.includes("bg-") && "dark:bg-slate-900/40 dark:border-slate-800",
                isExpanded ? "ring-2 ring-indigo-500 ring-offset-2 scale-[1.02]" : "hover:border-slate-300 dark:hover:border-slate-700")}
        >
            <div className="flex justify-between items-start">
                <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{icon} {label}</p>
                <div className="flex items-center gap-1.5">
                    {onInfoClick && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onInfoClick(e); }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <Info className="w-3 h-3" />
                        </button>
                    )}
                    {explanation && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">?</span>}
                </div>
            </div>
            <p className="text-xl font-black italic text-slate-900 dark:text-white leading-none mt-0.5">{value}</p>
            {sub && <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}

            <AnimatePresence>
                {isExpanded && explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-black/5 dark:border-white/5 leading-relaxed font-medium">
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
            active ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
        )}>
            <span className="text-2xl w-8 text-center">{emoji}</span>
            <div className="flex-1">
                <p className={cn("text-sm font-bold", active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200")}>{label}</p>
                {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
            </div>
            {active && <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"><span className="text-white text-[8px] font-black">✓</span></div>}
        </div>
    );
}

function StatRow({ label, value, color, explanation, isExpanded, onToggle }: { label: string; value: string; color?: string; explanation?: string; isExpanded?: boolean; onToggle?: () => void }) {
    return (
        <div className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
            <div
                onClick={onToggle}
                className={cn("flex justify-between items-center py-2 cursor-pointer transition-all", explanation ? "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 px-1 -mx-1 rounded-lg" : "")}
            >
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">{label}</span>
                    {explanation && <span className="text-[9px] text-slate-300 dark:text-slate-500">?</span>}
                </div>
                <span className={cn("text-xs font-black", color || "text-slate-900 dark:text-slate-100")}>{value}</span>
            </div>
            <AnimatePresence>
                {isExpanded && explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 pb-2 leading-relaxed italic">
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
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100/50 dark:border-slate-800/50 last:border-0">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">{label}</span>
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
type SheetCategory = "product" | "marketing" | "hiring" | "funding" | "stats" | "founder" | "market" | "lifestyle" | "trade_stock" | "personal_trade" | "options" | "analysts" | "pr_comms" | "buyback" | "corporate_debt" | "manda_acquire" | "subsidiary" | "margin_loan" | "10b51" | "philanthropy" | "lobbying" | "board_mgmt" | "fines";

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
    setIsBurnBreakdownOpen: (b: boolean) => void;
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
    setFounder: (f: any) => void;
    marketStocks?: MarketStock[];
    setMarketStocks?: (s: MarketStock[]) => void;
    mnaTargets?: MnATarget[];
    setMnaTargets?: (t: MnATarget[]) => void;
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
    isPremium: boolean;
    rejectedCandidates: string[];
    allEmployees: any[];
    handleRivalryAction: (action: RivalryAction) => void;
    setActionCategory: (c: SheetCategory | null) => void;
    onUnlockSkill: (nodeId: import("@/lib/types/database.types").SkillNodeId) => void;
    hrSearchRole: "engineer" | "marketer" | "sales" | "legal";
    setHrSearchRole: (r: "engineer" | "marketer" | "sales" | "legal") => void;
    hrCandidates: any[];
    setHrCandidates: (c: any[]) => void;
    isProcessing: boolean;
    handleAcquireRival: (comp: Competitor) => void;
    setCompetitors: React.Dispatch<React.SetStateAction<Competitor[]>>;
};

function ActionSheet({ category, startup, founder, m, selectedAction, setSelectedAction,
    selectedEmpIdx, setSelectedEmpIdx, handleTrainEmployee, handlePromoteEmployee,
    handleFireEmployee, handleIncrementSalary, setIsTeamOpen, setIsFinancialsOpen, setIsBurnBreakdownOpen,
    competitors, handleImmediateAction, handleToggleOngoingProgram, ongoingPrograms,
    actionUsageLog, focusHoursUsed, setFocusHoursUsed, setStartup, addTimelineEvent, setIsEndgameOpen, month,
    salaryInput, setSalaryInput, setIsBoardModalOpen, setLastProposalResult, setVotingMembers,
    handlePurchaseAsset, handleToggleLifestyle, handleActionClick, handleAllocateESOP, expandedMetric, setExpandedMetric, currentTime, cashGrants, setCashGrants, energyRefills, setEnergyRefills, setConfirmDialog, isOnline, isPremium, rejectedCandidates, allEmployees, handleRivalryAction, setActionCategory, onUnlockSkill, setFounder, marketStocks, setMarketStocks, mnaTargets, setMnaTargets,
    hrSearchRole, setHrSearchRole, hrCandidates, setHrCandidates, isProcessing, handleAcquireRival, setCompetitors }: ActionSheetProps) {

    const employees = allEmployees;
    const [isManageSubModalOpen, setIsManageSubModalOpen] = useState(false);
    const [selectedSubRaw, setSelectedSubRaw] = useState<string>("");
    const [borrowSlideVal, setBorrowSlideVal] = useState<number>(0);
    const [repaySlideVal, setRepaySlideVal] = useState<number>(0);
    const { monthlyRevenue: liveRevenue } = calculateFinancials(startup, founder);
    const liveNetProfit = liveRevenue - (m.cogs || 0) - (m.opex || 0);
    const profitable = liveNetProfit >= 0;

    const safeIdx = Math.min(selectedEmpIdx, Math.max(0, employees.length - 1));
    const emp = employees[safeIdx];
    const [tradeSectorFilter, setTradeSectorFilter] = useState("All");
    const [tradeSelectedSymbol, setTradeSelectedSymbol] = useState<string | null>(null);
    const [tradeQtyPct, setTradeQtyPct] = useState(10);
    const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);

    const renderActionCard = (action: ActionDef, category: string) => {
        const usedCount = actionUsageLog.thisMonth[action.id] ?? 0;
        const isOver = (focusHoursUsed + action.energyCost) > maxHours * (category === 'founder' ? 1.0 : 1.2);

        const { scaledEffects } = calcDynamicImpact(action, actionUsageLog, { month, startup, founder, m });

        const effectsList = Object.entries(scaledEffects)
            .filter(([k, v]) => v && v !== 0 && k !== "cash")
            .map(([k, v]) => {
                const val = v as number;
                const sign = val > 0 ? "+" : "";
                let label = k.replace(/_/g, " ")
                    .replace("intelligence", "Int")
                    .replace("technical skill", "Tech")
                    .replace("leadership", "Lead")
                    .replace("networking", "Net")
                    .replace("marketing skill", "Mkt")
                    .replace("founder burnout", "Burnout")
                    .replace("founder health", "Health")
                    .replace("product quality", "Quality")
                    .replace("technical debt", "Debt")
                    .replace("reliability", "Rel")
                    .replace("brand awareness", "Brand");

                // Capitalize first letter of each word
                label = label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return `${sign}${Math.abs(val) < 1 ? val.toFixed(1) : Math.round(val)} ${label}`;
            }).join(" · ");

        const colors = {
            product: "hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/30",
            marketing: "hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
            pricing: "hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
            founder: "hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
        };
        const colorClass = (colors as any)[category] || colors.founder;

        return (
            <div key={action.id} onClick={() => !isOver && handleImmediateAction(action.id)}
                className={cn("flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                    isOver ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed" : `bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 ${colorClass}`)}>
                <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
                <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{action.label}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight pr-2">{action.description.replace(/\s*\(\$\d+(?:,\d+)?\)/i, "")}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-tighter text-right leading-tight max-w-[130px] whitespace-normal">{effectsList}</p>
                    <div className="flex gap-1 items-center">
                        {scaledEffects.cash && (
                            <span className="text-[8px] font-bold text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-full">(Cost: ${Math.round(Math.abs(scaledEffects.cash)).toLocaleString()})</span>
                        )}
                        <span className="text-[8px] font-black bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">⚡{action.energyCost}h</span>
                    </div>
                </div>
            </div>
        );
    };

    const sheetHeader = (emoji: string, title: string, sub: string) => (
        <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{title}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub}</p>
                </div>
            </div>
        </div>
    );

    const handleBulkAction = (type: "salary_raise" | "bonus" | "offsite" | "stock_grant") => {
        let totalCost = 0;
        let poolCost = 0;

        const processPerson = (person: any) => {
            if (!person) return person;
            if (type === "salary_raise") {
                totalCost += (person.salary * 0.1);
                return {
                    ...person,
                    salary: Math.floor(person.salary * 1.1),
                    morale: Math.min(100, (person.morale || 70) + 15),
                    last_increment_at: month
                };
            }
            if (type === "bonus") {
                totalCost += 2500;
                return { ...person, morale: Math.min(100, (person.morale || 70) + 20) };
            }
            if (type === "offsite") {
                totalCost += 5000;
                return { ...person, morale: Math.min(100, (person.morale || 70) + 30) };
            }
            if (type === "stock_grant") {
                poolCost += 0.05;
                return { ...person, morale: Math.min(100, (person.morale || 70) + 10) };
            }
            return person;
        };

        const newEmployees = (startup.employees || []).map(processPerson);

        const newCxoTeam = { ...(startup.cxoTeam || {}) };
        Object.keys(newCxoTeam).forEach(role => {
            if (newCxoTeam[role]) {
                newCxoTeam[role] = processPerson(newCxoTeam[role]);
            }
        });

        // Validation
        if (type !== "salary_raise" && type !== "stock_grant" && startup.metrics.cash < totalCost) {
            toast.error("Insufficient Cash");
            return;
        }
        if (type === "stock_grant" && (startup.metrics.option_pool || 0) < poolCost) {
            toast.error("Insufficient ESOP Pool");
            return;
        }

        setStartup((prev: any) => ({
            ...prev,
            employees: newEmployees,
            cxoTeam: newCxoTeam,
            metrics: {
                ...prev.metrics,
                cash: prev.metrics.cash - (type === "salary_raise" ? 0 : totalCost),
                option_pool: (prev.metrics.option_pool || 0) - poolCost
            }
        }));

        const actionLabels = {
            salary_raise: "💰 Applied company-wide salary raise (Staff & Execs)",
            bonus: "💸 Issued quarterly bonus to all staff and CXOs",
            offsite: "🏕️ Organized company-wide offsite for morale",
            stock_grant: "📄 Granted ESOP stock refresh to all employees"
        };
        addTimelineEvent(actionLabels[type]);

        const totalPeople = (startup.employees?.length || 0) + Object.values(startup.cxoTeam || {}).filter(Boolean).length;
        toast.success("Policy Applied", {
            description: `${type.replace("_", " ")} applied to all ${totalPeople} team members.`,
            icon: "✅"
        });
    };

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
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">{prog.description}</p>
                <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black">{effectsList}{costLabel}</p>
            </div>
        );
    };

    // ── PRODUCT ────────────────────────────────────────────────────────────────
    if (category === "product") {
        const actions = IMMEDIATE_ACTIONS.filter(a => a.category === "product");
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);

        return (
            <div>
                {sheetHeader("🔧", "Product", "Instant technical execution")}

                {/* ── Engineering Capacity Meter ── */}
                {(() => {
                    const power = getDepartmentPower("product", startup);
                    const users = m.users || 0;
                    const reqPower = Math.max(10, Math.pow(users, 0.45) * 1.5);
                    const capacityRatio = Math.min(1.0, power / reqPower);
                    const capacityPct = Math.round(capacityRatio * 100);
                    const colorClass = capacityPct < 50 ? "bg-rose-500" : capacityPct < 90 ? "bg-amber-500" : "bg-emerald-500";
                    const textClass = capacityPct < 50 ? "text-rose-400" : capacityPct < 90 ? "text-amber-400" : "text-emerald-400";

                    return (
                        <div className="mb-4 space-y-2">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <div className="flex justify-between items-end mb-1.5">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Eng. Capacity</p>
                                        <h3 className={`text-xl font-black italic leading-none ${textClass}`}>{capacityPct}%</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Execution Scale</p>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">{Math.round(power)} / {Math.round(reqPower)} Power</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${colorClass} transition-all duration-700`} style={{ width: `${capacityPct}%` }} />
                                </div>
                            </div>

                            {/* ── Innovation Metric ── */}
                            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 rounded-2xl">
                                <div className="flex justify-between items-end mb-1.5">
                                    <p className="text-[10px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-widest leading-none">🚀 Innovation Level</p>
                                    <p className="text-xs font-black text-violet-800 dark:text-violet-300">{Math.round(m.innovation || 0)}/100</p>
                                </div>
                                <div className="h-1.5 w-full bg-violet-100 dark:bg-violet-900/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 transition-all duration-700" style={{ width: `${m.innovation || 0}%` }} />
                                </div>
                                <p className="mt-2 text-[7px] font-bold text-violet-600 dark:text-violet-500 uppercase leading-none tracking-tight">
                                    High Innovation increases Valuation & Fundraising Success.
                                </p>
                            </div>

                            {capacityPct < 100 && (
                                <p className="mt-1 text-[8px] font-black text-rose-500 dark:text-rose-400 uppercase leading-none tracking-tighter px-1">
                                    ⚠️ Throttled: Team is too small for {users.toLocaleString()} users. Actions are {100 - capacityPct}% less effective.
                                </p>
                            )}
                        </div>
                    );
                })()}

                <p className="text-[9px] text-slate-400 dark:text-slate-500 tracking-widest uppercase font-black mb-3">Requires Focus Energy</p>
                <div className="space-y-1.5">
                    {actions.map(action => renderActionCard(action, "product"))}
                </div>

                <div className="flex flex-col items-center gap-1 mb-3">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Pricing Strategy</p>
                    <div className={cn("px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
                        startup.gtm_motion === "PLG" ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400")}>
                        {startup.gtm_motion === "PLG" ? "✨ Product-Led Growth Active" : "🤝 Sales-Led Growth Active"}
                    </div>
                </div>
                <div className="w-full max-w-[250px] mx-auto mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    {(() => {
                        const ind = startup.industry || "SaaS Platform";
                        const isPLG = startup.gtm_motion === "PLG";
                        const cfgBase = INDUSTRY_PRICING_CONFIG[ind] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
                        const cfg = isPLG ? cfgBase.PLG : cfgBase.SLG;

                        return (
                            <div className="w-full">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cfg.label}</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">
                                        {cfg.unit === "%" ? `${m.pricing}%` : `$${m.pricing}`}
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal tracking-normal lowercase"> {cfg.unit}</span>
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
                                    <div key={sl.key} className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 w-full">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">{sl.label}</span>
                                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{m[sl.key] || 0}{sl.unit}</span>
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
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 w-full grid grid-cols-3 gap-1 text-center">
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
                                                <span className={cn("text-[10px] font-black leading-none", loopPower < 1.0 ? "text-rose-600" : loopPower > 1.4 ? "text-emerald-500" : "text-amber-600")}>
                                                    {loopPower.toFixed(2)}x
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })()}
                </div>

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
                        <div className="w-full mt-3 px-2 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/50 rounded-xl">
                            <p className="text-[8px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">{label}</p>
                            <p className="text-[8px] text-emerald-600 mt-0.5"><span className="font-bold">Pro:</span> {pros}</p>
                            <p className="text-[8px] text-rose-500"><span className="font-bold">Con:</span> {cons}</p>
                        </div>
                    );
                })()}

                {/* Strategy Playbook Card */}
                {(() => {
                    const key = `${startup.industry}_${startup.gtm_motion}`;
                    const pb = STRATEGY_PLAYBOOK[key];
                    if (!pb) return null;
                    return (
                        <div className="mt-3 bg-slate-800 dark:bg-slate-900 rounded-2xl p-4 border border-slate-700 dark:border-slate-800 shadow-md">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <span>📖</span> Strategy Playbook — {pb.model}
                            </p>
                            <div className="space-y-3">
                                <div className="flex gap-2.5">
                                    <span className="text-base shrink-0 mt-0.5">👤</span>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Your Customers</p>
                                        <p className="text-[10px] text-slate-200 font-medium leading-snug">{pb.customers}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="text-base shrink-0 mt-0.5">💵</span>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">MRR Formula</p>
                                        <p className="text-[10px] text-emerald-400 font-bold leading-snug">{pb.mrrFormula}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="text-base shrink-0 mt-0.5">🚀</span>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Growth Lever</p>
                                        <p className="text-[10px] text-slate-200 font-medium leading-snug">{pb.growthLever}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <span className="text-base shrink-0 mt-0.5">⚠️</span>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Main Risk</p>
                                        <p className="text-[10px] text-rose-400 font-medium leading-snug">{pb.mainRisk}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {m.pricing > 199 && m.b2b_pipeline && (
                    <div className="mt-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-3 space-y-1">
                        <p className="text-[9px] font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-2">🤝 B2B Sales Pipeline</p>
                        <StatRow label="Leads" value={m.b2b_pipeline.leads.toLocaleString()} color="text-indigo-600 dark:text-indigo-400" />
                        <StatRow label="Active Deals" value={m.b2b_pipeline.active_deals.toLocaleString()} color="text-amber-600 dark:text-amber-400" />
                        <StatRow label="Deals Won" value={m.b2b_pipeline.closed_won.toLocaleString()} color="text-emerald-600 dark:text-emerald-400" />
                        <p className="text-[8px] text-indigo-500 dark:text-indigo-500 mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/50 leading-tight">Enterprise sales takes 1-3 months. Win rate depends on quality & sales team.</p>
                    </div>
                )}

                <div className="mt-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 space-y-1">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Product Stats</p>
                    <StatRow label="Quality" value={`${Math.round(m.product_quality || 0)}%`} color="text-indigo-600 dark:text-indigo-400" />
                    <StatRow label="Reliability" value={`${Math.round(m.reliability || 0)}%`} color="text-cyan-600 dark:text-cyan-400" />
                    <StatRow label="Tech Debt" value={`${Math.round(m.technical_debt || 0)}%`} color={m.technical_debt > 50 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"} />
                    <StatRow label="PMF Score" value={`${Math.round(m.pmf_score || 0)}`} color="text-violet-600 dark:text-violet-400" />
                </div>
            </div>
        );
    }

    // ── MARKETING ──────────────────────────────────────────────────────────────
    if (category === "marketing") {
        const actions = IMMEDIATE_ACTIONS.filter(a => a.category === "marketing_skill");
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);

        // Ongoing marketing programs
        const mktPrograms = ONGOING_PROGRAMS.filter(p => p.category_ui === "Marketing");

        return (
            <div>
                {sheetHeader("📈", "Marketing", "Actions + Ongoing Programs")}

                {/* ── Marketing Stats Panel ── */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none">{Math.round(founder.attributes.marketing_skill || 10)}</p>
                        <p className="text-[8px] font-black text-emerald-500 dark:text-emerald-500 uppercase tracking-wide mt-0.5">Mkt Skill</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-rose-950/20 border border-pink-100 dark:border-rose-900/50 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-pink-700 dark:text-rose-400 leading-none">{Math.round(m.brand_awareness || 0)}%</p>
                        <p className="text-[8px] font-black text-pink-500 dark:text-rose-400 uppercase tracking-wide mt-0.5">Brand</p>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 rounded-2xl p-2.5 text-center">
                        <p className="text-lg font-black text-violet-700 dark:text-violet-400 leading-none">{startup.employees?.filter((e: any) => e.role === "marketer").length || 0}</p>
                        <p className="text-[8px] font-black text-violet-500 dark:text-violet-500 uppercase tracking-wide mt-0.5">Marketers</p>
                    </div>
                </div>

                {/* ── Growth Capacity Meter ── */}
                {(() => {
                    const power = getDepartmentPower("growth", startup);
                    const users = m.users || 0;
                    const reqPower = Math.max(10, Math.pow(users, 0.45) * 1.5);
                    const capacityRatio = Math.min(1.0, power / reqPower);
                    const capacityPct = Math.round(capacityRatio * 100);
                    const colorClass = capacityPct < 50 ? "bg-rose-500" : capacityPct < 90 ? "bg-amber-500" : "bg-emerald-500";
                    const textClass = capacityPct < 50 ? "text-rose-400" : capacityPct < 90 ? "text-amber-400" : "text-emerald-400";

                    return (
                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                            <div className="flex justify-between items-end mb-1.5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Growth Capacity</p>
                                    <h3 className={`text-xl font-black italic leading-none ${textClass}`}>{capacityPct}%</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Execution Scale</p>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{Math.round(power)} / {Math.round(reqPower)} Power</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${colorClass} transition-all duration-700`} style={{ width: `${capacityPct}%` }} />
                            </div>
                            {capacityPct < 100 && (
                                <p className="mt-2 text-[8px] font-black text-rose-500 dark:text-rose-400 uppercase leading-none tracking-tighter">
                                    ⚠️ Throttled: Team is too small for {users.toLocaleString()} users. Growth actions are {100 - capacityPct}% less effective.
                                </p>
                            )}
                        </div>
                    );
                })()}

                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-2 mb-4 flex justify-between items-center">
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">Growth Rate</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{(m.growth_rate * 100).toFixed(1)}%/mo</p>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">CAC</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">${(m.cac || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <div className="text-center">
                        <p className="text-[8px] font-black text-emerald-500 dark:text-emerald-500 uppercase tracking-wide">PMF</p>
                        <p className={cn("text-xs font-black", (m.pmf_score || 0) < 30 ? "text-rose-600 dark:text-rose-400" : (m.pmf_score || 0) < 60 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>{Math.round(m.pmf_score || 0)}</p>
                    </div>
                </div>

                {/* Marketing Strategy Context */}
                {(() => {
                    const key = `${startup.industry}_${startup.gtm_motion}`;
                    const pb = STRATEGY_PLAYBOOK[key];
                    if (!pb) return null;
                    return (
                        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                            <p className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1.5">🎯 Your Growth Playbook</p>
                            <p className="text-[10px] text-emerald-800 dark:text-emerald-200 leading-tight font-semibold mb-1">{pb.growthLever}</p>
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-500 leading-tight">{pb.marketingTip}</p>
                        </div>
                    );
                })()}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4 flex items-center gap-1.5">
                    Instant Action <span className="text-[7px] text-slate-500">(Costs Energy)</span>
                </p>
                <div className="space-y-1.5">
                    {actions.map(action => renderActionCard(action, "marketing"))}
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
                                active ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600")}>
                            <span className="text-xl">{prog.emoji}</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{prog.label}</p>
                                {renderOngoingProgramUI(prog, mult)}
                            </div>
                            {active && streak > 0 && <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">🔥{streak}mo ×{mult.toFixed(0)}</span>}
                            <div className={cn("w-10 h-5 rounded-full transition-all relative", active ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")}>
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
        const hasCHRO = (startup as any).cxoTeam?.["CHRO"];
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);

        const configRef = INDUSTRY_PRICING_CONFIG[startup.industry] || INDUSTRY_PRICING_CONFIG["SaaS Platform"];
        const activeConfig = startup.gtm_motion === "PLG" ? configRef.PLG : configRef.SLG;

        // Generate 3 candidate profiles per role for the pipeline
        const ROLE_DEFS = [
            { role: "engineer" as const, emoji: "👨‍💻", label: "Software Engineer", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", tagBg: "bg-blue-100" },
            { role: "marketer" as const, emoji: "📣", label: "Growth Marketer", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", tagBg: "bg-pink-100" },
            { role: "sales" as const, emoji: "🤝", label: activeConfig.salesRoleName, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", tagBg: "bg-emerald-100" },
            { role: "legal" as const, emoji: "⚖️", label: "Legal Counsel", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", tagBg: "bg-amber-100" },
        ];

        const seed = (startup.name.length + (employees?.length || 0) + (m?.users || 0)); // deterministic-ish seed
        const SKILL_TIERS = [
            { label: "Lead", skillBase: 88, salaryBase: 14000, cultureFit: 88 },
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
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl">
                            <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">🎯 Hiring Priority for {pb.model}</p>
                            <p className="text-[10px] text-blue-800 dark:text-blue-200 font-semibold leading-tight">{pb.hiringPriority}</p>
                        </div>
                    );
                })()}

                {/* === OPTION POOL MANAGEMENT === */}
                <div className="mb-4 bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5" /> Option Pool
                        </p>
                        <span className={cn("text-xs font-black", (m.option_pool || 0) < 1 ? "text-rose-500 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400")}>
                            {(m.option_pool || 0).toFixed(1)}% Available
                        </span>
                    </div>
                    <p className="text-[8px] text-indigo-600 dark:text-indigo-400 leading-tight mb-3">
                        Required for hiring & compensation. Expand via dilution if pool is too low.
                    </p>
                    <button
                        onClick={handleAllocateESOP}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase rounded-xl transition flex items-center justify-center gap-2"
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

                    // Combined Avg Skill (if no staff, CXO provides a solo baseline of 80)
                    const engAvgFinal = eng.length > 0 ? engAvg : (cxoEng ? 80 : 0);
                    const mktAvgFinal = mkt.length > 0 ? mktAvg : (cxoMkt ? 80 : 0);
                    const salAvgFinal = sal.length > 0 ? salAvg : (cxoSal ? 80 : 0);

                    // Unify with Engine Formula
                    const engPow = getDepartmentPower("product", startup);
                    const mktPow = getDepartmentPower("growth", startup);
                    const salPow = getDepartmentPower("leadership", startup);

                    const DeptCard = ({ emoji, label, count, power, drives, color, bg, border, darkBg, darkBorder, darkText, category }: any) => {
                        const reqPower = Math.max(10, Math.pow(m.users || 0, 0.45) * 1.5);
                        const capacityPct = Math.round(Math.min(1.0, power / reqPower) * 100);
                        const isScalingBottleneck = capacityPct < 100;

                        return (
                            <div className={`rounded-2xl border-2 ${bg} ${border} ${darkBg} ${darkBorder} p-3 mb-2 transition-all ${isScalingBottleneck && capacityPct < 70 ? "border-rose-300 dark:border-rose-500/50 shadow-inner" : ""}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-base">{emoji}</span>
                                        <p className={`text-[10px] font-black uppercase tracking-wide ${color} ${darkText}`}>{label}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`text-[9px] font-black ${isScalingBottleneck && capacityPct < 70 ? "text-rose-600 border-rose-200 bg-rose-50" : color + " " + darkText + " border-slate-100 bg-white dark:bg-slate-900"} px-2 py-0.5 rounded-full border dark:border-slate-800 tracking-tighter`}>{count} people</span>
                                        <span className={`text-[9px] font-black ${capacityPct < 70 ? "text-rose-600 border-rose-200 bg-rose-50" : "text-emerald-600 border-emerald-100 bg-emerald-50"} px-2 py-0.5 rounded-full border dark:border-slate-800 tracking-tighter`}>{capacityPct}% Cap</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 text-center bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                        <p className={`text-sm font-black ${isScalingBottleneck && capacityPct < 50 ? "text-rose-500" : color + " " + darkText}`}>
                                            {power}
                                        </p>
                                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">Dept Power</p>
                                    </div>
                                    <div className="flex-[3] bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5">Scale Requirements</p>
                                        <p className="text-[8px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">Requires {Math.round(reqPower)} Power for {Number(m.users || 0).toLocaleString()} users.</p>
                                    </div>
                                </div>
                                {isScalingBottleneck && capacityPct < 90 && (
                                    <div className="mt-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg p-2 flex items-start gap-2 shadow-sm">
                                        <span className="text-[10px]">⚖️</span>
                                        <p className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase leading-none tracking-tighter">
                                            SCALING BOTTLENECK: Team size is too small for current user scale. Execution speed is throttled by {100 - capacityPct}%. HIRE MORE STAFF!
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    };

                    return (
                        <div className="mb-4">
                            {/* ── Team & Culture Stats Panel ── */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-2.5 text-center">
                                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none">{employees.length}</p>
                                    <p className="text-[8px] font-black text-emerald-500 dark:text-emerald-500 uppercase tracking-wide mt-0.5">Team Size</p>
                                </div>
                                <div className="bg-pink-50 dark:bg-rose-950/20 border border-pink-100 dark:border-rose-900/50 rounded-2xl p-2.5 text-center">
                                    <p className="text-lg font-black text-pink-700 dark:text-rose-400 leading-none">{Math.round(m.team_morale || 0)}%</p>
                                    <p className="text-[8px] font-black text-pink-500 dark:text-rose-400 uppercase tracking-wide mt-0.5">Morale</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-2.5 text-center">
                                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">{Math.round(startup.culture_score || 60)}%</p>
                                    <p className="text-[8px] font-black text-indigo-500 dark:text-indigo-500 uppercase tracking-wide mt-0.5">Culture</p>
                                </div>
                            </div>

                            {/* === BULK TEAM ACTIONS === */}
                            <div className="mb-4 bg-slate-900 dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Company Policies (Bulk)
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleBulkAction("salary_raise")}
                                        className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 text-left transition active:scale-95"
                                    >
                                        <p className="text-[9px] font-black text-white uppercase leading-none">Raise Salaries</p>
                                        <p className="text-[7px] text-slate-400 mt-1">+10% Salary · +15 Morale</p>
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction("bonus")}
                                        className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 text-left transition active:scale-95"
                                    >
                                        <p className="text-[9px] font-black text-white uppercase leading-none">Quarterly Bonus</p>
                                        <p className="text-[7px] text-slate-400 mt-1">-$2.5k / head · +20 Morale</p>
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction("offsite")}
                                        className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 text-left transition active:scale-95"
                                    >
                                        <p className="text-[9px] font-black text-white uppercase leading-none">Company Offsite</p>
                                        <p className="text-[7px] text-slate-400 mt-1">-$5k / head · +30 Morale</p>
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction("stock_grant")}
                                        className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 text-left transition active:scale-95"
                                    >
                                        <p className="text-[9px] font-black text-white uppercase leading-none">Stock Refresh</p>
                                        <p className="text-[7px] text-slate-400 mt-1">-ESOP Pool · Retention</p>
                                    </button>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">🏢 Department Power</p>
                            <p className="text-[8px] text-slate-400 dark:text-slate-500 mb-3 leading-tight">Each dept's power = avg skill × headcount × performance. Power directly multiplies the attribute it drives every month.</p>
                            <DeptCard
                                emoji="👨‍💻" label="Engineering" count={eng.length + cxoEng} avgSk={engAvgFinal} power={engPow}
                                drives="Product Quality · Tech Debt Reduction · Reliability"
                                color="text-blue-700" bg="bg-blue-50" border="border-blue-200"
                                darkText="dark:text-blue-400" darkBg="dark:bg-blue-950/20" darkBorder="dark:border-blue-900/50"
                            />
                            <DeptCard
                                emoji="📣" label="Marketing" count={mkt.length} avgSk={mktAvg} power={mktPow}
                                drives="Monthly Growth Rate · Brand Awareness · CAC"
                                color="text-pink-700" bg="bg-pink-50" border="border-pink-200"
                                darkText="dark:text-rose-400" darkBg="dark:bg-rose-950/20" darkBorder="dark:border-rose-900/50"
                            />
                            <DeptCard
                                emoji="🤝" label={activeConfig.salesRoleName} count={sal.length} avgSk={salAvg} power={salPow}
                                drives={activeConfig.salesRoleDescription}
                                color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200"
                                darkText="dark:text-emerald-400" darkBg="dark:bg-emerald-950/20" darkBorder="dark:border-emerald-900/50"
                            />
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl px-3 py-2">
                                <p className="text-[8px] text-amber-700 dark:text-amber-400 leading-tight"><span className="font-black">Tip:</span> Hire Senior talent for faster power gains. CXOs give +20% power to their dept. Avg skill is weighted by performance — unhappy teams underperform.</p>
                            </div>
                        </div>
                    );
                })()}


                {/* === PIPELINE === */}
                {!hasCHRO ? (
                    <>
                        <div className="mb-4 bg-fuchsia-50 dark:bg-fuchsia-950/20 border-2 border-fuchsia-200 dark:border-fuchsia-900/50 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform" />
                            <span className="text-3xl relative z-10">🤝</span>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-fuchsia-900 dark:text-fuchsia-100 uppercase tracking-widest">Advanced Recruiting Locked</h3>
                                <p className="text-[10px] text-fuchsia-700/80 dark:text-fuchsia-300 mt-1 leading-relaxed">
                                    You are currently relying on inbound organic applications. To unlock targeted sourcing, run dedicated hiring campaigns, and guarantee A-Tier talent, hire a <strong>Chief Human Resources Officer (CHRO)</strong> from the Leadership section below.
                                </p>
                            </div>
                        </div>

                        {/* Basic 3-candidate pipeline per role */}
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
                                        const candidateAction = roleDef.role === "engineer" ? "hire_engineer" : roleDef.role === "marketer" ? "hire_marketer" : roleDef.role === "legal" ? "hire_legal" : "hire_sales";
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
                                                    isOver ? "opacity-30 cursor-not-allowed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" : `${roleDef.bg} ${roleDef.border} dark:bg-slate-900/50 dark:border-slate-800 hover:shadow-sm`
                                                )}
                                            >
                                                <div className={`w-9 h-9 rounded-xl ${roleDef.tagBg} dark:bg-slate-800 flex items-center justify-center font-black text-sm ${roleDef.text} shrink-0`}>
                                                    {CANDIDATE_NAMES[nameIdx].charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{CANDIDATE_NAMES[nameIdx]} · <span className={roleDef.text}>{tier.label}</span></p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-slate-500 dark:text-slate-500">💪 {skill}%</span>
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-700">·</span>
                                                        <span className="text-[9px] text-slate-500 dark:text-slate-500">❤️ {cultureFit}% fit</span>
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-700">·</span>
                                                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">${salary.toLocaleString()}/mo</span>
                                                    </div>
                                                    <p className="text-[8px] text-slate-400 dark:text-slate-600 mt-0.5">4yr vest · 1yr cliff</p>
                                                </div>
                                                <span className={cn("text-[9px] font-black px-2 py-1 rounded-full", roleDef.tagBg, "dark:bg-slate-800", roleDef.text)}>➕ Hire</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🤝</span>
                            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Advanced Recruiting Engine</h3>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex gap-2 mb-4">
                            {ROLE_DEFS.map(roleDef => (
                                <button
                                    key={roleDef.role}
                                    onClick={() => setHrSearchRole(roleDef.role)}
                                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", hrSearchRole === roleDef.role ? `${roleDef.bg} ${roleDef.text} ${roleDef.border} border-2 shadow-sm scale-100` : "bg-white dark:bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 scale-95 opacity-80")}
                                >
                                    {roleDef.emoji} {roleDef.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => {
                                    if (isProcessing) return;
                                    if (focusHoursUsed + 15 > maxHours * 1.2) {
                                        toast.error("Not enough Focus Energy!");
                                        return;
                                    }
                                    const newCandidates: Candidate[] = [];
                                    const roleDef = ROLE_DEFS.find(r => r.role === hrSearchRole)!;
                                    const baseSeed = Date.now();

                                    // Generate 5 random candidates, leaning slightly lower tier
                                    for (let i = 0; i < 5; i++) {
                                        const rnd = Math.random();
                                        const tierLabel = rnd > 0.85 ? "Lead" : rnd > 0.6 ? "Senior" : rnd > 0.3 ? "Mid" : "Junior";
                                        const tier = SKILL_TIERS.find(t => t.label === tierLabel)!;

                                        const nameIdx = (baseSeed + i) % CANDIDATE_NAMES.length;
                                        const skillVariance = Math.floor(Math.random() * 20) - 10;
                                        const skill = Math.max(20, Math.min(99, tier.skillBase + skillVariance));
                                        const salary = tier.salaryBase + Math.floor(Math.random() * 1000);
                                        const cultureFit = Math.max(20, Math.min(99, tier.cultureFit + Math.floor(Math.random() * 30) - 15));

                                        const basePct = tier.label === "Lead" ? 0.8 : tier.label === "Senior" ? 0.4 : tier.label === "Mid" ? 0.2 : 0.1;
                                        const vScale = Math.sqrt(Math.max(1, startup.valuation / 1000000));
                                        let expectedPct = basePct / vScale;
                                        const maxValue = tier.label === "Lead" ? 600000 : tier.label === "Senior" ? 350000 : tier.label === "Mid" ? 150000 : 75000;
                                        if ((expectedPct / 100) * startup.valuation > maxValue) expectedPct = (maxValue / startup.valuation) * 100;

                                        const personalities: ("Stable" | "Ambitious" | "Creative")[] = ["Stable", "Ambitious", "Creative"];

                                        newCandidates.push({
                                            name: CANDIDATE_NAMES[nameIdx] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".",
                                            role: hrSearchRole,
                                            level: tier.label as any,
                                            experience: tier.label === "Lead" ? 10 : tier.label === "Senior" ? 7 : tier.label === "Mid" ? 4 : 1,
                                            expectedSalary: salary * 12,
                                            expectedEquity: parseFloat(Math.max(0.001, expectedPct).toFixed(3)),
                                            personality: personalities[Math.floor(Math.random() * personalities.length)],
                                            candId: `hr-${Date.now()}-${i}`,
                                            // temporary storage for UI rendering
                                            _skill: skill,
                                            _culture: cultureFit
                                        } as any);
                                    }

                                    // Sort by skill descending
                                    newCandidates.sort((a: any, b: any) => b._skill - a._skill);

                                    setHrCandidates(newCandidates);
                                    setStartup((s: any) => ({ ...s, metrics: { ...s.metrics, focus_hours_used: (s.metrics.focus_hours_used || 0) + 15 } }));
                                    addTimelineEvent(`🤝 Sourced 5 new candidates for ${roleDef.label}`);
                                }}
                                className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-xl p-3 text-center transition-all active:scale-[0.98]"
                            >
                                <p className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-1">Standard Search</p>
                                <p className="text-[9px] font-bold text-amber-500 uppercase">⚡ 15 Energy</p>
                            </button>

                            <button
                                onClick={() => {
                                    if (isProcessing) return;
                                    adService.showRewardedAd(() => {
                                        const newCandidates: Candidate[] = [];
                                        const roleDef = ROLE_DEFS.find(r => r.role === hrSearchRole)!;
                                        const baseSeed = Date.now();

                                        // Generate 6 candidates, guaranteed high tier and high culture fit
                                        for (let i = 0; i < 6; i++) {
                                            const tierLabel = i < 2 ? "Lead" : i < 4 ? "Senior" : "Mid"; // Top heavy
                                            const tier = SKILL_TIERS.find(t => t.label === tierLabel)!;

                                            const nameIdx = (baseSeed + i) % CANDIDATE_NAMES.length;
                                            const skillVariance = Math.floor(Math.random() * 15); // Positive variance
                                            const skill = Math.max(80, Math.min(99, tier.skillBase + skillVariance));
                                            const salary = tier.salaryBase + Math.floor(Math.random() * 500); // Slightly cheaper
                                            const cultureFit = Math.max(85, Math.min(99, tier.cultureFit + Math.floor(Math.random() * 15))); // Guaranteed high fit

                                            const basePct = tier.label === "Lead" ? 0.8 : tier.label === "Senior" ? 0.4 : tier.label === "Mid" ? 0.2 : 0.1;
                                            const vScale = Math.sqrt(Math.max(1, startup.valuation / 1000000));
                                            let expectedPct = basePct / vScale;
                                            const maxValue = tier.label === "Lead" ? 600000 : tier.label === "Senior" ? 350000 : tier.label === "Mid" ? 150000 : 75000;
                                            if ((expectedPct / 100) * startup.valuation > maxValue) expectedPct = (maxValue / startup.valuation) * 100;

                                            newCandidates.push({
                                                name: CANDIDATE_NAMES[nameIdx] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".",
                                                role: hrSearchRole,
                                                level: tier.label as any,
                                                experience: tier.label === "Lead" ? 10 : tier.label === "Senior" ? 7 : tier.label === "Mid" ? 4 : 1,
                                                expectedSalary: salary * 12,
                                                expectedEquity: parseFloat(Math.max(0.001, expectedPct).toFixed(3)),
                                                personality: "Stable", // Guaranteed no drama
                                                candId: `hr-premium-${Date.now()}-${i}`,
                                                _skill: skill,
                                                _culture: cultureFit
                                            } as any);
                                        }

                                        newCandidates.sort((a: any, b: any) => b._skill - a._skill);
                                        setHrCandidates(newCandidates);
                                        addTimelineEvent(`🤝 Executive Search sourced 6 A-Tier candidates for ${roleDef.label}`);
                                    });
                                }}
                                className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 border-2 border-fuchsia-600 rounded-xl p-3 text-center transition-all active:scale-[0.98] shadow-lg shadow-fuchsia-600/20"
                            >
                                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><span className="text-sm">⭐</span> Exec Search</p>
                                <p className="text-[9px] font-bold text-fuchsia-200 uppercase tracking-wider">Watch Ad · 0 Energy</p>
                            </button>
                        </div>

                        {hrCandidates.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Candidate Pool</p>
                                {hrCandidates.map((cand: any) => {
                                    const roleDef = ROLE_DEFS.find(r => r.role === cand.role)!;
                                    const isOver = focusHoursUsed + 20 > maxHours * 1.2;
                                    const candidateAction = cand.role === "engineer" ? "hire_engineer" : cand.role === "marketer" ? "hire_marketer" : "hire_sales";

                                    return (
                                        <div
                                            key={cand.candId}
                                            onClick={() => {
                                                if (isOver) return;
                                                handleActionClick(candidateAction as any, cand);
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                                                isOver ? "opacity-30 cursor-not-allowed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" : `${roleDef.bg} ${roleDef.border} dark:bg-slate-900/50 dark:border-slate-800 hover:shadow-sm`
                                            )}
                                        >
                                            <div className={`w-9 h-9 rounded-xl ${roleDef.tagBg} dark:bg-slate-800 flex items-center justify-center font-black text-sm ${roleDef.text} shrink-0`}>
                                                {cand.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{cand.name} · <span className={roleDef.text}>{cand.level}</span></p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500">💪 {cand._skill}%</span>
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-700">·</span>
                                                    <span className="text-[9px] text-slate-500 dark:text-slate-500">❤️ {cand._culture}% fit</span>
                                                    <span className="text-[9px] text-slate-400 dark:text-slate-700">·</span>
                                                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">${(cand.expectedSalary / 12).toLocaleString()}/mo</span>
                                                </div>
                                            </div>
                                            <span className={cn("text-[9px] font-black px-2 py-1 rounded-full", roleDef.tagBg, "dark:bg-slate-800", roleDef.text)}>➕ Hire</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center">
                                <span className="text-2xl mb-2 opacity-50 block">🗂️</span>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Candidates</p>
                                <p className="text-[9px] text-slate-400 mt-1">Run a Sourcing Campaign to fill the pipeline.</p>
                            </div>
                        )}
                    </div>
                )}





                {/* Manage existing team */}
                {employees.length > 0 && (
                    <button onClick={() => setIsTeamOpen(true)}
                        className="w-full py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase">
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
                                active ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700")}>
                            <span className="text-xl">{prog.emoji}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{prog.label}</p>
                                    {prog.monthlyEnergy > 0 && (
                                        <span className="text-[8px] font-black bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-1.5 py-0.5 rounded-full">
                                            ⚡{prog.monthlyEnergy}h/mo
                                        </span>
                                    )}
                                </div>
                                {renderOngoingProgramUI(prog, mult)}
                            </div>
                            {active && streak > 0 && <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">🔥{streak} ×{mult.toFixed(0)}</span>}
                            <div className={cn("w-10 h-5 rounded-full relative", active ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700")}>
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
                        { role: "CFO", emoji: "📊", desc: "Optimises burn · runs fundraising roadshow · required for IPO", salary: 14000, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
                        { role: "CPO", emoji: "🎯", desc: "Accelerates features · improves PMF", salary: 15000, bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
                        { role: "CHRO", emoji: "🤝", desc: "Unlocks advanced talent sourcing & recruiting", salary: 12000, bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700" },
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
                                    isHired ? "opacity-60 cursor-default bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800" : `${cxo.bg} ${cxo.border} dark:bg-slate-900/40 dark:border-slate-800 hover:shadow-sm`)}
                            >
                                <span className="text-2xl">{cxo.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-xs font-black", isHired ? "text-slate-400 dark:text-slate-600" : cxo.text + " dark:text-indigo-400")}>{cxo.role}{isHired ? " ✅ Active" : ""}</p>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{cxo.desc}</p>
                                </div>
                                {!isHired && (
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">${cxo.salary.toLocaleString()}/mo</p>
                                        <p className="text-[8px] text-slate-400 dark:text-slate-500">3mo deposit</p>
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
                                            marketing_skill: (s.metrics.marketing_skill || 0) + (cf.arch === "GTM-First" ? 25 : cf.arch === "Balanced" ? 15 : 0),
                                            technical_skill: (s.metrics.technical_skill || 0) + (cf.arch === "Tech-First" ? 25 : cf.arch === "Balanced" ? 15 : 0),
                                            leadership: (s.metrics.leadership || 0) + (cf.arch === "Balanced" ? 15 : 0),
                                        },
                                    }));
                                    addTimelineEvent(`🤝 Recruited ${cf.arch} Co-Founder — ${cf.equity}% equity. ${cf.desc}`);
                                }}
                                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 cursor-pointer mb-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all active:scale-[0.98]"
                            >
                                <span className="text-2xl">{cf.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-indigo-800 dark:text-indigo-300">{cf.arch} Co-Founder</p>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{cf.desc}</p>
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
                    <div className="mt-4 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-3">
                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">🤝 Co-Founder Active</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-1">Check Financials → Cap Table for equity split.</p>
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
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
        const fundCost = startup.iap_titan ? 20 : 40;

        let nextRound = getNextFundingStage(stage);

        // Smart Repair: Fix corrupted sequencing or "IPO Ready" overrides.
        const nonFounderInvestors = capTable.filter((e: any) => e.type !== "Founder" && e.type !== "Co-Founder");
        const hasSeriesC = nonFounderInvestors.some((e: any) => e.name.toLowerCase().includes("series c"));
        const hasSeriesB = nonFounderInvestors.some((e: any) => e.name.toLowerCase().includes("series b"));
        const hasSeriesA = nonFounderInvestors.some((e: any) => e.name.toLowerCase().includes("series a"));
        const hasSeed = nonFounderInvestors.some((e: any) => e.name.toLowerCase().includes("seed") || e.name.toLowerCase().includes("angel"));

        if (stage === "IPO Ready" || stage === "Late Stage Round" || nextRound === "Late Stage Round") {
            if (hasSeriesC) nextRound = "Series D";
            else if (hasSeriesB) nextRound = "Series C";
            else if (hasSeriesA) nextRound = "Series B";
            else if (hasSeed) nextRound = "Series A";
            else nextRound = "Seed Round";
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

        // ── Quiet Period Active ──
        if (startup.ipo_stage && startup.ipo_stage > 0 && startup.ipo_stage < 4) {
            return (
                <div className="flex flex-col gap-4">
                    {sheetHeader("🏦", "Funding", "Stage: SEC Quiet Period")}
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-2 border-amber-500/30 rounded-3xl p-5 text-center relative overflow-hidden backdrop-blur-sm">
                        <div className="text-5xl mb-3 animate-pulse">🏛️</div>
                        <h4 className="text-base font-black text-amber-500 uppercase tracking-wider">SEC Quiet Period Active</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
                            Your firm is actively in the **IPO registration process (Stage {startup.ipo_stage}/3)**. Federal regulations strictly prohibit raising private capital or making public announcements about pricing or prospects.
                        </p>
                        <div className="mt-4 px-3 py-2 bg-amber-500/10 rounded-xl text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest border border-amber-500/25 w-fit mx-auto">
                            Filing Phase: S-1 Submitted
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                            All fundraising rounds are locked. Advance the month to complete listing.
                        </p>
                    </div>
                </div>
            );
        }

        // ── Public Markets Capital Raising Dashboard ──
        if (startup.public_company) {
            const pub = startup.public_company;
            const debts = pub.corporate_debt || [];
            const outstandingDebt = debts.reduce((sum: number, d: any) => sum + d.principal, 0);

            const handleFPO = (dilutionPct: number) => {
                const raiseAmount = Math.floor(startup.valuation * (dilutionPct / 100));
                const newStartup = { ...startup };
                newStartup.metrics.cash = (newStartup.metrics.cash || 0) + raiseAmount;

                const factor = 1 - (dilutionPct / 100);
                newStartup.capTable = (newStartup.capTable || []).map((e: any) => ({
                    ...e,
                    equity: e.equity * factor
                }));

                const floatNode = newStartup.capTable.find((e: any) => e.name === "Public Float" || e.name === "Public Float (20%)" || e.type === "Investor");
                if (floatNode) {
                    floatNode.equity += dilutionPct;
                } else {
                    newStartup.capTable.push({ name: "Public Float", equity: dilutionPct, type: "Investor" });
                }

                const extraShares = Math.floor(pub.shares_outstanding * (dilutionPct / 100));
                newStartup.public_company.shares_outstanding += extraShares;
                newStartup.public_company.float += extraShares;

                const drop = dilutionPct === 5 ? 0.98 : 0.94;
                newStartup.public_company.share_price *= drop;
                newStartup.valuation = newStartup.public_company.shares_outstanding * newStartup.public_company.share_price;

                setStartup(newStartup);
                addTimelineEvent(`🏛️ FPO: Conducted a ${dilutionPct}% Follow-on Public Offering, raising ${formatMoney(raiseAmount)} corporate cash at a share price impact.`);
                toast.success("FPO Completed!", { description: `Raised ${formatMoney(raiseAmount)} from public float!` });
            };

            const handleIssueBond = (principal: number, months: number) => {
                const isProfitable = (startup.metrics.net_profit || 0) >= 0;
                const apr = isProfitable ? 0.05 : 0.085;
                const monthlyInterest = Math.floor((principal * apr) / 12);

                const bond = {
                    id: `bond_${Date.now()}`,
                    principal,
                    interestRate: apr,
                    monthsRemaining: months,
                    monthlyInterestPayment: monthlyInterest,
                    label: `${months}mo Corporate Bond`
                };

                const newStartup = { ...startup };
                newStartup.metrics.cash = (newStartup.metrics.cash || 0) + principal;
                if (!newStartup.public_company.corporate_debt) newStartup.public_company.corporate_debt = [];
                newStartup.public_company.corporate_debt.push(bond);

                setStartup(newStartup);
                addTimelineEvent(`🏦 Debt Issued: Sold ${formatMoney(principal)} in corporate bonds at ${(apr * 100).toFixed(1)}% APR maturing in ${months}mo.`);
                toast.success("Bonds Issued!", { description: `Raised ${formatMoney(principal)} corporate debt capital!` });
            };

            const handleRepayBondEarly = (bondId: string, principal: number) => {
                if (m.cash < principal) {
                    toast.error("Insufficient Cash", { description: "You don't have enough corporate cash to repay this bond early." });
                    return;
                }
                const newStartup = { ...startup };
                newStartup.metrics.cash -= principal;
                newStartup.public_company.corporate_debt = newStartup.public_company.corporate_debt.filter((d: any) => d.id !== bondId);
                setStartup(newStartup);
                addTimelineEvent(`🏛️ Debt Repayment: Repaid corporate bond principal of ${formatMoney(principal)} early to eliminate interest drag.`);
                toast.success("Bond Repaid Early!", { description: "Eliminated interest payments." });
            };

            return (
                <div className="flex flex-col gap-4">
                    {sheetHeader("🏛️", "Public Markets", `Ticker: ${startup.symbol || "CORP"} · ${founderEquity.toFixed(1)}% founder equity`)}

                    {/* Public Capital Overview */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl text-center">
                            <p className="text-[9px] uppercase font-black text-slate-400">Market Cap</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatMoney(startup.valuation)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl text-center">
                            <p className="text-[9px] uppercase font-black text-slate-400">Corporate Cash</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatMoney(m.cash)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl text-center">
                            <p className="text-[9px] uppercase font-black text-slate-400">Outstanding Debt</p>
                            <p className="text-sm font-black text-rose-600 mt-0.5">{formatMoney(outstandingDebt)}</p>
                        </div>
                    </div>

                    {/* FPO */}
                    <div className="bg-violet-50/50 dark:bg-violet-950/15 border-2 border-violet-100 dark:border-violet-900/30 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                        <h4 className="text-xs font-black uppercase text-violet-700 dark:text-violet-400 tracking-wider">Follow-on Public Offering (FPO)</h4>
                        <p className="text-[10px] text-slate-500 mt-1 mb-3">Dilute outstanding share equity to raise massive corporate cash directly from stock market investors.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFPO(5)}
                                className="flex-1 bg-violet-600 text-white p-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-600/20"
                            >
                                Raise 5% Float<br />
                                <span className="text-[8px] opacity-70">+{formatMoney(Math.floor(startup.valuation * 0.05))} cash</span>
                            </button>
                            <button
                                onClick={() => handleFPO(10)}
                                className="flex-1 bg-indigo-600 text-white p-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                            >
                                Raise 10% Float<br />
                                <span className="text-[8px] opacity-70">+{formatMoney(Math.floor(startup.valuation * 0.10))} cash</span>
                            </button>
                        </div>
                        <p className="text-[8px] text-slate-400 mt-2 text-center">FPOs trigger dilution and a minor stock price impact (-2% for 5%, -6% for 10% Offering).</p>
                    </div>

                    {/* Debt Issuance */}
                    <div className="bg-amber-50/50 dark:bg-amber-950/15 border-2 border-amber-100 dark:border-amber-900/30 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                        <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">Issue Corporate Bonds (Debt)</h4>
                        <p className="text-[10px] text-slate-500 mt-1 mb-3">Leverage your market cap to borrow institutional capital without dilution. Profitable companies get lower APRs.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleIssueBond(50000000, 24)}
                                className="flex-1 bg-amber-600 text-white p-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-700 active:scale-95 transition-all shadow-md shadow-amber-600/20"
                            >
                                Issue $50M Bonds<br />
                                <span className="text-[8px] opacity-70">24mo · {m.net_profit >= 0 ? "5.0%" : "8.5%"} APR</span>
                            </button>
                            <button
                                onClick={() => handleIssueBond(150000000, 36)}
                                disabled={startup.valuation < 500000000}
                                className="flex-1 bg-orange-600 text-white p-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-orange-600/20"
                            >
                                Issue $150M Bonds<br />
                                <span className="text-[8px] opacity-70">36mo · {m.net_profit >= 0 ? "5.0%" : "8.5%"} APR</span>
                            </button>
                        </div>
                        {startup.valuation < 500000000 && (
                            <p className="text-[8px] text-rose-500 mt-2 text-center font-bold">⚠️ $150M Bonds require a valuation of at least $500M.</p>
                        )}
                    </div>

                    {/* Active Liabilities */}
                    {debts.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Active Liabilities &amp; Repayments</p>
                            {debts.map((d: any) => (
                                <div key={d.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 mb-2 last:mb-0 shadow-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{d.label}</p>
                                        <p className="text-[10px] font-bold text-slate-500">{d.monthsRemaining}mo left</p>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-3">
                                        <span>Principal: {formatMoney(d.principal)}</span>
                                        <span className="text-rose-500">-{formatMoney(d.monthlyInterestPayment)}/mo interest</span>
                                    </div>
                                    <button
                                        onClick={() => handleRepayBondEarly(d.id, d.principal)}
                                        className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-300 py-2 rounded-xl text-[9px] font-black uppercase transition-all"
                                    >
                                        Repay Principal Early
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div>
                {sheetHeader("🏦", "Funding", `Stage: ${stage} · ${founderEquity.toFixed(0)}% founder equity`)}
                {maxed ? (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-center">
                        <p className="text-2xl mb-2">🦄</p>
                        <p className="text-sm font-black text-amber-700 dark:text-amber-400">Maximum Funding Reached</p>
                        <p className="text-[10px] text-amber-500 dark:text-amber-500 mt-1">Focus on IPO preparation or acquisition</p>
                    </div>
                ) : (
                    <div className="space-y-1.5 mb-3">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">💰</span>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-none">Emergency Grant</p>
                                    <p className="text-[8px] font-bold text-emerald-500 dark:text-emerald-500 uppercase mt-0.5">Watch ad for +$50,000</p>
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
                                        disabled={!isOnline && !isPremium}
                                        className={`h-6 text-[8px] font-black uppercase tracking-widest ${(!isOnline && !isPremium) ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 grayscale' : 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/70'}`}
                                        onClick={() => {
                                            if (isLimited) {
                                                const nextAvail = Math.min(...validGrants) + 60 * 60 * 1000;
                                                toast.error("Grant Limit Reached", { description: `You can claim 2 grants per hour. Ready in ${formatCooldown(nextAvail, currentTime)}.` });
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
                                            }, 'cash');
                                        }}
                                    >
                                        {isLimited ? (
                                            <span className="text-rose-600 font-bold">{formatCooldown(validGrants[0] + 60 * 60 * 1000, currentTime)}</span>
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
                                        isOver ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950/30")}>
                                    <span className="text-xl w-7 text-center shrink-0">{pa.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{pa.label}</p>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{pa.sub}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <span className="text-[8px] font-black bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 px-1.5 py-0.5 rounded-full opacity-90">⚡{fundCost}h</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cap Table</p>
                        <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400">Pool: {m.option_pool || 0}%</p>
                    </div>
                    {capTable.map((e: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full",
                                e.type === "Founder" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : e.type === "Co-Founder" ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300" : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300")}>
                                {e.type === "Founder" ? "👤" : e.type === "Co-Founder" ? "🤝" : "💼"}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1">{e.name}</span>
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-full" style={{ width: `${e.equity}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 w-10 text-right">{e.equity.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>

                {/* Investor Pipeline Tracker */}
                <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-3">
                    <p className="text-[9px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-2">📈 Fundraising Pipeline</p>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-amber-100 dark:border-amber-800">
                            <p className="text-lg font-black text-amber-700 dark:text-amber-400">{m.investor_pipeline?.leads || 0}</p>
                            <p className="text-[8px] font-black text-amber-500 dark:text-amber-600 uppercase">Leads</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-amber-100 dark:border-amber-800">
                            <p className="text-lg font-black text-amber-700 dark:text-amber-400">{m.investor_pipeline?.meetings || 0}</p>
                            <p className="text-[8px] font-black text-amber-500 dark:text-amber-600 uppercase">Meetings</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-emerald-100 dark:border-emerald-800">
                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{m.investor_pipeline?.term_sheets || 0}</p>
                            <p className="text-[8px] font-black text-emerald-500 dark:text-emerald-600 uppercase">Term Sheets</p>
                        </div>
                    </div>
                    <p className="text-[8px] text-amber-600 dark:text-amber-500 leading-tight">Pitch investors to grow your pipeline. Term sheets take 2-4 months to generate.</p>

                    {/* Access point to the negotiation game from the pipeline */}
                    {(m.investor_pipeline?.term_sheets || 0) > 0 && (
                        <button
                            onClick={() => handleActionClick("negotiate_round")}
                            className="w-full mt-3 py-2 bg-emerald-600 dark:bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-500 transition shadow-lg shadow-emerald-200 dark:shadow-none animate-pulse"
                        >
                            🤝 Negotiate Term Sheet ({m.investor_pipeline.term_sheets})
                        </button>
                    )}
                </div>

                {/* ── FUNDRAISING PROGRAMS ── */}
                {(() => {
                    const hasCFO = !!(startup as any).cxoTeam?.["CFO"];
                    const fundingProgIds = hasCFO ? ["cfo_fundraising_roadshow"] : ["fundraising_consultant"];
                    const fundingProgs = ONGOING_PROGRAMS.filter(p => fundingProgIds.includes(p.id));
                    const valuation = startup.valuation || 250_000;
                    const consultantFee = valuation > 500_000
                        ? Math.round(15_000 * (1 + Math.log2(valuation / 500_000) * 0.4))
                        : 15_000;

                    return (
                        <div className="mt-4">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                {hasCFO ? "🏦 CFO-Managed Fundraising" : "💼 Fundraising Delegation"}
                            </p>
                            {!hasCFO && (
                                <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl">
                                    <p className="text-[8px] text-amber-700 dark:text-amber-400 leading-tight font-semibold">
                                        💡 Hire a CFO to waive consultant fees and boost lead generation automatically.
                                    </p>
                                </div>
                            )}
                            {fundingProgs.map(prog => {
                                const active = ongoingPrograms.some(p => p.id === prog.id);
                                return (
                                    <div
                                        key={prog.id}
                                        onClick={() => handleToggleOngoingProgram(prog.id)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all mb-2",
                                            active
                                                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800"
                                        )}
                                    >
                                        <span className="text-xl">{prog.emoji}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{prog.label}</p>
                                            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">{prog.description}</p>
                                            <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                +{Math.round((founder.attributes.networking || 10) / 2) + (hasCFO ? 25 : 5)} investor leads/month
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {!hasCFO && (
                                                <span className="text-[8px] font-bold text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-full">
                                                    ${consultantFee.toLocaleString()}/mo
                                                </span>
                                            )}
                                            {hasCFO && (
                                                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                                                    Free (CFO handles)
                                                </span>
                                            )}
                                            {prog.monthlyEnergy > 0 && (
                                                <span className="text-[8px] font-black bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                                                    ⚡{prog.monthlyEnergy}h
                                                </span>
                                            )}
                                            <div className={cn("w-10 h-5 rounded-full transition-all relative", active ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700")}>
                                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", active ? "left-5" : "left-0.5")} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}


                {(startup.acquisition_offers?.length ?? 0) > 0 && (
                    <div className="mt-4">
                        <p className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-2">🔔 Acquisition Offers</p>
                        {startup.acquisition_offers!.map((offer: any) => {
                            const typeEmoji = offer.type === "big_tech" ? "🏢" : offer.type === "strategic" ? "🤝" : "💼";
                            const typeBg = offer.type === "big_tech" ? "bg-violet-50 dark:bg-violet-950/20 border-violet-300 dark:border-violet-900/50" : offer.type === "strategic" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/50" : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50";
                            const typeText = offer.type === "big_tech" ? "text-violet-800 dark:text-violet-400" : offer.type === "strategic" ? "text-emerald-800 dark:text-emerald-400" : "text-blue-800 dark:text-blue-400";
                            return (
                                <div key={offer.id} className={`rounded-2xl border-2 ${typeBg} p-3 mb-3`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{typeEmoji}</span>
                                        <div className="flex-1">
                                            <p className={`text-xs font-black ${typeText}`}>{offer.acquirer}</p>
                                            <p className="text-[8px] text-slate-400 dark:text-slate-500 capitalize">{offer.type.replace("_", " ")} Acquisition · expires in {offer.expires_in}mo</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-800">
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{formatMoney(offer.offer_amount)}</p>
                                            <p className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black">Total Offer</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 text-center border border-slate-100 dark:border-slate-800">
                                            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{formatMoney(offer.founder_take)}</p>
                                            <p className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black">Your Take</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl"
                                            onClick={() => {
                                                if ((startup.ipo_stage || 0) > 0 && (startup.ipo_stage || 0) < 4) {
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
                                            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase rounded-xl"
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
                    const liveArr = (m.revenue || 0) * 12;
                    const hasCFO = !!(startup as any).cxoTeam?.["CFO"];
                    const ipoChecks = [
                        { label: "$50M ARR", pass: liveArr >= 50_000_000 },
                        { label: "10K+ Users", pass: m.users >= 10_000 },
                        { label: "PMF Score ≥ 60", pass: (m.pmf_score ?? 0) >= 60 },
                        { label: "Tech Debt < 40%", pass: (m.technical_debt ?? 0) < 40 },
                        { label: "Series A+ Raised", pass: ["Series A", "Series B", "Series C", "IPO Ready"].includes(startup.funding_stage) },
                        { label: "CFO Hired", pass: hasCFO },
                    ];
                    const passed = ipoChecks.filter(c => c.pass).length;
                    const ipoStage = startup.ipo_stage ?? 0;
                    const IPO_STAGE_LABELS = ["", "📝 Pre-IPO Planning", "📄 S-1 Filing & Roadshow", "💰 Pricing & Lock-Up", "🏛️ IPO Day!"];

                    // Stage 3: Pricing UI
                    const pricingTargets = [
                        { label: "Conservative (5× ARR)", mult: 5, risk: "Low" },
                        { label: "Market Rate (8× ARR)", mult: 8, risk: "Medium" },
                        { label: "Aggressive (12× ARR)", mult: 12, risk: "High" },
                        { label: "Sovereign (18× ARR)", mult: 18, risk: "Very High" },
                    ];

                    return (
                        <div className="mt-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 rounded-2xl p-3">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] font-black text-violet-800 dark:text-violet-300 uppercase tracking-widest">🏛️ IPO Readiness</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${passed >= 6 ? "bg-violet-600 text-white" : "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400"}`}>{passed}/6</span>
                            </div>
                            {ipoStage > 0 && (
                                <div className="mb-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl px-3 py-1.5">
                                    <p className="text-[9px] font-black text-violet-700 dark:text-violet-300">Stage {ipoStage}/4: {IPO_STAGE_LABELS[ipoStage]}</p>
                                </div>
                            )}

                            {/* Pricing selection at Stage 3 */}
                            {ipoStage === 3 && (
                                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                                    <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">💰 Set Your IPO Price</p>
                                    <p className="text-[8px] text-amber-600 dark:text-amber-500 mb-2">Based on your ARR of {formatMoney(liveArr)}. Market demand depends on your PMF, growth & brand.</p>
                                    <div className="space-y-1.5">
                                        {pricingTargets.map(pt => {
                                            const targetVal = liveArr * pt.mult;
                                            const fairVal = liveArr * 8 * ((m.pmf_score ?? 0) > 80 ? 1.3 : 1.0) * ((m.growth_rate ?? 0) > 15 ? 1.2 : 1.0);
                                            const ratio = fairVal / targetVal;
                                            const demandLabel = ratio >= 1.5 ? "🚀 Oversubscribed" : ratio >= 1.2 ? "✅ Full demand" : ratio >= 0.8 ? "⚠️ Partial demand" : "📉 Undersubscribed";
                                            const isSelected = (startup as any).ipo_price_mult === pt.mult;
                                            return (
                                                <div key={pt.mult}
                                                    onClick={() => setStartup((s: any) => ({ ...s, ipo_price_mult: pt.mult }))}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "bg-violet-100 dark:bg-violet-900/50 border-violet-400 dark:border-violet-600" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-violet-200"
                                                        }`}
                                                >
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-700 dark:text-slate-200">{pt.label}</p>
                                                        <p className="text-[8px] text-slate-400">{formatMoney(targetVal)} target · Risk: {pt.risk}</p>
                                                    </div>
                                                    <p className="text-[8px] font-bold text-right">{demandLabel}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {!(startup as any).ipo_price_mult && (
                                        <p className="text-[8px] text-amber-500 mt-2 text-center">Select a pricing tier to lock in before IPO Day</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-1 mb-3">
                                {passed === 6 && ipoStage === 0 && (
                                    <button
                                        onClick={() => {
                                            const currentMonth = startup.history?.length ?? 0;
                                            setStartup((s: any) => ({
                                                ...s,
                                                ipo_stage: 1,
                                                ipo_attempt_month: currentMonth
                                            }));
                                            addTimelineEvent(`🏛️ IPO Process Started! CFO filed intent with underwriters. 4-month journey begins.`);
                                        }}
                                        className="w-full py-2 bg-violet-600 dark:bg-violet-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-violet-700 dark:hover:bg-violet-500 transition mb-2"
                                    >
                                        File S-1 & Begin IPO Process →
                                    </button>
                                )}
                                {passed === 5 && !hasCFO && ipoStage === 0 && (
                                    <div className="mb-2 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
                                        <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-1">⛔ CFO Required for IPO</p>
                                        <p className="text-[8px] text-rose-500 leading-tight">Hire a CFO from the Hiring tab. They handle SEC compliance, financial audits & the investor roadshow.</p>
                                    </div>
                                )}
                                {ipoChecks.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-sm">{c.pass ? "✅" : "⬜"}</span>
                                        <p className={`text-[9px] font-semibold ${c.pass ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>{c.label}</p>
                                    </div>
                                ))}
                            </div>
                            {passed < 6 && <p className="text-[8px] text-violet-500 leading-tight">Meet {6 - passed} more criteria to unlock the IPO process.</p>}
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
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 transition"
                    >
                        🔒 Wind Down Company
                    </button>
                </div>

                {/* Investor Relations Programs */}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">🔄 Investor Relations</p>

                {ONGOING_PROGRAMS.filter(p => p.category_ui === "Funding" && p.id !== "fundraising_consultant" && p.id !== "cfo_fundraising_roadshow").map(prog => {
                    const active = ongoingPrograms.some(p => p.id === prog.id);
                    const ap = ongoingPrograms.find(p => p.id === prog.id);
                    return (
                        <div key={prog.id} onClick={() => handleToggleOngoingProgram(prog.id)}
                            className={cn("flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer mb-2 transition-all active:scale-[0.98]",
                                active ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-600")}>
                            <span className="text-2xl">{prog.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{prog.label}</p>
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
        const toggle = (metricName: string) => setExpandedMetric(expandedMetric === metricName ? null : metricName);
        const { monthlyRevenue: liveRevenue, monthlyCogs, monthlyOpex, avgVolume: liveAvgVolume } = calculateFinancials(startup, founder);
        const pbKey = `${startup.industry}_${startup.gtm_motion}`;
        const pbConfig = STRATEGY_PLAYBOOK[pbKey];
        const liveNetProfit = liveRevenue - monthlyCogs - monthlyOpex;
        const profitable = liveNetProfit >= 0;
        const liveBurn = liveNetProfit < 0 ? Math.abs(liveNetProfit) : 0;
        const liveRunway = liveBurn > 0 ? Math.floor(m.cash / liveBurn) : Infinity;

        return (
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">📊</span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tight">Stats</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Tap any card or label for a plain-english explanation
                </p>
                {pbConfig && (
                    <div className="mb-4 p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 rounded-2xl">
                        <p className="text-[8px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">💵 Your Revenue Model — {pbConfig.model}</p>
                        <p className="text-[10px] font-bold text-violet-800 dark:text-violet-200 mb-1">{pbConfig.mrrFormula}</p>
                        <p className="text-[9px] text-violet-600 dark:text-violet-400 leading-tight">{pbConfig.statFocus}</p>
                    </div>
                )}

                <div className="flex items-center gap-4 mb-4 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
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
                        onInfoClick={!profitable ? () => {
                            setActionCategory(null);
                            setIsBurnBreakdownOpen(true);
                        } : undefined}
                    />
                    <BigMetric
                        label="Valuation" value={formatMoney(startup.valuation)} color="bg-violet-50 border-violet-100" icon="🏆"
                        explanation="The estimated market value of your startup. Driven by user growth, revenue, product quality, and market conditions."
                        isExpanded={expandedMetric === "valuation"}
                        onToggle={() => toggle("valuation")}
                    />
                    <BigMetric
                        label="Runway" value={profitable ? "∞" : `${liveRunway === Infinity ? "∞" : liveRunway}mo`} color="bg-blue-50 border-blue-100" icon="⏱️"
                        explanation="How many months you can survive at current burn before running out of cash. ∞ means you are profitable."
                        isExpanded={expandedMetric === "runway"}
                        onToggle={() => toggle("runway")}
                    />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 mb-3">
                    <StatRow label={startup.gtm_motion === "SLG" ? "Deals Closed" : "Users"} value={m.users.toLocaleString()} color="text-indigo-600 dark:text-indigo-400"
                        explanation={startup.gtm_motion === "SLG" ? "Number of active enterprise contracts or licenses." : "Number of active users. The primary driver of MRR and valuation in PLG models."}
                        isExpanded={expandedMetric === "users"} onToggle={() => toggle("users")}
                    />
                    {startup.gtm_motion === "PLG" && pbConfig?.showPaidUsers !== false && (
                        <StatRow label="Paid Users" value={(m.paid_users || 0).toLocaleString()} color="text-violet-600 dark:text-violet-400"
                            explanation="Number of users who have converted from free to paid tiers (e.g. 5% Freemium conversion rate)."
                            isExpanded={expandedMetric === "paid_users"} onToggle={() => toggle("paid_users")}
                        />
                    )}
                    {pbConfig?.volumeLabel && (
                        <StatRow label={pbConfig.volumeLabel} value={startup.industry === "AI Platform" ? `${liveAvgVolume.toFixed(1)} tokens` : formatMoney(liveAvgVolume)} color="text-amber-600 dark:text-amber-400"
                            explanation={`Average ${pbConfig.volumeLabel} generated per user month-to-month. This scales as your product matures.`}
                            isExpanded={expandedMetric === "volume"} onToggle={() => toggle("volume")}
                        />
                    )}
                    <StatRow label="MRR" value={formatMoney(liveRevenue || 0)} color="text-emerald-600 dark:text-emerald-400"
                        explanation={startup.gtm_motion === "SLG" ? "Monthly Recurring Revenue. Calculated as Deals × Contract Size." : `Monthly Recurring Revenue. Formula: ${pbConfig?.mrrFormula || "Paid Users × Pricing"}.`}
                        isExpanded={expandedMetric === "mrr"} onToggle={() => toggle("mrr")}
                    />
                    <StatRow label="Growth Rate" value={`${((m.growth_rate || 0) * 100).toFixed(0)}%/mo`} color="text-teal-600 dark:text-teal-400"
                        explanation="Month-over-month user growth. Investors look for 15%+ to consider you 'Fast Growth'."
                        isExpanded={expandedMetric === "growth"} onToggle={() => toggle("growth")}
                    />
                    <StatRow label="Product Quality" value={`${Math.round(m.product_quality || 0)}%`} color="text-blue-600 dark:text-blue-400"
                        explanation="How well your product works. High quality reduces churn and increases organic virality."
                        isExpanded={expandedMetric === "pq"} onToggle={() => toggle("pq")}
                    />
                    <StatRow label="Tech Debt" value={`${Math.round(m.technical_debt || 0)}%`} color={m.technical_debt > 50 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"}
                        explanation="Invisible cost of messy code. High debt slows down development and increases reliability issues."
                        isExpanded={expandedMetric === "debt"} onToggle={() => toggle("debt")}
                    />
                    <StatRow label="Reliability" value={`${Math.round(m.reliability || 80)}%`} color="text-cyan-600 dark:text-cyan-400"
                        explanation="Uptime and stability. If this drops below 80%, you will lose users due to crashes."
                        isExpanded={expandedMetric === "reliability"} onToggle={() => toggle("reliability")}
                    />
                    <StatRow label="Brand Awareness" value={`${Math.round(m.brand_awareness || 0)}%`} color="text-pink-600 dark:text-pink-400"
                        explanation="How many people know your company. Driven by marketing efforts and organic word-of-mouth."
                        isExpanded={expandedMetric === "brand"} onToggle={() => toggle("brand")}
                    />
                    <StatRow label="Team Morale" value={`${Math.round(m.team_morale || 0)}%`} color={m.team_morale < 50 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}
                        explanation="Happy employees are more productive. Low morale reduces Department output."
                        isExpanded={expandedMetric === "morale"} onToggle={() => toggle("morale")}
                    />
                    <StatRow label="PMF Score" value={`${Math.round(startup.metrics.pmf_score || 0)}`} color="text-violet-600 dark:text-violet-400"
                        explanation="Product-Market Fit. Scales from 0-100. High scores unlock faster organic growth."
                        isExpanded={expandedMetric === "pmf"} onToggle={() => toggle("pmf")}
                    />
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActionCategory(null);
                        setExpandedMetric(null);
                        setIsFinancialsOpen(true);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-xs font-black uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                >
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
        const HBar = ({ label, v, bonus = 0, color }: { label: string; v: number; bonus?: number; color: string }) => {
            const safeV = v || 0;
            const safeBonus = bonus || 0;
            const total = Math.min(100, safeV + safeBonus);
            const basePct = total > 0 ? (safeV / total) * 100 : 0;
            return (
                <div className="flex items-center gap-2 py-1.5 border-b border-slate-200 dark:border-slate-800 last:border-0 grow">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-24 uppercase shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div className={cn("h-full", color)} style={{ width: `${Math.round((safeV / 100) * 100)}%` }} />
                        {safeBonus > 0 && (
                            <div className="h-full bg-white/40 animate-pulse" style={{ width: `${Math.round((safeBonus / 100) * 100)}%` }} />
                        )}
                    </div>
                    <span className={cn("text-[10px] font-black w-6 text-right shrink-0", color.replace("bg-", "text-"))}>{Math.round(total)}</span>
                </div>
            );
        };
        const maxHours = calcFocusHours(burnout, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
        const energyPct = Math.min(100, (focusHoursUsed / maxHours) * 100);
        const usageColors = ["text-emerald-700 bg-emerald-50 border-emerald-200", "text-blue-700 bg-blue-50 border-blue-200", "text-amber-700 bg-amber-50 border-amber-200", "text-rose-700 bg-rose-50 border-rose-200", "text-slate-500 bg-slate-50 border-slate-200"];
        const usageLabels = ["Max Impact", "High Impact", "Low Impact", "Minimal Impact", "No Effect"];
        const ACTION_GROUPS = [
            { label: "Intelligence", category: "intelligence" as const },
            { label: "Technical", category: "technical" as const },
            { label: "Leadership", category: "leadership" as const },
            { label: "Network & Fundraising", category: "networking" as const },
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
                <div className="mb-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-3 border border-rose-100 dark:border-rose-900/50">
                    <div className="flex justify-between items-center mb-1.5">
                        <div>
                            <p className="text-[9px] font-black text-rose-400 dark:text-rose-500 uppercase tracking-widest">⚡ Monthly Focus Energy</p>
                            <span className={cn("text-[10px] font-black", energyPct > 80 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-300")}>{focusHoursUsed}h / {maxHours}h</span>
                        </div>
                        {focusHoursUsed > 0 && (() => {
                            const hourAgo = Date.now() - 3600_000;
                            const validRefills = (energyRefills || []).filter((t: number) => t > hourAgo);
                            const isRefillLimited = validRefills.length >= 2;
                            return (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn("h-6 text-[8px] font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-900/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/70", (!isOnline && !isPremium) && "grayscale opacity-50")}
                                    disabled={isRefillLimited || (!isOnline && !isPremium)}
                                    onClick={() => {
                                        if (isRefillLimited) {
                                            const nextAvail = Math.min(...validRefills) + 60 * 60 * 1000;
                                            toast.error("Refill Limit Reached", { description: `You can refill energy 2 times per hour. Ready in ${formatCooldown(nextAvail, currentTime)}.` });
                                            return;
                                        }
                                        adService.showRewardedAd(() => {
                                            setFocusHoursUsed(0);
                                            setEnergyRefills([...validRefills, Date.now()]);
                                            toast.success("Energy Refilled!", { description: "You've earned a fresh 100% focus for this month!", icon: "⚡" });
                                        }, 'energy');
                                    }}
                                >
                                    {isRefillLimited ? (
                                        <span className="font-bold">{formatCooldown(validRefills[0] + 60 * 60 * 1000, currentTime)}</span>
                                    ) : "Refill Energy (Ads)"}
                                </Button>
                            );
                        })()}
                    </div>
                    <div className="h-2 bg-rose-100 dark:bg-rose-900 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", energyPct > 80 ? "bg-rose-500" : "bg-rose-400")} style={{ width: `${energyPct}%` }} />
                    </div>
                    {burnout > 60 && <p className="text-[9px] text-rose-500 dark:text-rose-400 mt-1.5 font-bold animate-pulse">⚠️ High burnout — take a month off to restore health!</p>}
                </div>

                {/* Rest & Recharge - Month Goal */}
                <div className="mb-4">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Monthly Strategy</p>
                    <div onClick={() => setSelectedAction(selectedAction === "rest_and_recharge" ? "none" : "rest_and_recharge")}
                        className={cn("p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between",
                            selectedAction === "rest_and_recharge" ? "bg-indigo-600 dark:bg-indigo-600 border-indigo-700 dark:border-indigo-500 text-white shadow-lg scale-[1.02]" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 text-slate-800 dark:text-slate-200")}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">😴</span>
                            <div>
                                <p className={cn("text-xs font-black uppercase tracking-tight", selectedAction === "rest_and_recharge" ? "text-white" : "text-slate-900 dark:text-slate-100")}>Rest & Recharge</p>
                                <p className={cn("text-[8px] font-bold uppercase tracking-widest", selectedAction === "rest_and_recharge" ? "text-indigo-100" : "text-slate-400 dark:text-slate-500")}>Dedicate this whole month to recovery</p>
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
                <div className="w-full mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Monthly Salary Draw</p>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3 shadow-inner">
                        <span className="text-xl font-black text-indigo-600 shrink-0">$</span>
                        <input
                            type="number"
                            value={salaryInput}
                            onChange={(e) => setSalaryInput(e.target.value)}
                            placeholder="0"
                            className="flex-1 min-w-0 text-2xl font-black text-slate-800 dark:text-white focus:outline-none bg-transparent tracking-tighter"
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

                {/* ── RETIRE AS CEO (EXIT GAME) ── */}
                {startup.public_company && (
                    <div className="w-full mb-4 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-3xl border border-rose-100 dark:border-rose-900/50">
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">The Endgame</p>
                        <p className="text-[10px] text-rose-700/80 dark:text-rose-300/80 mb-3 leading-tight font-semibold">
                            You took the company public. You've made it. At any time, you can step down as CEO, cash out, and record your legacy.
                        </p>
                        <Button
                            onClick={() => {
                                setConfirmDialog({
                                    open: true,
                                    title: "Retire as CEO?",
                                    description: "Are you ready to step down? This will end the game and lock in your legacy points based on your current public valuation.",
                                    confirmText: "RETIRE NOW",
                                    type: "exit",
                                    onConfirm: () => {
                                        setStartup((s: any) => ({ ...s, outcome: "retired" }));
                                        addTimelineEvent(`🏆 The Founder has retired! A new CEO takes over the public company.`);
                                        setIsEndgameOpen(true);
                                    }
                                });
                            }}
                            className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95"
                        >
                            Step Down / Retire
                        </Button>
                    </div>
                )}

                {/* Attributes */}
                <div className="mb-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attributes</p>
                    <HBar label="Intelligence" v={attrs.intelligence} color="bg-indigo-500" />
                    <HBar label="Technical" v={attrs.technical_skill} bonus={m.technical_skill || 0} color="bg-blue-500" />
                    <HBar label="Leadership" v={attrs.leadership} bonus={m.leadership || 0} color="bg-violet-500" />
                    <HBar label="Network & Fundraising" v={attrs.networking} color="bg-cyan-500" />
                    <HBar label="Marketing" v={attrs.marketing_skill} bonus={m.marketing_skill || 0} color="bg-pink-500" />
                    <HBar label="Reputation" v={attrs.reputation ?? 50} color="bg-amber-500" />
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
                        <HBar label="Health" v={health} color={health < 40 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"} />
                        <HBar label="Burnout" v={burnout} color={burnout > 60 ? "bg-rose-500 animate-pulse" : "bg-amber-500"} />
                        <HBar label="Sleep" v={m.sleep_quality ?? 100} color={(m.sleep_quality ?? 100) < 40 ? "bg-rose-500 animate-pulse" : "bg-blue-400"} />
                    </div>
                </div>

                {/* ── SKILL WEB PANEL ── */}
                {(() => {
                    const totalSP = calculateTotalSkillPoints(startup, founder, month);
                    const availableSP = getAvailableSkillPoints(startup, founder, month);
                    const unlockedNodes = founder.unlocked_skill_nodes || [];
                    const branches: SkillBranch[] = ["Technical", "Marketing", "Leadership", "Fundraising"];

                    const handleUnlockSkill = (nodeId: import("@/lib/types/database.types").SkillNodeId) => {
                        // Delegate to the onUnlockSkill prop provided by the parent page
                        onUnlockSkill(nodeId);
                    };

                    return (
                        <div className="mb-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Founder Skill Web</p>
                                    <Info className="w-2.5 h-2.5 text-slate-300" />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${availableSP > 0
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}>
                                    {availableSP} SP available ({totalSP} total)
                                </div>
                            </div>

                            {/* SP Earning Guide (DETAILED) */}
                            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl max-h-[190px] overflow-y-auto custom-scrollbar">
                                <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 sticky top-0 bg-indigo-50 dark:bg-slate-900 z-10 py-0.5">
                                    <Sparkles className="w-3.5 h-3.5" /> How to earn Skill Points (SP)
                                </p>
                                <div className="space-y-2.5">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-indigo-100 dark:border-indigo-900/50">💰</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">FUNDING ROUNDS</p>
                                                <span className="text-[9px] font-black text-indigo-600 bg-white dark:bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">+1 SP per round</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Closing your Seed, Series A, and Series B rounds each grant a permanent Skill Point.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-indigo-100 dark:border-indigo-900/50">📈</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">USER MILESTONES</p>
                                                <span className="text-[9px] font-black text-indigo-600 bg-white dark:bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">Max 3 SP</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Gain +1 SP when your total user count crosses 1,000, 10,000, and 100,000 users.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-indigo-100 dark:border-indigo-900/50">⏳</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">GAME TENURE</p>
                                                <span className="text-[9px] font-black text-indigo-600 bg-white dark:bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">+1 SP per Year</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">For every 12 months you survive as CEO, you earn an automatic Skill Point.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-indigo-100 dark:border-indigo-900/50">🏢</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">M&A / ACQUISITIONS</p>
                                                <span className="text-[9px] font-black text-indigo-600 bg-white dark:bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">+1 SP per 2 Acq</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Earn +1 SP for every 2 companies acquired under your corporate group.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-indigo-100 dark:border-indigo-900/50">📊</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">REVENUE (ARR) TIER</p>
                                                <span className="text-[9px] font-black text-indigo-600 bg-white dark:bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">Max 6 SP</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Get +1 SP when crossing ARR tiers of $10M, $100M, $1B, $10B, $100B, and $1T.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-indigo-100 dark:border-indigo-900/50">🏛️</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">IPO DAY</p>
                                                <span className="text-[9px] font-black text-indigo-600 bg-white dark:bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">+2 SP</span>
                                            </div>
                                            <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Transitioning to a public company by underwriting your IPO grants +2 SP.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Branch columns */}
                            <div className="grid grid-cols-2 gap-2">
                                {branches.map(branch => {
                                    const branchMeta = SKILL_BRANCHES[branch];
                                    const tier1Nodes = SKILL_NODES.filter(n => n.branch === branch && n.tier === 1);
                                    const tier2Nodes = SKILL_NODES.filter(n => n.branch === branch && n.tier === 2);

                                    return (
                                        <div key={branch} className={`rounded-xl border p-2 ${branchMeta.bgColor} ${branchMeta.borderColor}`}>
                                            <p className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${branchMeta.color}`}>
                                                {branchMeta.emoji} {branch}
                                            </p>
                                            {[...tier1Nodes, ...tier2Nodes].map(node => {
                                                const isUnlocked = unlockedNodes.includes(node.id);
                                                const { canUnlock, reason } = canUnlockNode(node.id, founder, startup, month);
                                                const isBlocked = !isUnlocked && !canUnlock;

                                                return (
                                                    <button
                                                        key={node.id}
                                                        title={`${node.description}\n\n${isUnlocked ? '✅ Unlocked' : reason}`}
                                                        onClick={() => !isUnlocked && (typeof onUnlockSkill !== 'undefined' ? onUnlockSkill(node.id) : handleUnlockSkill(node.id))}
                                                        disabled={isUnlocked || isBlocked}
                                                        className={cn(
                                                            "w-full text-left p-1.5 rounded-lg mb-1 last:mb-0 transition-all border",
                                                            node.tier === 2 && "ml-1",
                                                            isUnlocked
                                                                ? `bg-white dark:bg-slate-700 ${branchMeta.borderColor} opacity-90`
                                                                : canUnlock
                                                                    ? `bg-white/80 dark:bg-slate-700/80 ${branchMeta.borderColor} hover:opacity-90 cursor-pointer`
                                                                    : "bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-1">
                                                            <span className="text-[11px] shrink-0 mt-0.5">
                                                                {isUnlocked ? '✅' : node.tier === 2 ? '↳' : node.emoji}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className={cn(
                                                                    "text-[8px] font-black leading-tight truncate",
                                                                    isUnlocked ? branchMeta.color : isBlocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'
                                                                )}>
                                                                    {node.label}
                                                                </p>
                                                                <p className="text-[7px] text-slate-400 dark:text-slate-500 leading-snug mt-0.5 line-clamp-2">
                                                                    {node.tagline}
                                                                </p>
                                                                {!isUnlocked && (
                                                                    <p className={cn(
                                                                        "text-[7px] font-black mt-0.5",
                                                                        canUnlock ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'
                                                                    )}>
                                                                        {canUnlock ? `🔓 ${node.cost} SP — Tap to unlock` : reason}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

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
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">🔄 Active Programs</p>
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
                                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40 cursor-pointer mb-2 animate-in slide-in-from-right-2">
                                <span className="text-xl">{prog.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{prog.label}</p>
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
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-2">⚡ One-Time Actions</p>
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
                                        !isCollapsed ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700")}
                                >
                                    <span className="text-base">{groupEmojis[group.category] || "📌"}</span>
                                    <span className={cn("flex-1 text-xs font-black uppercase tracking-wide text-left", !isCollapsed ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400")}>{group.label}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{groupActions.length} actions</span>
                                    <span className={cn("text-slate-400 text-xs transition-transform", !isCollapsed ? "rotate-90" : "")}>›</span>
                                </button>

                                {/* Expanded actions */}
                                {!isCollapsed && (
                                    <div className="space-y-1.5 mt-1.5 ml-1">
                                        {groupActions.map(action => renderActionCard(action, "founder"))}
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
                                className="flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer mb-2 hover:border-indigo-100 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30">
                                <span className="text-xl">{prog.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{prog.label}</p>
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
        const handleGatherIntelAd = (compId: string) => {
            adService.showRewardedAd(() => {
                setCompetitors(prev => prev.map(c => {
                    if (c.id === compId) {
                        return {
                            ...c,
                            valuation: Math.floor(c.valuation * 0.9),
                            integration_risk: "Low",
                            is_diligent: true,
                        };
                    }
                    return c;
                }));
                toast.success("Corporate Espionage Successful!", { description: "Integration risk lowered to 'Low' and valuation reduced by 10%.", icon: "🕵️" });
            });
        };

        return (
            <div>
                {sheetHeader("⚔️", "Market & Rivals", "Track your competition")}
                <div className="space-y-3">
                    {competitors.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                            <span className="text-4xl">🌫️</span>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2 dark:text-slate-300">The market is quiet... for now.</p>
                        </div>
                    )}
                    {competitors.map(comp => {
                        const isChadly = comp.id === 'chadly';
                        const isActive = comp.status === "active";
                        const isIPO = comp.status === "ipo";
                        const isFailed = comp.status === "failed";

                        if (isChadly) {
                            return (
                                <div key={comp.id} className="p-4 rounded-[2rem] border-2 border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 via-white to-white dark:from-slate-900 dark:to-slate-950 shadow-xl shadow-indigo-100/20 dark:shadow-none relative overflow-hidden group mb-4">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden bg-indigo-100 dark:bg-slate-900 shadow-md ring-2 ring-indigo-400/20">
                                                    <img src="/characters/chad_rival.png" alt="Chad" className="object-cover w-full h-full" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 shadow-lg border-2 border-white">
                                                    <Zap className="w-3 h-3 fill-current" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{comp.name}</p>

                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{comp.industry}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-tight">
                                                {comp.status}
                                            </div>
                                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">Sentiment: <span className={cn("font-black", comp.sentiment === 'panicking' ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-slate-600 dark:text-slate-400 uppercase")}>{comp.sentiment || 'merciless'}</span></p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-2.5 border border-indigo-100 dark:border-indigo-900 shadow-sm">
                                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5 leading-none">Valuation</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">{formatMoney(comp.valuation)}</p>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-2.5 border border-indigo-100 dark:border-indigo-900 shadow-sm">
                                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5 leading-none">Users</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">{formatNumber(comp.users)}</p>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-2.5 border border-indigo-100 dark:border-indigo-900 shadow-sm">
                                            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5 leading-none">Velocity</p>
                                            <p className={cn("text-[10px] font-black uppercase tracking-tight", comp.velocity === 'hyper-growth' ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400")}>{comp.velocity || 'Hyper-Growth'}</p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-indigo-100 relative z-10">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" /> Battle Actions
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {RIVALRY_ACTIONS.map(action => {
                                                const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
                                                const isDisabled = (focusHoursUsed + action.energyCost > maxHours * 1.1) || (startup.metrics.cash < action.cashCost);

                                                return (
                                                    <button
                                                        key={action.id}
                                                        onClick={() => handleRivalryAction(action)}
                                                        disabled={isDisabled}
                                                        className="group flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:bg-white dark:disabled:hover:bg-slate-800 text-left"
                                                    >
                                                        <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{action.emoji}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase leading-none truncate mb-1">{action.label}</p>
                                                            <div className="flex items-center gap-1.5 leading-none">
                                                                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                                                                    <Zap className="w-2 h-2 fill-slate-400 dark:fill-slate-500" /> {action.energyCost}h
                                                                </span>
                                                                {action.cashCost > 0 && (
                                                                    <span className="text-[8px] font-bold text-indigo-400 dark:text-indigo-400 flex items-center gap-0.5">
                                                                        <DollarSign className="w-2 h-2" /> {formatMoney(action.cashCost)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {(comp.status === "active" || comp.status === "ipo") && (
                                        <div className="mt-3 relative z-10">
                                            <button
                                                onClick={() => handleAcquireRival(comp)}
                                                disabled={startup.metrics.cash < Math.floor(comp.valuation * 1.25)}
                                                className="w-full py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 disabled:from-slate-100 disabled:to-slate-100 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 text-white font-black uppercase text-[9px] rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 z-10 relative"
                                            >
                                                <span>👑 Hostile Takeover Chadly for {formatMoney(Math.floor(comp.valuation * 1.25))}</span>
                                            </button>
                                        </div>
                                    )}

                                    {comp.last_action && (
                                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">Last Intel:</span>
                                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 italic">{(comp.last_action as string).replace(/_/g, " ")} success</span>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <div key={comp.id} className={cn(
                                "p-3 rounded-2xl border-2 transition-all",
                                isActive ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm" :
                                    isIPO ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50" :
                                        "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60"
                            )}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{isFailed ? "💀" : isIPO ? "🚀" : "🏢"}</span>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{comp.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">{comp.industry}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                                        isActive ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400" :
                                            isIPO ? "bg-indigo-600 dark:bg-indigo-600 text-white" :
                                                "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400"
                                    )}>
                                        {comp.status}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase">Valuation</p>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{formatMoney(comp.valuation)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase">Users</p>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{comp.users.toLocaleString()}</p>
                                    </div>
                                </div>
                                {comp.last_action && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 italic">
                                            Last Move: <span className="text-indigo-600 dark:text-indigo-400">{(comp.last_action as string).replace(/_/g, " ")}</span>
                                        </p>
                                    </div>
                                )}

                                {comp.is_diligent ? (
                                    <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                        <p className="text-[8px] font-black text-slate-500 uppercase">Due Diligence Intel</p>
                                        <div className="flex justify-between text-[9px] font-medium text-slate-600 dark:text-slate-400">
                                            <span>Integration Risk:</span>
                                            <span className={cn("font-black", comp.integration_risk === "High" ? "text-rose-600 animate-pulse" : comp.integration_risk === "Medium" ? "text-amber-500" : "text-emerald-600")}>
                                                {comp.integration_risk}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-medium text-slate-600 dark:text-slate-400">
                                            <span>Financial Health:</span>
                                            <span className={cn("font-black", comp.financial_health === "Burning Cash" ? "text-rose-600" : "text-emerald-600")}>
                                                {comp.financial_health}
                                            </span>
                                        </div>
                                        <p className="text-[7.5px] font-medium text-slate-400 italic leading-snug mt-1 border-t border-dashed border-slate-200 dark:border-slate-800 pt-1">
                                            {comp.integration_risk === "High" ? "⚠️ Flight risk and tech fragmentation. Est. -20 Team Morale." :
                                                comp.integration_risk === "Medium" ? "⚠️ Redundancies, moderate friction. Est. -10 Team Morale." :
                                                    "✅ Culture fit, clean stack. Est. +5 Team Morale boost."}
                                        </p>
                                    </div>
                                ) : (
                                    (isActive || isIPO) && (
                                        <button
                                            onClick={() => {
                                                const ddCost = Math.min(250000, Math.max(5000, Math.floor(comp.valuation * 0.005)));
                                                if (startup.metrics.cash < ddCost) { toast.error("Not enough corporate cash!"); return; }
                                                const newStartup = { ...startup };
                                                newStartup.metrics.cash -= ddCost;
                                                setStartup(newStartup);
                                                setCompetitors(prev => prev.map(c => c.id === comp.id ? { ...c, is_diligent: true } : c));
                                                toast.success("Due Diligence Complete", { description: `Unlocked intelligence report for ${comp.name}` });
                                            }}
                                            className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black uppercase text-[8px] rounded-lg transition-all active:scale-95 shadow-sm"
                                        >
                                            🔬 Run Due Diligence ({formatMoney(Math.min(250000, Math.max(5000, Math.floor(comp.valuation * 0.005))))})
                                        </button>
                                    )
                                )}

                                {(isActive || isIPO) && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <button
                                            onClick={() => handleGatherIntelAd(comp.id)}
                                            className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <span className="text-xs">🕵️</span> Gather Intel (Ad)
                                        </button>
                                        <button
                                            onClick={() => handleAcquireRival(comp)}
                                            disabled={startup.metrics.cash < (isIPO ? Math.floor(comp.valuation * 1.15) : comp.valuation)}
                                            className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-100 disabled:to-slate-100 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 text-white font-black uppercase text-[9px] rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1"
                                        >
                                            <span>🦈 {isIPO ? `Takeover Public Rival for ${formatMoney(Math.floor(comp.valuation * 1.15))}` : `Buyout Rival for ${formatMoney(comp.valuation)}`}</span>
                                        </button>
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

                <div className="bg-indigo-600 dark:bg-indigo-700/80 rounded-3xl p-4 mb-6 shadow-lg shadow-indigo-100 dark:shadow-none">
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
                                            isActive ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                                        )}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tg.emoji}</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{tg.name}</p>
                                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-tight">
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
                                        <div className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-600"}>
                                            {isActive ? <div className="bg-indigo-600 dark:bg-indigo-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-slate-700" />}
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
                                    <div key={asset.id} className="p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-2xl">{asset.emoji}</span>
                                            <div className={cn(
                                                "px-1.5 py-0.5 rounded-lg text-[8px] font-black",
                                                isUp ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                                            )}>
                                                {isUp ? "+" : ""}{change.toFixed(1)}%
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{asset.name}</p>
                                        <p className="text-[12px] font-black text-slate-900 dark:text-slate-100 mt-1">{formatMoney(asset.currentValue)}</p>
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
                                    <div key={idx} className="p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{asset.emoji}</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{asset.name}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(price)}</p>
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

    if (category === "trade_stock" || category === "personal_trade") {
        const isPersonal = category === "personal_trade";
        const founderWealth = founder.wealth_profile || { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
        const availableCash = isPersonal ? (founder.personal_wealth || 0) : m.cash;
        // Pre-IPO uses startup.treasury_portfolio; post-IPO uses public_company.corporate_portfolio
        const currentPortfolio: any[] = isPersonal
            ? (founderWealth.portfolio || [])
            : (startup.public_company?.corporate_portfolio || (startup as any).treasury_portfolio || []);

        // Only show own company stock if already public
        const visibleStocks = (marketStocks || []).filter(s => {
            if (s.symbol === (startup.symbol || "CORP") && !startup.public_company) return false;
            if (!isPersonal && s.symbol === (startup.symbol || "CORP")) return false;
            return true;
        });

        const SECTORS = ["All", ...Array.from(new Set(visibleStocks.map(s => s.sector)))];

        const handleTrade = (symbol: string, shares: number, currentPrice: number) => {
            try {
                const { newCash, newPortfolio } = executeTrade(currentPortfolio, availableCash, symbol, shares, currentPrice);
                if (isPersonal) {
                    const newFounder = { ...founder };
                    if (!newFounder.wealth_profile) newFounder.wealth_profile = { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
                    newFounder.personal_wealth = newCash;
                    newFounder.wealth_profile.portfolio = newPortfolio;
                    if (setFounder) setFounder(newFounder);
                } else {
                    const newStartup: any = { ...startup };
                    newStartup.metrics.cash = newCash;
                    if (newStartup.public_company) {
                        newStartup.public_company.corporate_portfolio = newPortfolio;
                    } else {
                        // Pre-IPO: store in treasury_portfolio
                        newStartup.treasury_portfolio = newPortfolio;
                    }
                    setStartup(newStartup);
                }
                const verb = shares > 0 ? "Bought" : "Sold";
                toast.success(`${verb} ${formatNumber(Math.abs(shares))} ${symbol}`, { description: `@ ${formatMoney(currentPrice)} · Total: ${formatMoney(Math.abs(shares * currentPrice))}` });
                addTimelineEvent(`📈 ${isPersonal ? "Stock Market" : "Treasury"}: ${verb} ${formatNumber(Math.abs(shares))} ${symbol} @ ${formatMoney(currentPrice)}`);
            } catch (err: any) {
                toast.error("Trade Failed", { description: err.message });
            }
        };

        // --- Sub-state for this panel (sector filter + selected stock + qty) ---
        // We use a closure-level ref trick — render inline state via useState wrapper key





        const filtered = tradeSectorFilter === "All" ? visibleStocks : visibleStocks.filter(s => s.sector === tradeSectorFilter);
        const selectedStock = visibleStocks.find(s => s.symbol === tradeSelectedSymbol) || null;

        const portfolioValue = currentPortfolio.reduce((sum: number, pos: any) => {
            const price = visibleStocks.find(s => s.symbol === pos.symbol)?.currentPrice ?? pos.averageCost;
            return sum + pos.shares * price;
        }, 0);
        const portfolioCost = currentPortfolio.reduce((sum: number, pos: any) => sum + pos.shares * pos.averageCost, 0);
        const portfolioPnl = portfolioValue - portfolioCost;

        if (selectedStock) {
            const pos: any = currentPortfolio.find((p: any) => p.symbol === selectedStock.symbol);
            const history = selectedStock.priceHistory || [selectedStock.currentPrice];
            const minP = Math.min(...history);
            const maxP = Math.max(...history);
            const range = maxP - minP || 1;
            const chartW = 300;
            const chartH = 80;
            const points = history.map((p, i) =>
                `${(i / Math.max(1, history.length - 1)) * chartW},${chartH - ((p - minP) / range) * chartH}`
            ).join(" ");
            const isUp = history[history.length - 1] >= history[0];
            const strokeColor = isUp ? "#10b981" : "#f43f5e";
            const fillId = `grad_${selectedStock.symbol}`;

            const currentHeldShares = pos?.shares || 0;
            const availableSharesToBuy = Math.max(0, selectedStock.sharesOutstanding - currentHeldShares);
            const maxAffordableShares = Math.min(availableSharesToBuy, Math.floor(availableCash / selectedStock.currentPrice));

            // When using the slider, calculate shares based on percentage of max affordable
            const deployShares = Math.max(1, Math.min(availableSharesToBuy, Math.floor((tradeQtyPct / 100) * availableCash / selectedStock.currentPrice)));
            const deployCost = deployShares * selectedStock.currentPrice;
            const canBuy = availableCash >= deployCost && deployShares <= availableSharesToBuy;
            const canSell = pos && pos.shares > 0;

            const rsiVal = Math.round(selectedStock.rsi);
            const rsiLabel = rsiVal > 70 ? "Overbought" : rsiVal < 30 ? "Oversold" : "Neutral";
            const rsiColor = rsiVal > 70 ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20" : rsiVal < 30 ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-slate-500 bg-slate-100 dark:bg-slate-800";
            const volLabel = selectedStock.volatility > 0.1 ? "High" : selectedStock.volatility > 0.05 ? "Med" : "Low";
            const volColor = selectedStock.volatility > 0.1 ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20" : selectedStock.volatility > 0.05 ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
            const pxChange = history.length > 1 ? history[history.length - 1] - history[history.length - 2] : 0;
            const pctChange = history.length > 1 ? (pxChange / history[history.length - 2]) * 100 : 0;

            return (
                <div className="flex flex-col gap-3">
                    {/* Back */}
                    <button onClick={() => setTradeSelectedSymbol(null)} className="flex items-center gap-1.5 text-[11px] font-black text-indigo-500 uppercase tracking-widest">
                        ← All Stocks
                    </button>

                    {/* Stock Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{selectedStock.symbol}</p>
                                <p className="text-[11px] text-slate-500">{selectedStock.companyName}</p>
                                <p className="text-[10px] text-slate-400">
                                    {selectedStock.sector} · <span className="font-bold">Cap: {formatMoney(selectedStock.currentPrice * selectedStock.sharesOutstanding)}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatMoney(selectedStock.currentPrice)}</p>
                                <p className={`text-sm font-black ${pxChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {pxChange >= 0 ? "▲" : "▼"} {formatMoney(Math.abs(pxChange))} ({pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%)
                                </p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="relative w-full h-20 mb-2">
                            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <polygon
                                    points={`0,${chartH} ${points} ${chartW},${chartH}`}
                                    fill={`url(#${fillId})`}
                                />
                                <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="absolute top-0 left-0 text-[8px] text-slate-400">{formatMoney(maxP)}</div>
                            <div className="absolute bottom-0 left-0 text-[8px] text-slate-400">{formatMoney(minP)}</div>
                        </div>

                        {/* Indicators */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className={`rounded-xl p-2 text-center ${rsiColor}`}>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-70">RSI</p>
                                <p className="text-sm font-black">{rsiVal}</p>
                                <p className="text-[8px] font-bold">{rsiLabel}</p>
                            </div>
                            <div className={`rounded-xl p-2 text-center ${volColor}`}>
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Volatility</p>
                                <p className="text-sm font-black">{(selectedStock.volatility * 100).toFixed(1)}%</p>
                                <p className="text-[8px] font-bold">{volLabel}</p>
                            </div>
                            <div className="rounded-xl p-2 text-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-70">P/E</p>
                                <p className="text-sm font-black">{selectedStock.peRatio > 0 ? `${selectedStock.peRatio}x` : "N/A"}</p>
                                <p className="text-[8px] font-bold">{selectedStock.peRatio > 40 ? "Growth" : selectedStock.peRatio > 0 ? "Value" : "Unprofitable"}</p>
                            </div>
                            <div className="rounded-xl p-2 text-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Shares</p>
                                <p className="text-sm font-black">{formatNumber(selectedStock.sharesOutstanding)}</p>
                                <p className="text-[8px] font-bold">Outstanding</p>
                            </div>
                        </div>
                        {/* News */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">🗞️ Latest News</p>
                            <p className={`text-[11px] font-medium ${selectedStock.recentNews ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
                                {selectedStock.recentNews || "No significant events reported recently."}
                            </p>
                        </div>
                    </div>

                    {/* Position */}
                    {pos && pos.shares > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-3">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Your Position</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <p className="text-[9px] text-indigo-400">Shares</p>
                                    <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">{formatNumber(pos.shares)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-indigo-400">Avg Cost</p>
                                    <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">{formatMoney(pos.averageCost)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-indigo-400">Unrealized P&L</p>
                                    {(() => {
                                        const pnl = (selectedStock.currentPrice - pos.averageCost) * pos.shares;
                                        return <p className={`text-xs font-black ${pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{pnl >= 0 ? "+" : ""}{formatMoney(pnl)}</p>;
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trade Controls */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Place Order</p>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] text-slate-500">Deploy <span className="font-black text-slate-800 dark:text-white">{tradeQtyPct}%</span> of cash</p>
                            <p className="text-[10px] font-black text-indigo-500">{formatNumber(deployShares)} shares · {formatMoney(deployCost)}</p>
                        </div>
                        <input type="range" min={1} max={100} value={tradeQtyPct} onChange={e => setTradeQtyPct(Number(e.target.value))}
                            className="w-full h-2 rounded-full accent-indigo-600 mb-3" />
                        <div className="text-[9px] text-slate-400 mb-3">Cash Available: <span className="font-black text-slate-700 dark:text-slate-200">{formatMoney(availableCash)}</span> · Max shares: <span className="font-black">{formatNumber(maxAffordableShares)}</span></div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleTrade(selectedStock.symbol, deployShares, selectedStock.currentPrice)}
                                disabled={!canBuy}
                                className="py-3 rounded-xl bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-all"
                            >
                                Buy {formatNumber(deployShares)}
                            </button>
                            <button
                                onClick={() => pos && handleTrade(selectedStock.symbol, -Math.min(deployShares, pos.shares), selectedStock.currentPrice)}
                                disabled={!canSell}
                                className="py-3 rounded-xl bg-rose-500 text-white font-black text-[11px] uppercase tracking-wider disabled:opacity-30 active:scale-95 transition-all"
                            >
                                Sell {canSell ? formatNumber(Math.min(deployShares, pos.shares)) : "—"}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // --- List View ---
        return (
            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cash Available</p>
                        <p className="text-lg font-black text-emerald-500">{formatMoney(availableCash)}</p>
                    </div>
                    {currentPortfolio.length > 0 && (
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portfolio P&L</p>
                            <p className={`text-sm font-black ${portfolioPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                {portfolioPnl >= 0 ? "+" : ""}{formatMoney(portfolioPnl)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sector filter tabs */}
                <div className="flex gap-1.5 flex-wrap">
                    {SECTORS.map(s => (
                        <button key={s} onClick={() => setTradeSectorFilter(s)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${tradeSectorFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Stock List */}
                {filtered.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">No stocks in this sector yet.</div>
                )}
                {filtered.map(stock => {
                    const pos: any = currentPortfolio.find((p: any) => p.symbol === stock.symbol);
                    const history = stock.priceHistory || [stock.currentPrice];
                    const minP = Math.min(...history);
                    const maxP = Math.max(...history);
                    const sparkPts = history.map((p, i) =>
                        `${(i / Math.max(1, history.length - 1)) * 100},${100 - ((p - minP) / Math.max(1, maxP - minP || 1)) * 100}`
                    ).join(" ");
                    const isUp = stock.momentum >= 0;
                    const pxChange = history.length > 1 ? history[history.length - 1] - history[history.length - 2] : 0;
                    const pctChange = history.length > 1 ? (pxChange / history[history.length - 2]) * 100 : 0;
                    const rsiVal = Math.round(stock.rsi);
                    const rsiCol = rsiVal > 70 ? "text-rose-500" : rsiVal < 30 ? "text-emerald-500" : "text-slate-400";

                    return (
                        <button key={stock.symbol} onClick={() => setTradeSelectedSymbol(stock.symbol)}
                            className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 active:scale-[0.98] transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                            <div className="flex items-center gap-3">
                                {/* Symbol + sector */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{stock.symbol}</p>
                                        {pos && pos.shares > 0 && <span className="text-[8px] font-black bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">HELD</span>}
                                        {stock.recentNews && <span title="Breaking News!" className="text-[10px]">🗞️</span>}
                                    </div>
                                    <p className="text-[9px] text-slate-400 truncate">{stock.companyName} · <span className="font-bold">Cap: {formatMoney(stock.currentPrice * stock.sharesOutstanding)}</span></p>
                                    <p className="text-[9px] text-slate-400">RSI <span className={`font-black ${rsiCol}`}>{rsiVal}</span> · Vol <span className="font-bold text-slate-500">{(stock.volatility * 100).toFixed(0)}%</span></p>
                                </div>

                                {/* Sparkline */}
                                <div className="w-14 h-7">
                                    <svg viewBox="0 -5 100 110" className="w-full h-full" preserveAspectRatio="none">
                                        <polyline points={sparkPts} fill="none" stroke={isUp ? "#10b981" : "#f43f5e"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{formatMoney(stock.currentPrice)}</p>
                                    <p className={`text-[10px] font-black ${pctChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                        {pctChange >= 0 ? "▲" : "▼"} {Math.abs(pctChange).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        );

    }

    if (category === "margin_loan") {
        const founderWealth = founder.wealth_profile || { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };

        // Calculate borrowing power: 50% of stock value (ignoring options)
        const myShares = startup.capTable?.find((e: any) => e.type === "Founder")?.equity || 20;
        const totalShares = startup.public_company?.shares_outstanding || 100_000_000;
        const myShareCount = (myShares / 100) * totalShares;
        const myStockValue = myShareCount * (startup.public_company?.share_price || 0);

        const personalPortfolioValue = founderWealth.portfolio?.reduce((acc: number, p: any) => acc + (p.shares * (marketStocks?.find((s: any) => s.symbol === p.symbol)?.currentPrice || p.averageCost)), 0) || 0;

        const totalCollateral = myStockValue + personalPortfolioValue;
        const maxLoan = totalCollateral * 0.5; // 50% LTV limit
        const currentLoan = founderWealth.margin_loan_balance || 0;
        const availableLoan = Math.max(0, maxLoan - currentLoan);
        const ltvRatio = totalCollateral > 0 ? (currentLoan / totalCollateral) * 100 : 0;

        const handleBorrow = (amount: number) => {
            if (amount > availableLoan) {
                toast.error("Borrow Limit Exceeded", { description: "You cannot borrow beyond 50% LTV of your collateral." });
                return;
            }
            const newFounder = { ...founder };
            if (!newFounder.wealth_profile) newFounder.wealth_profile = { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
            newFounder.personal_wealth = (newFounder.personal_wealth || 0) + amount;
            newFounder.wealth_profile.margin_loan_balance = (newFounder.wealth_profile.margin_loan_balance || 0) + amount;

            if (setFounder) setFounder(newFounder);
            addTimelineEvent(`💳 Drew ${formatMoney(amount)} from margin line. Current balance: ${formatMoney(newFounder.wealth_profile.margin_loan_balance)}`);
            toast.success("Funds Borrowed", { description: `Received ${formatMoney(amount)} in personal cash!` });
        };

        const handleRepay = (amount: number) => {
            const repayAmount = Math.min(amount, founder.personal_wealth || 0, currentLoan);
            if (repayAmount <= 0) return;

            const newFounder = { ...founder };
            newFounder.personal_wealth = Math.max(0, (newFounder.personal_wealth || 0) - repayAmount);
            if (newFounder.wealth_profile) {
                newFounder.wealth_profile.margin_loan_balance = Math.max(0, (newFounder.wealth_profile.margin_loan_balance || 0) - repayAmount);
            }

            if (setFounder) setFounder(newFounder);
            addTimelineEvent(`💳 Repaid ${formatMoney(repayAmount)} to margin line.`);
            toast.success("Loan Repaid", { description: `Repaid ${formatMoney(repayAmount)} margin debt.` });
        };

        // Determine risk level based on LTV
        let riskColor = "bg-emerald-500";
        let riskLabel = "Safe (LTV < 35%)";
        if (ltvRatio >= 50) {
            riskColor = "bg-rose-600 animate-pulse";
            riskLabel = "CRITICAL (LTV >= 50% - Liquidation Risk)";
        } else if (ltvRatio >= 35) {
            riskColor = "bg-amber-500";
            riskLabel = "Warning (LTV >= 35% - Monitor Market)";
        }

        return (
            <div className="flex flex-col gap-4 animate-in fade-in-50 duration-300">
                {sheetHeader("💳", "Margin Account", "Personal Credit Terminal")}

                {/* Collateral Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Collateral Value</p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatMoney(totalCollateral)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Personal Cash</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatMoney(founder.personal_wealth || 0)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Loan Balance</p>
                        <p className="text-xs font-black text-rose-600 mt-0.5">{formatMoney(currentLoan)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Available to Borrow</p>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">{formatMoney(availableLoan)}</p>
                    </div>
                </div>

                {/* Margin Call Risk Indicator */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">Margin Credit Meter</p>
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{ltvRatio.toFixed(1)}% LTV</p>
                    </div>

                    {/* Risk progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden flex">
                        <div className={`h-full ${riskColor}`} style={{ width: `${Math.min(100, (ltvRatio / 50) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold">LTV Risk Meter:</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{riskLabel}</span>
                    </div>
                    <p className="text-[8px] text-slate-400/80 mt-3 leading-normal">
                        Your margin line is secured by your equity. If stock price declines push LTV past **55%**, the SEC will issue a Margin Call, **forcibly liquidating** your shares to clear the debt!
                    </p>
                </div>

                {/* Draw Slider */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Draw Cash (Costs 6% APR Interest)</p>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-indigo-600">{formatMoney(borrowSlideVal)}</span>
                        <span className="text-[9px] text-slate-400 font-bold">Max: {formatMoney(availableLoan)}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={availableLoan}
                        step={Math.max(10000, Math.floor(availableLoan / 100)) || 1000}
                        value={Math.min(borrowSlideVal, availableLoan)}
                        onChange={(e) => setBorrowSlideVal(Number(e.target.value))}
                        className="w-full accent-indigo-500 mb-3"
                    />
                    <button
                        onClick={() => { handleBorrow(borrowSlideVal); setBorrowSlideVal(0); }}
                        disabled={borrowSlideVal <= 0 || borrowSlideVal > availableLoan}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[9px] py-2.5 rounded-xl disabled:opacity-30 transition active:scale-95"
                    >
                        Borrow {formatMoney(borrowSlideVal)}
                    </button>
                </div>

                {/* Settle Debt Slider */}
                {currentLoan > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Repay Balance (Settle Debt)</p>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black text-emerald-600">{formatMoney(repaySlideVal)}</span>
                            <span className="text-[9px] text-slate-400 font-bold">Max: {formatMoney(Math.min(currentLoan, founder.personal_wealth || 0))}</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={Math.min(currentLoan, founder.personal_wealth || 0)}
                            step={Math.max(10000, Math.floor(Math.min(currentLoan, founder.personal_wealth || 0) / 100)) || 1000}
                            value={Math.min(repaySlideVal, Math.min(currentLoan, founder.personal_wealth || 0))}
                            onChange={(e) => setRepaySlideVal(Number(e.target.value))}
                            className="w-full accent-emerald-500 mb-3"
                        />
                        <button
                            onClick={() => { handleRepay(repaySlideVal); setRepaySlideVal(0); }}
                            disabled={repaySlideVal <= 0 || repaySlideVal > Math.min(currentLoan, founder.personal_wealth || 0)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] py-2.5 rounded-xl disabled:opacity-30 transition active:scale-95"
                        >
                            Repay {formatMoney(repaySlideVal)}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (category === "lobbying") {
        const score = startup.public_company?.lobbying_score || 0;

        const handleLobby = (amount: number, points: number, type: string) => {
            if (m.cash < amount) {
                toast.error("Insufficient Cash", { description: "You don't have enough corporate cash to fund this campaign." });
                return;
            }
            const newStartup = { ...startup };
            newStartup.metrics.cash -= amount;
            newStartup.public_company.lobbying_score = Math.min(100, (newStartup.public_company.lobbying_score || 0) + points);

            if (type === "liaison") {
                newStartup.ceo_reputation = Math.min(100, (newStartup.ceo_reputation || 80) + 8);
                addTimelineEvent(`🏛️ Federal Liaison: Funded federal regulatory liaison with ${formatMoney(amount)}. Lobbying score +${points}, CEO Reputation +8.`);
                toast.success("Liaison Active", { description: "Your Washington influence has elevated your reputation!" });
            } else if (type === "coalition") {
                // Grant $15M R&D cash immediately!
                newStartup.metrics.cash += 15000000;
                addTimelineEvent(`🏛️ Coalition Subsidy: Sponsored bipartisan coalition with ${formatMoney(amount)}, securing an immediate $15,000,000 federal R&D tax grant!`);
                toast.success("Subsidy Secured!", { description: "Received $15M federal R&D grant!" });
            } else {
                addTimelineEvent(`🏛️ PAC Funding: Funded PAC campaign with ${formatMoney(amount)}. Lobbying score +${points}.`);
                toast.success("PAC Funded", { description: `Lobbying Influence increased by +${points}!` });
            }
            setStartup(newStartup);
        };

        return (
            <div className="flex flex-col gap-4 animate-in fade-in-50 duration-300">
                {sheetHeader("🏛️", "Lobbying & Capture", "Washington Influence Terminal")}

                {/* Regulatory Progress Gauge */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-4">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Influence Score</h3>
                            <p className="text-[9px] text-slate-400 mt-0.5">Your regulatory capture percentage</p>
                        </div>
                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{score} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 h-full transition-all" style={{ width: `${score}%` }} />
                    </div>

                    {/* Tier Unlocks Panel */}
                    <div className="space-y-2 border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className={cn("font-bold", score >= 30 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>
                                {score >= 30 ? "✅" : "🔒"} Tier 1 (30+): Audit & Investigation Protection
                            </span>
                            <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">-50% Crisis Chance</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className={cn("font-bold", score >= 70 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>
                                {score >= 70 ? "✅" : "🔒"} Tier 2 (70+): Complete Regulatory Capture
                            </span>
                            <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold">+15% Monthly Tax Credit</span>
                        </div>
                    </div>
                </div>

                {/* Advanced Influence Campaigns */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Lobbying Initiatives &amp; Campaigns</p>

                    <div className="space-y-3">
                        {/* K-Street retainer */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-700/50 rounded-2xl">
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100">K-Street Law Retainer</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">-$2M Corporate Cash</p>
                            </div>
                            <button
                                onClick={() => handleLobby(2000000, 4, "retainer")}
                                disabled={m.cash < 2000000}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-xl transition active:scale-95 disabled:opacity-45"
                            >
                                +4 Influence
                            </button>
                        </div>

                        {/* Targeted PAC Contribution */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-700/50 rounded-2xl">
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100">Targeted PAC Contribution</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">-$10M Corporate Cash</p>
                            </div>
                            <button
                                onClick={() => handleLobby(10000000, 15, "pac")}
                                disabled={m.cash < 10000000}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-xl transition active:scale-95 disabled:opacity-45"
                            >
                                +15 Influence
                            </button>
                        </div>

                        {/* Federal Regulatory Liaison */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-700/50 rounded-2xl">
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100">Federal Regulatory Liaison</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">-$20M Corporate Cash · Boost Reputation</p>
                            </div>
                            <button
                                onClick={() => handleLobby(20000000, 30, "liaison")}
                                disabled={m.cash < 20000000}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-xl transition active:scale-95 disabled:opacity-45"
                            >
                                +30 Influence
                            </button>
                        </div>

                        {/* Bipartisan Coalition Sponsor */}
                        <div className="flex items-center justify-between p-3 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
                            <div className="flex-1">
                                <p className="text-xs font-black text-indigo-900 dark:text-indigo-300">Bipartisan Coalition Sponsorship</p>
                                <p className="text-[9px] text-indigo-700/50 dark:text-indigo-400/50 font-bold mt-0.5">-$50M Corporate Cash · Secures $15M Federal Grant</p>
                            </div>
                            <button
                                onClick={() => handleLobby(50000000, 60, "coalition")}
                                disabled={m.cash < 50000000}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[8px] px-4 py-2 rounded-xl transition active:scale-95 disabled:opacity-45"
                            >
                                +60 Influence
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (category === "buyback") {
        const pub = startup.public_company;
        const sharesOut = pub?.shares_outstanding || 100000000;
        const sharePrice = pub?.share_price || 0;
        const auth = pub?.buyback_authorized || 0;
        const floatShares = pub?.float || 20000000;
        const eps = pub?.eps_last_quarter || 0.05;

        // Dynamic capital allocation amounts
        const companyValuation = sharesOut * sharePrice;
        const authSmall = Math.max(1000, Math.round(0.01 * companyValuation)); // 1% of company
        const authLarge = Math.max(5000, Math.round(0.05 * companyValuation)); // 5% of company

        const costSmall = Math.max(1, Math.round(0.005 * floatShares * sharePrice)); // 0.5% of float
        const costMedium = Math.max(1, Math.round(0.02 * floatShares * sharePrice)); // 2.0% of float
        const costTender = Math.max(1, Math.round(0.05 * floatShares * sharePrice * 1.10)); // 5.0% of float + 10% premium

        const popSmall = (Math.min(0.25, 0.005 * 0.8) * 100).toFixed(1);
        const popMedium = (Math.min(0.25, 0.02 * 0.8) * 100).toFixed(1);
        const popTender = (Math.min(0.25, 0.05 * 1.2) * 100).toFixed(1);

        const handleAuthorize = (amount: number) => {
            const newStartup = { ...startup };
            newStartup.public_company.buyback_authorized = amount;
            setStartup(newStartup);
            addTimelineEvent(`💸 Board authorized a ${formatMoney(amount)} share repurchase program.`);
            toast.success("Program Authorized", { description: `Board approved ${formatMoney(amount)} buyback pool.` });
        };

        const handleExecuteBuyback = (amount: number, isTender: boolean = false) => {
            if (m.cash < amount) {
                toast.error("Insufficient Cash", { description: "You don't have enough corporate cash to execute this buyback." });
                return;
            }
            if (!isTender && auth < amount) {
                toast.error("Insufficient Authorization", { description: "The authorized program limit is too small." });
                return;
            }

            const repurchasePrice = isTender ? sharePrice * 1.10 : sharePrice;
            const sharesRetired = Math.floor(amount / repurchasePrice);

            if (sharesRetired <= 0) {
                toast.error("Buyback Too Small", { description: "The buyback amount is too small to purchase a single share at current prices." });
                return;
            }

            const newStartup = { ...startup };
            newStartup.metrics.cash -= amount;
            if (!isTender) {
                newStartup.public_company.buyback_authorized = Math.max(0, newStartup.public_company.buyback_authorized - amount);
            }
            newStartup.public_company.shares_outstanding = Math.max(1, newStartup.public_company.shares_outstanding - sharesRetired);
            newStartup.public_company.float = Math.max(1, newStartup.public_company.float - sharesRetired);

            // Stock price pop based on percentage of float retired (e.g., buying 10% of float pops price by ~8%)
            const pctOfFloat = sharesRetired / floatShares;
            const pricePopFactor = 1 + Math.min(0.25, pctOfFloat * (isTender ? 1.2 : 0.8));
            newStartup.public_company.share_price *= pricePopFactor;
            newStartup.valuation = newStartup.public_company.shares_outstanding * newStartup.public_company.share_price;

            // Recalculate EPS due to fewer shares
            newStartup.public_company.eps_last_quarter = ((newStartup.metrics.net_profit || 0) * 3) / newStartup.public_company.shares_outstanding;

            setStartup(newStartup);

            const label = isTender ? "Dutch Auction Tender Offer" : "Open Market Repurchase";
            addTimelineEvent(`💸 ${label}: Executed ${formatMoney(amount)} buyback, retiring ${sharesRetired.toLocaleString("en-US")} shares. Share price popped +${((pricePopFactor - 1) * 100).toFixed(3)}%.`);
            toast.success("Buyback Executed!", { description: `Retired ${sharesRetired.toLocaleString("en-US")} float shares!` });
        };

        return (
            <div className="flex flex-col gap-4">
                {sheetHeader("💸", "Buybacks", "Capital Allocation Terminal")}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 animate-in fade-in-50 duration-300">
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Shares Outstanding</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{formatNumber(sharesOut)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Public Float Shares</p>
                        <p className="text-sm font-black text-indigo-600 mt-0.5">{formatNumber(floatShares)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">EPS (Earnings / Sh)</p>
                        <p className="text-sm font-black text-emerald-600 mt-0.5">{formatMoney(eps)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                        <p className="text-[9px] uppercase font-black text-slate-400">Authorized Program</p>
                        <p className="text-sm font-black text-amber-600 mt-0.5">{formatMoney(auth)}</p>
                    </div>
                </div>

                {/* Authorization Section */}
                {auth <= 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Authorize Buyback Program</h4>
                        <p className="text-[10px] text-slate-500 mt-1 mb-3">Instruct the Board of Directors to approve capital allocation for share repurchases.</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleAuthorize(authSmall)} className="flex-1 bg-slate-800 dark:bg-slate-700 text-white p-3 rounded-2xl text-[10px] font-black uppercase hover:opacity-90 active:scale-95 transition-all">
                                Authorize 1% Program<br />
                                <span className="text-[8px] opacity-70">({formatMoney(authSmall)})</span>
                            </button>
                            <button onClick={() => handleAuthorize(authLarge)} className="flex-1 bg-indigo-600 text-white p-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-700 active:scale-95 transition-all">
                                Authorize 5% Program<br />
                                <span className="text-[8px] opacity-70">({formatMoney(authLarge)})</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50/50 dark:bg-amber-950/15 border-2 border-amber-100 dark:border-amber-900/30 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                        <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">Open Market Buyback Program</h4>
                        <p className="text-[10px] text-slate-500 mt-1 mb-3">Execute repurchases against your active {formatMoney(auth)} authorization. Retires public float shares to boost EPS.</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExecuteBuyback(costSmall)}
                                    disabled={m.cash < costSmall || auth < costSmall}
                                    className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95"
                                >
                                    Repurchase 0.5% Float<br />
                                    <span className="text-[8px] opacity-90 font-semibold">{formatMoney(costSmall)} (+{popSmall}% pop)</span>
                                </button>
                                <button
                                    onClick={() => handleExecuteBuyback(costMedium)}
                                    disabled={m.cash < costMedium || auth < costMedium}
                                    className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95"
                                >
                                    Repurchase 2.0% Float<br />
                                    <span className="text-[8px] opacity-90 font-semibold">{formatMoney(costMedium)} (+{popMedium}% pop)</span>
                                </button>
                            </div>
                            <button
                                onClick={() => handleExecuteBuyback(Math.min(auth, m.cash))}
                                disabled={m.cash < Math.min(auth, m.cash) || Math.min(auth, m.cash) <= 0}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95"
                            >
                                Repurchase Max Available ({formatMoney(Math.min(auth, m.cash))})
                            </button>
                        </div>
                    </div>
                )}

                {/* Tender Offer dutch auction */}
                <div className="bg-rose-50/50 dark:bg-rose-950/15 border-2 border-rose-100 dark:border-rose-900/30 rounded-3xl p-4 animate-in fade-in-50 duration-300">
                    <h4 className="text-xs font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider">Dutch Auction Tender Offer</h4>
                    <p className="text-[10px] text-slate-500 mt-1 mb-3">Make a direct public offer to bypass open markets and buy back a massive block of shares at a **10% Premium** to defend against short sellers.</p>
                    <button
                        onClick={() => handleExecuteBuyback(costTender, true)}
                        disabled={m.cash < costTender}
                        className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-md shadow-rose-600/20"
                    >
                        Launch 5% Float Tender Offer (10% Premium)<br />
                        <span className="text-[8px] opacity-90 font-semibold">{formatMoney(costTender)} (Triggers +6.0% immediate price jump)</span>
                    </button>
                </div>
            </div>
        );
    }

    if (category === "10b51") {
        const plans = founder.wealth_profile?.active_10b51_plans || [];
        const myShares = startup.capTable?.find((e: any) => e.type === "Founder")?.equity || 20;
        const totalShares = startup.public_company?.shares_outstanding || 100_000_000;
        const myShareCount = (myShares / 100) * totalShares;
        const sharePrice = startup.public_company?.share_price || 1.00;
        const myEquityValue = myShareCount * sharePrice;

        const templates = [
            {
                name: "SEC Safe-Harbor Conservative",
                sharesTotal: 240000,
                months: 12,
                monthly: 20000,
                isAggressive: false,
                desc: "Sell 20k shares/mo for 12 mos. Safe, slow liquidity with absolutely zero market impact or regulatory concern.",
                badge: "Safe-Harbor Pre-Approved",
                badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
            },
            {
                name: "Standard Executive Liquidity",
                sharesTotal: 600000,
                months: 12,
                monthly: 50000,
                isAggressive: false,
                desc: "Sell 50k shares/mo for 12 mos. Moderate portfolio diversification without triggering investor alarms.",
                badge: "Standard Safe-Harbor",
                badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
            },
            {
                name: "Aggressive Corporate Exit",
                sharesTotal: 900000,
                months: 6,
                monthly: 150000,
                isAggressive: true,
                desc: "Sell 150k shares/mo for 6 mos. Rapid liquidation to build personal wealth, but applies selling pressure that drops the stock price by 1.5% every month.",
                badge: "Market-Impact Schedule",
                badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
            }
        ];

        const handleCreatePlan = (template: typeof templates[0]) => {
            const plan: import("@/lib/types/database.types").TenB51Plan = {
                id: `10b51_${Date.now()}`,
                sharesToSellTotal: template.sharesTotal,
                sharesSoldSoFar: 0,
                monthsRemaining: template.months,
                monthlySellAmount: template.monthly,
                targetPriceMinimum: 0, // sells at market
                planName: template.name,
                isAggressive: template.isAggressive,
            };

            const newFounder = { ...founder };
            if (!newFounder.wealth_profile) newFounder.wealth_profile = { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
            newFounder.wealth_profile.active_10b51_plans.push(plan);
            if (setFounder) setFounder(newFounder);
            addTimelineEvent(`📄 Executed a new 10b5-1 Trading Plan: "${template.name}" to sell ${formatNumber(template.monthly)} shares/mo for ${template.months} months.`);
            toast.success("10b5-1 Plan Registered", { description: `SEC-approved plan "${template.name}" is now active.` });
        };

        const handleCancelPlan = (id: string) => {
            const newFounder = { ...founder };
            if (!newFounder.wealth_profile) return;
            const plan = newFounder.wealth_profile.active_10b51_plans.find((p: any) => p.id === id);
            newFounder.wealth_profile.active_10b51_plans = newFounder.wealth_profile.active_10b51_plans.filter((p: any) => p.id !== id);
            if (setFounder) setFounder(newFounder);

            const newStartup = { ...startup };
            newStartup.metrics.legal_risk = true;
            if (!newStartup.metrics.board_happiness) newStartup.metrics.board_happiness = 80;
            newStartup.metrics.board_happiness = Math.max(10, newStartup.metrics.board_happiness - 15);
            setStartup(newStartup);

            addTimelineEvent(`📄 Cancelled 10b5-1 Trading Plan "${plan?.planName || 'Plan'}" prematurely. SEC alert triggered!`);
            toast.warning("SEC Alert Flagged", { description: "Cancelling a pre-scheduled trading plan violates SEC safe harbor! Board happiness decreased." });
        };

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                <span>📄</span> SEC Rule 10b5-1 Trading Portal
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">Pre-schedule founder equity liquidations to eliminate insider trading liability.</p>
                        </div>
                        {plans.length > 0 ? (
                            plans.some((p: any) => p.isAggressive) ? (
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 animate-pulse">
                                    ⚠️ Aggressive Liquidation
                                </span>
                            ) : (
                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                                    🛡️ SEC Safe-Harbor
                                </span>
                            )
                        ) : startup.metrics.legal_risk ? (
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 animate-pulse">
                                🚨 Regulatory Warning
                            </span>
                        ) : (
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                💤 Plan Inactive
                            </span>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                            <p className="text-[9px] uppercase font-black text-slate-400">Founder Shareholding</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">
                                {formatNumber(myShareCount)} <span className="text-[10px] font-semibold text-slate-500">({myShares.toFixed(2)}%)</span>
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                            <p className="text-[9px] uppercase font-black text-slate-400">Liquid Equity Value</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {formatMoney(myEquityValue)}
                            </p>
                        </div>
                    </div>

                    {plans.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] uppercase font-black text-slate-500">Active Trading Plan</p>
                                <span className="text-[9px] font-bold text-slate-400">SEC Form 4 Filed</span>
                            </div>
                            {plans.map((p: any) => {
                                const soldPercent = (p.sharesSoldSoFar / Math.max(1, p.sharesToSellTotal)) * 100;
                                return (
                                    <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{p.planName || "SEC Rule 10b5-1 Plan"}</p>
                                                <p className="text-[9px] font-semibold text-slate-500 mt-0.5">
                                                    Rate: <span className="font-bold text-slate-700 dark:text-slate-300">{formatNumber(p.monthlySellAmount)} shrs/mo</span> (Estimated {formatMoney(p.monthlySellAmount * sharePrice)} / mo)
                                                </p>
                                            </div>
                                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
                                                {p.monthsRemaining} mos remaining
                                            </p>
                                        </div>

                                        <div className="space-y-1.5 my-3">
                                            <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                                <span>Progress: {formatNumber(p.sharesSoldSoFar)} / {formatNumber(p.sharesToSellTotal)} sold</span>
                                                <span>{soldPercent.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${p.isAggressive ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${soldPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCancelPlan(p.id)}
                                            className="w-full py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1"
                                        >
                                            <span>🚨</span> Terminate Schedule Prematurely
                                        </button>
                                        <p className="text-[8px] text-center text-slate-400 dark:text-slate-500 font-medium mt-1.5 leading-relaxed">
                                            ⚠️ Warning: Prematurely cancelling an SEC schedule raises immediate insider trading red flags. Triggers permanent <strong>Regulatory Warning</strong> status and drops Board Happiness by <strong>-15%</strong>.
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                                <p className="text-[10px] uppercase font-black text-slate-500">Select SEC-Approved Schedule Template</p>
                                <p className="text-[9px] font-bold text-slate-400">1 Plan Max</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {templates.map((t, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 rounded-lg p-3 transition-all duration-200 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1.5">
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{t.name}</p>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${t.badgeColor}`}>
                                                    {t.badge}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-slate-500 mt-1 leading-normal font-medium">{t.desc}</p>
                                        </div>

                                        <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 flex items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className="text-[8px] uppercase font-black text-slate-400">Total Shares</p>
                                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{formatNumber(t.sharesTotal)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] uppercase font-black text-slate-400">Monthly Rate</p>
                                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{formatNumber(t.monthly)} / mo</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] uppercase font-black text-slate-400">Duration</p>
                                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{t.months} mos</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCreatePlan(t)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] px-3 py-2 rounded-lg transition-all active:scale-95 shadow-md shadow-indigo-600/10 flex items-center gap-1"
                                            >
                                                Deploy <span>🚀</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (category === "board_mgmt") {
        const pub = startup.public_company;
        const handleStockSplit = () => {
            if (!pub) return;
            const newStartup = { ...startup };

            // Double shares
            newStartup.public_company.shares_outstanding *= 2;
            newStartup.public_company.float *= 2;

            // Halve prices
            newStartup.public_company.share_price /= 2;
            newStartup.public_company.ipo_price /= 2;
            newStartup.public_company.eps_last_quarter /= 2;
            newStartup.public_company.eps_guidance /= 2;
            newStartup.public_company.consensus_eps /= 2;

            setStartup(newStartup);

            // Adjust Founder 10b5-1 plans if they exist
            const newFounder = { ...founder };
            if (newFounder.wealth_profile?.active_10b51_plans) {
                newFounder.wealth_profile.active_10b51_plans = newFounder.wealth_profile.active_10b51_plans.map((p: any) => ({
                    ...p,
                    sharesToSellTotal: p.sharesToSellTotal * 2,
                    sharesSoldSoFar: p.sharesSoldSoFar * 2,
                    monthlySellAmount: p.monthlySellAmount * 2,
                    targetPriceMinimum: p.targetPriceMinimum / 2
                }));
            }
            if (setFounder) setFounder(newFounder);

            // Sync Ticker
            if (setMarketStocks && marketStocks) {
                setMarketStocks(marketStocks.map(s =>
                    s.symbol === (startup.symbol || "CORP")
                        ? { ...s, currentPrice: newStartup.public_company.share_price }
                        : s
                ));
            }

            addTimelineEvent(`✂️ Board authorized a 2-for-1 Stock Split! Share price halved to ${formatMoney(newStartup.public_company.share_price)}.`);
            toast.success("Stock Split Executed", { description: "Retail investors are piling in!" });
        };

        const getBoardResolutionCost = (label: string) => {
            const valuation = startup.valuation || 1000000;
            const baseCosts: Record<string, number> = {
                "Appoint Independent Director": 50000,
                "Executive Retreat": 25000,
                "Rebrand Company": 100000,
                "Adopt Poison Pill": 500000,
            };
            const base = baseCosts[label] || 10000;
            // Scale based on valuation: sqrt(val / 1M)
            const scale = Math.max(1, Math.sqrt(valuation / 1000000));
            return Math.floor(base * scale);
        };

        const handleBoardAction = (name: string) => {
            const cost = getBoardResolutionCost(name);
            if (m.cash < cost) {
                toast.error("Insufficient Corporate Cash");
                return;
            }

            const proposal = evaluateResolution(startup, founder, name, cost);
            setVotingMembers(getBoardMembers(startup));
            setLastProposalResult(proposal);
            setIsBoardModalOpen(true);

            if (proposal.status === "rejected") {
                toast.error(`The Board rejected the resolution: ${name}`);
                return;
            }

            const newStartup = { ...startup };
            newStartup.metrics.cash -= cost;

            if (name === "Appoint Independent Director") {
                newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 5);
                const newFounder = { ...founder };
                newFounder.attributes.reputation = Math.min(100, (newFounder.attributes.reputation || 0) + 5);
                if (setFounder) setFounder(newFounder);
            } else if (name === "Executive Retreat") {
                const newFounder = { ...founder };
                newFounder.attributes.burnout = 0;
                if (setFounder) setFounder(newFounder);
            } else if (name === "Rebrand Company") {
                newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 20);
            } else if (name === "Adopt Poison Pill") {
                if (newStartup.public_company) {
                    // Internal flag or logic for takeover defense
                    toast.success("Hostile takeover defense active.");
                }
            }

            if (setStartup) setStartup(newStartup);
            addTimelineEvent(`🪑 Board approved: ${name} (Cost: ${formatMoney(cost)})`);
            toast.success("Resolution Passed");
        };

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Board of Directors</h3>
                    <p className="text-[10px] text-slate-500 mb-4">Execute high-level corporate governance actions.</p>

                    <div className="space-y-3">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">✂️</div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">2-for-1 Stock Split</p>
                                        <p className="text-[9px] text-slate-500 mt-0.5">Halves share price, doubles share count. Boosts retail sentiment.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleStockSplit}
                                    disabled={!pub || pub.share_price < 50}
                                    className="shrink-0 ml-2 px-3 py-1.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded text-[10px] font-black uppercase hover:opacity-90 disabled:opacity-30 transition-all"
                                >
                                    {(!pub || pub.share_price < 50) ? "Req $50+" : "Execute"}
                                </button>
                            </div>
                        </div>

                        {[
                            { emoji: "🧑‍⚖️", label: "Appoint Independent Director", desc: "Brings oversight. (+5 CEO Rep, +5 Brand)", btn: "Appoint" },
                            { emoji: "🏝️", label: "Executive Retreat", desc: "Fully cures Founder Burnout. (0 Burnout)", btn: "Retreat" },
                            { emoji: "🎨", label: "Rebrand Company", desc: "Major marketing overhaul. (+20 Brand Awareness)", btn: "Rebrand" },
                            { emoji: "🛡️", label: "Adopt Poison Pill", desc: "Defends against hostile takeovers.", btn: "Adopt", locked: !pub },
                        ].map((opt, i) => {
                            const cost = getBoardResolutionCost(opt.label);
                            return (
                                <div key={i} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 ${opt.locked ? 'opacity-50 grayscale' : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{opt.emoji}</div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                                <p className="text-[9px] text-slate-500 mt-0.5">Costs {formatMoney(cost)}. {opt.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleBoardAction(opt.label)}
                                            disabled={m.cash < cost || opt.locked}
                                            className="shrink-0 ml-2 px-3 py-1.5 bg-amber-600 text-white rounded text-[10px] font-black uppercase hover:bg-amber-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                        >
                                            {opt.locked ? "Post-IPO" : opt.btn}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ── SECTOR & PHILANTHROPY (NEW MODULES) ──────────────────────────────────
    if (category === "philanthropy") {
        const founderWealth = founder.wealth_profile || { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
        const liquidCash = founder.personal_wealth || 0;

        const handleDonate = (amount: number, repGain: number, scoreGain: number, name: string) => {
            if (liquidCash < amount) {
                toast.error("Insufficient Funds", { description: "You don't have enough liquid personal wealth." });
                return;
            }
            const newFounder = { ...founder };
            if (!newFounder.wealth_profile) newFounder.wealth_profile = { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
            newFounder.personal_wealth -= amount;
            newFounder.wealth_profile.philanthropy_score += scoreGain;
            newFounder.attributes.reputation = Math.min(100, (newFounder.attributes.reputation || 0) + repGain);
            if (setFounder) setFounder(newFounder);

            const newStartup = { ...startup };
            newStartup.ceo_reputation = newFounder.attributes.reputation;
            if (setStartup) setStartup(newStartup);

            addTimelineEvent(`🕊️ Philanthropy: Donated ${formatMoney(amount)} to ${name}.`);
            toast.success("Donation Successful", { description: `Gained +${repGain} Reputation.` });
        };

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Philanthropy</h3>
                            <p className="text-[10px] text-slate-500">Donate personal wealth to boost your reputation.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Impact</p>
                            <p className="text-sm font-bold text-purple-600">{formatNumber(founderWealth.philanthropy_score)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { emoji: "🥫", label: "Community Food Drive", desc: "Donate $5,000 to local shelters. (+0 Rep, +500 Score)", btn: "Fund", cost: 5000, rep: 0, score: 500, name: "food drive" },
                            { emoji: "💻", label: "Open Source Foundation", desc: "Donate $100,000 to open source. (+2 Rep, +1000 Score)", btn: "Sponsor", cost: 100000, rep: 2, score: 1000, name: "open source" },
                            { emoji: "🏘️", label: "Local Charity Grant", desc: "Donate $500,000. (+1 Rep, +50 Score)", btn: "Donate", cost: 500000, rep: 1, score: 50, name: "local charity" },
                            { emoji: "🌍", label: "Global Climate Fund", desc: "Donate $1,000,000 to environment. (+5 Rep, +2000 Score)", btn: "Pledge", cost: 1000000, rep: 5, score: 2000, name: "climate fund" },
                            { emoji: "🎓", label: "Endow Scholarship", desc: "Donate $5,000,000. (+5 Rep, +500 Score)", btn: "Endow", cost: 5000000, rep: 5, score: 500, name: "scholarship" },
                            { emoji: "🏥", label: "Found a Hospital Wing", desc: "Donate $50,000,000. (+20 Rep, +5000 Score)", btn: "Found", cost: 50000000, rep: 20, score: 5000, name: "hospital wing" },
                            { emoji: "🚀", label: "Space Exploration Grant", desc: "Donate $500,000,000 for humanity. (+100 Rep, +50000 Score)", btn: "Launch", cost: 500000000, rep: 100, score: 50000, name: "space program" },
                        ].map((opt, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{opt.emoji}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDonate(opt.cost, opt.rep, opt.score, opt.name)}
                                        disabled={liquidCash < opt.cost}
                                        className="shrink-0 ml-2 px-3 py-1.5 bg-purple-600 text-white rounded text-[10px] font-black uppercase hover:bg-purple-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                    >
                                        {opt.btn}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── PR & COMMUNICATIONS ─────────────────────────────
    if (category === "analysts" || category === "pr_comms") {
        const handleAction = (costHours: number, baGain: number, name: string) => {
            if ((m.founder_burnout || 0) > 85) {
                toast.error("Too Burned Out", { description: "You don't have the energy right now." });
                return;
            }
            if (focusHoursUsed + costHours > maxHours) {
                toast.error("Insufficient Focus", { description: `You don't have ${costHours} focus hours available.` });
                return;
            }
            const newStartup = { ...startup };
            newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + baGain);
            setFocusHoursUsed(focusHoursUsed + costHours);

            if (setStartup) setStartup(newStartup);
            addTimelineEvent(`🎙️ ${name} (+${baGain} Brand Awareness).`);
            toast.success("Campaign Successful");
        };

        const handleViralStuntAd = () => {
            adService.showRewardedAd(() => {
                const newStartup = { ...startup };
                newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 5);
                newStartup.metrics.users = (newStartup.metrics.users || 0) + 500;
                
                if (setStartup) setStartup(newStartup);
                addTimelineEvent(`🔥 Viral Stunt (Ad) triggered! +5 Brand Awareness, +500 Users.`);
                toast.success("Going Viral!", { description: "Gained +5 Brand Awareness and +500 Users for free.", icon: "🔥" });
            });
        };


        return (
            <div className="flex flex-col gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">PR & Communications</h3>
                            <p className="text-[10px] text-slate-500">Spend focus hours to boost Brand Awareness.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Awareness</p>
                            <p className="text-sm font-bold text-indigo-600">{Math.round(m.brand_awareness || 0)}/100</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">Current Market Season</p>
                                <p className="text-[10px] font-bold text-indigo-500">{m.current_season || "Neutral Market"}</p>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1">Sector conditions dynamically affect investor sentiment and marketing yield.</p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { emoji: "📰", label: "Press Release", desc: "Write and distribute a press release.", btn: "Publish", cost: 5, gain: 1 },
                            { emoji: "📊", label: "Deep Sector Research", desc: "Analyze macro trends and publish a whitepaper.", btn: "Research", cost: 10, gain: 2 },
                            { emoji: "🎙️", label: "Podcast Interview", desc: "Go on a popular industry podcast.", btn: "Speak", cost: 15, gain: 4 },
                            { emoji: "📈", label: "Analyst Briefing", desc: "Brief Wall Street analysts on your trajectory.", btn: "Brief", cost: 20, gain: 5 },
                            { emoji: "🎪", label: "Industry Conference", desc: "Headline a major tech conference.", btn: "Headline", cost: 30, gain: 10 },
                            { emoji: "🔥", label: "Viral PR Stunt", desc: "Free brand awareness and user bump.", btn: "Watch Ad", cost: 0, gain: 5, isAd: true },
                        ].map((opt, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{opt.emoji}</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.label}</p>
                                            <p className="text-[9px] text-slate-500 mt-0.5">Costs {opt.cost} Focus. Gives +{opt.gain} Brand Awareness.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => opt.isAd ? handleViralStuntAd() : handleAction(opt.cost, opt.gain, opt.label)}
                                        disabled={!opt.isAd && ((m.founder_burnout || 0) > 85 || (focusHoursUsed + opt.cost > maxHours))}
                                        className={cn("shrink-0 ml-2 px-3 py-1.5 rounded text-[10px] font-black uppercase disabled:opacity-50 transition-all",
                                            opt.isAd ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300" : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700"
                                        )}
                                    >
                                        {opt.isAd && <span className="mr-1">▶</span>}
                                        {opt.btn}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (category === "fines") {
        const suits = startup.active_lawsuits || [];

        const handleSettle = (suitId: string, amount: number) => {
            if (m.cash < amount) {
                toast.error("Insufficient Funds", { description: "You don't have enough corporate cash to settle." });
                return;
            }
            setStartup((s: Startup) => ({
                ...s,
                metrics: { ...s.metrics, cash: s.metrics.cash - amount },
                active_lawsuits: s.active_lawsuits?.filter((l: Lawsuit) => l.id !== suitId)
            }));
            addTimelineEvent(`⚖️ Legal: Settled lawsuit for ${formatMoney(amount)}.`);
            toast.success("Case Settled");
        };

        const handleProBonoCounsel = (suitId: string) => {
            adService.showRewardedAd(() => {
                setStartup((s: Startup) => {
                    if (!s.active_lawsuits) return s;
                    return {
                        ...s,
                        active_lawsuits: s.active_lawsuits.map(l => {
                            if (l.id === suitId) {
                                return {
                                    ...l,
                                    demand_amount: Math.floor(l.demand_amount * 0.8),
                                    settlement_offer: l.settlement_offer ? Math.floor(l.settlement_offer * 0.8) : undefined,
                                    win_probability: Math.min(1.0, l.win_probability + 0.15)
                                };
                            }
                            return l;
                        })
                    };
                });
                toast.success("Pro Bono Counsel Secured!", { description: "Settlement demand reduced by 20% and trial win probability increased by 15%.", icon: "💼" });
            });
        };

        return (
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Legal & Compliance</h3>
                    <p className="text-[10px] text-slate-500">Manage ongoing litigation and regulatory risk.</p>
                </div>

                {suits.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-2">🛡️</span>
                        <h3 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-widest">No Active Lawsuits</h3>
                        <p className="text-[10px] text-rose-700 dark:text-rose-400 mt-1 max-w-xs">Your company currently has no pending regulatory fines or class-action lawsuits.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {suits.map((suit: Lawsuit) => (
                            <div key={suit.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 text-xs opacity-20 group-hover:opacity-100 transition-opacity">
                                    ⚖️
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">{suit.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{suit.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Demand</p>
                                        <p className="text-xs font-bold text-rose-600">{formatMoney(suit.demand_amount)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trial In</p>
                                        <p className="text-xs font-bold text-indigo-600">{suit.months_to_trial} Months</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSettle(suit.id, suit.settlement_offer || suit.demand_amount)}
                                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
                                        >
                                            Settle for {formatMoney(suit.settlement_offer || suit.demand_amount)}
                                        </button>
                                        <div className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase text-center border border-slate-200 dark:border-slate-600">
                                            Fighting in Court
                                            <p className="text-[7px] lowercase font-medium opacity-70">-{formatMoney(suit.legal_fees_per_month)}/mo fees</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleProBonoCounsel(suit.id)}
                                        className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <span className="text-xs">💼</span> Pro Bono Counsel (Ad)
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── M&A ACQUIRE (pre-IPO & post-IPO) ─────────────────────────────────────
    if (category === "manda_acquire") {
        const canAcquire = true;
        return (
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-950 border border-blue-800 flex flex-col gap-1">
                    <h3 className="text-xs font-black text-blue-200 uppercase tracking-widest">🦈 M&A Strategy</h3>
                    <p className="text-[10px] text-blue-400">Acquire active market assets to scale your corporate treasury and operations.</p>
                </div>
                <div className="space-y-3">
                    {(!mnaTargets || mnaTargets.length === 0) ? (
                        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <span className="text-3xl mb-2 block">📡</span>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">Scan Market</h3>
                            <p className="text-[10px] text-slate-500 mb-4 mt-2">Find potential acquisition targets scaled to your current valuation.</p>
                            <button
                                onClick={() => setMnaTargets?.(generateMnATargets(startup.valuation))}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                            >
                                Scan Market for Targets
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => setMnaTargets?.(generateMnATargets(startup.valuation))}
                                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    ⟳ Rescan Market
                                </button>
                            </div>
                            {mnaTargets.map((t, i) => {
                                const ddCost = Math.min(5000000, Math.max(50000, Math.floor(t.ask * 0.02))); // Max 5M, Min 50k
                                return (
                                    <div key={t.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">{t.emoji}</div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">{t.name}</p>
                                                    <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t.sector} · {t.rationale}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {startup.iap_titan && <p className="text-[9px] font-black text-amber-500 uppercase">Titan -50% Off</p>}
                                                <p className="text-xs font-black text-emerald-600">{formatMoney(startup.iap_titan ? t.ask * 0.5 : t.ask)}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">{t.desc}</p>

                                        {t.is_diligent && (
                                            <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-2">
                                                <p className="text-[9px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">Due Diligence Report</p>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-500">True Value:</span>
                                                    <span className={`font-bold ${t.true_value > t.ask ? 'text-emerald-500' : 'text-rose-500'}`}>{formatMoney(t.true_value)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-500">Financial Health:</span>
                                                    <span className={`font-bold ${t.financial_health === 'Burning Cash' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {t.financial_health} {t.inherited_burn > 0 && `(-${formatMoney(t.inherited_burn)}/mo)`}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-500">Integration Risk:</span>
                                                    <span className={`font-bold ${t.integration_risk === 'High' ? 'text-rose-500' : t.integration_risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{t.integration_risk}</span>
                                                </div>
                                                <p className="text-[8px] font-medium text-slate-400 italic mt-1 leading-normal">
                                                    {t.integration_risk === "High" ? "⚠️ Fragmented tech stack, flight risk of core team. Est. -20 Team Morale impact on merge." :
                                                        t.integration_risk === "Medium" ? "⚠️ Moderate culture clash, redundant roles to consolidate. Est. -10 Team Morale." :
                                                            "✅ Clean codebase, shared tech stack. Est. +5 Team Morale boost."}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            {!t.is_diligent && (
                                                <button
                                                    onClick={() => {
                                                        if (m.cash < ddCost) { toast.error("Insufficient cash for Due Diligence."); return; }
                                                        const ns = { ...startup };
                                                        ns.metrics.cash -= ddCost;
                                                        setStartup(ns);
                                                        const newTargets = mnaTargets.map(target => target.id === t.id ? { ...target, is_diligent: true } : target);
                                                        setMnaTargets?.(newTargets);
                                                        toast.success(`Due Diligence Completed`, { description: `Revealed hidden metrics for ${t.name}.` });
                                                    }}
                                                    disabled={m.cash < ddCost}
                                                    className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-40 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase transition-all"
                                                >
                                                    Due Diligence ({formatMoney(ddCost)})
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const finalAsk = startup.iap_titan ? t.ask * 0.5 : t.ask;
                                                    if (m.cash < finalAsk) { toast.error("Insufficient cash for this acquisition."); return; }
                                                    const ns: any = { ...startup };
                                                    ns.metrics.cash -= finalAsk;
                                                    ns.metrics.users = (ns.metrics.users || 0) + t.users;
                                                    ns.valuation = Math.floor(ns.valuation + t.true_value);

                                                    // Apply integration risk effects on morale
                                                    if (t.integration_risk === "High") {
                                                        ns.metrics.team_morale = Math.max(0, ns.metrics.team_morale - 20);
                                                    } else if (t.integration_risk === "Medium") {
                                                        ns.metrics.team_morale = Math.max(0, ns.metrics.team_morale - 10);
                                                    } else {
                                                        ns.metrics.team_morale = Math.min(100, ns.metrics.team_morale + 5);
                                                    }

                                                    // Save acquired target as a subsidiary
                                                    if (!ns.subsidiaries) ns.subsidiaries = [];

                                                    const synergy = t.financial_health === "Profitable"
                                                        ? Math.floor(t.true_value * 0.005)
                                                        : t.financial_health === "Burning Cash" ? -t.inherited_burn : 0;
                                                    const subStr = `${t.name}::${t.true_value}::${synergy}::${t.integration_risk}`;
                                                    ns.subsidiaries.push(subStr);

                                                    setStartup(ns);

                                                    // Remove acquired target
                                                    setMnaTargets?.(mnaTargets.filter(target => target.id !== t.id));

                                                    addTimelineEvent(`🦈 Acquired ${t.name} for ${formatMoney(t.ask)}. Synergy: ${synergy >= 0 ? '+' : ''}${formatMoney(synergy)}/mo. Morale shift: ${t.integration_risk === "High" ? '-20' : t.integration_risk === "Medium" ? '-10' : '+5'}.`);
                                                    toast.success(`Acquisition Complete`, { description: `${t.name} is now a subsidiary.` });
                                                }}
                                                disabled={m.cash < t.ask}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                Acquire · {formatMoney(t.ask)}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ── CORPORATE DEBT ─────────────────────────────────────────────────────────
    if (category === "corporate_debt") {
        const fundingStageOrder = ["Bootstrapping", "Angel Investment", "Seed Round", "Series A", "Series B", "Series C", "IPO Ready"];
        const currentStageIdx = fundingStageOrder.indexOf(startup.funding_stage);
        const canTakeDebt = true; // Series A+ (unlocked by request)
        const activeDebts: any[] = (startup as any).private_debt || [];
        const totalDebtMonthly = activeDebts.reduce((s: number, d: any) => s + d.monthly_payment, 0);

        const debtProducts = [
            { name: "Venture Debt", emoji: "🏦", provider: "Silicon Valley Bank", term: 24, amount: Math.floor(startup.valuation * 0.05), rate: 8.5, desc: "Non-dilutive financing tied to ARR. Common for Series A+." },
            { name: "Revenue-Based Loan", emoji: "📊", provider: "Clearco Capital", term: 18, amount: Math.floor(startup.metrics.revenue * 6), rate: 12.0, desc: "Repay as % of monthly revenue. Ideal for high-growth SaaS." },
            { name: "Bridge Loan", emoji: "⛓️", provider: "Brex Financial", term: 12, amount: Math.floor(startup.valuation * 0.02), rate: 15.0, desc: "Short-term bridge to your next funding round. Quick approval." },
        ];
        return (
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-950 border border-rose-800 flex flex-col gap-1">
                    <h3 className="text-xs font-black text-rose-200 uppercase tracking-widest">🏦 Corporate Debt</h3>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-rose-400">{canTakeDebt ? `Active Debt Obligations: ${formatMoney(totalDebtMonthly)}/mo` : "Reach Series A to access corporate debt instruments."}</p>
                        <div className="flex items-center gap-1.5 bg-rose-900/50 px-2 py-0.5 rounded text-[10px] border border-rose-800/50">
                            <span className="text-rose-300 font-medium">Credit Score</span>
                            <span className="font-black text-white">{startup.metrics.credit_score || 700}</span>
                        </div>
                    </div>
                </div>
                {!canTakeDebt ? (
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-2">🔒</span>
                        <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Requires Series A</h3>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Close your Series A round to access venture debt and non-dilutive financing instruments.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeDebts.length > 0 && (
                            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-widest mb-2">Active Obligations</p>
                                {activeDebts.map((d: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-1.5 border-t border-rose-100 dark:border-rose-900 first:border-0">
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{d.name}</span>
                                        <span className="text-[10px] font-black text-rose-600">{formatMoney(d.monthly_payment)}/mo · {d.months_left}mo left</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {debtProducts.map((dp, i) => {
                            const minScoreRequired = dp.name === "Venture Debt" ? 720 : dp.name === "Revenue-Based Loan" ? 650 : 600;
                            const currentScore = startup.metrics.credit_score || 700;
                            const isScoreLocked = currentScore < minScoreRequired;

                            return (
                                <div key={i} className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 ${isScoreLocked ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{dp.emoji}</span>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{dp.name}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{dp.provider} · {dp.rate}% APR · {dp.term}mo</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-600">{formatMoney(dp.amount)}</p>
                                            {isScoreLocked && <p className="text-[8px] font-black text-rose-500 uppercase">Requires {minScoreRequired} Score</p>}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">{dp.desc}</p>
                                    <button
                                        onClick={() => {
                                            if (isScoreLocked) { toast.error("Credit Score Too Low", { description: `You need a score of ${minScoreRequired} to access this.` }); return; }
                                            const monthly = Math.floor((dp.amount * (1 + dp.rate / 100)) / dp.term);
                                            const ns: any = { ...startup };
                                            ns.metrics.cash += dp.amount;
                                            if (!ns.private_debt) ns.private_debt = [];
                                            ns.private_debt.push({ name: dp.name, monthly_payment: monthly, months_left: dp.term, principal: dp.amount });
                                            setStartup(ns);
                                            addTimelineEvent(`🏦 Debt Taken: ${dp.name} — ${formatMoney(dp.amount)} at ${dp.rate}% APR. Monthly obligation: ${formatMoney(monthly)}.`);
                                            toast.success(`Debt Approved`, { description: `${formatMoney(dp.amount)} deposited. ${formatMoney(monthly)}/mo repayment.` });
                                        }}
                                        disabled={isScoreLocked}
                                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                        {isScoreLocked ? "Locked" : `Draw ${formatMoney(dp.amount)} @ ${dp.rate}% APR`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (category === "options") {
        const vestingOptions = founder.wealth_profile?.vesting_options || [];
        const optionPool = startup.metrics.option_pool || 0;
        const boardHappiness = startup.metrics.board_happiness || 80;
        const myShares = startup.capTable?.find((e: any) => e.type === "Founder")?.equity || 20;
        const totalShares = startup.public_company?.shares_outstanding || 100_000_000;
        const myShareCount = (myShares / 100) * totalShares;
        const sharePrice = startup.public_company?.share_price || 1.00;
        const personalCash = founder.personal_wealth || 0;

        const handleRefillESOP = (amount: number) => {
            const newStartup = { ...startup };
            const factor = 1 - (amount / 100);
            newStartup.capTable = (newStartup.capTable || []).map((e: any) => ({
                ...e,
                equity: e.equity * factor
            }));

            if (newStartup.public_company) {
                const extraShares = Math.floor(newStartup.public_company.shares_outstanding * (amount / 100));
                newStartup.public_company.shares_outstanding += extraShares;
                newStartup.public_company.float += extraShares;
            }

            newStartup.metrics.option_pool = (newStartup.metrics.option_pool || 0) + amount;
            newStartup.metrics.board_happiness = Math.min(100, (newStartup.metrics.board_happiness || 80) + 5);
            setStartup(newStartup);
            addTimelineEvent(`🎲 ESOP Pool: Expanded employee option pool by ${amount}%. All shareholders diluted.`);
            toast.success("ESOP Expanded", { description: `Added ${amount}% to available pool.` });
        };

        const handleRequestOptionGrant = (name: string, sizePct: number, strike: number, months: number, reqBoard: number, reqBeats?: number) => {
            if (boardHappiness < reqBoard) {
                toast.error("Board Approval Required", { description: `Your Board Happiness must be at least ${reqBoard}% to approve this package.` });
                return;
            }
            if (reqBeats && (startup.public_company?.quarterly_beats || 0) < reqBeats) {
                toast.error("Wall Street Momentum Required", { description: `You need at least ${reqBeats} consecutive positive quarterly beats to request this.` });
                return;
            }
            if (optionPool < sizePct) {
                toast.error("Insufficient Option Pool", { description: `You need at least ${sizePct}% available in your employee stock option pool.` });
                return;
            }

            const totalOptionsCount = Math.floor(totalShares * (sizePct / 100));
            const newOption: import("@/lib/types/database.types").ExecutiveOption = {
                id: `opt_${Date.now()}`,
                grantName: name,
                totalOptions: totalOptionsCount,
                strikePrice: strike,
                vestedOptions: 0,
                monthsRemaining: months,
                monthlyVestAmount: Math.floor(totalOptionsCount / months),
            };

            const newFounder = { ...founder };
            if (!newFounder.wealth_profile) newFounder.wealth_profile = { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
            if (!newFounder.wealth_profile.vesting_options) newFounder.wealth_profile.vesting_options = [];
            newFounder.wealth_profile.vesting_options.push(newOption);
            if (setFounder) setFounder(newFounder);

            const newStartup = { ...startup };
            newStartup.metrics.option_pool = Math.max(0, (newStartup.metrics.option_pool || 0) - sizePct);
            setStartup(newStartup);

            addTimelineEvent(`🎲 Stock Options: Granted executive option plan "${name}" for ${formatNumber(totalOptionsCount)} shares.`);
            toast.success("Option Grant Approved", { description: `Your incentive package is active and vesting.` });
        };

        const handleExerciseOptions = (optId: string, amount: number, strike: number) => {
            const cost = amount * strike;
            if (personalCash < cost) {
                toast.error("Insufficient Personal Cash", { description: `You need ${formatMoney(cost)} of personal cash to exercise these options.` });
                return;
            }

            const newFounder = { ...founder };
            newFounder.personal_wealth = (newFounder.personal_wealth || 0) - cost;
            if (newFounder.wealth_profile?.vesting_options) {
                newFounder.wealth_profile.vesting_options = newFounder.wealth_profile.vesting_options.map((o: any) => {
                    if (o.id === optId) {
                        return { ...o, vestedOptions: Math.max(0, o.vestedOptions - amount), totalOptions: Math.max(0, o.totalOptions - amount) };
                    }
                    return o;
                }).filter((o: any) => o.totalOptions > 0);
            }
            if (setFounder) setFounder(newFounder);

            const newStartup = { ...startup };
            const pub = newStartup.public_company;
            if (pub) {
                const oldSharesOutstanding = pub.shares_outstanding;
                const newSharesOutstanding = oldSharesOutstanding + amount;
                pub.shares_outstanding = newSharesOutstanding;

                const founderIndex = newStartup.capTable.findIndex((e: any) => e.type === "Founder");
                if (founderIndex >= 0) {
                    const oldFounderShares = (newStartup.capTable[founderIndex].equity / 100) * oldSharesOutstanding;
                    const newFounderShares = oldFounderShares + amount;
                    newStartup.capTable[founderIndex].equity = (newFounderShares / newSharesOutstanding) * 100;
                }

                newStartup.capTable.forEach((node: any, idx: number) => {
                    if (idx !== founderIndex) {
                        const oldNodeShares = (node.equity / 100) * oldSharesOutstanding;
                        node.equity = (oldNodeShares / newSharesOutstanding) * 100;
                    }
                });
            }
            setStartup(newStartup);
            addTimelineEvent(`🎲 Stock Options: Exercised ${formatNumber(amount)} stock options at a strike of ${formatMoney(strike)} (Cost: ${formatMoney(cost)}).`);
            toast.success("Options Exercised", { description: `Converted ${formatNumber(amount)} options into common shares.` });
        };

        const handleCashlessExercise = (optId: string, amount: number, strike: number) => {
            if (sharePrice <= strike) {
                toast.error("Options are Underwater", { description: "You cannot cashless exercise options when the strike price is above the market price." });
                return;
            }

            const netSharesCount = Math.floor(amount * (sharePrice - strike) / sharePrice);
            if (netSharesCount <= 0) {
                toast.error("Vested amount too small for cashless exercise.");
                return;
            }

            const newFounder = { ...founder };
            if (newFounder.wealth_profile?.vesting_options) {
                newFounder.wealth_profile.vesting_options = newFounder.wealth_profile.vesting_options.map((o: any) => {
                    if (o.id === optId) {
                        return { ...o, vestedOptions: Math.max(0, o.vestedOptions - amount), totalOptions: Math.max(0, o.totalOptions - amount) };
                    }
                    return o;
                }).filter((o: any) => o.totalOptions > 0);
            }
            if (setFounder) setFounder(newFounder);

            const newStartup = { ...startup };
            const pub = newStartup.public_company;
            if (pub) {
                const oldSharesOutstanding = pub.shares_outstanding;
                const newSharesOutstanding = oldSharesOutstanding + netSharesCount;
                pub.shares_outstanding = newSharesOutstanding;

                const founderIndex = newStartup.capTable.findIndex((e: any) => e.type === "Founder");
                if (founderIndex >= 0) {
                    const oldFounderShares = (newStartup.capTable[founderIndex].equity / 100) * oldSharesOutstanding;
                    const newFounderShares = oldFounderShares + netSharesCount;
                    newStartup.capTable[founderIndex].equity = (newFounderShares / newSharesOutstanding) * 100;
                }

                newStartup.capTable.forEach((node: any, idx: number) => {
                    if (idx !== founderIndex) {
                        const oldNodeShares = (node.equity / 100) * oldSharesOutstanding;
                        node.equity = (oldNodeShares / newSharesOutstanding) * 100;
                    }
                });
            }
            setStartup(newStartup);
            addTimelineEvent(`🎲 Stock Options: Executed cashless exercise on ${formatNumber(amount)} options, receiving ${formatNumber(netSharesCount)} net shares.`);
            toast.success("Cashless Exercise Successful", { description: `Received ${formatNumber(netSharesCount)} shares at zero cash outlay.` });
        };

        return (
            <div className="flex flex-col gap-4 min-h-[82vh] justify-between">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex-1 flex flex-col justify-between gap-4 shadow-lg">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span>🎲</span> Stock Options & Compensation
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Manage executive incentive packages and employee option pools.</p>
                            </div>
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 animate-pulse">
                                ESOP Pool: {optionPool.toFixed(1)}% Available
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-center shadow-xs">
                                <p className="text-[8px] uppercase font-black text-slate-400">Board Approval</p>
                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{boardHappiness}%</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-center shadow-xs">
                                <p className="text-[8px] uppercase font-black text-slate-400">Current Strike</p>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">{formatMoney(sharePrice)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-center shadow-xs">
                                <p className="text-[8px] uppercase font-black text-slate-400">Personal Cash</p>
                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatMoney(personalCash)}</p>
                            </div>
                        </div>

                        {/* ESOP Expand */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-4 shadow-sm">
                            <p className="text-[10px] uppercase font-black text-slate-500 mb-1">Refill Employee Option Pool</p>
                            <p className="text-[8px] text-slate-400 mb-3 leading-normal font-medium">Refilling the pool increases talent acquisition quality but dilutes all current shareholders equally.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRefillESOP(5)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black uppercase text-[9px] py-2 rounded-lg transition-all active:scale-95 shadow-sm"
                                >
                                    Refill +5%
                                </button>
                                <button
                                    onClick={() => handleRefillESOP(10)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black uppercase text-[9px] py-2 rounded-lg transition-all active:scale-95 shadow-sm"
                                >
                                    Refill +10%
                                </button>
                            </div>
                        </div>

                        {/* Vesting Executive Grants */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase font-black text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">Your Executive Option Grants</p>
                            {vestingOptions.length === 0 ? (
                                <div className="py-6 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4">
                                    <p className="text-[9px] text-slate-400 italic text-center font-medium">No active executive option grants. Request a compensatory plan from the Board below.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {vestingOptions.map((o: any) => {
                                        const canExercise = o.vestedOptions > 0;
                                        const cashCost = o.vestedOptions * o.strikePrice;
                                        const profitPerOption = Math.max(0, sharePrice - o.strikePrice);
                                        const totalProfit = o.vestedOptions * profitPerOption;

                                        return (
                                            <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{o.grantName}</p>
                                                        <p className="text-[8px] font-bold text-slate-400">Strike Price: {formatMoney(o.strikePrice)} · Vested: {formatNumber(o.vestedOptions)} shares</p>
                                                    </div>
                                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                                                        {o.monthsRemaining > 0 ? `${o.monthsRemaining} mos vest` : "Fully Vested"}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                    <button
                                                        onClick={() => handleExerciseOptions(o.id, o.vestedOptions, o.strikePrice)}
                                                        disabled={!canExercise || personalCash < cashCost}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-black uppercase text-[9px] py-1.5 rounded-md transition-all flex flex-col items-center justify-center animate-all"
                                                    >
                                                        <span>Exercise with Cash</span>
                                                        <span className="text-[7px] font-semibold opacity-85">Cost: {formatMoney(cashCost)}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCashlessExercise(o.id, o.vestedOptions, o.strikePrice)}
                                                        disabled={!canExercise || sharePrice <= o.strikePrice}
                                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-black uppercase text-[9px] py-1.5 rounded-md transition-all flex flex-col items-center justify-center animate-all"
                                                    >
                                                        <span>Cashless Exercise</span>
                                                        <span className="text-[7px] font-semibold opacity-85">Net Value: +{formatMoney(totalProfit)}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Request Grants */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                <p className="text-[10px] uppercase font-black text-slate-500 mb-2">Request Board Compensatory Packages</p>
                                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                    {[
                                        { name: "Annual Performance Package", pct: 0.5, strike: sharePrice, duration: 12, req: 60, desc: "0.5% option grant vesting over 12 months." },
                                        { name: "Executive Retention Plan", pct: 1.5, strike: sharePrice, duration: 12, req: 75, desc: "1.5% option grant vesting over 12 months." },
                                        { name: "Elon-Style Megapackage", pct: 3.0, strike: sharePrice * 1.10, duration: 24, req: 85, desc: "3.0% options at a 10% premium strike vesting over 24 months." },
                                        { name: "Sovereign Strategic Milestone Grant", pct: 5.0, strike: sharePrice * 1.15, duration: 36, req: 90, reqBeats: 2, desc: "5.0% option package requiring 90% Board happiness and 2 consecutive quarterly beats. Vests over 36 months." },
                                    ].map((g, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-xs flex justify-between items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{g.name}</p>
                                                    <span className="text-[7px] font-black px-1.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                                                        Req: {g.req}% Board {g.reqBeats ? `& ${g.reqBeats} Beats` : ""}
                                                    </span>
                                                </div>
                                                <p className="text-[8px] text-slate-400 font-medium leading-normal mt-0.5">{g.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRequestOptionGrant(g.name, g.pct, g.strike, g.duration, g.req, g.reqBeats)}
                                                disabled={optionPool < g.pct || boardHappiness < g.req || (g.reqBeats ? (startup.public_company?.quarterly_beats || 0) < g.reqBeats : false)}
                                                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-black uppercase text-[8px] px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
                                            >
                                                Request
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEC Options Activity Ledger */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] uppercase font-black text-slate-500">SEC Options Activity Ledger</p>
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Form 4 Compliant</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 space-y-2 max-h-[110px] overflow-y-auto shadow-inner">
                            {vestingOptions.map((o: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-[8px] border-b border-slate-100 dark:border-slate-800/50 pb-1.5 last:border-b-0 last:pb-0">
                                    <div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Grant Approved: {o.grantName}</span>
                                        <p className="text-slate-400 font-medium">{formatNumber(o.totalOptions)} options @ {formatMoney(o.strikePrice)} strike</p>
                                    </div>
                                    <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">Vesting</span>
                                </div>
                            ))}
                            <div className="text-[7px] uppercase font-bold text-slate-400 dark:text-slate-500 pt-1 border-t border-dashed border-slate-100 dark:border-slate-800/60 pb-1">
                                Baseline ESOP Setup
                            </div>
                            <div className="flex justify-between items-center text-[8px] border-b border-slate-100 dark:border-slate-800/50 pb-1.5 last:border-b-0 last:pb-0">
                                <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">ESOP Refill Authorization</span>
                                    <p className="text-slate-400 font-medium">Board of Directors approved ESOP pool adjustments</p>
                                </div>
                                <span className="text-slate-500 font-bold bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Authorized</span>
                            </div>
                            <div className="flex justify-between items-center text-[8px]">
                                <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Form 4 Compensation Filing</span>
                                    <p className="text-slate-400 font-medium">Automatic SEC registration for executive derivatives</p>
                                </div>
                                <span className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (category === "subsidiary") {
        const subs = startup.subsidiaries || startup.public_company?.subsidiaries || [];
        const corporateCash = startup.metrics.cash || 0;
        const brandAwareness = startup.metrics.brand_awareness || 0;

        const handleSpinOffInternal = (name: string, cost: number, desc: string, benefits: { rd?: number; burnRate?: number; brand?: number; margin?: number }) => {
            if (corporateCash < cost) {
                toast.error("Insufficient Corporate Cash", { description: `You need at least ${formatMoney(cost)} in your corporate treasury to spin off this division.` });
                return;
            }

            const newStartup = { ...startup };
            newStartup.metrics.cash = (newStartup.metrics.cash || 0) - cost;
            if (!newStartup.subsidiaries) newStartup.subsidiaries = [];

            // Reorganize spin-off into dynamic packed subsidiary serialization!
            let synergy = 120000;
            let valuation = 45000000;
            if (name.includes("Axiom")) { synergy = 180000; valuation = 45000000; }
            else if (name.includes("Nova")) { synergy = 90000; valuation = 30000000; }
            else if (name.includes("Sovereign")) { synergy = 280000; valuation = 80000000; }
            else if (name.includes("Quantum")) { synergy = 350000; valuation = 100000000; }

            const subStr = `${name}::${valuation}::${synergy}::Low`;
            newStartup.subsidiaries.push(subStr);

            if (benefits.brand) {
                newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + benefits.brand);
            }
            if (benefits.burnRate) {
                newStartup.metrics.burn_rate = Math.max(1000, Math.floor((newStartup.metrics.burn_rate || 10000) * (1 - benefits.burnRate)));
            }
            if (benefits.margin) {
                newStartup.metrics.net_profit = (newStartup.metrics.net_profit || 0) + Math.floor(cost * 0.01);
            }
            if (benefits.rd) {
                newStartup.metrics.product_quality = Math.min(100, (newStartup.metrics.product_quality || 0) + 15);
            }

            setStartup(newStartup);
            addTimelineEvent(`🏢 Corporate Oversight: Spun off internal division into subsidiary "${name}" (Treasury Cost: ${formatMoney(cost)}).`);
            toast.success("Subsidiary Spun Off", { description: `"${name}" is now an active subsidiary.` });
        };

        const handleInjectCapital = (rawName: string) => {
            const cost = 10000000;
            if (corporateCash < cost) {
                toast.error("Insufficient Treasury Cash", { description: "Injecting capital requires $10,000,000 corporate cash." });
                return;
            }

            const newStartup = { ...startup };
            newStartup.metrics.cash -= cost;

            const parsed = parseSubsidiary(rawName);
            let updatedRevenue = parsed.revenue;
            let updatedExpenses = parsed.expenses;
            let note = "";

            if (parsed.netIncome < 0) {
                // Restructured from Burning to Profitable — cut expenses by 40%
                updatedExpenses = Math.floor(parsed.expenses * 0.6);
                const newNet = updatedRevenue - updatedExpenses;
                note = `Restructured ${parsed.name} operational efficiencies! Expenses cut by 40%. Now contributing +${formatMoney(newNet)}/mo net income.`;
            } else {
                // Already profitable — capital injection boosts revenue
                updatedRevenue += Math.floor(cost * 0.012);
                note = `Injected $10M capital into ${parsed.name}. Monthly revenue expanded by +${formatMoney(Math.floor(cost * 0.012))}/mo!`;
            }

            const newSubStr = serializeSubsidiary({ ...parsed, valuation: parsed.valuation + cost, revenue: updatedRevenue, expenses: updatedExpenses });
            newStartup.subsidiaries = subs.map((s: string) => s === rawName ? newSubStr : s);

            newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 6);
            setStartup(newStartup);

            addTimelineEvent(`🏢 Capital Injection: ${note}`, month);
            toast.success("Synergies Expanded", { description: note });
        };

        const handleRebrandSubsidiary = (rawName: string) => {
            const cost = 5000000;
            if (corporateCash < cost) {
                toast.error("Insufficient Treasury Cash", { description: "Relaunching requires $5,000,000 corporate cash." });
                return;
            }

            const newStartup = { ...startup };
            newStartup.metrics.cash -= cost;

            const parsed = parseSubsidiary(rawName);
            // Increase its asset value by $5M due to marketing goodwill pop
            // Rebranding also boosts revenue ~8% (brand premium effect)
            const newSubStr = serializeSubsidiary({ ...parsed, valuation: parsed.valuation + cost, revenue: Math.floor(parsed.revenue * 1.08) });
            newStartup.subsidiaries = subs.map((s: string) => s === rawName ? newSubStr : s);

            newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 0) + 10);
            setStartup(newStartup);

            addTimelineEvent(`🏢 Subsidiary Rebrand: Sponsored global marketing relaunch of ${parsed.name}. Brand Awareness increased.`, month);
            toast.success("Marketing Relaunch Complete", { description: `Parent brand awareness jumped +10%.` });
        };

        const handleDivestSubsidiary = (rawName: string, payout: number) => {
            const parsed = parseSubsidiary(rawName);
            const newStartup = { ...startup };
            newStartup.metrics.cash = (newStartup.metrics.cash || 0) + payout;
            newStartup.subsidiaries = subs.filter((s: string) => s !== rawName);
            setStartup(newStartup);

            addTimelineEvent(`🏢 Corporate Divestiture: Sold subsidiary "${parsed.name}" to private equity for ${formatMoney(payout)} cash!`, month);
            toast.success("Subsidiary Divested", { description: `Received ${formatMoney(payout)} in non-dilutive corporate cash!` });
        };

        const handleListSubsidiary = (rawName: string) => {
            try {
                const parsed = parseSubsidiary(rawName);
                const fee = 2000000;
                const corporateCash = startup.metrics.cash || 0;
                if (corporateCash < fee) {
                    toast.error("Insufficient Treasury Cash", { description: `Listing ${parsed.name} requires $2,000,000 in IPO fees.` });
                    return;
                }

                // IPO Requirements Validation for Subsidiary
                const hasCFO = !!(startup as any).cxoTeam?.["CFO"];
                if (!hasCFO) {
                    toast.error("CFO Required for IPO", { description: "You must hire a CFO before underwriting a subsidiary stock market listing." });
                    return;
                }

                const subARR = parsed.valuation * 0.15;
                if (subARR < 50000000) {
                    toast.error("IPO Requirements Not Met", { description: `${parsed.name} must have at least $50,000,000 ARR to qualify (currently ${formatMoney(subARR)}).` });
                    return;
                }

                const subUsers = Math.floor(parsed.valuation / 200);
                if (subUsers < 10000) {
                    toast.error("IPO Requirements Not Met", { description: `${parsed.name} must have at least 10,000 users to qualify (currently ${subUsers.toLocaleString()}).` });
                    return;
                }

                const existingTickers = (marketStocks || []).map(s => s.symbol);
                const newStock = createSubsidiaryStock(
                    parsed.name,
                    parsed.valuation,
                    existingTickers,
                    startup.name || "Parent Corp"
                );

                const newStartup = { ...startup };
                newStartup.metrics.cash -= fee;
                // Keep the subsidiary in subsidiaries on IPO so it remains under management
                // newStartup.subsidiaries = (newStartup.subsidiaries || []).filter((s: any) => s !== rawName);

                // Parent company retains 80% stake (16,000,000 shares)
                const isPublic = !!startup.public_company;
                if (!isPublic) {
                    const port = newStartup.treasury_portfolio || [];
                    newStartup.treasury_portfolio = [
                        ...port,
                        { symbol: newStock.symbol, shares: 16000000, averageCost: newStock.currentPrice }
                    ];
                } else if (newStartup.public_company) {
                    const port = newStartup.public_company.corporate_portfolio || [];
                    newStartup.public_company.corporate_portfolio = [
                        ...port,
                        { symbol: newStock.symbol, shares: 16000000, averageCost: newStock.currentPrice }
                    ];
                }

                const updatedStocks = [...(marketStocks || []), newStock];
                if (setMarketStocks) setMarketStocks(updatedStocks);
                setStartup(newStartup);

                addTimelineEvent(`🏢 Subsidiary IPO: Carved out division "${parsed.name}" and listed it on the public market as ${newStock.symbol} at $${newStock.currentPrice.toFixed(2)}/share (IPO Fee: $2,000,000). Parent Corp retains 80% stake.`);
                toast.success("Subsidiary Listed!", { description: `"${parsed.name}" is now trading publicly under symbol ${newStock.symbol}.` });
            } catch (e: any) {
                toast.error(e.message || "IPO failed");
            }
        };

        return (
            <div className="flex flex-col gap-4 min-h-[82vh] justify-between">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex-1 flex flex-col justify-between gap-4 shadow-lg">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span>🏢</span> Subsidiary Oversight &amp; Divestiture
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Nurture and manage corporate subdivisions or execute lucrative trade sales.</p>
                            </div>
                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                                Treasury: {formatMoney(corporateCash)}
                            </span>
                        </div>

                        {/* Subsidiary Performance Metrics Card */}
                        <div className="grid grid-cols-2 gap-2 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs">
                            <div>
                                <p className="text-[8px] uppercase font-black text-slate-400">Subsidiary Asset Value</p>
                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                    {subs.length === 0 ? "$0.00" : formatMoney(subs.reduce((sum: number, s: string) => sum + parseSubsidiary(s).valuation, 0))}
                                </p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase font-black text-slate-400">Total Monthly Net Income</p>
                                <p className={cn("text-xs font-black mt-0.5", subs.reduce((sum: number, s: string) => sum + parseSubsidiary(s).netIncome, 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                                    {subs.length === 0 ? "$0 / mo" : `${subs.reduce((sum: number, s: string) => sum + parseSubsidiary(s).netIncome, 0) >= 0 ? '+' : ''}${formatMoney(subs.reduce((sum: number, s: string) => sum + parseSubsidiary(s).netIncome, 0))} / mo`}
                                </p>
                            </div>
                        </div>

                        {subs.length === 0 ? (
                            <div className="py-6 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4">
                                <p className="text-[10px] text-slate-400 italic text-center font-medium">No active corporate subsidiaries under management. Spin off internal divisions below.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-black text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">Under Management ({subs.length})</p>
                                <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                                    {subs.map((subRaw: string, idx: number) => {
                                        const sub = parseSubsidiary(subRaw);
                                        const listedStock = marketStocks?.find(s => (s.companyName === sub.name || s.symbol === sub.name || s.symbol === subRaw) && !s.isDelisted);
                                        const isListed = !!listedStock;

                                        const valuation = isListed ? (listedStock.currentPrice * listedStock.sharesOutstanding) : sub.valuation;
                                        let revenue = sub.revenue;
                                        let expenses = sub.expenses;
                                        let netIncome = sub.netIncome;

                                        if (isListed) {
                                            const pe = listedStock.peRatio && Math.abs(listedStock.peRatio) > 0 ? listedStock.peRatio : 20;
                                            const annualNetIncome = valuation / pe;
                                            netIncome = Math.round(annualNetIncome / 12);
                                            const annualRevenue = valuation / 8;
                                            revenue = Math.round(annualRevenue / 12);
                                            expenses = Math.max(0, revenue - netIncome);
                                        }

                                        const subAnnualRevenue = revenue * 12;
                                        const subAnnualExpenses = expenses * 12;
                                        const subNetIncome = netIncome * 12;

                                        const subARR = valuation * 0.15;
                                        const subUsers = Math.floor(valuation / 200);
                                        const hasCFO = !!(startup as any).cxoTeam?.["CFO"];

                                        const passARR = subARR >= 50000000;
                                        const passUsers = subUsers >= 10000;
                                        const passCFO = hasCFO;
                                        const canIPO = passARR && passUsers && passCFO && corporateCash >= 2000000;

                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => {
                                                    setSelectedSubRaw(subRaw);
                                                    setIsManageSubModalOpen(true);
                                                }}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 transition-all rounded-lg p-3 shadow-xs cursor-pointer group relative overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {sub.name}
                                                            </p>
                                                            {isListed ? (
                                                                <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900/30">
                                                                    Listed: {listedStock.symbol}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                                    Private
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Per-entity P&L Grid */}
                                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                                            <div className="flex justify-between text-[8px] font-semibold text-slate-500">
                                                                <span>Revenue/yr:</span>
                                                                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatMoney(subAnnualRevenue)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[8px] font-semibold text-slate-500">
                                                                <span>{isListed ? "Market Cap:" : "Asset Val:"}</span>
                                                                <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(valuation)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[8px] font-semibold text-slate-500">
                                                                <span>Expenses/yr:</span>
                                                                <span className="font-bold text-rose-600 dark:text-rose-400">{formatMoney(subAnnualExpenses)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-[8px] font-semibold text-slate-500">
                                                                <span>Net Income/yr:</span>
                                                                <span className={cn("font-bold", subNetIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                                                                    {subNetIncome >= 0 ? "+" : ""}{formatMoney(subNetIncome)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Info Badges */}
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                {!isListed && (
                                                                    <>
                                                                        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">IPO:</span>
                                                                        <span className={cn(
                                                                            "text-[7px] font-black uppercase px-1 py-0.5 rounded border",
                                                                            canIPO 
                                                                                ? "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-200" 
                                                                                : "bg-slate-50 dark:bg-slate-900/20 text-slate-500 border-slate-200"
                                                                        )}>
                                                                            {canIPO ? "✅ Qualified" : "❌ Not Qualified"}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                <span className={cn(
                                                                    "text-[7px] font-black uppercase px-1 py-0.5 rounded border",
                                                                    sub.integrationRisk === "High" ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200" :
                                                                        sub.integrationRisk === "Medium" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200" :
                                                                            "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200"
                                                                )}>
                                                                    Risk: {sub.integrationRisk}
                                                                </span>
                                                            </div>
                                                            <span className="text-[7.5px] text-indigo-500 font-black uppercase tracking-wider group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                                                Manage ➔
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Always show spin-off options so players can keep growing their portfolio */}
                        <div className="space-y-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-black text-slate-500 pb-1">Spin-off Internal Divisions</p>
                            <div className="grid grid-cols-1 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                                {[
                                    { name: "Axiom AI Infrastructure", cost: 20000000, emoji: "🤖", desc: "Spin off AI hosting infrastructure. Grants +5% profit margins and +5% Brand.", benefits: { margin: 0.05, brand: 5 } },
                                    { name: "Nova Logistics Systems", cost: 12000000, emoji: "🚁", desc: "Spin off drone ops. Reduces monthly burn by 10% and adds +8% Brand.", benefits: { burnRate: 0.10, brand: 8 } },
                                    { name: "Sovereign Defense Cloud (Aegis AI)", cost: 35000000, emoji: "🛡️", desc: "Defense consulting arm. Boosts parent Brand by +12% and margin by +15%.", benefits: { margin: 0.15, brand: 12 } },
                                    { name: "Quantum Research Lab (Q-Labs)", cost: 45000000, emoji: "⚛️", desc: "Quantum hardware division. Boosts R&D Efficiency +15% and Brand +15%.", benefits: { rd: 0.15, brand: 15 } }
                                ].filter(proj => !subs.some((s: string) => s.startsWith(proj.name))).map((proj, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex justify-between items-center gap-3">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">{proj.emoji} {proj.name}</p>
                                            <p className="text-[8.5px] text-slate-500 font-medium leading-normal mt-0.5">{proj.desc}</p>
                                            <p className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 mt-1">Cost: {formatMoney(proj.cost)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSpinOffInternal(proj.name, proj.cost, proj.desc, proj.benefits)}
                                            disabled={corporateCash < proj.cost}
                                            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-black uppercase text-[8px] px-3 py-2 rounded-lg transition-all shadow-sm active:scale-95"
                                        >
                                            Spin Off
                                        </button>
                                    </div>
                                ))}
                                {[
                                    { name: "Axiom AI Infrastructure" },
                                    { name: "Nova Logistics Systems" },
                                    { name: "Sovereign Defense Cloud (Aegis AI)" },
                                    { name: "Quantum Research Lab (Q-Labs)" }
                                ].every(proj => subs.some((s: string) => s.startsWith(proj.name))) && (
                                        <p className="text-[9px] text-slate-400 italic text-center py-3">All internal divisions have been spun off. Acquire rivals to add more subsidiaries.</p>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* M&A Divestiture & Transaction Ledger */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] uppercase font-black text-slate-500">Corporate M&A & Spin-off Ledger</p>
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">SEC Form 8-K Definitive</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 space-y-2 max-h-[110px] overflow-y-auto shadow-inner">
                            {subs.map((sRaw: string, idx: number) => {
                                const sInfo = parseSubsidiary(sRaw);
                                return (
                                    <div key={idx} className="flex justify-between items-center text-[8px] border-b border-slate-100 dark:border-slate-800/50 pb-1.5 last:border-b-0 last:pb-0">
                                        <div>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{sInfo.name}</span>
                                            <p className="text-slate-400 font-medium">Rev {formatMoney(sInfo.revenue)}/mo · Exp {formatMoney(sInfo.expenses)}/mo · Risk: {sInfo.integrationRisk}</p>
                                        </div>
                                        <span className={cn("font-bold px-1.5 py-0.5 rounded border", sInfo.netIncome >= 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" : "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50")}>{sInfo.netIncome >= 0 ? "Profitable" : "Cash Drain"}</span>
                                    </div>
                                );
                            })}
                            <div className="text-[7px] uppercase font-bold text-slate-400 dark:text-slate-500 pt-1 border-t border-dashed border-slate-100 dark:border-slate-800/60 pb-1">
                                Baseline Corporate Setup
                            </div>
                            <div className="flex justify-between items-center text-[8px] border-b border-slate-100 dark:border-slate-800/50 pb-1.5 last:border-b-0 last:pb-0">
                                <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Corporate Charter Update</span>
                                    <p className="text-slate-400 font-medium">Bylaws amended for holding company restructurings</p>
                                </div>
                                <span className="text-slate-500 font-bold bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">Approved</span>
                            </div>
                            <div className="flex justify-between items-center text-[8px]">
                                <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">SEC Form 8-K M&A Filing</span>
                                    <p className="text-slate-400 font-medium">Material definitive agreement disclosed publicly</p>
                                </div>
                                <span className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">Filed</span>
                            </div>
                        </div>
                    </div>
                </div>
                <ManageSubsidiaryModal
                    open={isManageSubModalOpen}
                    onClose={() => setIsManageSubModalOpen(false)}
                    subRaw={selectedSubRaw}
                    startup={startup}
                    marketStocks={marketStocks || []}
                    onInjectCapital={handleInjectCapital}
                    onRebrandSubsidiary={handleRebrandSubsidiary}
                    onListSubsidiary={handleListSubsidiary}
                    onDivestSubsidiary={handleDivestSubsidiary}
                />
            </div>
        );
    }

    return null;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();

    // 1. ALL STATES FIRST
    const [isPremium, setIsPremium] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("founder_sim_premium") === "true";
        }
        return false;
    });
    const [isBurnBreakdownOpen, setIsBurnBreakdownOpen] = useState(false);
    const [isBugModalOpen, setIsBugModalOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
    const [interstitialAdOwed, setInterstitialAdOwed] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("founder_sim_ad_owed") === "true";
        }
        return false;
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const [startup, setStartup] = useState<Startup>(STARTUP_BASE as unknown as Startup);
    const [founder, setFounder] = useState<Founder>(FOUNDER_BASE as unknown as Founder);
    const [month, setMonth] = useState(1);
    const [eventsTimeline, setEventsTimeline] = useState<{ month: number; text: string }[]>([]);
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

    // Pillar 2 States
    const [viewState, setViewState] = useState<"dashboard" | "submenu" | "action">("dashboard");
    const [showPostIpoCinematic, setShowPostIpoCinematic] = useState(false);
    const [terminalTab, setTerminalTab] = useState<"operations" | "market" | "treasury" | "personal" | "compliance" | "corporate">("operations");
    const [marketStocks, setMarketStocks] = useState<MarketStock[]>([]);
    const [mnaTargets, setMnaTargets] = useState<MnATarget[]>([]);
    
    // Stock Market Genius State
    const [geniusUsesThisHour, setGeniusUsesThisHour] = useState(0);
    const [lastGeniusResetTime, setLastGeniusResetTime] = useState(0);
    const [insiderStockPicks, setInsiderStockPicks] = useState<{ symbol: string; monthsLeft: number }[]>([]);

    useEffect(() => {
        // Only seed market stocks once — and never include the player company pre-IPO
        if (marketStocks.length === 0) {
            const fullState = localStorage.getItem("founder_sim_state");
            if (fullState) {
                try {
                    const d = JSON.parse(fullState);
                    if (d.marketStocks && d.marketStocks.length > 0) {
                        setMarketStocks(d.marketStocks);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to restore market stocks from save state", e);
                }
            }
            import('@/lib/engine/publicMarket').then(mod => {
                if (startup.public_company) {
                    setMarketStocks(mod.initializeMarketStocks(
                        startup.symbol || "CORP",
                        startup.public_company.share_price || 10,
                        startup.name
                    ));
                } else {
                    setMarketStocks(mod.initializeMarketStocks());
                }
            });
        }
    }, [marketStocks.length, startup.public_company, startup.symbol]);

    // Self-healing effect: ensure player company stock exists in public market if they went public
    useEffect(() => {
        if (isLoaded && startup.public_company && marketStocks.length > 0) {
            const playerSymbol = startup.symbol || "CORP";
            const hasPlayerStock = marketStocks.some(s => s.symbol === playerSymbol);
            if (!hasPlayerStock) {
                const playerStock: MarketStock = {
                    symbol: playerSymbol,
                    companyName: startup.name || "Your Company",
                    sector: "Technology",
                    currentPrice: startup.public_company.share_price || 10,
                    sharesOutstanding: startup.public_company.shares_outstanding || 100_000_000,
                    peRatio: 50,
                    momentum: 0,
                    volatility: 0.08,
                    rsi: 50,
                    priceHistory: [startup.public_company.share_price || 10],
                    companyTier: "small_cap" as const,
                    shareholders: [
                        { name: "You (Founder)", type: "founder" as const, ownershipPct: 65 },
                        { name: "Early Investors", type: "vc" as const, ownershipPct: 20 },
                        { name: "Public Float", type: "public_float" as const, ownershipPct: 15 },
                    ]
                };
                setMarketStocks(prev => [playerStock, ...prev]);
            }
        }
    }, [isLoaded, startup.public_company, startup.symbol, startup.name, marketStocks.length]);

    // Self-healing effect: ensure any stock in portfolios (like subsidiaries) that got wiped are restored
    useEffect(() => {
        if (isLoaded && marketStocks.length > 0) {
            const corpPortfolio = startup.public_company?.corporate_portfolio || (startup as any).treasury_portfolio || [];
            const personalPortfolio = founder.wealth_profile?.portfolio || [];
            
            const allPositions = [...corpPortfolio, ...personalPortfolio];
            let missingStocks: MarketStock[] = [];
            
            allPositions.forEach(pos => {
                // Don't reconstruct the player's own company (handled above)
                if (pos.symbol === (startup.symbol || "CORP")) return;
                
                const exists = marketStocks.some(s => s.symbol === pos.symbol);
                const alreadyMissing = missingStocks.some(s => s.symbol === pos.symbol);
                if (!exists && !alreadyMissing) {
                    missingStocks.push({
                        symbol: pos.symbol,
                        companyName: `${pos.symbol} Inc`,
                        sector: "Technology",
                        currentPrice: pos.averageCost,
                        sharesOutstanding: 20_000_000,
                        peRatio: 25,
                        momentum: 0,
                        volatility: 0.09,
                        rsi: 50,
                        priceHistory: [pos.averageCost],
                        companyTier: "small_cap",
                        isSubsidiary: true,
                        shareholders: [
                            { name: startup.name || "Parent", type: "founder", ownershipPct: 80 },
                            { name: "Public Float", type: "public_float", ownershipPct: 20 }
                        ]
                    });
                }
            });
            
            if (missingStocks.length > 0) {
                setMarketStocks(prev => [...prev, ...missingStocks]);
            }
        }
    }, [isLoaded, startup.public_company?.corporate_portfolio, founder.wealth_profile?.portfolio, marketStocks.length, startup.symbol, startup.name]);
    const [isEarningsCallOpen, setIsEarningsCallOpen] = useState(false);
    const [isStoreOpen, setIsStoreOpen] = useState(false);

    const [isSamModalOpen, setIsSamModalOpen] = useState(false);
    const [samAdvice, setSamAdvice] = useState<AdviceContent | null>(null);
    const [characterDialog, setCharacterDialog] = useState<StorylineDialog | null>(null);
    const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
    const [storyState, setStoryState] = useState<StorylineState>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("founder_sim_story_state");
            if (saved) return JSON.parse(saved);
        }
        return {
            seenTriggers: [],
            chadMustRespondNext: false,
            lastChadMonth: -1,
            act: 1,
            tutorialStep: 0,
            samGoneToIsland: false,
            hasConsultedSam: false,
        };
    });
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [hasSeenIntro, setHasSeenIntro] = useState(false);
    const [samConsults, setSamConsults] = useState<number[]>([]);
    const [cashGrants, setCashGrants] = useState<number[]>([]);
    const [energyRefills, setEnergyRefills] = useState<number[]>([]);
    const [isChadModalOpen, setIsChadModalOpen] = useState(false);
    const [chadAdvice, setChadAdvice] = useState<{ title: string; message: string; buttonText: string } | null>(null);
    const [selectedAction, setSelectedAction] = useState<StartupAction>("none");
    const [isProcessing, setIsProcessing] = useState(false);
    const [endgameStory, setEndgameStory] = useState<string | null>(null);
    const [isEndgameOpen, setIsEndgameOpen] = useState(false);
    const [isStockMarketOpen, setIsStockMarketOpen] = useState(false);
    const [isFocusBreakdownOpen, setIsFocusBreakdownOpen] = useState(false);
    const [dismissedEndgame, setDismissedEndgame] = useState(false);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
    const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
    const [actionCategory, setActionCategory] = useState<SheetCategory | null>(null);
    const [monthSummary, setMonthSummary] = useState<any | null>(null);
    const [pendingCandidate, setPendingCandidate] = useState<Candidate | null>(null);
    const [isCrisisWarRoomOpen, setIsCrisisWarRoomOpen] = useState(false);
    const [rejectedCandidates, setRejectedCandidates] = useState<string[]>([]);
    const [hiringOffer, setHiringOffer] = useState({ salary: 0, equity: 0 });
    const [isMilestoneExpanded, setIsMilestoneExpanded] = useState(false);
    const [pendingInvestor, setPendingInvestor] = useState<Investor | null>(null);
    const [fundingOffer, setFundingOffer] = useState({ valuation: 0, equity: 0 });
    const [pendingCounterOffer, setPendingCounterOffer] = useState<{ valuation: number; equity: number } | null>(null);
    const [confirmedFunding, setConfirmedFunding] = useState<{ valuation: number; equity: number } | null>(null);
    const [confirmedHire, setConfirmedHire] = useState<Candidate | null>(null);
    const [hrSearchRole, setHrSearchRole] = useState<"engineer" | "marketer" | "sales" | "legal">("engineer");
    const [hrCandidates, setHrCandidates] = useState<Candidate[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        type?: "delete" | "fire" | "exit" | "warning" | "premium";
    }>({ open: false, title: "", description: "", onConfirm: () => { } });
    const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => !isAudioMuted());

    // 2. ALL EFFECTS SECOND
    useEffect(() => {
        const checkConnectivity = () => {
            const online = typeof window !== "undefined" ? navigator.onLine : true;
            setIsOnline(online);
            if (online && !isPremium) {
                // Use resume as it handles re-attaching banners and pre-loading
                adService.resume();
            }
        };

        const handleOnline = () => {
            setIsOnline(true);
            if (!isPremium) {
                adService.initialize().then(() => {
                    adService.showBanner();
                    // AdService handles interstitial preloading internally
                });
            }
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Also check on app resume
        const resumeListener = App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                console.log('App resumed, refreshing ads and checking connection...');
                setTimeout(() => {
                    checkConnectivity(); // This already handles adService.resume()
                }, 1500); // 1.5s delay to ensure native view is fully ready
            }
        });

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            resumeListener.then(l => l.remove());
        };
    }, [isPremium]);

    useEffect(() => {
        if (isOnline && interstitialAdOwed && !isPremium && isLoaded) {
            const timer = setTimeout(async () => {
                await adService.showInterstitial();
                setInterstitialAdOwed(false);
                toast.info("Connection Restored", { description: "Simulation synced and ready." });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, interstitialAdOwed, isPremium, isLoaded]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("founder_sim_ad_owed", interstitialAdOwed.toString());
        }
    }, [interstitialAdOwed]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("founder_sim_story_state", JSON.stringify(storyState));
        }
    }, [storyState]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);


    // ── Tutorial: fire active step on game load/reload ──────────────────────────
    useEffect(() => {
        if (!isLoaded || month !== 1 || storyState.tutorialStep < 0 || storyState.tutorialStep >= TUTORIAL_STEPS.length) return;

        const dialog = TUTORIAL_STEPS[storyState.tutorialStep];
        // Only trigger if not already open AND we haven't seen this step's trigger yet
        const hasSeenCurrent = (storyState.seenTriggers || []).includes(dialog.trigger);

        if (!isCharacterDialogOpen && !hasSeenCurrent) {
            // No timer — user just clicked "NEXT STEP" on the dashboard, so show it immediately
            setCharacterDialog(dialog);
            setIsCharacterDialogOpen(true);
        }
    }, [isLoaded, month, storyState.tutorialStep, isCharacterDialogOpen, storyState.seenTriggers]);

    // ── Monthly Storyline: ensure events trigger on load/reload ──────────────────
    useEffect(() => {
        if (!isLoaded || isCharacterDialogOpen || isProcessing) return;

        const storyDialog = getStorylineDialog(
            month,
            {
                valuation: startup.valuation ?? 0,
                users: startup.metrics.users ?? 0,
                cash: startup.metrics.cash ?? 0,
                runway: startup.metrics.runway ?? 0,
                burnout: startup.metrics.founder_burnout ?? 0,
                growth_rate: startup.metrics.growth_rate ?? 0,
                net_profit: startup.metrics.net_profit ?? 0,
            },
            competitors,
            storyState,
            false // reactive 'justFundraised' handled via handleAdvanceMonth
        );

        if (storyDialog && !storyState.seenTriggers.includes(storyDialog.trigger)) {
            const t = setTimeout(() => {
                setCharacterDialog(storyDialog);
                setIsCharacterDialogOpen(true);
            }, 1200);
            return () => clearTimeout(t);
        }
    }, [isLoaded, month, storyState.seenTriggers, competitors, isCharacterDialogOpen, isProcessing]);

    // Tutorial advance is button-driven (Next Step button), no auto-timers


    // --- UI AUTO-DISMISS HELPERS ---
    // Specifically to prevent the "Modal Behind Sheet" issue. 
    // If a primary interaction starts (Negotiate, Fundraising, Event, AI Dialog, etc), we must close any side sheets.
    useEffect(() => {
        if (pendingInvestor || activeEvent || isCharacterDialogOpen || isEndgameOpen || confirmedFunding) {
            if (actionCategory !== null) setActionCategory(null);
        }
    }, [pendingInvestor, activeEvent, isCharacterDialogOpen, isEndgameOpen, confirmedFunding, actionCategory]);

    useEffect(() => {
        if (startup.iap_ad_free || startup.iap_titan) {
            setIsPremium(true);
        }
    }, [startup.iap_ad_free, startup.iap_titan]);

    useEffect(() => {
        iapService.initialize().then(() => {
            iapService.getOwnedNonConsumables().then(owned => {
                if (owned.length > 0) {
                    setStartup(prev => {
                        const next = { ...prev };
                        if (owned.includes("founder_sim_premium") || owned.includes("founder_sim_titan")) {
                            next.iap_ad_free = true;
                            setIsPremium(true);
                        }
                        if (owned.includes("founder_sim_caffeine")) next.iap_caffeine = true;
                        if (owned.includes("founder_sim_titan")) next.iap_titan = true;
                        return next;
                    });
                }
            });
        });
    }, []);

    const eventMultiplier = useMemo(() => {
        const p = startup.phase?.toLowerCase();
        if (p === "idea phase") return 1;
        if (p === "early startup") return 1.5;
        if (p === "traction") return 2.5;
        if (p === "growth") return 5.0;
        if (p === "scaling") return 12.0;
        return 1.0;
    }, [startup.phase]);

    const allEmployees = useMemo(() => {
        const baseEmployees = startup.employees || [];
        const cxoConfig = [
            { role: "CTO", name: "CTO (Executive)", salary: 18000 },
            { role: "CMO", name: "CMO (Executive)", salary: 15000 },
            { role: "COO", name: "COO (Executive)", salary: 16000 },
            { role: "CFO", name: "CFO (Executive)", salary: 14000 },
            { role: "CPO", name: "CPO (Executive)", salary: 15000 },
            { role: "CHRO", name: "Head of HR", salary: 12000 },
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
    const [isNative, setIsNative] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [availableSaves, setAvailableSaves] = useState<SaveSlot[]>([]);

    useEffect(() => {
        // iOS: make statusbar transparent overlay instead of hiding.
        // Hiding zeroes out env(safe-area-inset-top), breaking safe area layout.
        const enableFullscreen = async () => {
            const { Capacitor } = await import('@capacitor/core');
            const platform = Capacitor.getPlatform();
            if (Capacitor.isNativePlatform()) setIsNative(true);
            if (Capacitor.isNativePlatform()) {
                const { StatusBar, Style } = await import('@capacitor/status-bar');
                try {
                    await StatusBar.setOverlaysWebView({ overlay: true });
                    await StatusBar.setBackgroundColor({ color: '#00000000' });
                    await StatusBar.setStyle({ style: Style.Dark });
                } catch (e) {
                    console.warn("StatusBar setup failed", e);
                }
            }
        };
        enableFullscreen();

        // AdMob Initialization
        const initAds = async () => {
            try {
                adService.setPremium(isPremium);
                await adService.initialize();
                // adService.initialize() now calls showBanner() and preLoadAll() internally if not premium
            } catch (e) {
                console.error("AdMob initialization failed", e);
            }
        };
        initAds();

        return () => {
            adService.hideBanner();
        };
    }, []);

    // Watch for status changes to hide ads immediately
    useEffect(() => {
        adService.setPremium(isPremium);
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
                if (d.storyState) setStoryState(d.storyState);
                if (d.marketStocks) setMarketStocks(d.marketStocks);
                if (d.insiderStockPicks) setInsiderStockPicks(d.insiderStockPicks);
                if (d.geniusUsesThisHour) setGeniusUsesThisHour(d.geniusUsesThisHour);
                if (d.lastGeniusResetTime) setLastGeniusResetTime(d.lastGeniusResetTime);

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

                        // Apply Background Modifiers (Aggressive Shifts for Realism)
                        const bg = d.background;
                        if (bg === "Engineer") {
                            newAttrs.technical_skill = (newAttrs.technical_skill || 0) + 25;
                            newAttrs.networking = Math.max(0, (newAttrs.networking || 0) - 15);
                            newAttrs.marketing_skill = Math.max(0, (newAttrs.marketing_skill || 0) - 10);
                        } else if (bg === "MBA") {
                            newAttrs.networking = (newAttrs.networking || 0) + 20;
                            newAttrs.leadership = (newAttrs.leadership || 0) + 5;
                            newAttrs.technical_skill = Math.max(0, (newAttrs.technical_skill || 0) - 15);
                        } else if (bg === "Designer") {
                            newAttrs.marketing_skill = (newAttrs.marketing_skill || 0) + 15;
                            newAttrs.technical_skill = (newAttrs.technical_skill || 0) + 10;
                        } else if (bg === "Serial Founder") {
                            newAttrs.reputation = (newAttrs.reputation || 0) + 20;
                            newAttrs.stress_tolerance = (newAttrs.stress_tolerance || 0) + 10;
                        } else if (bg === "Hustler") {
                            newAttrs.networking = (newAttrs.networking || 0) + 25;
                            newAttrs.marketing_skill = (newAttrs.marketing_skill || 0) + 15;
                            newAttrs.intelligence = Math.max(0, (newAttrs.intelligence || 0) - 15);
                        } else if (bg === "Finance") {
                            newAttrs.networking = (newAttrs.networking || 0) + 35;
                            newAttrs.intelligence = (newAttrs.intelligence || 0) + 15;
                            newAttrs.technical_skill = Math.max(0, (newAttrs.technical_skill || 0) - 15);
                        }

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

                        const defaultSymbol = (d.startupName || d.name || "CORP").substring(0, 4).toUpperCase();
                        return {
                            ...s,
                            name: d.startupName || d.name,
                            symbol: defaultSymbol,
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

    // --- ENDGAME STORY GENERATION (CENTRALIZED) ---
    useEffect(() => {
        if (isEndgameOpen && !endgameStory) {
            const generateStory = async () => {
                const timelineText = eventsTimeline.map(e => `Month ${e.month}: ${e.text}`);
                const story = await generateFounderStory(founder.name, startup.name, timelineText);
                setEndgameStory(story);
            };
            generateStory();
        }
    }, [isEndgameOpen, endgameStory, founder.name, startup.name, eventsTimeline]);

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
                actionUsageLog,
                storyState,
                marketStocks,
                insiderStockPicks,
                geniusUsesThisHour,
                lastGeniusResetTime
            }));
        }
    }, [month, startup, founder, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds, founderMeta, focusHoursUsed, isLoaded, storyState, marketStocks, insiderStockPicks, geniusUsesThisHour, lastGeniusResetTime]);

    const handleResetGame = (skipConfirm = false) => {
        const performReset = () => {
            // Thoroughly clear all persistent states to ensure a fresh 2nd game
            localStorage.removeItem("founder_sim_state");
            localStorage.removeItem("founder_data");
            localStorage.removeItem("founder_sim_ad_owed");
            localStorage.removeItem("founder_sim_story_state");
            localStorage.removeItem("founder_sim_achievements");

            // Force a full location reload to clear any in-memory module-level states (like AI keys)
            window.location.href = "/";
        };

        if (skipConfirm) {
            performReset();
            return;
        }

        setConfirmDialog({
            open: true,
            title: "Reset Progress?",
            description: "This will permanently delete your current startup and founder data. This cannot be undone.",
            confirmText: "RESET EVERYTHING",
            type: "delete",
            onConfirm: performReset
        });
    };

    const handleRateAndClaim = async () => {
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

            toast.success("Support Applied! 🎁", {
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
                ongoingPrograms,
                seenEventIds,
                founderMeta,
                focusHoursUsed: newFocusUsed,
                actionUsageLog,
                storyState,
                marketStocks,
                insiderStockPicks,
                geniusUsesThisHour,
                lastGeniusResetTime
            }));
        }
        await openStoreListing();
     };
 
     const addTimelineEvent = (text: string, monthOverride?: number) => {
         setEventsTimeline(prev => [...prev, { month: monthOverride ?? month, text }]);
     };
 
     const handleSaveAndQuit = () => {
         if (startup.name !== "New Startup") {
             localStorage.setItem("founder_sim_state", JSON.stringify({ startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds, founderMeta, focusHoursUsed, actionUsageLog, storyState, marketStocks, insiderStockPicks, geniusUsesThisHour, lastGeniusResetTime }));
         }
         router.push("/");
     };

        const handleTradePersonal = (symbol: string, shares: number, price: number) => {
        try {
            const currentWealthProfile = founder.wealth_profile || { portfolio: [], margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] };
            const { newCash, newPortfolio } = executeTrade(
                currentWealthProfile.portfolio || [],
                founder.personal_wealth || 0,
                symbol,
                shares,
                price
            );
            
            // Check if we trigger poison pill
            let updatedStocks = [...marketStocks];
            const stockIndex = updatedStocks.findIndex(s => s.symbol === symbol);
            if (stockIndex >= 0) {
                const prevOwnership = getPlayerOwnershipPct(symbol, updatedStocks[stockIndex], currentWealthProfile.portfolio || [], startup.public_company?.corporate_portfolio || startup.treasury_portfolio || []);
                const nextShares = (currentWealthProfile.portfolio || []).map(p => p.symbol === symbol ? { ...p, shares: p.shares + shares } : p);
                if (!nextShares.find(p => p.symbol === symbol) && shares > 0) {
                    nextShares.push({ symbol, shares, averageCost: price });
                }
                const newOwnership = getPlayerOwnershipPct(symbol, updatedStocks[stockIndex], nextShares, startup.public_company?.corporate_portfolio || startup.treasury_portfolio || []);
                const updatedStock = checkPoisonPill(updatedStocks[stockIndex], prevOwnership, newOwnership);
                if (updatedStock.poisonPillActive && !updatedStocks[stockIndex].poisonPillActive) {
                    toast.warning(`☠️ Poison pill defense triggered by ${updatedStock.companyName}! They issued new shares, diluting your power!`);
                }
                updatedStocks[stockIndex] = updatedStock;
                setMarketStocks(updatedStocks);
            }

            setFounder(prev => ({
                ...prev,
                personal_wealth: newCash,
                wealth_profile: {
                    ...currentWealthProfile,
                    portfolio: newPortfolio
                }
            }));

            // Check if we lost control of this subsidiary
            if (stockIndex >= 0) {
                const updatedStock = updatedStocks[stockIndex];
                if (updatedStock.isSubsidiary) {
                    const newOwnership = getPlayerOwnershipPct(symbol, updatedStock, newPortfolio, startup.public_company?.corporate_portfolio || startup.treasury_portfolio || []);
                    const controlThreshold = getControlThreshold(updatedStock.companyTier || "large_cap");
                    if (newOwnership < controlThreshold) {
                        setStartup(prev => ({
                            ...prev,
                            subsidiaries: (prev.subsidiaries || []).filter(s => {
                                const parsed = parseSubsidiary(s);
                                return parsed.name !== updatedStock.companyName && parsed.name !== updatedStock.symbol && s !== updatedStock.symbol;
                            })
                        }));
                        updatedStocks[stockIndex] = { ...updatedStock, isSubsidiary: false };
                        setMarketStocks(updatedStocks);
                        toast.warning(`⚠️ Lost Control! Your ownership in ${updatedStock.companyName} (${updatedStock.symbol}) fell below the control threshold of ${controlThreshold}%. It is no longer a corporate subsidiary.`);
                    }
                }
            }

            toast.success(`${shares > 0 ? "Bought" : "Sold"} ${Math.abs(shares).toLocaleString()} shares of ${symbol}`);
        } catch (e: any) {
            toast.error(e.message || "Trade failed");
        }
    };

    const handleTradeCorporate = (symbol: string, shares: number, price: number) => {
        try {
            const isPublic = !!startup.public_company;
            const currentCorpPortfolio = isPublic 
                ? (startup.public_company?.corporate_portfolio || [])
                : (startup.treasury_portfolio || []);
            const { newCash, newPortfolio } = executeTrade(
                currentCorpPortfolio,
                startup.metrics?.cash || 0,
                symbol,
                shares,
                price
            );

            // Check if we trigger poison pill
            let updatedStocks = [...marketStocks];
            const stockIndex = updatedStocks.findIndex(s => s.symbol === symbol);
            if (stockIndex >= 0) {
                const prevOwnership = getPlayerOwnershipPct(symbol, updatedStocks[stockIndex], founder.wealth_profile?.portfolio || [], currentCorpPortfolio);
                const nextShares = currentCorpPortfolio.map(p => p.symbol === symbol ? { ...p, shares: p.shares + shares } : p);
                if (!nextShares.find(p => p.symbol === symbol) && shares > 0) {
                    nextShares.push({ symbol, shares, averageCost: price });
                }
                const newOwnership = getPlayerOwnershipPct(symbol, updatedStocks[stockIndex], founder.wealth_profile?.portfolio || [], nextShares);
                const updatedStock = checkPoisonPill(updatedStocks[stockIndex], prevOwnership, newOwnership);
                if (updatedStock.poisonPillActive && !updatedStocks[stockIndex].poisonPillActive) {
                    toast.warning(`☠️ Poison pill defense triggered by ${updatedStock.companyName}! They issued new shares, diluting your power!`);
                }
                updatedStocks[stockIndex] = updatedStock;
                setMarketStocks(updatedStocks);
            }

            setStartup(prev => {
                if (isPublic && prev.public_company) {
                    return {
                        ...prev,
                        metrics: {
                            ...prev.metrics,
                            cash: newCash
                        },
                        public_company: {
                            ...prev.public_company,
                            corporate_portfolio: newPortfolio
                        }
                    };
                } else {
                    return {
                        ...prev,
                        metrics: {
                            ...prev.metrics,
                            cash: newCash
                        },
                        treasury_portfolio: newPortfolio
                    };
                }
            });

            // Check if we lost control of this subsidiary
            if (stockIndex >= 0) {
                const updatedStock = updatedStocks[stockIndex];
                if (updatedStock.isSubsidiary) {
                    const newOwnership = getPlayerOwnershipPct(symbol, updatedStock, founder.wealth_profile?.portfolio || [], newPortfolio);
                    const controlThreshold = getControlThreshold(updatedStock.companyTier || "large_cap");
                    if (newOwnership < controlThreshold) {
                        setStartup(prev => ({
                            ...prev,
                            subsidiaries: (prev.subsidiaries || []).filter(s => {
                                const parsed = parseSubsidiary(s);
                                return parsed.name !== updatedStock.companyName && parsed.name !== updatedStock.symbol && s !== updatedStock.symbol;
                            })
                        }));
                        updatedStocks[stockIndex] = { ...updatedStock, isSubsidiary: false };
                        setMarketStocks(updatedStocks);
                        toast.warning(`⚠️ Lost Control! Your ownership in ${updatedStock.companyName} (${updatedStock.symbol}) fell below the control threshold of ${controlThreshold}%. It is no longer a corporate subsidiary.`);
                    }
                }
            }

            toast.success(`Corporate ${shares > 0 ? "bought" : "sold"} ${Math.abs(shares).toLocaleString()} shares of ${symbol}`);
        } catch (e: any) {
            toast.error(e.message || "Trade failed");
        }
    };

    const handleTenderOffer = (stock: MarketStock, premiumPct: number, account: "personal" | "corporate") => {
        try {
            const personalPortfolio = founder.wealth_profile?.portfolio || [];
            const corporatePortfolio = startup.public_company?.corporate_portfolio || startup.treasury_portfolio || [];
            const personalCash = founder.personal_wealth || 0;
            const corporateCash = startup.metrics?.cash || 0;

            const availableCash = account === "personal" ? personalCash : corporateCash;
            const currentSharesHeld = (account === "personal" ? personalPortfolio : corporatePortfolio)
                .find(p => p.symbol === stock.symbol)?.shares || 0;

            const result = executeTenderOffer(stock, premiumPct, availableCash, currentSharesHeld);

            if (result.blocked) {
                toast.error(`Tender Offer Blocked: ${result.blockReason}`);
                return;
            }

            if (result.sharesAcquired <= 0) {
                toast.info("Tender offer received no acceptance from public float.");
                return;
            }

            // Adjust portfolio position with the shares acquired
            let updatedPortfolio = account === "personal" ? [...personalPortfolio] : [...corporatePortfolio];
            const posIndex = updatedPortfolio.findIndex(p => p.symbol === stock.symbol);
            const offeredPrice = stock.currentPrice * (1 + premiumPct / 100);
            const finalOfferedPrice = stock.poisonPillActive ? offeredPrice * 1.4 : offeredPrice;

            if (posIndex >= 0) {
                const pos = updatedPortfolio[posIndex];
                const totalVal = pos.shares * pos.averageCost + result.sharesAcquired * finalOfferedPrice;
                const newShares = pos.shares + result.sharesAcquired;
                updatedPortfolio[posIndex] = { ...pos, shares: newShares, averageCost: totalVal / newShares };
            } else {
                updatedPortfolio.push({ symbol: stock.symbol, shares: result.sharesAcquired, averageCost: finalOfferedPrice });
            }

            const updatedCash = availableCash - result.totalCost;

            if (account === "personal") {
                setFounder(prev => ({
                    ...prev,
                    personal_wealth: updatedCash,
                    wealth_profile: {
                        ...(prev.wealth_profile || { margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] }),
                        portfolio: updatedPortfolio
                    }
                }));
            } else {
                const isPublic = !!startup.public_company;
                setStartup(prev => {
                    if (isPublic && prev.public_company) {
                        return {
                            ...prev,
                            metrics: {
                                ...prev.metrics,
                                cash: updatedCash
                            },
                            public_company: {
                                ...prev.public_company,
                                corporate_portfolio: updatedPortfolio
                            }
                        };
                    } else {
                        return {
                            ...prev,
                            metrics: {
                                ...prev.metrics,
                                cash: updatedCash
                            },
                            treasury_portfolio: updatedPortfolio
                        };
                    }
                });
            }

            // Check if we took control of the company
            const newPersonalPortfolio = account === "personal" ? updatedPortfolio : personalPortfolio;
            const newCorporatePortfolio = account === "corporate" ? updatedPortfolio : corporatePortfolio;
            const newOwnership = getPlayerOwnershipPct(stock.symbol, stock, newPersonalPortfolio, newCorporatePortfolio);
            const controlThreshold = getControlThreshold(stock.companyTier || "large_cap");

            if (newOwnership >= controlThreshold) {
                // Add to startup subsidiaries!
                const existingSubs = startup.subsidiaries || [];
                if (!existingSubs.includes(stock.symbol)) {
                    setStartup(prev => ({
                        ...prev,
                        subsidiaries: [...(prev.subsidiaries || []), stock.symbol]
                    }));
                    if (setMarketStocks && marketStocks) {
                        setMarketStocks(marketStocks.map(s => s.symbol === stock.symbol ? { ...s, isSubsidiary: true } : s));
                    }
                    toast.success(`🎉 Hostile Takeover Successful! ${stock.companyName} (${stock.symbol}) is now a subsidiary of ${startup.name}!`);
                } else {
                    toast.success(`Tender offer completed! Acquired ${result.sharesAcquired.toLocaleString()} additional shares.`);
                }
            } else {
                toast.success(`Tender offer completed! Acquired ${result.sharesAcquired.toLocaleString()} shares. Current stake: ${newOwnership.toFixed(1)}%`);
            }
        } catch (e: any) {
            toast.error(e.message || "Tender offer failed");
        }
    };

    const handleBlockBuy = (
        stock: MarketStock,
        shareholderIndex: number,
        premiumPct: number,
        account: "personal" | "corporate"
    ) => {
        try {
            if (!marketStocks || !setMarketStocks) return;

            const shareholder = stock.shareholders?.[shareholderIndex];
            if (!shareholder) {
                toast.error("Shareholder not found.");
                return;
            }
            if (shareholder.type === "public_float" || shareholder.type === "player" || shareholder.type === "parent_company") {
                toast.error("You cannot directly buy out the public float or yourself.");
                return;
            }

            const blockShares = Math.floor((shareholder.ownershipPct / 100) * stock.sharesOutstanding);
            if (blockShares <= 0) {
                toast.error("No shares available in this block.");
                return;
            }

            const offeredPrice = stock.currentPrice * (1 + premiumPct / 100);
            const totalCost = Math.floor(blockShares * offeredPrice);

            const personalPortfolio = founder.wealth_profile?.portfolio || [];
            const corporatePortfolio = startup.public_company?.corporate_portfolio || startup.treasury_portfolio || [];
            const availableCash = account === "personal" ? (founder.personal_wealth || 0) : (startup.metrics?.cash || 0);

            if (totalCost > availableCash) {
                toast.error("Insufficient funds", {
                    description: `This block trade costs ${formatMoney(totalCost)} but you only have ${formatMoney(availableCash)}.`
                });
                return;
            }

            // Update portfolio
            let updatedPortfolio = [...(account === "personal" ? personalPortfolio : corporatePortfolio)];
            const posIdx = updatedPortfolio.findIndex(p => p.symbol === stock.symbol);
            if (posIdx >= 0) {
                const pos = updatedPortfolio[posIdx];
                const newShares = pos.shares + blockShares;
                const newAvgCost = (pos.shares * pos.averageCost + blockShares * offeredPrice) / newShares;
                updatedPortfolio[posIdx] = { ...pos, shares: newShares, averageCost: newAvgCost };
            } else {
                updatedPortfolio.push({ symbol: stock.symbol, shares: blockShares, averageCost: offeredPrice });
            }

            // Update the stock's shareholders — remove/reduce the sold block
            const updatedStocks = marketStocks.map(s => {
                if (s.symbol !== stock.symbol) return s;
                const updatedShareholders = (s.shareholders || []).filter((_, i) => i !== shareholderIndex);
                // Slight upward price nudge (1–3%) from demand signal
                const priceNudge = 1 + (0.01 + Math.random() * 0.02);
                return {
                    ...s,
                    currentPrice: parseFloat((s.currentPrice * priceNudge).toFixed(2)),
                    shareholders: updatedShareholders,
                };
            });

            // Deduct cash and update portfolio state
            const updatedCash = availableCash - totalCost;
            if (account === "personal") {
                setFounder(prev => ({
                    ...prev,
                    personal_wealth: updatedCash,
                    wealth_profile: {
                        ...(prev.wealth_profile || { margin_loan_balance: 0, philanthropy_score: 0, active_10b51_plans: [] }),
                        portfolio: updatedPortfolio
                    }
                }));
            } else {
                const isPublic = !!startup.public_company;
                setStartup(prev => {
                    if (isPublic && prev.public_company) {
                        return {
                            ...prev,
                            metrics: { ...prev.metrics, cash: updatedCash },
                            public_company: { ...prev.public_company, corporate_portfolio: updatedPortfolio }
                        };
                    }
                    return {
                        ...prev,
                        metrics: { ...prev.metrics, cash: updatedCash },
                        treasury_portfolio: updatedPortfolio
                    };
                });
            }

            // Check if this block buy gave us control
            let finalStocks = updatedStocks;
            const updatedStock = updatedStocks.find(s => s.symbol === stock.symbol);
            if (updatedStock) {
                const newPersonalPortfolio = account === "personal" ? updatedPortfolio : personalPortfolio;
                const newCorporatePortfolio = account === "corporate" ? updatedPortfolio : corporatePortfolio;
                const newOwnership = getPlayerOwnershipPct(stock.symbol, updatedStock, newPersonalPortfolio, newCorporatePortfolio);
                const controlThreshold = getControlThreshold(stock.companyTier || "large_cap");
                const isControlAcquired = newOwnership >= controlThreshold;

                if (isControlAcquired) {
                    finalStocks = updatedStocks.map(s => s.symbol === stock.symbol ? { ...s, isSubsidiary: true } : s);
                    const existingSubs = startup.subsidiaries || [];
                    if (!existingSubs.includes(stock.symbol)) {
                        setStartup(prev => ({
                            ...prev,
                            subsidiaries: [...(prev.subsidiaries || []), stock.symbol]
                        }));
                        toast.success(`🎉 Control Acquired! ${stock.companyName} (${stock.symbol}) is now a subsidiary!`);
                    }
                }
            }
            setMarketStocks(finalStocks);

            addTimelineEvent(
                `📦 Block Trade: Purchased ${formatNumber(blockShares)} shares from ${shareholder.name} (${stock.symbol}) at ${formatMoney(offeredPrice)}/share. Total: ${formatMoney(totalCost)} (${premiumPct}% premium).`,
                month
            );
            toast.success(`Block Trade Executed!`, {
                description: `Acquired ${formatNumber(blockShares)} shares of ${stock.symbol} from ${shareholder.name} for ${formatMoney(totalCost)}.`
            });
        } catch (e: any) {
            toast.error(e.message || "Block trade failed");
        }
    };

    const handleInsiderTipUsed = () => {
        // Enforce cooldown logic (max 2 uses per hour)
        const now = Date.now();
        if (now - lastGeniusResetTime > 60 * 60 * 1000) {
            // Reset if more than an hour has passed
            setLastGeniusResetTime(now);
            setGeniusUsesThisHour(1);
        } else {
            setGeniusUsesThisHour(prev => prev + 1);
        }

        // SEC Risk (5% chance of getting caught)
        if (Math.random() < 0.05) {
            toast.error("🚨 SEC INVESTIGATION TRIGGERED!", {
                description: "Authorities detected your insider trading. You've been fined heavily and your reputation is ruined."
            });
            setFounder(f => ({
                ...f,
                personal_wealth: Math.max(0, (f.personal_wealth || 0) * 0.2), // Lose 80% wealth
                attributes: { ...f.attributes, reputation: 0 }
            }));
            setStartup(s => ({
                ...s,
                metrics: { ...s.metrics, cash: Math.max(0, (s.metrics.cash || 0) * 0.5) } // Lose 50% corporate cash
            }));
            addTimelineEvent(`🚨 SEC Fines: Caught using illegal insider tips. Massive fines levied.`, month);
            return;
        }

        // Pick a random tradeable stock (not player company)
        const eligibleStocks = marketStocks.filter(s => !s.isDelisted && s.symbol !== startup.symbol);
        if (eligibleStocks.length === 0) return;
        const target = eligibleStocks[Math.floor(Math.random() * eligibleStocks.length)];

        setInsiderStockPicks(prev => [...prev, { symbol: target.symbol, monthsLeft: 4 }]);
        toast.success("Insider Tip Received!", {
            description: `Rumor has it that ${target.symbol} is about to surge over the next 3-4 months. Act fast!`
        });
    };

    const handleToggleCfoAutoTrade = () => {
        setStartup(prev => ({
            ...prev,
            cfo_auto_trade_enabled: !prev.cfo_auto_trade_enabled
        }));
        toast.info(`CFO Auto-Trading ${!startup.cfo_auto_trade_enabled ? "enabled" : "disabled"}`);
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
            data: { startup, founder, month, eventsTimeline, competitors, unlockedAchievements, ongoingPrograms, seenEventIds, founderMeta, focusHoursUsed, actionUsageLog, storyState }
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
    const handleImmediateAction = (actionId: string, forceFree: boolean = false) => {
        const def = getActionDef(actionId);
        if (!def) return;
        const ctx: GameContext = { month, startup, founder, m: startup.metrics };
        const { scaledEffects, multiplier, hints } = calcDynamicImpact(def, actionUsageLog, ctx);
        const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
        const energyCost = forceFree ? 0 : def.energyCost;
        const newHoursUsed = focusHoursUsed + energyCost;

        if (!forceFree && newHoursUsed > maxHours) {
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

        // Finalized Toast: Impact + Energy Cost as requested
        toast.success(`${def.label}: Success!`, {
            description: `${parts} · Consumed ${energyCost}h Focus`,
            icon: def.emoji,
            duration: 4000
        });

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
            const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
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

            const fundCost = startup.iap_titan ? 20 : 40;
            const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
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
                // ── Talent Roster: carry over hidden trait + legendary status ──
                traits: [] as import("@/lib/types/database.types").EmployeeTrait[],
                hiddenTrait: pendingCandidate.hiddenTrait,
                isLegendary: pendingCandidate.isLegendary,
                storyQuote: pendingCandidate.storyQuote,
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
            if (pendingCandidate.candId) {
                setRejectedCandidates(prev => [...prev, pendingCandidate.candId as string]); // Remove from list
                setHrCandidates(prev => prev.filter(c => c.candId !== pendingCandidate.candId)); // Filter persistent list
            }
            setSelectedAction("none");
            setPendingCandidate(null);
            setHiringOffer({ salary: 0, equity: 0 });
        } else {
            toast.error("Offer Rejected", { description: result.reason });
            const displayRole = getDisplayRoleName(pendingCandidate.role, false);
            addTimelineEvent(`Personnel: Failed to hire ${displayRole}.`);
            setFocusHoursUsed(curr => curr + 10);
            if (pendingCandidate.candId) {
                setRejectedCandidates(prev => [...prev, pendingCandidate.candId as string]); // Remove from list
                setHrCandidates(prev => prev.filter(c => c.candId !== pendingCandidate.candId)); // Filter persistent list
            }
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


                const dilutionFactor = (100 - equityGiven) / 100;
                ns.capTable = (ns.capTable || [{ name: "Founder", equity: 100, type: "Founder" }]).map((e: any) => ({
                    ...e,
                    equity: parseFloat((e.equity * dilutionFactor).toFixed(1))
                }));

                ns.capTable.push({ name: pendingInvestor.name, equity: parseFloat(equityGiven.toFixed(1)), type: "Investor" });
                if (ns.metrics?.investor_pipeline) {
                    ns.metrics.investor_pipeline = { leads: 0, meetings: 0, term_sheets: 0 };
                }
                return ns;
            });

            toast.success(`Raised ${formatMoney(raised)}!`, { description: `Post-money valuation: ${formatMoney(postMoney)}` });

            analyticsService.logEvent("funding_secured", {
                stage: nextStage,
                raised: raised,
                valuation: postMoney,
                equity_given: equityGiven,
                investor: pendingInvestor.name
            });

            setFocusHoursUsed(curr => curr + 40);
            setSelectedAction("none");
            setPendingInvestor(null);
            setPendingCounterOffer(null);

            // Review prompt at key funding milestones (peak happiness)
            if (nextStage === "Seed Round" || nextStage === "Angel Investment") {
                ReviewTriggers.firstFundingRaise();
            } else if (nextStage === "Series A") {
                ReviewTriggers.seriesARaise();
            }
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

            const dilutionFactor = (100 - equityGiven) / 100;
            ns.capTable = (ns.capTable || [{ name: "Founder", equity: 100, type: "Founder" }]).map((e: any) => ({
                ...e,
                equity: parseFloat((e.equity * dilutionFactor).toFixed(1))
            }));

            ns.capTable.push({ name: pendingInvestor.name, equity: parseFloat(equityGiven.toFixed(1)), type: "Investor" });
            if (ns.metrics?.investor_pipeline) {
                ns.metrics.investor_pipeline = { leads: 0, meetings: 0, term_sheets: 0 };
            }
            return ns;
        });

        addTimelineEvent(`Raised ${nextStage} from ${pendingInvestor.name} (Counter Accepted): ${formatMoney(raised)} at ${formatMoney(postMoney)} post-money!`);
        toast.success(`Deal Closed!`, { description: `Raised ${formatMoney(raised)}` });

        analyticsService.logEvent("funding_secured", {
            stage: nextStage,
            raised: raised,
            valuation: postMoney,
            equity_given: equityGiven,
            investor: pendingInvestor.name,
            is_counter: true
        });

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
            description: "This will hurt morale and you'll lose their specialized skills. Low morale teams might even file a lawsuit.",
            confirmText: "FIRE EMPLOYEE",
            type: "fire",
            onConfirm: () => {
                const newMorale = Math.max(0, startup.metrics.team_morale - 15);
                const hasLegalRisk = newMorale < 30 || Math.random() < 0.15;

                let updatedSuits = [...(startup.active_lawsuits || [])];
                if (hasLegalRisk) {
                    const suit = spawnLawsuit("wrongful_termination", (startup.history?.length || 0) + 1);
                    updatedSuits.push(suit);
                }

                setStartup(s => ({
                    ...s,
                    employees: s.employees?.filter(e => e.id !== id) || [],
                    metrics: { ...s.metrics, team_morale: newMorale, employees: s.metrics.employees - 1 },
                    active_lawsuits: updatedSuits
                }));

                if (hasLegalRisk) {
                    toast.error("Employee Terminated", { description: "Warning: They are threatening a wrongful termination lawsuit." });
                } else {
                    toast.error("Employee Terminated");
                }
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

    const handleAcquireRival = (comp: Competitor) => {
        const isChadly = comp.id === "chadly";
        const isIPO = comp.status === "ipo";
        const premium = isChadly ? 1.25 : isIPO ? 1.15 : 1.0;
        const purchasePrice = Math.floor(comp.valuation * premium);

        if (startup.metrics.cash < purchasePrice) {
            toast.error("Insufficient Funds", { description: `You need ${formatMoney(purchasePrice)} corporate cash to acquire this rival.` });
            return;
        }

        const newStartup = { ...startup };
        newStartup.metrics.cash -= purchasePrice;
        newStartup.metrics.users = (newStartup.metrics.users || 0) + comp.users;

        // Dynamic synergistic valuation pop: +20%!
        newStartup.valuation = Math.floor(newStartup.valuation + comp.valuation * 1.2);

        // Apply dynamic merger integrations on morale, brand, product score
        const risk = comp.integration_risk || "Medium";
        if (risk === "High") {
            newStartup.metrics.team_morale = Math.max(0, (newStartup.metrics.team_morale || 70) - 20);
        } else if (risk === "Medium") {
            newStartup.metrics.team_morale = Math.max(0, (newStartup.metrics.team_morale || 70) - 10);
        } else {
            newStartup.metrics.team_morale = Math.min(100, (newStartup.metrics.team_morale || 70) + 5);
        }

        // Product Quality boost from tech IP (+5 to +15 depending on risk/tech consolidation)
        const productBoost = risk === "Low" ? 15 : risk === "Medium" ? 10 : 5;
        newStartup.metrics.product_quality = Math.min(100, (newStartup.metrics.product_quality || 50) + productBoost);

        // Brand Awareness boost from brand absorption (+10% to +25%)
        const brandBoost = risk === "Low" ? 25 : risk === "Medium" ? 15 : 10;
        newStartup.metrics.brand_awareness = Math.min(100, (newStartup.metrics.brand_awareness || 10) + brandBoost);

        // Add 2% permanent organic growth rate per rival acquired!
        newStartup.metrics.growth_rate = (newStartup.metrics.growth_rate || 1.05) + 0.02;

        // Reorganize competitor under packed subsidiary serialization!
        if (!newStartup.subsidiaries) {
            newStartup.subsidiaries = [];
        }

        const synergy = comp.financial_health === "Profitable"
            ? Math.floor(comp.valuation * 0.006)
            : comp.financial_health === "Burning Cash" ? -Math.floor(comp.valuation * 0.008) : 0;

        const subStr = `${comp.name}::${comp.valuation}::${synergy}::${risk}`;
        newStartup.subsidiaries.push(subStr);

        setStartup(newStartup);

        // Update competitor status to acquired
        const updatedComps = competitors.map(c => {
            if (c.id === comp.id) {
                return { ...c, status: "acquired" as const };
            }
            return c;
        });

        // Replenish so there are always at least 3 active/ipo competitors
        let activeCount = updatedComps.filter(c => c.status === "active" || c.status === "ipo").length;
        const newNews: string[] = [];
        let index = updatedComps.length;
        while (activeCount < 3) {
            const newComp = generateNewCompetitor(index, startup.industry, newStartup.valuation);
            updatedComps.push(newComp);
            activeCount++;
            index++;
            newNews.push(`🏢 RIVAL ENTRY: A new competitor "${newComp.name}" entered the ${newComp.industry} market!`);
        }

        setCompetitors(updatedComps);

        // Timeline event and toast
        if (isChadly) {
            addTimelineEvent(`👑 THE TAKEOVER: Executed a legendary hostile takeover of Chadly's empire "${comp.name}" for ${formatMoney(purchasePrice)}!`, month);
            toast.success("RIVAL DEFEAT: Chadly's empire acquired!", { description: "You have officially conquered your ultimate rival Chadly!" });

            // Trigger Chad's defeat dialog
            setCharacterDialog({
                character: "chad",
                trigger: "chad_acquired",
                title: "💀 \"YOU BOUGHT ME OUT?!\"",
                message: `I... I don't believe it. You raided my cap table, bought out my institutional investors, and executed a hostile takeover?! \n\nFine. You win this round, ${founder.name}. But building an empire is easy—maintaining it is the real war. Enjoy your seat at the top. I'll be watching.`,
                buttonText: "Thanks for the synergy, Chad.",
            });
            setIsCharacterDialogOpen(true);
        } else {
            addTimelineEvent(`🦈 M&A Deal: Bought out competitor "${comp.name}" for ${formatMoney(purchasePrice)} corporate cash. Synergy: ${synergy >= 0 ? '+' : ''}${formatMoney(synergy)}/mo. Morale shift: ${risk === "High" ? '-20' : risk === "Medium" ? '-10' : '+5'}.`, month);
            toast.success("Rival Acquired", { description: `Successfully integrated ${comp.name} as a subsidiary.` });
        }

        newNews.forEach(n => addTimelineEvent(n, month));
    };

    // ── Next Month ─────────────────────────────────────────────────────────────
    const handleRivalryAction = (action: RivalryAction) => {
        const chadly = competitors.find(c => c.id === 'chadly');
        if (!chadly) {
            toast.error("Chadly is currently out of the picture.");
            return;
        }

        if (startup.metrics.cash < action.cashCost) {
            toast.error("Not enough cash!");
            return;
        }

        const maxHours = calcFocusHours(startup.metrics.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
        if (focusHoursUsed + action.energyCost > maxHours * 1.1) {
            toast.error("Not enough focus energy!", { description: "You are too burned out. Advance to next month to refill energy." });
            return;
        }

        // Roll for Success
        const dice = Math.random();
        const isSuccess = dice < action.successRate;

        const outcome = isSuccess
            ? action.effect({ startup, founder, chadly })
            : action.onFailure({ startup, founder, chadly });

        const { newStartup, newFounder, newChadly, message } = outcome;

        setStartup(newStartup);
        setFounder(newFounder);
        setFocusHoursUsed(prev => prev + action.energyCost);
        setCompetitors(prev => prev.map(c => c.id === 'chadly' ? newChadly : c));

        addTimelineEvent(`⚔️ RIVALRY: ${message}`, month);

        if (isSuccess) {
            toast.success(message);
            playSound('success');
        } else {
            toast.error(message, { description: "The attempt backfired." });
            playSound('fail');
        }
    };

    const handleNextMonth = async () => {
        if (isProcessing) return;
        if (startup.outcome && startup.outcome !== "active" && !dismissedEndgame) {
            // Failsafe: if the user somehow clicks this inside a dead state, just re-open the model.
            setIsEndgameOpen(true);
            return;
        }

        setIsProcessing(true);
        setActionCategory(null); // Auto-close any open action sheets (Hire, Strategy, etc) so they don't block modals
        setRejectedCandidates([]);

        try {
            // Ensure the overlay has a frame to render before processing starts
            await new Promise(r => setTimeout(r, 800));

            const nextMonth = month + 1;


            // Process ongoing programs first
            const { startup: spAfter, founder: foAfter, log: progLog } = processOngoingPrograms(ongoingPrograms, month, startup, founder);
            progLog.forEach(l => addTimelineEvent(`🔄 ${l}`, nextMonth));

            // Apply burnout penalty if over-committed from ongoing programs
            const maxEnergy = calcFocusHours(spAfter.metrics.founder_burnout || 0, spAfter.employees || [], (spAfter as any).hasCoFounder, spAfter.iap_caffeine);
            const currentCommitment = ongoingProgramsTotalEnergy(ongoingPrograms);
            if (currentCommitment > maxEnergy) {
                const penalty = (currentCommitment - maxEnergy) * 0.5;
                spAfter.metrics.founder_burnout = Math.min(100, (spAfter.metrics.founder_burnout || 0) + penalty);
                addTimelineEvent(`⚠️ Over-committed! Ongoing programs caused +${penalty.toFixed(1)} founder burnout.`, nextMonth);
            }

            const result = processMonth(foAfter, spAfter, selectedAction);
            const newStartup = result.newStartup;
            result.notices.forEach(n => addTimelineEvent(`⚠️ ${n}`, nextMonth));
            let nextFounder: Founder = { ...foAfter, attributes: { ...foAfter.attributes } };

            // Macro Event & Market Processing
            let currentMacro = newStartup.metrics.active_macro_event;
            const newMacro = checkMacroEventSpawn(currentMacro, nextMonth);
            if (!currentMacro && newMacro) {
                addTimelineEvent(`🌎 MACRO EVENT: ${newMacro.name} - ${newMacro.description}`, nextMonth);
            }
            if (currentMacro && !newMacro) {
                addTimelineEvent(`🌎 MACRO EVENT ENDED: The ${currentMacro.name} has concluded.`, nextMonth);
            }
            newStartup.metrics.active_macro_event = newMacro;

            const heldSymbols = [
                ...(founder.wealth_profile?.portfolio || []).map(p => p.symbol),
                ...(startup.public_company?.corporate_portfolio || startup.treasury_portfolio || []).map(p => p.symbol)
            ];

            const updatedMarket = processMarketMonth(marketStocks, m.current_season || "Normal", newMacro, insiderStockPicks.map(p => p.symbol), heldSymbols);
            
            // Decrement insider picks and remove expired ones
            setInsiderStockPicks(prev => prev.map(p => ({ ...p, monthsLeft: p.monthsLeft - 1 })).filter(p => p.monthsLeft > 0));
            setMarketStocks(updatedMarket);

            // Notify if held stocks have breaking news
            const personalPortfolio = founder.wealth_profile?.portfolio || [];
            const corpPortfolio = newStartup.public_company?.corporate_portfolio || (newStartup as any).treasury_portfolio || [];
            updatedMarket.forEach(stock => {
                if (stock.recentNews) {
                    const heldPersonal = personalPortfolio.some((p: any) => p.symbol === stock.symbol);
                    const heldCorp = corpPortfolio.some((p: any) => p.symbol === stock.symbol);
                    if (heldPersonal || heldCorp) {
                        addTimelineEvent(`🗞️ Market News (${stock.symbol}): ${stock.recentNews}. Stock momentum shifted.`, nextMonth);
                    }
                }
            });

            if (newStartup.public_company) {
                // Keep player company stock in sync with new valuation/sentiment
                const playerStock = updatedMarket.find(s => s.symbol === (newStartup.symbol || "CORP"));
                if (playerStock) {
                    const liveArr = (newStartup.metrics.revenue || 0) * 12;
                    const fairVal = liveArr * 8
                        * ((newStartup.metrics.pmf_score ?? 0) > 80 ? 1.3 : 1.0)
                        * ((newStartup.metrics.growth_rate ?? 0) > 15 ? 1.2 : 1.0);
                    const targetSharePrice = fairVal / newStartup.public_company.shares_outstanding;
                    
                    if (targetSharePrice > 0) {
                        const difference = (targetSharePrice - playerStock.currentPrice) / playerStock.currentPrice;
                        playerStock.currentPrice = playerStock.currentPrice * (1 + Math.max(-0.2, Math.min(0.2, difference * 0.15)));
                        
                        if (playerStock.priceHistory.length > 0) {
                            playerStock.priceHistory[playerStock.priceHistory.length - 1] = playerStock.currentPrice;
                        }
                    }

                    newStartup.public_company.share_price = playerStock.currentPrice;
                    newStartup.valuation = newStartup.public_company.shares_outstanding * playerStock.currentPrice;
                }

                // Check for Stock Split (10-for-1) if price > $1,000
                if (newStartup.public_company.share_price > 1000) {
                    const oldPrice = newStartup.public_company.share_price;
                    newStartup.public_company.shares_outstanding *= 10;
                    newStartup.public_company.float *= 10;
                    newStartup.public_company.share_price /= 10;
                    newStartup.public_company.ipo_price /= 10;
                    newStartup.public_company.eps_last_quarter /= 10;
                    newStartup.public_company.eps_guidance /= 10;
                    newStartup.public_company.consensus_eps /= 10;
                    newStartup.valuation = newStartup.public_company.shares_outstanding * newStartup.public_company.share_price;

                    // Update in marketStocks
                    if (playerStock) {
                        playerStock.sharesOutstanding *= 10;
                        playerStock.currentPrice /= 10;
                        playerStock.priceHistory = playerStock.priceHistory.map(p => p / 10);
                    }

                    // Update player's personal portfolio
                    if (nextFounder.wealth_profile?.portfolio) {
                        nextFounder.wealth_profile.portfolio = nextFounder.wealth_profile.portfolio.map((p: any) => {
                            if (p.symbol === (newStartup.symbol || "CORP")) {
                                return { ...p, shares: p.shares * 10, averageCost: p.averageCost / 10 };
                            }
                            return p;
                        });
                    }

                    // Update corporate portfolio
                    if (newStartup.public_company.corporate_portfolio) {
                        newStartup.public_company.corporate_portfolio = newStartup.public_company.corporate_portfolio.map((p: any) => {
                            if (p.symbol === (newStartup.symbol || "CORP")) {
                                return { ...p, shares: p.shares * 10, averageCost: p.averageCost / 10 };
                            }
                            return p;
                        });
                    }
                    if (newStartup.treasury_portfolio) {
                        newStartup.treasury_portfolio = newStartup.treasury_portfolio.map((p: any) => {
                            if (p.symbol === (newStartup.symbol || "CORP")) {
                                return { ...p, shares: p.shares * 10, averageCost: p.averageCost / 10 };
                            }
                            return p;
                        });
                    }

                    // Update active 10b5-1 plans
                    if (nextFounder.wealth_profile?.active_10b51_plans) {
                        nextFounder.wealth_profile.active_10b51_plans = nextFounder.wealth_profile.active_10b51_plans.map((p: any) => {
                            return {
                                ...p,
                                monthlySellAmount: p.monthlySellAmount * 10,
                                sharesToSellTotal: p.sharesToSellTotal * 10,
                                sharesSoldSoFar: p.sharesSoldSoFar * 10
                            };
                        });
                    }

                    // Update active option plans
                    if (nextFounder.wealth_profile?.vesting_options) {
                        nextFounder.wealth_profile.vesting_options = nextFounder.wealth_profile.vesting_options.map((opt: any) => {
                            return {
                                ...opt,
                                monthlyVestAmount: opt.monthlyVestAmount * 10,
                                totalOptions: opt.totalOptions * 10,
                                vestedOptions: opt.vestedOptions * 10,
                                strikePrice: opt.strikePrice / 10
                            };
                        });
                    }

                    addTimelineEvent(
                        `📢 STOCK SPLIT: Board executed a 10-for-1 stock split as the share price crossed $1,000 (was $${oldPrice.toFixed(2)}). Outstanding shares multiplied by 10, share price divided to $${newStartup.public_company.share_price.toFixed(2)}/share to increase market liquidity.`,
                        nextMonth
                    );
                    toast.info("📢 10-for-1 Stock Split Executed!", {
                        description: `Your stock split from $${oldPrice.toFixed(2)} to $${newStartup.public_company.share_price.toFixed(2)} per share. Shareholder positions multiplied by 10.`
                    });
                }

                // --- POST-IPO MONTHLY FINANCE PROCESSING ---
                const pub = newStartup.public_company;
                const sharePrice = pub.share_price || 0;

                // 1. Process 10b5-1 plans
                const activePlans = nextFounder.wealth_profile?.active_10b51_plans || [];
                if (activePlans.length > 0) {
                    nextFounder.wealth_profile.active_10b51_plans = activePlans.map((p: any) => {
                        const remainingToSell = p.sharesToSellTotal - p.sharesSoldSoFar;
                        const sellCount = Math.min(p.monthlySellAmount, remainingToSell);
                        if (sellCount <= 0) return p;

                        const proceeds = Math.floor(sellCount * sharePrice);
                        nextFounder.personal_wealth = (nextFounder.personal_wealth || 0) + proceeds;
                        p.sharesSoldSoFar += sellCount;
                        p.monthsRemaining -= 1;

                        // Deduct equity from Founder in Cap Table
                        const founderNode = newStartup.capTable?.find((e: any) => e.type === "Founder");
                        if (founderNode) {
                            const totalShares = pub.shares_outstanding || 100_000_000;
                            const currentShares = (founderNode.equity / 100) * totalShares;
                            const newShares = Math.max(0, currentShares - sellCount);
                            founderNode.equity = (newShares / totalShares) * 100;
                        }

                        addTimelineEvent(`📄 10b5-1 Plan: Sold ${formatNumber(sellCount)} shares at ${formatMoney(sharePrice)}/sh, generating ${formatMoney(proceeds)} personal cash.`, nextMonth);

                        // Aggressive insider selling pressure
                        if (p.isAggressive) {
                            pub.share_price *= 0.985; // 1.5% downward pressure
                            addTimelineEvent(`📉 Heavy insider selling under Aggressive 10b5-1 plan puts downward pressure on stock price (-1.5%).`, nextMonth);
                        }

                        return p;
                    }).filter((p: any) => p.monthsRemaining > 0 && p.sharesSoldSoFar < p.sharesToSellTotal);
                }

                // 2. Process Margin Loan interest
                const currentLoan = nextFounder.wealth_profile?.margin_loan_balance || 0;
                if (currentLoan > 0) {
                    const monthlyInterest = Math.floor((currentLoan * 0.06) / 12); // 6% APR
                    nextFounder.personal_wealth = Math.max(0, (nextFounder.personal_wealth || 0) - monthlyInterest);
                    addTimelineEvent(`💳 Charged ${formatMoney(monthlyInterest)} margin loan interest (6% APR).`, nextMonth);

                    // Margin Call Check! If LTV > 55%
                    const myShares = newStartup.capTable?.find((e: any) => e.type === "Founder")?.equity || 20;
                    const totalShares = pub.shares_outstanding || 100_000_000;
                    const myShareCount = (myShares / 100) * totalShares;
                    const myStockValue = myShareCount * pub.share_price;

                    const personalPortfolioValue = nextFounder.wealth_profile?.portfolio?.reduce((acc: number, p: any) => {
                        const stockPrice = updatedMarket.find((s: any) => s.symbol === p.symbol)?.currentPrice || p.averageCost;
                        return acc + (p.shares * stockPrice);
                    }, 0) || 0;

                    const totalCollateral = myStockValue + personalPortfolioValue;
                    const ltv = totalCollateral > 0 ? (currentLoan / totalCollateral) : 1;

                    if (ltv > 0.55) { // Margin call triggers if LTV drops past 55%
                        const forceRepay = currentLoan;
                        const sharesToLiquidate = forceRepay / sharePrice;

                        // Forcibly sell founder's shares to repay loan
                        const founderNode = newStartup.capTable?.find((e: any) => e.type === "Founder");
                        if (founderNode) {
                            const newShares = Math.max(0, ((founderNode.equity / 100) * totalShares) - sharesToLiquidate);
                            founderNode.equity = (newShares / totalShares) * 100;
                        }

                        nextFounder.wealth_profile.margin_loan_balance = 0;
                        addTimelineEvent(`🚨 MARGIN CALL! Declining stock price pushed LTV to ${(ltv * 100).toFixed(1)}%. Liquidated ${formatNumber(sharesToLiquidate)} shares to clear margin balance.`, nextMonth);
                        toast.error("🚨 Margin Call Triggered", { description: "Your shares were liquidated to repay your margin loan." });
                    }
                }

                // 3. Process Corporate Debt interest and principal repayment
                const debts = pub.corporate_debt || [];
                if (debts.length > 0) {
                    const activeDebts = [] as any[];
                    for (const debt of debts) {
                        const interest = Math.floor((debt.principal * debt.interestRate) / 12);
                        newStartup.metrics.cash -= interest;
                        debt.monthsRemaining -= 1;
                        addTimelineEvent(`🏦 Paid ${formatMoney(interest)} interest on Corporate Bond [${debt.label}].`, nextMonth);

                        if (debt.monthsRemaining <= 0) {
                            newStartup.metrics.cash -= debt.principal;
                            addTimelineEvent(`🏛️ Corporate Bond [${debt.label}] matured! Principal ${formatMoney(debt.principal)} repaid.`, nextMonth);
                        } else {
                            activeDebts.push(debt);
                        }
                    }
                    pub.corporate_debt = activeDebts;

                    if (newStartup.metrics.cash < 0) {
                        newStartup.outcome = "bankrupt";
                        setIsEndgameOpen(true);
                        addTimelineEvent(`🚨 DEFAULT! Startup defaulted on corporate bond maturity and declared bankruptcy.`, nextMonth);
                        toast.error("🚨 Corporate Default", { description: "You defaulted on mature debt payments!" });
                    }
                }

                // 4. Lobbying score benefits
                const lobbyingScore = pub.lobbying_score || 0;
                if (lobbyingScore >= 70) {
                    // Tax Credit: Unlocks +15% revenue cash flow bonus
                    const subsidy = Math.floor((newStartup.metrics.revenue || 0) * 0.15);
                    if (subsidy > 0) {
                        newStartup.metrics.cash += subsidy;
                        addTimelineEvent(`🏛️ Received ${formatMoney(subsidy)} federal R&D Tax Credit (Regulatory Capture perk).`, nextMonth);
                    }
                }
            }

            // 3.5 Process Subsidiaries — per-entity P&L (Pre-IPO & Post-IPO)
            const subsList = newStartup.subsidiaries || newStartup.public_company?.subsidiaries || [];
            if (subsList.length > 0) {
                let totalNetIncome = 0;
                const updatedSubs: string[] = [];

                subsList.forEach((subStr: string) => {
                    const parsed = parseSubsidiary(subStr);
                    
                    // Check if listed
                    const listedStock = marketStocks?.find(s => (s.companyName === parsed.name || s.symbol === parsed.name || s.symbol === subStr) && !s.isDelisted);
                    const isListed = !!listedStock;

                    let newRevenue = parsed.revenue;
                    let newExpenses = parsed.expenses;
                    let newVal = parsed.valuation;

                    if (isListed) {
                        // Synced with public stock price and valuation
                        newVal = listedStock.currentPrice * listedStock.sharesOutstanding;
                        const pe = listedStock.peRatio && Math.abs(listedStock.peRatio) > 0 ? listedStock.peRatio : 20;
                        const annualNetIncome = newVal / pe;
                        const netIncomeVal = Math.round(annualNetIncome / 12);
                        const annualRevenue = newVal / 8;
                        newRevenue = Math.round(annualRevenue / 12);
                        newExpenses = Math.max(0, newRevenue - netIncomeVal);
                    } else {
                        // ── Per-entity independent growth/decay (for unlisted) ──────────────────────────
                        const netIncome = parsed.revenue - parsed.expenses;
                        if (netIncome > 0) {
                            // Profitable entity: revenue grows 0.5–1.5%/mo, costs creep up 0.2–0.6%/mo
                            const revGrowth = 0.005 + Math.random() * 0.01;
                            const costCreep = 0.002 + Math.random() * 0.004;
                            newVal = Math.floor(parsed.valuation * (1 + revGrowth));
                            newRevenue = Math.floor(parsed.revenue * (1 + revGrowth));
                            newExpenses = Math.floor(parsed.expenses * (1 + costCreep));
                        } else if (netIncome < 0) {
                            // Losing money: valuation decays, expenses keep rising
                            const decay = 0.01 + Math.random() * 0.01;
                            const costBloat = 0.003 + Math.random() * 0.005;
                            newVal = Math.max(1000000, Math.floor(parsed.valuation * (1 - decay)));
                            newExpenses = Math.floor(parsed.expenses * (1 + costBloat));
                        }
                    }

                    const newNetIncome = newRevenue - newExpenses;
                    if (!isListed) {
                        totalNetIncome += newNetIncome;
                    }

                    // Per-entity quarterly P&L snapshot in timeline
                    if (nextMonth % 3 === 0) {
                        const nameLabel = isListed ? `${parsed.name} (Listed)` : parsed.name;
                        addTimelineEvent(
                            newNetIncome >= 0
                                ? `🏢 ${nameLabel}: Revenue ${formatMoney(newRevenue)}/mo · Expenses ${formatMoney(newExpenses)}/mo · Net +${formatMoney(newNetIncome)}/mo`
                                : `🏢 ${nameLabel}: Revenue ${formatMoney(newRevenue)}/mo · Expenses ${formatMoney(newExpenses)}/mo · Net Loss ${formatMoney(newNetIncome)}/mo`,
                            nextMonth
                        );
                    }

                    updatedSubs.push(serializeSubsidiary({
                        name: parsed.name,
                        valuation: newVal,
                        revenue: newRevenue,
                        expenses: newExpenses,
                        integrationRisk: parsed.integrationRisk,
                        dividendRatio: parsed.dividendRatio,
                    }));
                });

                newStartup.subsidiaries = updatedSubs;
                if (newStartup.public_company) {
                    newStartup.public_company.subsidiaries = updatedSubs;
                }
                // Parent receives consolidated net income from all unlisted subsidiaries monthly
                newStartup.metrics.cash += totalNetIncome;
                if (totalNetIncome !== 0) {
                    addTimelineEvent(
                        totalNetIncome >= 0
                            ? `💼 Consolidated P&L: Unlisted subsidiaries contributed +${formatMoney(totalNetIncome)} net income to corporate treasury.`
                            : `💼 Consolidated P&L: Unlisted subsidiaries net loss of ${formatMoney(Math.abs(totalNetIncome))} drained corporate treasury.`,
                        nextMonth
                    );
                }

                // ── QUARTERLY DIVIDENDS from Listed Subsidiaries ──────────────────
                // Every 3 months, listed (public) subsidiaries distribute dividends
                // to the parent company proportional to ownership stake.
                if (nextMonth % 3 === 0 && marketStocks) {
                    const corpPortfolio = newStartup.public_company?.corporate_portfolio || newStartup.treasury_portfolio || [];
                    let totalDividendReceived = 0;

                    updatedSubs.forEach((subStr: string) => {
                        const parsed = parseSubsidiary(subStr);
                        
                        // Only listed subsidiaries (those present in marketStocks)
                        const listedStock = marketStocks.find(s => (s.companyName === parsed.name || s.symbol === parsed.name || s.symbol === subStr) && !s.isDelisted);
                        if (!listedStock) return;

                        const quarterlyNetIncome = parsed.netIncome * 3;
                        if (quarterlyNetIncome <= 0) return;

                        // Parent ownership via corporate portfolio
                        const corpPos = corpPortfolio.find(p => p.symbol === listedStock.symbol);
                        const parentShares = corpPos?.shares || 0;
                        if (parentShares <= 0) return;

                        const parentOwnershipFraction = parentShares / listedStock.sharesOutstanding;
                        // Dividend per share = (quarterly net income × payout ratio) / sharesOutstanding
                        const dividendPerShare = (quarterlyNetIncome * parsed.dividendRatio) / listedStock.sharesOutstanding;
                        const dividendReceived = Math.floor(parentShares * dividendPerShare);
                        if (dividendReceived <= 0) return;

                        totalDividendReceived += dividendReceived;
                        addTimelineEvent(
                            `💰 Dividend: ${parsed.name} (${listedStock.symbol}) — Q net income ${formatMoney(quarterlyNetIncome)} → $${dividendPerShare.toFixed(4)}/share. Parent received ${formatMoney(dividendReceived)} (${(parentOwnershipFraction * 100).toFixed(1)}% stake, ${(parsed.dividendRatio * 100).toFixed(0)}% payout).`,
                            nextMonth
                        );
                    });

                    if (totalDividendReceived > 0) {
                        newStartup.metrics.cash += totalDividendReceived;
                        toast.success(`💰 Quarterly Dividends Received!`, {
                            description: `Collected ${formatMoney(totalDividendReceived)} in subsidiary dividends.`
                        });
                    }
                }
            }

            // Chadly Dynamic IPO
            if (newStartup.metrics.chadly_ipo_readiness === undefined) {
                newStartup.metrics.chadly_ipo_readiness = 0;
            }
            newStartup.metrics.chadly_ipo_readiness += (Math.random() * 5);

            if (newStartup.metrics.chadly_ipo_readiness > 100 && !updatedMarket.find(s => s.symbol === "CHAD")) {
                addTimelineEvent(`🚨 RIVAL IPO: Chad Ventures has gone public!`, nextMonth);
                updatedMarket.push({
                    symbol: "CHAD",
                    companyName: "Chad Ventures",
                    sector: "Technology",
                    currentPrice: 85.00 + (Math.random() * 40),
                    sharesOutstanding: 150_000_000,
                    peRatio: 45,
                    momentum: 0.1,
                    volatility: 0.08,
                    rsi: 60,
                    priceHistory: []
                });
                setMarketStocks(updatedMarket);
            }

            // --- IPO PROGRESSION ---
            if (newStartup.ipo_stage && newStartup.ipo_stage > 0 && newStartup.ipo_stage < 4) {
                newStartup.ipo_stage += 1;
                const IPO_MESSAGES = [
                    "",
                    "📝 Pre-IPO Planning complete. CFO has set up data rooms & financial audits.",
                    "📄 S-1 Filing submitted to SEC. Roadshow begins next month.",
                    "💰 Roadshow complete. Select your pricing tier in the Funding tab before IPO Day!",
                    "🏛️ IPO DAY! The opening bell is ringing!"
                ];
                addTimelineEvent(IPO_MESSAGES[newStartup.ipo_stage], nextMonth);

                if (newStartup.ipo_stage === 4) {
                    // Resolve IPO subscription pricing
                    const priceMult = (newStartup as any).ipo_price_mult ?? 8;
                    const liveArr = (newStartup.metrics.revenue || 0) * 12;
                    const targetVal = liveArr * priceMult;
                    const fairVal = liveArr * 8
                        * ((newStartup.metrics.pmf_score ?? 0) > 80 ? 1.3 : 1.0)
                        * ((newStartup.metrics.growth_rate ?? 0) > 15 ? 1.2 : 1.0);
                    const ratio = fairVal / Math.max(1, targetVal);

                    let finalValuation: number;
                    let ipoEventMsg: string;
                    if (ratio >= 1.5) {
                        finalValuation = Math.floor(targetVal * 1.5);
                        ipoEventMsg = `🚀 IPO OVERSUBSCRIBED 2×! Stock popped +50% on listing day. Final market cap: ${formatMoney(finalValuation)}`;
                    } else if (ratio >= 1.2) {
                        finalValuation = targetVal;
                        ipoEventMsg = `✅ IPO Fully Subscribed at target. Market cap: ${formatMoney(finalValuation)}`;
                    } else if (ratio >= 0.8) {
                        finalValuation = Math.floor(targetVal * 0.85);
                        ipoEventMsg = `⚠️ IPO Partially Subscribed. Priced at a 15% discount. Market cap: ${formatMoney(finalValuation)}`;
                    } else {
                        finalValuation = Math.floor(targetVal * 0.60);
                        ipoEventMsg = `📉 IPO Undersubscribed. Priced at a 40% discount to attract buyers. Market cap: ${formatMoney(finalValuation)}`;
                    }

                    const founderEquityPct = (newStartup.capTable?.find((e: any) => e.type === "Founder")?.equity ?? 20) / 100;
                    const cashRaised = Math.floor(finalValuation * 0.20); // 20% float
                    newStartup.valuation = finalValuation;
                    newStartup.metrics.cash = (newStartup.metrics.cash || 0) + cashRaised;

                    addTimelineEvent(ipoEventMsg, nextMonth);
                    addTimelineEvent(`💵 Raised ${formatMoney(cashRaised)} from public float (20%). Your stake is worth ${formatMoney(Math.floor(finalValuation * founderEquityPct))}.`, nextMonth);

                    ReviewTriggers.ipoDay();
                    playSound("success");

                    // Scale shares outstanding so that the initial share price starts at a realistic $50.00/share
                    const targetSharePrice = 50;
                    const initialShares = Math.max(10_000_000, Math.floor(finalValuation / targetSharePrice));
                    const initialFloat = Math.floor(initialShares * 0.20);
                    const finalSharePrice = finalValuation / initialShares;

                    newStartup.public_company = {
                        shares_outstanding: initialShares,
                        float: initialFloat,
                        share_price: finalSharePrice,
                        ipo_price: finalSharePrice,
                        eps_last_quarter: ((newStartup.metrics.net_profit || 0) * 3) / initialShares,
                        eps_guidance: (((newStartup.metrics.net_profit || 0) * 3) * 1.1) / initialShares,
                        consensus_eps: (((newStartup.metrics.net_profit || 0) * 3) * 1.05) / initialShares,
                        buyback_authorized: 0,
                        short_interest: Math.floor(Math.random() * 10), // 0-10% starting short interest
                        analyst_ratings: [
                            { analystName: "Morgan P. Chase", firm: "Goldman Sachs Prime", rating: "Buy", priceTarget: finalSharePrice * 1.3, lastUpdated: nextMonth },
                            { analystName: "Sarah Weinstein", firm: "Morgan Capital", rating: "Hold", priceTarget: finalSharePrice * 1.05, lastUpdated: nextMonth }
                        ],
                        quarterly_beats: 0,
                        quarterly_misses: 0,
                        lobbying_score: 0,
                        corporate_portfolio: [],
                        corporate_debt: [],
                        subsidiaries: []
                    };

                    const ipoFounderTake = Math.floor(cashRaised * 0.10); // 10% secondary liquidity
                    const newFounder = {
                        ...founder,
                        personal_wealth: (founder.personal_wealth || 0) + ipoFounderTake,
                    };

                    const playerSymbol = newStartup.symbol || "CORP";
                    const newMarketTemplate = initializeMarketStocks(playerSymbol, finalSharePrice, newStartup.name);
                    const playerStock = newMarketTemplate.find(s => s.symbol === playerSymbol);
                    
                    setMarketStocks(prev => {
                        if (prev.length > 0 && playerStock) {
                            return [playerStock, ...prev.filter(s => s.symbol !== playerSymbol)];
                        }
                        return newMarketTemplate;
                    });

                    setFounder(newFounder);
                    setStartup(newStartup);
                    setShowPostIpoCinematic(true);

                    // Trigger the cinematic victory screen
                    newStartup.outcome = "ipo";
                    setIsEndgameOpen(true);

                    setTerminalTab("operations");
                    setIsProcessing(false);

                    analyticsService.logEvent("ipo_success", {
                        valuation: finalValuation,
                        payout: ipoFounderTake,
                        raised: cashRaised,
                        industry: newStartup.industry
                    });
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

            // Sam Mentor Advice Trigger (legacy educational advice only)
            if (isOnline) {
                const samAlert = getEducationalAdvice(newStartup, founder);
                if (samAlert && !(storyState.seenTriggers || []).includes(samAlert.trigger ?? "")) {
                    setSamAdvice(samAlert);
                    playSound("popup");
                    setIsSamModalOpen(true);
                }
            }

            // ── SAM & CHAD STORYLINE ENGINE ──
            const justFundraised = ((newStartup as any).funding_rounds?.length ?? 0) > ((startup as any).funding_rounds?.length ?? 0);
            const storyDialog = getStorylineDialog(
                nextMonth,
                {
                    valuation: newStartup.valuation ?? 0,
                    users: newStartup.metrics.users ?? 0,
                    cash: newStartup.metrics.cash ?? 0,
                    runway: newStartup.metrics.runway ?? 0,
                    burnout: newStartup.metrics.founder_burnout ?? 0,
                    growth_rate: newStartup.metrics.growth_rate ?? 0,
                    net_profit: newStartup.metrics.net_profit ?? 0,
                },
                competitors,
                storyState,
                justFundraised
            );

            // --- ANALYTICS: Track Monthly Metrics ---
            analyticsService.trackMonthlyMetrics({
                month: nextMonth,
                arr: (newStartup.metrics.revenue || 0) * 12,
                valuation: newStartup.valuation || 0,
                cash: newStartup.metrics.cash || 0,
                users: newStartup.metrics.users || 0,
                burnout: newStartup.metrics.founder_burnout || 0,
                industry: newStartup.industry
            });

            if (storyDialog && !(storyState.seenTriggers || []).includes(storyDialog.trigger)) {
                // Log the storyline encounter to the timeline
                const encounterText = storyDialog.character === "chad"
                    ? `⚔️ Rival Encounter: Chadly ${storyDialog.title || "challenged you"}.`
                    : `💡 Mentor Guidance: Sam ${storyDialog.title || "shared some advice"}.`;
                addTimelineEvent(encounterText, nextMonth);

                setTimeout(() => {
                    setCharacterDialog(storyDialog);
                    setIsCharacterDialogOpen(true);
                    playSound("popup");
                    // If Sam dialog just fired, reset chadMustRespondNext
                    if (storyDialog.character === "sam") {
                        setStoryState(prev => ({ ...prev, chadMustRespondNext: false }));
                    }
                }, 800); // slight delay so month-end summary settles first
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
                setIsEndgameOpen(true); setIsProcessing(false);
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
                setIsEndgameOpen(true); setIsProcessing(false);
                return;
            }

            // Random events (AI First, Fallback to Predefined)
            // Mutex: Don't trigger random events if a storyline dialog is currently being shown

            // Competitors Simulation (CRITICAL: Must happen before AI/Rivalry logic)
            const { updated, news, rivalActions } = simulateCompetitors(competitors, newStartup.metrics.users, newStartup.valuation);
            setCompetitors(updated);
            news.forEach(n => addTimelineEvent(n, nextMonth));
            const chadlyComp = updated.find(c => c.id === "chadly");

            // --- AI & EXTERNAL EFFECTS (Parallelized) ---
            // Trigger AI event and Chad banter simultaneously

            let ev: GameEvent | null = null;
            let aiBanter: any = null;

            if (!storyDialog && isOnline && process.env.NEXT_PUBLIC_OPENAI_API_KEY && process.env.NEXT_PUBLIC_OPENAI_API_KEY !== "dummy") {
                try {
                    const [aiEventResult, aiBanterResult] = await Promise.all([
                        generateAIEvent(newStartup, founder, seenEventIds),
                        chadlyComp ? generateChadBanter(newStartup, founder, chadlyComp) : Promise.resolve(null)
                    ]);

                    if (aiEventResult) ev = aiEventResult as GameEvent;
                    aiBanter = aiBanterResult;
                } catch (e) {
                    console.warn("AI Parallel generation failed", e);
                }
            }

            // Fallback to local random event if AI failed or timed out
            if (!ev && !storyDialog) {
                ev = getRandomEvent(newStartup.phase, seenEventIds, newStartup.scenario);
            }

            if (ev) {
                playSound("popup");
                setActiveEvent(ev);
                if (ev.event_id) setSeenEventIds(prev => [...prev, ev.event_id!]);
                else if (ev.title) setSeenEventIds(prev => [...prev, ev.title]);
            }


            rivalActions.forEach(({ action, competitorName }) => {
                if (competitorName.toLowerCase().includes("chadly")) {
                    setChadAdvice({
                        title: "⚔️ CHADLY ATTACKS!",
                        message: aiBanter?.banter
                            ? `"${aiBanter.banter}"\n\nChadly ${aiBanter.attackDescription || action.description}`
                            : `"${(action as any).banter || ''}"\n\nChadly just ${action.description}`,
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
                    newStartup.metrics.employees = newStartup.employees.length;

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


            // 1.6. Executive Stock Options Vesting
            if (newStartup.public_company && nextFounder.wealth_profile?.vesting_options?.length) {
                let totalVestedThisMonth = 0;
                nextFounder.wealth_profile.vesting_options.forEach(opt => {
                    if (opt.monthsRemaining > 0) {
                        const vest = Math.min(opt.monthlyVestAmount, opt.totalOptions - opt.vestedOptions);
                        opt.vestedOptions += vest;
                        opt.monthsRemaining -= 1;
                        totalVestedThisMonth += vest;
                    }
                });
                if (totalVestedThisMonth > 0) {
                    addTimelineEvent(`🎲 Executive Options: Vested +${formatNumber(totalVestedThisMonth)} stock options this month.`, nextMonth);
                }
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
            // Do NOT call setFounder({...foAfter}) here — nextFounder already has all lifestyle/margin/asset changes applied above.
            setSelectedAction("none");
            const committedEnergy = ongoingProgramsTotalEnergy(ongoingPrograms);
            setFocusHoursUsed(committedEnergy);
            setActionUsageLog(prev => ({ thisMonth: {}, lastUsedMonth: prev.lastUsedMonth }));
            setMnaTargets([]);

            // --- PILLAR 2: EARNINGS CALL ---
            if (newStartup.public_company && nextMonth % 3 === 0) {
                // Determine new actual EPS for the quarter before the call
                const quarterlyProfit = (newStartup.metrics.net_profit || 0) * 3;
                const newEps = quarterlyProfit / newStartup.public_company.shares_outstanding;
                newStartup.public_company.eps_last_quarter = newEps;
                setIsEarningsCallOpen(true);
            }


            if (nextMonth % 3 === 0 && !isPremium) {
                if (isOnline) {
                    await adService.showInterstitial();
                } else {
                    // Offline bypass attempt: queue the ad for when they reconnect
                    setInterstitialAdOwed(true);
                    toast.info("Offline Mode", { description: "Mandatory check-in queued for next connection." });
                }
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
        const multiplier = eventMultiplier;
        const impactString = generateImpactSentence(choice.text, choice.effects, multiplier, activeEvent?.title);

        // Explicit allowlists — avoids 'key in obj' failing for uninitialized optional fields
        const METRIC_KEYS = new Set([
            'cash', 'burn_rate', 'revenue', 'users', 'paid_users', 'growth_rate',
            'brand_awareness', 'employees', 'engineers', 'marketers', 'sales',
            'team_morale', 'technical_debt', 'reliability', 'innovation', 'pmf_score',
            'product_quality', 'feature_completion', 'founder_burnout', 'founder_health',
            'sleep_quality', 'founder_salary', 'option_pool',
            'culture_score', 'pricing', 'unit_sales', 'cac', 'ltv', 'aov',
            'cogs', 'opex', 'net_profit'
        ]);
        const ATTR_KEYS = new Set([
            'intelligence', 'technical_skill', 'leadership', 'networking',
            'marketing_skill', 'sales_skill', 'risk_appetite', 'stress_tolerance', 'reputation',
        ]);

        setStartup(prevStartup => {
            const metrics = { ...prevStartup.metrics };

            Object.entries(choice.effects).forEach(([key, val]) => {
                const numVal = Number(val);
                if (isNaN(numVal)) return;

                if (!METRIC_KEYS.has(key)) return; // not a metric key, skip

                let adjustedVal = numVal;
                if (['cash', 'burn_rate', 'revenue'].includes(key)) {
                    adjustedVal *= multiplier;
                }

                const cur = ((metrics as any)[key] as number) || 0;
                (metrics as any)[key] = cur + adjustedVal;
            });

            // Clamp metrics
            ['team_morale', 'reliability', 'product_quality', 'pmf_score', 'founder_burnout', 'founder_health', 'sleep_quality', 'innovation'].forEach(k => {
                if ((metrics as any)[k] !== undefined) {
                    (metrics as any)[k] = Math.min(100, Math.max(0, (metrics as any)[k]));
                }
            });
            ['users', 'revenue', 'cash', 'brand_awareness', 'technical_debt', 'burn_rate'].forEach(k => {
                if ((metrics as any)[k] !== undefined) {
                    (metrics as any)[k] = Math.max(0, (metrics as any)[k]);
                }
            });

            return { ...prevStartup, metrics };
        });

        setFounder(prevFounder => {
            const attrs = { ...prevFounder.attributes };
            Object.entries(choice.effects).forEach(([key, val]) => {
                const numVal = Number(val);
                if (!isNaN(numVal) && ATTR_KEYS.has(key)) {
                    (attrs as any)[key] = Math.min(100, Math.max(0, ((attrs as any)[key] || 0) + numVal));
                }
            });
            return { ...prevFounder, attributes: attrs };
        });

        addTimelineEvent(impactString);
    };

    const m = startup.metrics;
    const { monthlyRevenue: liveRevenue, monthlyCogs, monthlyOpex, opexBreakdown } = calculateFinancials(startup, founder);
    const liveNetProfit = liveRevenue - monthlyCogs - monthlyOpex;
    const profitable = liveNetProfit >= 0;
    const liveBurn = liveNetProfit < 0 ? Math.abs(liveNetProfit) : 0;
    const liveRunway = liveBurn > 0 ? Math.floor(m.cash / liveBurn) : Infinity;
    const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || [], (startup as any).hasCoFounder, startup.iap_caffeine);
    const energyPct = Math.min(100, (focusHoursUsed / maxHours) * 100);

    return (
        <div className="min-h-[100dvh] flex flex-col h-[100dvh] overflow-hidden pt-0 sm:pt-0 bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none">

            {/* GLOBAL BLOCKING OVERLAY (DURING SIMULATION) */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[10000] flex flex-col items-center justify-center p-6 text-center"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            {/* Inner Spin */}
                            <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            {/* Outer Pulse */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 border-8 border-emerald-500/10 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Landmark className="w-8 h-8 text-emerald-400" />
                            </div>
                        </div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Simulating Month {month}...</h3>
                            <p className="text-emerald-400/80 font-black text-xs uppercase tracking-widest animate-pulse">Running GTM Strategy • Synthesizing Market Data</p>
                        </motion.div>

                        {/* Status Dots */}
                        <div className="flex gap-2 mt-8">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 1, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP DASHBOARD SECTION (Elevated during Steps 1+) */}
            <div className="shrink-0 flex flex-col" style={{ position: "relative", zIndex: storyState.tutorialStep >= 1 ? 50 : 1 }}>
                {/* HEADER */}
                <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between shadow-sm" style={{ paddingBottom: '10px', paddingTop: isNative ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '8px' }}>



                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100" style={{ background: `${founderMeta.brandColor}15` }}>
                            {founderMeta.logo}
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{startup.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Month {month} · {startup.industry} {isPremium && <span className="text-indigo-600 ml-1">🚀 PRESTIGE</span>}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">

                        {(() => {
                            const hourAgo = currentTime - 60 * 60 * 1000;
                            const validConsults = (samConsults || []).filter(t => t > hourAgo);
                            const isLimited = validConsults.length >= 2;

                            return (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!isOnline}
                                    className={`h-7 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm px-2 pr-2.5 ${!isOnline ? 'bg-slate-50 border-slate-200 text-slate-400 grayscale' : 'bg-violet-600 border-violet-700 text-white hover:bg-violet-700 dark:bg-violet-500 dark:border-violet-400'}`}
                                    onClick={() => {
                                        const now = Date.now();
                                        const hourAgo = now - 60 * 60 * 1000;
                                        const validConsults = samConsults.filter(t => t > hourAgo);

                                        if (validConsults.length >= 2) {
                                            const nextAvail = Math.min(...validConsults) + 60 * 60 * 1000;
                                            setConfirmDialog({
                                                open: true,
                                                title: "🧠 Sam is Processing...",
                                                description: `Even a super-mentor needs a break! Sam is synthesizing market data. Check back in ${formatCooldown(nextAvail, currentTime)}.`,
                                                confirmText: "LET HIM COOK",
                                                onConfirm: () => { }
                                            });
                                            return;
                                        }

                                        const consultAction = () => {
                                            setSamConsults([...validConsults, now]);
                                            setStoryState(prev => ({ ...prev, hasConsultedSam: true }));
                                            const advice = getConsultationAdvice(startup);
                                            const dialog = getSamConsultDialog({
                                                title: advice.title,
                                                message: advice.message,
                                                buttonText: advice.buttonText || "THANKS, SAM 🏄",
                                            }, storyState.hasConsultedSam);
                                            setCharacterDialog(dialog);
                                            setIsCharacterDialogOpen(true);
                                        };

                                        if (isPremium) {
                                            consultAction();
                                        } else {
                                            adService.showRewardedAd(consultAction, 'mentor');
                                        }
                                    }}
                                >
                                    <div className="w-4 h-4 rounded-full overflow-hidden border border-white/20 shrink-0">
                                        <img src="/characters/sam_mentor.png" alt="Sam" className="w-full h-full object-cover scale-125" />
                                    </div>
                                    {isLimited ? (
                                        <span className="text-white font-bold ml-0.5">{formatCooldown(validConsults[0] + 60 * 60 * 1000, currentTime)}</span>
                                    ) : (
                                        <span className="ml-0.5">SAM</span>
                                    )}
                                </Button>
                            );
                        })()}

                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black px-2.5 py-1 rounded-full shrink-0">{formatMoney(m.cash)}</div>
                        <button
                            onClick={() => setIsStoreOpen(true)}
                            className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-800 flex items-center justify-center transition-colors shadow-sm shrink-0"
                            title="Premium Store"
                        >
                            <Sparkles className="h-4 w-4" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center justify-center transition-colors">
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
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-indigo-50 focus:text-indigo-600 font-bold transition-colors" onClick={() => handleResetGame()}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> New Game
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-slate-50 dark:focus:bg-slate-800/50 focus:text-slate-800 dark:focus:text-slate-200 font-bold transition-colors text-slate-700 dark:text-slate-200" onClick={(e) => {
                                    e.preventDefault();
                                    const newMute = toggleAudioMute();
                                    setSfxEnabled(!newMute);
                                    if (!newMute) playSound("click");
                                }}>
                                    {sfxEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />} Sound Effects: {sfxEnabled ? "ON" : "OFF"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-indigo-50 dark:focus:bg-indigo-900/40 focus:text-indigo-600 dark:focus:text-indigo-400 font-bold transition-colors text-slate-700 dark:text-slate-200" onClick={(e) => {
                                    e.preventDefault();
                                    toggleTheme();
                                }}>
                                    {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} Theme: {isDark ? "Dark" : "Light"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-emerald-50 focus:text-emerald-600 font-bold transition-colors" onClick={() => setIsHowToPlayOpen(true)}>
                                    <HelpCircle className="mr-2 h-4 w-4" /> How To Play
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-600 font-bold transition-colors" onClick={() => setIsBugModalOpen(true)}>
                                    <Bug className="mr-2 h-4 w-4" /> Report a Bug
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={cn(
                                        "rounded-xl cursor-pointer py-2 font-bold transition-colors",
                                        startup.hasRateRewardClaimed
                                            ? "opacity-60 focus:bg-slate-50 focus:text-slate-500"
                                            : "focus:bg-amber-50 focus:text-amber-600"
                                    )}
                                    onClick={handleRateAndClaim}
                                >
                                    <Star className="mr-2 h-4 w-4" />
                                    {startup.hasRateRewardClaimed ? "Rate & Support ✓" : "Rate & Support 🎁 (Claim $50k)"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 focus:text-rose-600 font-bold transition-colors" onClick={() => setIsRoadmapOpen(true)}>
                                    <Rocket className="mr-2 h-4 w-4" /> V2: The Empire Era
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-pink-50 dark:focus:bg-pink-950/40 focus:text-pink-600 font-bold transition-colors" onClick={() => window.open("https://instagram.com/foundersim", "_blank")}>
                                    <Instagram className="mr-2 h-4 w-4 text-pink-500" /> Follow Founder Sim
                                </DropdownMenuItem>
                                {isNative && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                        <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-slate-100 focus:text-slate-900 font-bold transition-colors text-slate-500" onClick={() => adService.showPrivacySettings()}>
                                            <Shield className="mr-2 h-4 w-4" /> Privacy Settings
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* PUBLIC MARKET TICKER */}
                <PublicMarketTicker
                    publicState={startup.public_company}
                    companyName={startup.name || "CORP"}
                    marketStocks={marketStocks}
                    activeMacroEvent={startup.metrics.active_macro_event}
                />

                {/* MACRO SEASON BANNER */}
                {m.current_season && m.current_season !== "Normal" && (
                    <div className={`relative z-[60] shadow-sm shadow-black/5 w-full h-6 flex shrink-0 items-center justify-center text-[9px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-top duration-500 ${m.current_season === "Bull Market" ? "bg-emerald-500 text-white" :
                        m.current_season === "Bear Market" ? "bg-rose-500 text-white" :
                            m.current_season === "AI Boom" ? "bg-indigo-600 text-white" :
                                m.current_season === "Privacy Scare" ? "bg-amber-500 text-white" :
                                    "bg-slate-800 text-white"
                        }`}>
                        {m.current_season === "Bull Market" && "📈 Bull Market: Fundraising Sentiment High"}
                        {m.current_season === "Bear Market" && "📉 Bear Market: Investors Risk Averse"}
                        {m.current_season === "AI Boom" && "🤖 AI Boom: Tech Speed +20% / Salaries Surge"}
                        {m.current_season === "Privacy Scare" && "🔒 Privacy Scare: Marketing Efficiency -30%"}
                    </div>
                )}

                {/* Collapsible Milestone Card */}
                <div
                    onClick={() => setIsMilestoneExpanded(!isMilestoneExpanded)}
                    className="shrink-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all select-none"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{
                                startup.funding_stage === "Bootstrapping" ? "🏠" :
                                    startup.funding_stage === "Angel Investment" ? "🚀" :
                                        startup.funding_stage === "Seed Round" ? "📈" : "🏢"
                            }</span>
                            <div>
                                <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-none">Current Milestone</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
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
                        <div className="flex items-center gap-3">

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
                    </div>
                    {isMilestoneExpanded && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mt-1">
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-normal">
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
                    <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50">
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
                                            }, 'energy');
                                        }}
                                    >
                                        {isRefillLimited ? "Cooldown (1/hr)" : "Refill ⚡"}
                                    </Button>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Core Stats Overview */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        {[
                            { icon: '👤', label: formatNumber(m.users), sub: 'Users', color: 'text-slate-800 dark:text-slate-100' },
                            {
                                icon: '💵',
                                label: formatMoney(liveRevenue),
                                sub: 'MRR',
                                color: 'text-emerald-700 dark:text-emerald-400'
                            },
                            { icon: '🔥', label: `${Math.round(m.founder_burnout || 0)}%`, sub: 'Burnout', color: (m.founder_burnout || 0) > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400' },
                            (() => {
                                const rep = startup.ceo_reputation ?? 80;
                                const repMeta = getCeoReputationLabel(rep);
                                return { icon: '🏅', label: repMeta.grade, sub: 'CEO Rep', color: repMeta.color };
                            })(),
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 shrink-0 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[90px]"
                                )}
                            >
                                <span className="text-lg">{stat.icon}</span>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-black leading-none", stat.color)}>{stat.label}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{stat.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* IMMEDIATE ACTION FEEDBACK BANNER */}
            {immediateActionFeedback && (
                <div className="shrink-0 px-3 py-1.5 border-b border-slate-100" style={{ backgroundColor: immediateActionFeedback.color + '15' }}>
                    <p className="text-[10px] font-bold text-center" style={{ color: immediateActionFeedback.color }}>{immediateActionFeedback.text}</p>
                </div>
            )}

            {/* LOGS FEED — BitLife Style: events grouped by month */}
            <div className="flex flex-col-reverse overflow-y-auto px-3 pt-3 pb-5 flex-1">
                {eventsTimeline.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="text-4xl mb-3">⚡</div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your journey begins</p>
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Take actions below or advance to the next month</p>
                    </div>
                ) : (() => {
                    // Group events by month, show most recent month first
                    const byMonth: Record<number, typeof eventsTimeline> = {};
                    eventsTimeline.forEach(ev => {
                        if (!byMonth[ev.month]) byMonth[ev.month] = [];
                        byMonth[ev.month].push(ev);
                    });

                    // Only render months that actually have events
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
                        const events = byMonth[monthNum] || [];
                        const isCurrentMonth = monthNum === month;
                        return (
                            <div key={monthNum} className="mb-4">
                                {/* Month Header — BitLife style */}
                                <div className={`flex items-center gap-2 mb-2 py-1 ${isCurrentMonth ? "" : ""}`}>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCurrentMonth ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
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


            {/* MAIN DASHBOARD CONTROLS */}
            <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4 pb-8" style={{
                position: "relative",
                zIndex: storyState.tutorialStep >= 2 ? 50 : 1,
                paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + ${isPremium ? '20px' : '85px'})` : '1rem'
            }}>
                <div className="max-w-md mx-auto flex flex-col gap-4">

                    {/* OLD ADVANCE MONTH BUTTON */}
                    {!isLoaded ? (
                        <div className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {storyState.tutorialStep >= 0 && !isCharacterDialogOpen ? (
                                <button
                                    onClick={() => {
                                        const currentTrigger = TUTORIAL_STEPS[storyState.tutorialStep].trigger;
                                        const next = storyState.tutorialStep + 1;
                                        setStoryState(prev => {
                                            const safeTriggers = prev.seenTriggers || [];
                                            const updatedSeen = safeTriggers.includes(currentTrigger) ? safeTriggers : [...safeTriggers, currentTrigger];
                                            return { ...prev, tutorialStep: next >= TUTORIAL_STEPS.length ? -1 : next, seenTriggers: updatedSeen };
                                        });
                                    }}
                                    className="w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
                                    style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", boxShadow: "0 4px 15px rgba(99,102,241,0.5)", position: "relative", zIndex: 50 }}
                                >
                                    {storyState.tutorialStep < TUTORIAL_STEPS.length - 1 ? `CONTINUE TUTORIAL (${storyState.tutorialStep + 1}/${TUTORIAL_STEPS.length}) →` : "FINISH TUTORIAL & START 🚀"}
                                </button>
                            ) : (
                                <button onClick={handleNextMonth} disabled={isProcessing || isCharacterDialogOpen}
                                    className={cn("w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
                                        isCharacterDialogOpen && "opacity-0 pointer-events-none"
                                    )}
                                    style={{ background: isProcessing ? 'linear-gradient(135deg, #818cf8, #a78bfa)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                                    {isProcessing ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simulating Month {month}...</> : <>Advance to Month {month + 1} ▶</>}
                                </button>
                            )}
                        </>
                    )}

                    {/* 4 MAIN CATEGORIES GRID */}
                    <div className="grid grid-cols-5 gap-1.5">
                        {/* Operations */}
                        <button onClick={() => { setTerminalTab("operations"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-blue-100 dark:border-blue-800/50"><span className="drop-shadow-sm">🏢</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Operations</span>
                        </button>
                        {/* Strategy */}
                        <button onClick={() => { setTerminalTab("market"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-rose-100 dark:border-rose-800/50"><span className="drop-shadow-sm">📈</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Strategy</span>
                        </button>
                        {/* Founder */}
                        <button onClick={() => { setTerminalTab("personal"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-purple-100 dark:border-purple-800/50"><span className="drop-shadow-sm">👤</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Founder</span>
                        </button>
                        {/* Corporate */}
                        <button onClick={() => { setTerminalTab("corporate"); setViewState("submenu"); }} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-amber-100 dark:border-amber-800/50"><span className="drop-shadow-sm">🏛️</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Corporate</span>
                        </button>
                        {/* Markets */}
                        <button onClick={() => setIsStockMarketOpen(true)} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100 dark:border-indigo-800/50"><span className="drop-shadow-sm">📊</span></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Markets</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* FULL SCREEN OVERLAYS */}
            <AnimatePresence>
                {viewState !== "dashboard" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] flex flex-col"
                    >
                        {/* Submenu Top Bar */}
                        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm" style={{ paddingTop: isNative ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '8px', paddingBottom: '8px', minHeight: isNative ? 'calc(env(safe-area-inset-top, 0px) + 56px)' : '56px' }}>
                            <div className="flex-1 flex items-end mb-1">
                                <button onClick={() => setViewState("dashboard")} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-transform">
                                    <span className="text-xl leading-none">←</span> 
                                    <span className="font-black text-[11px] sm:text-sm uppercase tracking-widest hidden sm:inline">Dashboard</span>
                                    <span className="font-black text-[11px] uppercase tracking-widest sm:hidden">Back</span>
                                </button>
                            </div>
                            <h2 className="shrink-0 font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center justify-center gap-2 mt-auto mb-1.5 mx-2">
                                {terminalTab === "operations" ? "🏢 Operations" : terminalTab === "market" ? "📈 Strategy" : terminalTab === "personal" ? "👤 Founder" : "🏛️ Corporate"}
                            </h2>
                            <div className="flex-1" /> {/* Spacer to balance Back button */}
                        </div>
                        {/* Submenu Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + 2rem)` : '2rem' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                                {(() => {
                                    let cats = [] as any[];
                                    if (terminalTab === "operations") {
                                        cats = [
                                            { id: "product", emoji: "🔧", label: "Product", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Build & manage tech" },
                                            { id: "marketing", emoji: "📈", label: "Growth", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Acquire users" },
                                            { id: "hiring", emoji: "👥", label: "Hire", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Recruit & manage team" },
                                            { id: "stats", emoji: "📊", label: "Stats", color: "#f0f9ff", border: "#bae6fd", text: "#0369a1", desc: "Financials & metrics" },
                                        ];
                                    } else if (terminalTab === "market") {
                                        cats = [
                                            { id: "market", emoji: "⚔️", label: "Rivals", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Attack competitors" },

                                            { id: "analysts", emoji: "🎙️", label: "PR/Comms", color: "#f5f3ff", border: "#ddd6fe", text: "#7c3aed", desc: "Public relations" },
                                            { id: "manda_acquire", emoji: "🦈", label: "Acquire", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "M&A acquisition", isLocked: false },
                                            { id: "subsidiary", emoji: "🏢", label: "Manage", color: "#f8fafc", border: "#cbd5e1", text: "#475569", desc: "Subsidiary oversight", isLocked: false },
                                            { id: "options", emoji: "🎲", label: "Options", color: "#fff7ed", border: "#ffedd5", text: "#ea580c", desc: "ESOP & Stock Grants", isLocked: !startup.public_company }
                                        ];
                                    } else if (terminalTab === "corporate") {
                                        cats = [
                                            { id: "funding", emoji: "💰", label: "Funding", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Raise capital" },
                                            { id: "board_mgmt", emoji: "🪑", label: "Board", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Manage board" },
                                            { id: "fines", emoji: "⚖️", label: "Legal", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Settle lawsuits" },
                                            { id: "lobbying", emoji: "🏛️", label: "Lobbying", color: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", desc: "Influence regulations", isLocked: !startup.public_company },

                                            { id: "buyback", emoji: "💸", label: "Buyback", color: "#fefce8", border: "#fde68a", text: "#b45309", desc: "Share buybacks", isLocked: !startup.public_company },
                                            { id: "corporate_debt", emoji: "🏦", label: "Debt", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Venture debt & bonds", isLocked: false },
                                        ];
                                    } else if (terminalTab === "personal") {
                                        cats = [
                                            { id: "founder", emoji: "👤", label: "Founder", color: "#fff1f2", border: "#fecdd3", text: "#be123c", desc: "Manage energy" },
                                            { id: "lifestyle", emoji: "💎", label: "Lifestyle", color: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", desc: "Luxury assets & perks" },
                                            { id: "philanthropy", emoji: "🕊️", label: "Donate", color: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", desc: "Charity for reputation" },

                                            { id: "margin_loan", emoji: "💳", label: "Margin", color: "#f0fdf4", border: "#bbf7d0", text: "#15803d", desc: "Borrow against stock", isLocked: !startup.public_company },
                                            { id: "10b51", emoji: "📄", label: "10b51", color: "#fff7ed", border: "#ffedd5", text: "#9a3412", desc: "Automated trading", isLocked: !startup.public_company }
                                        ];
                                    }
                                    return cats.sort((a, b) => (a.isLocked === b.isLocked ? 0 : a.isLocked ? 1 : -1)).map(cat => {
                                        const locked = cat.isLocked;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    if (locked) {
                                                        import('sonner').then(m => m.toast.error("Locked Module", { description: "This feature unlocks at a later corporate stage." }));
                                                        return;
                                                    }
                                                    setActionCategory(cat.id as SheetCategory);
                                                    setViewState("action");
                                                }}
                                                className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-[0.98] ${locked ? 'opacity-40 grayscale' : ''}`}
                                                style={{
                                                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : cat.color,
                                                    borderColor: isDark ? "rgba(51, 65, 85, 0.5)" : cat.border
                                                }}
                                            >
                                                <span className="text-4xl drop-shadow-sm">{cat.emoji}</span>
                                                <div className="text-left flex-1">
                                                    <span className="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider leading-tight flex items-center gap-1.5">
                                                        {cat.label} {locked && <span className="text-[10px]">🔒</span>}
                                                    </span>
                                                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{locked ? "Unlocks Post-IPO" : cat.desc}</span>
                                                </div>
                                                {!locked && <span className="text-slate-400 dark:text-slate-600 text-xl font-bold">›</span>}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewState === "action" && actionCategory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[200] flex flex-col"
                    >
                        {/* Action Top Bar */}
                        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm" style={{ paddingTop: isNative ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '8px', paddingBottom: '8px', minHeight: isNative ? 'calc(env(safe-area-inset-top, 0px) + 56px)' : '56px' }}>
                            <div className="flex-1 flex items-end mb-1">
                                <button onClick={() => setViewState("submenu")} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 transition-transform">
                                    <span className="text-xl leading-none">←</span> 
                                    <span className="font-black text-[11px] sm:text-sm uppercase tracking-widest">Back</span>
                                </button>
                            </div>
                            <h2 className="shrink-0 font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm text-center mt-auto mb-1.5 mx-2">
                                {actionCategory.replace("_", " ")}
                            </h2>
                            <div className="flex-1" /> {/* Spacer */}
                        </div>
                        {/* Action Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ paddingBottom: isNative ? `calc(env(safe-area-inset-bottom, 0px) + 2rem)` : '2rem' }}>
                            <div className="max-w-3xl mx-auto">
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
                                            setViewState("submenu");
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
                                    setIsBurnBreakdownOpen={setIsBurnBreakdownOpen}
                                    setActionCategory={setActionCategory}
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
                                    setFounder={setFounder}
                                    marketStocks={marketStocks}
                                    setMarketStocks={setMarketStocks}
                                    mnaTargets={mnaTargets}
                                    setMnaTargets={setMnaTargets}
                                    handleActionClick={handleActionClick}
                                    handleAllocateESOP={handleAllocateESOP}
                                    currentTime={currentTime}
                                    cashGrants={cashGrants}
                                    setCashGrants={setCashGrants}
                                    energyRefills={energyRefills}
                                    setEnergyRefills={setEnergyRefills}
                                    setConfirmDialog={setConfirmDialog}
                                    isOnline={isOnline}
                                    isPremium={isPremium}
                                    handleRivalryAction={handleRivalryAction}
                                    onUnlockSkill={(nodeId) => {
                                        const node = SKILL_NODE_MAP[nodeId];
                                        const { canUnlock, reason } = canUnlockNode(nodeId, founder, startup, month);
                                        if (!canUnlock) { toast.error("Cannot unlock", { description: reason }); return; }
                                        setFounder(f => ({ ...f, unlocked_skill_nodes: [...(f.unlocked_skill_nodes || []), nodeId] }));
                                        addTimelineEvent(`📚 Skill Unlocked: ${node?.emoji} ${node?.label}`);
                                        toast.success(`${node?.emoji ?? ''} ${node?.label ?? ''} Unlocked!`, { description: node?.tagline });
                                    }}
                                    hrSearchRole={hrSearchRole}
                                    setHrSearchRole={setHrSearchRole}
                                    hrCandidates={hrCandidates}
                                    setHrCandidates={setHrCandidates}
                                    isProcessing={isProcessing}
                                    handleAcquireRival={handleAcquireRival}
                                    setCompetitors={setCompetitors}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MANDATORY CONNECTION OVERLAY */}
            <NetworkStatusOverlay
                isOnline={isOnline}
                onRetry={async () => {
                    const loadingToast = toast.loading("Checking connection...");
                    try {
                        // Try to fetch a tiny resource to truly verify connectivity
                        await fetch("https://www.google.com/favicon.ico", { mode: "no-cors", cache: "no-store" });
                        setIsOnline(true);
                        toast.dismiss(loadingToast);
                        toast.success("Back online!");
                    } catch (e) {
                        setIsOnline(false);
                        toast.dismiss(loadingToast);
                        toast.error("Still offline. Check your connection.");
                    }
                }}
            />

            {/* SAM & CHAD CHARACTER DIALOG */}
            {(() => {
                if (!isCharacterDialogOpen || !characterDialog) return null;
                const isChadDialog = characterDialog.character === "chad";
                return (
                    <CharacterDialog
                        key={`tutorial-${storyState.tutorialStep}-${characterDialog.trigger}`}
                        isOpen={isCharacterDialogOpen}
                        character={characterDialog.character}
                        title={characterDialog.title.replace(/{name}/g, founder.name || "Founder")}
                        message={characterDialog.message.replace(/{name}/g, founder.name || "Founder")}
                        buttonText={characterDialog.buttonText}
                        choiceA={characterDialog.hasChoices && characterDialog.choiceALabel ? {
                            label: characterDialog.choiceALabel,
                            description: characterDialog.choiceADescription || "",
                            onSelect: () => {
                                if (characterDialog.choiceAActionId) {
                                    handleImmediateAction(characterDialog.choiceAActionId, true);
                                }
                                setStoryState(prev => ({
                                    ...prev,
                                    seenTriggers: [...(prev.seenTriggers || []), characterDialog.trigger],
                                    chadMustRespondNext: isChadDialog,
                                    lastChadMonth: isChadDialog ? month : prev.lastChadMonth,
                                }));
                            }
                        } : undefined}
                        choiceB={characterDialog.hasChoices && characterDialog.choiceBLabel ? {
                            label: characterDialog.choiceBLabel,
                            description: characterDialog.choiceBDescription || "",
                            onSelect: () => {
                                if (characterDialog.choiceBActionId) {
                                    handleImmediateAction(characterDialog.choiceBActionId, true);
                                }
                                setStoryState(prev => ({
                                    ...prev,
                                    seenTriggers: [...(prev.seenTriggers || []), characterDialog.trigger],
                                    chadMustRespondNext: isChadDialog,
                                    lastChadMonth: isChadDialog ? month : prev.lastChadMonth,
                                }));
                            }
                        } : undefined}
                        onDismiss={() => {
                            // Close the dialog, marking current step as seen in storyState
                            setIsCharacterDialogOpen(false);
                            setStoryState(prev => {
                                const trigger = characterDialog.trigger;
                                const isIslandFarewell = trigger === "sam_island_farewell";

                                return {
                                    ...prev,
                                    samGoneToIsland: isIslandFarewell ? true : prev.samGoneToIsland,
                                    seenTriggers: (prev.seenTriggers || []).includes(trigger)
                                        ? (prev.seenTriggers || [])
                                        : [...(prev.seenTriggers || []), trigger],
                                    chadMustRespondNext: isChadDialog ? true : prev.chadMustRespondNext,
                                    lastChadMonth: isChadDialog ? month : prev.lastChadMonth,
                                };
                            });
                        }}
                        isPremium={isPremium}
                    />
                );
            })()}

            {/* FOCUS BREAKDOWN MODAL */}
            <Dialog open={isFocusBreakdownOpen} onOpenChange={setIsFocusBreakdownOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                            ⚡ Focus Breakdown
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Monthly Capacity vs. Commitments
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="mt-4 max-h-[50vh] pr-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Capacity (Max: {maxHours}h)</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 space-y-2">
                                    <BreakdownRow label="Base Focus" value={100} sign="+" color="text-emerald-600 dark:text-emerald-400" />
                                    {m.founder_burnout > 0 && (
                                        <BreakdownRow label={`Burnout Penalty (${Math.round(m.founder_burnout)}%)`} value={-Math.round(Math.max(0, m.founder_burnout) * 1.2)} sign="" color="text-rose-600 dark:text-rose-400" />
                                    )}
                                    {(startup as any).hasCoFounder && (
                                        <BreakdownRow label="Co-Founder Focus" value={50} sign="+" color="text-indigo-600 dark:text-indigo-400" />
                                    )}
                                    {startup.employees?.some((e: any) => e.role?.toUpperCase() === "COO") && (
                                        <BreakdownRow label="COO Delegation Bonus" value={40} sign="+" color="text-indigo-600 dark:text-indigo-400" />
                                    )}
                                    {startup.employees?.some((e: any) => e.role?.toUpperCase() === "EA") && (
                                        <BreakdownRow label="EA Efficiency Bonus" value={30} sign="+" color="text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </div>
                            </div>

                            {ongoingPrograms.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Ongoing Programs (-{focusHoursUsed}h)</h3>
                                    <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-3 space-y-2">
                                        {ongoingPrograms.map((p, i) => {
                                            const def = getOngoingProgramDef(p.id);
                                            return (
                                                <BreakdownRow
                                                    key={p.id || `prog_fallback_${i}`}
                                                    label={def?.label || p.id}
                                                    value={-(def?.monthlyEnergy || 0)}
                                                    sign=""
                                                    color="text-indigo-700 dark:text-indigo-300"
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Available Focus</span>
                                <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">{maxHours - focusHoursUsed}h</span>
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

            {/* WAR ROOM MODAL — Crisis Response */}
            {isCrisisWarRoomOpen && startup.active_crisis && !startup.active_crisis.resolved && (() => {
                const crisis = startup.active_crisis!;
                const stage = getCurrentCrisisStage(crisis);
                if (!stage) return null;
                const emoji = CRISIS_EMOJIS[crisis.type];
                const stageNum = crisis.currentStage + 1;
                const totalStages = getCrisisStageCount(crisis.type);
                const severityGradients = ["",
                    "from-amber-400 to-yellow-500",
                    "from-orange-500 to-amber-500",
                    "from-rose-600 to-red-500",
                    "from-red-700 to-rose-800",
                ];
                const grad = severityGradients[stage.severity];

                const handleCrisisChoice = (choiceId: string) => {
                    const choice = stage.choices.find(c => c.id === choiceId);
                    if (!choice) return;
                    const result = resolveCrisisChoice(
                        crisis,
                        choiceId,
                        !!startup.metrics.has_legal_dept,
                        startup.history?.length ?? 0
                    );
                    // Apply metric effects
                    setStartup(s => {
                        const ns = { ...s, active_crisis: result.updatedCrisis };
                        const fx = result.effects;
                        if (fx.brand_awareness) ns.metrics = { ...ns.metrics, brand_awareness: Math.max(0, Math.min(100, (ns.metrics.brand_awareness || 0) + fx.brand_awareness)) };
                        if (fx.team_morale) ns.metrics = { ...ns.metrics, team_morale: Math.max(0, Math.min(100, (ns.metrics.team_morale || 50) + fx.team_morale)) };
                        if (fx.cash_hit) ns.metrics = { ...ns.metrics, cash: (ns.metrics.cash || 0) + fx.cash_hit! };
                        if (fx.ceo_reputation) ns.ceo_reputation = Math.max(0, Math.min(100, (ns.ceo_reputation ?? 80) + fx.ceo_reputation));
                        if (fx.valuation_mult) {
                            ns.valuation = Math.floor(ns.valuation * fx.valuation_mult!);
                            if (ns.public_company) {
                                ns.public_company.share_price = Math.max(0.01, ns.public_company.share_price * fx.valuation_mult!);
                            }
                        }
                        if (fx.user_churn_bonus) ns.metrics = { ...ns.metrics, users: Math.max(0, Math.floor((ns.metrics.users || 0) * (1 - fx.user_churn_bonus!))) };
                        return ns;
                    });
                    if (result.notice) addTimelineEvent(result.notice);
                    if (result.success) {
                        toast.success("Crisis Contained!", { description: result.notice, duration: 5000 });
                    } else if (result.crisisResolved) {
                        toast.error("Crisis Unresolved", { description: result.notice, duration: 6000 });
                    } else {
                        toast.warning("Crisis Escalated", { description: result.notice, duration: 5000 });
                    }
                    setIsCrisisWarRoomOpen(false);
                };

                return (
                    <Dialog open={isCrisisWarRoomOpen} onOpenChange={setIsCrisisWarRoomOpen}>
                        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
                            {/* Header */}
                            <div className={`bg-gradient-to-br ${grad} p-5 text-white`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-3xl">{emoji}</span>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-75">Crisis — Stage {stageNum} of {totalStages}</p>
                                        <p className="text-lg font-black leading-tight">{CRISIS_LABELS[crisis.type]}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-70 mt-2">{stage.title}</p>
                            </div>
                            {/* Body */}
                            <div className="p-5 space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {stage.description.replace("{{company}}", startup.name)}
                                </p>
                                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2 border border-amber-200 dark:border-amber-800">
                                    <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                                        ⚠️ If ignored: auto-escalates in {stage.autoEscalatesAfterMonths} month{stage.autoEscalatesAfterMonths > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Your Response</p>
                                    {stage.choices.map(choice => (
                                        <button
                                            key={choice.id}
                                            onClick={() => handleCrisisChoice(choice.id)}
                                            className="w-full text-left p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{choice.label}</p>
                                                <div className="shrink-0 flex flex-col items-end gap-0.5">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${choice.successRate >= 0.75 ? 'bg-emerald-100 text-emerald-700' :
                                                        choice.successRate >= 0.55 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {Math.round(choice.successRate * 100)}% success
                                                    </span>
                                                    {(choice.cost ?? 0) > 0 && (
                                                        <span className="text-[8px] font-black text-slate-400">{formatMoney(choice.cost!)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{choice.description}</p>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsCrisisWarRoomOpen(false)}
                                    className="w-full py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
                                >
                                    Dismiss for now (crisis continues)
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            })()}

            {/* HIRING MODAL */}
            <Dialog open={!!pendingCandidate} onOpenChange={(open) => !open && setPendingCandidate(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-indigo-500 border-4 rounded-[2rem] p-6 shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">
                                Negotiate: {pendingCandidate?.name}
                            </DialogTitle>
                            <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                                Pool: {(startup.metrics.option_pool || 0).toFixed(1)}%
                            </div>
                        </div>
                        {/* Legendary Candidate Banner */}
                        {pendingCandidate?.isLegendary && (
                            <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white shadow-lg">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-80">⭐ Legendary Candidate</p>
                                <p className="text-[11px] font-semibold mt-0.5 italic leading-snug opacity-95">"{pendingCandidate.storyQuote}"</p>
                            </div>
                        )}
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

                        // Salary Score: Match (1.0x) = 70. High-end (2.0x) = 100.
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
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 rounded-3xl p-0 shadow-2xl overflow-hidden">
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
                    <div className="-mt-5 bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-5 pb-6 space-y-5">

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
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 rounded-3xl p-0 shadow-2xl overflow-hidden">
                    <div className={cn("px-6 py-8 text-center", lastProposalResult?.status === "approved" ? "bg-emerald-500" : "bg-rose-500")}>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">
                            {lastProposalResult?.status === "approved" ? "✅" : "❌"}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase whitespace-pre-wrap">
                            {lastProposalResult?.resolution_title
                                ? (lastProposalResult.status === "approved" ? "Resolution Passed" : "Resolution Rejected")
                                : (lastProposalResult?.status === "approved" ? "Salary Approved!" : "Proposal Rejected")
                            }
                        </h2>
                        <p className="text-white/80 font-bold text-xs mt-1 uppercase tracking-widest">
                            {lastProposalResult?.resolution_title || "Board Resolution"} · {lastProposalResult?.amount ? `${formatMoney(lastProposalResult.amount)} / mo` : "Governance Action"}
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

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
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
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-emerald-500 border-4 rounded-[2rem] p-0 shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[85vh] min-h-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase italic flex items-center justify-between">
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
                    <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={teamSearch}
                                onChange={(e) => setTeamSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-slate-200"
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

                                        {/* Trait Badges (CXO — compact card) */}
                                        {(emp.traits || []).length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-dashed border-slate-100">
                                                {emp.traits!.map((trait: EmployeeTrait) => <TraitBadge key={trait} trait={trait} />)}
                                            </div>
                                        )}
                                        {!emp.traitRevealedMonth && emp.hiddenTrait && (
                                            <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-100">
                                                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Getting to know them...</span>
                                            </div>
                                        )}

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
                                                    {/* Trait Badges (Staff — expanded card) */}
                                                    {(emp.traits || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1 pt-2 border-t border-dashed border-slate-100">
                                                            {emp.traits!.map((trait: EmployeeTrait) => <TraitBadge key={trait} trait={trait} />)}
                                                        </div>
                                                    )}
                                                    {!emp.traitRevealedMonth && emp.hiddenTrait && (
                                                        <div className="pt-2 border-t border-dashed border-slate-100">
                                                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Getting to know them...</span>
                                                        </div>
                                                    )}

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

            {/* BURN BREAKDOWN DIALOG */}
            <Dialog open={isBurnBreakdownOpen} onOpenChange={setIsBurnBreakdownOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-2xl">🔥</div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Monthly Burn</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Financial Breakdown</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-bold text-slate-500">Monthly Revenue</span>
                                <span className="text-sm font-black text-emerald-600">+{formatMoney(liveRevenue)}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Cost of Sales (COGS)</span>
                                    <span className="text-xs font-black text-rose-500">-{formatMoney(monthlyCogs || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">{startup.employees?.length > 0 ? "Salaries & Benefits" : "Base Startup Operating Cost"}</span>
                                    <span className="text-xs font-black text-rose-500">-{formatMoney(opexBreakdown?.salaries || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Infrastructure & SaaS</span>
                                    <span className="text-xs font-black text-rose-500">-{formatMoney(opexBreakdown?.infra || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">Founder Living Cost</span>
                                    <span className="text-xs font-black text-rose-500">-{formatMoney(opexBreakdown?.founderLiving || 0)}</span>
                                </div>
                                {(opexBreakdown?.misc || 0) > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Misc & Program Costs</span>
                                        <span className="text-xs font-black text-rose-500">-{formatMoney(opexBreakdown?.misc || 0)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Net Cash Flow</span>
                                <span className={`text-sm font-black ${liveNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {liveNetProfit >= 0 ? "+" : ""}{formatMoney(liveNetProfit)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📅</span>
                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Est. Runway</span>
                            </div>
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                                {profitable ? "∞ Profitable" : `${liveRunway} Months`}
                            </span>
                        </div>
                    </div>

                    <Button className="w-full h-12 mt-6 bg-slate-900 border-b-4 border-slate-800 rounded-2xl font-black uppercase tracking-widest text-white" onClick={() => setIsBurnBreakdownOpen(false)}>
                        GOT IT
                    </Button>
                </DialogContent>
            </Dialog>

            {/* FINANCIALS MODAL */}
            <Dialog open={isFinancialsOpen} onOpenChange={setIsFinancialsOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 rounded-3xl p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
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
                    <div className="-mt-4 mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex p-1 shrink-0">
                        <button onClick={() => setFinancialTab("summary")} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all", financialTab === "summary" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 dark:text-slate-500")}>
                            Overview
                        </button>
                        <button onClick={() => setFinancialTab("pnl")} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all", financialTab === "pnl" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 dark:text-slate-500")}>
                            P&amp;L
                        </button>
                        <button onClick={() => setFinancialTab("captable")} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all", financialTab === "captable" ? "bg-violet-500 text-white shadow-sm" : "text-slate-400 dark:text-slate-500")}>
                            Cap Table
                        </button>
                    </div>

                    <div className="space-y-2 mt-4 px-4 pb-6 overflow-y-auto flex-1">
                        {financialTab === "summary" && (
                            <div className="space-y-2">
                                {/* Key metrics grid */}
                                {(() => {
                                    const netProfit = m.net_profit ?? 0;
                                    const { monthlyRevenue: financialsMRR } = calculateFinancials(startup, founder);
                                    return (
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: "Cash", val: formatMoney(m.cash), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50", explanation: "Your company bank account. Maintain at least 3 months of runway." },
                                                { label: "MRR", val: formatMoney(financialsMRR), color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50", explanation: "Monthly Recurring Revenue. Lifeblood of the business." },
                                                { label: "Valuation", val: formatMoney(startup.valuation), color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50", explanation: "Calculated based on MRR, growth, and product quality." },
                                                { label: "Runway", val: netProfit > 0 ? "∞ Profitable" : (netProfit < 0 ? `${m.runway}mo` : "—"), color: netProfit > 0 ? "text-emerald-600 dark:text-emerald-400" : (netProfit < 0 ? (m.runway <= 3 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400") : "text-slate-400 dark:text-slate-500"), bg: netProfit > 0 ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50" : (netProfit < 0 ? "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"), explanation: "Time until cash runs out. Increase this by raising funds or reaching profitability." },
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
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3">
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Unit Economics</p>
                                    {(() => {
                                        const toggle = (m: string) => setExpandedMetric(expandedMetric === m ? null : m);
                                        return (
                                            <>
                                                <StatRow label="Gross Margin" value={m.cogs ? `${Math.round(((liveRevenue - m.cogs) / (liveRevenue + 1)) * 100)}%` : "—"} color="text-emerald-600 dark:text-emerald-400"
                                                    explanation="Revenue minus direct costs (COGS). Higher is better." isExpanded={expandedMetric === "gm"} onToggle={() => toggle("gm")} />
                                                <StatRow label="COGS" value={formatMoney(m.cogs || 0)} color="text-rose-500 dark:text-rose-400"
                                                    explanation="Cost of Goods Sold. Direct expenses like server costs and API fees." isExpanded={expandedMetric === "cogs"} onToggle={() => toggle("cogs")} />
                                                <StatRow label="OpEx" value={formatMoney(m.opex || 0)} color="text-rose-400 dark:text-rose-300"
                                                    explanation="Operating Expenses. Indirect costs like office rent and software." isExpanded={expandedMetric === "opex"} onToggle={() => toggle("opex")} />
                                                <StatRow label={"Net " + (liveNetProfit > 0 ? "Profit" : (liveNetProfit < 0 ? "Loss" : "Income"))} value={formatMoney(liveNetProfit || 0)} color={liveNetProfit > 0 ? "text-emerald-600 dark:text-emerald-400" : (liveNetProfit < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500")}
                                                    explanation="Total monthly profit or loss after all expenses." isExpanded={expandedMetric === "net"} onToggle={() => toggle("net")} />
                                                <StatRow label="CAC" value={m.cac ? formatMoney(m.cac) : "N/A"} color="text-slate-500 dark:text-slate-400"
                                                    explanation="Customer Acquisition Cost. Marketing spend per new user." isExpanded={expandedMetric === "cac"} onToggle={() => toggle("cac")} />
                                                <StatRow label="LTV" value={m.ltv ? formatMoney(m.ltv) : "N/A"} color="text-blue-600 dark:text-blue-400"
                                                    explanation="Lifetime Value. Total revenue expected from a user." isExpanded={expandedMetric === "ltv"} onToggle={() => toggle("ltv")} />
                                                <StatRow label="LTV:CAC" value={(m.cac && m.cac > 0 && m.ltv) ? `${(m.ltv / m.cac).toFixed(1)}x` : "N/A"} color={(m.cac && m.cac > 0 && m.ltv && m.ltv / m.cac >= 3) ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
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
                                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm",
                                            e.type === "Founder" ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-amber-100 dark:bg-amber-900/40")}>
                                            {e.type === "Founder" ? "👤" : "💼"}
                                        </span>
                                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 font-semibold">{e.name}</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">{e.equity.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </>
                        )}
                        {financialTab === "pnl" && (
                            <>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly P&amp;L (Last 6 Months)</p>
                                <div className="space-y-3">
                                    {(startup.history || []).slice(-6).reverse().map((entry: any, i: number) => (
                                        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                                            <div className={`h-1 w-full ${entry.netIncome >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
                                            <div className="p-3">
                                                <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2">Month {entry.month}</p>
                                                <StatRow label="Revenue" value={formatMoney(entry.revenue)} color="text-green-600 dark:text-green-400" />
                                                <StatRow label="COGS" value={formatMoney(-entry.cogs)} color="text-rose-400 dark:text-rose-300" />
                                                <StatRow label="Gross Profit" value={formatMoney(entry.grossProfit)} color="text-slate-700 dark:text-slate-300" />
                                                <StatRow label="OpEx" value={formatMoney(-entry.opex)} color="text-rose-500 dark:text-rose-400" />
                                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                                                    <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Net Income</span>
                                                    <span className={cn("text-xs font-black", entry.netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{entry.netIncome >= 0 ? "+" : ""}{formatMoney(entry.netIncome)}</span>
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
                    ?? (outcome === "ipo" ? Math.floor(Math.floor(startup.valuation * 0.20) * 0.10) : 0);

                const OUTCOME_META: Record<string, { emoji: string; label: string; bg: string; text: string }> = {
                    ipo: { emoji: "🏛️", label: "IPO Success!", bg: "bg-violet-600", text: "text-violet-600" },
                    acquired: { emoji: "🤝", label: "Acquired!", bg: "bg-emerald-600", text: "text-emerald-600" },
                    wound_down: { emoji: "🔒", label: "Wound Down", bg: "bg-amber-500", text: "text-amber-600" },
                    bankrupt: { emoji: "💀", label: "Bankrupt", bg: "bg-rose-600", text: "text-rose-600" },
                    active: { emoji: "🏁", label: "Game Over", bg: "bg-slate-600", text: "text-slate-600" },
                };
                const meta = OUTCOME_META[outcome] ?? OUTCOME_META["active"];

                return (
                    <div className="fixed inset-0 z-[10000] bg-black/90 flex items-end justify-center sm:items-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800">
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
                                        <p className="text-[9px] text-emerald-500 mt-0.5">
                                            {outcome === "ipo" ? "Secondary Liquidity (10% of IPO float)" : "after dilution"}
                                        </p>
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
                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        📖 Your Story
                                        {!endgameStory && <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />}
                                    </p>
                                    {endgameStory ? (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{endgameStory}</p>
                                    ) : (
                                        <div className="space-y-2 mt-2">
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse" />
                                            <div className="h-2 w-5/6 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse" />
                                            <div className="h-2 w-4/6 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer buttons - fixed bottom with safe area */}
                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900" style={{ paddingBottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px) + ${isPremium ? '0px' : '70px'})` }}>


                                {outcome === "ipo" ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setStartup(s => ({ ...s, outcome: "active" }));
                                                setIsEndgameOpen(false);
                                                playSound("success");
                                            }}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black uppercase tracking-widest text-sm hover:from-violet-500 hover:to-indigo-600 shadow-xl shadow-violet-600/30 transition-all active:scale-[0.98] animate-pulse"
                                        >
                                            Ring The Opening Bell 🔔
                                        </button>
                                        <button
                                            onClick={() => handleResetGame(true)}
                                            className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-rose-500 transition-colors"
                                        >
                                            Or Retire & Start New Legacy
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleResetGame(true)}
                                        className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wider text-sm hover:bg-indigo-700 transition active:scale-[0.98]"
                                    >
                                        Start New Game →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            <Toaster position="top-center" duration={3000} style={{ marginTop: '60px' }} toastOptions={{ className: 'font-sans shadow-xl' }} />
            {/* HOW TO PLAY MODAL */}
            <Dialog open={isHowToPlayOpen} onOpenChange={setIsHowToPlayOpen}>
                <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 border-4 rounded-[2rem] p-0 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col items-stretch [&>button]:hidden">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 relative">
                        <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={() => setIsHowToPlayOpen(false)}>✕</div>
                        <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-none">How To Play</h2>
                        <p className="text-indigo-200 text-sm font-medium">Your guide to building a unicorn.</p>
                    </div>

                    <HowToPlayContent />

                    <div className="px-6 py-4 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <Button className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 h-12 w-full sm:w-auto px-10 shadow-lg shadow-indigo-600/20" onClick={() => setIsHowToPlayOpen(false)}>GOT IT, LET'S BUILD</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* V2 ROADMAP MODAL */}
            <Dialog open={isRoadmapOpen} onOpenChange={setIsRoadmapOpen}>
                <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 border-4 rounded-[2.5rem] p-0 shadow-2xl overflow-hidden [&>button]:hidden font-sans max-h-[92vh] flex flex-col">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-10 relative overflow-hidden shrink-0">
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/10 select-none pointer-events-none italic">V2</div>

                        <div className="absolute top-6 right-6 text-white/50 hover:text-white cursor-pointer select-none bg-black/10 rounded-full p-2 transition-colors" onClick={() => setIsRoadmapOpen(false)}>
                            <X className="size-5" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                <Rocket className="size-3" /> The V2 Era
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-white mb-2 leading-tight">The Addiction Update</h2>
                            <p className="text-indigo-100 text-sm font-medium max-w-md">V2 picks up where you left off — run your publicly listed company, build a global empire, and face challenges no bootstrapped founder ever imagined.</p>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Post-IPO Chapter — Featured First Card */}
                        <div className="group bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-3xl shadow-lg shadow-violet-600/20 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 text-[8rem] font-black text-white/10 select-none pointer-events-none leading-none">V2</div>
                            <div className="relative z-10">
                                <div className="flex gap-2 mb-3">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 text-white text-[8px] font-black uppercase tracking-widest">New Chapter</span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-400/30 text-amber-100 text-[8px] font-black uppercase tracking-widest">Continues Your Story</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0">🏛️</div>
                                    <div>
                                        <p className="text-base font-black text-white mb-1">Post-IPO: The Public Company Era</p>
                                        <p className="text-xs text-indigo-100 font-medium leading-relaxed">Your IPO was just the beginning. The V2 update picks up where Founder Sim leaves off — you'll run your company as a publicly listed entity. Manage quarterly earnings, deal with shareholder activism, navigate board politics, and face the brutally realistic world of public markets.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                                        <span className="text-xs">✅</span>
                                        <p className="text-emerald-400 text-[9px] font-black uppercase tracking-wide">LIVE NOW</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-2xl shadow-lg">LIVE</div>
                            <div className="flex gap-4">
                                <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🎭</div>
                                <div>
                                    <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">The Talent Roster Update</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Unique executive traits, legendary hires, and internal politics. Will you hire the toxic genius who builds 10x faster but destroys your team's soul?</p>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-2xl shadow-lg">LIVE</div>
                            <div className="flex gap-4">
                                <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🌐</div>
                                <div>
                                    <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">The Empire Expansion</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Unlock the "War Room" UI. Delegate divisions to your VPs, execute hostile takeovers of rivals, lobby regulators, and expand into international markets.</p>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-300 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-2xl shadow-lg">LIVE</div>
                            <div className="flex gap-4">
                                <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">⚡</div>
                                <div>
                                    <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Dynamic Crisis Engine</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Data breaches, activist short-sellers, viral PR disasters, and regulatory investigations. Every quarter on the public markets brings a new fire to put out.</p>
                                </div>
                            </div>
                        </div>

                        <div className="group bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-2xl shadow-lg">LIVE</div>
                            <div className="flex gap-4">
                                <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🧠</div>
                                <div>
                                    <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Founder Skill Web</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">A massive RPG-style skill tree. Spec into "Growth Hacking", "Product Visionary", or "Cold-Blooded Dealmaker" to unlock unique perks.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.02)] shrink-0" style={{ paddingBottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px) + ${isPremium ? '0px' : '70px'})` }}>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider italic">Founder Sim V2.0.0 Launched</p>
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

            {/* STOCK MARKET OVERHAUL MODAL */}
            <AnimatePresence>
                {isStockMarketOpen && (
                    <StockMarketView
                        onClose={() => setIsStockMarketOpen(false)}
                        stocks={marketStocks}
                        startup={startup}
                        founder={founder}
                        month={month}
                        onTradePersonal={handleTradePersonal}
                        onTradeCorporate={handleTradeCorporate}
                        onTenderOffer={handleTenderOffer}
                        onBlockBuy={handleBlockBuy}
                        onToggleCfoAutoTrade={handleToggleCfoAutoTrade}
                        personalPortfolio={founder.wealth_profile?.portfolio || []}
                        corporatePortfolio={startup.public_company?.corporate_portfolio || startup.treasury_portfolio || []}
                        personalCash={founder.personal_wealth || 0}
                        corporateCash={startup.metrics?.cash || 0}
                        personalPortfolioHistory={founder.wealth_profile?.portfolioHistory || []}
                        corporatePortfolioHistory={startup.corporatePortfolioHistory || []}
                        geniusUsesThisHour={geniusUsesThisHour}
                        lastGeniusResetTime={lastGeniusResetTime}
                        onInsiderTipUsed={handleInsiderTipUsed}
                        activeTips={insiderStockPicks}
                    />
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

            {!isCharacterDialogOpen && (
                <EventModal
                    event={activeEvent}
                    onResolve={handleEventResolution}
                    onClose={() => setActiveEvent(null)}
                    multiplier={eventMultiplier}
                    isPremium={isPremium}
                />
            )}

            <PostIpoCinematicModal
                isOpen={showPostIpoCinematic}
                onComplete={() => setShowPostIpoCinematic(false)}
            />

            <EarningsCallModal
                open={isEarningsCallOpen}
                startup={startup}
                founder={founder}
                month={month}
                onComplete={(results) => {
                    const newStartup = { ...startup };
                    if (newStartup.public_company) {
                        const pub = newStartup.public_company;

                        // Apply price impact
                        pub.share_price = Math.max(0.01, pub.share_price * (1 + results.priceImpactPct));

                        // Update consensus and guidance for next quarter
                        const currentEps = pub.eps_last_quarter;
                        const oldConsensus = pub.consensus_eps;

                        let nextGuidance = currentEps;
                        if (results.guidance === "bullish") nextGuidance = currentEps * 1.15;
                        if (results.guidance === "bearish") nextGuidance = currentEps * 0.85;
                        if (results.guidance === "realistic") nextGuidance = currentEps * 1.05;

                        pub.eps_guidance = nextGuidance;
                        // Street consensus meets you halfway
                        pub.consensus_eps = (currentEps + nextGuidance) / 2;

                        // Record streak
                        if (pub.eps_last_quarter >= oldConsensus) {
                            pub.quarterly_beats++;
                            pub.quarterly_misses = 0;
                        } else {
                            pub.quarterly_misses++;
                            pub.quarterly_beats = 0;
                        }

                        // Sync ticker
                        setMarketStocks(prev => prev.map(s =>
                            s.symbol === (startup.symbol || "CORP") ? { ...s, currentPrice: pub.share_price } : s
                        ));
                    }

                    setStartup(newStartup);
                    addTimelineEvent(results.message, month);

                    if (results.priceImpactPct > 0) {
                        toast.success("Earnings Call Concluded", { description: "Stock reacted positively." });
                        playSound("success");
                    } else {
                        toast.error("Earnings Call Concluded", { description: "Stock took a hit." });
                        playSound("fail");
                    }

                    setIsEarningsCallOpen(false);
                }}
            />


            <StoreModal 
                open={isStoreOpen} 
                onClose={() => setIsStoreOpen(false)} 
                startup={startup} 
                setStartup={setStartup as any} 
            />

            <ReportBugModal 
                isOpen={isBugModalOpen}
                onClose={() => setIsBugModalOpen(false)}
            />
        </div>
    );
}
