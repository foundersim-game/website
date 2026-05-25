import { Startup, ActiveCrisis, CrisisType, CrisisStage, CrisisEffects, CrisisChoice } from "../types/database.types";

// ─── CRISIS CHAIN DEFINITIONS ────────────────────────────────────────────────
// Each chain is a sequence of escalating stages. Player has a window to respond
// at each stage before it auto-escalates with the bad effects.

export const CRISIS_CHAINS: Record<CrisisType, CrisisStage[]> = {

    // ── DATA BREACH: 3 stages, internal → press → regulatory ────────────────
    data_breach: [
        {
            title: "Security Incident: Unauthorized Access Detected",
            description: "Your engineering team flagged anomalous database queries overnight. The scope is unclear — could be a minor scan, could be a full exfiltration. You have 1 month to decide how to respond before this leaks.",
            severity: 1,
            autoEscalatesAfterMonths: 1,
            stageNotice: "🔒 Security Alert: Unusual database activity detected. Respond in the War Room.",
            choices: [
                {
                    id: "disclose_now",
                    label: "Disclose Immediately",
                    description: "Issue a public breach notice. Costly in brand, but builds legal protection and user trust long-term.",
                    cost: 50000,
                    successRate: 0.90,
                    successEffects: { brand_awareness: -10, team_morale: 5, ceo_reputation: 5, cash_hit: -50000 },
                    failureEffects: { brand_awareness: -20, ceo_reputation: -10 },
                },
                {
                    id: "investigate_quietly",
                    label: "Investigate Quietly (1 month)",
                    description: "Hire a security firm to assess scope. Risk: if the press finds out first, the fallout is worse.",
                    cost: 30000,
                    successRate: 0.55,
                    successEffects: { brand_awareness: 0, cash_hit: -30000, ceo_reputation: 0 },
                    failureEffects: { brand_awareness: -15, ceo_reputation: -8 },
                },
            ],
            autoEscalateEffects: { brand_awareness: -25, ceo_reputation: -15, legal_risk: true },
        },
        {
            title: "TechCrunch: \"{{company}} Silently Covered Up Data Breach\"",
            description: "The story is on the front page. Twitter is calling for the CEO to resign. Enterprise customers are emailing. You have 2 months to control the narrative before the FTC gets involved.",
            severity: 2,
            autoEscalatesAfterMonths: 2,
            stageNotice: "📰 PRESS CRISIS: Your data breach is now public. Respond immediately.",
            choices: [
                {
                    id: "ceo_apology_tour",
                    label: "CEO Public Apology Tour",
                    description: "Go on podcasts, write a public post-mortem, take full accountability. High risk, high reward for brand recovery.",
                    cost: 80000,
                    successRate: 0.70,
                    successEffects: { brand_awareness: -8, team_morale: 10, ceo_reputation: 15, cash_hit: -80000 },
                    failureEffects: { brand_awareness: -25, ceo_reputation: -20 },
                },
                {
                    id: "legal_defense",
                    label: "Issue Legal Hold — No Comment",
                    description: "Let the lawyers manage it. Buys time, but the silence reads as guilt to the public.",
                    cost: 150000,
                    successRate: 0.60,
                    successEffects: { brand_awareness: -20, cash_hit: -150000, ceo_reputation: -5 },
                    failureEffects: { brand_awareness: -40, ceo_reputation: -25, user_churn_bonus: 0.05 },
                },
            ],
            autoEscalateEffects: { brand_awareness: -35, user_churn_bonus: 0.08, ceo_reputation: -20, legal_risk: true },
        },
        {
            title: "FTC Opens Formal Investigation",
            description: "A federal inquiry has been opened into your data handling practices. Companies with a legal department typically resolve this in 60-90 days. Without one, you're exposed to maximum fines.",
            severity: 3,
            autoEscalatesAfterMonths: 2,
            stageNotice: "⚖️ REGULATORY: FTC investigation opened. Respond or face maximum penalties.",
            choices: [
                {
                    id: "cooperate_fully",
                    label: "Full Cooperation & Consent Decree",
                    description: "Give them everything. Typically reduces the fine by 60% and avoids litigation.",
                    cost: 400000,
                    successRate: 0.80,
                    successEffects: { cash_hit: -400000, ceo_reputation: 5 },
                    failureEffects: { cash_hit: -800000, ceo_reputation: -15, valuation_mult: 0.85 },
                },
                {
                    id: "contest_investigation",
                    label: "Contest the Investigation",
                    description: "Fight it. Expensive legal battle. 40% chance you win and walk. 60% chance you lose badly.",
                    cost: 600000,
                    successRate: 0.40,
                    successEffects: { cash_hit: -600000, ceo_reputation: 10 },
                    failureEffects: { cash_hit: -2000000, ceo_reputation: -30, valuation_mult: 0.70 },
                },
            ],
            autoEscalateEffects: { cash_hit: -2500000, valuation_mult: 0.65, ceo_reputation: -40 },
        },
    ],

    // ── EMPLOYEE REVOLT: 2 stages, glassdoor → walkout ──────────────────────
    employee_revolt: [
        {
            title: "Glassdoor Review Goes Viral: \"CEO is Burning the Team Out\"",
            description: "An anonymous review hit 50k LinkedIn shares overnight. It names specific management decisions. Half your team has seen it. Morale is in freefall.",
            severity: 2,
            autoEscalatesAfterMonths: 1,
            stageNotice: "😤 MORALE CRISIS: Viral employee complaint is spreading. Address it now.",
            choices: [
                {
                    id: "all_hands_meeting",
                    label: "Emergency All-Hands: Listen & Commit",
                    description: "Cancel everything. Address the team directly, acknowledge the problems, commit to changes. Vulnerable, but the right call.",
                    cost: 0,
                    successRate: 0.75,
                    successEffects: { team_morale: 20, ceo_reputation: 10, brand_awareness: -5 },
                    failureEffects: { team_morale: -10, ceo_reputation: -15 },
                },
                {
                    id: "blanket_pay_raise",
                    label: "Announce 12% Salary Bump for All",
                    description: "Money talks. Expensive ongoing commitment, but it immediately addresses the core complaint.",
                    cost: 0, // handled as ongoing salary effect
                    successRate: 0.85,
                    successEffects: { team_morale: 25, ceo_reputation: 5 },
                    failureEffects: { team_morale: 5, ceo_reputation: -5 },
                },
                {
                    id: "ignore_it",
                    label: "Post \"We Take Culture Seriously\" PR Statement",
                    description: "A canned PR response. Cheap, but the team will know it's hollow.",
                    cost: 0,
                    successRate: 0.25,
                    successEffects: { team_morale: 5, ceo_reputation: 0 },
                    failureEffects: { team_morale: -20, ceo_reputation: -25, brand_awareness: -10 },
                },
            ],
            autoEscalateEffects: { team_morale: -25, ceo_reputation: -20, brand_awareness: -15 },
        },
        {
            title: "7 Senior Engineers Announce Simultaneous Resignation",
            description: "The engineering team's senior leads are walking out together. They've drafted a public letter. This is an existential threat to product development.",
            severity: 4,
            autoEscalatesAfterMonths: 1,
            stageNotice: "🚨 TEAM EXODUS: Senior engineers are resigning. Emergency intervention required.",
            choices: [
                {
                    id: "retention_package",
                    label: "Emergency Retention Package",
                    description: "Offer equity top-ups + 6-month salary guarantees. Very expensive, but keeps the team.",
                    cost: 500000,
                    successRate: 0.70,
                    successEffects: { team_morale: 30, ceo_reputation: 5, cash_hit: -500000 },
                    failureEffects: { team_morale: -20, ceo_reputation: -30, brand_awareness: -20, valuation_mult: 0.80 },
                },
                {
                    id: "accept_resignations",
                    label: "Accept Resignations & Rehire",
                    description: "Let them go with severance and begin emergency recruitment. Painful but sometimes the right reset.",
                    cost: 200000,
                    successRate: 0.50,
                    successEffects: { team_morale: -10, ceo_reputation: -10, cash_hit: -200000 },
                    failureEffects: { team_morale: -35, ceo_reputation: -40, valuation_mult: 0.75 },
                },
            ],
            autoEscalateEffects: { team_morale: -40, ceo_reputation: -35, valuation_mult: 0.70, brand_awareness: -25 },
        },
    ],

    // ── REGULATORY PROBE: 2 stages ───────────────────────────────────────────
    regulatory_probe: [
        {
            title: "State AG's Office Sends Formal Inquiry Letter",
            description: "You received a 12-page inquiry from the state Attorney General's office regarding your data practices and consumer disclosures. A response is required within 30 days.",
            severity: 2,
            autoEscalatesAfterMonths: 2,
            stageNotice: "⚖️ Legal: State AG inquiry received. Respond in the War Room.",
            choices: [
                {
                    id: "hire_outside_counsel",
                    label: "Hire Outside Counsel",
                    description: "Bring in a top regulatory law firm. Expensive, but dramatically improves your outcome odds.",
                    cost: 200000,
                    successRate: 0.85,
                    successEffects: { cash_hit: -200000, ceo_reputation: 5 },
                    failureEffects: { cash_hit: -200000, ceo_reputation: -10 },
                },
                {
                    id: "in_house_response",
                    label: "Handle In-House (if Legal Dept exists)",
                    description: "Use your legal department if you have one. Free, but riskier without specialized counsel.",
                    cost: 0,
                    successRate: 0.60, // bumped to 0.75 if has_legal_dept
                    successEffects: { ceo_reputation: 2 },
                    failureEffects: { ceo_reputation: -20, legal_risk: true },
                },
            ],
            autoEscalateEffects: { ceo_reputation: -20, legal_risk: true, brand_awareness: -10 },
        },
        {
            title: "AG Files Civil Complaint — Public Settlement Required",
            description: "The inquiry has escalated to a civil complaint. A settlement is likely unavoidable. The question is how much.",
            severity: 3,
            autoEscalatesAfterMonths: 2,
            stageNotice: "🔨 Civil Complaint filed. Settle or fight — decide in the War Room.",
            choices: [
                {
                    id: "settle_immediately",
                    label: "Settle & Consent Decree",
                    description: "Pay up and accept operational restrictions. Painful but predictable.",
                    cost: 750000,
                    successRate: 0.95,
                    successEffects: { cash_hit: -750000, ceo_reputation: 0 },
                    failureEffects: { cash_hit: -750000, ceo_reputation: -10 },
                },
                {
                    id: "fight_in_court",
                    label: "Fight in Court",
                    description: "Expensive, time-consuming, 35% win rate. But a win clears your name completely.",
                    cost: 1000000,
                    successRate: 0.35,
                    successEffects: { cash_hit: -1000000, ceo_reputation: 20, brand_awareness: 10 },
                    failureEffects: { cash_hit: -2500000, ceo_reputation: -30, valuation_mult: 0.75 },
                },
            ],
            autoEscalateEffects: { cash_hit: -3000000, valuation_mult: 0.60, ceo_reputation: -45 },
        },
    ],

    // ── FOUNDER SCANDAL: 1 heavy stage (board intervention) ─────────────────
    founder_scandal: [
        {
            title: "Board Emergency Meeting Called: CEO Conduct Under Review",
            description: "An anonymous letter from within the company reached board members alleging misconduct. The board has called an emergency session. Your leadership — and potentially your position — is at stake.",
            severity: 4,
            autoEscalatesAfterMonths: 1,
            stageNotice: "🚨 BOARD CRISIS: Your leadership is under review. This is existential.",
            choices: [
                {
                    id: "address_board_directly",
                    label: "Address the Board Directly & Transparently",
                    description: "Walk into the meeting, own what happened, present a remediation plan. High risk, but authentic leadership.",
                    cost: 0,
                    successRate: 0.65,
                    successEffects: { team_morale: -5, ceo_reputation: -10, brand_awareness: -15 },
                    failureEffects: { team_morale: -25, ceo_reputation: -40, brand_awareness: -30, valuation_mult: 0.75 },
                },
                {
                    id: "hire_crisis_pr",
                    label: "Hire Crisis PR Firm + Legal Team",
                    description: "Spin the narrative, control the timeline, delay the board. Works short-term but often extends the saga.",
                    cost: 300000,
                    successRate: 0.55,
                    successEffects: { cash_hit: -300000, ceo_reputation: -20, brand_awareness: -10 },
                    failureEffects: { cash_hit: -300000, ceo_reputation: -50, brand_awareness: -40, valuation_mult: 0.60 },
                },
            ],
            autoEscalateEffects: { ceo_reputation: -60, team_morale: -30, valuation_mult: 0.65, brand_awareness: -35 },
        },
    ],

    // ── PRESS LEAK: 2 stages ─────────────────────────────────────────────────
    press_leak: [
        {
            title: "The Information: Internal Slack Messages Obtained by Press",
            description: "The Information published excerpts from internal Slack messages discussing product failures and investor relations. The source is unknown. Employees are spooked.",
            severity: 2,
            autoEscalatesAfterMonths: 1,
            stageNotice: "📰 LEAK: Internal communications published. Address in War Room.",
            choices: [
                {
                    id: "launch_leak_investigation",
                    label: "Internal Leak Investigation",
                    description: "Hire forensics to identify the source. Shows action but risks an adversarial atmosphere.",
                    cost: 50000,
                    successRate: 0.60,
                    successEffects: { team_morale: -5, ceo_reputation: 0, cash_hit: -50000 },
                    failureEffects: { team_morale: -20, ceo_reputation: -15 },
                },
                {
                    id: "acknowledge_move_on",
                    label: "Acknowledge & Move Forward Publicly",
                    description: "Brief public statement: \"context was missing, here's the full picture.\" Transparent but exposing.",
                    cost: 0,
                    successRate: 0.70,
                    successEffects: { brand_awareness: 5, ceo_reputation: 10, team_morale: 5 },
                    failureEffects: { brand_awareness: -20, ceo_reputation: -20 },
                },
            ],
            autoEscalateEffects: { brand_awareness: -20, team_morale: -15, ceo_reputation: -15 },
        },
        {
            title: "Follow-Up Report: \"CEO Knew About Problems, Misled Investors\"",
            description: "A second article drops, this one alleging investor misrepresentation. This is a securities issue now — not just a PR problem.",
            severity: 3,
            autoEscalatesAfterMonths: 1,
            stageNotice: "🔴 SECURITIES RISK: Investor misrepresentation alleged. Act immediately.",
            choices: [
                {
                    id: "investor_call",
                    label: "Emergency Investor Town Hall",
                    description: "Get ahead of the story with your investors. Show the full picture proactively.",
                    cost: 0,
                    successRate: 0.75,
                    successEffects: { ceo_reputation: 5, brand_awareness: -5 },
                    failureEffects: { ceo_reputation: -25, valuation_mult: 0.80, brand_awareness: -20 },
                },
                {
                    id: "securities_counsel",
                    label: "Retain Securities Counsel Immediately",
                    description: "Get lawyers to prep disclosure documents. Expensive but legally the right move.",
                    cost: 350000,
                    successRate: 0.80,
                    successEffects: { cash_hit: -350000, ceo_reputation: 5 },
                    failureEffects: { cash_hit: -350000, ceo_reputation: -15, valuation_mult: 0.85 },
                },
            ],
            autoEscalateEffects: { ceo_reputation: -35, valuation_mult: 0.70, brand_awareness: -30, legal_risk: true },
        },
    ],

    // ── SHORT SELLER: 2 stages (Public Era Only) ─────────────────────────────
    short_seller: [
        {
            title: "Hindenburg Research Announces Short Position",
            description: "A prominent activist short seller just tweeted that your company is a 'house of cards' and promised a full report tomorrow. The stock is already down 8% on the rumor.",
            severity: 2,
            autoEscalatesAfterMonths: 1,
            stageNotice: "📉 SHORT SELLER: Activist short announced a position. Stock dropping.",
            choices: [
                {
                    id: "preemptive_rebuttal",
                    label: "Pre-emptive PR Rebuttal",
                    description: "Issue a strong statement condemning the tactics before the report drops.",
                    cost: 50000,
                    successRate: 0.50,
                    successEffects: { ceo_reputation: 5, team_morale: 5, cash_hit: -50000 },
                    failureEffects: { ceo_reputation: -10, valuation_mult: 0.90 },
                },
                {
                    id: "ignore_short",
                    label: "Ignore the Noise",
                    description: "Let the financials speak for themselves. High risk if the report has teeth.",
                    cost: 0,
                    successRate: 0.30,
                    successEffects: { ceo_reputation: 15, brand_awareness: 5 },
                    failureEffects: { ceo_reputation: -15, valuation_mult: 0.85 },
                },
            ],
            autoEscalateEffects: { valuation_mult: 0.80, ceo_reputation: -15 },
        },
        {
            title: "Short Report Published: 'Accounting Irregularities'",
            description: "The report is out. They are accusing your CFO of aggressive revenue recognition. The stock is in freefall and the SEC might look into this.",
            severity: 4,
            autoEscalatesAfterMonths: 1,
            stageNotice: "🚨 MARKET PANIC: Short report alleges fraud. Stock cratering.",
            choices: [
                {
                    id: "independent_audit",
                    label: "Commission Independent Audit",
                    description: "Hire a Big 4 firm to publicly verify your books. Extremely expensive but definitive.",
                    cost: 800000,
                    successRate: 0.85,
                    successEffects: { ceo_reputation: 10, valuation_mult: 1.10, cash_hit: -800000 }, // price rebounds
                    failureEffects: { ceo_reputation: -30, valuation_mult: 0.70, cash_hit: -800000, legal_risk: true },
                },
                {
                    id: "sue_short_seller",
                    label: "Sue the Short Seller for Defamation",
                    description: "Aggressive legal action. Satisfying, but rarely succeeds in stopping the bleeding quickly.",
                    cost: 300000,
                    successRate: 0.40,
                    successEffects: { ceo_reputation: 15, brand_awareness: 10, cash_hit: -300000 },
                    failureEffects: { ceo_reputation: -40, valuation_mult: 0.60, cash_hit: -300000, team_morale: -20 },
                },
            ],
            autoEscalateEffects: { valuation_mult: 0.50, ceo_reputation: -50, team_morale: -30, legal_risk: true },
        },
    ],
};

