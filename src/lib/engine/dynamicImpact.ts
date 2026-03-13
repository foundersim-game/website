/**
 * dynamicImpact.ts — Context-sensitive impact calculator
 *
 * Formula:
 *   impact = base × diminishFactor × gapBonus × statCeiling × situational
 */

import { ActionDef, StatEffect, SituationalContext } from "./actions";

export interface ActionUsageLog {
    /** action id → count used this month */
    thisMonth: Record<string, number>;
    /** action id → last month it was used */
    lastUsedMonth: Record<string, number>;
}

export interface GameContext {
    month: number;
    startup: any;
    founder: any;
    m: any; // metrics shorthand
}

// ─── Diminishing returns curve ────────────────────────────────────────────────
// NOT a fixed table — tapers naturally using a decay function
function diminishFactor(timesThisMonth: number): number {
    // 1st: 1.0, 2nd: ~0.65, 3rd: ~0.40, 4th: ~0.22, 5th: ~0.10
    return Math.pow(0.6, Math.max(0, timesThisMonth));
}

// ─── Gap bonus — reward not having done this in a while ──────────────────────
function gapBonus(monthsGap: number): number {
    if (monthsGap >= 6) return 1.3;
    if (monthsGap >= 3) return 1.2;
    if (monthsGap >= 1) return 1.05;
    return 1.0;
}

// ─── Stat ceiling — harder to improve a stat that's already high ──────────────
function statCeilingFactor(currentValue: number, cap = 100): number {
    // At 0: full factor (1.0). At 90: ~0.3. At 100: ~0.1
    if (currentValue >= cap) return 0.1;
    return Math.max(0.1, 1 - Math.pow(currentValue / cap, 1.5));
}

// ─── Detect active situational contexts ──────────────────────────────────────
export function detectContexts(ctx: GameContext): SituationalContext[] {
    const contexts: SituationalContext[] = [];
    const { startup, founder, m } = ctx;

    // Currently raising / just pitched
    const invPipe = m.investor_pipeline || { leads: 0, meetings: 0 };
    const isFundraising = invPipe.leads > 0 || invPipe.meetings > 0 || startup._pitchingInProgress;

    if (isFundraising) {
        contexts.push("fundraising");
    }

    if (m.team_morale < 40) contexts.push("low_morale");
    if ((m.founder_burnout || 0) > 70) contexts.push("high_burnout");
    if ((m.technical_debt || 0) > 60) contexts.push("high_debt");
    const employees = startup.employees || [];
    if (employees.length < 5) contexts.push("small_team");
    if (employees.length >= 10) contexts.push("large_team");
    if (m.runway < 3 && !((m.net_profit ?? 0) >= 0)) contexts.push("low_cash");
    if ((m.growth_rate || 0) > 0.15) contexts.push("high_growth");
    if ((startup.pmf_score || 0) < 40 || m.users < 100) contexts.push("low_pmf");

    return contexts;
}

