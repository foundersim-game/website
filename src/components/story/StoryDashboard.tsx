"use client";
// src/components/story/StoryDashboard.tsx
// Full action-parity Story Mode dashboard — mirrors sandbox depth, adapted for story world.

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Save, ChevronDown, ChevronRight, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  StoryCampaign,
  StoryModeState,
  StoryStartupSnapshot,
  StoryEvent,
  SprintAllocation,
  PitchDeckResult,
  VCPersonality,
  KeyPerson,
  HistoricalRival,
} from "@/lib/story/types";
import {
  checkStoryEvents,
  applyStoryChoice,
  processStoryMonth,
  checkWinCondition,
  checkLossConditions,
} from "@/lib/story/engine";
import { checkBetrayalThresholds } from "@/lib/story/keyPeople";
import { getRandomVCPersonality } from "@/lib/story/pitchDeck";

import StoryEventModal from "./StoryEventModal";
import KeynoteModal from "./KeynoteModal";
import PitchDeckModal from "./PitchDeckModal";
import SprintModal from "./SprintModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCash(n: number): string {
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${n}`;
}
function cn(...c: (string | undefined | false | null)[]): string {
  return c.filter(Boolean).join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  campaign: StoryCampaign;
  initialSnapshot: StoryStartupSnapshot;
  initialStoryState: StoryModeState;
  onSave: (snapshot: StoryStartupSnapshot, storyState: StoryModeState) => void;
}

type GameEndReason = "win" | "loss";

// Tab system: main 5-icon tabs → sub-category grid → action panel (3 levels deep, like sandbox)
type MainTab = "operations" | "strategy" | "founder" | "intel" | "acts";
type SubCategory =
  | "product" | "growth" | "team" | "financials"
  | "rivals" | "pr_comms" | "funding" | "market_position"
  | "vitals" | "skills" | "perks" | "legacy"
  | "rival_intel" | "event_log" | "board" | "legal";

// ─── Sub-category definitions per main tab ───────────────────────────────────
const TAB_SUBCATS: Record<MainTab, { id: SubCategory; emoji: string; label: string; desc: string; color: string; border: string; textColor: string }[]> = {
  operations: [
    { id: "product",    emoji: "🔧", label: "Product",    desc: "Engineering & tech debt", color: "#eff6ff", border: "#bfdbfe", textColor: "#1d4ed8" },
    { id: "growth",     emoji: "📣", label: "Growth",     desc: "Brand & user acquisition",  color: "#f0fdf4", border: "#bbf7d0", textColor: "#15803d" },
    { id: "team",       emoji: "👥", label: "Team",       desc: "Inner circle & morale",     color: "#fefce8", border: "#fde68a", textColor: "#b45309" },
    { id: "financials", emoji: "📊", label: "Financials", desc: "P&L, burn & runway",        color: "#f0f9ff", border: "#bae6fd", textColor: "#0369a1" },
  ],
  strategy: [
    { id: "rivals",          emoji: "⚔️", label: "Rivals",        desc: "Counter competitor moves",   color: "#fff7ed", border: "#ffedd5", textColor: "#9a3412" },
    { id: "pr_comms",        emoji: "📢", label: "PR & Comms",    desc: "Reputation & press",         color: "#f5f3ff", border: "#ddd6fe", textColor: "#7c3aed" },
    { id: "funding",         emoji: "💰", label: "Funding",       desc: "Raise capital & investors",  color: "#fdf4ff", border: "#e9d5ff", textColor: "#7e22ce" },
    { id: "market_position", emoji: "🎯", label: "Market Pos.",   desc: "PMF & competitive moat",     color: "#ecfdf5", border: "#a7f3d0", textColor: "#065f46" },
  ],
  founder: [
    { id: "vitals",  emoji: "⚡", label: "Vitals",    desc: "Energy & burnout recovery",  color: "#fff1f2", border: "#fecdd3", textColor: "#be123c" },
    { id: "skills",  emoji: "🧠", label: "Skills",    desc: "Founder skill progression",  color: "#eff6ff", border: "#bfdbfe", textColor: "#1e40af" },
    { id: "perks",   emoji: "💎", label: "Perks",     desc: "Lifestyle & CEO presence",   color: "#f5f3ff", border: "#ddd6fe", textColor: "#6d28d9" },
    { id: "legacy",  emoji: "🕊️", label: "Legacy",    desc: "Philanthropy & impact",      color: "#fdf4ff", border: "#e9d5ff", textColor: "#7e22ce" },
  ],
  intel: [
    { id: "rival_intel", emoji: "🕵️", label: "Rival Intel",  desc: "Upcoming threats & counters", color: "#fff1f2", border: "#fecdd3", textColor: "#be123c" },
    { id: "event_log",   emoji: "📋", label: "Event Log",    desc: "Completed story decisions",   color: "#f0f9ff", border: "#bae6fd", textColor: "#0369a1" },
    { id: "board",       emoji: "🪑", label: "Board",        desc: "Board loyalty & proposals",   color: "#fefce8", border: "#fde68a", textColor: "#b45309" },
    { id: "legal",       emoji: "⚖️", label: "Legal",        desc: "Crisis resolution",           color: "#fdf4ff", border: "#e9d5ff", textColor: "#7e22ce" },
  ],
  acts: [],
};

const MAIN_TABS: { id: MainTab; emoji: string; label: string; color: string }[] = [
  { id: "operations", emoji: "🏢", label: "Operations", color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50" },
  { id: "strategy",   emoji: "📈", label: "Strategy",   color: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50" },
  { id: "founder",    emoji: "👤", label: "Founder",    color: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" },
  { id: "intel",      emoji: "🔎", label: "Intel",      color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50" },
  { id: "acts",       emoji: "📖", label: "Acts",       color: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50" },
];

// ─── Story-Mode Action Definitions ───────────────────────────────────────────
interface StoryAction {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  energyCost: number;
  cashCost?: number;
  effects: Partial<StoryStartupSnapshot["metrics"]>;
  log: string;
  requiresCash?: number;
  requiresMonth?: number;
}

const STORY_PRODUCT_ACTIONS: StoryAction[] = [
  { id: "fix_tech_debt",   emoji: "🔨", label: "Refactor Codebase",   desc: "Dedicated sprint to eliminate technical debt",            energyCost: 10, effects: { technical_debt: -15, product_quality: 5, reliability: 5 },      log: "🔨 Refactored codebase. Tech debt reduced." },
  { id: "ship_feature",    emoji: "🚀", label: "Ship Core Feature",   desc: "Push a high-impact feature to production",               energyCost: 8,  effects: { product_quality: 8, pmf_score: 4, innovation: 3 },               log: "🚀 Shipped a core feature. PMF improving." },
  { id: "security_audit",  emoji: "🛡️", label: "Security Audit",      desc: "Harden the platform against vulnerabilities",            energyCost: 6,  cashCost: 5000, effects: { reliability: 12, technical_debt: -5 },         log: "🛡️ Security audit complete. Platform hardened." },
  { id: "code_review",     emoji: "🔍", label: "Deep Code Review",    desc: "Systematic review to catch bugs before they ship",       energyCost: 5,  effects: { reliability: 8, technical_debt: -8, product_quality: 3 },        log: "🔍 Code review done. Reliability improved." },
  { id: "ai_integration",  emoji: "🤖", label: "Integrate AI/ML",     desc: "Add machine learning layer to core product",             energyCost: 15, cashCost: 10000, effects: { innovation: 15, product_quality: 10, pmf_score: 5 }, log: "🤖 AI integrated. Innovation at peak." },
  { id: "mobile_optimize", emoji: "📱", label: "Mobile Optimization", desc: "Optimize UX for mobile-first experience",                energyCost: 7,  effects: { product_quality: 6, brand_awareness: 4, users: 500 },           log: "📱 Mobile experience overhauled. New users incoming." },
  { id: "infra_scale",     emoji: "⚙️", label: "Scale Infrastructure", desc: "Upgrade servers and database for 10x load",            energyCost: 10, cashCost: 15000, effects: { reliability: 20, technical_debt: -10 },       log: "⚙️ Infrastructure scaled for growth." },
];

const STORY_GROWTH_ACTIONS: StoryAction[] = [
  { id: "content_marketing", emoji: "✍️", label: "Content Marketing",   desc: "Publish thought leadership to drive organic traffic",   energyCost: 5,  effects: { brand_awareness: 8, users: 200, pmf_score: 2 },               log: "✍️ Content published. Organic reach growing." },
  { id: "influencer_collab", emoji: "🎙️", label: "Influencer Campaign", desc: "Partner with industry influencer for viral reach",      energyCost: 8,  cashCost: 8000, effects: { brand_awareness: 15, users: 1000 },            log: "🎙️ Influencer campaign launched. Brand exploding." },
  { id: "seo_push",          emoji: "🔎", label: "SEO Blitz",           desc: "Aggressive SEO push across blog + landing pages",      energyCost: 6,  cashCost: 3000, effects: { brand_awareness: 6, users: 400 },              log: "🔎 SEO blitz complete. Ranking climbing." },
  { id: "product_hunt",      emoji: "🦁", label: "Product Hunt Launch", desc: "Time a Product Hunt launch for mass awareness",        energyCost: 12, effects: { brand_awareness: 25, users: 2000, pmf_score: 5 },              log: "🦁 Product Hunt launched. Trending #1 today." },
  { id: "press_release",     emoji: "📰", label: "Press Release",       desc: "Issue a press release to key tech publications",       energyCost: 5,  cashCost: 2000, effects: { brand_awareness: 10, users: 500 },             log: "📰 Press release issued. Tech media picking it up." },
  { id: "conference_talk",   emoji: "🎤", label: "Conference Talk",     desc: "Keynote at a top industry conference",                  energyCost: 10, cashCost: 5000, effects: { brand_awareness: 12, users: 800, pmf_score: 3 }, log: "🎤 Keynote delivered. Industry buzz generated." },
  { id: "referral_program",  emoji: "🤝", label: "Referral Program",    desc: "Launch viral referral loop for existing users",         energyCost: 8,  cashCost: 4000, effects: { users: 1500, brand_awareness: 5 },              log: "🤝 Referral program live. Viral coefficient rising." },
];

const STORY_TEAM_BULK_ACTIONS: StoryAction[] = [
  { id: "team_bonus",     emoji: "💸", label: "Issue Bonus",          desc: "Pay quarterly performance bonus to all staff",          energyCost: 4,  cashCost: 10000, effects: { team_morale: 20 },                            log: "💸 Bonus issued to all staff. Morale surging." },
  { id: "team_offsite",   emoji: "🏕️", label: "Team Offsite",         desc: "Take the team on a 3-day bonding retreat",              energyCost: 6,  cashCost: 20000, effects: { team_morale: 30 },                            log: "🏕️ Offsite complete. Team cohesion at peak." },
  { id: "salary_raise",   emoji: "💰", label: "Company-Wide Raise",   desc: "Give everyone a 10% salary increase",                  energyCost: 3,  cashCost: 0,     effects: { team_morale: 15 },                            log: "💰 Company-wide raise applied. Team retention secured." },
  { id: "stock_grant",    emoji: "📄", label: "Stock Refresh",        desc: "Grant ESOP refresh to retain key talent",               energyCost: 5,  cashCost: 0,     effects: { team_morale: 10 },                            log: "📄 ESOP stock refresh granted. Loyalty locked in." },
  { id: "diversity_hire", emoji: "🌍", label: "Diversity Initiative", desc: "Launch structured D&I hiring program",                  energyCost: 6,  cashCost: 8000,  effects: { team_morale: 8, brand_awareness: 5 },        log: "🌍 D&I hiring initiative launched. Culture strengthened." },
  { id: "remote_policy",  emoji: "🏠", label: "Remote-First Policy",  desc: "Formalize flexible remote-work policy",                 energyCost: 3,  cashCost: 0,     effects: { team_morale: 12, founder_burnout: -5 },      log: "🏠 Remote-first policy enacted. Flexibility unlocked." },
];

const STORY_PR_ACTIONS: StoryAction[] = [
  { id: "crisis_pr",        emoji: "🆘", label: "Hire Crisis PR Firm",  desc: "Engage elite PR firm to manage negative press",         energyCost: 8,  cashCost: 15000, effects: { brand_awareness: 5, team_morale: 5 },          log: "🆘 Crisis PR firm engaged. Narrative controlled." },
  { id: "ceo_interview",    emoji: "🎙️", label: "CEO Media Tour",       desc: "Hit the podcast circuit and tier-1 media",              energyCost: 10, effects: { brand_awareness: 12, pmf_score: 3 },                           log: "🎙️ CEO media tour complete. Profile elevated." },
  { id: "analyst_briefing", emoji: "📊", label: "Analyst Briefing",     desc: "Brief top industry analysts on your traction",          energyCost: 6,  cashCost: 5000, effects: { brand_awareness: 8, pmf_score: 5 },             log: "📊 Analyst briefing held. Favorable coverage expected." },
  { id: "award_entry",      emoji: "🏆", label: "Industry Award Push",  desc: "Submit for Forbes, Inc 5000, Glassdoor Best Place",     energyCost: 4,  cashCost: 2000, effects: { brand_awareness: 10, team_morale: 8 },          log: "🏆 Award submissions filed. Recognition incoming." },
  { id: "twitter_thread",   emoji: "🐦", label: "Viral Founder Thread", desc: "Share a raw, transparent founder story publicly",       energyCost: 3,  effects: { brand_awareness: 8, users: 300 },                              log: "🐦 Founder thread went viral. Community rallying." },
  { id: "whitepaper",       emoji: "📄", label: "Publish Whitepaper",   desc: "Deep technical whitepaper to establish thought leadership", energyCost: 8, cashCost: 3000, effects: { brand_awareness: 7, innovation: 5, pmf_score: 4 }, log: "📄 Whitepaper published. Domain authority established." },
];

const STORY_FUNDING_ACTIONS: StoryAction[] = [
  { id: "angel_pitch",    emoji: "👼", label: "Angel Pitch",          desc: "Pitch 3 angel investors for early capital",             energyCost: 10, effects: { brand_awareness: 3 },  log: "👼 Angel pitches done. Term sheets incoming." },
  { id: "vc_pitch",       emoji: "💼", label: "VC Partner Meeting",   desc: "Formal Series A partner-level meeting",                 energyCost: 15, effects: { brand_awareness: 5 },  log: "💼 VC partner meeting completed. Due diligence started." },
  { id: "build_pipeline", emoji: "📋", label: "Build Investor Pipeline", desc: "Add 10 new qualified leads to your funnel",           energyCost: 6,  effects: { brand_awareness: 2 },  log: "📋 Investor pipeline expanded by 10 leads." },
  { id: "demo_day",       emoji: "🎪", label: "Demo Day",             desc: "Present at Y Combinator / Techstars Demo Day",          energyCost: 12, effects: { brand_awareness: 15, users: 500 }, log: "🎪 Demo Day complete. Buzz at an all-time high." },
  { id: "data_room",      emoji: "🗂️", label: "Prep Data Room",       desc: "Organize financials and metrics for due diligence",     energyCost: 5,  effects: { pmf_score: 2 },         log: "🗂️ Data room organized. Investor confidence up." },
  { id: "debt_bridge",    emoji: "🏦", label: "Venture Debt Bridge",  desc: "Non-dilutive bridge loan to extend runway",             energyCost: 5,  cashCost: -50000, effects: { burn_rate: 5000 }, log: "🏦 Venture debt bridge secured. Runway extended." },
];

const STORY_RIVAL_ACTIONS: StoryAction[] = [
  { id: "poach_talent",    emoji: "🎯", label: "Poach Key Talent",    desc: "Recruit one of their best engineers or designers",      energyCost: 10, cashCost: 10000, effects: { product_quality: 8, innovation: 5 },          log: "🎯 Competitor's key engineer poached. Tech advantage secured." },
  { id: "price_undercut",  emoji: "💸", label: "Price War",           desc: "Drop pricing aggressively to undercut the rival",       energyCost: 5,  effects: { users: 800, revenue: -5000, brand_awareness: 5 },               log: "💸 Initiated price war. Market share gained, margins hit." },
  { id: "patent_block",    emoji: "⚖️", label: "File Patent Block",   desc: "File defensive patents to block competitor",            energyCost: 8,  cashCost: 20000, effects: { brand_awareness: 5, pmf_score: 3 },          log: "⚖️ Defensive patents filed. Legal moat established." },
  { id: "press_attack",    emoji: "📰", label: "Negative PR Push",    desc: "Plant unfavorable coverage of rival in press",          energyCost: 8,  cashCost: 5000, effects: { brand_awareness: 6, users: 200 },              log: "📰 Negative PR planted. Rival's reputation dented." },
  { id: "partnership_lock", emoji: "🔒", label: "Exclusive Partnership", desc: "Lock up key distribution partner exclusively",       energyCost: 10, cashCost: 15000, effects: { users: 1000, brand_awareness: 8, pmf_score: 5 }, log: "🔒 Exclusive partnership secured. Rival locked out." },
  { id: "counter_launch",  emoji: "🚀", label: "Counter-Feature Ship", desc: "Ship a direct counter to their announced feature",     energyCost: 12, effects: { product_quality: 10, innovation: 8, users: 500 },             log: "🚀 Counter-feature shipped. Neutralized their advantage." },
];

const STORY_VITALS_ACTIONS: StoryAction[] = [
  { id: "meditation",     emoji: "🧘", label: "Mindfulness Retreat",  desc: "3 days of meditation and digital detox",               energyCost: 0,  cashCost: 3000, effects: { founder_burnout: -25, founder_health: 15 },    log: "🧘 Mindfulness retreat complete. Mental clarity restored." },
  { id: "exec_coach",     emoji: "🎓", label: "Executive Coach",      desc: "Weekly sessions with a top-tier exec coach",            energyCost: 0,  cashCost: 5000, effects: { founder_burnout: -10, founder_health: 10 },    log: "🎓 Executive coaching engaged. Performance sharpened." },
  { id: "delegate",       emoji: "📋", label: "Delegate & Unblock",   desc: "Hand off 3 critical tasks to leads",                   energyCost: 0,  effects: { founder_burnout: -15, team_morale: 5 },                          log: "📋 Delegation complete. CEO bandwidth recovered." },
  { id: "health_protocol", emoji: "💪", label: "Founder Health Protocol", desc: "Sleep schedule, nutrition, and exercise reset",    energyCost: 0,  cashCost: 2000, effects: { founder_health: 20, founder_burnout: -10 },    log: "💪 Health protocol started. Stamina improving." },
  { id: "weekend_off",    emoji: "🏖️", label: "Take the Weekend",     desc: "Force yourself to fully disconnect for 48 hours",      energyCost: 0,  effects: { founder_burnout: -20, founder_health: 10 },                      log: "🏖️ Weekend off taken. Energy partially restored." },
];

const STORY_PERKS_ACTIONS: StoryAction[] = [
  { id: "speak_conf",    emoji: "🎤", label: "Speak at Davos",        desc: "High-profile keynote builds legendary CEO presence",    energyCost: 8,  cashCost: 20000, effects: { brand_awareness: 20, pmf_score: 5 },          log: "🎤 Davos keynote delivered. Global CEO brand established." },
  { id: "author_book",   emoji: "📚", label: "Write Bestseller",      desc: "Publish a business book to cement thought leadership",  energyCost: 12, cashCost: 5000, effects: { brand_awareness: 25, pmf_score: 8 },           log: "📚 Business book published. Thought leadership secured." },
  { id: "advisory_board", emoji: "🌟", label: "Build Advisory Board", desc: "Add 3 legendary advisors to your personal board",      energyCost: 8,  cashCost: 0,   effects: { pmf_score: 6, innovation: 8, brand_awareness: 8 }, log: "🌟 Advisory board assembled. Strategic advantage gained." },
  { id: "ted_talk",      emoji: "🎯", label: "TED Talk",              desc: "Deliver a viral TED talk to 10M+ viewers",             energyCost: 10, cashCost: 0,   effects: { brand_awareness: 30, users: 2000 },                log: "🎯 TED talk live. Viral reach beyond expectations." },
];

const STORY_LEGACY_ACTIONS: StoryAction[] = [
  { id: "donate_edu",     emoji: "🎓", label: "Education Foundation", desc: "Launch a $1M scholarship for STEM students",            energyCost: 5, cashCost: 100000, effects: { brand_awareness: 10, team_morale: 8 },         log: "🎓 Education foundation launched. Community goodwill earned." },
  { id: "carbon_neutral", emoji: "🌿", label: "Carbon Neutral Pledge", desc: "Commit the company to carbon-neutral operations",      energyCost: 6, cashCost: 50000, effects: { brand_awareness: 8, team_morale: 5, users: 300 }, log: "🌿 Carbon neutral pledge announced. Brand differentiation established." },
  { id: "open_source",    emoji: "💻", label: "Open Source Initiative", desc: "Open-source a core library to the community",         energyCost: 8, cashCost: 0,    effects: { brand_awareness: 12, innovation: 6, users: 500 }, log: "💻 Open source contribution made. Developer community energized." },
];

// ─── Toast mini-system ────────────────────────────────────────────────────────
type ToastEntry = { id: number; msg: string; type: "success" | "error" | "info" };
let _toastId = 0;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StoryDashboard({
  campaign, initialSnapshot, initialStoryState, onSave,
}: Props) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<StoryStartupSnapshot>(initialSnapshot);
  const [storyState, setStoryState] = useState<StoryModeState>(initialStoryState);
  const [currentMonth, setCurrentMonth] = useState(initialStoryState.currentMonth);

  // Event queue
  const [pendingEvents, setPendingEvents] = useState<StoryEvent[]>([]);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  // Modals
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showKeynote, setShowKeynote] = useState(false);
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [pendingChoiceId, setPendingChoiceId] = useState<string | null>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [pitchVCPersonality, setPitchVCPersonality] = useState<VCPersonality>("data_driven");

  // Month summary
  const [monthNotices, setMonthNotices] = useState<string[]>([]);
  const [showNotices, setShowNotices] = useState(false);

  // Game end
  const [gameEnd, setGameEnd] = useState<{ reason: GameEndReason; message: string } | null>(null);

  // Advancing
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Navigation state (3-level: main → subcategory → action detail)
  const [activeTab, setActiveTab] = useState<MainTab | null>(null);
  const [activeSubcat, setActiveSubcat] = useState<SubCategory | null>(null);

  // Focus energy (refills each month)
  const [focusUsed, setFocusUsed] = useState(0);
  const maxFocus = Math.max(20, 80 - Math.floor((snapshot.metrics.founder_burnout || 0) * 0.6));

  // Milestone expand
  const [isMilestoneExpanded, setIsMilestoneExpanded] = useState(false);

  // Toast system
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  // Timeline log
  const [timeline, setTimeline] = useState<{ month: number; text: string }[]>([
    { month: initialStoryState.currentMonth, text: `📖 Story begins — ${campaign.companyName} is founded. ${campaign.tagline}` },
  ]);

  const accentColor = campaign.themeColors.accent;
  const m = snapshot.metrics;
  const currentEvent = pendingEvents[currentEventIdx] ?? null;
  const actDef = campaign.acts.find((a) => a.act === storyState.currentAct);

  // ── Toast helper ───────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    const id = ++_toastId;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }

  function addLog(text: string, monthOverride?: number) {
    setTimeline((prev) => [...prev, { month: monthOverride ?? currentMonth, text }]);
  }

  // ── Execute story action ───────────────────────────────────────────────────
  function executeAction(action: StoryAction) {
    if (focusUsed + action.energyCost > maxFocus && action.energyCost > 0) {
      showToast("Not enough Focus Energy! Advance to next month to refill.", "error");
      return;
    }
    if (action.requiresCash && m.cash < action.requiresCash) {
      showToast(`Need ${fmtCash(action.requiresCash)} cash for this action.`, "error");
      return;
    }

    // Apply effects
    setSnapshot((prev) => {
      const updated = { ...prev, metrics: { ...prev.metrics } };
      // Cash cost (negative cashCost = loan)
      if (action.cashCost && action.cashCost > 0) {
        updated.metrics.cash = Math.max(0, prev.metrics.cash - action.cashCost);
      } else if (action.cashCost && action.cashCost < 0) {
        // Negative = gain cash (e.g. debt)
        updated.metrics.cash = prev.metrics.cash + Math.abs(action.cashCost);
        updated.metrics.burn_rate = (prev.metrics.burn_rate || 0) + (action.effects.burn_rate || 0);
      }
      // Apply metric effects
      const effects = action.effects;
      if (effects.product_quality !== undefined) updated.metrics.product_quality = Math.min(100, Math.max(0, (prev.metrics.product_quality || 0) + effects.product_quality));
      if (effects.technical_debt !== undefined) updated.metrics.technical_debt = Math.min(100, Math.max(0, (prev.metrics.technical_debt || 0) + effects.technical_debt));
      if (effects.reliability !== undefined) updated.metrics.reliability = Math.min(100, Math.max(0, (prev.metrics.reliability || 0) + effects.reliability));
      if (effects.innovation !== undefined) updated.metrics.innovation = Math.min(100, Math.max(0, (prev.metrics.innovation || 0) + effects.innovation));
      if (effects.pmf_score !== undefined) updated.metrics.pmf_score = Math.min(100, Math.max(0, (prev.metrics.pmf_score || 0) + effects.pmf_score));
      if (effects.brand_awareness !== undefined) updated.metrics.brand_awareness = Math.min(100, Math.max(0, (prev.metrics.brand_awareness || 0) + effects.brand_awareness));
      if (effects.team_morale !== undefined) updated.metrics.team_morale = Math.min(100, Math.max(0, (prev.metrics.team_morale || 0) + effects.team_morale));
      if (effects.users !== undefined) updated.metrics.users = Math.max(0, (prev.metrics.users || 0) + effects.users);
      if (effects.revenue !== undefined) updated.metrics.revenue = Math.max(0, (prev.metrics.revenue || 0) + effects.revenue);
      if (effects.founder_burnout !== undefined) updated.metrics.founder_burnout = Math.min(100, Math.max(0, (prev.metrics.founder_burnout || 0) + effects.founder_burnout));
      if (effects.founder_health !== undefined) updated.metrics.founder_health = Math.min(100, Math.max(0, (prev.metrics.founder_health || 0) + effects.founder_health));
      // Recalculate runway
      const burn = updated.metrics.burn_rate || updated.metrics.cash / Math.max(1, 12);
      updated.metrics.runway = burn > 0 ? Math.floor(updated.metrics.cash / burn) : 99;
      return updated;
    });

    if (action.energyCost > 0) setFocusUsed((p) => p + action.energyCost);
    addLog(action.log);
    onSave(snapshot, storyState);
    showToast(action.log, "success");
  }

  // ── Advance Month ──────────────────────────────────────────────────────────
  const advanceMonth = useCallback(() => {
    if (isAdvancing || pendingEvents.length > 0) return;
    setIsAdvancing(true);
    setActiveTab(null);
    setActiveSubcat(null);

    const nextMonth = currentMonth + 1;
    const { newSnapshot: afterMonth, notices: monthNotes } = processStoryMonth(snapshot, storyState);
    const updatedStoryState = { ...storyState, currentMonth: nextMonth, lastMonthNotices: monthNotes };

    const betrayals = checkBetrayalThresholds(updatedStoryState);
    const allNotices = [...monthNotes];
    betrayals.forEach((b) => allNotices.push(`⚠️ ${b.warningMessage}`));

    const events = checkStoryEvents(afterMonth, updatedStoryState, nextMonth);

    const lossReason = checkLossConditions(afterMonth);
    if (lossReason) {
      setSnapshot(afterMonth); setStoryState(updatedStoryState); setCurrentMonth(nextMonth);
      onSave(afterMonth, updatedStoryState);
      setGameEnd({ reason: "loss", message: lossReason }); setIsAdvancing(false); return;
    }
    if (checkWinCondition(afterMonth, updatedStoryState)) {
      setSnapshot(afterMonth); setStoryState(updatedStoryState); setCurrentMonth(nextMonth);
      onSave(afterMonth, updatedStoryState);
      setGameEnd({ reason: "win", message: campaign.winCondition.description }); setIsAdvancing(false); return;
    }

    setSnapshot(afterMonth); setStoryState(updatedStoryState); setCurrentMonth(nextMonth);
    onSave(afterMonth, updatedStoryState);
    setFocusUsed(0); // Refill energy each month

    addLog(`Month ${nextMonth} begins.`, nextMonth);
    allNotices.forEach((n) => addLog(n, nextMonth));

    if (allNotices.length > 0) { setMonthNotices(allNotices); setShowNotices(true); }
    if (events.length > 0) { setPendingEvents(events); setCurrentEventIdx(0); }
    setIsAdvancing(false);
  }, [isAdvancing, pendingEvents.length, snapshot, storyState, currentMonth, campaign, onSave]);

  // ── Choice/Minigame handling ───────────────────────────────────────────────
  function handleChoiceMade(choiceId: string, succeeded: boolean) {
    const event = pendingEvents[currentEventIdx];
    if (!event) return;
    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    if (choice.triggersKeynoteMiniGame) { setPendingChoiceId(choiceId); setPendingEventId(event.id); setShowKeynote(true); return; }
    if (choice.triggersPitchDeckGame) { setPendingChoiceId(choiceId); setPendingEventId(event.id); setPitchVCPersonality(getRandomVCPersonality()); setShowPitchDeck(true); return; }
    resolveChoice(event.id, choiceId, succeeded);
  }

  function resolveChoice(eventId: string, choiceId: string, succeeded: boolean) {
    const { newSnapshot, newStoryState, notices } = applyStoryChoice(snapshot, storyState, eventId, choiceId, succeeded);
    setSnapshot(newSnapshot); setStoryState(newStoryState);
    notices.forEach((n) => addLog(n));
    if (notices.length > 0) { setMonthNotices((p) => [...p, ...notices]); setShowNotices(true); }
    const nextIdx = currentEventIdx + 1;
    if (nextIdx < pendingEvents.length) setCurrentEventIdx(nextIdx);
    else { setPendingEvents([]); setCurrentEventIdx(0); }
    onSave(newSnapshot, newStoryState);
  }

  function handleKeynoteComplete(score: number) {
    setShowKeynote(false);
    if (!pendingEventId || !pendingChoiceId) return;
    resolveChoice(pendingEventId, pendingChoiceId, score >= 50);
    setStoryState((p) => ({ ...p, keynoteScores: [...p.keynoteScores, { eventId: pendingEventId!, score }] }));
    setPendingChoiceId(null); setPendingEventId(null);
  }

  function handlePitchComplete(result: PitchDeckResult, cashBonus: number) {
    setShowPitchDeck(false);
    if (!pendingEventId || !pendingChoiceId) return;
    const succeeded = result !== "rejected";
    const { newSnapshot, newStoryState, notices } = applyStoryChoice(snapshot, storyState, pendingEventId, pendingChoiceId, succeeded);
    const finalSnapshot: StoryStartupSnapshot = { ...newSnapshot, metrics: { ...newSnapshot.metrics, cash: newSnapshot.metrics.cash + cashBonus } };
    setSnapshot(finalSnapshot);
    setStoryState({ ...newStoryState, pitchResults: [...newStoryState.pitchResults, { eventId: pendingEventId!, won: succeeded, result }] });
    notices.forEach((n) => addLog(n));
    if (notices.length > 0) { setMonthNotices((p) => [...p, ...notices]); setShowNotices(true); }
    const nextIdx = currentEventIdx + 1;
    if (nextIdx < pendingEvents.length) setCurrentEventIdx(nextIdx);
    else { setPendingEvents([]); setCurrentEventIdx(0); }
    setPendingChoiceId(null); setPendingEventId(null);
    onSave(finalSnapshot, newStoryState);
  }

  function handleSprintSave(allocation: SprintAllocation) {
    const updated = { ...storyState, sprintAllocation: allocation };
    setStoryState(updated); setShowSprintModal(false); onSave(snapshot, updated);
  }

  // ── Stage data ─────────────────────────────────────────────────────────────
  let stageIndex = 0;
  const val = snapshot.valuation;
  if (val >= 1e12) stageIndex = 5;
  else if (val >= 1e9) stageIndex = 4;
  else if (val >= 1e8) stageIndex = 3;
  else if (val >= 1.5e7) stageIndex = 2;
  else if (val >= 2e6) stageIndex = 1;
  const STAGE_DATA = [
    { icon: "🏠", label: "Garage",  next: "Traction", desc: "Build MVP and gather initial organic users.", pct: "15%" },
    { icon: "🚀", label: "Traction",next: "PMF",      desc: "Test channels and expand onboarding.",         pct: "30%" },
    { icon: "📈", label: "PMF",     next: "Scaling",  desc: "Accelerate growth, scale structural hires.",   pct: "50%" },
    { icon: "🏢", label: "Scaling", next: "Empire",   desc: "Optimize unit economics, dominate market.",    pct: "75%" },
    { icon: "🦄", label: "Empire",  next: "Legend",   desc: "Unicorn status. Continue dominating.",         pct: "95%" },
    { icon: "👑", label: "Legend",  next: null,       desc: "A trillion-dollar titan.",                      pct: "100%" },
  ];
  const currentStage = STAGE_DATA[stageIndex];

  // ── Game End ───────────────────────────────────────────────────────────────
  if (gameEnd) {
    const isWin = gameEnd.reason === "win";
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl mb-6">{isWin ? "🏆" : "💀"}</motion.div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{isWin ? "You Made History." : "Game Over."}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm text-sm">{gameEnd.message}</p>
        {isWin && <div className="px-4 py-3 rounded-xl mb-6 text-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700">{campaign.winCondition.description} — Month {currentMonth}</div>}
        <div className="text-slate-500 text-sm mb-1">Valuation: <span className="font-black text-slate-900 dark:text-white">{fmtCash(snapshot.valuation)}</span></div>
        <div className="text-slate-500 text-sm mb-8">Users: <span className="font-black text-slate-900 dark:text-white">{fmtNum(m.users)}</span></div>
        <button onClick={() => router.push("/story-mode")} className="px-8 py-4 rounded-2xl font-black text-white text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)`, boxShadow: `0 8px 24px ${accentColor}44` }}>
          ← Back to Campaigns
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] flex flex-col h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none">

      {/* TOAST OVERLAY */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={cn("px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xl max-w-xs text-center",
                t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-rose-600" : "bg-indigo-600")}>
              {t.msg.slice(0, 80)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PROCESSING OVERLAY */}
      <AnimatePresence>
        {isAdvancing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[10000] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">{campaign.founderEmoji}</div>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Simulating Month {currentMonth + 1}...</h3>
            <p className="text-emerald-400/80 font-bold text-xs uppercase tracking-widest animate-pulse">Advancing Story Timeline</p>
            <div className="flex gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-emerald-500" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between shadow-sm" style={{ paddingBottom: "10px", paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-800" style={{ background: `${accentColor}18` }}>
            {campaign.founderEmoji}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{campaign.companyName}</p>
            <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-none">Month {currentMonth}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Story Mode · {campaign.founderName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-black px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1">
            <span className="text-[10px]">💰</span> {fmtCash(m.cash)}
          </div>
          <div className="text-[10px] font-black px-2.5 py-1.5 rounded-full shrink-0 hidden sm:flex items-center" style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}44` }}>
            ACT {storyState.currentAct}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 flex items-center justify-center transition-colors">
              <Menu className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mr-2 shadow-xl border-slate-200 dark:border-slate-800">
              <div className="px-2 py-1.5 font-black text-xs text-slate-400 uppercase tracking-widest cursor-default select-none">Story Mode</div>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-indigo-50 dark:focus:bg-indigo-900/40 focus:text-indigo-600 font-bold transition-colors" onClick={() => onSave(snapshot, storyState)}>
                <Save className="mr-2 h-4 w-4" /> Save Progress
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 dark:focus:bg-rose-900/40 focus:text-rose-600 font-bold transition-colors" onClick={() => router.push("/story-mode")}>
                ← Return to Campaigns
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── MILESTONE CARD ─────────────────────────────────────────────────────── */}
      <div onClick={() => setIsMilestoneExpanded(!isMilestoneExpanded)}
        className="shrink-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentStage.icon}</span>
            <div>
              <p className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-none">Current Milestone</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {currentStage.label}
                {currentStage.next && <span className="text-slate-300 font-medium text-[9px] ml-1">→ Next: {currentStage.next}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: currentStage.pct, background: accentColor }} />
            </div>
            <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform", isMilestoneExpanded ? "rotate-180" : "")} />
          </div>
        </div>
        {isMilestoneExpanded && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mt-1">
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-normal">{currentStage.desc}</p>
            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-2">🎯 Win: {campaign.winCondition.description}</p>
          </div>
        )}
      </div>

      {/* ── FOCUS ENERGY BAR ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <div>
            <p className="text-xs font-black text-indigo-900 dark:text-indigo-100 leading-none">Focus Energy</p>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-0.5">Refills each month</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (1 - focusUsed / maxFocus) * 100)}%`, background: focusUsed / maxFocus > 0.8 ? "#ef4444" : accentColor }} />
          </div>
          <span className={cn("text-xl font-black tracking-tighter leading-none", focusUsed / maxFocus > 0.8 ? "text-rose-600" : "text-indigo-700 dark:text-indigo-300")}>
            {maxFocus - focusUsed}h
          </span>
          <span className="text-sm font-bold text-indigo-400">/ {maxFocus}</span>
        </div>
      </div>

      {/* ── STATS SCROLL BAR ───────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        {[
          { icon: "👥", label: fmtNum(m.users), sub: "Users", color: "text-slate-800 dark:text-slate-100" },
          { icon: "💵", label: fmtCash(m.revenue > 0 ? m.revenue : 0), sub: "MRR", color: "text-emerald-700 dark:text-emerald-400" },
          { icon: "🔥", label: `${Math.round(m.founder_burnout || 0)}%`, sub: "Burnout", color: (m.founder_burnout || 0) > 60 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400" },
          { icon: "🏅", label: `${snapshot.ceo_reputation}/100`, sub: "CEO Rep", color: snapshot.ceo_reputation >= 70 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600" },
          { icon: "📦", label: `${m.product_quality}/100`, sub: "Product", color: "text-blue-600 dark:text-blue-400" },
          { icon: "🧭", label: `${m.pmf_score}/100`, sub: "PMF", color: "text-violet-600 dark:text-violet-400" },
          { icon: "🔴", label: `${m.technical_debt}/100`, sub: "Tech Debt", color: m.technical_debt > 60 ? "text-rose-600" : "text-slate-500" },
        ].map((stat, i) => (
          <div key={i} className="flex-1 shrink-0 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm min-w-[80px]">
            <span className="text-lg">{stat.icon}</span>
            <div className="flex flex-col">
              <span className={cn("text-sm font-black leading-none", stat.color)}>{stat.label}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── TIMELINE FEED (BitLife style) ──────────────────────────────────────── */}
      <div className="flex flex-col-reverse overflow-y-auto px-3 pt-3 pb-5 flex-1">
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-4xl mb-3">📖</div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your story begins</p>
          </div>
        ) : (() => {
          const byMonth: Record<number, typeof timeline> = {};
          timeline.forEach((ev) => { if (!byMonth[ev.month]) byMonth[ev.month] = []; byMonth[ev.month].push(ev); });
          const sortedMonths = Object.keys(byMonth).map(Number).sort((a, b) => b - a);
          const getStyle = (text: string) => {
            if (text.includes("Raised") || text.includes("pitch") || text.includes("💼") || text.includes("👼")) return { strip: "#7c3aed", label: "Funding" };
            if (text.includes("⚠️") || text.includes("Crisis") || text.includes("Burnout")) return { strip: "#dc2626", label: "Crisis" };
            if (text.includes("🏆") || text.includes("success") || text.includes("complete")) return { strip: "#d97706", label: "Win" };
            if (text.includes("Team") || text.includes("hired") || text.includes("💸") || text.includes("🏕️")) return { strip: "#0284c7", label: "Team" };
            if (text.includes("begins") || text.includes("founded") || text.includes("📖")) return { strip: "#059669", label: "Milestone" };
            if (text.includes("rival") || text.includes("Competitor") || text.includes("⚔️") || text.includes("🎯")) return { strip: "#ea580c", label: "Market" };
            return { strip: "#6366f1", label: "Event" };
          };
          return sortedMonths.map((monthNum) => {
            const events = byMonth[monthNum] || [];
            const isCurrent = monthNum === currentMonth;
            return (
              <div key={monthNum} className="mb-4">
                <div className="flex items-center gap-2 mb-2 py-1">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCurrent ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                    Month {monthNum}{isCurrent ? " · Now" : ""}
                  </div>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="space-y-2">
                  {events.map((ev, i) => {
                    const style = getStyle(ev.text);
                    return (
                      <div key={i} className="flex gap-0 items-stretch rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="w-1 shrink-0 rounded-l-lg" style={{ backgroundColor: style.strip }} />
                        <div className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: style.strip }}>{style.label}</span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">{ev.text}</p>
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

      {/* ── MAIN CONTROLS (bottom) ─────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>
        <div className="max-w-md mx-auto flex flex-col gap-4">
          {/* ADVANCE MONTH */}
          <button onClick={advanceMonth} disabled={isAdvancing || pendingEvents.length > 0}
            className={cn("w-full h-14 rounded-2xl text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg", (isAdvancing || pendingEvents.length > 0) && "opacity-60")}
            style={{ background: isAdvancing || pendingEvents.length > 0 ? "linear-gradient(135deg, #818cf8, #a78bfa)" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }}>
            {isAdvancing ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simulating Month {currentMonth}...</>
              : pendingEvents.length > 0 ? "📋 Resolve Event First"
              : <>Advance to Month {currentMonth + 1} ▶</>}
          </button>

          {/* 5 MAIN TABS */}
          <div className="grid grid-cols-5 gap-1.5">
            {MAIN_TABS.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(activeTab === tab.id ? null : tab.id); setActiveSubcat(null); }}
                className={cn("flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 active:scale-95 transition-all",
                  activeTab === tab.id ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900")}>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border", tab.color)}>
                  <span className="drop-shadow-sm">{tab.emoji}</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUBMENU (level 2): Sub-category grid ────────────────────────────────── */}
      <AnimatePresence>
        {activeTab && activeTab !== "acts" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] flex flex-col">
            {/* Submenu header */}
            <div className="border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)", paddingBottom: "8px", minHeight: "56px" }}>
              <button onClick={() => { setActiveTab(null); setActiveSubcat(null); }} className="mr-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-sm">←</button>
              <div className="flex items-center gap-2">
                <span className="text-xl">{MAIN_TABS.find((t) => t.id === activeTab)?.emoji}</span>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{MAIN_TABS.find((t) => t.id === activeTab)?.label}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Story Mode · {campaign.founderName}</p>
                </div>
              </div>
            </div>
            {/* Sub-category grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ paddingBottom: "2rem" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {(TAB_SUBCATS[activeTab] || []).map((cat) => (
                  <button key={cat.id} onClick={() => setActiveSubcat(cat.id)}
                    className="p-5 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-[0.98] bg-white dark:bg-slate-900/60"
                    style={{ borderColor: cat.border }}>
                    <span className="text-4xl drop-shadow-sm">{cat.emoji}</span>
                    <div className="text-left flex-1">
                      <span className="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider leading-tight">{cat.label}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.desc}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTION PANEL (level 3): Full action content ──────────────────────────── */}
      <AnimatePresence>
        {activeSubcat && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[200] flex flex-col">
            {/* Action panel header */}
            <div className="border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)", paddingBottom: "8px", minHeight: "56px" }}>
              <button onClick={() => setActiveSubcat(null)} className="mr-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-sm">←</button>
              <h2 className="shrink-0 font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm text-center mt-auto mb-1.5 mx-2">
                {TAB_SUBCATS[activeTab!]?.find((c) => c.id === activeSubcat)?.emoji} {TAB_SUBCATS[activeTab!]?.find((c) => c.id === activeSubcat)?.label}
              </h2>
            </div>
            {/* Action content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ paddingBottom: "2rem" }}>
              <div className="max-w-3xl mx-auto">
                <ActionPanel
                  subcat={activeSubcat}
                  snapshot={snapshot}
                  storyState={storyState}
                  campaign={campaign}
                  currentMonth={currentMonth}
                  focusUsed={focusUsed}
                  maxFocus={maxFocus}
                  accentColor={accentColor}
                  onAction={executeAction}
                  onOpenSprint={() => { setActiveSubcat(null); setActiveTab(null); setShowSprintModal(true); }}
                  onLog={addLog}
                  onUpdateSnapshot={setSnapshot}
                  onUpdateStoryState={setStoryState}
                  onShowToast={showToast}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTS PANEL ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab === "acts" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] flex flex-col">
            <div className="border-b border-slate-200 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 shadow-sm"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)", paddingBottom: "8px", minHeight: "56px" }}>
              <button onClick={() => setActiveTab(null)} className="mr-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-sm">←</button>
              <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">📖 Campaign Acts</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ActsPanel campaign={campaign} storyState={storyState} currentMonth={currentMonth} accentColor={accentColor} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALS ────────────────────────────────────────────────────────────── */}
      {currentEvent && !showKeynote && !showPitchDeck && (
        <StoryEventModal event={currentEvent} snapshot={snapshot} storyState={storyState} campaign={campaign} onChoiceMade={handleChoiceMade} />
      )}

      {showNotices && monthNotices.length > 0 && !currentEvent && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowNotices(false)}>
          <div className="w-full max-w-lg rounded-2xl p-5 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
            <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3">Month {currentMonth} Summary</div>
            {monthNotices.map((n, i) => (
              <div key={i} className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 flex items-start gap-2">
                <span className="text-slate-400 shrink-0 mt-0.5">·</span>{n}
              </div>
            ))}
            <button className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }} onClick={() => setShowNotices(false)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {showKeynote && <KeynoteModal onComplete={handleKeynoteComplete} />}
      {showPitchDeck && <PitchDeckModal vcPersonality={pitchVCPersonality} baseFunding={5_000_000} onComplete={handlePitchComplete} />}
      {showSprintModal && <SprintModal currentAllocation={storyState.sprintAllocation} onSave={handleSprintSave} onClose={() => setShowSprintModal(false)} accentColor={accentColor} />}
    </div>
  );
}