// ─── HUMAN-READABLE CRISIS LABELS ────────────────────────────────────────────
export const CRISIS_LABELS: Record<CrisisType, string> = {
    data_breach: "Data Breach",
    employee_revolt: "Employee Revolt",
    regulatory_probe: "Regulatory Probe",
    founder_scandal: "Founder Scandal",
    press_leak: "Press Leak",
    short_seller: "Short Seller Attack",
};

export const CRISIS_EMOJIS: Record<CrisisType, string> = {
    data_breach: "🔒",
    employee_revolt: "😤",
    regulatory_probe: "⚖️",
    founder_scandal: "🚨",
    press_leak: "📰",
    short_seller: "📉",
};

// ─── CRISIS SPAWN ─────────────────────────────────────────────────────────────
/**
 * Called each month. Returns a new crisis if one should start, or null.
 * Only one crisis can be active at a time.
 */
export function checkCrisisSpawn(startup: Startup & { _securitySkillReduction?: number }, monthsPassed: number): ActiveCrisis | null {
    // Block if crisis already active
    if (startup.active_crisis && !startup.active_crisis.resolved) return null;

    // Cooldown: 3-month buffer after a crisis resolves
    if (startup.active_crisis?.resolved) {
        const resolvedAt = startup.active_crisis.stageStartedMonth;
        if (monthsPassed - resolvedAt < 3) return null;
    }

    // Base probability with risk modifiers
    let prob = 0.04; // 4% base chance/month
    
    // SCALING: Large companies are bigger targets
    const valuation = startup.valuation || 0;
    if (valuation > 100_000_000_000_000) prob += 0.10; // 14% base for 100T+ giants
    else if (valuation > 1_000_000_000_000) prob += 0.04; // 8% for 1T+
    else if (valuation > 100_000_000) prob += 0.02; // 6% for 100M+

    if ((startup.metrics.technical_debt || 0) > 70) prob += 0.05;
    if (startup.metrics.team_morale < 40) prob += 0.06;
    if ((startup.metrics.founder_burnout || 0) > 70) prob += 0.04;
    if ((startup.ceo_reputation ?? 80) < 50) prob += 0.03;

    // Apply Lobbying shield (Up to 50% crisis chance reduction if lobbying_score is 100)
    const lobbyingScore = (startup.public_company?.lobbying_score || 0);
    prob *= (1 - (lobbyingScore / 100) * 0.5);

    if (Math.random() > prob) return null;

    // Weight crisis types by current company state
    const types: CrisisType[] = [];
    types.push("press_leak");      // always possible
    // security_first skill reduces data_breach probability
    const datBreachReduction = startup._securitySkillReduction ?? 0;
    if ((startup.metrics.technical_debt || 0) > 50 && Math.random() > datBreachReduction) types.push("data_breach");
    if (startup.metrics.team_morale < 60) types.push("employee_revolt");
    if (startup.metrics.has_legal_dept === false) types.push("regulatory_probe");
    if ((startup.ceo_reputation ?? 80) < 65) types.push("founder_scandal");
    
    // Pillar 2 (Public Company) specific crises
    if (startup.public_company) {
        if ((startup.public_company.quarterly_misses || 0) > 0 || (startup.public_company.share_price < startup.public_company.ipo_price)) {
            types.push("short_seller");
            types.push("short_seller"); // weighted higher if underperforming
        }
    }

    // Fallback
    if (types.length === 0) types.push("press_leak");

    const type = types[Math.floor(Math.random() * types.length)];

    return {
        id: `crisis_${Date.now()}`,
        type,
        currentStage: 0,
        startedMonth: monthsPassed,
        stageStartedMonth: monthsPassed,
        resolved: false,
        resolvedByPlayer: false,
        ceoReputationHit: 0,
    };
}

