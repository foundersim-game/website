export type User = {
    id: string; // UUID from Auth
    created_at: string;
};

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

export type Employee = {
    id: string;
    name: string;
    role: "engineer" | "marketer" | "sales";
    level: "Junior" | "Mid" | "Senior" | "Lead";
    salary: number;
    performance: number; // 0-100
    skills: {
        technical: number;
        marketing: number;
        sales: number;
    };
    morale: number;
    joined_at: number; // month
    last_increment_at?: number; // month
    equity?: number; // % ownership
    isCXO?: boolean;
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
}

export type PricingTier = "free" | "starter" | "pro" | "enterprise";
export type MarketingChannel = "organic" | "paid_ads" | "seo" | "pr" | "influencer" | "none";
export type StartupOutcome = "active" | "acquired" | "ipo" | "bankrupt" | "wound_down" | "burnout" | "other";
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

export type Startup = {
    id: string;
    game_session_id: string;
    name: string;
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
