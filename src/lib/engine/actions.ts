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
    label: string;
    emoji: string;
    category: ActionCategory;
    tier: ActionTier;
    energyCost: number;          // focus hours (Tier 1 only)
    baseEffects: StatEffect;
    description: string;         // short descriptor for UI
    impact: string;              // "+3 INT, +$200" shown in card
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
        label: "Read a Book",
        emoji: "📚",
        category: "intelligence",
        tier: "immediate",
        energyCost: 5,
        description: "Deepen knowledge through reading",
        impact: "+2–4 Intelligence",
        cooldownMonthly: 3,
        baseEffects: { intelligence: 3, founder_burnout: 3 },
        situationalBoosts: { high_burnout: 0.5 }, // bad idea when already burned out
        situationalNote: { high_burnout: "⚠️ Too tired to absorb — reduced impact" },
    },
    {
        id: "take_online_course",
        label: "Take Online Course",
        emoji: "🎓",
        category: "intelligence",
        tier: "immediate",
        energyCost: 15,
        description: "Structured skill development",
        impact: "+5 INT, costs $200",
        cooldownMonthly: 1,
        baseEffects: { intelligence: 5, cash: -200 },
    },
    {
        id: "attend_conference",
        label: "Attend Conference",
        emoji: "🎪",
        category: "intelligence",
        tier: "immediate",
        energyCost: 20,
        description: "Industry conference — learn + network",
        impact: "+4 INT, +5 Net, −$1500",
        cooldownMonthly: 1,
        baseEffects: { intelligence: 4, networking: 5, cash: -1500 },
        situationalBoosts: { fundraising: 1.5 },
        situationalNote: { fundraising: "🔥 1.5× — great time to network with VCs" },
    },
    {
        id: "analyze_competitor",
        label: "Analyze Competitor",
        emoji: "🔎",
        category: "intelligence",
        tier: "immediate",
        energyCost: 8,
        description: "Study competitor products & strategy",
        impact: "+2 INT, +2 Marketing",
        cooldownMonthly: 2,
        baseEffects: { intelligence: 2, marketing_skill: 2 },
    },
    {
        id: "listen_podcast",
        label: "Listen to Podcast",
        emoji: "🎙️",
        category: "intelligence",
        tier: "immediate",
        energyCost: 2,
        description: "Passive learning during commute",
        impact: "+1 INT",
        cooldownMonthly: 6,
        baseEffects: { intelligence: 1 },
    },

    // ── Technical Skill
    {
        id: "personal_hackathon",
        label: "Personal Hackathon",
        emoji: "💻",
        category: "technical",
        tier: "immediate",
        energyCost: 20,
        description: "Intense coding sprint — best when team is small",
        impact: "+12 Tech (personal only)",
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
        label: "Review Codebase",
        emoji: "🔍",
        category: "technical",
        tier: "immediate",
        energyCost: 10,
        description: "Deep dive into code quality",
        impact: "+6 Tech",
        cooldownMonthly: 2,
        baseEffects: {  technical_skill: 6  },
        situationalBoosts: { high_debt: 1.8 },
        situationalNote: { high_debt: "🔥 1.8× — critical tech debt needing your attention" },
    },
    {
        id: "fix_bug_personally",
        label: "Fix Bug Personally",
        emoji: "🛠️",
        category: "technical",
        tier: "immediate",
        energyCost: 12,
        description: "Roll up your sleeves",
        impact: "+8 Tech",
        cooldownMonthly: 3,
        baseEffects: { technical_skill: 8 },
    },
    {
        id: "architecture_design",
        label: "Architecture Planning",
        emoji: "📐",
        category: "technical",
        tier: "immediate",
        energyCost: 8,
        description: "Design system for scale",
        impact: "+8 Tech, +2 Int",
        cooldownMonthly: 1,
        baseEffects: {  technical_skill: 8, intelligence: 2  },
    },
    {
        id: "write_tests",
        label: "Write Test Suite",
        emoji: "🧪",
        category: "technical",
        tier: "immediate",
        energyCost: 10,
        description: "Improve code reliability",
        impact: "+6 Tech",
        cooldownMonthly: 2,
        baseEffects: {  technical_skill: 6  },
    },

    // ── Leadership
    {
        id: "team_1on1s",
        label: "Run Team 1:1s",
        emoji: "👥",
        category: "leadership",
        tier: "immediate",
        energyCost: 8,
        description: "Individual check-ins with each team member",
        impact: "+6 Lead, −3 Burnout",
        cooldownMonthly: 3,
        baseEffects: {  leadership: 6, founder_burnout: -3  },
        situationalBoosts: { low_morale: 2.5 },
        situationalNote: { low_morale: "🚨 2.5× — morale crisis, these 1:1s are critical" },
    },
    {
        id: "company_allhands",
        label: "Company All-Hands",
        emoji: "🎤",
        category: "leadership",
        tier: "immediate",
        energyCost: 5,
        description: "Align the full team on vision",
        impact: "+5 Lead",
        cooldownMonthly: 2,
        baseEffects: {  leadership: 5  },
    },
    {
        id: "set_okrs",
        label: "Set Team OKRs",
        emoji: "📋",
        category: "leadership",
        tier: "immediate",
        energyCost: 10,
        description: "Align team on quarterly goals",
        impact: "+6 Lead, +2 Int",
        cooldownMonthly: 1,
        baseEffects: {  leadership: 6, intelligence: 2  },
    },
    {
        id: "public_speaking",
        label: "Public Speaking",
        emoji: "🎤",
        category: "leadership",
        tier: "immediate",
        energyCost: 8,
        description: "Build executive presence",
        impact: "+4 Lead, +3 Reputation",
        cooldownMonthly: 1,
        baseEffects: { leadership: 4, reputation: 3 },
    },
    {
        id: "team_offsite",
        label: "Team Offsite",
        emoji: "🏕️",
        category: "leadership",
        tier: "immediate",
        energyCost: 6,
        description: "Bond the team outside the office",
        impact: "+10 Lead, −10 Burnout, −}000",
        cooldownMonthly: 1,
        baseEffects: {  leadership: 10, founder_burnout: -10, cash: -3000  },
    },

    // ── Networking
    {
        id: "founder_coffees",
        label: "Founder Coffee Chats",
        emoji: "☕",
        category: "networking",
        tier: "immediate",
        energyCost: 3,
        description: "Peer learning with other founders",
        impact: "+4 Networking",
        cooldownMonthly: 5,
        baseEffects: { networking: 4 },
        situationalBoosts: { fundraising: 2.0 },
        situationalNote: { fundraising: "🔥 2× — warm intros from founders are gold during a raise" },
    },
    {
        id: "post_on_social",
        label: "Post Thought Leadership",
        emoji: "🐦",
        category: "networking",
        tier: "immediate",
        energyCost: 1,
        description: "Share insights on LinkedIn / Twitter",
        impact: "+2 Net, +1 Mkt",
        cooldownMonthly: 8,
        baseEffects: {  networking: 2, marketing_skill: 1  },
    },
    {
        id: "speak_at_meetup",
        label: "Speak at Meetup",
        emoji: "📢",
        category: "networking",
        tier: "immediate",
        energyCost: 8,
        description: "Local startup community",
        impact: "+4 Net, +3 Rep",
        cooldownMonthly: 2,
        baseEffects: { networking: 4, reputation: 3 },
    },
    {
        id: "investor_dinner",
        label: "Investor Dinner",
        emoji: "🍽️",
        category: "networking",
        tier: "immediate",
        energyCost: 4,
        description: "Build warm VC relationships",
        impact: "+6 Net, −$500",
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
        label: "Startup Summit Trip",
        emoji: "🌐",
        category: "networking",
        tier: "immediate",
        energyCost: 12,
        description: "Major annual ecosystem event",
        impact: "+8 Net, −$2000",
        cooldownMonthly: 1,
        baseEffects: { networking: 8, intelligence: 2, cash: -2000 },
    },



    // ── Health
    {
        id: "go_for_run",
        label: "Go for a Run",
        emoji: "🏃",
        category: "health",
        tier: "immediate",
        energyCost: 1,
        description: "Clear your head",
        impact: "+5 Health, −8 Burnout",
        cooldownMonthly: 12,
        baseEffects: { founder_health: 5, founder_burnout: -8 },
        situationalBoosts: { high_burnout: 2.0 },
        situationalNote: { high_burnout: "🔥 2× — you really need this right now" },
    },
    {
        id: "gym_session",
        label: "Gym Session",
        emoji: "🏋️",
        category: "health",
        tier: "immediate",
        energyCost: 2,
        description: "Physical training",
        impact: "+8 Health, −10 Burnout",
        cooldownMonthly: 10,
        baseEffects: { founder_health: 8, founder_burnout: -10 },
    },
    {
        id: "rest_day",
        label: "Take a Rest Day",
        emoji: "😴",
        category: "health",
        tier: "immediate",
        energyCost: 0,
        description: "Let your body recover",
        impact: "+5 Health, −15 Burnout",
        cooldownMonthly: 4,
        baseEffects: { founder_health: 5, founder_burnout: -15 },
        situationalBoosts: { high_burnout: 2.5 },
        situationalNote: { high_burnout: "🚨 2.5× — you're running on fumes" },
    },
    {
        id: "doctor_checkup",
        label: "Doctor Checkup",
        emoji: "🩺",
        category: "health",
        tier: "immediate",
        energyCost: 3,
        description: "Annual health screening",
        impact: "+Health event reveal",
        cooldownMonthly: 1,
        baseEffects: { founder_health: 10 },
    },

    // ── Burnout Recovery
    {
        id: "short_vacation",
        label: "Take a Short Vacation",
        emoji: "🏖️",
        category: "burnout",
        tier: "immediate",
        energyCost: 0,
        description: "2-3 days away completely offline",
        impact: "−30 Burnout (uses a month-queue slot)",
        cooldownMonthly: 1,
        baseEffects: { founder_burnout: -30, founder_health: 10 },
        situationalBoosts: { high_burnout: 1.5 },
    },
    {
        id: "meditation",
        label: "10-min Meditation",
        emoji: "🧘",
        category: "burnout",
        tier: "immediate",
        energyCost: 0.5,
        description: "Mindfulness practice",
        impact: "−8 Burnout",
        cooldownMonthly: 10,
        baseEffects: { founder_burnout: -8 },
    },
    {
        id: "do_something_fun",
        label: "Do Something Fun",
        emoji: "🎮",
        category: "burnout",
        tier: "immediate",
        energyCost: 1,
        description: "Play games, watch a film, relax",
        impact: "−10 Burnout",
        cooldownMonthly: 8,
        baseEffects: { founder_burnout: -10 },
    },
    {
        id: "journaling",
        label: "Journaling",
        emoji: "📓",
        category: "burnout",
        tier: "immediate",
        energyCost: 0.5,
        description: "Process thoughts and emotions",
        impact: "−5 Burnout, +1 INT",
        cooldownMonthly: 10,
        baseEffects: { founder_burnout: -5, intelligence: 1 },
    },
    {
        id: "delegate_tasks",
        label: "Delegate to Team",
        emoji: "🤝",
        category: "burnout",
        tier: "immediate",
        energyCost: 2,
        description: "Let go and trust the team",
        impact: "−15 Burnout, +Leadership",
        cooldownMonthly: 3,
        baseEffects: { founder_burnout: -15, leadership: 2 },
        situationalBoosts: { large_team: 1.5 },
        situationalNote: { large_team: "🔥 1.5× — you have a bigger team to delegate to" },
    },
    // ── Pre-existing Product & Marketing Actions ported to Immediate ──
    {
        id: "build_mvp_features",
        label: "Build Features",
        emoji: "⚡",
        category: "product",
        tier: "immediate",
        energyCost: 30,
        description: "Intense feature development sprint",
        impact: "+3 Quality, +2 Innovation, -1k Burn",
        cooldownMonthly: 3,
        baseEffects: { product_quality: 3, technical_debt: 8, innovation: 2, cash: -1000 },
        situationalBoosts: { small_team: 1.5 },
        situationalNote: { small_team: "🔥 1.5× — high impact for small founder-led teams" },
    },
    {
        id: "add_core_features",
        label: "Add Core Features",
        emoji: "🔧",
        category: "product",
        tier: "immediate",
        energyCost: 40,
        description: "Scale your product offering for new markets",
        impact: "+6 Quality, +Users",
        cooldownMonthly: 2,
        baseEffects: { product_quality: 6, technical_debt: 5, users: 30, cash: -2000 },
    },
    {
        id: "refactor_codebase",
        label: "Refactor Code",
        emoji: "🔄",
        category: "product",
        tier: "immediate",
        energyCost: 35,
        description: "Large-scale code cleanup to improve velocity",
        impact: "-8 Debt, +5 Rel",
        cooldownMonthly: 2,
        baseEffects: { technical_debt: -8, reliability: 5 },
        situationalBoosts: { high_debt: 1.5 },
    },
    {
        id: "fix_bugs",
        label: "Fix Bugs",
        emoji: "🪲",
        category: "product",
        tier: "immediate",
        energyCost: 20,
        description: "Squash stability-blocking bugs",
        impact: "+6 Rel, -3 Debt",
        cooldownMonthly: 4,
        baseEffects: { reliability: 6, technical_debt: -3 },
    },
    {
        id: "optimize_cloud",
        label: "Optimize Infra",
        emoji: "☁️",
        category: "product",
        tier: "immediate",
        energyCost: 25,
        description: "Modernize cloud resources to reduce future costs",
        impact: "-$500 Cash, +5 Rel, -4 Debt",
        cooldownMonthly: 1,
        baseEffects: { cash: -500, reliability: 5, technical_debt: -4 },
    },
    // Marketing
    {
        id: "organic_social",
        label: "Organic Social",
        emoji: "📱",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 15,
        description: "Viral content and community engagement",
        impact: "+60 Users",
        cooldownMonthly: 5,
        baseEffects: {  users: 60  },
    },
    {
        id: "content_marketing",
        label: "Content Marketing",
        emoji: "📝",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 20,
        description: "High-value blog posts and tutorials",
        impact: "+1 Brand, +1 PMF",
        cooldownMonthly: 4,
        baseEffects: {  brand_awareness: 1  , pmf_score: 1 },
    },
    {
        id: "seo_growth",
        label: "SEO Growth",
        emoji: "🔍",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 25,
        description: "Technical SEO and keyword optimization",
        impact: "+1 Brand, +30 Users, +1 PMF",
        cooldownMonthly: 2,
        baseEffects: {  brand_awareness: 1, users: 30  , pmf_score: 1 },
    },
    {
        id: "paid_acquisition",
        label: "Paid Acquisition",
        emoji: "💸",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 10,
        description: "Direct response advertising ($2,000)",
        impact: "+250 Users",
        cooldownMonthly: 5,
        baseEffects: {  cash: -2000, users: 250  },
    },
    {
        id: "pr_campaign",
        label: "PR Campaign",
        emoji: "📣",
        category: "marketing_skill",
        tier: "immediate",
        energyCost: 40,
        description: "Major press launch and outreach ($5,000)",
        impact: "+6 Brand, +3 Rep, +1 PMF",
        cooldownMonthly: 1,
        baseEffects: {  cash: -5000, brand_awareness: 6, reputation: 3  , pmf_score: 1 },
        situationalBoosts: { fundraising: 1.8 },
        situationalNote: { fundraising: "🔥 1.8× — investors love seeing you in the news" },
    },
    // ── Founder Marketing Training
    {
        id: "marketing_course",
        label: "Marketing Masterclass",
        emoji: "🎓",
        category: "founder_marketing",
        tier: "immediate",
        energyCost: 18,
        description: "Study growth loops & positioning",
        impact: "+8 Marketing",
        cooldownMonthly: 1,
        baseEffects: { marketing_skill: 8, founder_burnout: 10 },
    },
    {
        id: "copywriting_session",
        label: "Copywriting Session",
        emoji: "✍️",
        category: "founder_marketing",
        tier: "immediate",
        energyCost: 10,
        description: "Practice writing landing page copy",
        impact: "+4 Marketing",
        cooldownMonthly: 3,
        baseEffects: { marketing_skill: 4 },
    },
];

