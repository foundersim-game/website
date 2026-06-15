export type User = {
    id: string; // UUID from Auth
    created_at: string;
};

// ── FOUNDER SKILL WEB Node IDs ────────────────────────────────────────────────────────────
export type SkillNodeId =
    // Technical branch
    | "system_design"       // Root: -15% tech debt/mo
    | "distributed_systems" // Requires system_design: +2 product quality/mo, +3 reliability/mo
    | "code_quality"        // Root alt: +2 reliability/mo
    | "security_first"      // Requires code_quality: -35% data breach crisis probability
    // Marketing branch
    | "growth_hacking"      // Root: +15% viral coefficient bonus
    | "viral_loops"         // Requires growth_hacking: double organic new users
    | "brand_strategy"      // Root alt: +3 brand_awareness/mo
    | "pr_mastery"          // Requires brand_strategy: +20% crisis War Room success rates
    // Leadership branch
    | "people_management"   // Root: +4 team_morale/mo baseline
    | "culture_builder"     // Requires people_management: negative traits 25% less effective
    | "executive_presence" // Root alt: +10% pitch success rate
    | "board_mastery"       // Requires executive_presence: activist shareholders 50% less likely
    // Fundraising branch
    | "term_sheet_reader"   // Root: +10% funding negotiation success
    | "valuation_mastery"   // Requires term_sheet_reader: +20% valuation multiple cap
    | "lp_relationships";   // Root alt: investor pipeline fills 25% faster

export type Founder = {
    id: string;
    user_id: string;
    game_session_id: string;
    name: string;
    background: "Engineer" | "MBA" | "Designer" | "Serial Founder" | "Hustler";
    attributes: {
        intelligence: number;
        technical_skill: number;
        leadership: number;
        networking: number;
        marketing_skill: number;
        sales_skill: number;
        risk_appetite: number;
        stress_tolerance: number;
        reputation: number;
    };
    xp: {
        technical: number;   // XP from building features, fixing bugs
        marketing: number;   // XP from campaigns, PR
        leadership: number;  // XP from hiring, firing, managing
        fundraising: number; // XP from pitching investors
        total: number;
    };
    personal_wealth: number; // Cash in personal bank account (secondary sales, savings)
    assets: LuxuryAsset[];
    activeToggles: string[]; // IDs of active LifestyleToggle
    created_at: string;

    // ── SKILL WEB (optional for backward compat) ──────────────────────────────────────
    unlocked_skill_nodes?: SkillNodeId[];

    // ── PUBLIC COMPANY ERA ───────────────────────────────────────────────────
    wealth_profile: FounderPersonalWealth;
};

export interface LuxuryAsset {
    id: string;
    name: string;
    type: "Car" | "Property" | "Jet" | "Chopper" | "Watch";
    purchasePrice: number;
    currentValue: number;
    depreciationRate: number; // Monthly decimal (e.g., -0.01 for 1% loss, 0.005 for 0.5% gain)
    emoji: string;
    impact?: {
        reputation?: number;
        networking?: number;
        leadership?: number;
    };
}

export interface LifestyleToggle {
    id: string;
    name: string;
    description: string;
    monthlyCost: number;
    impact: {
        health?: number;
        burnout?: number;
        sleep?: number;
        reputation?: number;
    };
    emoji: string;
}

// ── TALENT ROSTER: Trait System ─────────────────────────────────────────────
export type EmployeeTrait =
    | "toxic_genius"     // 2× team output power, -4 morale/mo to everyone else
    | "loyalist"         // Never resigns from low morale. Requires formal firing.
    | "mercenary"        // Resigns if salary not raised every 6 months.
    | "cultural_anchor"  // +3 team_morale/mo to everyone on the team.
    | "bug_prone"        // High feature output but +2 technical_debt/mo.
    | "evangelist"       // Marketers: +4 brand_awareness/mo.
    | "burnout_magnet";  // High performer but +2 founder_burnout/mo.

export type Employee = {
    id: string;
    name: string;
    role: "engineer" | "marketer" | "sales" | "legal";
    level: "Junior" | "Mid" | "Senior" | "Lead";
    salary: number;
    performance: number; // 0-100
    skills: {
        technical: number;
        marketing: number;
        sales: number;
        legal?: number;
    };
    morale: number;
    joined_at: number; // month number when hired
    last_increment_at?: number; // month of last salary raise
    equity?: number; // % ownership
    isCXO?: boolean;

    // ── TALENT ROSTER fields (all optional for backward compat) ──────────────
    traits?: EmployeeTrait[];        // Revealed traits (shown in UI)
    hiddenTrait?: EmployeeTrait;     // Assigned at hire, revealed after 2-3 months
    traitRevealedMonth?: number;     // The month the trait was first revealed
    isLegendary?: boolean;           // Legendary hire flag
    storyQuote?: string;             // Flavor text shown on card (Legendary only)
};

