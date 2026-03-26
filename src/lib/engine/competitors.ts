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
    // Extended stats for "Boss" UI
    aggression?: number; // 0-100
    velocity?: "stagnant" | "steady" | "accelerating" | "hyper-growth";
    sentiment?: "friendly" | "neutral" | "threatened" | "panicking" | "merciless";
};

export type CompetitorAction = {
    type: "price_cut" | "feature_launch" | "fundraise" | "poach" | "press_attack" | "ai_pivot" | "massive_marketing" | "vulture_talent";
    description: string;
    impactUser: number;    // % change to your users (negative = loss)
    impactMorale: number;  // morale hit
    impactBrand: number;   // brand awareness change
};

const NAMES = ["Hooli", "Aviato", "Endframe", "Gavin Belson Corp", "Bachmanity", "Sliceline", "Raviga", "Pied Piper"];
const INDUSTRIES = ["SaaS Platform", "AI Platform", "Marketplace", "FinTech App", "EdTech", "Dev Tools", "Mobile Game", "OTT / Streaming"];

export const RIVAL_BANTER = [
    "Sam is too soft. I'm here to crush you.",
    "I don't care about 'runway' — I care about domination.",
    "Stay out of my way, or you'll be another 'Lessons Learned' blog post.",
    "I'm coming for everything you built. ⚡",
    "Nice MVP. It'll look great in my 'Acquisition Target' folder.",
];

export const RIVAL_INTRO = "I heard you're trying to build in my space, {name}. Big mistake. I've got more capital, more hustle, and zero respect for 'burnout'. See you at the finish line—if you make it that far.";

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

export function generateInitialCompetitors(count: number, playerIndustry?: string): Competitor[] {
    const comps: Competitor[] = Array.from({ length: count - 1 }).map((_, i) => ({
        id: `comp-${i}`,
        name: NAMES[Math.floor(Math.random() * NAMES.length)] + " " + (i + 1),
        industry: playerIndustry || INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
        valuation: 500000 + Math.random() * 500000,
        users: Math.floor(Math.random() * 100),
        status: "active",
        growth_rate: 1.05 + Math.random() * 0.1,
    }));

    // Add CHADLY
    comps.unshift({
        id: "chadly",
        name: "Chadly (AI Rival)",
        industry: playerIndustry || "Hyper-Growth AI",
        valuation: 750000,
        users: 120,
        status: "active",
        growth_rate: 1.15, // Chadly grows fast
        aggression: 85,
        velocity: "hyper-growth",
        sentiment: "merciless",
    });

    return comps;
}

export function simulateCompetitors(
    competitors: Competitor[],
    playerUsers: number = 0,
    playerValuation: number = 0
): { updated: Competitor[], news: string[], rivalActions: { action: CompetitorAction; competitorName: string }[] } {
    const news: string[] = [];
    const rivalActions: { action: CompetitorAction; competitorName: string }[] = [];

    const updated = competitors.map(comp => {
        if (comp.status !== "active") return comp;

        const newComp = { ...comp };
        
        // 🚨 CHADLY PANIC MODE: If player is catching up
        const isChadly = comp.id === "chadly";
        if (isChadly && playerValuation > newComp.valuation * 0.8 && newComp.sentiment !== "panicking") {
            newComp.growth_rate += 0.08; 
            newComp.sentiment = "panicking";
            newComp.velocity = "hyper-growth";
            news.push(`📈 RIVAL PANIC: Chadly is terrified of your growth! He's burning his reserve capital to maintain the lead.`);
        } else if (isChadly && playerValuation < newComp.valuation * 0.5 && newComp.sentiment === "panicking") {
            newComp.growth_rate -= 0.08;
            newComp.sentiment = "merciless";
            newComp.velocity = "steady";
        }

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

        // Rival action (competitive move against the player)
        const actionChance = isChadly ? 0.35 : 0.15; // Chadly is more aggressive
        
        // ⚔️ Rival Defeat Condition: If player beats them 2x in scale
        if (playerUsers > newComp.users * 2 && Math.random() < 0.15 && newComp.status === "active") {
            newComp.status = "failed";
            news.push(`💼 RIVAL DEFEAT: ${newComp.name} couldn't match your hyper-growth and has capitulated!`);
        }
        
        // Attack earlier (at 10 users instead of 50)
        if (playerUsers > 10 && Math.random() < actionChance && newComp.status === "active") {
            const rivalAction = COMPETITOR_ACTIONS[Math.floor(Math.random() * COMPETITOR_ACTIONS.length)];
            newComp.last_action = rivalAction.type;
            
            // 🎲 Real-Player Backfire Simulation (Mistakes)
            const isBackfire = Math.random() < 0.20; // 20% mistake chance
            if (isBackfire) {
                const valuationHit = Math.floor(newComp.valuation * 0.15);
                newComp.valuation -= valuationHit;
                news.push(`⚠️ RIVAL MISTAKE: ${newComp.name}'s attempt to ${rivalAction.type} over-leveraged their roadmap, costing them valuation.`);
            } else {
                if (isChadly) {
                    const banter = RIVAL_BANTER[Math.floor(Math.random() * RIVAL_BANTER.length)];
                    (newComp as any).banter = banter;
                    news.push(`⚔️ CHADLY ATTACK: "${banter}" — ${newComp.name} ${rivalAction.description}`);
                } else {
                    news.push(`⚔️ RIVAL MOVE: ${newComp.name} ${rivalAction.description}`);
                }
                rivalActions.push({ action: rivalAction, competitorName: newComp.name });
            }
        }

        return newComp;
    });

    return { updated, news, rivalActions };
}
