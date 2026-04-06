/**
 * generate_ipo_state.ts
 * Generates a complete IPO-ready game state and outputs a one-liner
 * that can be pasted into Safari's JavaScript console while the iOS Simulator is running.
 *
 * Run with:   npx ts-node --esm scripts/generate_ipo_state.ts
 */

import * as fs from 'fs';

// ─── Small helpers ────────────────────────────────────────────────────────────

function makeEmployees(count: number) {
    const roles = ['engineer', 'marketer', 'sales'];
    const names = ['Alex','Jordan','Morgan','Taylor','Chris','Sam','Riley','Drew','Casey','Jamie'];
    return Array.from({ length: count }, (_, i) => ({
        id: `emp-${i}`,
        name: `${names[i % names.length]} ${i + 1}`,
        role: roles[i % 3],
        level: 'Senior',
        salary: 120000,
        performance: Math.round(85 + Math.random() * 10),
        morale: 90,
        isCXO: false,
        skills: { technical: 88, marketing: 82, sales: 80 },
        joined_at: Math.ceil(i / 3),
    }));
}

function makePLHistory(months: number) {
    return Array.from({ length: months }, (_, i) => {
        const m = i + 1;
        const users = Math.floor(500 * Math.pow(1.14, m));
        const rev = users * 55;
        const opex = 180_000 + users * 1.5 + (m > 24 ? 800_000 : 0); // team scale-up cost
        return {
            month: m,
            revenue: rev,
            cogs: Math.round(rev * 0.18),
            grossProfit: Math.round(rev * 0.82),
            opex: Math.round(opex),
            netIncome: Math.round(rev - opex),
        };
    });
}

// ─── Build the state ──────────────────────────────────────────────────────────

const MONTHS = 60;
const history = makePLHistory(MONTHS);
const lastEntry = history[MONTHS - 1];
const finalUsers = Math.floor(500 * Math.pow(1.14, MONTHS));
const finalRevenue = lastEntry.revenue;
const finalARR = finalRevenue * 12;
const finalValuation = finalARR * 10; // 10× ARR multiple

const employees = makeEmployees(52);

// Inject CXO executives as special employees
const cxoEntries = ['CTO', 'CMO', 'CFO', 'COO', 'CPO'].map((role, i) => ({
    id: `cxo_${role.toLowerCase()}`,
    name: `${role} (Executive)`,
    role: role.toLowerCase(),
    level: 'Executive',
    salary: 180000,
    performance: 95,
    morale: 92,
    isCXO: true,
    skills: { technical: 95, marketing: 95, sales: 95 },
    joined_at: 12,
}));

const allEmployees = [...employees, ...cxoEntries];

