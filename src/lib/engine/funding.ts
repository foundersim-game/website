import { Founder, Startup } from "../types/database.types";

export type FundingRound = {
    type: string;
    raised: number;
    valuation: number;
    equityGiven: number;
};

export function attemptFunding(founder: Founder, startup: Startup, investorUpdateStreak: number = 0): FundingRound | null {
    const revScore = (startup.metrics.revenue * 12) / 50000; // 1 point per 50k ARR
    const userScore = startup.metrics.users / 500; // 1 point per 500 users
    const valScore = (startup.valuation / 1000000) * 2; // 2 points per 1M valuation

    const prob = (founder.attributes.networking * 0.15) + (founder.attributes.reputation * 0.2) + revScore + userScore + valScore;
    const randomRoll = Math.random() * 100;

    if (randomRoll > prob && prob < 90) return null; // failed to raise

    let raised = 0;
    let equity = 0;

    // Adjust terms based on Investor Updates streak
    const valuationBump = investorUpdateStreak >= 6 ? 1.30 : investorUpdateStreak >= 3 ? 1.15 : 1.0;
    const equityDiscount = investorUpdateStreak >= 6 ? 0.70 : investorUpdateStreak >= 3 ? 0.85 : 1.0;

    const effectiveValuation = startup.valuation * valuationBump;

    if (startup.funding_stage === "Bootstrapping") {
        // Angel
        startup.funding_stage = "Angel Investment";
        raised = Math.floor(effectiveValuation * 0.12);
        equity = 10 * equityDiscount;
    } else if (startup.funding_stage === "Angel Investment") {
        // Seed
        startup.funding_stage = "Seed Round";
        raised = Math.floor(effectiveValuation * 0.18);
        equity = 15 * equityDiscount;
    } else if (startup.funding_stage === "Seed Round") {
        // Series A
        startup.funding_stage = "Series A";
        raised = Math.floor(effectiveValuation * 0.22);
        equity = 20 * equityDiscount;
    } else if (startup.funding_stage === "Series A") {
        // Series B
        startup.funding_stage = "Series B";
        raised = Math.floor(effectiveValuation * 0.25);
        equity = 18 * equityDiscount;
    } else if (startup.funding_stage === "Series B") {
        // Series C
        startup.funding_stage = "Series C";
        raised = Math.floor(effectiveValuation * 0.28);
        equity = 15 * equityDiscount;
    } else {
        return null; // Cap reached or IPO process in progress
    }

    return {
        type: startup.funding_stage,
        raised,
        valuation: effectiveValuation,
        equityGiven: Number(equity.toFixed(1))
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
