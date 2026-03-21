import { Startup, Founder } from "../types/database.types";
import { formatMoney } from "../utils";

export type Candidate = {
    name: string;
    role: string;
    level: "Junior" | "Mid" | "Senior" | "Lead";
    experience: number;
    expectedSalary: number;
    expectedEquity: number;
    personality: "Ambitious" | "Stable" | "Workaholic" | "Creative";
    candId?: string;
};

export const CANDIDATE_NAMES = [
    "Aarav", "Priya", "Jordan", "Mei", "Samuel", "Aisha", 
    "Liam", "Riya", "Chris", "Nadia", "Tyler", "Zara",
    "Alex", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Charlie"
];

export function generateCandidate(role: string, startupStage: string, forcedDetails?: Partial<Candidate>): Candidate {
    let level: Candidate["level"] = forcedDetails?.level || "Junior";
    
    if (!forcedDetails?.level) {
        const roll = Math.random();
        if (startupStage === "Bootstrapping") {
            level = roll < 0.1 ? "Mid" : "Junior";
        } else if (startupStage === "Angel Investment") {
            level = roll < 0.1 ? "Lead" : roll < 0.4 ? "Senior" : roll < 0.7 ? "Mid" : "Junior";
        } else {
            level = roll < 0.2 ? "Lead" : roll < 0.5 ? "Senior" : roll < 0.8 ? "Mid" : "Junior";
        }
    }

    const salaryRanges = {
        Junior: { min: 45000, max: 75000 },
        Mid: { min: 80000, max: 125000 },
        Senior: { min: 140000, max: 190000 },
        Lead: { min: 200000, max: 280000 }
    };

    const range = salaryRanges[level];
    let expectedSalary = forcedDetails?.expectedSalary || Math.floor(range.min + Math.random() * (range.max - range.min));

    if (!forcedDetails?.expectedSalary) {
        if (role === "engineer") expectedSalary *= 1.1;
        if (role === "sales") expectedSalary *= 0.9;
    }

    const experience = level === "Lead" ? 10 + Math.floor(Math.random() * 8) :
        level === "Senior" ? 6 + Math.floor(Math.random() * 5) :
            level === "Mid" ? 3 + Math.floor(Math.random() * 4) :
                Math.floor(Math.random() * 3);

    const stageEquityDivisor = startupStage === "Bootstrapping" ? 1 : startupStage === "Angel Investment" ? 2 : startupStage === "Seed Round" ? 5 : 10;
    const baseEquity = (level === "Lead" ? 2.5 : level === "Senior" ? 1.0 : level === "Mid" ? 0.3 : 0.1) / stageEquityDivisor;
    const expectedEquity = forcedDetails?.expectedEquity || Number((baseEquity * (0.8 + Math.random() * 0.4)).toFixed(2));

    return {
        name: forcedDetails?.name || (CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + "."),
        role,
        level,
        experience,
        expectedSalary: Math.floor(expectedSalary),
        expectedEquity,
        personality: forcedDetails?.personality || (["Ambitious", "Stable", "Workaholic", "Creative"][Math.floor(Math.random() * 4)] as Candidate["personality"])
    };
}

export function calculateHiringSuccess(candidate: Candidate, offer: { salary: number, equity: number }, startup: Startup, founder: Founder): { success: boolean, reason: string } {
    let score = 50;
    const EQUITY_VALUE_OF_ONE_PERCENT = startup.valuation * 0.01;

    let salaryWeight = 1.0;
    let equityWeight = 1.0;

    if (candidate.personality === "Stable") {
        salaryWeight = 1.3;
        equityWeight = 0.5;
    } else if (candidate.personality === "Ambitious") {
        salaryWeight = 0.7;
        equityWeight = 1.5;
    } else if (candidate.personality === "Creative") {
        salaryWeight = 0.9;
        equityWeight = 1.1;
    }

    const expectedTotalComp = (candidate.expectedSalary * salaryWeight) + (candidate.expectedEquity * EQUITY_VALUE_OF_ONE_PERCENT * equityWeight);
    const offeredTotalComp = (offer.salary * salaryWeight) + (offer.equity * EQUITY_VALUE_OF_ONE_PERCENT * equityWeight);
    const compRatio = offeredTotalComp / expectedTotalComp;

    if (compRatio >= 1.2) score += 40;
    else if (compRatio >= 1) score += 20;
    else if (compRatio >= 0.8) score -= 10;
    else if (compRatio >= 0.6) score -= 30;
    else score -= 60;

    score += (founder.attributes.reputation - 50) / 2;
    const roll = Math.random() * 100;
    const success = roll < score;

    return {
        success,
        reason: success
            ? "The candidate was impressed by the mission and terms!"
            : score < 40
                ? "The offer was too low for a candidate of this caliber."
                : "The candidate decided to go with another offer."
    };
}

// ---- VC FIRM PROFILES ----
export type InvestorPersonality =
    | "Spray & Pray"     // invests small, expects huge returns, low bar
    | "Operator First"   // wants founders with domain expertise
    | "Thesis Driven"    // only invests in specific verticals
    | "Contrarian"       // invests when others pass
    | "Momentum Chaser"; // only bets on growing metrics

export type Investor = {
    name: string;
    firm: string;
    type: "Angel" | "Seed VC" | "Growth VC";
    personality: InvestorPersonality;
    checkSize: { min: number; max: number }; // In dollars
    preferredEquity: { min: number; max: number };
    focus: string; // What they care about most
    riskTolerance: number; // 0-100
    bio: string;
};