const startup = {
    id: 'startup-ipo-ready',
    game_session_id: 's-legendary',
    name: 'VaultAI',
    industry: 'SaaS Platform',
    pricing_tier: 'enterprise',
    gtm_motion: 'PLG',
    active_marketing_channel: 'organic',
    funding_stage: 'Series C',        // Satisfies IPO check: Series A+
    ipo_stage: 0,                     // Not yet started — unlocks the button
    phase: 'Scaling',
    valuation: finalValuation,
    peak_valuation: finalValuation,
    peak_users: finalUsers,
    culture_score: 88,
    cxoTeam: {                        // CFO required for IPO gate we just added
        CTO: true, CMO: true, CFO: true, COO: true, CPO: true,
    },
    capTable: [
        { name: 'Founder',       equity: 38,  type: 'Founder'   },
        { name: 'Sequoia',       equity: 18,  type: 'Investor'  },
        { name: 'a16z',          equity: 14,  type: 'Investor'  },
        { name: 'Tiger Global',  equity: 10,  type: 'Investor'  },
        { name: 'Employee Pool', equity: 12,  type: 'Employee'  },
        { name: 'Angels',        equity: 8,   type: 'Investor'  },
    ],
    metrics: {
        cash: 55_000_000,
        burn_rate: 900_000,
        runway: 61,
        product_quality: 92,          // IPO check: > 80
        feature_completion: 0,
        users: finalUsers,            // IPO check: > 100,000
        revenue: finalRevenue,
        growth_rate: 0.12,
        brand_awareness: 86,
        pmf_score: 85,
        technical_debt: 12,           // IPO check: < 40
        reliability: 94,
        innovation: 72,
        team_morale: 88,
        founder_burnout: 22,
        founder_health: 75,
        sleep_quality: 70,
        cac: 420,
        ltv: 4800,
        churn: 0.025,
        option_pool: 4.2,
        net_profit: finalRevenue - 900_000,
        founder_salary: 25000,
        current_season: 'Bull Market',
        has_legal_dept: true,
        investor_pipeline: { leads: 3, meetings: 1, term_sheets: 0 },
        b2b_pipeline: { leads: 220, active_deals: 45, closed_won: 180 },
        pricing: 55,
        employees: allEmployees.length,
        engineers: employees.filter(e => e.role === 'engineer').length,
        marketers: employees.filter(e => e.role === 'marketer').length,
        sales: employees.filter(e => e.role === 'sales').length,
    },
    employees: allEmployees,
    history,
    created_at: new Date(Date.now() - MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const founder = {
    id: 'f-ipo-ready',
    user_id: 'u-demo',
    game_session_id: 's-legendary',
    name: 'Alex Chen',
    background: 'Engineer',
    attributes: {
        intelligence: 92,
        technical_skill: 90,
        leadership: 82,
        networking: 68,
        marketing_skill: 72,
        sales_skill: 65,
        risk_appetite: 70,
        stress_tolerance: 78,
        reputation: 75,
    },
    xp: { technical: 800, marketing: 350, leadership: 500, fundraising: 420, total: 2070 },
    personal_wealth: 450_000,
    assets: [],
    activeToggles: [],
    created_at: new Date(Date.now() - MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const fullState = {
    startup,
    founder,
    month: MONTHS,
    eventsTimeline: [
        `🚀 Company founded with $500K seed funding`,
        `🌱 Seed Round closed at $2M`,
        `⚡ Series A: raised $12M from Sequoia`,
        `📈 Hit 10,000 users milestone!`,
        `💎 Series B: $80M from a16z at $400M valuation`,
        `🏢 Series C: $200M from Tiger Global`,
        `🎉 Crossed 200,000 users!`,
        `💰 Revenue run rate hit $${(finalARR / 1_000_000).toFixed(0)}M ARR`,
        `🏛️ Board approved IPO planning — all checks passed`,
    ],
    competitors: [],
    unlockedAchievements: ['first_hire', 'pmf_achieved', 'series_a', 'unicorn_path'],
    ongoingPrograms: [],
    seenEventIds: [],
    founderMeta: {
        name: founder.name,
        age: '32',
        background: 'Engineer',
        industry: 'SaaS Platform',
        gtmMotion: 'PLG',
        scenario: 'classic',
        startupName: startup.name,
        logo: '🏦',
        brandColor: '#6366f1',
    },
    focusHoursUsed: 0,
    actionUsageLog: { thisMonth: {}, lifetime: {} },
};

// Write JSON file
fs.writeFileSync('ipo_complete_state.json', JSON.stringify(fullState, null, 2));
console.log(`\n✅ IPO-Ready state generated!`);
console.log(`   Company:    ${startup.name}`);
console.log(`   ARR:        $${(finalARR / 1_000_000).toFixed(1)}M`);
console.log(`   Users:      ${finalUsers.toLocaleString()}`);
console.log(`   Valuation:  $${(finalValuation / 1_000_000_000).toFixed(2)}B`);
console.log(`   Employees:  ${allEmployees.length}`);
console.log(`   CFO:        ✅ Hired`);
console.log(`   IPO Stage:  0 (ready to file S-1)\n`);

// ─── Generate the one-liner injection script ──────────────────────────────────

const oneLiner = `(function(){localStorage.setItem('founder_sim_state',${JSON.stringify(JSON.stringify(fullState))});alert('✅ IPO State loaded! Reloading...');location.reload();})();`;

console.log('─'.repeat(70));
console.log('STEP 1 — Make sure iOS Simulator is running with "npm run dev"');
console.log('STEP 2 — Open Safari on your Mac > Develop > Simulator > localhost');
console.log('STEP 3 — Open the Console tab in Safari Dev Tools');
console.log('STEP 4 — Paste the one-liner below and press Enter:');
console.log('─'.repeat(70));
console.log('\n' + oneLiner + '\n');
console.log('─'.repeat(70));
console.log('The app will reload and you will land directly in the dashboard');
console.log('with all 5 IPO checks passed and a CFO hired. The S-1 button');
console.log('should be visible and unlocked in the Stats tab → IPO Readiness.\n');
