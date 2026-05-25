import { Founder, Startup, SkillNodeId } from "../types/database.types";

// ─── NODE DEFINITIONS ────────────────────────────────────────────────────────

export type SkillBranch = "Technical" | "Marketing" | "Leadership" | "Fundraising";

export type SkillNode = {
    id: SkillNodeId;
    branch: SkillBranch;
    tier: 1 | 2;                    // Tier 1 = root (unlockable anytime), Tier 2 = requires prerequisite
    prerequisite?: SkillNodeId;     // Tier 2 nodes require this to be unlocked first
    label: string;
    tagline: string;                // One-line benefit summary shown in UI
    description: string;            // Full effect description
    cost: number;                   // Skill Points required
    emoji: string;
};

export const SKILL_NODES: SkillNode[] = [

    // ─── TECHNICAL ────────────────────────────────────────────────────────────
    {
        id: "system_design",
        branch: "Technical",
        tier: 1,
        label: "Systems Thinker",
        tagline: "-15% technical debt each month",
        description: "Your architectural discipline means the team writes code that ages better. Technical debt decays 15% faster each month.",
        cost: 1,
        emoji: "🏗️",
    },
    {
        id: "distributed_systems",
        branch: "Technical",
        tier: 2,
        prerequisite: "system_design",
        label: "Scale Architect",
        tagline: "+2 product quality & +3 reliability/mo",
        description: "You designed for scale before you needed it. Every month the product gets a passive quality and reliability lift.",
        cost: 2,
        emoji: "⚡",
    },
    {
        id: "code_quality",
        branch: "Technical",
        tier: 1,
        label: "Code Craftsman",
        tagline: "+2 reliability/mo",
        description: "Your obsession with clean code pays dividends. Reliability passively climbs every month even without explicit action.",
        cost: 1,
        emoji: "🔧",
    },
    {
        id: "security_first",
        branch: "Technical",
        tier: 2,
        prerequisite: "code_quality",
        label: "Security Champion",
        tagline: "-35% data breach crisis probability",
        description: "You've built a security-first culture. The chance of a data breach crisis spawning drops dramatically.",
        cost: 2,
        emoji: "🛡️",
    },

    // ─── MARKETING ────────────────────────────────────────────────────────────
    {
        id: "growth_hacking",
        branch: "Marketing",
        tier: 1,
        label: "Growth Hacker",
        tagline: "+15% viral user growth bonus",
        description: "Your instinct for distribution loops adds a compounding boost to organic growth every month.",
        cost: 1,
        emoji: "📈",
    },
    {
        id: "viral_loops",
        branch: "Marketing",
        tier: 2,
        prerequisite: "growth_hacking",
        label: "Loop Engineer",
        tagline: "Doubles baseline organic new users",
        description: "You've designed product referral mechanics that create genuine virality. Organic baseline doubles.",
        cost: 2,
        emoji: "🔄",
    },
    {
        id: "brand_strategy",
        branch: "Marketing",
        tier: 1,
        label: "Brand Strategist",
        tagline: "+3 brand awareness/mo",
        description: "Your positioning clarity earns the company brand equity without spending on ads. Brand awareness drifts up passively.",
        cost: 1,
        emoji: "🎯",
    },
    {
        id: "pr_mastery",
        branch: "Marketing",
        tier: 2,
        prerequisite: "brand_strategy",
        label: "PR Veteran",
        tagline: "+20% War Room success rates",
        description: "When crises hit, your media relationships and communications instincts improve your chances of containing them.",
        cost: 2,
        emoji: "📢",
    },

    // ─── LEADERSHIP ──────────────────────────────────────────────────────────
    {
        id: "people_management",
        branch: "Leadership",
        tier: 1,
        label: "Team Builder",
        tagline: "+4 team morale/mo baseline",
        description: "Your management instincts create an environment where people feel valued. Morale baseline rises passively each month.",
        cost: 1,
        emoji: "🤝",
    },
    {
        id: "culture_builder",
        branch: "Leadership",
        tier: 2,
        prerequisite: "people_management",
        label: "Culture Architect",
        tagline: "Negative traits 25% less punishing",
        description: "Your culture is strong enough to absorb individual dysfunction. Toxic genius morale drain, mercenary churn risk, and burnout magnet penalties all reduced by 25%.",
        cost: 2,
        emoji: "🌍",
    },
    {
        id: "executive_presence",
        branch: "Leadership",
        tier: 1,
        label: "Executive Presence",
        tagline: "+10% pitch success rate",
        description: "The way you walk into a room changes outcomes. Investor pitches and funding negotiations succeed more often.",
        cost: 1,
        emoji: "👔",
    },
    {
        id: "board_mastery",
        branch: "Leadership",
        tier: 2,
        prerequisite: "executive_presence",
        label: "Board Whisperer",
        tagline: "Board friction events 50% less likely",
        description: "You've learned to read the room and manage stakeholders before situations escalate. Board pressure events halved.",
        cost: 2,
        emoji: "🏛️",
    },

    // ─── FUNDRAISING ─────────────────────────────────────────────────────────
    {
        id: "term_sheet_reader",
        branch: "Fundraising",
        tier: 1,
        label: "Term Sheet Literacy",
        tagline: "+10% funding success rate",
        description: "You understand every clause in a term sheet. Negotiations go smoother and investors respect your financial sophistication.",
        cost: 1,
        emoji: "📄",
    },
    {
        id: "valuation_mastery",
        branch: "Fundraising",
        tier: 2,
        prerequisite: "term_sheet_reader",
        label: "Valuation Expert",
        tagline: "+20% valuation cap in funding rounds",
        description: "Your ability to frame your story in financial terms allows you to command a premium valuation at each round.",
        cost: 2,
        emoji: "💎",
    },
    {
        id: "lp_relationships",
        branch: "Fundraising",
        tier: 1,
        label: "LP Networker",
        tagline: "Investor pipeline fills 25% faster",
        description: "Your warm relationships with LPs and angels means the investor pipeline fills with higher-quality leads at a faster rate.",
        cost: 1,
        emoji: "🤑",
    },
];