export interface PLEntry {
    month: number;
    revenue: number;
    cogs: number;
    grossProfit: number;
    opex: number;
    netIncome: number;
}

export interface CapTableEntry {
    name: string;
    equity: number;
    type: "Founder" | "Investor" | "Employee";
}

export interface BoardMember {
    id: string;
    name: string;
    type: "Founder" | "Co-Founder" | "Investor" | "CXO";
    equityWeight: number; // For voting power
    avatar?: string;
}

export interface SalaryProposal {
    amount: number;
    proposed_month: number;
    status: "pending" | "approved" | "rejected";
    votes?: {
        memberId: string;
        vote: "yes" | "no";
        reason: string;
    }[];
    resolution_title?: string;
}

export type PricingTier = "free" | "starter" | "pro" | "enterprise";
export type MarketingChannel = "organic" | "paid_ads" | "seo" | "pr" | "influencer" | "none";
export type StartupOutcome = "active" | "acquired" | "ipo" | "bankrupt" | "wound_down" | "burnout" | "retired" | "other";
export type FundingStage = "Bootstrapping" | "Angel Investment" | "Seed Round" | "Series A" | "Series B" | "Series C" | "IPO Ready";

export type AcquisitionOffer = {
    id: string;
    acquirer: string;
    type: "strategic" | "financial" | "big_tech";
    offer_amount: number; // Total buyout price
    founder_take: number; // Founder's personal payout based on equity
    expires_in: number;  // Months left before offer expires
    negotiated: boolean;
};

export type SeasonType = "Normal" | "Bull Market" | "Bear Market" | "AI Boom" | "Privacy Scare";

// ── CRISIS ENGINE Types ────────────────────────────────────────────────────────────
export type CrisisSeverity = 1 | 2 | 3 | 4;

export type CrisisEffects = {
    brand_awareness?: number;    // Delta (can be negative)
    team_morale?: number;        // Delta (can be negative)
    user_churn_bonus?: number;   // Additional churn fraction this month
    cash_hit?: number;           // Direct cash deduction (negative)
    valuation_mult?: number;     // e.g. 0.7 = 30% valuation hit
    legal_risk?: boolean;        // Flags for future regulatory escalation
    ceo_reputation?: number;     // Delta to CEO reputation
};

export type CrisisChoice = {
    id: string;
    label: string;
    description: string;
    cost?: number;               // One-time cash cost
    successRate: number;         // 0-1 probability of containment
    successEffects: CrisisEffects;
    failureEffects: CrisisEffects;
};

export type CrisisStage = {
    title: string;
    description: string;
    severity: CrisisSeverity;
    autoEscalatesAfterMonths: number;
    choices: CrisisChoice[];
    autoEscalateEffects: CrisisEffects;
    stageNotice: string;         // Short notice string for processMonth notices[]
};

export type CrisisType =
    | "data_breach"
    | "employee_revolt"
    | "regulatory_probe"
    | "founder_scandal"
    | "press_leak"
    | "short_seller";

export type ActiveCrisis = {
    id: string;
    type: CrisisType;
    currentStage: number;        // 0-indexed into the chain
    startedMonth: number;        // Month the crisis first appeared
    stageStartedMonth: number;   // Month the current stage started
    resolved: boolean;
    resolvedByPlayer: boolean;   // true = player intervened, false = auto-resolved badly
    ceoReputationHit: number;    // Accumulated CEO rep damage
};


// ── LAWSUIT ENGINE Types ────────────────────────────────────────────────────────────
export type LawsuitType = "class_action" | "regulatory_fine" | "ip_infringement" | "wrongful_termination";

export type Lawsuit = {
    id: string;
    type: LawsuitType;
    title: string;
    description: string;
    filed_month: number;
    demand_amount: number;      // How much they are suing for
    settlement_offer?: number;  // Optional lower amount to settle immediately
    legal_fees_per_month: number;
    months_to_trial: number;    // Countdown
    win_probability: number;    // 0-1 chance of winning at trial
    proBonoUses?: number;       // How many times Pro Bono ad was used
};

