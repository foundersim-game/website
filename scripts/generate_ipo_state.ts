
import { Founder, Startup, Employee, EmployeeTrait } from '../src/lib/types/database.types';

const founder: Founder = {
    id: 'ipo-founder',
    user_id: 'ipo-user',
    game_session_id: 'ipo-session',
    name: 'IPO Legend',
    background: 'Engineer',
    attributes: {
        intelligence: 90,
        technical_skill: 95,
        leadership: 85,
        networking: 80,
        marketing_skill: 75,
        sales_skill: 70,
        risk_appetite: 65,
        stress_tolerance: 90,
        reputation: 85
    },
    xp: { technical: 500, marketing: 300, leadership: 400, fundraising: 450, total: 1650 },
    personal_wealth: 500000,
    assets: [],
    activeToggles: [],
    created_at: new Date().toISOString(),
    wealth_profile: {
        portfolio: [],
        margin_loan_balance: 0,
        philanthropy_score: 0,
        active_10b51_plans: []
    }
};

const names = [
    "Alex", "Jordan", "Taylor", "Casey", "Morgan", "Skyler", "Quinn", "Riley", "Avery", "Parker",
    "Sam", "Charlie", "Dakota", "Emerson", "Finley", "Hayden", "Jamie", "Kendall", "Logan", "Peyton",
    "River", "Sage", "Sawyer", "Sutton", "Tatum", "Zion", "Micah", "Arlo", "Ezra", "Felix",
    "Ivy", "Luna", "Milo", "Nova", "Onyx", "Piper", "Remy", "Willow", "Xander", "Yara"
];

const lastNames = [
    "Chen", "Smith", "Garcia", "Kim", "Miller", "Davis", "Rodriguez", "Wilson", "Lee", "Brown",
    "Taylor", "Anderson", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez"
];

function generateEmployee(id: number, role: "engineer" | "marketer" | "sales", level: "Junior" | "Mid" | "Senior" | "Lead"): Employee {
    const name = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const skills = {
        technical: role === "engineer" ? 70 + Math.random() * 30 : 10 + Math.random() * 40,
        marketing: role === "marketer" ? 70 + Math.random() * 30 : 10 + Math.random() * 40,
        sales: role === "sales" ? 70 + Math.random() * 30 : 10 + Math.random() * 40,
    };
    
    const baseSalaries = { engineer: 120000, marketer: 90000, sales: 80000 };
    const levelMult = { Junior: 0.7, Mid: 1, Senior: 1.5, Lead: 2.2 };
    
    return {
        id: `emp-${id}`,
        name,
        role,
        level,
        salary: baseSalaries[role] * levelMult[level],
        performance: 75 + Math.random() * 25,
        skills,
        morale: 80 + Math.random() * 20,
        joined_at: Math.floor(Math.random() * 40),
        equity: level === "Lead" ? 0.5 : (level === "Senior" ? 0.1 : 0.01)
    };
}

const employees: Employee[] = [];

// ── THE CXO TEAM ─────────────────────────────────────────────────────────────
const cfo: Employee = {
    ...generateEmployee(1, "sales", "Lead"),
    name: "Finley Cash",
    salary: 280000,
    performance: 98,
    skills: { technical: 30, marketing: 60, sales: 95 },
    isCXO: true,
    traits: ["loyalist"]
};

const cto: Employee = {
    ...generateEmployee(2, "engineer", "Lead"),
    name: "Skyler Code",
    salary: 300000,
    performance: 95,
    skills: { technical: 98, marketing: 20, sales: 40 },
    isCXO: true,
    traits: ["cultural_anchor"]
};

const cmo: Employee = {
    ...generateEmployee(3, "marketer", "Lead"),
    name: "Morgan Growth",
    salary: 260000,
    performance: 92,
    skills: { technical: 40, marketing: 96, sales: 70 },
    isCXO: true,
    traits: ["evangelist"]
};

employees.push(cfo, cto, cmo);

// ── THE LEGENDARY FOUNDING TEAM ──────────────────────────────────────────────
const foundingEngineer: Employee = {
    ...generateEmployee(4, "engineer", "Senior"),
    name: "Avery First",
    performance: 100,
    skills: { technical: 99, marketing: 10, sales: 10 },
    isLegendary: true,
    traits: ["burnout_magnet"],
    storyQuote: "I remember when this was all just a README file."
};

