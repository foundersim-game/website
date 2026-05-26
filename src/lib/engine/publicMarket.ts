import { MarketStock, PortfolioPosition, SeasonType, MacroEvent, StockShareholder, TenderOfferTarget } from "../types/database.types";

// ── INSTITUTIONAL SHAREHOLDER POOLS ───────────────────────────────────────────
const INSTITUTIONAL_NAMES = [
    "Vantage Index Fund", "Apex Capital Management", "Meridian Sovereign Fund",
    "BluePeak Asset Group", "Crestline Investments", "Zenith Global Partners",
    "Aether Capital", "Summit Ridge Fund", "Northstar Institutional", "Cascade Equity",
    "Pinnacle Asset Managers", "Horizon Growth Fund", "Sterling Asset Partners",
    "Granite Wealth Management", "Ironbridge Capital"
];

const VC_NAMES = [
    "Sequoia Ventures", "Lightspeed Partners", "Andreessen Capital",
    "Benchmark Capital", "Kleiner Capital", "Greylock Partners",
    "Accel Ventures", "Tiger Global", "General Catalyst"
];

// ── TICKER AUTO-GENERATION ────────────────────────────────────────────────────
export function autoGenerateTicker(companyName: string, existingTickers: string[] = []): string {
    const consonants = companyName.toUpperCase().replace(/[^A-Z]/g, "").replace(/[AEIOU]/g, "");
    let base = consonants.slice(0, 4).padEnd(4, companyName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4));
    base = base.slice(0, 4);
    if (!existingTickers.includes(base)) return base;
    // Add suffix if collision
    for (let i = 1; i <= 9; i++) {
        const candidate = base.slice(0, 3) + i;
        if (!existingTickers.includes(candidate)) return candidate;
    }
    return base + Math.floor(Math.random() * 99);
}

// ── SHAREHOLDER INITIALIZATION ──────────────────────────────────────────────────
export function generateStockShareholders(
    companyTier: "rival" | "small_cap" | "mid_cap" | "large_cap",
    founderName?: string
): StockShareholder[] {
    // Shuffle institutional pool deterministically
    const shuffled = [...INSTITUTIONAL_NAMES].sort(() => Math.random() - 0.5);
    const vcShuffled = [...VC_NAMES].sort(() => Math.random() - 0.5);

    if (companyTier === "rival") {
        const founderPct = 60 + Math.round(Math.random() * 15); // 60-75%
        const vc1Pct = Math.round(5 + Math.random() * 10);
        const vc2Pct = Math.round(3 + Math.random() * 7);
        const floatPct = 100 - founderPct - vc1Pct - vc2Pct;
        return [
            { name: founderName || "Rival Founder", type: "founder", ownershipPct: founderPct },
            { name: vcShuffled[0], type: "vc", ownershipPct: vc1Pct },
            { name: vcShuffled[1], type: "vc", ownershipPct: vc2Pct },
            { name: "Public Float", type: "public_float", ownershipPct: floatPct },
        ];
    }

    if (companyTier === "small_cap") {
        const insiderPct = 10 + Math.round(Math.random() * 10);
        const inst1 = 12 + Math.round(Math.random() * 8);
        const inst2 = 8 + Math.round(Math.random() * 6);
        const inst3 = 5 + Math.round(Math.random() * 5);
        const floatPct = 100 - insiderPct - inst1 - inst2 - inst3;
        return [
            { name: "Insider / Management", type: "founder", ownershipPct: insiderPct },
            { name: shuffled[0], type: "institution", ownershipPct: inst1 },
            { name: shuffled[1], type: "institution", ownershipPct: inst2 },
            { name: shuffled[2], type: "institution", ownershipPct: inst3 },
            { name: "Public Float", type: "public_float", ownershipPct: floatPct },
        ];
    }

    if (companyTier === "mid_cap") {
        const inst1 = 12 + Math.round(Math.random() * 8);
        const inst2 = 10 + Math.round(Math.random() * 7);
        const inst3 = 8 + Math.round(Math.random() * 5);
        const inst4 = 6 + Math.round(Math.random() * 4);
        const insiderPct = 5 + Math.round(Math.random() * 5);
        const floatPct = 100 - inst1 - inst2 - inst3 - inst4 - insiderPct;
        return [
            { name: shuffled[0], type: "institution", ownershipPct: inst1 },
            { name: shuffled[1], type: "institution", ownershipPct: inst2 },
            { name: shuffled[2], type: "institution", ownershipPct: inst3 },
            { name: shuffled[3], type: "institution", ownershipPct: inst4 },
            { name: "Insider / Management", type: "founder", ownershipPct: insiderPct },
            { name: "Public Float", type: "public_float", ownershipPct: floatPct },
        ];
    }

    // large_cap
    const inst1 = 14 + Math.round(Math.random() * 6);
    const inst2 = 12 + Math.round(Math.random() * 5);
    const inst3 = 10 + Math.round(Math.random() * 5);
    const inst4 = 8 + Math.round(Math.random() * 4);
    const insiderPct = 2 + Math.round(Math.random() * 3);
    const floatPct = 100 - inst1 - inst2 - inst3 - inst4 - insiderPct;
    return [
        { name: shuffled[0], type: "institution", ownershipPct: inst1 },
        { name: shuffled[1], type: "institution", ownershipPct: inst2 },
        { name: shuffled[2], type: "institution", ownershipPct: inst3 },
        { name: shuffled[3], type: "institution", ownershipPct: inst4 },
        { name: "Insider / Management", type: "founder", ownershipPct: insiderPct },
        { name: "Public Float", type: "public_float", ownershipPct: floatPct },
    ];
}

// ── COMPANY TIER CLASSIFICATION ───────────────────────────────────────────────
export function getCompanyTier(marketCap: number): "rival" | "small_cap" | "mid_cap" | "large_cap" {
    if (marketCap < 100_000_000) return "rival"; // < $100M
    if (marketCap < 5_000_000_000) return "small_cap"; // < $5B
    if (marketCap < 100_000_000_000) return "mid_cap"; // < $100B
    return "large_cap";
}

// Control threshold: the % stake you need to trigger a hostile takeover
export function getControlThreshold(tier: "rival" | "small_cap" | "mid_cap" | "large_cap"): number {
    switch (tier) {
        case "rival": return 51;       // Need actual majority for founder-controlled companies
        case "small_cap": return 25;
        case "mid_cap": return 30;
        case "large_cap": return 25;
    }
}

/**
 * Initialize the default market stocks with shareholders and tiers.
 */