// ─── NODE LOOKUP ──────────────────────────────────────────────────────────────
export const SKILL_NODE_MAP: Record<SkillNodeId, SkillNode> = Object.fromEntries(
    SKILL_NODES.map(n => [n.id, n])
) as Record<SkillNodeId, SkillNode>;

// ─── BRANCHES ────────────────────────────────────────────────────────────────
export const SKILL_BRANCHES: Record<SkillBranch, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
    Technical:    { emoji: "⚙️",  color: "text-blue-700 dark:text-blue-400",   bgColor: "bg-blue-50 dark:bg-blue-900/30",    borderColor: "border-blue-200 dark:border-blue-800/50" },
    Marketing:    { emoji: "📈",  color: "text-pink-700 dark:text-pink-400",   bgColor: "bg-pink-50 dark:bg-pink-900/30",    borderColor: "border-pink-200 dark:border-pink-800/50" },
    Leadership:   { emoji: "👔",  color: "text-violet-700 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-900/30",  borderColor: "border-violet-200 dark:border-violet-800/50" },
    Fundraising:  { emoji: "💰",  color: "text-emerald-700 dark:text-emerald-400",bgColor: "bg-emerald-50 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-800/50" },
};

// ─── SKILL POINTS ─────────────────────────────────────────────────────────────
/**
 * Skill Points are earned from in-game milestones:
 * - Series Seed close: +1
 * - Series A close:    +2
 * - Series B+ close:   +2
 * - 1k users:          +1
 * - 10k users:         +1
 * - 100k users:        +1
 * - Every 12 months:   +1
 */
