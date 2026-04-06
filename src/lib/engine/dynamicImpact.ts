/**
 * dynamicImpact.ts — Context-sensitive impact calculator
 *
 * Formula:
 *   impact = base × diminishFactor (monthly) × fatigueFactor (lifetime) × Power (Dept + Founder) × multipliers
 */

import { ActionDef, StatEffect, SituationalContext } from "./actions";
import { getPricingScale } from "./simulation";

export interface ActionUsageLog {
    /** action id → count used this month */
    thisMonth: Record<string, number>;
    /** action id → last month it was used */
    lastUsedMonth: Record<string, number>;
    /** action id → total times ever used in this save */
    lifetimeUsed?: Record<string, number>;
}

export interface GameContext {
    month: number;
    startup: any;
    founder: any;
    m: any; // metrics shorthand
}

// ─── Diminishing returns curve (Monthly) ────────────────────────────────────
function diminishFactor(timesThisMonth: number): number {
    // 1st: 1.0, 2nd: 0.5, 3rd: 0.25
    return Math.pow(0.5, Math.max(0, timesThisMonth));
}

// ─── Long-term Action Fatigue ────────────────────────────────────────────────
function fatigueFactor(lifetimeUsed: number): number {
    // Slowly decays over long-term use. 1.0 -> 0.9 after 10 uses, 0.8 after 20.
    return Math.max(0.5, 1 - (lifetimeUsed * 0.01));
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
    if (currentValue >= cap) return 0.1;
    return Math.max(0.1, 1 - Math.pow(currentValue / cap, 1.5));
}

// ─── Department Power ────────────────────────────────────────────────────────
export function getDepartmentPower(category: string, startup: any, founder?: any): number {
    const employees = (startup.employees || []) as any[];
    const cxoTeam = startup.cxoTeam || {};
    const m = startup.metrics || {};
    
    // 1. Better Role Mapping
    const mapping: Record<string, { skill: string, roles: string[], cxo: string, founderAttr: string }> = {
        technical: { skill: "technical", roles: ["engineer", "software engineer", "dev", "tech"], cxo: "CTO", founderAttr: "technical_skill" },
        product: { skill: "technical", roles: ["engineer", "software engineer", "dev", "tech", "product"], cxo: "CTO", founderAttr: "intelligence" },
        marketing_skill: { skill: "marketing", roles: ["marketer", "marketing", "growth"], cxo: "CMO", founderAttr: "reputation" },
        growth: { skill: "marketing", roles: ["marketer", "marketing", "growth"], cxo: "CMO", founderAttr: "marketing_skill" },
        leadership: { skill: "sales", roles: ["sales", "account executive", "rep"], cxo: "COO", founderAttr: "leadership" },
        culture: { skill: "sales", roles: ["sales", "hr", "people"], cxo: "COO", founderAttr: "stress_tolerance" },
        funding: { skill: "sales", roles: ["sales", "finance"], cxo: "CFO", founderAttr: "networking" }
    };

    const map = mapping[category] || { skill: "technical", roles: ["engineer"], cxo: "", founderAttr: "intelligence" };
    
    // 2. Identify relevant staff
    const relevantStaff = employees.filter((e: any) => {
        const role = (e.role || "").toLowerCase();
        return map.roles.some(r => role.includes(r)) || (e.isCXO && e.role === map.cxo.toLowerCase());
    });
    
    const hasCXO = !!cxoTeam[map.cxo];
    const staffCount = relevantStaff.length;

    // Use founder skill if no staff present
    const founderSkill = founder?.attributes?.[map.founderAttr] || 40;

    const avgSkill = (staffCount + (hasCXO ? 1 : 0)) > 0 
        ? (relevantStaff.reduce((acc: number, e: any) => acc + ((e.skills as any)[map.skill] || 50), 0) + (hasCXO ? 90 : 0)) / (staffCount + (hasCXO ? 1 : 0))
        : founderSkill;

    const teamEfficiency = Math.max(0.3, (m.team_morale || 100) / 100);
    
    // REDESIGNED POWER: Additive Headcount Scaling (Realistic Staff-to-User ratio)
    // Solo founders now correctly split power by their personal attributes.
    const power = avgSkill * (1 + staffCount * 0.25) * (hasCXO ? 1.3 : 1.0) * teamEfficiency;
    
    return Math.max(1, Math.round(power));
}

