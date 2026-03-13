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
};

const NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Charlie"];

export function generateCandidate(role: string, startupStage: string): Candidate {
    let level: Candidate["level"] = "Junior";
    const roll = Math.random();

    if (startupStage === "Bootstrapping") {
        level = roll < 0.1 ? "Mid" : "Junior";
    } else if (startupStage === "Angel Investment") {
        level = roll < 0.1 ? "Lead" : roll < 0.4 ? "Senior" : roll < 0.7 ? "Mid" : "Junior";
    } else {
        level = roll < 0.2 ? "Lead" : roll < 0.5 ? "Senior" : roll < 0.8 ? "Mid" : "Junior";
    }

    const salaryRanges = {
        Junior: { min: 45000, max: 75000 },
        Mid: { min: 80000, max: 125000 },
        Senior: { min: 140000, max: 190000 },
        Lead: { min: 200000, max: 280000 }
    };

    const range = salaryRanges[level];
    let expectedSalary = Math.floor(range.min + Math.random() * (range.max - range.min));

    if (role === "engineer") expectedSalary *= 1.1;
    if (role === "sales") expectedSalary *= 0.9;

    const experience = level === "Lead" ? 10 + Math.floor(Math.random() * 8) :
        level === "Senior" ? 6 + Math.floor(Math.random() * 5) :
            level === "Mid" ? 3 + Math.floor(Math.random() * 4) :
                Math.floor(Math.random() * 3);

    const stageEquityDivisor = startupStage === "Bootstrapping" ? 1 : startupStage === "Angel Investment" ? 2 : startupStage === "Seed Round" ? 5 : 10;
    const baseEquity = (level === "Lead" ? 2.5 : level === "Senior" ? 1.0 : level === "Mid" ? 0.3 : 0.1) / stageEquityDivisor;
    const expectedEquity = Number((baseEquity * (0.8 + Math.random() * 0.4)).toFixed(2));

    return {
        name: NAMES[Math.floor(Math.random() * NAMES.length)] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".",
        role,
        level,
        experience,
        expectedSalary: Math.floor(expectedSalary),
        expectedEquity,
        personality: ["Ambitious", "Stable", "Workaholic", "Creative"][Math.floor(Math.random() * 4)] as Candidate["personality"]
    };
}

export function calculateHiringSuccess(candidate: Candidate, offer: { salary: number, equity: number }, startup: Startup, founder: Founder): { success: boolean, reason: string } {
    let score = 50;
    // Dynamic value: 1% of company. For a $1M company, 1% = $10k. For $100M, 1% = $1M.
    const EQUITY_VALUE_OF_ONE_PERCENT = startup.valuation * 0.01;
    const expectedTotalComp = candidate.expectedSalary + (candidate.expectedEquity * EQUITY_VALUE_OF_ONE_PERCENT);
    const offeredTotalComp = offer.salary + (offer.equity * EQUITY_VALUE_OF_ONE_PERCENT);
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
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
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
    proposedValuation: number,
    proposedEquity: number
): { success: boolean, counterValuation?: number, counterEquity?: number, message: string } {

    const targetValuation = startup.valuation;
    const valuationRatio = proposedValuation / targetValuation;

    let sentiment = 50;

    // Personality-driven scoring
    switch (investor.personality) {
        case "Spray & Pray":
            // Low bar — just needs some traction
            sentiment += startup.metrics.users > 10 ? 20 : 0;
            break;
        case "Operator First":
            // Cares about founder reputation
            sentiment += (startup.metrics.team_morale - 50) / 2;
            sentiment += startup.metrics.employees > 3 ? 10 : 0;
            break;
        case "Thesis Driven":
            // Needs product quality + innovation
            sentiment += (startup.metrics.product_quality / 100) * 20;
            sentiment += (startup.metrics.innovation / 100) * 20;
            break;
        case "Contrarian":
            // Invests when metrics are nascent but story is strong
            sentiment += startup.metrics.users < 100 ? 20 : -5;
            break;
        case "Momentum Chaser":
            // Cares only about growth rate
            sentiment += (startup.metrics.growth_rate * 100) * 2;
            sentiment += startup.metrics.users > 500 ? 20 : -10;
            break;
    }

    // Standard valuation checks
    if (valuationRatio > 1.6) sentiment -= 30; // Slightly more headroom
    else if (valuationRatio > 1.3) sentiment -= 10;
    else if (valuationRatio < 0.95) sentiment += 15;

    // Equity check vs their preferred range
    if (proposedEquity < investor.preferredEquity.min) sentiment -= 20;
    else if (proposedEquity > investor.preferredEquity.max) sentiment += 10; // They like more equity

    const roll = Math.random() * 100;
    if (roll < sentiment) {
        return { success: true, message: `${investor.firm} loved the deal. Funds are being wired! 🚀` };
    } else if (roll < sentiment + 40) { // Increased counter-offer range, lowering hard walk-out chance
        const counterValuation = Math.floor(targetValuation * (0.8 + Math.random() * 0.3));
        const counterEquity = Math.min(30, Math.floor(proposedEquity * 1.5));
        return {
            success: false,
            counterValuation,
            counterEquity,
            message: `${investor.firm} counters: ${formatMoney(counterValuation)} at ${counterEquity}%. Our ${investor.focus} bar wasn't quite met.`
        };
    } else {
        const rejectionMessages: Record<InvestorPersonality, string> = {
            "Spray & Pray": "We need more signal before we can move. Come back with users.",
            "Operator First": "We want to see a stronger team before committing capital.",
            "Thesis Driven": "Doesn't fit our current thesis. Nothing personal.",
            "Contrarian": "Honestly? Too many investors are already chasing this space.",
            "Momentum Chaser": "The growth rate doesn't excite us yet. Hit 20% MoM and call us.",
        };
        return { success: false, message: rejectionMessages[investor.personality] };
    }
}