export function initializeMarketStocks(playerCompanySymbol?: string, playerIpoPrice?: number, playerCompanyName?: string): MarketStock[] {
    const baseStocks: MarketStock[] = [
        // Technology — large caps
        { symbol: "GOOG", companyName: "Search Co", sector: "Technology", currentPrice: 175.20, sharesOutstanding: 1_000_000_000, peRatio: 25, momentum: 0, volatility: 0.05, rsi: 50, priceHistory: [175.20], companyTier: "large_cap" },
        { symbol: "PEAR", companyName: "Pear Computers", sector: "Technology", currentPrice: 190.50, sharesOutstanding: 800_000_000, peRatio: 30, momentum: 0.1, volatility: 0.04, rsi: 55, priceHistory: [190.50], companyTier: "large_cap" },
        { symbol: "MCLD", companyName: "MicroCloud", sector: "Technology", currentPrice: 405.10, sharesOutstanding: 500_000_000, peRatio: 35, momentum: 0.2, volatility: 0.06, rsi: 60, priceHistory: [405.10], companyTier: "large_cap" },
        { symbol: "SFLX", companyName: "StreamFlix", sector: "Technology", currentPrice: 600.00, sharesOutstanding: 450_000_000, peRatio: 45, momentum: -0.1, volatility: 0.08, rsi: 45, priceHistory: [600.00], companyTier: "large_cap" },
        { symbol: "CRMS", companyName: "CloudCRM", sector: "Technology", currentPrice: 245.80, sharesOutstanding: 300_000_000, peRatio: 50, momentum: 0.05, volatility: 0.07, rsi: 52, priceHistory: [245.80], companyTier: "mid_cap" },
        // Energy
        { symbol: "XON", companyName: "Exxon Energy", sector: "Energy", currentPrice: 110.20, sharesOutstanding: 2_000_000_000, peRatio: 12, momentum: 0.02, volatility: 0.03, rsi: 48, priceHistory: [110.20], companyTier: "large_cap" },
        { symbol: "NXG", companyName: "NextGen Solar", sector: "Energy", currentPrice: 45.30, sharesOutstanding: 150_000_000, peRatio: -10, momentum: 0.15, volatility: 0.12, rsi: 65, priceHistory: [45.30], companyTier: "small_cap" },
        { symbol: "OPEC", companyName: "Opec Corp", sector: "Energy", currentPrice: 85.00, sharesOutstanding: 1_500_000_000, peRatio: 10, momentum: -0.05, volatility: 0.04, rsi: 42, priceHistory: [85.00], companyTier: "large_cap" },
        { symbol: "WIND", companyName: "WindTech", sector: "Energy", currentPrice: 32.10, sharesOutstanding: 200_000_000, peRatio: 85, momentum: 0.08, volatility: 0.10, rsi: 58, priceHistory: [32.10], companyTier: "small_cap" },
        { symbol: "PGLB", companyName: "PetroGlobal", sector: "Energy", currentPrice: 95.50, sharesOutstanding: 1_200_000_000, peRatio: 14, momentum: 0.01, volatility: 0.03, rsi: 50, priceHistory: [95.50], companyTier: "large_cap" },
        // Healthcare
        { symbol: "PHRM", companyName: "PharmaCorp", sector: "Healthcare", currentPrice: 150.00, sharesOutstanding: 800_000_000, peRatio: 20, momentum: 0.04, volatility: 0.04, rsi: 54, priceHistory: [150.00], companyTier: "large_cap" },
        { symbol: "MDTC", companyName: "MediTech", sector: "Healthcare", currentPrice: 88.50, sharesOutstanding: 400_000_000, peRatio: 25, momentum: -0.02, volatility: 0.05, rsi: 47, priceHistory: [88.50], companyTier: "mid_cap" },
        { symbol: "GBIO", companyName: "Global Bio", sector: "Healthcare", currentPrice: 210.20, sharesOutstanding: 300_000_000, peRatio: 40, momentum: 0.12, volatility: 0.09, rsi: 62, priceHistory: [210.20], companyTier: "mid_cap" },
        { symbol: "CARE", companyName: "CarePlus", sector: "Healthcare", currentPrice: 75.40, sharesOutstanding: 500_000_000, peRatio: 18, momentum: 0.01, volatility: 0.03, rsi: 51, priceHistory: [75.40], companyTier: "mid_cap" },
        { symbol: "VITA", companyName: "VitaGen", sector: "Healthcare", currentPrice: 42.80, sharesOutstanding: 150_000_000, peRatio: -5, momentum: -0.15, volatility: 0.15, rsi: 35, priceHistory: [42.80], companyTier: "small_cap" },
        // Defense
        { symbol: "LKD", companyName: "Lockheed Dynamics", sector: "Defense", currentPrice: 450.00, sharesOutstanding: 250_000_000, peRatio: 18, momentum: 0.05, volatility: 0.03, rsi: 55, priceHistory: [450.00], companyTier: "mid_cap" },
        { symbol: "BAER", companyName: "Boeing Aero", sector: "Defense", currentPrice: 215.30, sharesOutstanding: 600_000_000, peRatio: 22, momentum: -0.08, volatility: 0.06, rsi: 42, priceHistory: [215.30], companyTier: "mid_cap" },
        { symbol: "SPCT", companyName: "SpaceTech", sector: "Defense", currentPrice: 310.50, sharesOutstanding: 100_000_000, peRatio: 80, momentum: 0.18, volatility: 0.12, rsi: 68, priceHistory: [310.50], companyTier: "small_cap" },
        { symbol: "DEF", companyName: "Defendo", sector: "Defense", currentPrice: 125.00, sharesOutstanding: 350_000_000, peRatio: 15, momentum: 0.02, volatility: 0.04, rsi: 52, priceHistory: [125.00], companyTier: "mid_cap" },
        { symbol: "ORBT", companyName: "Orbit Corp", sector: "Defense", currentPrice: 85.20, sharesOutstanding: 200_000_000, peRatio: 35, momentum: 0.07, volatility: 0.08, rsi: 57, priceHistory: [85.20], companyTier: "small_cap" },
        // Real Estate
        { symbol: "GLBP", companyName: "Global Properties", sector: "Real Estate", currentPrice: 65.40, sharesOutstanding: 500_000_000, peRatio: 14, momentum: 0.01, volatility: 0.04, rsi: 50, priceHistory: [65.40], companyTier: "mid_cap" },
        { symbol: "URET", companyName: "Urban REIT", sector: "Real Estate", currentPrice: 120.50, sharesOutstanding: 200_000_000, peRatio: 16, momentum: -0.04, volatility: 0.05, rsi: 46, priceHistory: [120.50], companyTier: "small_cap" },
        { symbol: "MTRH", companyName: "Metro Homes", sector: "Real Estate", currentPrice: 45.80, sharesOutstanding: 300_000_000, peRatio: 12, momentum: 0.03, volatility: 0.06, rsi: 53, priceHistory: [45.80], companyTier: "small_cap" },
        { symbol: "CEST", companyName: "Commercial Estates", sector: "Real Estate", currentPrice: 88.20, sharesOutstanding: 400_000_000, peRatio: 18, momentum: -0.10, volatility: 0.07, rsi: 40, priceHistory: [88.20], companyTier: "mid_cap" },
        { symbol: "LCRP", companyName: "LandCorp", sector: "Real Estate", currentPrice: 55.10, sharesOutstanding: 600_000_000, peRatio: 15, momentum: 0.02, volatility: 0.03, rsi: 51, priceHistory: [55.10], companyTier: "mid_cap" },
        // Broad Market indices
        { symbol: "VTI", companyName: "Total Market Index", sector: "Broad Market", currentPrice: 260.00, sharesOutstanding: 2_000_000_000, peRatio: 20, momentum: 0.02, volatility: 0.02, rsi: 52, priceHistory: [260.00], companyTier: "large_cap" },
        { symbol: "QQQ", companyName: "Tech Index", sector: "Broad Market", currentPrice: 450.00, sharesOutstanding: 1_500_000_000, peRatio: 28, momentum: 0.04, volatility: 0.03, rsi: 55, priceHistory: [450.00], companyTier: "large_cap" },
        { symbol: "DIA", companyName: "Industrial Index", sector: "Broad Market", currentPrice: 380.00, sharesOutstanding: 800_000_000, peRatio: 18, momentum: 0.01, volatility: 0.02, rsi: 50, priceHistory: [380.00], companyTier: "large_cap" },
        { symbol: "IWM", companyName: "Small Cap Index", sector: "Broad Market", currentPrice: 200.00, sharesOutstanding: 1_200_000_000, peRatio: 25, momentum: -0.02, volatility: 0.04, rsi: 48, priceHistory: [200.00], companyTier: "large_cap" },
        { symbol: "GLD", companyName: "Gold Trust", sector: "Broad Market", currentPrice: 220.00, sharesOutstanding: 500_000_000, peRatio: 0, momentum: 0.05, volatility: 0.02, rsi: 58, priceHistory: [220.00], companyTier: "mid_cap" },
    ];

    // Generate shareholders for each stock
    const enriched = baseStocks.map(s => ({
        ...s,
        shareholders: generateStockShareholders(s.companyTier || "large_cap")
    }));

    if (playerCompanySymbol && playerIpoPrice) {
        enriched.unshift({
            symbol: playerCompanySymbol,
            companyName: playerCompanyName || "Your Company",
            sector: "Technology",
            currentPrice: playerIpoPrice,
            sharesOutstanding: 100_000_000,
            peRatio: 50,
            momentum: 0,
            volatility: 0.08,
            rsi: 50,
            priceHistory: [playerIpoPrice, playerIpoPrice * 0.98, playerIpoPrice * 1.02],
            companyTier: "small_cap",
            shareholders: [
                { name: "You (Founder)", type: "founder", ownershipPct: 65 },
                { name: "Early Investors", type: "vc", ownershipPct: 20 },
                { name: "Public Float", type: "public_float", ownershipPct: 15 },
            ]
        });
    }

    return enriched;
}

