
import { processMonth } from '../src/lib/engine/simulation';
import { Founder, Startup } from '../src/lib/types/database.types';

const mockFounder: Founder = {
    id: 'f1',
    user_id: 'u1',
    game_session_id: 's1',
    name: 'Test Founder',
    background: 'Engineer',
    attributes: {
        intelligence: 70,
        technical_skill: 80,
        leadership: 50,
        networking: 40,
        marketing_skill: 30,
        sales_skill: 20,
        risk_appetite: 60,
        stress_tolerance: 50,
        reputation: 10
    },
    xp: { technical: 0, marketing: 0, leadership: 0, fundraising: 0, total: 0 },
    personal_wealth: 10000,
    assets: [],
    activeToggles: [],
    created_at: new Date().toISOString()
};

const mockStartup: Startup = {
    id: 'st1',
    game_session_id: 's1',
    name: 'HardMode Startup',
    industry: 'Tech SaaS',
    pricing_tier: 'starter',
    gtm_motion: 'PLG',
    active_marketing_channel: 'organic',
    metrics: {
        cash: 50000,
        burn_rate: 0,
        runway: 99,
        product_quality: 10,
        feature_completion: 0,
        users: 0,
        growth_rate: 0,
        brand_awareness: 5,
        employees: 0,
        engineers: 0,
        marketers: 0,
        sales: 0,
        team_morale: 80,
        technical_debt: 0,
        reliability: 80,
        innovation: 10,
        pmf_score: 10,
        revenue: 0,
        pricing: 20,
        founder_burnout: 0,
        founder_health: 100,
        sleep_quality: 100,
        option_pool: 0,
        founder_salary: 0,
        current_season: "Normal",
        has_legal_dept: false,
    },
    employees: [],
    phase: 'Idea Phase',
    funding_stage: 'Bootstrapping',
    valuation: 500000,
    created_at: new Date().toISOString(),
    history: []
};

console.log('--- Starting 24-month Simulation (Building + Marketing) ---');
let currentStartup = JSON.parse(JSON.stringify(mockStartup));
let currentFounder = JSON.parse(JSON.stringify(mockFounder));

for (let i = 1; i <= 24; i++) {
    // Alternate building and marketing to get some users/revenue
    const action = i % 3 === 0 ? 'paid_acquisition' : 'build_mvp_features';
    currentStartup = processMonth(currentFounder, currentStartup, action);
    // Extract living cost for logging (simulating the rebalanced calculation)
    const monthsPassed = currentStartup.history?.length || 0;
    const livingCost = 3500 + (monthsPassed * 75) + ((currentStartup.history?.[monthsPassed-1]?.revenue || 0) * 0.02);
    console.log(`Month ${i}: Action: ${action}, Cash: ${currentStartup.metrics.cash.toFixed(0)}, Revenue: ${currentStartup.metrics.revenue.toFixed(0)}, LivingCost: ${livingCost.toFixed(0)}`);
}

console.log('\n--- Final Stats ---');
console.log(JSON.stringify(currentStartup.metrics, null, 2));

if (currentStartup.metrics.cash < 0) {
    console.log('\nResult: BANKRUPT (Difficulty Working)');
} else {
    console.log('\nResult: SURVIVED (Balance check needed)');
}
