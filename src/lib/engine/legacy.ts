import { Startup } from "../types/database.types";

export type LegacyData = {
    totalExits: number;
    totalLegacyPoints: number;
    unspentPoints: number;
    hallOfFame: HallOfFameEntry[];
};

export type HallOfFameEntry = {
    id: string;
    companyName: string;
    founderName: string;
    outcome: "ipo" | "acquisition";
    valuation: number;
    exitDate: string;
    pointsEarned: number;
    industry: string;
};

export type Perk = {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
};

export const PERKS: Perk[] = [
    {
        id: "charismatic_leader",
        name: "Charismatic Leader",
        description: "+15 Starting Leadership & Team Morale",
        cost: 1000,
        icon: "👑"
    },
    {
        id: "technical_prodigy",
        name: "Technical Prodigy",
        description: "+20 Starting Technical Skill & Intelligence",
        cost: 1000,
        icon: "🧠"
    },
    {
        id: "rich_founder",
        name: "Trust Fund Founder",
        description: "Start with an extra $100k in the bank",
        cost: 2000,
        icon: "💰"
    },
    {
        id: "growth_hacker",
        name: "Growth Hacker",
        description: "+10% Viral Growth Multiplier base",
        cost: 3000,
        icon: "🚀"
    },
    {
        id: "efficient_ops",
        name: "Efficient Operations",
        description: "-15% Monthly Burn Rate overhead",
        cost: 4000,
        icon: "⚙️"
    }
];

const STORAGE_KEY = "founder_sim_legacy";

export const INITIAL_LEGACY: LegacyData = {
    totalExits: 0,
    totalLegacyPoints: 0,
    unspentPoints: 0,
    hallOfFame: [],
};

// ─── Scenarios ──────────────────────────────────────────────────────────────

export type ScenarioId = "classic" | "bootstrap" | "bear" | "ai_rush" | "viral";

export type Scenario = {
    id: ScenarioId;
    label: string;
    description: string;
    difficulty: "Normal" | "Hard" | "Extreme";
    startingModifiers: {
        cash?: number;
        tech_debt?: number;
        users?: number;
        pmf?: number;
        innovation?: number;
    };
    rules: {
        fundingDisabledMonths?: number;
        churnMultiplier?: number;
        fundingDifficulty?: number;
        burnMultiplier?: number;
        techDebtGrowthMultiplier?: number;
    };
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
    classic: {
        id: "classic",
        label: "Classic",
        description: "The standard entrepreneurial journey. Balanced growth and challenge.",
        difficulty: "Normal",
        startingModifiers: {},
        rules: {}
    },
    bootstrap: {
        id: "bootstrap",
        label: "Bootstrap Hero",
        description: "Start with minimal cash. VC funding is locked for 2 years. Survival is the only metric.",
        difficulty: "Hard",
        startingModifiers: {
            cash: 5000
        },
        rules: {
            fundingDisabledMonths: 24,
            burnMultiplier: 0.8 // Frugality bonus
        }
    },
    bear: {
        id: "bear",
        label: "Bear Market",
        description: "The economy is in a tailspin. High churn, aggressive competition, and elitist VCs.",
        difficulty: "Hard",
        startingModifiers: {
            pmf: 5
        },
        rules: {
            churnMultiplier: 1.5,
            fundingDifficulty: 1.4
        }
    },
    ai_rush: {
        id: "ai_rush",
        label: "AI Gold Rush",
        description: "The hype is real. Easy money and fast innovation, but tech debt and costs are spiraling.",
        difficulty: "Normal",
        startingModifiers: {
            innovation: 30,
            cash: 100000 // Pre-seed hype check
        },
        rules: {
            techDebtGrowthMultiplier: 2.5,
            burnMultiplier: 2.0,
            fundingDifficulty: 0.7
        }
    },
    viral: {
        id: "viral",
        label: "Viral Sensation",
        description: "You caught lightning in a bottle. 10k users overnight, but your servers are melting and revenue is zero.",
        difficulty: "Extreme",
        startingModifiers: {
            users: 10000,
            tech_debt: 90,
            cash: 20000
        },
        rules: {
            techDebtGrowthMultiplier: 1.5
        }
    }
};

// ─── Persistence ─────────────────────────────────────────────────────────────

export function getLegacyData(): LegacyData {
    if (typeof window === "undefined") return INITIAL_LEGACY;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_LEGACY;
    try {
        return JSON.parse(raw);
    } catch {
        return INITIAL_LEGACY;
    }
}

export function saveLegacyData(data: LegacyData) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordExit(startup: Startup, founderName: string) {
    const legacy = getLegacyData();
    
    // Calculate points: 1 point per $1M valuation, plus bonuses
    const basePoints = Math.floor(startup.valuation / 1_000_000);
    const ipoBonus = startup.outcome === "ipo" ? 50 : 0;
    const speedBonus = Math.max(0, 50 - Math.floor((startup.history?.length || 0) / 2)); // Faster exit = more points
    
    const totalEarned = Math.max(1, basePoints + ipoBonus + speedBonus);

    const entry: HallOfFameEntry = {
        id: crypto.randomUUID(),
        companyName: startup.name,
        founderName,
        outcome: startup.outcome as "ipo" | "acquisition",
        valuation: startup.valuation,
        exitDate: new Date().toISOString(),
        pointsEarned: totalEarned,
        industry: startup.industry
    };

    const newLegacy: LegacyData = {
        ...legacy,
        totalExits: legacy.totalExits + 1,
        totalLegacyPoints: legacy.totalLegacyPoints + totalEarned,
        unspentPoints: legacy.unspentPoints + totalEarned,
        hallOfFame: [entry, ...legacy.hallOfFame].slice(0, 10) // Keep top 10
    };
    saveLegacyData(newLegacy);
    return totalEarned;
}

export function buyPerk(perkId: string): boolean {
    const legacy = getLegacyData();
    const perk = PERKS.find(p => p.id === perkId);
    
    if (!perk || legacy.unspentPoints < perk.cost) {
        return false;
    }

    const newLegacy: LegacyData = {
        ...legacy,
        unspentPoints: legacy.unspentPoints - perk.cost,
    };

    saveLegacyData(newLegacy);
    return true;
}