// ── RIVAL IPO LOGIC ──────────────────────────────────────────────────────────────
export function shouldRivalIPO(rivalValuation: number, rivalSymbol?: string): boolean {
    return rivalValuation >= 50_000_000 && !rivalSymbol;
}

export function createRivalStock(rivalName: string, rivalValuation: number, rivalId: string, existingTickers: string[]): MarketStock {
    const ticker = autoGenerateTicker(rivalName, existingTickers);
    const sharesOutstanding = 10_000_000; // Fixed 10M shares for rivals
    const ipoPrice = rivalValuation / sharesOutstanding;
    const founderName = `${rivalName.split(" ")[0]} Founder`;
    return {
        symbol: ticker,
        companyName: rivalName,
        sector: "Technology",
        currentPrice: ipoPrice,
        sharesOutstanding,
        peRatio: 30 + Math.round(Math.random() * 20),
        momentum: 0.05 + Math.random() * 0.1,
        volatility: 0.10 + Math.random() * 0.05,
        rsi: 50 + Math.round(Math.random() * 10),
        priceHistory: [ipoPrice],
        companyTier: "rival",
        isRival: true,
        rivalId,
        founderOwnershipPct: 65,
        shareholders: generateStockShareholders("rival", founderName),
        recentNews: `${rivalName} lists on the public market at $${ipoPrice.toFixed(2)}`,
        newsContext: `${rivalName} has gone public after crossing $50M valuation. Founder retains majority control.`,
        newsHistory: [],
    };
}

// ── SUBSIDIARY STOCK CREATION ───────────────────────────────────────────────────
export function createSubsidiaryStock(
    subsidiaryName: string,
    subsidiaryValuation: number,
    existingTickers: string[],
    parentCompanyName: string
): MarketStock {
    const ticker = autoGenerateTicker(subsidiaryName, existingTickers);
    const sharesOutstanding = 20_000_000;
    const ipoPrice = subsidiaryValuation / sharesOutstanding;
    return {
        symbol: ticker,
        companyName: subsidiaryName,
        sector: "Technology",
        currentPrice: ipoPrice,
        sharesOutstanding,
        peRatio: 25,
        momentum: 0,
        volatility: 0.09,
        rsi: 50,
        priceHistory: [ipoPrice],
        companyTier: "small_cap",
        isSubsidiary: true,
        shareholders: [
            { name: parentCompanyName, type: "founder", ownershipPct: 80 },
            { name: "Pre-Merger Holders", type: "public_float", ownershipPct: 20 },
        ],
        recentNews: `${subsidiaryName} begins trading as a standalone public entity`,
        newsContext: `Subsidiary of ${parentCompanyName}. Listed at $${ipoPrice.toFixed(2)} per share.`,
        newsHistory: [],
    };
}

// Merge a subsidiary back into parent — removes from market, returns valuation impact
export function mergeSubsidiaryIntoParent(
    subsidiaryStock: MarketStock,
    parentSharePrice: number,
    parentSharesOutstanding: number
): { valuationImpact: number; exchangeRatio: number } {
    const subsidiaryMarketCap = subsidiaryStock.currentPrice * subsidiaryStock.sharesOutstanding;
    // Exchange ratio: subsidiary shares become parent shares at current prices
    const exchangeRatio = subsidiaryStock.currentPrice / parentSharePrice;
    const valuationImpact = subsidiaryMarketCap * 0.85; // 85% synergy capture
    return { valuationImpact, exchangeRatio };
}

// ── SECTOR-AWARE RICH NEWS GENERATION ────────────────────────────────────────────
interface NewsItem { headline: string; context: string; momentumImpact: number; }