// ─── Founder Power ───────────────────────────────────────────────────────────
function getFounderPower(category: string, founder: any, startup: any): number {
    const attrs = founder.attributes || {};
    const mapping: Record<string, string> = {
        technical: "technical_skill",
        product: "technical_skill",
        marketing_skill: "marketing_skill",
        growth: "marketing_skill",
        leadership: "leadership",
        culture: "leadership",
        funding: "networking",
        networking: "networking",
        intelligence: "intelligence"
    };

    const statKey = mapping[category] || "intelligence";
    const statVal = (attrs[statKey] || 50) + (startup.metrics?.[statKey] || 0);
    
    return 0.5 + (statVal / 100);
}

// ─── Detect active situational contexts ──────────────────────────────────────
export function detectContexts(ctx: GameContext): SituationalContext[] {
    const contexts: SituationalContext[] = [];
    const { startup, m } = ctx;

    const invPipe = m.investor_pipeline || { leads: 0, meetings: 0 };
    const isFundraising = invPipe.leads > 0 || invPipe.meetings > 0 || startup._pitchingInProgress;

    if (isFundraising) contexts.push("fundraising");
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
    const lifetimeUsed = usageLog.lifetimeUsed?.[action.id] ?? 0;
    const lastUsed = usageLog.lastUsedMonth[action.id];
    const monthsGap = lastUsed !== undefined ? ctx.month - lastUsed : 999;

    const activeContexts = detectContexts(ctx);
    const hints: string[] = [];

    let multiplier = 1.0;

    // 1. Monthly Fatigue
    const dim = diminishFactor(timesThisMonth);
    multiplier *= dim;
    if (timesThisMonth >= 1) {
        hints.push(`📉 Repeated: ${(dim * 100).toFixed(0)}% effect`);
    }

    // 2. Long-term Decay
    const fat = fatigueFactor(lifetimeUsed);
    multiplier *= fat;
    if (fat < 0.95) {
        hints.push(`⌛ Fatigue: ${(fat * 100).toFixed(0)}% (Heavy Use)`);
    }

    // 3. Dept & Founder Power
    const deptPower = getDepartmentPower(action.category, ctx.startup, ctx.founder);
    const founderPower = getFounderPower(action.category, ctx.founder, ctx.startup);
    
    // Ratio Bottleneck: Compare Dept Power to Required Power for current scale
    const users = ctx.m.users || 0;
    const reqPower = Math.max(10, Math.pow(users, 0.45) * 1.5);
    const capacityRatio = Math.min(1.0, deptPower / reqPower);
    
    // Categorize actions: Execution (throtteled) vs Personal (retains impact)
    const isExecutionAction = ["product", "growth", "marketing_skill", "funding", "hiring"].includes(action.category);

    if (isExecutionAction) {
        // Multiplier for large-scale operations (Engineering, Marketing, etc.)
        // Quadratic penalty for scaling bottlenecks ensures team size must grow with users.
        multiplier *= ((deptPower / 100) * founderPower * Math.pow(capacityRatio, 2));

        if (deptPower > 100) hints.push(`🔥 Dept Strength: ${deptPower} Power`);
        if (capacityRatio < 0.95) {
            hints.push(`⚖️ Scaling Bottleneck: ${Math.round(capacityRatio * 100)}% Capacity (Quadratic Penalty)`);
        }
    } else {
        // Personal/Founder actions (1:1s, Reading, Health) ignore company scale bottlenecks.
        multiplier *= (0.5 + (deptPower / 150) + (founderPower - 1.0));
        if (founderPower > 1.2) hints.push(`🧠 High Founder Stat (+${((founderPower - 1) * 100).toFixed(0)}%)`);
    }

    if (founderPower > 1.2 && isExecutionAction) hints.push(`🧠 Founder Skill (+${((founderPower - 1) * 100).toFixed(0)}%)`);

    // 4. Gap bonus
    const gap = gapBonus(monthsGap);
    multiplier *= gap;
    if (gap > 1.0 && timesThisMonth === 0) {
        hints.push(`✨ Fresh-start bonus (+${((gap - 1) * 100).toFixed(0)}%)`);
    }

    // 5. Situational multipliers
    for (const ctx_key of activeContexts) {
        const boost = action.situationalBoosts?.[ctx_key];
        if (boost !== undefined) {
            multiplier *= (boost as number);
            const note = action.situationalNote?.[ctx_key];
            if (note) hints.push(note);
        }
    }

    // 6. Stat ceiling
    const primaryStat = getPrimaryStatKey(action.baseEffects);
    if (primaryStat) {
        const statValue = getStatValue(primaryStat, ctx);
        const ceiling = statCeilingFactor(statValue, 100);
        if (isAttributeStat(primaryStat)) {
            multiplier *= ceiling;
        }
    }

    multiplier = Math.max(0.1, Math.min(10.0, multiplier));


    // ─── Dynamic Difficulty Curve ──────────────────────────────────────
    // 1. Early-Game "Honeymoon" Boost (Smooth Winning Stage)
    const currentUsers = ctx.m.users || 0;
    const honeymoonMult = currentUsers < 5000 ? 2.5 : currentUsers < 15000 ? 1.5 : 1.0;
    multiplier *= honeymoonMult;

    // 2. Mid-to-Late Game "Complexity Drag" (Reflects organizational friction)
    const teamSize = (ctx.startup.employees || []).length;
    if (teamSize > 10) {
        // Penalty starts at 11 employees, maxes out at 30% reduction (0.7x) at 30+ employees
        const dragFactor = Math.max(0.7, 1 - (teamSize - 10) * 0.015);
        if (dragFactor < 1.0) {
            multiplier *= dragFactor;
        }
    }

    // ─── Reward Multiplier (Logarithmic Scaling for long-term stability) ────
    const val = ctx.startup.valuation || 250000;
    // log2 of (val / 50k) ensures scaling is stable even at 10+ Billion dollar valuations
    // e.g., $1M -> 4.3x | $100M -> 11x | $1B -> 14x | $10B -> 17x
    const rewardMult = Math.max(1, Math.round(Math.log2(val / 50_000)));
    // Costs scale logarithmically to prevent absurd late-game prices (e.g. 20M offsites)
    const costMult = val > 500_000 ? 1 + Math.log2(val / 500_000) * 0.4 : 1;

    
    // Growth specific scaling (PMF + Quality)
    const pmf = ctx.m.pmf_score || 10;
    const qual = ctx.m.product_quality || 10;
    const growthMult = (0.5 + pmf / 100) * (0.5 + qual / 100);

    const scaledEffects: StatEffect = {};
    for (const [key, v] of Object.entries(action.baseEffects)) {
        if (v === undefined) continue;

        if (key === "cash") {
            (scaledEffects as any)[key] = Math.round(v * costMult);
        } else if (key === "technical_debt") {
            // Realistic Tech Debt scaling: Inversely proportional to capacityRatio.
            // ONLY starts after 5,000 users to keep early game smooth.
            const users = ctx.m.users || 0;
            const debtScaling = users >= 5000 ? Math.max(1.0, 1 / (capacityRatio || 0.1)) : 1.0;
            (scaledEffects as any)[key] = Math.round(v * debtScaling);
        } else {
            const isUsers = key.toLowerCase() === 'users';
            
            // SLG Mode conversion: users -> leads
            if (isUsers && ctx.startup.gtm_motion === 'SLG') {
                const leadsGained = Math.max(1, Math.round(v / 25 * multiplier));
                (scaledEffects as any)['leads'] = leadsGained;
                continue; // skip adding into the 'users' key
            }

            const isGrowthMetric = isUsers || ['brand_awareness', 'reputation'].includes(key.toLowerCase());
            const isPercentageMetric = ['brand_awareness', 'reputation', 'product_quality', 'reliability', 'pmf_score', 'culture_score', 'innovation', 'marketing_skill', 'technical_skill', 'leadership', 'sales_skill', 'founder_health', 'founder_burnout', 'team_morale'].includes(key.toLowerCase());
            const applyRewardScale = (isGrowthMetric || key.toLowerCase() === 'revenue') && !isPercentageMetric;
            
            let finalMult = multiplier;
            if (isGrowthMetric) {
                finalMult *= growthMult;
                if (isUsers && ctx.startup.industry && ctx.startup.gtm_motion) {
                    const priceScale = getPricingScale(ctx.startup.industry, ctx.startup.gtm_motion);
                    finalMult *= Math.min(3.0, priceScale); // Cap price exploit
                }
                if (isUsers && growthMult > 1.2) hints.push(`📈 PMF/Quality Boost (+${((growthMult - 1) * 100).toFixed(0)}%)`);
                if (isUsers && growthMult < 0.8) hints.push(`⚠️ Low PMF/Quality Penalty (-${((1 - growthMult) * 100).toFixed(0)}%)`);
            }

            const rawVal = v > 0
                ? Math.max(1, Math.round(v * finalMult))
                : Math.min(-1, Math.round(v * finalMult));

            let scaledVal = rawVal * (applyRewardScale ? rewardMult : 1);

            // Cap absolute user gains (Mass Market Satiation)
            if (isUsers && scaledVal > 0) {
                const existingUsers = ctx.m.users || 100;
                // Cap scaling: 10% early game, 2% mass market
                const capPct = existingUsers > 100000 ? 0.02 : 0.10;
                const userCap = Math.max(100, Math.floor(existingUsers * capPct));
                
                if (scaledVal > userCap) {
                    scaledVal = userCap;
                }
            }

            (scaledEffects as any)[key] = scaledVal;
        }
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
        intelligence: (founder.attributes?.intelligence ?? 50),
        technical_skill: (founder.attributes?.technical_skill ?? 50) + (m.technical_skill || 0),
        leadership: (founder.attributes?.leadership ?? 50) + (m.leadership || 0),
        networking: (founder.attributes?.networking ?? 50),
        marketing_skill: (founder.attributes?.marketing_skill ?? 50) + (m.marketing_skill || 0),
        reputation: (founder.attributes?.reputation ?? 50),
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
        "networking", "marketing_skill", "sales_skill", "reputation",
        "risk_appetite", "stress_tolerance"
    ];
    const METRIC_KEYS = [
        "founder_burnout", "founder_health", "product_quality",
        "technical_debt", "reliability", "team_morale",
        "brand_awareness", "users", "revenue", "pmf_score", "culture_score",
        "innovation", "growth_rate"
    ];

    for (const [key, val] of Object.entries(effects)) {
        if (val === undefined || val === 0) continue;
        if (key === "cash") {
            newStartup.metrics.cash = Math.max(0, (newStartup.metrics.cash || 0) + val);
        } else if (key === "leads") {
            if (!newStartup.metrics.b2b_pipeline) {
                newStartup.metrics.b2b_pipeline = { leads: 0, active_deals: 0, closed_won: 0 };
            }
            newStartup.metrics.b2b_pipeline.leads = Math.max(0, (newStartup.metrics.b2b_pipeline.leads || 0) + val);
        } else if (key === "users" && newStartup.gtm_motion === "SLG") {
            if (!newStartup.metrics.b2b_pipeline) {
                newStartup.metrics.b2b_pipeline = { leads: 0, active_deals: 0, closed_won: 0 };
            }
            newStartup.metrics.b2b_pipeline.leads = Math.max(0, (newStartup.metrics.b2b_pipeline.leads || 0) + val);
        } else if (ATTR_KEYS.includes(key)) {
            const cur = (newFounder.attributes as any)[key] || 50;
            (newFounder.attributes as any)[key] = Math.min(100, Math.max(0, cur + val));
        } else if (METRIC_KEYS.includes(key)) {
            const isTopLevel = ["pmf_score", "culture_score"].includes(key);
            const cur = isTopLevel ? (newStartup as any)[key] || 0 : (newStartup.metrics as any)[key] || 0;
            
            let newVal = Math.max(0, cur + val);
            
            const PERCENTAGE_METRICS = [
                "brand_awareness", "reputation", "product_quality", "reliability", 
                "pmf_score", "culture_score", "innovation", "founder_burnout", 
                "founder_health", "team_morale"
            ];
            if (PERCENTAGE_METRICS.includes(key)) {
                newVal = Math.min(100, newVal);
            }

            if (isTopLevel) {
                (newStartup as any)[key] = newVal;
            } else {
                (newStartup.metrics as any)[key] = newVal;
            }

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

// HMR Cache Reset Touch