/**
 * Specifically for passive lawsuit spawning (patent trolls, wrongful termination)
 * independent of major Crises.
 */
export function checkLawsuitSpawn(startup: Startup, monthsPassed: number): import("../types/database.types").Lawsuit | null {
    const valuation = startup.valuation || 0;
    const headcount = (startup.employees?.length || 0);
    
    let prob = 0.005; // 0.5% base
    
    // Scale with valuation
    if (valuation > 100_000_000_000_000) prob += 0.12;
    else if (valuation > 1_000_000_000_000) prob += 0.05;
    else if (valuation > 10_000_000) prob += 0.01;
    
    // Scale with headcount (more people = more HR risk)
    if (headcount > 1000) prob += 0.08;
    else if (headcount > 100) prob += 0.03;

    // Lobbying helps with regulatory lawsuits specifically, but we'll apply it broadly here
    const lobbyingScore = (startup.public_company?.lobbying_score || 0);
    prob *= (1 - (lobbyingScore / 100) * 0.4);

    if (Math.random() > prob) return null;

    const types: import("../types/database.types").LawsuitType[] = ["wrongful_termination", "ip_infringement", "regulatory_fine", "class_action"];
    // Large companies get more class actions/IP suits
    if (valuation > 1_000_000_000) {
        types.push("class_action", "ip_infringement");
    }
    
    const type = types[Math.floor(Math.random() * types.length)];
    return spawnLawsuit(type, monthsPassed);
}