const NEWS_BY_SECTOR: Record<string, { highly_positive: NewsItem[]; positive: NewsItem[]; neutral: NewsItem[]; negative: NewsItem[]; highly_negative: NewsItem[]; }> = {
    Technology: {
        highly_positive: [
            { headline: "Record-Breaking Earnings Beat", context: "Q3 revenue surged 42% YoY, crushing analyst consensus by $2.1B. Cloud growth remains the primary driver.", momentumImpact: 0.7 },
            { headline: "AI Product Launch Triggers Surge", context: "New AI assistant product goes viral overnight, adding 12M new signups within 48 hours of launch.", momentumImpact: 0.65 },
            { headline: "Massive Government Contract Secured", context: "$4.2B multi-year federal cloud contract awarded. Analysts raise price targets across the board.", momentumImpact: 0.6 },
            { headline: "Major Competitor Files for Bankruptcy", context: "Key rival's collapse creates an immediate market share vacuum. Analysts estimate $800M revenue opportunity.", momentumImpact: 0.55 },
        ],
        positive: [
            { headline: "Strong Revenue Growth Reported", context: "Beat estimates by 8% this quarter. International expansion is gaining traction faster than expected.", momentumImpact: 0.25 },
            { headline: "New Enterprise Partnership Announced", context: "Multi-year licensing deal signed with Fortune 500 firm. Adds estimated $120M to annual recurring revenue.", momentumImpact: 0.2 },
            { headline: "Analyst Cluster Upgrades to Buy", context: "Three major firms upgraded the stock citing improving unit economics and accelerating net revenue retention.", momentumImpact: 0.2 },
            { headline: "Product Expansion Into New Market", context: "Company enters the APAC market. Early adoption metrics from beta users exceed internal projections.", momentumImpact: 0.15 },
        ],
        neutral: [
            { headline: "In-Line Quarterly Results", context: "Revenue met consensus; management reiterates full-year guidance. No major surprises in earnings call.", momentumImpact: 0 },
            { headline: "Board Approves Routine Dividend", context: "Quarterly dividend of $0.24 per share declared, unchanged from prior quarter. No buyback changes.", momentumImpact: 0 },
            { headline: "Annual Developer Conference Announced", context: "Company confirms its annual developer summit for next quarter. Product roadmap updates expected.", momentumImpact: 0.02 },
            { headline: "No Material Business Changes", context: "Filing confirms ongoing operations consistent with guidance. No acquisitions or divestitures pending.", momentumImpact: 0 },
            { headline: "Leadership Transition Confirmed", context: "COO transition confirmed as planned. New hire has strong background in enterprise software growth.", momentumImpact: -0.02 },
        ],
        negative: [
            { headline: "Misses Revenue Estimates", context: "Fell 6% short of analyst expectations. Management attributed miss to macro headwinds and deal slippage.", momentumImpact: -0.25 },
            { headline: "Analyst Downgrade to Hold", context: "Citing slowing growth and elevated valuation multiples, two major banks cut their ratings this week.", momentumImpact: -0.2 },
            { headline: "Layoffs Announced — 8% Headcount Reduction", context: "Company announces restructuring, cutting 8% of global workforce. Severance costs will hit Q4 margins.", momentumImpact: -0.2 },
            { headline: "Cloud Outage Impacts Major Clients", context: "A 6-hour outage affected thousands of enterprise customers. SLA credits expected to impact revenue.", momentumImpact: -0.18 },
        ],
        highly_negative: [
            { headline: "CEO Abruptly Resigns Amid Pressure", context: "CEO departure follows leaked board meeting minutes demanding strategic pivot. Stock hits 52-week low.", momentumImpact: -0.65 },
            { headline: "DOJ Launches Antitrust Investigation", context: "Department of Justice opens formal antitrust probe into market dominance practices. Legal costs expected to be material.", momentumImpact: -0.6 },
            { headline: "Massive Data Breach Confirmed", context: "140M user records compromised. Company faces class-action lawsuit and FTC investigation simultaneously.", momentumImpact: -0.55 },
            { headline: "Earnings Fraud Allegations Emerge", context: "Short seller publishes 60-page report alleging revenue manipulation across three fiscal years.", momentumImpact: -0.7 },
        ],
    },
    Energy: {
        highly_positive: [
            { headline: "Geopolitical Crisis Spikes Oil Demand", context: "Supply disruptions in the Middle East push crude to $140/barrel. Company hedges positioned perfectly.", momentumImpact: 0.65 },
            { headline: "Massive New Reserve Discovery", context: "Exploratory drilling reveals an estimated 2.4 billion barrel reserve off the coast of Brazil.", momentumImpact: 0.6 },
        ],
        positive: [
            { headline: "Strong Refining Margins This Quarter", context: "Crack spreads widened significantly. Downstream operations posted strongest quarter in four years.", momentumImpact: 0.22 },
            { headline: "Renewable Expansion Ahead of Schedule", context: "Solar and wind projects reached commercial operation 3 months early, ahead of regulatory deadlines.", momentumImpact: 0.18 },
        ],
        neutral: [
            { headline: "OPEC Output Decision — No Change", context: "OPEC maintains current production quotas. Oil prices stable in the $78-85 range heading into next quarter.", momentumImpact: 0 },
            { headline: "Routine Refinery Maintenance Completed", context: "Scheduled turnaround at Gulf Coast refinery completed on time and on budget. Full capacity now restored.", momentumImpact: 0 },
            { headline: "Energy Prices Hold Steady This Month", context: "Natural gas and crude oil prices remained range-bound. No significant catalysts expected near term.", momentumImpact: 0.01 },
        ],
        negative: [
            { headline: "Oil Demand Projections Revised Down", context: "IEA cuts global demand forecast by 1.2M barrels/day. Weak China data the primary driver of the revision.", momentumImpact: -0.22 },
            { headline: "Environmental Lawsuit Filed", context: "EPA and 12 states file suit over pipeline spill. Estimated cleanup liability: $800M to $1.2B.", momentumImpact: -0.2 },
        ],
        highly_negative: [
            { headline: "Catastrophic Refinery Explosion", context: "Major refinery explosion forces complete shutdown. Estimated damage: $3B. Insurance coverage disputed.", momentumImpact: -0.6 },
            { headline: "Massive Oil Spill Triggers Federal Response", context: "Offshore rig blowout causes largest spill in a decade. Congressional hearings immediately scheduled.", momentumImpact: -0.65 },
        ],
    },
    Healthcare: {
        highly_positive: [
            { headline: "FDA Approves Blockbuster Drug", context: "Revolutionary cancer treatment gains FDA approval. Analysts project $6B in peak annual revenue.", momentumImpact: 0.75 },
            { headline: "Phase 3 Trial Exceeds All Endpoints", context: "Drug candidate shows 94% efficacy vs. 61% placebo. Fast-track designation expected next week.", momentumImpact: 0.7 },
        ],
        positive: [
            { headline: "Strong Medicare Reimbursement Rates", context: "CMS announces favorable reimbursement update for key product lines starting next fiscal year.", momentumImpact: 0.2 },
            { headline: "Major Hospital Network Partnership", context: "10-year exclusive supply agreement signed with a 400-hospital network valued at $1.8B.", momentumImpact: 0.18 },
        ],
        neutral: [
            { headline: "Clinical Trial Results Inconclusive", context: "Phase 2 trial met primary endpoint but secondary endpoints showed mixed results. Phase 3 still planned.", momentumImpact: 0 },
            { headline: "Patent Cliff Being Managed", context: "Key drug loses exclusivity this quarter. Generic competition limited due to manufacturing complexity.", momentumImpact: -0.03 },
            { headline: "Regulatory Submission Filed on Schedule", context: "BLA submitted to FDA for new indication. Standard 12-month review timeline expected.", momentumImpact: 0.04 },
        ],
        negative: [
            { headline: "Clinical Trial Failure — Drug Candidate", context: "Phase 3 study misses primary endpoint. Program suspended. $400M in R&D investment written off.", momentumImpact: -0.4 },
            { headline: "FDA Issues Complete Response Letter", context: "FDA declines to approve drug citing manufacturing deficiencies. Resubmission at least 18 months away.", momentumImpact: -0.3 },
        ],
        highly_negative: [
            { headline: "Drug Recall Announced — Safety Concern", context: "Voluntary recall of 14M units following reports of adverse cardiac events. DOJ criminal probe opened.", momentumImpact: -0.6 },
            { headline: "CEO Investigated for Securities Fraud", context: "DOJ alleges CEO sold shares ahead of undisclosed clinical trial failure. Board forming special committee.", momentumImpact: -0.65 },
        ],
    },
    Defense: {
        highly_positive: [
            { headline: "Record Defense Budget Allocation", context: "Congress passes $940B defense bill. Company wins largest single contract in its 50-year history.", momentumImpact: 0.6 },
            { headline: "Geopolitical Conflict Drives Procurement", context: "NATO emergency spending authorization triggers $12B in accelerated orders. Backlog hits all-time high.", momentumImpact: 0.55 },
        ],
        positive: [
            { headline: "Major F-35 Contract Extension", context: "Multiyear fighter jet contract extended through 2032. Program adds $2.4B to existing backlog.", momentumImpact: 0.2 },
            { headline: "Satellite Launch Contract Secured", context: "Space Force selects company for next-generation reconnaissance satellite program worth $1.8B.", momentumImpact: 0.18 },
        ],
        neutral: [
            { headline: "Contract Deliveries On Schedule", context: "Q3 deliverables met on time. No program cost overruns reported. Margin guidance maintained.", momentumImpact: 0 },
            { headline: "Defense Budget Under Congressional Review", context: "Continuing resolution extends current year funding. Final appropriations expected by end of Q1.", momentumImpact: -0.02 },
            { headline: "International Arms Sales Approved", context: "State Department grants export license for allied nation equipment deal. Modest revenue contribution expected.", momentumImpact: 0.05 },
        ],
        negative: [
            { headline: "Contract Cost Overrun Reported", context: "Program cost overruns of $840M reported on next-gen aircraft program. Pentagon reviewing contract terms.", momentumImpact: -0.2 },
            { headline: "Peace Treaty Reduces Defense Spending Outlook", context: "Major regional peace agreement reduces near-term defense budget projection for next fiscal year.", momentumImpact: -0.2 },
        ],
        highly_negative: [
            { headline: "Weapons System Catastrophic Failure", context: "Publicized test failure of flagship missile defense system. Congressional hearing scheduled within 30 days.", momentumImpact: -0.5 },
            { headline: "Bribery Scandal Rocks Leadership", context: "Senior executives charged with bribery of foreign officials in $2.1B procurement scandal. CEO suspended.", momentumImpact: -0.6 },
        ],
    },
    "Real Estate": {
        highly_positive: [
            { headline: "Rate Cuts Trigger Housing Boom", context: "Fed's 75bps rate cut reignites mortgage demand. Monthly applications up 38%. Portfolio values surge.", momentumImpact: 0.55 },
            { headline: "Major Urban Redevelopment Win", context: "Company wins exclusive rights to $3.8B urban redevelopment project in Manhattan's financial district.", momentumImpact: 0.5 },
        ],
        positive: [
            { headline: "Strong Rental Income Growth", context: "Same-store rental income grew 9% YoY. Occupancy rates hit 97.2%, highest level in company history.", momentumImpact: 0.2 },
            { headline: "Commercial Portfolio Refinanced", context: "$1.4B portfolio refinanced at lower rates, saving $42M annually in interest expense.", momentumImpact: 0.15 },
        ],
        neutral: [
            { headline: "Property Values Stable This Quarter", context: "Appraisal data shows flat-to-modest appreciation across the portfolio. No major impairments flagged.", momentumImpact: 0 },
            { headline: "Occupancy Rates Holding Steady", context: "Commercial vacancies stabilizing at 12.4%. Management expects gradual improvement through year-end.", momentumImpact: 0.01 },
            { headline: "New Development Breaking Ground", context: "Mixed-use project in Austin breaks ground. 240K sq ft project expected to reach NOI positive in 28 months.", momentumImpact: 0.03 },
        ],
        negative: [
            { headline: "Rising Interest Rates Pressure Valuations", context: "Cap rate expansion of 50bps this quarter reduces fair value estimates across the commercial portfolio.", momentumImpact: -0.2 },
            { headline: "Major Tenant Defaults on Lease", context: "Anchor retail tenant responsible for 8% of rental income files Chapter 11. Lease termination likely.", momentumImpact: -0.22 },
        ],
        highly_negative: [
            { headline: "Mortgage Default Wave Hits Portfolio", context: "Residential mortgage default rates surge to 4.2%. Portfolio writedowns expected to exceed $1.8B.", momentumImpact: -0.55 },
            { headline: "Major Market Crash in Real Estate", context: "Housing prices fell 18% in the top 10 markets this quarter. Fire sale of assets likely to follow.", momentumImpact: -0.6 },
        ],
    },
    "Broad Market": {
        highly_positive: [
            { headline: "Strong GDP Growth Boosts All Sectors", context: "GDP growth of 4.1% annualized crushes expectations. Consumer spending and business investment both accelerating.", momentumImpact: 0.3 },
        ],
        positive: [
            { headline: "Inflation Data Better Than Expected", context: "CPI came in at 2.1%, below the Fed's target. Rate cut expectations for next quarter jump to 80%.", momentumImpact: 0.15 },
        ],
        neutral: [
            { headline: "Market Consolidates After Recent Rally", context: "Broad markets trading range-bound. Investors await next week's Fed minutes for direction.", momentumImpact: 0 },
            { headline: "Mixed Economic Data This Month", context: "Jobs data strong, but manufacturing PMI slipped to 49.2. Markets weighing conflicting signals.", momentumImpact: 0 },
            { headline: "Index Rebalancing Completed", context: "Quarterly index rebalancing created modest flows. No major sector dislocations as a result.", momentumImpact: 0.01 },
        ],
        negative: [
            { headline: "Recession Fears Return on Weak Jobs Data", context: "Payrolls added only 42K vs. 185K expected. Unemployment ticks up to 4.8%. Recession odds now at 35%.", momentumImpact: -0.15 },
        ],
        highly_negative: [
            { headline: "Flash Crash Triggered by Algorithm Error", context: "Erroneous trading algorithm causes brief but violent sell-off. Circuit breakers triggered on three exchanges.", momentumImpact: -0.4 },
        ],
    },
};