const toxicGenius: Employee = {
    ...generateEmployee(5, "engineer", "Senior"),
    name: "Zion Brillant",
    performance: 110,
    skills: { technical: 105, marketing: 5, sales: 5 },
    traits: ["toxic_genius"],
};

employees.push(foundingEngineer, toxicGenius);

// ── THE CORE DEPARTMENTS (REST OF THE 120) ──────────────────────────────────
for (let i = 6; i <= 120; i++) {
    let role: "engineer" | "marketer" | "sales" = "engineer";
    if (i > 60) role = "marketer";
    if (i > 90) role = "sales";
    
    let level: "Junior" | "Mid" | "Senior" | "Lead" = "Mid";
    if (i % 5 === 0) level = "Senior";
    if (i % 10 === 0) level = "Junior";
    
    employees.push(generateEmployee(i, role, level));
}

const startup: Startup = {
    id: 'ipo-startup',
    game_session_id: 'ipo-session',
    name: 'IPO Rocket',
    industry: 'AI Platform',
    pricing_tier: 'pro',
    gtm_motion: 'SLG',
    active_marketing_channel: 'pr',
    metrics: {
        cash: 25000000,
        burn_rate: 850000, // Adjusted for full team
        runway: 30,
        product_quality: 88,
        feature_completion: 92,
        users: 1500,
        growth_rate: 0.22,
        brand_awareness: 82,
        employees: 120,
        engineers: 60,
        marketers: 30,
        sales: 30,
        team_morale: 88,
        technical_debt: 12,
        reliability: 96,
        innovation: 85,
        pmf_score: 87,
        revenue: 10416666.666666667, 
        pricing: 50000,
        founder_burnout: 12,
        founder_health: 88,
        sleep_quality: 82,
        option_pool: 12,
        investor_pipeline: { leads: 0, meetings: 0, term_sheets: 0 },
        b2b_pipeline: { leads: 150, active_deals: 30, closed_won: 80 },
        founder_salary: 18000,
        current_season: "Bull Market",
        has_legal_dept: true,
    },
    cxoTeam: { "CFO": true, "CTO": true, "CMO": true, "COO": false, "CPO": false },
    employees: employees,
    phase: 'Scaling',
    funding_stage: 'Series C',
    valuation: 480000000,
    created_at: new Date().toISOString(),
    history: Array.from({ length: 48 }, (_, i) => ({
        month: i + 1,
        revenue: 100000 * Math.pow(1.1, i),
        cogs: 30000 * Math.pow(1.1, i),
        grossProfit: 70000 * Math.pow(1.1, i),
        opex: 50000 * Math.pow(1.05, i),
        netIncome: 20000 * Math.pow(1.1, i)
    })),
    capTable: [
        { name: 'Founder', equity: 38, type: 'Founder' },
        { name: 'VC Fund A', equity: 25, type: 'Investor' },
        { name: 'VC Fund B', equity: 20, type: 'Investor' },
        { name: 'Employees', equity: 17, type: 'Employee' }
    ],
    ipo_stage: 1,
    ipo_readiness: 98
};

const state = {
    startup,
    founder,
    month: 49,
    eventsTimeline: [
        { month: 48, text: "Series C closed! The board is aligned on an IPO within 12 months." },
        { month: 40, text: "Hired Finley Cash as CFO to clean up the books." },
        { month: 36, text: "Crossed $1M monthly revenue milestone!" }
    ],
    competitors: [],
    unlockedAchievements: ["series_c", "revenue_milestone"],
    ongoingPrograms: [
        { id: "annual_billing", startedMonth: 24, streakMonths: 24, lastAppliedMonth: 48 },
        { id: "seo_content_machine", startedMonth: 36, streakMonths: 12, lastAppliedMonth: 48 }
    ],
    seenEventIds: [],
    founderMeta: {},
    focusHoursUsed: 0,
    actionUsageLog: { thisMonth: {}, lastUsedMonth: {} },
    storyState: { currentChapter: 4, completedChapters: [1, 2, 3], seenTriggers: [] }
};

console.log(JSON.stringify(state));