// ─── AUTO-ESCALATION ──────────────────────────────────────────────────────────
/**
 * Checks if the current crisis stage has expired its response window.
 * If so, applies the bad auto-escalate effects and advances to the next stage (or resolves badly).
 */
export function processCrisisEscalation(
    crisis: ActiveCrisis,
    monthsPassed: number,
    hasLegalDept: boolean
): {
    escalated: boolean;
    newStage: number;   // -1 = crisis over (badly)
    effects: Partial<import("../types/database.types").CrisisEffects>;
    notice: string;
} {
    const chain = CRISIS_CHAINS[crisis.type];
    if (!chain || crisis.resolved) return { escalated: false, newStage: crisis.currentStage, effects: {}, notice: "" };

    const stage = chain[crisis.currentStage];
    if (!stage) return { escalated: false, newStage: crisis.currentStage, effects: {}, notice: "" };

    const monthsAtStage = monthsPassed - crisis.stageStartedMonth;
    if (monthsAtStage < stage.autoEscalatesAfterMonths) {
        return { escalated: false, newStage: crisis.currentStage, effects: {}, notice: "" };
    }

    // Stage window expired — apply auto-escalation effects
    let effects = { ...stage.autoEscalateEffects };

    // Legal dept halves cash hits
    if (hasLegalDept && effects.cash_hit) {
        effects.cash_hit = Math.floor(effects.cash_hit * 0.5);
    }

    const nextStageIdx = crisis.currentStage + 1;
    const notice = nextStageIdx >= chain.length
        ? `💥 CRISIS UNRESOLVED: ${CRISIS_LABELS[crisis.type]} has reached maximum severity. Severe consequences applied.`
        : `⚠️ CRISIS ESCALATED: ${CRISIS_LABELS[crisis.type]} worsened. ${chain[nextStageIdx].stageNotice}`;

    return {
        escalated: true,
        newStage: nextStageIdx >= chain.length ? -1 : nextStageIdx,
        effects,
        notice,
    };
}