export function generateStockNews(stock: MarketStock, roll: number, activeEvent?: MacroEvent | null, isHeld?: boolean): NewsItem | null {
    const sector = stock.sector;
    const pool = NEWS_BY_SECTOR[sector] || NEWS_BY_SECTOR["Technology"];

    // Boost probability of negative news during macro events affecting this sector
    let adjustedRoll = roll;
    if (activeEvent) {
        const effect = activeEvent.affectedSectors.find(e => e.sector === sector);
        if (effect) {
            // Negative event shifts roll up (more bad news), positive event shifts down
            adjustedRoll = Math.max(0, Math.min(1, roll + effect.momentumShift * 0.3));
        }
    }

    // Only generate news sometimes, more frequently for large cap. Slightly higher chance if held.
    let chanceOfNews = stock.companyTier === "large_cap" ? 0.35 : stock.companyTier === "mid_cap" ? 0.20 : 0.10;
    if (isHeld) chanceOfNews += 0.15;
    
    if (Math.random() > chanceOfNews && !activeEvent) {
        return null;
    }

    if (adjustedRoll < 0.05) {
        const items = pool.highly_positive;
        return items[Math.floor(Math.random() * items.length)];
    } else if (adjustedRoll < 0.25) {
        const items = pool.positive;
        return items[Math.floor(Math.random() * items.length)];
    } else if (adjustedRoll < 0.75) {
        const items = pool.neutral;
        return items[Math.floor(Math.random() * items.length)];
    } else if (adjustedRoll < 0.95) {
        const items = pool.negative;
        return items[Math.floor(Math.random() * items.length)];
    } else {
        const items = pool.highly_negative;
        return items[Math.floor(Math.random() * items.length)];
    }
}

// ── TENDER OFFER / TAKEOVER HELPERS ─────────────────────────────────────────────