// ─── Tier 2: Month-Bound Actions (existing product/marketing/hiring/funding) ──
// These are handled by the existing simulation.ts processMonth()
// They appear in the month queue and apply on "Advance to Month"

// ─── Tier 3: Ongoing Programs ─────────────────────────────────────────────────

export interface OngoingProgramDef {
    id: string;
    label: string;
    emoji: string;
    category: ActionCategory;
    description: string;
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
        label: "SEO Content Machine",
        emoji: "📝",
        category: "marketing_skill",
        category_ui: "Marketing",
        description: "Regular blog posts & SEO — compounds every month",
        monthlyCost: 500,
        monthlyEnergy: 4,
        baseMonthlyEffect: {  brand_awareness: 3, users: 100, marketing_skill: 3  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "social_media_presence",
        label: "Social Media Presence",
        emoji: "📱",
        category: "marketing_skill",
        category_ui: "Marketing",
        description: "Consistent posting on LinkedIn/Twitter",
        monthlyCost: 150,
        monthlyEnergy: 3,
        baseMonthlyEffect: {  brand_awareness: 2, networking: 1, marketing_skill: 2  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.8 }],
    },
    {
        id: "email_newsletter",
        label: "Email Newsletter",
        emoji: "📧",
        category: "marketing_skill",
        category_ui: "Marketing",
        description: "Weekly newsletter to subscribers — builds trust",
        monthlyCost: 100,
        monthlyEnergy: 2,
        baseMonthlyEffect: {  brand_awareness: 2, users: 50, marketing_skill: 2  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.5 }],
    },
    {
        id: "podcast_circuit",
        label: "Podcast Appearances",
        emoji: "🎙️",
        category: "marketing_skill",
        category_ui: "Marketing",
        description: "Monthly guest spots on podcasts",
        monthlyCost: 250,
        monthlyEnergy: 5,
        baseMonthlyEffect: {  brand_awareness: 4, networking: 2, reputation: 1, marketing_skill: 3  },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.5 }],
    },

    // ── Culture Programs
    {
        id: "weekly_1on1s",
        label: "Weekly 1:1s with Team",
        emoji: "👥",
        category: "culture",
        category_ui: "Culture",
        description: "Regular individual check-ins every week",
        monthlyCost: 0,
        monthlyEnergy: 4,
        baseMonthlyEffect: { team_morale: 4, leadership: 1, culture_score: 2 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.6 }],
    },
    {
        id: "learning_dev_budget",
        label: "Learning & Dev Budget",
        emoji: "📚",
        category: "culture",
        category_ui: "Culture",
        description: "Employee training budget — $300/head/month",
        monthlyCost: -1, // calculated dynamically based on headcount
        monthlyEnergy: 1,
        baseMonthlyEffect: { team_morale: 2, culture_score: 3 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.5 }],
    },
    {
        id: "team_social_events",
        label: "Team Social Events",
        emoji: "🍕",
        category: "culture",
        category_ui: "Culture",
        description: "Lunches, game nights, team activities",
        monthlyCost: 1000,
        monthlyEnergy: 2,
        baseMonthlyEffect: { team_morale: 6, culture_score: 4 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.1 }, { atMonth: 6, multiplier: 1.3 }],
    },
    {
        id: "okr_system",
        label: "OKR System",
        emoji: "🎯",
        category: "culture",
        category_ui: "Culture",
        description: "Quarterly objectives keep everyone aligned",
        monthlyCost: 0,
        monthlyEnergy: 2,
        baseMonthlyEffect: { team_morale: 2, culture_score: 5 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 1.8 }],
    },

    // ── Founder Programs
    {
        id: "gym_routine",
        label: "Gym Routine",
        emoji: "🏋️",
        category: "health",
        category_ui: "Founder",
        description: "Consistent exercise habit — streak matters",
        monthlyCost: 100,
        monthlyEnergy: 6,
        baseMonthlyEffect: { founder_health: 8, founder_burnout: -10 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 1.8 }],
    },
    {
        id: "daily_meditation",
        label: "Daily Meditation",
        emoji: "🧘",
        category: "burnout",
        category_ui: "Founder",
        description: "10-min morning meditation — compounding calm",
        monthlyCost: 0,
        monthlyEnergy: 2,
        baseMonthlyEffect: { founder_burnout: -8 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "reading_habit",
        label: "Regular Reading",
        emoji: "📖",
        category: "intelligence",
        category_ui: "Founder",
        description: "1 book per month — slow burn intelligence",
        monthlyCost: 50,
        monthlyEnergy: 4,
        baseMonthlyEffect: { intelligence: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "executive_coach",
        label: "Executive Coach",
        emoji: "👨‍💼",
        category: "leadership",
        category_ui: "Founder",
        description: "Monthly sessions with a leadership coach",
        monthlyCost: 2000,
        monthlyEnergy: 3,
        baseMonthlyEffect: { leadership: 3, intelligence: 1, founder_burnout: -5 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.6 }],
    },
    {
        id: "online_mba_modules",
        label: "Online MBA Modules",
        emoji: "🎓",
        category: "intelligence",
        category_ui: "Founder",
        description: "Business strategy & finance learning",
        monthlyCost: 500,
        monthlyEnergy: 8,
        baseMonthlyEffect: { intelligence: 2, leadership: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.5 }],
    },

    // ── Product Programs
    {
        id: "user_interview_program",
        label: "User Interview Sessions",
        emoji: "🗣️",
        category: "marketing_skill",
        category_ui: "Product",
        description: "Regular customer discovery — sharpens PMF",
        monthlyCost: 0,
        monthlyEnergy: 8,
        baseMonthlyEffect: { pmf_score: 2, marketing_skill: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.5 }, { atMonth: 6, multiplier: 2.0 }],
    },
    {
        id: "bug_bash_sprints",
        label: "Bug Bash Sprints",
        emoji: "🐛",
        category: "technical",
        category_ui: "Product",
        description: "Dedicated monthly bug fixing sessions",
        monthlyCost: 0,
        monthlyEnergy: 4,
        baseMonthlyEffect: { technical_debt: -8, reliability: 3 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.6 }],
    },
    {
        id: "weekly_ab_tests",
        label: "Weekly A/B Tests",
        emoji: "🧪",
        category: "marketing_skill",
        category_ui: "Product",
        description: "Continuous conversion optimisation",
        monthlyCost: 0,
        monthlyEnergy: 6,
        baseMonthlyEffect: { brand_awareness: 1, users: 30 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.4 }, { atMonth: 6, multiplier: 1.8 }],
    },

    // ── Investor Relations
    {
        id: "investor_updates",
        label: "Monthly Investor Updates",
        emoji: "📊",
        category: "networking",
        category_ui: "Funding",
        description: "Keep investors informed — builds trust & terms",
        monthlyCost: 0,
        monthlyEnergy: 8,
        baseMonthlyEffect: { reputation: 1 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.3 }, { atMonth: 6, multiplier: 1.5 }],
    },
    {
        id: "angel_syndicate",
        label: "Angel Syndicate Membership",
        emoji: "🤝",
        category: "networking",
        category_ui: "Funding",
        description: "Monthly warm introductions to investors",
        monthlyCost: 200,
        monthlyEnergy: 4,
        baseMonthlyEffect: { networking: 2 },
        streakMultipliers: [{ atMonth: 3, multiplier: 1.2 }, { atMonth: 6, multiplier: 1.4 }],
    },
];

// ─── Helper: Get action by ID ─────────────────────────────────────────────────
export function getActionDef(id: string): ActionDef | undefined {
    return IMMEDIATE_ACTIONS.find(a => a.id === id);
}

export function getOngoingProgramDef(id: string): OngoingProgramDef | undefined {
    return ONGOING_PROGRAMS.find(p => p.id === id);
}

// ─── Helper: Focus energy pool ────────────────────────────────────────────────
export function calcFocusHours(burnout: number, employees: any[]): number {
    const hasCofounder = false; // TODO: cofounder check
    const hasCOO = employees.some((e: any) => e.role === "COO");
    const hasEA = employees.some((e: any) => e.role === "EA");
    const base = 120; // Reduced focus hours for difficulty
    const burnoutPenalty = burnout * 1.2;
    const cofounterBonus = hasCofounder ? 50 : 0;
    const cooBonus = hasCOO ? 40 : 0;
    const eaBonus = hasEA ? 30 : 0;
    return Math.max(40, Math.round(base - burnoutPenalty + cofounterBonus + cooBonus + eaBonus));
}