// ─── PLAYER CHOICE RESOLUTION ─────────────────────────────────────────────────
/**
 * Resolves a player choice against the current crisis stage.
 * Returns the effects to apply, whether the crisis is contained, and a notice.
 */
export function resolveCrisisChoice(
    crisis: ActiveCrisis,
    choiceId: string,
    hasLegalDept: boolean,
    monthsPassed: number
): {
    success: boolean;
    crisisResolved: boolean;  // true = crisis over after this choice
    effects: import("../types/database.types").CrisisEffects;
    notice: string;
    updatedCrisis: ActiveCrisis;
} {
    const chain = CRISIS_CHAINS[crisis.type];
    const stage = chain?.[crisis.currentStage];
    const choice = stage?.choices.find(c => c.id === choiceId);

    if (!choice || !stage) {
        return {
            success: false,
            crisisResolved: false,
            effects: {},
            notice: "Invalid choice.",
            updatedCrisis: crisis,
        };
    }

    // Boost success rate for legal dept on legal-adjacent choices
    let successRate = choice.successRate;
    if (hasLegalDept && (choice.id === "in_house_response" || crisis.type === "regulatory_probe")) {
        successRate = Math.min(0.95, successRate + 0.15);
    }

    const success = Math.random() < successRate;
    const effects = success ? { ...choice.successEffects } : { ...choice.failureEffects };

    // Apply choice cost
    if (choice.cost && choice.cost > 0) {
        effects.cash_hit = (effects.cash_hit || 0) - choice.cost;
    }

    const isLastStage = crisis.currentStage >= chain.length - 1;
    const crisisResolved = success; // Success at any stage resolves the crisis chain

    const nextStageIdx = success ? -1 : crisis.currentStage + 1;
    const crisisNowOver = crisisResolved || nextStageIdx >= chain.length;

    const reputationHit = effects.ceo_reputation ?? 0;
    const updatedCrisis: ActiveCrisis = {
        ...crisis,
        currentStage: crisisNowOver ? crisis.currentStage : nextStageIdx,
        stageStartedMonth: monthsPassed,
        resolved: crisisNowOver,
        resolvedByPlayer: success,
        ceoReputationHit: crisis.ceoReputationHit + Math.abs(Math.min(0, reputationHit)),
    };

    const emoji = CRISIS_EMOJIS[crisis.type];
    const notice = success
        ? `${emoji} CRISIS CONTAINED: ${CRISIS_LABELS[crisis.type]} resolved. "${choice.label}" worked.`
        : crisisNowOver
            ? `💥 CRISIS UNRESOLVED: ${CRISIS_LABELS[crisis.type]} has reached maximum severity after failed intervention.`
            : `${emoji} CRISIS ESCALATED: "${choice.label}" failed. ${CRISIS_LABELS[crisis.type]} moves to Stage ${nextStageIdx + 1}.`;

    return { success, crisisResolved: crisisNowOver, effects, notice, updatedCrisis };
}