/** What fraction of the freely-traded float will tender at a given premium. */
export function getTenderOfferAcceptance(premiumPct: number, tier: "rival" | "small_cap" | "mid_cap" | "large_cap"): number {
    // Institutions and retail hold most of the float for mid/large cap
    // At 15% premium: ~25% acceptance; at 30%: ~55%; at 50%: ~80%
    const base = Math.min(0.85, Math.max(0.05, (premiumPct - 10) / 55));
    // Rival float is small — acceptance is higher at lower premiums
    if (tier === "rival") return Math.min(0.9, base * 1.4);
    if (tier === "small_cap") return Math.min(0.85, base * 1.15);
    return base;
}

/** Combined personal + corporate holding pct for a given symbol. */
export function getPlayerOwnershipPct(
    symbol: string,
    stock: MarketStock,
    personalPortfolio: PortfolioPosition[],
    corporatePortfolio: PortfolioPosition[]
): number {
    const personalShares = personalPortfolio.find(p => p.symbol === symbol)?.shares || 0;
    const corporateShares = corporatePortfolio.find(p => p.symbol === symbol)?.shares || 0;
    const total = personalShares + corporateShares;
    return (total / stock.sharesOutstanding) * 100;
}

/** Returns whether the player has enough stake to initiate a hostile takeover. */
export function checkHostileTakeoverEligibility(
    playerOwnershipPct: number,
    stock: MarketStock
): { eligible: boolean; threshold: number; method: string } {
    const tier = stock.companyTier || "large_cap";
    const threshold = getControlThreshold(tier);
    if (playerOwnershipPct < threshold) {
        return { eligible: false, threshold, method: "" };
    }
    const method = tier === "rival" ? "Founder Negotiation" : (tier === "large_cap" || tier === "mid_cap") ? "Tender Offer or Proxy Fight" : "Tender Offer";
    return { eligible: true, threshold, method };
}

/** Execute a tender offer — returns shares acquired and final cost. */
export function executeTenderOffer(
    stock: MarketStock,
    premiumPct: number,
    availableCash: number,
    currentPlayerOwnership: number // shares already held
): { sharesAcquired: number; totalCost: number; blocked: boolean; blockReason?: string } {
    const tier = stock.companyTier || "large_cap";
    // Regulatory check for mid/large cap
    if ((tier === "mid_cap" || tier === "large_cap") && Math.random() < 0.5) {
        return { sharesAcquired: 0, totalCost: 0, blocked: true, blockReason: "DOJ antitrust review blocked the tender offer. You must divest below 15% ownership." };
    }
    const offeredPrice = stock.currentPrice * (1 + premiumPct / 100);
    const floatShares = stock.sharesOutstanding * ((100 - (stock.founderOwnershipPct || 10)) / 100);
    const acceptanceRate = getTenderOfferAcceptance(premiumPct, tier);
    const sharesOnOffer = Math.floor(floatShares * acceptanceRate - currentPlayerOwnership);
    if (sharesOnOffer <= 0) return { sharesAcquired: 0, totalCost: 0, blocked: false };
    const totalCost = sharesOnOffer * offeredPrice;
    if (totalCost > availableCash) {
        const affordable = Math.floor(availableCash / offeredPrice);
        return { sharesAcquired: affordable, totalCost: affordable * offeredPrice, blocked: false };
    }
    return { sharesAcquired: sharesOnOffer, totalCost, blocked: false };
}

// ── POISON PILL CHECK ─────────────────────────────────────────────────────────
/** Check whether crossing 20% triggers a poison pill. Returns updated stock if triggered. */
export function checkPoisonPill(stock: MarketStock, previousOwnershipPct: number, newOwnershipPct: number): MarketStock {
    if (stock.poisonPillActive) return stock; // Already triggered
    if (previousOwnershipPct < 20 && newOwnershipPct >= 20 && Math.random() < 0.15) {
        return { ...stock, poisonPillActive: true };
    }
    return stock;
}

// ── CFO AUTO-TRADING ─────────────────────────────────────────────────────────────
export function processCfoTrade(
    corporatePortfolio: PortfolioPosition[],
    cash: number,
    stocks: MarketStock[],
    cfoMorale: number,
    cfoName: string = "CFO"
): { newPortfolio: PortfolioPosition[]; newCash: number; tradeLog: string | null } {
    const maxAllocation = cash * 0.20; // CFO can only deploy 20% of cash per month
    const tradeable = stocks.filter(s => !s.isDelisted);

    if (tradeable.length === 0 || maxAllocation < 100) return { newPortfolio: corporatePortfolio, newCash: cash, tradeLog: null };

    let tradeLog: string | null = null;
    let newPortfolio = [...corporatePortfolio];
    let newCash = cash;

    if (cfoMorale >= 80) {
        // Smart: buy RSI < 35 (oversold), sell RSI > 75 (overbought)
        const oversold = tradeable.filter(s => s.rsi < 35).sort((a, b) => a.rsi - b.rsi);
        const overbought = tradeable.filter(s => s.rsi > 75);
        // Sell overbought first
        for (const s of overbought) {
            const pos = newPortfolio.find(p => p.symbol === s.symbol);
            if (pos && pos.shares > 0) {
                const sellShares = Math.floor(pos.shares * 0.5);
                const proceeds = sellShares * s.currentPrice;
                newPortfolio = newPortfolio.map(p => p.symbol === s.symbol ? { ...p, shares: p.shares - sellShares } : p).filter(p => p.shares > 0);
                newCash += proceeds;
                tradeLog = `${cfoName} sold ${sellShares.toLocaleString()} ${s.symbol} @ $${s.currentPrice.toFixed(2)} (RSI overbought)`;
                break;
            }
        }
        // Buy oversold
        if (oversold.length > 0) {
            const target = oversold[0];
            const buyAmount = Math.min(maxAllocation, newCash * 0.15);
            const shares = Math.floor(buyAmount / target.currentPrice);
            if (shares > 0) {
                const cost = shares * target.currentPrice;
                const existing = newPortfolio.find(p => p.symbol === target.symbol);
                if (existing) {
                    const total = existing.shares + shares;
                    newPortfolio = newPortfolio.map(p => p.symbol === target.symbol ? { ...p, shares: total, averageCost: (p.averageCost * existing.shares + cost) / total } : p);
                } else {
                    newPortfolio.push({ symbol: target.symbol, shares, averageCost: target.currentPrice });
                }
                newCash -= cost;
                tradeLog = `${cfoName} bought ${shares.toLocaleString()} ${target.symbol} @ $${target.currentPrice.toFixed(2)} (RSI oversold — smart pick)`;
            }
        }
    } else if (cfoMorale >= 50) {
        // Moderate: random trade with slight positive bias
        const eligible = tradeable.sort(() => Math.random() - 0.5).slice(0, 3);
        const target = eligible[0];
        const buyAmount = Math.min(maxAllocation * 0.5, newCash * 0.08);
        const shares = Math.floor(buyAmount / target.currentPrice);
        if (shares > 0) {
            const cost = shares * target.currentPrice;
            const existing = newPortfolio.find(p => p.symbol === target.symbol);
            if (existing) {
                const total = existing.shares + shares;
                newPortfolio = newPortfolio.map(p => p.symbol === target.symbol ? { ...p, shares: total, averageCost: (p.averageCost * existing.shares + cost) / total } : p);
            } else {
                newPortfolio.push({ symbol: target.symbol, shares, averageCost: target.currentPrice });
            }
            newCash -= cost;
            tradeLog = `${cfoName} made a routine trade: ${shares.toLocaleString()} ${target.symbol} @ $${target.currentPrice.toFixed(2)}`;
        }
    } else if (cfoMorale >= 20) {
        // Bad: panic-buys momentum/overbought stocks
        const trending = tradeable.filter(s => s.rsi > 70).sort((a, b) => b.rsi - a.rsi);
        const target = trending[0] || tradeable[Math.floor(Math.random() * tradeable.length)];
        const buyAmount = Math.min(maxAllocation * 0.8, newCash * 0.15);
        const shares = Math.floor(buyAmount / target.currentPrice);
        if (shares > 0) {
            const cost = shares * target.currentPrice;
            const existing = newPortfolio.find(p => p.symbol === target.symbol);
            if (existing) {
                const total = existing.shares + shares;
                newPortfolio = newPortfolio.map(p => p.symbol === target.symbol ? { ...p, shares: total, averageCost: (p.averageCost * existing.shares + cost) / total } : p);
            } else {
                newPortfolio.push({ symbol: target.symbol, shares, averageCost: target.currentPrice });
            }
            newCash -= cost;
            tradeLog = `${cfoName} panic-bought ${shares.toLocaleString()} ${target.symbol} @ $${target.currentPrice.toFixed(2)} (poor timing — RSI ${target.rsi.toFixed(0)})`;
        }
    } else {
        // Sabotage: sells your best position
        const sorted = newPortfolio
            .map(p => ({ ...p, currentPrice: stocks.find(s => s.symbol === p.symbol)?.currentPrice || p.averageCost }))
            .sort((a, b) => (b.currentPrice - b.averageCost) * b.shares - (a.currentPrice - a.averageCost) * a.shares);
        if (sorted.length > 0) {
            const best = sorted[0];
            const sellShares = Math.floor(best.shares * 0.5);
            const price = best.currentPrice;
            const proceeds = sellShares * price;
            newPortfolio = newPortfolio.map(p => p.symbol === best.symbol ? { ...p, shares: p.shares - sellShares } : p).filter(p => p.shares > 0);
            newCash += proceeds;
            tradeLog = `⚠️ ${cfoName} (very low morale) sold ${sellShares.toLocaleString()} ${best.symbol} @ $${price.toFixed(2)} — your best position dumped`;
        }
    }

    return { newPortfolio, newCash, tradeLog };
}