export type Startup = {
    id: string;
    game_session_id: string;
    name: string;
    symbol?: string; // Ticker symbol for Public Company Era
    industry: "Tech SaaS" | "AI Startup" | "E-commerce Brand" | string;
    pricing_tier: PricingTier;
    gtm_motion: "PLG" | "SLG";
    active_marketing_channel: MarketingChannel;
    metrics: {
        cash: number;
        burn_rate: number;
        runway: number;
        product_quality: number;
        feature_completion: number;
        users: number; // For E-com, represents "Total Customers"
        paid_users?: number;
        growth_rate: number;
        brand_awareness: number;
        employees: number;
        engineers: number;
        marketers: number;
        sales: number;
        team_morale: number;
        technical_debt: number;
        reliability: number;
        innovation: number;
        pmf_score: number;
        culture_score?: number;
        credit_score?: number; // 300 to 850, like real life
        board_happiness?: number;

        // Company Skills (from Co-Founders/Recruits)
        marketing_skill?: number;
        technical_skill?: number;
        leadership?: number;

        // Advanced Financials
        revenue: number;
        annual_billing?: boolean; // True = 12x upfront cash, lower churn, slower growth
        b2b_pipeline?: {
            leads: number;
            active_deals: number;
            closed_won: number;
        };
        investor_pipeline?: {
            leads: number; // VCs/Angels contacted
            meetings: number; // Active interest
            term_sheets: number; // Formal offers
        };
        option_pool: number; // % of company reserved for employees (dilutes founders)
        former_employee_equity?: number; // % owned by departed vested employees
        cac?: number;
        ltv?: number;
        aov?: number;  // E-com: Average Order Value
        unit_sales?: number; // E-com: Units sold this month
        cogs?: number; // Cost of Goods Sold
        opex?: number; // Operating Expenses
        net_profit?: number;
        pricing: number; // User-controlled price (ARPU for SaaS, Product Price for E-com)
        founder_salary: number; // Cash drawn from company per month
        founder_burnout: number;  // 0-100; at 100 = game over
        founder_health: number;   // 0-100; affects physical health
        sleep_quality: number;    // 0-100; affects focus energy & burnout recovery
        
        current_season: SeasonType;
        season_locked_until?: number;
        has_legal_dept: boolean;
        
        active_macro_event?: MacroEvent | null;
        chadly_ipo_readiness?: number; // 0-100 score for Rival IPO
    };
    employees: Employee[];
    cxoTeam?: Record<string, boolean>;
    phase: "Idea Phase" | "Angel Investment" | "Early Startup" | "Traction" | "Growth" | "Scaling";

    funding_stage: FundingStage;
    valuation: number;
    created_at: string;
    history?: PLEntry[];
    capTable?: CapTableEntry[];
    pending_salary_proposal?: SalaryProposal;

    // ── ENDGAME ──────────────────────────────────────────────────────────────
    outcome?: StartupOutcome;
    acquisition_offers?: AcquisitionOffer[];
    ipo_stage?: 0 | 1 | 2 | 3 | 4;        // 0 = not started, 4 = completed
    ipo_readiness?: number;                 // 0–100 checklist score
    legacy_score?: number;                  // Computed at game end
    ipo_attempt_month?: number;             // Month IPO process began
    peak_valuation?: number;                // All-time high for legacy
    peak_users?: number;                    // All-time high for legacy
    scenario?: string;                      // "classic", "bootstrap", "bear", etc.
    unlocked_perks?: string[];             // Legacy perks active for this run
    adUsage?: {
        lastConsults: string[]; // ISO timestamps
        lastGrants: string[];   // ISO timestamps
    };
    hasRateRewardClaimed?: boolean;

    // ── IN-APP PURCHASES ─────────────────────────────────────────────────────────
    iap_ad_free?: boolean;
    iap_caffeine?: boolean;
    iap_titan?: boolean;
    iap_god_mode?: boolean;
    iap_sv_darling?: boolean;

    // ── CRISIS ENGINE ────────────────────────────────────────────────────────────
    active_crisis?: ActiveCrisis;  // Currently active cascading crisis
    ceo_reputation?: number;       // 0-100, tracked separately from founder attributes

    // ── PUBLIC COMPANY ERA ───────────────────────────────────────────────────
    public_company?: PublicCompanyState;
    subsidiaries?: string[];       // Symbols/IDs of acquired companies (available pre and post IPO)

    // ── STOCK MARKET MODULE ──────────────────────────────────────────────────
    cfo_auto_trade_enabled?: boolean;   // Toggle: let CFO manage corporate portfolio
    treasury_portfolio?: PortfolioPosition[]; // Pre-IPO corporate portfolio
    corporatePortfolioHistory?: { month: number; value: number }[]; // Up to 60 data points

    // ── LEGAL & LAWSUITS ─────────────────────────────────────────────────────
    active_lawsuits?: Lawsuit[];
};

export type GameSession = {
    id: string;
    user_id: string;
    current_month: number;
    status: StartupOutcome;
    created_at: string;
    updated_at: string;
};

export type EventLog = {
    id: string;
    game_session_id: string;
    month: number;
    event_title: string;
    event_description: string;
    choices_made?: string;
    impact_summary?: string;
    created_at: string;
};

// ─── PUBLIC COMPANY ERA TYPES ────────────────────────────────────────────────

export type AnalystRating = {
    analystName: string;
    firm: string;
    rating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
    priceTarget: number;
    lastUpdated: number; // month
};

