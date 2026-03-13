
import { processMonth, StartupAction } from '../src/lib/engine/simulation';
import { Founder, Startup, PLEntry } from '../src/lib/types/database.types';
import * as fs from 'fs';

// CONFIGURATION
const MAX_MONTHS = 60; 
const TARGET_ARR = 60_000_000;
const TARGET_USERS = 200_000;

const BASE_FOUNDER: Founder = {
    id: 'f-legendary',
    user_id: 'u-legendary',
    game_session_id: 's-legendary',
    name: 'Legendary Founder',
    background: 'Engineer',
    attributes: {
        intelligence: 95,
        technical_skill: 95,
        leadership: 85,
        networking: 80,
        marketing_skill: 75,
        sales_skill: 70,
        risk_appetite: 60,
        stress_tolerance: 85,
        reputation: 60
    },
    xp: { technical: 500, marketing: 200, leadership: 300, fundraising: 400, total: 1400 },
    personal_wealth: 250000,
    assets: [],
    activeToggles: [],
    created_at: new Date().toISOString()
};

const STARTUP: Startup = {
    id: 'startup-ipo',
    game_session_id: 's-legendary',
    name: 'BlitzScale AI',
    industry: 'AI Startup',
    pricing_tier: 'pro',
    gtm_motion: 'PLG',
    active_marketing_channel: 'organic',
    metrics: {
        cash: 45000000,
        burn_rate: 0,
        runway: 99,
        product_quality: 95,
        feature_completion: 0,
        users: 100, // Starting users
        growth_rate: 0.15,
        brand_awareness: 80,
        employees: 0,
        engineers: 20,
        marketers: 10,
        sales: 5,
        team_morale: 90,
        technical_debt: 2,
        reliability: 95,
        innovation: 60,
        pmf_score: 85,
        revenue: 0,
        pricing: 49,
        founder_burnout: 5,
        founder_health: 95,
        sleep_quality: 90,
        option_pool: 15,
        investor_pipeline: { leads: 0, meetings: 0, term_sheets: 0 },
        b2b_pipeline: { leads: 100, active_deals: 20, closed_won: 50 },
        founder_salary: 0,
        net_profit: 500000
    },
    cxoTeam: { "CTO": true, "CMO": true, "CFO": true, "COO": true },
    employees: [],
    phase: 'Scaling',
    funding_stage: 'Series C',
    valuation: 500000000,
    created_at: new Date().toISOString(),
    history: []
} as any;

// Populate employees
for (let i = 0; i < 40; i++) {
    STARTUP.employees.push({
        id: `emp-${i}`,
        name: `Employee ${i}`,
        role: i % 3 === 0 ? 'engineer' : (i % 3 === 1 ? 'marketer' : 'sales'),
        level: 'Senior',
        salary: 120000,
        performance: 90,
        morale: 95,
        skills: { technical: 85, marketing: 85, sales: 85 },
        joined_at: 1
    });
}

// Populate Cap Table
STARTUP.capTable = [
    { name: "Founder", equity: 45, type: "Founder" },
    { name: "VC Fund A", equity: 20, type: "Investor" },
    { name: "VC Fund B", equity: 15, type: "Investor" },
    { name: "Angel Group", equity: 5, type: "Investor" },
    { name: "Employee Pool", equity: 15, type: "Employee" }
];

function simulate() {
    let currentStartup = JSON.parse(JSON.stringify(STARTUP));
    const history: PLEntry[] = [];

    console.log("Generating 5 years of hypergrowth history...");

    for (let m = 1; m <= 60; m++) {
        // Growth simulation
        const users = Math.floor(100 * Math.pow(1.16, m));
        const rev = users * 49;
        const opex = 200000 + (users * 2);
        const net = rev - opex;

        history.push({
            month: m,
            revenue: rev,
            cogs: rev * 0.2,
            grossProfit: rev * 0.8,
            opex: opex,
            netIncome: net
        });

        if (m === 60) {
            currentStartup.metrics.users = users;
            currentStartup.metrics.revenue = rev;
            currentStartup.metrics.cash = 50000000;
            currentStartup.metrics.net_profit = net;
            currentStartup.funding_stage = "IPO Ready";
            currentStartup.valuation = rev * 12 * 10; // 10x ARR
        }
    }

    currentStartup.history = history;
    currentStartup.peak_valuation = currentStartup.valuation;
    currentStartup.peak_users = currentStartup.metrics.users;

    const founderData = {
        name: BASE_FOUNDER.name,
        age: "32",
        background: "Engineer",
        industry: "AI Startup",
        gtmMotion: "PLG",
        scenario: "classic",
        startupName: currentStartup.name,
        logo: "🚀",
        brandColor: "#6366f1",
    };

    const output = {
        startup: currentStartup,
        founder: BASE_FOUNDER,
        month: 60,
        eventsTimeline: [],
        competitors: [],
        unlockedAchievements: [],
        ongoingPrograms: []
    };

    fs.writeFileSync('ipo_complete_state.json', JSON.stringify(output));
    
    console.log(`\n✅ Generated COMPLETE IPO STATE!`);
    console.log(`ARR: $${(currentStartup.metrics.revenue * 12 / 1_000_000).toFixed(1)}M`);
    console.log(`Users: ${currentStartup.metrics.users.toLocaleString()}`);
    console.log(`History points: ${history.length}`);
    console.log(`\n------------------------------------------------------------`);
    console.log(`COPY THE ENTIRE LINE BELOW AND PASTE IT INTO YOUR CONSOLE:`);
    console.log(`------------------------------------------------------------\n`);
    
    const consoleCmd = `
(function() {
    const data = ${JSON.stringify(output)};
    localStorage.setItem('founder_sim_state', JSON.stringify(data));
    alert('SUCCESS: IPO State Loaded! The page will now reload.');
    location.reload();
})();
    `.replace(/\n/g, '').trim();

    console.log(consoleCmd);
}

simulate();