export function calculateTotalSkillPoints(startup: Startup, founder: Founder, month: number): number {
    let points = 0;

    // Funding milestones
    // funding_stage lives on startup.metrics at runtime; cast to any for compat
    const stage = (startup.metrics as any).funding_stage ?? "";
    if (["Pre-Seed", "Seed", "Series A", "Series B", "Series C"].includes(stage)) points += 1;
    if (["Series A", "Series B", "Series C"].includes(stage)) points += 1;
    if (["Series B", "Series C"].includes(stage)) points += 1;

    // User milestones
    const users = startup.metrics.users || 0;
    if (users >= 1000)   points += 1;
    if (users >= 10000)  points += 1;
    if (users >= 100000) points += 1;

    // Time in game
    points += Math.floor(month / 12);

    return points;
}

export function getAvailableSkillPoints(startup: Startup, founder: Founder, month: number): number {
    const total = calculateTotalSkillPoints(startup, founder, month);
    const spent = (founder.unlocked_skill_nodes || []).reduce((acc, nodeId) => {
        return acc + (SKILL_NODE_MAP[nodeId]?.cost ?? 0);
    }, 0);
    return Math.max(0, total - spent);
}

// ─── UNLOCK VALIDATION ───────────────────────────────────────────────────────
export function canUnlockNode(
    nodeId: SkillNodeId,
    founder: Founder,
    startup: Startup,
    month: number
): { canUnlock: boolean; reason: string } {
    const node = SKILL_NODE_MAP[nodeId];
    if (!node) return { canUnlock: false, reason: "Unknown skill node." };

    const unlocked = founder.unlocked_skill_nodes || [];

    if (unlocked.includes(nodeId)) {
        return { canUnlock: false, reason: "Already unlocked." };
    }

    if (node.prerequisite && !unlocked.includes(node.prerequisite)) {
        const prereq = SKILL_NODE_MAP[node.prerequisite];
        return { canUnlock: false, reason: `Requires "${prereq?.label}" first.` };
    }

    const points = getAvailableSkillPoints(startup, founder, month);
    if (points < node.cost) {
        return { canUnlock: false, reason: `Need ${node.cost} Skill Point${node.cost > 1 ? "s" : ""} (have ${points}).` };
    }

    return { canUnlock: true, reason: `Unlock for ${node.cost} Skill Point${node.cost > 1 ? "s" : ""}.` };
}

// ─── PASSIVE EFFECTS (called each month from simulation.ts) ──────────────────
export function applySkillNodeEffects(
    founder: Founder,
    startup: Startup,
    metrics: Startup["metrics"],
    month: number
): {
    techDebtReduction: number;
    productQualityBonus: number;
    reliabilityBonus: number;
    brandAwarenessBonus: number;
    teamMoraleBonus: number;
    organicUserMultiplier: number;   // multiplier on baselineOrganic
    datBreachProbReduction: number;  // absolute reduction in spawn probability
    pitchSuccessBonus: number;       // additive to success rate
    pipelineSpeedBonus: number;      // multiplier on lead generation
    warRoomSuccessBonus: number;     // additive to choice success rates
    cultureDampenPct: number;        // 0-1, how much negative trait effects are reduced
} {
    const nodes = founder.unlocked_skill_nodes || [];
    const has = (id: SkillNodeId) => nodes.includes(id);

    return {
        techDebtReduction:       has("system_design") ? 0.15 : 0,
        productQualityBonus:     has("distributed_systems") ? 2 : 0,
        reliabilityBonus:        (has("code_quality") ? 2 : 0) + (has("distributed_systems") ? 3 : 0),
        brandAwarenessBonus:     has("brand_strategy") ? 3 : 0,
        teamMoraleBonus:         has("people_management") ? 4 : 0,
        organicUserMultiplier:   has("viral_loops") ? 2.0 : has("growth_hacking") ? 1.15 : 1.0,
        datBreachProbReduction:  has("security_first") ? 0.035 : 0,  // raw prob reduction
        pitchSuccessBonus:       has("executive_presence") ? 0.10 : 0,
        pipelineSpeedBonus:      has("lp_relationships") ? 1.25 : 1.0,
        warRoomSuccessBonus:     has("pr_mastery") ? 0.20 : 0,
        cultureDampenPct:        has("culture_builder") ? 0.25 : 0,
    };
}
