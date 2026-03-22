import { Founder, Startup } from "../types/database.types";

export type FundingRound = {
    type: string;
    raised: number;
    valuation: number;
    equityGiven: number;
};

export function getNextFundingStage(current: string): string | null {
    const sequence = ["Bootstrapping", "Angel Investment", "Seed Round", "Series A", "Series B", "Series C", "Series D", "Series E"];
    const idx = sequence.indexOf(current);
    if (idx === -1) {
        // Handle "IPO Ready" or other custom stages by looking for letters
        if (current.startsWith("Series ")) {
            const letter = current.split(" ")[1];
            if (letter.length === 1 && letter < "Z") {
                return `Series ${String.fromCharCode(letter.charCodeAt(0) + 1)}`;
            }
        }
        // If we are "IPO Ready" but only have Series A in cap table, we should probably be at Series B.
        // But the stage name is "IPO Ready". 
        // For existing broken states, we'll return a generic high-value round.
        return "Late Stage Round";
    }
    return sequence[idx + 1] || "Series F";
}

export function getFundingPhase(stage: string): string {
    if (stage === "Bootstrapping") return "Idea Phase";
    if (stage === "Angel Investment") return "Early Startup";
    if (stage === "Seed Round") return "Traction";
    if (stage === "Series A") return "Growth";
    if (stage === "Series B" || stage === "Series C" || stage === "Series D" || stage === "Series E") return "Scaling";
    return "Growth";
}

export function generateFundingTerms(startup: Startup, stage: string, investorUpdateStreak: number = 0): FundingRound {
    // This provides "Market Rate" terms for the negotiation UI to start from
    const valuationBump = investorUpdateStreak >= 6 ? 1.30 : investorUpdateStreak >= 3 ? 1.15 : 1.0;
    const effectiveValuation = startup.valuation * valuationBump;
    
    let raisedRatio = 0.15;
    let equityBase = 15;

    if (stage === "Angel Investment") { raisedRatio = 0.12; equityBase = 10; }
    else if (stage === "Seed Round") { raisedRatio = 0.18; equityBase = 15; }
    else if (stage === "Series A") { raisedRatio = 0.22; equityBase = 20; }
    else if (stage === "Series B") { raisedRatio = 0.25; equityBase = 18; }
    else if (stage === "Series C") { raisedRatio = 0.28; equityBase = 15; }
    else if (stage.startsWith("Series ")) {
        // Dynamic late stage logic for D, E, F, G...
        const letter = stage.split(" ")[1] || "D";
        const stepsBeyondC = Math.max(1, letter.charCodeAt(0) - "C".charCodeAt(0));
        raisedRatio = Math.min(0.35, 0.28 + (stepsBeyondC * 0.02));
        equityBase = Math.max(5, 15 - (stepsBeyondC * 2));
    }
    else {
        // Fallback for "Pre-IPO" or "Late Stage"
        raisedRatio = 0.10;
        equityBase = 5;
    }

    return {
        type: stage,
        raised: Math.floor(effectiveValuation * raisedRatio),
        valuation: effectiveValuation, // Market Valuation (Pre-money for the offer calculation)
        equityGiven: equityBase
    };
}

export function checkEndgame(startup: Startup): string | null {
    if (startup.metrics.cash < 0 && startup.metrics.burn_rate > 0) {
        return "bankruptcy";
    }
    // Auto-IPO removed for manual S-1 process in UI
    if (startup.metrics.team_morale <= 0) {
        return "resigned";
    }
    return null;
}