// ── MACRO EVENTS ──────────────────────────────────────────────────────────────────
export const MACRO_EVENTS: Omit<MacroEvent, 'id' | 'startMonth'>[] = [
    { name: "Fed Rate Hike", description: "Interest rates increased to combat inflation.", durationMonths: 6, affectedSectors: [{ sector: "Technology", momentumShift: -0.15, volatilityMultiplier: 1.5 }, { sector: "Real Estate", momentumShift: -0.2, volatilityMultiplier: 1.5 }, { sector: "Broad Market", momentumShift: -0.05, volatilityMultiplier: 1.2 }] },
    { name: "Fed Rate Cut", description: "Interest rates slashed to stimulate growth.", durationMonths: 6, affectedSectors: [{ sector: "Technology", momentumShift: 0.2, volatilityMultiplier: 1.3 }, { sector: "Real Estate", momentumShift: 0.25, volatilityMultiplier: 1.2 }, { sector: "Broad Market", momentumShift: 0.1, volatilityMultiplier: 1.1 }] },
    { name: "Global Oil Shock", description: "Supply chain disruptions spike oil prices.", durationMonths: 4, affectedSectors: [{ sector: "Energy", momentumShift: 0.3, volatilityMultiplier: 2.0 }, { sector: "Broad Market", momentumShift: -0.08, volatilityMultiplier: 1.4 }] },
    { name: "Healthcare Subsidies", description: "Government announces massive healthcare spending.", durationMonths: 5, affectedSectors: [{ sector: "Healthcare", momentumShift: 0.25, volatilityMultiplier: 1.3 }] },
    { name: "Tech Antitrust Lawsuit", description: "Major tech firms face breakup threats.", durationMonths: 8, affectedSectors: [{ sector: "Technology", momentumShift: -0.25, volatilityMultiplier: 2.0 }] },
    { name: "Global Pandemic Scare", description: "A new virus variant causes market panic.", durationMonths: 3, affectedSectors: [{ sector: "Real Estate", momentumShift: -0.3, volatilityMultiplier: 2.5 }, { sector: "Healthcare", momentumShift: 0.2, volatilityMultiplier: 1.8 }, { sector: "Broad Market", momentumShift: -0.15, volatilityMultiplier: 2.0 }] },
    { name: "Geopolitical Conflict", description: "Tensions escalate overseas.", durationMonths: 6, affectedSectors: [{ sector: "Defense", momentumShift: 0.3, volatilityMultiplier: 1.5 }, { sector: "Energy", momentumShift: 0.15, volatilityMultiplier: 1.8 }, { sector: "Broad Market", momentumShift: -0.1, volatilityMultiplier: 1.5 }] },
    { name: "Tech Earnings Boom", description: "SaaS and AI firms report record profits.", durationMonths: 4, affectedSectors: [{ sector: "Technology", momentumShift: 0.25, volatilityMultiplier: 1.2 }, { sector: "Broad Market", momentumShift: 0.05, volatilityMultiplier: 1.0 }] },
    { name: "Housing Bubble Burst", description: "Mortgage defaults hit record highs.", durationMonths: 9, affectedSectors: [{ sector: "Real Estate", momentumShift: -0.4, volatilityMultiplier: 2.5 }, { sector: "Broad Market", momentumShift: -0.1, volatilityMultiplier: 1.5 }] },
    { name: "Breakthrough Cancer Drug", description: "FDA approves revolutionary treatment.", durationMonths: 3, affectedSectors: [{ sector: "Healthcare", momentumShift: 0.3, volatilityMultiplier: 1.8 }] },
    { name: "Renewable Energy Mandate", description: "New global treaties force green energy adoption.", durationMonths: 6, affectedSectors: [{ sector: "Energy", momentumShift: 0.2, volatilityMultiplier: 1.5 }] },
    { name: "Supply Chain Crisis", description: "Global shipping grinds to a halt.", durationMonths: 5, affectedSectors: [{ sector: "Technology", momentumShift: -0.15, volatilityMultiplier: 1.4 }, { sector: "Broad Market", momentumShift: -0.05, volatilityMultiplier: 1.2 }] },
    { name: "Peace Treaty Signed", description: "Major global conflicts officially end.", durationMonths: 4, affectedSectors: [{ sector: "Defense", momentumShift: -0.2, volatilityMultiplier: 1.5 }, { sector: "Broad Market", momentumShift: 0.15, volatilityMultiplier: 1.1 }] },
];

export function checkMacroEventSpawn(currentEvent: MacroEvent | null | undefined, month: number): MacroEvent | null {
    if (currentEvent && currentEvent.startMonth + currentEvent.durationMonths > month) {
        return currentEvent;
    }
    if (!currentEvent && Math.random() < 0.05) {
        const template = MACRO_EVENTS[Math.floor(Math.random() * MACRO_EVENTS.length)];
        return { ...template, id: `macro_${Date.now()}`, startMonth: month };
    }
    return null;
}