export type ActivistShareholder = {
    name: string;
    equityStake: number; // % they've acquired
    demand: "ceo_change" | "board_seat" | "dividend" | "buyback" | "split";
    ultimatumMonth: number; // Month they force the issue
};

export type MacroEvent = {
    id: string;
    name: string;
    description: string;
    startMonth: number;
    durationMonths: number;
    affectedSectors: {
        sector: "Technology" | "Energy" | "Healthcare" | "Defense" | "Real Estate" | "Broad Market";
        momentumShift: number;
        volatilityMultiplier: number;
    }[];
};

export type StockShareholder = {
    name: string;                // "Vantage Index Fund", "Chad Williams (Founder)", etc.
    type: "institution" | "founder" | "vc" | "public_float" | "player" | "parent_company";
    ownershipPct: number;        // 0-100
};

export type MarketStock = {
    symbol: string;
    companyName: string;
    sector: "Technology" | "Energy" | "Healthcare" | "Defense" | "Real Estate" | "Broad Market";
    currentPrice: number;
    sharesOutstanding: number;
    publicFloat?: number; // Tradable shares in the open market
    peRatio: number;
    momentum: number; // -1 to +1
    volatility: number;
    rsi: number;
    priceHistory: number[]; // Last 12 months
    recentNews?: string;     // Short headline for this month
    newsContext?: string;    // 1-sentence context/detail for this month's news
    newsHistory?: string[];  // Last 3 months of headlines (newest first)
    shareholders?: StockShareholder[]; // Top 5 holders
    // Hostile takeover / ownership tracking
    isRival?: boolean;           // True if this is a competitor company
    isSubsidiary?: boolean;      // True if player acquired this company
    rivalId?: string;            // Links to Competitor.id
    founderOwnershipPct?: number;// % owned by insiders/founders
    companyTier?: "rival" | "small_cap" | "mid_cap" | "large_cap";
    poisonPillActive?: boolean;  // True if board triggered a poison pill defense
    isDelisted?: boolean;        // True if bankrupt / acquired
};


export type PortfolioPosition = {
    symbol: string;
    shares: number;
    averageCost: number;
};

export type TenB51Plan = {
    id: string;
    sharesToSellTotal: number;
    sharesSoldSoFar: number;
    monthsRemaining: number;
    monthlySellAmount: number;
    targetPriceMinimum: number; // Only sells if price is >= this
    planName?: string;
    isAggressive?: boolean;
};

export type DebtInstrument = {
    id: string;
    principal: number;
    interestRate: number; // Annual %
    maturityMonths?: number;
    monthsRemaining: number;
    monthlyInterestPayment?: number;
    label?: string;
};

export type PublicCompanyState = {
    shares_outstanding: number;    // Total shares (e.g., 100M)
    float: number;                 // % of shares publicly traded
    share_price: number;           // Current price per share
    ipo_price: number;             // Locked at IPO, for reference
    eps_last_quarter: number;      // Actual EPS (Earnings Per Share)
    eps_guidance: number;          // Guidance player gave for NEXT quarter
    consensus_eps: number;         // What Wall Street expects (their model)
    buyback_authorized: number;    // $ authorized for buyback
    short_interest: number;        // 0-100: % of float sold short
    analyst_ratings: AnalystRating[];
    quarterly_beats: number;       // Consecutive beats (positive streak)
    quarterly_misses: number;      // Consecutive misses (negative streak)
    activist_threat?: ActivistShareholder;
    lobbying_score: number;        // 0-100. High score = tax breaks, FTC immunity
    corporate_portfolio: PortfolioPosition[]; // MarketStock shares owned by company
    corporate_debt: DebtInstrument[];
    subsidiaries: string[];        // Symbols of companies where >50% is owned
    portfolioHistory?: { month: number; value: number }[]; // Up to 60 data points
};

export type ExecutiveOption = {
    id: string;
    grantName: string;
    totalOptions: number;
    strikePrice: number;
    vestedOptions: number;
    monthsRemaining: number;
    monthlyVestAmount: number;
};

export type FounderPersonalWealth = {
    portfolio: PortfolioPosition[];
    margin_loan_balance: number;
    philanthropy_score: number;
    active_10b51_plans: TenB51Plan[];
    vesting_options?: ExecutiveOption[];
    portfolioHistory?: { month: number; value: number }[]; // Up to 60 data points
};

// ── HOSTILE TAKEOVER / TENDER OFFER Types ───────────────────────────────────
export type TenderOfferTarget = {
    symbol: string;
    premiumPct: number;         // e.g. 30 = 30% above market price
    offeredPricePerShare: number;
    totalCost: number;
    estimatedAcceptance: number; // 0-1 fraction of float expected to tender
    sharesAcquired?: number;     // Set after execution
    status: "pending" | "executed" | "failed" | "blocked_antitrust";
    initiatedMonth: number;
};

