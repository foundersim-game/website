
import { processMonth, StartupAction } from '../src/lib/engine/simulation';
import { Founder, Startup } from '../src/lib/types/database.types';
import { calcFocusHours, IMMEDIATE_ACTIONS, ONGOING_PROGRAMS } from '../src/lib/engine/actions';
import { calcDynamicImpact, applyEffectsToState, ActionUsageLog } from '../src/lib/engine/dynamicImpact';
import { processOngoingPrograms, startProgram, ActiveProgram } from '../src/lib/engine/ongoingPrograms';

// REALISTIC CONFIGURATION
const MAX_MONTHS = 144; // 12 years
const IPO_ARR_GOAL = 50_000_000;
const IPO_USERS_GOAL = 150_000;
const ACQUISITION_GOAL = 250_000_000;

const BASE_FOUNDER: Founder = {
    id: 'real-founder',
    user_id: 'real-user',
    game_session_id: 'real-session',
    name: 'Realistic Founder',
    background: 'Engineer',
    attributes: {
        intelligence: 80,
        technical_skill: 85,
        leadership: 75,
        networking: 65,
        marketing_skill: 60,
        sales_skill: 55,
        risk_appetite: 70,
        stress_tolerance: 80,
        reputation: 50
    },
    xp: { technical: 0, marketing: 0, leadership: 0, fundraising: 0, total: 0 },
    personal_wealth: 25000,
    assets: [],
    activeToggles: [],
    private_cash: 25000,
    created_at: new Date().toISOString()
};

const BASE_STARTUP: Startup = {
    id: 'real-startup',
    game_session_id: 'real-session',
    name: 'RealScale AI',
    industry: 'AI Startup',
    pricing_tier: 'pro',
    gtm_motion: 'PLG',
    active_marketing_channel: 'organic',
    metrics: {
        cash: 300000,
        burn_rate: 15000,
        runway: 20,
        product_quality: 50,
        feature_completion: 15,
        users: 5000,
        growth_rate: 0.15,
        brand_awareness: 25,
        employees: 0,
        engineers: 0,
        marketers: 0,
        sales: 0,
        team_morale: 95,
        technical_debt: 5,
        reliability: 90,
        innovation: 30,
        pmf_score: 45,
        revenue: 15000,
        pricing: 49,
        founder_burnout: 0,
        founder_health: 100,
        sleep_quality: 100,
        option_pool: 0,
        investor_pipeline: { leads: 0, meetings: 0, term_sheets: 0 },
        b2b_pipeline: { leads: 0, active_deals: 0, closed_won: 0 },
        founder_salary: 0,
        fraud_risk: 0,
        current_season: "Normal",
        has_legal_dept: false,
    },
    cxoTeam: {},
    employees: [],
    phase: 'MVP Phase',
    funding_stage: 'Seed Round',
    valuation: 5000000,
    created_at: new Date().toISOString(),
    history: []
} as any as Startup;