const FIRM_NAMES = [
    { firm: "Pioneer Ventures", personality: "Spray & Pray" as InvestorPersonality, focus: "Any traction", bio: "Write checks fast, ask questions later." },
    { firm: "Domain Capital", personality: "Operator First" as InvestorPersonality, focus: "Founder credibility", bio: "We back operators who've done it before." },
    { firm: "Blueprint Fund", personality: "Thesis Driven" as InvestorPersonality, focus: "AI & Vertical SaaS", bio: "Strong thesis on AI-native B2B." },
    { firm: "Contrarian Capital", personality: "Contrarian" as InvestorPersonality, focus: "Overlooked markets", bio: "We invest when everyone else says no." },
    { firm: "Momentum Partners", personality: "Momentum Chaser" as InvestorPersonality, focus: "Month-over-month growth", bio: "Show us the hockey stick." },
    { firm: "Horizon Ventures", personality: "Operator First" as InvestorPersonality, focus: "Growth metrics", bio: "We partner with founders building for the long game." },
];

export function generateInvestor(stage: string): Investor {
    const firmData = FIRM_NAMES[Math.floor(Math.random() * FIRM_NAMES.length)];
    const type: Investor["type"] = stage === "Bootstrapping" ? "Angel" : stage === "Angel Investment" ? "Seed VC" : "Growth VC";

    const checkSizes: Record<string, { min: number; max: number }> = {
        Angel: { min: 25000, max: 150000 },
        "Seed VC": { min: 500000, max: 3000000 },
        "Growth VC": { min: 5000000, max: 25000000 },
    };

    return {
        name: CANDIDATE_NAMES[Math.floor(Math.random() * CANDIDATE_NAMES.length)],
        firm: firmData.firm,
        type,
        personality: firmData.personality,
        checkSize: checkSizes[type],
        preferredEquity: type === "Angel" ? { min: 2, max: 10 } : type === "Seed VC" ? { min: 10, max: 20 } : { min: 15, max: 30 },
        focus: firmData.focus,
        riskTolerance: Math.floor(Math.random() * 100),
        bio: firmData.bio,
    };
}

export function negotiateFunding(
    investor: Investor,
    startup: Startup,
    proposedPostMoney: number,
    proposedEquity: number
): { success: boolean, counterValuation?: number, counterEquity?: number, message: string } {

    // Post-Money = Pre-Money + Investment
    // Equity % = Investment / Post-Money
    // Investment = Post-Money * (Equity / 100)
    // Pre-Money = Post-Money - Investment = Post-Money * (1 - Equity/100)
    
    const proposedPreMoney = proposedPostMoney * (1 - proposedEquity / 100);
    const currentMark = startup.valuation;
    const stepUpRatio = proposedPreMoney / currentMark;

    let sentiment = 40; // Base sentiment lower for more challenge

    // Personality-driven scoring
    switch (investor.personality) {
        case "Spray & Pray":
            sentiment += startup.metrics.users > 50 ? 25 : 5;
            break;
        case "Operator First":
            sentiment += (startup.metrics.team_morale - 50) / 2;
            sentiment += startup.metrics.employees > 5 ? 15 : 0;
            sentiment += (startup as any).hasCoFounder ? 10 : 0;
            break;
        case "Thesis Driven":
            sentiment += (startup.metrics.product_quality / 100) * 30;
            sentiment += (startup.metrics.innovation / 100) * 20;
            break;
        case "Contrarian":
            sentiment += stepUpRatio < 1.2 ? 25 : -10;
            break;
        case "Momentum Chaser":
            const growthFactor = (startup.metrics.growth_rate * 100);
            sentiment += growthFactor > 15 ? 30 : growthFactor > 5 ? 10 : -20;
            break;
    }

    // Valuation Check (Step-up is key for VCs)
    if (stepUpRatio > 3.0) sentiment -= 60;      // 3x jump is huge
    else if (stepUpRatio > 2.0) sentiment -= 40; // 2x jump is hard
    else if (stepUpRatio > 1.5) sentiment -= 20;
    else if (stepUpRatio < 1.1) sentiment += 20; // "Flat" rounds are easy to close

    // Equity check vs their preferred range
    if (proposedEquity < investor.preferredEquity.min) sentiment -= 25;
    else if (proposedEquity > investor.preferredEquity.max) sentiment += 15;

    const roll = Math.random() * 100;
    if (roll < sentiment) {
        return { success: true, message: `${investor.firm} accepts the terms. "You've built something special here. Let's go!" 🚀` };
    } else if (roll < sentiment + 45) { 
        // Generates a more aggressive counter
        const targetPreMoney = currentMark * (1.1 + Math.random() * 0.4); // They want a 1.1x - 1.5x step up
        const targetEquity = Math.max(investor.preferredEquity.min, Math.min(investor.preferredEquity.max, proposedEquity + 5));
        
        // Final Post-Money counter = Pre-Money / (1 - Equity/100)
        const counterPostMoney = Math.floor(targetPreMoney / (1 - targetEquity / 100));

        return {
            success: false,
            counterValuation: counterPostMoney,
            counterEquity: targetEquity,
            message: `${investor.firm} counters: ${formatMoney(counterPostMoney)} at ${targetEquity}%. "The valuation is a bit ahead of the metrics, but we want to be in business with you."`
        };
    } else {
        const rejectionMessages: Record<InvestorPersonality, string> = {
            "Spray & Pray": "We're not seeing the user growth we need for this valuation.",
            "Operator First": "We don't think the team is ready to deploy this much capital yet.",
            "Thesis Driven": "The product doesn't meet our 'moat' requirements at this price point.",
            "Contrarian": "The market feels too crowded for us to overpay here.",
            "Momentum Chaser": "Come back when you have a 3-month track record of 20% growth.",
        };
        return { success: false, message: rejectionMessages[investor.personality] };
    }
}
