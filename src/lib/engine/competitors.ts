import { formatMoney } from "../utils";

export type Competitor = {
    id: string;
    name: string;
    industry: string;
    valuation: number;
    users: number;
    status: "active" | "failed" | "acquired" | "ipo";
    growth_rate: number;
    last_action?: string;
};

export type CompetitorAction = {
    type: "price_cut" | "feature_launch" | "fundraise" | "poach" | "press_attack" | "ai_pivot" | "massive_marketing" | "vulture_talent";
    description: string;
    impactUser: number;    // % change to your users (negative = loss)
    impactMorale: number;  // morale hit
    impactBrand: number;   // brand awareness change
};

const NAMES = ["Hooli", "Aviato", "Endframe", "Gavin Belson Corp", "Bachmanity", "Sliceline", "Raviga", "Pied Piper (The Evil One)"];
const INDUSTRIES = ["Tech SaaS", "AI Startup", "E-commerce Brand"];

const COMPETITOR_ACTIONS: CompetitorAction[] = [
    {
        type: "price_cut",
        description: "slashed their prices by 40%! Growth is accelerating.",
        impactUser: -0.04,   // Lose 4% users
        impactMorale: -2,
        impactBrand: -1,
    },
    {
        type: "feature_launch",
        description: "launched a new platform feature you don't have yet!",
        impactUser: -0.03,
        impactMorale: -5,
        impactBrand: -2,
    },
    {
        type: "ai_pivot",
        description: "just announced a pivot to 'AI-First' architecture.",
        impactUser: -0.05,
        impactMorale: -8,
        impactBrand: -5,
    },
    {
        type: "massive_marketing",
        description: "is running a massive ad campaign targeting your users.",
        impactUser: -0.06,
        impactMorale: 0,
        impactBrand: -10,
    },
    {
        type: "vulture_talent",
        description: "is aggressively poaching your top talent with high bonuses.",
        impactUser: 0,
        impactMorale: -15,   // Heavy morale hit
        impactBrand: 0,
    },
    {
        type: "press_attack",
        description: "published a hit-piece on your recent downtime.",
        impactUser: -0.05,
        impactMorale: -10,
        impactBrand: -15,
    },
];

export function generateInitialCompetitors(count: number): Competitor[] {
    return Array.from({ length: count }).map((_, i) => ({
        id: `comp-${i}`,
        name: NAMES[Math.floor(Math.random() * NAMES.length)] + " " + (i + 1),
        industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
        valuation: 500000 + Math.random() * 500000,
        users: Math.floor(Math.random() * 100),
        status: "active",
        growth_rate: 1.05 + Math.random() * 0.1, // 5% to 15% growth
    }));
}

export function simulateCompetitors(
    competitors: Competitor[],
    playerUsers: number = 0
): { updated: Competitor[], news: string[], rivalActions: { action: CompetitorAction; competitorName: string }[] } {
    const news: string[] = [];
    const rivalActions: { action: CompetitorAction; competitorName: string }[] = [];

    const updated = competitors.map(comp => {
        if (comp.status !== "active") return comp;

        const newComp = { ...comp };
        newComp.users = Math.floor(newComp.users * newComp.growth_rate);
        newComp.valuation = Math.floor(newComp.valuation * (1 + (newComp.growth_rate - 1) * 0.5));

        // Random events for competitors
        const roll = Math.random();
        if (roll < 0.05) {
            newComp.status = "failed";
            news.push(`💀 COMPETITOR CRASH: ${newComp.name} has shut down operations.`);
        } else if (newComp.valuation > 50000000 && roll < 0.1) {
            newComp.status = "ipo";
            news.push(`🚀 MARKET EXPLOSION: ${newComp.name} goes public at ${formatMoney(newComp.valuation)} valuation!`);
        } else if (roll < 0.08) {
            const raise = Math.floor(newComp.valuation * 0.2);
            newComp.valuation += raise;
            news.push(`💰 FUNDING NEWS: ${newComp.name} raised ${formatMoney(raise)} in new funding.`);
        }

        // Rival action (competitive move against the player) — 20% chance if player is scaling
        if (playerUsers > 100 && Math.random() < 0.20 && newComp.status === "active") {
            const rivalAction = COMPETITOR_ACTIONS[Math.floor(Math.random() * COMPETITOR_ACTIONS.length)];
            newComp.last_action = rivalAction.type;
            news.push(`⚔️ RIVAL MOVE: ${newComp.name} ${rivalAction.description}`);
            rivalActions.push({ action: rivalAction, competitorName: newComp.name });
        }

        return newComp;
    });

    return { updated, news, rivalActions };
}