function simulate() {
    let startup = JSON.parse(JSON.stringify(BASE_STARTUP));
    let founder = JSON.parse(JSON.stringify(BASE_FOUNDER));
    let ongoingPrograms: ActiveProgram[] = [];
    let actionUsageLog: ActionUsageLog = { thisMonth: {}, lastUsedMonth: {} };
    let fundingInMonths = 0;
    
    for (let month = 1; month <= MAX_MONTHS; month++) {
        actionUsageLog.thisMonth = {};
        const m = startup.metrics;
        
        let maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);
        let hoursUsed = 0;
        let monthAction: StartupAction = 'none';

        // --- STEP 1: SPEND FOCUS HOURS (IMMEDIATE ACTIONS) ---
        while (hoursUsed < maxHours) {
            let bestActionId = 'build_mvp_features';
            
            if (m.founder_burnout > 30) bestActionId = 'meditation';
            else if (m.product_quality < 85) bestActionId = 'build_mvp_features';
            else if (m.pmf_score < 75) bestActionId = 'build_mvp_features';
            else if (m.technical_debt > 30) bestActionId = 'refactor_codebase';
            else bestActionId = 'paid_acquisition';

            const action = IMMEDIATE_ACTIONS.find(a => a.id === bestActionId)!;
            if (hoursUsed + action.energyCost > maxHours) break;

            const impact = calcDynamicImpact(action, actionUsageLog, { month, startup, founder, m });
            const result = applyEffectsToState(impact.scaledEffects, startup, founder);
            startup = result.startup;
            founder = result.founder;
            hoursUsed += action.energyCost;
            actionUsageLog.thisMonth[action.id] = (actionUsageLog.thisMonth[action.id] || 0) + 1;
        }

        // --- STEP 2: MONTHLY STRATEGY ---
        if (m.runway < 10 && startup.funding_stage !== 'IPO Ready') {
            monthAction = 'pitch_investors';
        } else if (m.product_quality < 60) {
            monthAction = 'build_mvp_features';
        } else {
            monthAction = 'paid_acquisition';
        }

        // --- STEP 3: ENGINE PROCESS (processMonth) ---
        const { newStartup } = processMonth(founder, startup, monthAction);
        startup = newStartup;

        // Monitoring fundraising lead flow (from engine or script action)
        if (m.investor_pipeline.leads > 40 && fundingInMonths === 0) {
            fundingInMonths = 6;
        }

        // Funding Closing Logic
        if (fundingInMonths > 0) {
            fundingInMonths--;
            if (fundingInMonths === 1) {
                const stages = ['Seed Round', 'Series A', 'Series B', 'Series C', 'IPO Ready'];
                const currentIdx = Math.max(0, stages.indexOf(startup.funding_stage));
                startup.funding_stage = stages[currentIdx + 1] || 'IPO Ready';
                
                const arr = m.revenue * 12;
                const baseValuation = Math.max(10000000 * (currentIdx + 1), arr * (15 + Math.random() * 10));
                const raisedAmount = baseValuation * 0.25; 
                m.cash += raisedAmount;
                startup.valuation = baseValuation + raisedAmount;
                m.investor_pipeline.leads = 0;
            }
        }

        // Scaling Team
        if (m.cash > 2000000 && startup.employees.length < 150) {
            startup.employees.push({
                id: `emp-${startup.employees.length}`,
                role: 'builder',
                salary: 120000,
                performance: 95,
                skills: { technical: 90, marketing: 90, sales: 90 }
            });
            m.burn_rate += 12000;
        }

        // SUCCESS CHECK
        const arr = m.revenue * 12;
        const isIPOEligible = arr >= IPO_ARR_GOAL && m.users >= IPO_USERS_GOAL;
        const isAcquired = startup.valuation >= ACQUISITION_GOAL;

        if (isIPOEligible || isAcquired) {
            return { success: true, month, type: isIPOEligible ? 'IPO' : 'ACQUISITION', arr, users: m.users, valuation: startup.valuation };
        }

        if (m.cash < -250000) return { success: false, month, type: 'BANKRUPT', arr, users: m.users, valuation: startup.valuation };
    }
    return { success: false, month: MAX_MONTHS, type: 'STAGNATION', arr: startup.metrics.revenue * 12, users: startup.metrics.users, valuation: startup.valuation };
}

function runSimulations(count: number) {
    console.log(`\n🚀 Realistic Startup Journey Script (${count} runs)`);
    console.log(`Goals: $${(IPO_ARR_GOAL/1000000).toFixed(0)}M ARR or $${(ACQUISITION_GOAL/1000000).toFixed(0)}M Exit\n`);

    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(simulate());
    }

    const successful = results.filter(r => r.success);
    const avgMonths = successful.reduce((acc, r) => acc + r.month, 0) / (successful.length || 1);
    
    console.log("\n" + "=".repeat(50));
    console.log(`SUMMARY RESULT`);
    if (successful.length === 0) {
        console.log(`Success Rate: 0.0% (The market is tough!)`);
    } else {
        console.log(`Success Rate: ${((successful.length/count)*100).toFixed(1)}%`);
        console.log(`Avg. Time to Exit: ${avgMonths.toFixed(1)} months (${(avgMonths/12).toFixed(1)} years)`);
    }
    
    const outcomes: Record<string, number> = {};
    results.forEach(r => outcomes[r.type] = (outcomes[r.type] || 0) + 1);
    console.log("Outcomes:", outcomes);
    console.log("=".repeat(50) + "\n");
}

runSimulations(10);