// ─── ActionPanel: renders the correct panel for each sub-category ─────────────
function ActionPanel({
  subcat, snapshot, storyState, campaign, currentMonth,
  focusUsed, maxFocus, accentColor,
  onAction, onOpenSprint, onLog, onUpdateSnapshot, onUpdateStoryState, onShowToast,
}: {
  subcat: SubCategory;
  snapshot: StoryStartupSnapshot;
  storyState: StoryModeState;
  campaign: StoryCampaign;
  currentMonth: number;
  focusUsed: number;
  maxFocus: number;
  accentColor: string;
  onAction: (a: StoryAction) => void;
  onOpenSprint: () => void;
  onLog: (text: string) => void;
  onUpdateSnapshot: React.Dispatch<React.SetStateAction<StoryStartupSnapshot>>;
  onUpdateStoryState: React.Dispatch<React.SetStateAction<StoryModeState>>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const m = snapshot.metrics;

  const renderActionCard = (action: StoryAction) => {
    const cannotAffordEnergy = focusUsed + action.energyCost > maxFocus && action.energyCost > 0;
    const cannotAffordCash = (action.cashCost || 0) > 0 && m.cash < (action.cashCost || 0);
    const blocked = cannotAffordEnergy || cannotAffordCash;

    const effectLines = Object.entries(action.effects)
      .filter(([k, v]) => v !== 0 && v !== undefined)
      .map(([k, v]) => {
        const sign = (v as number) > 0 ? "+" : "";
        const label = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return `${sign}${v} ${label}`;
      }).join(" · ");

    return (
      <button key={action.id} onClick={() => !blocked && onAction(action)} disabled={blocked}
        className={cn("w-full text-left flex items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-all active:scale-[0.98]",
          blocked ? "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed"
            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20")}>
        <span className="text-xl w-7 text-center shrink-0">{action.emoji}</span>
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{action.label}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">{action.desc}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
          {effectLines && <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-tighter text-right max-w-[120px] whitespace-normal leading-tight">{effectLines}</p>}
          <div className="flex gap-1 items-center">
            {(action.cashCost || 0) > 0 && <span className="text-[8px] font-bold text-rose-500 border border-rose-100 bg-rose-50 px-1.5 py-0.5 rounded-full">💸{fmtCash(action.cashCost!)}</span>}
            {action.energyCost > 0 && <span className="text-[8px] font-black bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">⚡{action.energyCost}h</span>}
            {action.energyCost === 0 && <span className="text-[8px] font-black bg-emerald-50 border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">Free</span>}
          </div>
        </div>
      </button>
    );
  };

  const SH = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-5 first:mt-0">{children}</p>
  );

  const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );

  // ── PRODUCT ────────────────────────────────────────────────────────────────
  if (subcat === "product") {
    const engCapacity = Math.min(100, Math.round((m.product_quality / Math.max(1, Math.pow(m.users, 0.3))) * 100));
    return (
      <div className="space-y-3">
        {/* Engineering Capacity */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="flex justify-between items-end mb-1.5">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Engineering Capacity</p>
              <h3 className={cn("text-xl font-black italic leading-none", engCapacity < 50 ? "text-rose-500" : engCapacity < 80 ? "text-amber-500" : "text-emerald-500")}>{engCapacity}%</h3>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Tech Debt</p>
              <p className="text-xs font-black" style={{ color: m.technical_debt > 60 ? "#ef4444" : "#6366f1" }}>{m.technical_debt}/100</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all", engCapacity < 50 ? "bg-rose-500" : engCapacity < 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${engCapacity}%` }} />
          </div>
        </div>

        {/* Innovation bar */}
        <div className="p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 rounded-2xl">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[10px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-widest">🚀 Innovation Level</p>
            <p className="text-xs font-black text-violet-800 dark:text-violet-300">{Math.round(m.innovation || 0)}/100</p>
          </div>
          <div className="h-1.5 w-full bg-violet-100 dark:bg-violet-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 transition-all" style={{ width: `${m.innovation || 0}%` }} />
          </div>
          <p className="mt-1.5 text-[7px] font-bold text-violet-600 uppercase leading-none">High Innovation boosts valuation & fundraising.</p>
        </div>

        {/* Pricing indicator */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 rounded-2xl flex justify-between items-center">
          <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Pricing Tier</p>
          <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{fmtCash(m.pricing || 0)}/mo</span>
        </div>

        <SH>Requires Focus Energy</SH>
        <div className="space-y-1.5">{STORY_PRODUCT_ACTIONS.map(renderActionCard)}</div>

        <SH>Product Stats</SH>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-2">
          <StatBar label="Quality" value={m.product_quality || 0} color="bg-indigo-500" />
          <StatBar label="Reliability" value={m.reliability || 0} color="bg-cyan-500" />
          <StatBar label="Tech Debt" value={m.technical_debt || 0} color={m.technical_debt > 60 ? "bg-rose-500" : "bg-slate-400"} />
          <StatBar label="PMF Score" value={m.pmf_score || 0} color="bg-violet-500" />
        </div>
      </div>
    );
  }

  // ── GROWTH ─────────────────────────────────────────────────────────────────
  if (subcat === "growth") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Brand", value: `${Math.round(m.brand_awareness || 0)}%`, color: "text-pink-700", bg: "bg-pink-50 border-pink-100" },
            { label: "Users", value: fmtNum(m.users), color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
            { label: "MRR", value: fmtCash(m.revenue), color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100" },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-2xl p-2.5 text-center border", s.bg)}>
              <p className={cn("text-lg font-black leading-none", s.color)}>{s.value}</p>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sprint allocation quick view */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sprint: Marketing Allocation</p>
            <button onClick={onOpenSprint} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg" style={{ color: accentColor, background: `${accentColor}15` }}>Adjust →</button>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${storyState.sprintAllocation.marketing}%`, background: accentColor }} />
          </div>
          <p className="text-[9px] text-slate-400 mt-1">{storyState.sprintAllocation.marketing}% of sprint going to Marketing</p>
        </div>

        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Growth Actions · Focus Required</p>
        <div className="space-y-1.5">{STORY_GROWTH_ACTIONS.map(renderActionCard)}</div>
      </div>
    );
  }

  // ── TEAM ───────────────────────────────────────────────────────────────────
  if (subcat === "team") {
    return (
      <div className="space-y-3">
        <SH>Team Morale & Culture</SH>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Team Morale</p>
            <span className={cn("text-xl font-black", m.team_morale < 40 ? "text-rose-600" : m.team_morale > 70 ? "text-emerald-600" : "text-amber-600")}>{m.team_morale}/100</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", m.team_morale < 40 ? "bg-rose-500" : m.team_morale > 70 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${m.team_morale}%` }} />
          </div>
          {m.team_morale < 40 && <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1.5">⚠️ CRISIS: Low morale causes resignations & productivity loss</p>}
        </div>

        <SH>Bulk HR Policies</SH>
        <div className="space-y-1.5">{STORY_TEAM_BULK_ACTIONS.map(renderActionCard)}</div>

        <SH>Inner Circle Loyalty</SH>
        {storyState.keyPeople.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No key people yet</p>
            <p className="text-[10px] text-slate-300 mt-1">They'll appear as the story progresses</p>
          </div>
        ) : storyState.keyPeople.map((person) => {
          const hearts = Math.round((person.loyalty / 100) * 5);
          const isAtRisk = person.loyalty < person.loyaltyThreshold + 10;
          return (
            <div key={person.id} className={cn("bg-white dark:bg-slate-900 rounded-2xl border shadow-sm px-4 py-3", isAtRisk ? "border-rose-200 dark:border-rose-900/50" : "border-slate-100 dark:border-slate-800")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">{person.emoji}</div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{person.displayName}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{person.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < hearts ? "text-rose-500" : "text-slate-200 dark:text-slate-700"}>♥</span>)}</div>
                  <p className="text-[9px] font-black text-slate-400">{person.loyalty}/100</p>
                </div>
              </div>
              {isAtRisk && <p className="mt-2 text-[9px] font-black text-rose-500 uppercase tracking-widest">⚠️ AT RISK — Loyalty near betrayal threshold</p>}
              <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", person.loyalty < 40 ? "bg-rose-500" : person.loyalty < 70 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${person.loyalty}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── FINANCIALS ─────────────────────────────────────────────────────────────
  if (subcat === "financials") {
    const burn = m.burn_rate || (m.cash > 0 ? m.cash / Math.max(1, m.runway || 12) : 0);
    const netProfit = m.revenue - burn;
    const profitable = netProfit >= 0;
    return (
      <div className="space-y-3">
        <SH>P&L Overview</SH>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Cash", value: fmtCash(m.cash), color: m.cash < 50000 ? "text-rose-600" : "text-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900" },
            { label: "Valuation", value: fmtCash(snapshot.valuation), color: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900" },
            { label: "MRR", value: fmtCash(m.revenue), color: "text-emerald-700 dark:text-emerald-400", bg: "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800" },
            { label: "Burn Rate", value: fmtCash(burn), color: burn > m.revenue ? "text-rose-600" : "text-amber-600", bg: "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800" },
          ].map((card) => (
            <div key={card.label} className={cn("rounded-2xl p-3.5 border", card.bg)}>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
              <p className={cn("text-xl font-black italic leading-none", card.color)}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Runway</span>
            <span className={cn("text-sm font-black", m.runway < 6 ? "text-rose-600" : m.runway < 12 ? "text-amber-600" : "text-emerald-600")}>{m.runway === 99 ? "∞" : `${m.runway} months`}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Net Profit / Loss</span>
            <span className={cn("text-sm font-black", profitable ? "text-emerald-600" : "text-rose-600")}>{profitable ? "+" : ""}{fmtCash(netProfit)}/mo</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Users</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{fmtNum(m.users)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Pricing</span>
            <span className="text-sm font-black text-indigo-600">{fmtCash(m.pricing || 0)}/mo</span>
          </div>
        </div>

        {m.runway < 6 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl">
            <p className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">⚠️ CRITICAL: {m.runway} month runway</p>
            <p className="text-[10px] text-rose-600 dark:text-rose-500 mt-1">Raise funding or cut costs immediately to survive.</p>
          </div>
        )}

        <SH>Key Ratios</SH>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "PMF", value: `${m.pmf_score}/100`, color: m.pmf_score > 60 ? "text-emerald-600" : "text-amber-500" },
            { label: "Brand", value: `${m.brand_awareness}%`, color: "text-violet-600" },
            { label: "Innovation", value: `${m.innovation}/100`, color: "text-indigo-600" },
          ].map((s) => (
            <div key={s.label}>
              <p className={cn("text-lg font-black leading-none", s.color)}>{s.value}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RIVALS ─────────────────────────────────────────────────────────────────
  if (subcat === "rivals") {
    return (
      <div className="space-y-3">
        <SH>Counter-Competitive Actions</SH>
        <div className="space-y-1.5">{STORY_RIVAL_ACTIONS.map(renderActionCard)}</div>

        <SH>Rival Status Board</SH>
        {storyState.historicalRivals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No rivals identified</p>
          </div>
        ) : storyState.historicalRivals.map((rival) => {
          const upcomingActions = rival.scheduledActions.filter((a) => a.atMonth > currentMonth && a.atMonth <= currentMonth + 6);
          const statusColor = rival.status === "defeated" ? "text-emerald-600" : rival.status === "dominant" ? "text-rose-600" : rival.status === "threatening" ? "text-amber-600" : "text-slate-400";
          return (
            <div key={rival.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rival.emoji}</span>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{rival.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{rival.tagline}</p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest", statusColor)}>{rival.status}</span>
              </div>
              {upcomingActions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800 space-y-1">
                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Upcoming Moves:</p>
                  {upcomingActions.map((a, i) => (
                    <p key={i} className="text-[10px] text-slate-500"><span className="font-black text-rose-500">Mo {a.atMonth}</span> — {a.description}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── PR & COMMS ─────────────────────────────────────────────────────────────
  if (subcat === "pr_comms") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 rounded-2xl p-3 text-center">
            <p className="text-xl font-black text-violet-700 dark:text-violet-300">{snapshot.ceo_reputation}/100</p>
            <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest mt-0.5">CEO Reputation</p>
            <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-violet-500" style={{ width: `${snapshot.ceo_reputation}%` }} />
            </div>
          </div>
          <div className="bg-pink-50 dark:bg-rose-950/20 border border-pink-100 rounded-2xl p-3 text-center">
            <p className="text-xl font-black text-pink-700 dark:text-rose-300">{m.brand_awareness}%</p>
            <p className="text-[8px] font-black text-pink-500 uppercase tracking-widest mt-0.5">Brand Awareness</p>
            <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-pink-500" style={{ width: `${m.brand_awareness}%` }} />
            </div>
          </div>
        </div>

        <SH>Press & Comms Actions</SH>
        <div className="space-y-1.5">{STORY_PR_ACTIONS.map(renderActionCard)}</div>
      </div>
    );
  }

  // ── FUNDING ─────────────────────────────────────────────────────────────────
  if (subcat === "funding") {
    const actNum = storyState.currentAct;
    const fundingStage = actNum === 1 ? "Pre-Seed" : actNum === 2 ? "Seed" : actNum === 3 ? "Series A" : "Series B";
    return (
      <div className="space-y-3">
        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-2xl">
          <p className="text-[9px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-1">Current Stage</p>
          <p className="text-lg font-black text-purple-900 dark:text-purple-200">{fundingStage}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-purple-600 dark:text-purple-500">Valuation: <span className="font-black">{fmtCash(snapshot.valuation)}</span></p>
            <p className="text-[10px] text-purple-600 dark:text-purple-500">Runway: <span className="font-black">{m.runway === 99 ? "∞" : `${m.runway}mo`}</span></p>
          </div>
        </div>

        <SH>Fundraising Actions</SH>
        <div className="space-y-1.5">{STORY_FUNDING_ACTIONS.map(renderActionCard)}</div>

        <SH>Cap Table Summary</SH>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Founder Equity</span>
            <span className="text-sm font-black text-emerald-600">~{Math.max(10, 100 - storyState.currentAct * 12)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Investor Pool</span>
            <span className="text-sm font-black text-indigo-600">~{storyState.currentAct * 12}%</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs font-bold text-slate-500">Act / Dilution</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">Act {storyState.currentAct} of {campaign.acts.length}</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 rounded-2xl">
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">💡 Fundraising Tip</p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">Build investor pipeline (6+ weeks) before running out of runway. Pitch at 60%+ PMF score for best terms.</p>
        </div>
      </div>
    );
  }

  // ── MARKET POSITION ─────────────────────────────────────────────────────────
  if (subcat === "market_position") {
    const moatScore = Math.round((m.product_quality * 0.3 + m.brand_awareness * 0.3 + m.innovation * 0.2 + m.pmf_score * 0.2));
    return (
      <div className="space-y-3">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
          <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Competitive Moat Score</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{moatScore}<span className="text-base text-emerald-500">/100</span></p>
          <div className="h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${moatScore}%` }} />
          </div>
          <p className="text-[9px] text-emerald-600 mt-1">Composite of Product Quality, Brand, Innovation & PMF</p>
        </div>

        <SH>PMF Tracker</SH>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
          {[
            { label: "Product-Market Fit", value: m.pmf_score, color: "bg-violet-500", textColor: "text-violet-600" },
            { label: "Brand Awareness", value: m.brand_awareness, color: "bg-pink-500", textColor: "text-pink-600" },
            { label: "Innovation Index", value: m.innovation, color: "bg-indigo-500", textColor: "text-indigo-600" },
            { label: "Reliability", value: m.reliability, color: "bg-cyan-500", textColor: "text-cyan-600" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <span className={cn("text-[10px] font-black", stat.textColor)}>{stat.value}/100</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", stat.color)} style={{ width: `${stat.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <SH>Win Condition Progress</SH>
        <div className="p-4 rounded-2xl border" style={{ background: `${accentColor}08`, borderColor: `${accentColor}40` }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>Objective</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{campaign.winCondition.description}</p>
        </div>
      </div>
    );
  }

  // ── VITALS ─────────────────────────────────────────────────────────────────
  if (subcat === "vitals") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className={cn("p-4 rounded-2xl border text-center", m.founder_burnout > 60 ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-100")}>
            <p className={cn("text-3xl font-black leading-none", m.founder_burnout > 60 ? "text-rose-600" : "text-amber-600")}>{m.founder_burnout}%</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Burnout</p>
            {m.founder_burnout > 80 && <p className="text-[8px] font-black text-rose-600 mt-1">🚨 CRITICAL</p>}
          </div>
          <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-100 text-center">
            <p className="text-3xl font-black text-emerald-700 leading-none">{m.founder_health}%</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Health</p>
          </div>
        </div>

        {m.founder_burnout > 70 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded-2xl">
            <p className="text-[9px] font-black text-rose-700 uppercase">⚠️ High burnout reduces max Focus Energy and risks game-ending collapse at 100%</p>
          </div>
        )}

        <SH>Recovery Actions (Free Energy)</SH>
        <div className="space-y-1.5">{STORY_VITALS_ACTIONS.map(renderActionCard)}</div>

        <SH>Focus Energy Breakdown</SH>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Max Focus (this month)</span>
            <span className="text-sm font-black text-indigo-600">{maxFocus}h</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Used</span>
            <span className="text-sm font-black text-rose-600">{focusUsed}h</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Remaining</span>
            <span className="text-sm font-black text-emerald-600">{maxFocus - focusUsed}h</span>
          </div>
        </div>
      </div>
    );
  }

  // ── SKILLS ─────────────────────────────────────────────────────────────────
  if (subcat === "skills") {
    const flags = Object.keys(storyState.narrativeFlags).filter((f) => storyState.narrativeFlags[f]);
    const skillData = [
      { label: "Technical", value: Math.min(100, 20 + flags.filter(f => f.includes("tech") || f.includes("code") || f.includes("ai")).length * 15), color: "bg-blue-500" },
      { label: "Leadership", value: Math.min(100, 30 + flags.filter(f => f.includes("team") || f.includes("hire") || f.includes("board")).length * 12), color: "bg-purple-500" },
      { label: "Marketing", value: Math.min(100, 20 + flags.filter(f => f.includes("brand") || f.includes("pr") || f.includes("launch")).length * 15), color: "bg-pink-500" },
      { label: "Fundraising", value: Math.min(100, 20 + flags.filter(f => f.includes("fund") || f.includes("pitch") || f.includes("ipo")).length * 20), color: "bg-emerald-500" },
      { label: "Networking", value: Math.min(100, 30 + storyState.pitchResults.filter(p => p.won).length * 15), color: "bg-amber-500" },
    ];
    return (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 rounded-2xl">
          <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-1">Founder Skills</p>
          <p className="text-[10px] text-blue-600 leading-relaxed">Skills grow automatically as you make decisions. Take bold actions to unlock higher tiers.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
          {skillData.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{s.value}/100</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <SH>Narrative Flags Earned</SH>
        {flags.length === 0 ? (
          <p className="text-xs text-slate-400 italic px-1">Make story decisions to earn flags.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <span key={flag} className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: `${accentColor}10`, color: accentColor, borderColor: `${accentColor}30` }}>
                {flag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── PERKS ──────────────────────────────────────────────────────────────────
  if (subcat === "perks") {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 rounded-2xl flex justify-between items-center">
          <p className="text-[9px] font-black text-violet-700 uppercase tracking-widest">CEO Reputation</p>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-violet-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500" style={{ width: `${snapshot.ceo_reputation}%` }} />
            </div>
            <span className="text-sm font-black text-violet-700 dark:text-violet-300">{snapshot.ceo_reputation}/100</span>
          </div>
        </div>

        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Founder Presence Actions</p>
        <div className="space-y-1.5">{STORY_PERKS_ACTIONS.map(renderActionCard)}</div>
      </div>
    );
  }

  // ── LEGACY ─────────────────────────────────────────────────────────────────
  if (subcat === "legacy") {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 rounded-2xl">
          <p className="text-[9px] font-black text-purple-700 uppercase tracking-widest mb-1">🕊️ Philanthropy & Impact</p>
          <p className="text-[10px] text-purple-600 leading-relaxed">Giving back enhances your CEO reputation, boosts team morale, and creates lasting brand differentiation.</p>
        </div>
        <div className="space-y-1.5">{STORY_LEGACY_ACTIONS.map(renderActionCard)}</div>
      </div>
    );
  }

  // ── RIVAL INTEL ────────────────────────────────────────────────────────────
  if (subcat === "rival_intel") {
    const upcoming = storyState.historicalRivals.flatMap((r) =>
      r.scheduledActions.filter((a) => a.atMonth > currentMonth && a.atMonth <= currentMonth + 12).map((a) => ({ rival: r, action: a }))
    ).sort((a, b) => a.action.atMonth - b.action.atMonth);

    return (
      <div className="space-y-3">
        <SH>Upcoming Threats (Next 12 Months)</SH>
        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-3xl mb-2">🕊️</p>
            <p className="text-xs font-black text-slate-400 uppercase">No imminent threats</p>
          </div>
        ) : upcoming.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/50 px-4 py-3 flex items-start gap-3">
            <span className="text-xl mt-0.5">{item.rival.emoji}</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-rose-500 uppercase">Month {item.action.atMonth}</span>
                <span className="text-[9px] text-slate-400">· {item.rival.name}</span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.action.description}</p>
            </div>
          </div>
        ))}

        <SH>Pitch Results</SH>
        {storyState.pitchResults.length === 0 ? (
          <p className="text-xs text-slate-400 italic px-1">No pitches completed yet.</p>
        ) : storyState.pitchResults.slice(-5).map((p, i) => (
          <div key={i} className={cn("bg-white dark:bg-slate-900 rounded-2xl border px-4 py-3 flex items-center justify-between", p.won ? "border-emerald-100" : "border-rose-100")}>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.eventId.replace(/_/g, " ")}</span>
            <span className={cn("text-[10px] font-black uppercase", p.won ? "text-emerald-600" : "text-rose-500")}>{p.result}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── EVENT LOG ──────────────────────────────────────────────────────────────
  if (subcat === "event_log") {
    return (
      <div className="space-y-3">
        <SH>Completed Story Events</SH>
        {storyState.completedEventIds.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-xs font-black text-slate-400 uppercase">No events resolved yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {storyState.completedEventIds.map((id) => {
              const ev = campaign.events.find((e) => e.id === id);
              return (
                <div key={id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 px-4 py-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{ev?.title || id.replace(/_/g, " ")}</p>
                  {ev && <p className="text-[9px] text-slate-400 mt-0.5">Act {ev.act}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── BOARD ──────────────────────────────────────────────────────────────────
  if (subcat === "board") {
    return (
      <div className="space-y-3">
        <SH>Board Composition</SH>
        {storyState.boardMembers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-xs font-black text-slate-400 uppercase">No board members yet</p>
          </div>
        ) : storyState.boardMembers.map((member) => {
          const isFriendly = member.loyaltyToFounder >= 50;
          return (
            <div key={member.id} className={cn("bg-white dark:bg-slate-900 rounded-2xl border px-4 py-3", isFriendly ? "border-emerald-100 dark:border-emerald-900/50" : "border-rose-100 dark:border-rose-900/50")}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{member.id.replace(/_/g, " ")}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">{member.seat} · Agenda: {member.agenda}</p>
                </div>
                <span className={cn("text-[9px] font-black uppercase", isFriendly ? "text-emerald-600" : "text-rose-600")}>{isFriendly ? "Supportive" : "Hostile"}</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", isFriendly ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${member.loyaltyToFounder}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-slate-400">Loyalty {member.loyaltyToFounder}/100</span>
                <span className="text-[8px] text-slate-400">Influence {member.influence}/100</span>
              </div>
            </div>
          );
        })}

        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 rounded-2xl">
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">💡 Board Tip</p>
          <p className="text-[10px] text-amber-700 leading-relaxed">Keep board members happy through successful milestones. Below 30 loyalty they vote against you.</p>
        </div>
      </div>
    );
  }

  // ── LEGAL ──────────────────────────────────────────────────────────────────
  if (subcat === "legal") {
    const legalActions: StoryAction[] = [
      { id: "settle_lawsuit",  emoji: "⚖️", label: "Settle Lawsuit",     desc: "Negotiate an out-of-court settlement",               energyCost: 5,  cashCost: 25000, effects: { brand_awareness: -2, team_morale: 5 },         log: "⚖️ Lawsuit settled out of court. Crisis contained." },
      { id: "legal_defense",   emoji: "🛡️", label: "Hire Top Firm",      desc: "Retain top-tier litigation counsel for full defense", energyCost: 3,  cashCost: 50000, effects: { reliability: 5 },                             log: "🛡️ Top litigation firm retained. Legal exposure reduced." },
      { id: "compliance_audit",emoji: "📋", label: "Compliance Audit",   desc: "Proactive regulatory compliance review",             energyCost: 6,  cashCost: 10000, effects: { reliability: 10, brand_awareness: 3 },         log: "📋 Compliance audit complete. Regulatory risk reduced." },
      { id: "ip_protection",   emoji: "🔒", label: "Patent Portfolio",   desc: "File broad defensive patent portfolio",              energyCost: 8,  cashCost: 30000, effects: { innovation: 5, brand_awareness: 4 },            log: "🔒 Patent portfolio filed. IP moat established." },
    ];
    return (
      <div className="space-y-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Legal Status</p>
          <p className="text-sm font-black text-emerald-600">✓ No active crises</p>
          <p className="text-[10px] text-slate-400 mt-1">Story-driven legal crises appear as events. Resolve them below or via choices.</p>
        </div>
        <SH>Proactive Legal Actions</SH>
        <div className="space-y-1.5">{legalActions.map(renderActionCard)}</div>
      </div>
    );
  }

  return <div className="p-4 text-slate-400 text-sm">Panel content coming soon...</div>;
}

// ─── Acts Panel ───────────────────────────────────────────────────────────────
function ActsPanel({ campaign, storyState, currentMonth, accentColor }: { campaign: StoryCampaign; storyState: StoryModeState; currentMonth: number; accentColor: string }) {
  return (
    <div className="space-y-3 max-w-md mx-auto">
      {campaign.acts.map((act) => {
        const isCurrent = act.act === storyState.currentAct;
        const isPast = act.act < storyState.currentAct;
        const totalEvents = campaign.events.filter((e) => e.act === act.act).length;
        const completedCount = storyState.completedEventIds.filter((id: string) => {
          const ev = campaign.events.find((e) => e.id === id);
          return ev?.act === act.act;
        }).length;
        return (
          <div key={act.act} className={cn("rounded-2xl border p-4 transition-all", isPast ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/10 opacity-70" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900")}
            style={isCurrent ? { borderColor: `${accentColor}60`, background: `${accentColor}06` } : {}}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ background: isPast ? "#10b981" : isCurrent ? accentColor : "#94a3b8" }}>
                Act {act.act} {isPast ? "✓" : isCurrent ? "← Now" : ""}
              </span>
              {totalEvents > 0 && <span className="text-[9px] font-bold text-slate-400">{completedCount}/{totalEvents} events</span>}
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{act.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.description}</p>
            {totalEvents > 0 && (
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full transition-all" style={{ width: `${(completedCount / totalEvents) * 100}%`, background: isPast ? "#10b981" : accentColor }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
