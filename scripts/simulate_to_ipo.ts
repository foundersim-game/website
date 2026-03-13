
import { processMonth, StartupAction } from '../src/lib/engine/simulation';
import { Founder, Startup } from '../src/lib/types/database.types';
import { calcFocusHours, IMMEDIATE_ACTIONS, ONGOING_PROGRAMS } from '../src/lib/engine/actions';
import { calcDynamicImpact, applyEffectsToState, ActionUsageLog, GameContext } from '../src/lib/engine/dynamicImpact';
import { processOngoingPrograms, startProgram, ActiveProgram } from '../src/lib/engine/ongoingPrograms';

// CONFIGURATION
const MAX_MONTHS = 180; // 15 years max
const IPO_ARR_GOAL = 50_000_000;
const IPO_USERS_GOAL = 100_000;
const IPO_PMF_GOAL = 60;
const IPO_TECH_DEBT_MAX = 40;
const ACQUISITION_GOAL = 500_000_000;

const BASE_FOUNDER: Founder = {
    id: 'sim-founder',
    user_id: 'sim-user',
    game_session_id: 'sim-session',
    name: 'AI Founder',
    background: 'Engineer',
    attributes: {
        intelligence: 70,
        technical_skill: 80,
        leadership: 60,
        networking: 50,
        marketing_skill: 50,
        sales_skill: 40,
        risk_appetite: 60,
        stress_tolerance: 70,
        reputation: 30
    },
    xp: { technical: 0, marketing: 0, leadership: 0, fundraising: 0, total: 0 },
    personal_wealth: 5000,
    assets: [],
    activeToggles: [],
    created_at: new Date().toISOString()
};

const BASE_STARTUP: Startup = {
    id: 'sim-startup',
    game_session_id: 'sim-session',
    name: 'BlitzCorp',
    industry: 'AI Startup',
    pricing_tier: 'pro',
    gtm_motion: 'PLG',
    active_marketing_channel: 'organic',
    metrics: {
        cash: 100000,
        burn_rate: 0,
        runway: 12,
        product_quality: 20,
        feature_completion: 0,
        users: 0,
        growth_rate: 0,
        brand_awareness: 5,
        employees: 0,
        engineers: 0,
        marketers: 0,
        sales: 0,
        team_morale: 90,
        technical_debt: 5,
        reliability: 80,
        innovation: 15,
        pmf_score: 10,
        revenue: 0,
        pricing: 49,
        founder_burnout: 0,
        founder_health: 100,
        sleep_quality: 100,
        option_pool: 0,
        investor_pipeline: { leads: 0, meetings: 0, term_sheets: 0 },
        b2b_pipeline: { leads: 0, active_deals: 0, closed_won: 0 },
        founder_salary: 0,
    },
    cxoTeam: {},
    employees: [],
    phase: 'Idea Phase',
    funding_stage: 'Bootstrapping',
    valuation: 1000000,
    created_at: new Date().toISOString(),
    history: []
} as any as Startup;