// ─── CURRENT STAGE HELPER ─────────────────────────────────────────────────────
export function getCurrentCrisisStage(crisis: ActiveCrisis): CrisisStage | null {
    const chain = CRISIS_CHAINS[crisis.type];
    return chain?.[crisis.currentStage] ?? null;
}

export function getCrisisStageCount(type: CrisisType): number {
    return CRISIS_CHAINS[type]?.length ?? 1;
}

// ─── CEO REPUTATION LABEL ────────────────────────────────────────────────────
export function getCeoReputationLabel(rep: number): { grade: string; label: string; color: string } {
    if (rep >= 90) return { grade: "A+", label: "Visionary", color: "text-emerald-600" };
    if (rep >= 80) return { grade: "A",  label: "Respected", color: "text-emerald-500" };
    if (rep >= 70) return { grade: "B+", label: "Trusted",   color: "text-blue-500" };
    if (rep >= 60) return { grade: "B",  label: "Competent", color: "text-blue-400" };
    if (rep >= 50) return { grade: "C",  label: "Scrutinized", color: "text-amber-500" };
    if (rep >= 35) return { grade: "D",  label: "Under Fire",  color: "text-orange-500" };
    return             { grade: "F",  label: "In Crisis",   color: "text-rose-600" };
}
// ─── LAWSUITS ─────────────────────────────────────────────────────────────

