import { Startup, Founder, AcquisitionOffer, CapTableEntry } from "../types/database.types";

/**
 * M&A Engine: Generates logical acquisition offers based on startup performance.
 */
export function generateAcquisitionOffer(startup: Startup, founder: Founder): AcquisitionOffer | null {
    const valuation = startup.valuation;
    const annualRevenue = startup.metrics.revenue * 12;
    const pmf = startup.metrics.pmf_score;
    const growth = startup.metrics.growth_rate;

    // Prevent offers if IPO is in progress or game has ended
    if ((startup.ipo_stage || 0) > 0 || startup.outcome) return null;

    // Minimum criteria for an offer
    if (annualRevenue < 500000 && valuation < 5000000 && pmf < 40) return null;

    // Probability of receiving an offer this month
    let prob = 3; // 3% baseline
    if (pmf > 70) prob += 5;
    if (growth > 0.15) prob += 10;
    if (annualRevenue > 2000000) prob += 5;
    if (startup.funding_stage === "Series B" || startup.funding_stage === "Series C") prob += 10;

    if (Math.random() * 100 > prob) return null;

    // --- REFINED OFFER LOGIC ---
    // Acquirers pay based on Multiples of ARR, adjusted for Burn and PMF
    const roll = Math.random() * 100;
    let acquirerType: "strategic" | "financial" | "big_tech" = "strategic";
    let acquirerName = "Market Competitor";
    let baseMultiple = 8; // Baseline SaaS multiple

    if (roll > 80) {
        acquirerType = "big_tech";
        acquirerName = getBigTechName(startup.industry);
        // Big Tech pays for outlier growth/talent (15-30x)
        baseMultiple = 15 + (growth * 60); 
    } else if (roll > 40) {
        acquirerType = "strategic";
        acquirerName = "Enterprise Solutions Inc";
        // Strategics pay for PMF and market consolidation (10-18x)
        baseMultiple = 10 + (pmf / 10);
    } else {
        acquirerType = "financial";
        acquirerName = "Global Equity Partners";
        // Financials pay for cashflow/stability (5-10x)
        baseMultiple = 5 + (pmf / 20);
    }

    // INDUSTRY ADJUSTMENTS
    if (startup.industry.includes("AI")) baseMultiple *= 1.5; // AI Hype Premium
    if (startup.industry.includes("E-commerce")) baseMultiple *= 0.6; // Transactional lower multiple

    // BURN RATE PENALTY: "The Efficiency Haircut"
    // If burn is > 50% of revenue, acquirers start discounting heavily
    const burnRatio = startup.metrics.burn_rate / (startup.metrics.revenue + 1);
    let burnPenalty = 1.0;
    if (burnRatio > 1.0) burnPenalty = 0.5; // Burning more than you make
    else if (burnRatio > 0.5) burnPenalty = 0.75;
    else if (burnRatio > 0.2) burnPenalty = 0.9;

    let offerAmount = Math.floor(annualRevenue * baseMultiple * burnPenalty);
    
    // Floor: Never offer less than 80% of current paper valuation
    const valuationFloor = valuation * 0.8;
    if (offerAmount < valuationFloor) {
        offerAmount = Math.floor(valuationFloor + (Math.random() * valuation * 0.2));
    }

    // Calculate Founder's personal payout using the Cap Table
    const founderEntry = (startup.capTable || []).find((e: CapTableEntry) => e.type === "Founder");
    const founderEquity = founderEntry ? founderEntry.equity / 100 : 0.8; // Default to 80% if no cap table
    const founderTake = Math.floor(offerAmount * founderEquity);

    return {
        id: Math.random().toString(36).substr(2, 9),
        acquirer: acquirerName,
        type: acquirerType,
        offer_amount: offerAmount,
        founder_take: founderTake,
        expires_in: 3, // 3 months to decide
        negotiated: false
    };
}

function getBigTechName(industry: string): string {
    if (industry.includes("AI")) return "NeuroCore Systems";
    if (industry.includes("SaaS")) return "CloudGiant Inc";
    if (industry.includes("E-commerce")) return "GlobalMart Technologies";
    return "OmniCorp Tech";
}