// ─── Main calculator ──────────────────────────────────────────────────────────
export function calcDynamicImpact(
    action: ActionDef,
    usageLog: ActionUsageLog,
    ctx: GameContext
): { scaledEffects: StatEffect; multiplier: number; hints: string[] } {

    const timesThisMonth = usageLog.thisMonth[action.id] ?? 0;
    const lastUsed = usageLog.lastUsedMonth[action.id];
    const monthsGap = lastUsed !== undefined ? ctx.month - lastUsed : 999;

    const activeContexts = detectContexts(ctx);
    const hints: string[] = [];

    // Build multiplier
    let multiplier = 1.0;

    // 1. Diminishing returns
    const dim = diminishFactor(timesThisMonth);
    multiplier *= dim;
    if (timesThisMonth >= 1) {
        hints.push(`×${(dim * 100).toFixed(0)}% — repeated this month`);
    }

    // 2. Gap bonus
    const gap = gapBonus(monthsGap);
    multiplier *= gap;
    if (gap > 1.0 && timesThisMonth === 0) {
        hints.push(`✨ ${((gap - 1) * 100).toFixed(0)}% fresh-start bonus`);
    }

    // 3. Situational multipliers
    for (const ctx_key of activeContexts) {
        const boost = action.situationalBoosts?.[ctx_key];
        if (boost !== undefined) {
            multiplier *= boost;
            const note = action.situationalNote?.[ctx_key];
            if (note) hints.push(note);
        }
    }

    // 4. Apply stat ceiling for primary stat
    // We detect the primary affected stat (first non-cash, non-negative entry)
    const primaryStat = getPrimaryStatKey(action.baseEffects);
    if (primaryStat) {
        const statValue = getStatValue(primaryStat, ctx);
        const ceiling = statCeilingFactor(statValue, 100);
        // Only apply ceiling to the attribute stats, not cash/morale/etc.
        if (isAttributeStat(primaryStat)) {
            multiplier *= ceiling;
            if (statValue > 70 && ceiling < 0.6) {
                hints.push(`📊 High base — diminishing returns above 70`);
            }
        }
    }

    // 5. Cap multiplier range
    multiplier = Math.max(0.02, Math.min(3.0, multiplier));

    // Phase scaling for absolute metrics (costs and numerical rewards)
    // Formula: floor(sqrt(valuation / 250k)) - ensures gradual scaling as company grows
    const phaseMult = Math.max(1, Math.floor(Math.sqrt(ctx.startup.valuation / 250_000)));

    // Scale all base effects
    const scaledEffects: StatEffect = {};
    for (const [key, val] of Object.entries(action.baseEffects)) {
        if (val === undefined) continue;

        const applyPhaseScale = ['cash', 'users', 'revenue'].includes(key.toLowerCase());

        // Cash costs are NOT scaled by diminishing returns (you still pay full price)
        if (key === "cash") {
            (scaledEffects as any)[key] = val * (applyPhaseScale ? phaseMult : 1);
        } else {
            const scaledVal = val > 0
                ? Math.max(1, Math.round(val * multiplier))
                : Math.min(-1, Math.round(val * multiplier));

            (scaledEffects as any)[key] = scaledVal * (applyPhaseScale ? phaseMult : 1);
        }
    }

    if (phaseMult > 1 && getPrimaryStatKey(action.baseEffects) === "users") {
        hints.push(`🚀 ${phaseMult}x Phase Scaling applied`);
    }

    return { scaledEffects, multiplier, hints };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ATTRIBUTE_STATS = new Set([
    "intelligence", "technical_skill", "leadership",
    "networking", "marketing_skill", "reputation",
]);

function isAttributeStat(key: string): boolean {
    return ATTRIBUTE_STATS.has(key);
}

function getPrimaryStatKey(effects: StatEffect): string | null {
    for (const [k, v] of Object.entries(effects)) {
        if (v && v > 0 && k !== "cash" && k !== "founder_burnout") return k;
    }
    return null;
}

function getStatValue(stat: string, ctx: GameContext): number {
    const { founder, m } = ctx;
    const attrMap: Record<string, number> = {
        intelligence: founder.attributes?.intelligence ?? 50,
        technical_skill: founder.attributes?.technical_skill ?? 50,
        leadership: founder.attributes?.leadership ?? 50,
        networking: founder.attributes?.networking ?? 50,
        marketing_skill: founder.attributes?.marketing_skill ?? 50,
        reputation: founder.attributes?.reputation ?? 50,
        team_morale: m.team_morale ?? 70,
        product_quality: m.product_quality ?? 0,
        reliability: m.reliability ?? 80,
        brand_awareness: m.brand_awareness ?? 0,
        founder_health: m.founder_health ?? 100,
        pmf_score: m.pmf_score ?? 10,
        culture_score: m.culture_score ?? 50,
    };
    return attrMap[stat] ?? 50;
}

// ─── Apply scaled effects to game state ──────────────────────────────────────
export function applyEffectsToState(
    effects: StatEffect,
    startup: any,
    founder: any,
): { startup: any; founder: any } {
    const newStartup = { ...startup, metrics: { ...startup.metrics } };
    const newFounder = { ...founder, attributes: { ...founder.attributes } };

    const ATTR_KEYS = [
        "intelligence", "technical_skill", "leadership",
        "networking", "marketing_skill", "reputation"
    ];
    const METRIC_KEYS = [
        "founder_burnout", "founder_health", "product_quality",
        "technical_debt", "reliability", "team_morale",
        "brand_awareness", "users", "revenue", "pmf_score", "culture_score"
    ];

    for (const [key, val] of Object.entries(effects)) {
        if (val === undefined || val === 0) continue;
        if (key === "cash") {
            newStartup.metrics.cash = Math.max(0, (newStartup.metrics.cash || 0) + val);
        } else if (ATTR_KEYS.includes(key)) {
            const cur = (newFounder.attributes as any)[key] || 50;
            (newFounder.attributes as any)[key] = Math.min(100, Math.max(0, cur + val));
        } else if (METRIC_KEYS.includes(key)) {
            const cur = (newStartup.metrics as any)[key] || 0;
            (newStartup.metrics as any)[key] = key === "founder_burnout"
                ? Math.min(100, Math.max(0, cur + val))
                : key === "founder_health"
                    ? Math.min(100, Math.max(0, cur + val))
                    : Math.max(0, cur + val);

            // If team morale is changing, distribute to individual employees
            if (key === "team_morale" && newStartup.employees) {
                newStartup.employees = newStartup.employees.map((emp: any) => ({
                    ...emp,
                    morale: Math.min(100, Math.max(0, (emp.morale ?? 70) + val))
                }));
            }
        }
    }

    return { startup: newStartup, founder: newFounder };
}