function simulate() {
    let startup = JSON.parse(JSON.stringify(BASE_STARTUP));
    let founder = JSON.parse(JSON.stringify(BASE_FOUNDER));
    let ongoingPrograms: ActiveProgram[] = [];
    let actionUsageLog: ActionUsageLog = { thisMonth: {}, lastUsedMonth: {} };
    
    for (let month = 1; month <= MAX_MONTHS; month++) {
        actionUsageLog.thisMonth = {};
        const m = startup.metrics;
        const maxHours = calcFocusHours(m.founder_burnout || 0, startup.employees || []);
        let hoursUsed = 0;

        // 1. STRATEGY: Spend Focus Hours
        // Priority: Recovery > Fundraising > Product Quality > Marketing
        
        if (m.founder_burnout > 50 || m.founder_health < 60) {
            const restAction = IMMEDIATE_ACTIONS.find(a => a.id === 'rest_day')!;
            while (hoursUsed + 5 <= maxHours && m.founder_burnout > 10) {
                const impact = calcDynamicImpact(restAction, actionUsageLog, { month, startup, founder, m });
                const result = applyEffectsToState(impact.scaledEffects, startup, founder);
                startup = result.startup;
                founder = result.founder;
                hoursUsed += 5;
                actionUsageLog.thisMonth[restAction.id] = (actionUsageLog.thisMonth[restAction.id] || 0) + 1;
            }
        }

        // Active Fundraising if low runway
        if (m.runway < 8 && startup.funding_stage !== 'IPO Ready') {
            const pitchAction = IMMEDIATE_ACTIONS.find(a => a.id === 'pitch_investors')!;
            if (hoursUsed + 40 <= maxHours) {
                m.investor_pipeline.leads += 15;
                m.founder_burnout += 10;
                hoursUsed += 40;
                actionUsageLog.thisMonth['pitch_investors'] = (actionUsageLog.thisMonth['pitch_investors'] || 0) + 1;
            }
        }

        // Automatic Funding Success
        if (m.investor_pipeline.leads > 15) {
            const stages = ['Seed Round', 'Series A', 'Series B', 'Series C', 'IPO Ready'];
            const nextIdx = stages.indexOf(startup.funding_stage) + 1;
            startup.funding_stage = stages[nextIdx] || 'IPO Ready';
            const raise = 500000 * Math.pow(4, nextIdx);
            m.cash += raise;
            startup.valuation = m.revenue * 12 * 10 + raise;
            m.investor_pipeline.leads = 0;
        }

        // Aggressive Hiring
        if (m.cash > 200000 && startup.employees.length < 100) {
            const role = startup.employees.length % 3 === 0 ? 'engineer' : (startup.employees.length % 3 === 1 ? 'marketer' : 'sales');
            startup.employees.push({
                id: `emp-${startup.employees.length}`,
                role: role,
                salary: 100000,
                performance: 85,
                skills: { technical: 80, marketing: 80, sales: 80 }
            });
            m.cash -= 15000;
            m.burn_rate += 9000;
        }

        // Spend remaining hours on quality or marketing
        const priorityAction = m.product_quality < 95 ? 'build_mvp_features' : 'paid_acquisition';
        const act = IMMEDIATE_ACTIONS.find(a => a.id === priorityAction)!;
        while (hoursUsed + act.energyCost <= maxHours) {
            const impact = calcDynamicImpact(act, actionUsageLog, { month, startup, founder, m });
            const result = applyEffectsToState(impact.scaledEffects, startup, founder);
            startup = result.startup;
            founder = result.founder;
            hoursUsed += act.energyCost;
            actionUsageLog.thisMonth[act.id] = (actionUsageLog.thisMonth[act.id] || 0) + 1;
        }

        // Programs
        const programsToStart = ['annual_billing', 'seo_content_machine', 'gym_routine', 'weekly_1on1s', 'investor_updates'];
        programsToStart.forEach(pid => {
            if (m.cash > 50000 && !ongoingPrograms.some(p => p.id === pid)) {
                ongoingPrograms = startProgram(ongoingPrograms, pid, month);
            }
        });

        const ongoingResult = processOngoingPrograms(ongoingPrograms, month, startup, founder);
        startup = ongoingResult.startup;
        founder = ongoingResult.founder;

        let monthAction: StartupAction = 'none';
        if (m.technical_debt > 20) monthAction = 'refactor_core';
        else if (m.product_quality < 80) monthAction = 'build_mvp_features';
        else monthAction = 'paid_acquisition';

        const { newStartup } = processMonth(founder, startup, monthAction);
        startup = newStartup;

        const arr = m.revenue * 12;
        const isIPOEligible = arr >= IPO_ARR_GOAL && m.users >= IPO_USERS_GOAL && m.pmf_score >= IPO_PMF_GOAL && m.technical_debt < IPO_TECH_DEBT_MAX;
        const isAcquired = startup.valuation >= ACQUISITION_GOAL;

        if (isIPOEligible || isAcquired) {
            return { success: true, month, type: isIPOEligible ? 'IPO ELIGIBLE' : '$500M ACQUISITION', arr, users: m.users };
        }

        if (m.cash < 0) return { success: false, month, type: 'BANKRUPT', arr, users: m.users };

        for (const id in actionUsageLog.thisMonth) {
            actionUsageLog.lastUsedMonth[id] = month;
        }
    }
    return { success: false, month: MAX_MONTHS, type: 'TIMEOUT', arr: startup.metrics.revenue * 12, users: startup.metrics.users };
}

function runSimulations(count: number) {
    const results: number[] = [];
    const outcomes: Record<string, number> = {};

    console.log(`Running ${count} simulations with $50M ARR goal...`);
    for (let i = 0; i < count; i++) {
        const res = simulate();
        outcomes[res.type] = (outcomes[res.type] || 0) + 1;
        if (res.success) {
            results.push(res.month);
            console.log(`Run ${i+1}: Success in ${res.month} months via ${res.type}`);
        } else {
            console.log(`Run ${i+1}: Failed (${res.type}) at Month ${res.month}. Final ARR: $${(res.arr/1000000).toFixed(1)}M, Users: ${res.users.toLocaleString()}`);
        }
    }

    if (results.length > 0) {
        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        console.log(`\n================================`);
        console.log(`AVERAGE TIME TO IPO/SALE: ${avg.toFixed(1)} MONTHS`);
        console.log(`Success Rate: ${((results.length / count) * 100).toFixed(0)}%`);
        console.log(`Outcomes:`, outcomes);
        console.log(`================================`);
    } else {
        console.log(`\nNo successful runs reached the $50M goal.`);
        console.log(`Outcomes:`, outcomes);
    }
}

runSimulations(10);
