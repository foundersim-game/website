/**
 * actions.ts — Full Action Catalogue for Founder Sim
 * Defines every action with its tier, energy cost, base effects, and metadata.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionTier = "immediate" | "month_bound" | "ongoing";

export type ActionCategory =
    | "intelligence" | "technical" | "leadership" | "networking"
    | "marketing_skill" | "founder_marketing" | "health" | "burnout"
    | "product" | "growth" | "hiring" | "funding" | "culture";

export type StatEffect = Partial<{
    intelligence: number;
    technical_skill: number;
    leadership: number;
    networking: number;
    marketing_skill: number;
    reputation: number;
    founder_health: number;
    founder_burnout: number; // negative = reduces burnout
    product_quality: number;
    technical_debt: number;  // negative = reduces debt
    reliability: number;
    team_morale: number;
    brand_awareness: number;
    users: number;
    revenue: number;
    cash: number; // negative = costs money
    pmf_score: number;
    culture_score: number;
    innovation: number;
    leads: number; // for B2B/SLG leads increments
}>;

export type SituationalContext =
    | "fundraising"      // actively in a funding round
    | "low_morale"       // team morale < 40
    | "high_burnout"     // founder burnout > 70
    | "high_debt"        // tech debt > 60
    | "small_team"       // employees < 5
    | "large_team"       // employees >= 10
    | "low_cash"         // runway < 3 months
    | "high_growth"      // growth_rate > 0.15
    | "low_pmf"          // pmf < 40
    | "none";

export interface ActionDef {
    id: string;
    labelKey?: string;
    label?: string;
    emoji: string;
    category: ActionCategory;
    tier: ActionTier;
    energyCost: number;          // focus hours (Tier 1 only)
    baseEffects: StatEffect;
    descKey?: string;
    description?: string;         // short descriptor for UI
    cooldownMonthly?: number;    // max times effective per month (Tier 1 only)
    situationalBoosts?: Partial<Record<SituationalContext, number>>; // multipliers
    situationalNote?: Partial<Record<SituationalContext, string>>;   // UI hint
    requiresMinStat?: Partial<Record<string, number>>;  // prerequisites
    requiresMaxStat?: Partial<Record<string, number>>;  // "more impactful when low"
    // Ongoing-specific
    monthlyCost?: number;        // $ cost per month (Tier 3)
    compoundsAt?: [number, number, number]; // months [3, 6] → [1.2, 1.5] multipliers
}

// ─── Tier 1: Immediate Actions ────────────────────────────────────────────────

export const IMMEDIATE_ACTIONS: ActionDef[] = [

    // ── Intelligence
    {
        id: "read_book",
        labelKey: "actions.read_book.label",
        emoji: "📚",
        category: "intelligence",
        tier: "immediate",
        energyCost: 5,
        descKey: "actions.read_book.description",
        cooldownMonthly: 3,
        baseEffects: { intelligence: 3, founder_burnout: 3 },
        situationalBoosts: { high_burnout: 0.5 }, // bad idea when already burned out
        situationalNote: { high_burnout: "⚠️ Too tired to absorb — reduced impact" },
    },
    {
        id: "take_online_course",
        labelKey: "actions.take_online_course.label",
        emoji: "🎓",
        category: "intelligence",
        tier: "immediate",
        energyCost: 15,
        descKey: "actions.take_online_course.description",
        cooldownMonthly: 1,
        baseEffects: { intelligence: 5, cash: -200 },
    },
    {
        id: "attend_conference",
        labelKey: "actions.attend_conference.label",
        emoji: "🎪",
        category: "intelligence",
        tier: "immediate",
        energyCost: 20,
        descKey: "actions.attend_conference.description",
        cooldownMonthly: 1,
        baseEffects: { intelligence: 4, networking: 5, cash: -1500 },
        situationalBoosts: { fundraising: 1.5 },
        situationalNote: { fundraising: "🔥 1.5× — great time to network with VCs" },
    },
    {
        id: "analyze_competitor",
        labelKey: "actions.analyze_competitor.label",
        emoji: "🔎",
        category: "intelligence",
        tier: "immediate",
        energyCost: 8,
        descKey: "actions.analyze_competitor.description",
        cooldownMonthly: 2,
        baseEffects: { intelligence: 2, marketing_skill: 2 },
    },
    {
        id: "listen_podcast",
        labelKey: "actions.listen_podcast.label",
        emoji: "🎙️",
        category: "intelligence",
        tier: "immediate",
        energyCost: 2,
        descKey: "actions.listen_podcast.description",
        cooldownMonthly: 6,
        baseEffects: { intelligence: 1 },
    },

    // ── Technical Skill
    {
        id: "personal_hackathon",
        labelKey: "actions.personal_hackathon.label",
        emoji: "💻",
        category: "technical",
        tier: "immediate",
        energyCost: 20,
        descKey: "actions.personal_hackathon.description",
        cooldownMonthly: 1,
        baseEffects: {  technical_skill: 12, founder_burnout: 10  },
        situationalBoosts: { small_team: 1.6, large_team: 0.3 },
        situationalNote: {
            small_team: "🔥 1.6× — your code matters most right now",
            large_team: "⬇️ 0.3× — your team outpaces your coding now",
        },
    },
    {
        id: "review_codebase",
        labelKey: "actions.review_codebase.label",
        emoji: "🔍",
        category: "technical",
        tier: "immediate",
        energyCost: 10,
        descKey: "actions.review_codebase.description",
        cooldownMonthly: 2,
        baseEffects: {  technical_skill: 6  },
        situationalBoosts: { high_debt: 1.8 },
        situationalNote: { high_debt: "🔥 1.8× — critical tech debt needing your attention" },
    },
    {
        id: "fix_bug_personally",
        labelKey: "actions.fix_bug_personally.label",
        emoji: "🛠️",
        category: "technical",
        tier: "immediate",
        energyCost: 12,
        descKey: "actions.fix_bug_personally.description",
        cooldownMonthly: 3,
        baseEffects: { technical_skill: 8 },
    },
    {
        id: "architecture_design",
        labelKey: "actions.architecture_design.label",
        emoji: "📐",
        category: "technical",
        tier: "immediate",
        energyCost: 8,
        descKey: "actions.architecture_design.description",
        cooldownMonthly: 1,
        baseEffects: {  technical_skill: 8, intelligence: 2  },
    },
    {
        id: "write_tests",
        labelKey: "actions.write_tests.label",
        emoji: "🧪",
        category: "technical",
        tier: "immediate",
        energyCost: 10,
        descKey: "actions.write_tests.description",
        cooldownMonthly: 2,
        baseEffects: {  technical_skill: 6  },
    },

    // ── Leadership
    {
        id: "team_1on1s",
        labelKey: "actions.team_1on1s.label",
        emoji: "👥",
        category: "leadership",
        tier: "immediate",
        energyCost: 8,
        descKey: "actions.team_1on1s.description",
        cooldownMonthly: 3,
        baseEffects: {  leadership: 6, founder_burnout: -3  },
        situationalBoosts: { low_morale: 2.5 },
        situationalNote: { low_morale: "🚨 2.5× — morale crisis, these 1:1s are critical" },
    },
    {
        id: "company_allhands",
        labelKey: "actions.company_allhands.label",
        emoji: "🎤",
        category: "leadership",
        tier: "immediate",
        energyCost: 5,
        descKey: "actions.company_allhands.description",
        cooldownMonthly: 2,
        baseEffects: {  leadership: 5  },
    },
    {
        id: "set_okrs",
        labelKey: "actions.set_okrs.label",
        emoji: "📋",
        category: "leadership",
        tier: "immediate",
        energyCost: 10,
        descKey: "actions.set_okrs.description",
        cooldownMonthly: 1,
        baseEffects: {  leadership: 6, intelligence: 2  },
    },
    {
        id: "public_speaking",
        labelKey: "actions.public_speaking.label",
        emoji: "🎤",
        category: "leadership",
        tier: "immediate",
        energyCost: 8,
        descKey: "actions.public_speaking.description",
        cooldownMonthly: 1,
        baseEffects: { leadership: 4, reputation: 3 },
    },
    {
        id: "team_offsite",
        labelKey: "actions.team_offsite.label",
        emoji: "🏕️",
        category: "leadership",
        tier: "immediate",
        energyCost: 6,
        descKey: "actions.team_offsite.description",
        cooldownMonthly: 1,
        baseEffects: {  leadership: 10, founder_burnout: -10, cash: -3000  },
    },

    // ── Networking
    {
        id: "founder_coffees",
        labelKey: "actions.founder_coffees.label",
        emoji: "☕",
        category: "networking",
        tier: "immediate",
        energyCost: 3,
        descKey: "actions.founder_coffees.description",
        cooldownMonthly: 5,
        baseEffects: { networking: 4 },
        situationalBoosts: { fundraising: 2.0 },
        situationalNote: { fundraising: "🔥 2× — warm intros from founders are gold during a raise" },
    },
    {
        id: "post_on_social",
        labelKey: "actions.post_on_social.label",
        emoji: "🐦",
        category: "networking",
        tier: "immediate",
        energyCost: 1,
        descKey: "actions.post_on_social.description",
        cooldownMonthly: 8,
        baseEffects: {  networking: 2, marketing_skill: 1  },
    },
    {
        id: "speak_at_meetup",
        labelKey: "actions.speak_at_meetup.label",
        emoji: "📢",
        category: "networking",
        tier: "immediate",
        energyCost: 8,
        descKey: "actions.speak_at_meetup.description",
        cooldownMonthly: 2,
        baseEffects: { networking: 4, reputation: 3 },
    },
    {
        id: "investor_dinner",
        labelKey: "actions.investor_dinner.label",
        emoji: "🍽️",
        category: "networking",
        tier: "immediate",
        energyCost: 4,
        descKey: "actions.investor_dinner.description",
        cooldownMonthly: 2,
        baseEffects: { networking: 6, cash: -500 },
        situationalBoosts: { fundraising: 2.0, low_cash: 0.4 },
        situationalNote: {
            fundraising: "🔥 2× — these relationships matter most when raising",
            low_cash: "⚠️ 0.4× — spending money on dinners when almost broke?",
        },
    },
    {
        id: "startup_summit",
        labelKey: "actions.startup_summit.label",
        emoji: "🌐",
        category: "networking",
        tier: "immediate",
        energyCost: 12,
        descKey: "actions.startup_summit.description",
        cooldownMonthly: 1,
        baseEffects: { networking: 8, intelligence: 2, cash: -2000 },
    },



    // ── Health
    {
        id: "go_for_run",
        labelKey: "actions.go_for_run.label",
        emoji: "🏃",
        category: "health",
        tier: "immediate",
        energyCost: 1,
        descKey: "actions.go_for_run.description",
        cooldownMonthly: 12,
        baseEffects: { founder_health: 5, founder_burnout: -8 },
        situationalBoosts: { high_burnout: 2.0 },
        situationalNote: { high_burnout: "🔥 2× — you really need this right now" },
    },
    {
        id: "gym_session",
        labelKey: "actions.gym_session.label",
        emoji: "🏋️",
        category: "health",
        tier: "immediate",
        energyCost: 2,
        descKey: "actions.gym_session.description",
        cooldownMonthly: 10,
        baseEffects: { founder_health: 8, founder_burnout: -10 },
    },
    {
        id: "rest_day",
        labelKey: "actions.rest_day.label",
        emoji: "😴",
        category: "health",
        tier: "immediate",
        energyCost: 4,
        descKey: "actions.rest_day.description",
        cooldownMonthly: 4,
        baseEffects: { founder_health: 5, founder_burnout: -15 },
        situationalBoosts: { high_burnout: 2.5 },
        situationalNote: { high_burnout: "🚨 2.5× — you're running on fumes" },
    },
    {
        id: "doctor_checkup",
        labelKey: "actions.doctor_checkup.label",
        emoji: "🩺",
        category: "health",
        tier: "immediate",
        energyCost: 3,
        descKey: "actions.doctor_checkup.description",
        cooldownMonthly: 1,
        baseEffects: { founder_health: 10 },
    },

    // ── Burnout Recovery
    {
        id: "short_vacation",
        labelKey: "actions.short_vacation.label",
        emoji: "🏖️",
        category: "burnout",
        tier: "immediate",
        energyCost: 15,
        descKey: "actions.short_vacation.description",
        cooldownMonthly: 1,
        baseEffects: { founder_burnout: -30, founder_health: 10 },
        situationalBoosts: { high_burnout: 1.5 },
    },
    {
        id: "meditation",
        labelKey: "actions.meditation.label",
        emoji: "🧘",
        category: "burnout",
        tier: "immediate",
        energyCost: 0.5,
        descKey: "actions.meditation.description",
        cooldownMonthly: 10,
        baseEffects: { founder_burnout: -8 },
    },
    {
        id: "do_something_fun",
        labelKey: "actions.do_something_fun.label",
        emoji: "🎮",
        category: "burnout",
        tier: "immediate",
        energyCost: 3,
        descKey: "actions.do_something_fun.description",
        cooldownMonthly: 8,
        baseEffects: { founder_burnout: -10 },
    },
    {
        id: "journaling",
        labelKey: "actions.journaling.label",
        emoji: "📓",
        category: "burnout",
        tier: "immediate",
        energyCost: 0.5,
        descKey: "actions.journaling.description",
        cooldownMonthly: 10,
        baseEffects: { founder_burnout: -5, intelligence: 1 },
    },
    {
        id: "delegate_tasks",
        labelKey: "actions.delegate_tasks.label",
        emoji: "🤝",
        category: "burnout",
        tier: "immediate",
        energyCost: 2,
        descKey: "actions.delegate_tasks.description",
        cooldownMonthly: 3,
        baseEffects: { founder_burnout: -15, leadership: 2 },
        situationalBoosts: { large_team: 1.5 },
        situationalNote: { large_team: "🔥 1.5× — you have a bigger team to delegate to" },
    },
    // ── Pre-existing Product & Marketing Actions ported to Immediate ──
    {
        id: "build_mvp_features",
        labelKey: "actions.build_mvp_features.label",
        emoji: "⚡",
        category: "product",
        tier: "immediate",
        energyCost: 30,
        descKey: "actions.build_mvp_features.description",
        cooldownMonthly: 3,
        baseEffects: { product_quality: 3, technical_debt: 4, innovation: 2, cash: -1000 },
        situationalBoosts: { small_team: 1.5 },
        situationalNote: { small_team: "🔥 1.5× — high impact for small founder-led teams" },
    },
    {
        id: "add_core_features",
        labelKey: "actions.add_core_features.label",
        emoji: "🔧",
        category: "product",
        tier: "immediate",
        energyCost: 40,
        descKey: "actions.add_core_features.description",
        cooldownMonthly: 2,
        baseEffects: { product_quality: 6, technical_debt: 3, users: 30, cash: -2000 },
    },
    {
        id: "refactor_codebase",
        labelKey: "actions.refactor_codebase.label",
        emoji: "🔄",
        category: "product",
        tier: "immediate",
        energyCost: 35,
        descKey: "actions.refactor_codebase.description",
        cooldownMonthly: 2,
        baseEffects: { technical_debt: -8, reliability: 5 },
        situationalBoosts: { high_debt: 1.5 },
    },
    {
        id: "fix_bugs",
        labelKey: "actions.fix_bugs.label",
        emoji: "🪲",
        category: "product",
        tier: "immediate",
        energyCost: 20,
        descKey: "actions.fix_bugs.description",
        cooldownMonthly: 4,
        baseEffects: { reliability: 6, technical_debt: -3 },
    },
    {
        id: "optimize_cloud",
        labelKey: "actions.optimize_cloud.label",
        emoji: "☁️",
        category: "product",
        tier: "immediate",
        energyCost: 25,
        descKey: "actions.optimize_cloud.description",
        cooldownMonthly: 1,
        baseEffects: { cash: -500, reliability: 5, technical_debt: -4 },
    },
    // Marketing
    {
        id: "organic_social",
        labelKey: "actions.organic_social.label",
        emoji: "📱",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 15,
        descKey: "actions.organic_social.description",
        cooldownMonthly: 5,
        baseEffects: {  users: 60  },
    },
    {
        id: "content_marketing",
        labelKey: "actions.content_marketing.label",
        emoji: "📝",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 20,
        descKey: "actions.content_marketing.description",
        cooldownMonthly: 4,
        baseEffects: {  cash: -200, brand_awareness: 1  , pmf_score: 1 },
    },
    {
        id: "seo_growth",
        labelKey: "actions.seo_growth.label",
        emoji: "🔍",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 25,
        descKey: "actions.seo_growth.description",
        cooldownMonthly: 2,
        baseEffects: {  cash: -300, brand_awareness: 1, users: 30  , pmf_score: 1 },
    },
    {
        id: "paid_acquisition",
        labelKey: "actions.paid_acquisition.label",
        emoji: "💸",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 10,
        descKey: "actions.paid_acquisition.description",
        cooldownMonthly: 5,
        baseEffects: {  cash: -2000, users: 250  },
    },
    {
        id: "pr_campaign",
        labelKey: "actions.pr_campaign.label",
        emoji: "📣",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 40,
        descKey: "actions.pr_campaign.description",
        cooldownMonthly: 1,
        baseEffects: {  cash: -5000, brand_awareness: 6, reputation: 3  , pmf_score: 1 },
        situationalBoosts: { fundraising: 1.8 },
        situationalNote: { fundraising: "🔥 1.8× — investors love seeing you in the news" },
    },
    // ── Founder Marketing Training
    {
        id: "marketing_course",
        labelKey: "actions.marketing_course.label",
        emoji: "🎓",
        category: "founder_marketing",
        tier: "immediate",
        energyCost: 18,
        descKey: "actions.marketing_course.description",
        cooldownMonthly: 1,
        baseEffects: { marketing_skill: 8, founder_burnout: 10 },
    },
    {
        id: "copywriting_session",
        labelKey: "actions.copywriting_session.label",
        emoji: "✍️",
        category: "founder_marketing",
        tier: "immediate",
        energyCost: 10,
        descKey: "actions.copywriting_session.description",
        cooldownMonthly: 3,
        baseEffects: { marketing_skill: 4 },
    },
    // ── Board Pressure Auto-Actions
    {
        id: "board_pressure_shield_team",
        labelKey: "actions.board_pressure_shield_team.label",
        emoji: "🛡️",
        category: "leadership",
        tier: "immediate",
        energyCost: 0,
        descKey: "actions.board_pressure_shield_team.description",
        baseEffects: { founder_health: -20, founder_burnout: 20 },
    },
    {
        id: "board_pressure_pressure_team",
        labelKey: "actions.board_pressure_pressure_team.label",
        emoji: "⚡",
        category: "leadership",
        tier: "immediate",
        energyCost: 0,
        descKey: "actions.board_pressure_pressure_team.description",
        baseEffects: { team_morale: -25 },
    },
];

// ─── Tier 2: Month-Bound Actions (existing product/marketing/hiring/funding) ──
// These are handled by the existing simulation.ts processMonth()
// They appear in the month queue and apply on "Advance to Month"

// ─── Tier 3: Ongoing Programs ─────────────────────────────────────────────────

export interface OngoingProgramDef {
    id: string;
    labelKey?: string;
    label?: string;
    emoji: string;
    category: ActionCategory;
    descKey?: string;
    description?: string;
    monthlyCost: number;        // $ per month (0 if free)
    monthlyEnergy: number;      // focus hours committed per month
    baseMonthlyEffect: StatEffect;
    streakMultipliers: { atMonth: number; multiplier: number }[];
    category_ui?: string;       // "Marketing" | "Culture" | "Founder" | "Product"
}

export const ONGOING_PROGRAMS: OngoingProgramDef[] = [

    // ── Marketing Programs
    {
        id: "seo_content_machine",
        labelKey: "actions.seo_content_machine.label",
        emoji: "📝",
        category: "marketing_skill",
        category_ui: "Marketing",
        descKey: "actions.seo_content_machine.description",
        monthlyCost: 500,
        monthlyEnergy: 4,
        baseMonthlyEffect: {  brand_awareness: 3, users: 100, marketing_skill: 3  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "social_media_presence",
        labelKey: "actions.social_media_presence.label",
        emoji: "📱",
        category: "marketing_skill",
        category_ui: "Marketing",
        descKey: "actions.social_media_presence.description",
        monthlyCost: 150,
        monthlyEnergy: 3,
        baseMonthlyEffect: {  brand_awareness: 2, networking: 1, marketing_skill: 2  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.8 }],
    },
    {
        id: "email_newsletter",
        labelKey: "actions.email_newsletter.label",
        emoji: "📧",
        category: "marketing_skill",
        category_ui: "Marketing",
        descKey: "actions.email_newsletter.description",
        monthlyCost: 100,
        monthlyEnergy: 2,
        baseMonthlyEffect: {  brand_awareness: 2, users: 50, marketing_skill: 2  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.5 }],
    },
    {
        id: "podcast_circuit",
        labelKey: "actions.podcast_circuit.label",
        emoji: "🎙️",
        category: "marketing_skill",
        category_ui: "Marketing",
        descKey: "actions.podcast_circuit.description",
        monthlyCost: 250,
        monthlyEnergy: 5,
        baseMonthlyEffect: {  brand_awareness: 4, networking: 2, reputation: 1, marketing_skill: 3  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.5 }],
    },

    // ── Culture Programs
    {
        id: "weekly_1on1s",
        labelKey: "actions.weekly_1on1s.label",
        emoji: "👥",
        category: "culture",
        category_ui: "Culture",
        descKey: "actions.weekly_1on1s.description",
        monthlyCost: 0,
        monthlyEnergy: 8,
        baseMonthlyEffect: { team_morale: 4, leadership: 1, culture_score: 2 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.6 }],
    },
    {
        id: "learning_dev_budget",
        labelKey: "actions.learning_dev_budget.label",
        emoji: "📚",
        category: "culture",
        category_ui: "Culture",
        descKey: "actions.learning_dev_budget.description",
        monthlyCost: -1, // calculated dynamically based on headcount
        monthlyEnergy: 4,
        baseMonthlyEffect: { team_morale: 2, culture_score: 3 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.5 }],
    },
    {
        id: "team_social_events",
        labelKey: "actions.team_social_events.label",
        emoji: "🍕",
        category: "culture",
        category_ui: "Culture",
        descKey: "actions.team_social_events.description",
        monthlyCost: 1000,
        monthlyEnergy: 6,
        baseMonthlyEffect: { team_morale: 6, culture_score: 4 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.1 }, { atMonth: 6, multiplier: 1.3 }],
    },
    {
        id: "okr_system",
        labelKey: "actions.okr_system.label",
        emoji: "🎯",
        category: "culture",
        category_ui: "Culture",
        descKey: "actions.okr_system.description",
        monthlyCost: 0,
        monthlyEnergy: 5,
        baseMonthlyEffect: { team_morale: 2, culture_score: 5 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 1.8 }],
    },

    // ── Founder Programs
    {
        id: "gym_routine",
        labelKey: "actions.gym_routine.label",
        emoji: "🏋️",
        category: "health",
        category_ui: "Founder",
        descKey: "actions.gym_routine.description",
        monthlyCost: 100,
        monthlyEnergy: 6,
        baseMonthlyEffect: { founder_health: 8, founder_burnout: -10 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 1.8 }],
    },
    {
        id: "founder_health_routine",
        labelKey: "actions.founder_health_routine.label",
        emoji: "🥗",
        category: "health",
        category_ui: "Founder",
        descKey: "actions.founder_health_routine.description",
        monthlyCost: 200,
        monthlyEnergy: 8,
        baseMonthlyEffect: {  founder_health: 4, founder_burnout: -2  },
        streakMultipliers: [{ atMonth: 2, multiplier: 1.5 }],
    },
    {
        id: "daily_meditation",
        labelKey: "actions.daily_meditation.label",
        emoji: "🧘",
        category: "burnout",
        category_ui: "Founder",
        descKey: "actions.daily_meditation.description",
        monthlyCost: 0,
        monthlyEnergy: 2,
        baseMonthlyEffect: { founder_burnout: -8 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "reading_habit",
        labelKey: "actions.reading_habit.label",
        emoji: "📖",
        category: "intelligence",
        category_ui: "Founder",
        descKey: "actions.reading_habit.description",
        monthlyCost: 50,
        monthlyEnergy: 4,
        baseMonthlyEffect: { intelligence: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "executive_coach",
        labelKey: "actions.executive_coach.label",
        emoji: "👨‍💼",
        category: "leadership",
        category_ui: "Founder",
        descKey: "actions.executive_coach.description",
        monthlyCost: 2000,
        monthlyEnergy: 3,
        baseMonthlyEffect: { leadership: 3, intelligence: 1, founder_burnout: -5 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.6 }],
    },
    {
        id: "online_mba_modules",
        labelKey: "actions.online_mba_modules.label",
        emoji: "🎓",
        category: "intelligence",
        category_ui: "Founder",
        descKey: "actions.online_mba_modules.description",
        monthlyCost: 500,
        monthlyEnergy: 8,
        baseMonthlyEffect: { intelligence: 2, leadership: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.5 }],
    },

    // ── Product Programs
    {
        id: "user_interview_program",
        labelKey: "actions.user_interview_program.label",
        emoji: "🗣️",
        category: "marketing_skill",
        category_ui: "Product",
        descKey: "actions.user_interview_program.description",
        monthlyCost: 0,
        monthlyEnergy: 8,
        baseMonthlyEffect: { pmf_score: 2, marketing_skill: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "bug_bash_sprints",
        labelKey: "actions.bug_bash_sprints.label",
        emoji: "🐛",
        category: "technical",
        category_ui: "Product",
        descKey: "actions.bug_bash_sprints.description",
        monthlyCost: 0,
        monthlyEnergy: 4,
        baseMonthlyEffect: { technical_debt: -8, reliability: 3 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.6 }],
    },
    {
        id: "weekly_ab_tests",
        labelKey: "actions.weekly_ab_tests.label",
        emoji: "🧪",
        category: "marketing_skill",
        category_ui: "Product",
        descKey: "actions.weekly_ab_tests.description",
        monthlyCost: 0,
        monthlyEnergy: 6,
        baseMonthlyEffect: { brand_awareness: 1, users: 30 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 1.8 }],
    },

    // ── Investor Relations
    {
        id: "investor_updates",
        labelKey: "actions.investor_updates.label",
        emoji: "📊",
        category: "networking",
        category_ui: "Funding",
        descKey: "actions.investor_updates.description",
        monthlyCost: 0,
        monthlyEnergy: 8,
        baseMonthlyEffect: { reputation: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.5 }],
    },
    {
        id: "angel_syndicate",
        labelKey: "actions.angel_syndicate.label",
        emoji: "🤝",
        category: "networking",
        category_ui: "Funding",
        descKey: "actions.angel_syndicate.description",
        monthlyCost: 200,
        monthlyEnergy: 4,
        baseMonthlyEffect: { networking: 2 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.4 }],
    },
    {
        id: "fundraising_consultant",
        labelKey: "actions.fundraising_consultant.label",
        emoji: "💼",
        category: "funding",
        category_ui: "Funding",
        descKey: "actions.fundraising_consultant.description",
        monthlyCost: 15000,
        monthlyEnergy: 5,
        baseMonthlyEffect: { }, 
        streakMultipliers: [],
    },
    {
        id: "cfo_fundraising_roadshow",
        labelKey: "actions.cfo_fundraising_roadshow.label",
        emoji: "🏦",
        category: "funding",
        category_ui: "Funding",
        descKey: "actions.cfo_fundraising_roadshow.description",
        monthlyCost: 0,
        monthlyEnergy: 0,
        baseMonthlyEffect: { }, 
        streakMultipliers: [],
    }
];

// ─── Helper: Get action by ID ─────────────────────────────────────────────────
export function getActionDef(id: string): ActionDef | undefined {
    return IMMEDIATE_ACTIONS.find(a => a.id === id);
}

export function getOngoingProgramDef(id: string): OngoingProgramDef | undefined {
    return ONGOING_PROGRAMS.find(p => p.id === id);
}

// ─── Helper: Focus energy pool ────────────────────────────────────────────────
export function calcFocusHours(burnout: number, employees: any[], hasCofounder: boolean = false, hasCaffeine: boolean = false): number {
    const hasCOO = employees.some((e: any) => e.role?.toUpperCase() === "COO");
    const hasEA = employees.some((e: any) => e.role?.toUpperCase() === "EA");
    const base = 100; // Reduced focus hours for difficulty
    const safeBurnout = Math.max(0, burnout);
    const burnoutPenalty = safeBurnout * 1.2;
    const cofounderBonus = hasCofounder ? 50 : 0;
    const cooBonus = hasCOO ? 20 : 0;
    const eaBonus = hasEA ? 15 : 0;
    const caffeineBonus = hasCaffeine ? 100 : 0;
    return Math.max(40, Math.round(base - burnoutPenalty + cofounderBonus + cooBonus + eaBonus + caffeineBonus));
}