// ── MAIN MARKET SIMULATION LOOP ────────────────────────────────────────────────────────
export function processMarketMonth(
    stocks: MarketStock[], 
    currentSeason: SeasonType, 
    activeEvent?: MacroEvent | null,
    insiderPicks?: string[],
    heldSymbols?: string[]
): MarketStock[] {
    return stocks
        .filter(s => !s.isDelisted) // skip delisted
        .map(stock => {
            let baseVol = stock.volatility || 0.05;
            let eventMomentum = 0;

            if (activeEvent) {
                const effect = activeEvent.affectedSectors.find(e => e.sector === stock.sector);
                if (effect) {
                    baseVol *= effect.volatilityMultiplier;
                    eventMomentum = effect.momentumShift * 0.1;
                }
            }

            const isInsiderTip = insiderPicks?.includes(stock.symbol);
            let randomMove = (Math.random() + Math.random() + Math.random() - 1.5) * baseVol;
            if (isInsiderTip) {
                randomMove = 0.05 + Math.random() * 0.05; // 5-10% steady surge over the duration
            }

            let macroEffect = 0;
            const macroNoise = (Math.random() - 0.5) * 0.02;
            if (currentSeason === "Bull Market") macroEffect = 0.015 + macroNoise;
            if (currentSeason === "Bear Market") macroEffect = -0.02 + macroNoise;
            if (currentSeason === "AI Boom" && stock.sector === "Technology") macroEffect = 0.04 + macroNoise;

            const momentumEffect = Math.max(-0.05, Math.min(0.05, stock.momentum * 0.015));
            let changePct = randomMove + macroEffect + momentumEffect + eventMomentum;
            const sectorNoise = (Math.random() - 0.5) * 0.01;
            changePct += sectorNoise;
            changePct = Math.max(-0.3, Math.min(0.4, changePct));
            if (Math.random() < 0.05) changePct += (Math.random() - 0.5) * 0.2;

            const newPrice = Math.max(0.01, stock.currentPrice * (1 + changePct));
            let newMomentum = stock.momentum * 0.7 + (changePct * 1.5);
            newMomentum = Math.max(-1, Math.min(1, newMomentum));

            const history = [...(stock.priceHistory || [stock.currentPrice])];
            history.push(newPrice);
            if (history.length > 12) history.shift();

            // RSI
            let gains = 0, losses = 0;
            for (let i = 1; i < history.length; i++) {
                const diff = history[i] - history[i - 1];
                if (diff > 0) gains += diff; else losses += Math.abs(diff);
            }
            let rsi = 50;
            if (history.length > 2) {
                const avgGain = gains / (history.length - 1);
                const avgLoss = losses / (history.length - 1);
                if (avgLoss === 0) rsi = 100;
                else if (avgGain === 0) rsi = 0;
                else { const rs = avgGain / avgLoss; rsi = 100 - (100 / (1 + rs)); }
                if (rsi > 98) rsi = 95 + Math.random() * 4;
                if (rsi < 2) rsi = 1 + Math.random() * 4;
            }

            // Rich news generation
            const roll = Math.random();
            let newsItem = generateStockNews(stock, roll, activeEvent, heldSymbols?.includes(stock.symbol));

            if (isInsiderTip) {
                newsItem = {
                    headline: `Insider Insight Proves Correct on ${stock.symbol}`,
                    context: "A tip received from a 'Market Genius' proves startlingly accurate as the company undergoes a multi-month period of major growth.",
                    momentumImpact: 0.2
                };
            }

            const prevHistory = stock.newsHistory || [];
            
            // Only update news string and history if we actually got a news item this month
            let finalRecentNews = stock.recentNews;
            let finalNewsContext = stock.newsContext;
            let finalHistory = prevHistory;
            
            if (newsItem) {
                finalHistory = stock.recentNews ? [stock.recentNews, ...prevHistory].slice(0, 3) : prevHistory.slice(0, 3);
                finalRecentNews = newsItem.headline;
                finalNewsContext = newsItem.context;
            }

            const momentumImpact = newsItem ? newsItem.momentumImpact : 0;
            // Dampen the immediate price impact and momentum shift so news doesn't guarantee massive direct returns
            const finalPriceAdjusted = Math.max(0.01, newPrice * (1 + momentumImpact * 0.04));
            let finalMomentumAdjusted = Math.max(-1, Math.min(1, newMomentum + momentumImpact * 0.5));

            // Institutions shift slightly on prolonged bad news
            let updatedShareholders = stock.shareholders;
            if (updatedShareholders && momentumImpact < -0.2) {
                updatedShareholders = updatedShareholders.map(sh =>
                    sh.type === "institution"
                        ? { ...sh, ownershipPct: Math.max(0.5, sh.ownershipPct - Math.random() * 0.5) }
                        : sh
                );
            }

            return {
                ...stock,
                currentPrice: finalPriceAdjusted,
                momentum: finalMomentumAdjusted,
                priceHistory: history,
                rsi,
                recentNews: finalRecentNews,
                newsContext: finalNewsContext,
                newsHistory: finalHistory,
                shareholders: updatedShareholders,
            };
        });
}

// ── TRADE EXECUTION ────────────────────────────────────────────────────────────────
export function executeTrade(
    portfolio: PortfolioPosition[],
    cash: number,
    symbol: string,
    shares: number, // Positive = buy, negative = sell
    currentPrice: number
): { newCash: number; newPortfolio: PortfolioPosition[] } {
    const cost = shares * currentPrice;
    if (shares > 0 && cash < cost) throw new Error("Insufficient cash");

    const posIndex = portfolio.findIndex(p => p.symbol === symbol);
    let newPortfolio = [...portfolio];

    if (shares > 0) {
        if (posIndex >= 0) {
            const pos = newPortfolio[posIndex];
            const totalValue = pos.shares * pos.averageCost + cost;
            const newShares = pos.shares + shares;
            newPortfolio[posIndex] = { ...pos, shares: newShares, averageCost: totalValue / newShares };
        } else {
            newPortfolio.push({ symbol, shares, averageCost: currentPrice });
        }
    } else {
        const sellAmount = Math.abs(shares);
        if (posIndex === -1 || newPortfolio[posIndex].shares < sellAmount) throw new Error("Insufficient shares to sell");
        const pos = newPortfolio[posIndex];
        const newShares = pos.shares - sellAmount;
        if (newShares === 0) newPortfolio.splice(posIndex, 1);
        else newPortfolio[posIndex] = { ...pos, shares: newShares };
    }

    return { newCash: cash - cost, newPortfolio };
}

// ── PORTFOLIO VALUE HELPERS ────────────────────────────────────────────────────────
export function getPortfolioValue(portfolio: PortfolioPosition[], stocks: MarketStock[]): number {
    return portfolio.reduce((total, pos) => {
        const stock = stocks.find(s => s.symbol === pos.symbol);
        const price = stock ? stock.currentPrice : pos.averageCost;
        return total + pos.shares * price;
    }, 0);
}

/** Update portfolio history with current month's value (capped at 60 data points). */
export function updatePortfolioHistory(
    history: { month: number; value: number }[] | undefined,
    currentMonth: number,
    currentValue: number
): { month: number; value: number }[] {
    const updated = [...(history || []), { month: currentMonth, value: currentValue }];
    if (updated.length > 60) updated.shift();
    return updated;
}