export const LAWSUIT_TEMPLATES: Record<import("../types/database.types").LawsuitType, any> = {
    wrongful_termination: {
        title: "Wrongful Termination Claim",
        description: "A former employee claims they were fired without cause and is seeking damages for lost wages and emotional distress.",
        demand_amount: 150000,
        settlement_offer: 75000,
        legal_fees_per_month: 5000,
        months_to_trial: 6,
        win_probability: 0.65,
    },
    ip_infringement: {
        title: "Patent Infringement Lawsuit",
        description: "A competitor alleges that your core technology infringes on their existing patents. This could be an existential threat.",
        demand_amount: 1000000,
        settlement_offer: 400000,
        legal_fees_per_month: 25000,
        months_to_trial: 12,
        win_probability: 0.40,
    },
    regulatory_fine: {
        title: "SEC Regulatory Investigation",
        description: "Regulators have flagged discrepancies in your public disclosures. A significant fine is proposed.",
        demand_amount: 500000,
        settlement_offer: 300000,
        legal_fees_per_month: 15000,
        months_to_trial: 8,
        win_probability: 0.50,
    },
    class_action: {
        title: "Consumer Class Action",
        description: "A group of users has filed a class-action suit alleging misleading marketing and data mishandling.",
        demand_amount: 2500000,
        settlement_offer: 1200000,
        legal_fees_per_month: 40000,
        months_to_trial: 18,
        win_probability: 0.45,
    }
};

export function spawnLawsuit(type: import("../types/database.types").LawsuitType, month: number): import("../types/database.types").Lawsuit {
    const template = LAWSUIT_TEMPLATES[type];
    return {
        id: `suit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type,
        title: template.title,
        description: template.description,
        filed_month: month,
        demand_amount: template.demand_amount,
        settlement_offer: template.settlement_offer,
        legal_fees_per_month: template.legal_fees_per_month,
        months_to_trial: template.months_to_trial,
        win_probability: template.win_probability,
    };
}
