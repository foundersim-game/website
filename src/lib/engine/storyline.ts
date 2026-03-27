/**
 * storyline.ts — The Sam vs Chad 3-Act Rivalry Arc + Onboarding Tutorial
 *
 * Flow:
 *  Month 1  → 5-step tutorial sequence (fires before game starts)
 *  Month 2  → Chad's first taunt (existing)
 *  Month 3  → Sam rebuts + runway advice
 *  Month 4  → Sam on team building
 *  Month 5  → Chad guaranteed + Sam on growth (Month 6)
 *  Month 6  → Sam on fundraising signals
 *  Month 7  → Sam's island farewell (ONCE)
 *  Month 7+ → Sam only via "Consult Sam" button
 *  Ongoing  → Chad guaranteed months 5, 8, 11, 14, 17 + reactive triggers
 */

import { Competitor } from "./competitors";
import { formatMoney } from "../utils";

export type StorylineDialog = {
    character: "sam" | "chad";
    title: string;
    message: string;
    buttonText?: string;
    trigger: string;
    /** If true, show Reply-to-Chad choice buttons */
    hasChoices?: boolean;
    choiceALabel?: string;
    choiceADescription?: string;
    choiceAActionId?: string;
    choiceBLabel?: string;
    choiceBDescription?: string;
    choiceBActionId?: string;
};

export type StorylineState = {
    seenTriggers: string[];
    chadMustRespondNext: boolean;
    lastChadMonth: number;
    act: 1 | 2 | 3;
    tutorialStep: number;    // 0-4 during tutorial, -1 when done
    samGoneToIsland: boolean;
    hasConsultedSam?: boolean;
};

// ─── Month 1 Tutorial Sequence ────────────────────────────────────────────────

export const TUTORIAL_STEPS: StorylineDialog[] = [
    {
        character: "sam",
        trigger: "tutorial_0",
        title: "👋 HEY, I'M SAM",
        message: "I've backed over a hundred startups. Most failed — not because of bad ideas, but because their founders didn't know which numbers to watch.\n\nI'm here so you don't make those same mistakes. Think of me as your co-pilot.",
        buttonText: "NEXT →",
    },
    {
        character: "sam",
        trigger: "tutorial_1",
        title: "📊 YOUR DASHBOARD",
        message: "This top panel is your cockpit. Watch these every month:\n\n• 💰 Cash & Runway — your lifeline. Zero cash = game over.\n• 🔥 Burnout — if this hits 100, you crash.\n• 📈 PMF Score — how well you fit the market.\n• 👥 Users — your proof of traction.",
        buttonText: "NEXT →",
    },
    {
        character: "sam",
        trigger: "tutorial_2",
        title: "⚡ TAKING ACTIONS",
        message: "Each month you get Focus Hours — your most valuable resource. Spend them on one action.\n\nTap the ⚡ action button at the bottom to see your options. Product, growth, or team — choose carefully.",
        buttonText: "GOT IT, I'LL TRY →",
    },
    {
        character: "sam",
        trigger: "tutorial_3",
        title: "⚔️ CHECK YOUR RIVALS",
        message: "See the Rivals tab? Open it now. There's a startup called Chadly — that's your competition.\n\nWatch his users and valuation. When Chad shows up in person, you'll know what you're dealing with.",
        buttonText: "GOT IT, I'LL CHECK →",
    },
    {
        character: "sam",
        trigger: "tutorial_4",
        title: "🏁 ONE MORE THING",
        message: "You win by outlasting — not by spending the most.\n\nGrow users, hit PMF, raise smart, stay alive. I'll check in every month for the next 6 months.\n\nAnd Chad's going to show up. Don't panic when he does.",
        buttonText: "LET'S BUILD 🚀",
    },
];

// ─── Sam's Monthly Guidance (Months 3–6) ─────────────────────────────────────

export const SAM_MONTHLY: Record<number, StorylineDialog> = {
    3: {
        character: "sam",
        trigger: "sam_month_3",
        title: "🔥 CHECK YOUR RUNWAY",
        message: "Three months in. First thing I want you to check — your runway number.\n\nIf you have less than 6 months of cash left and you're not profitable yet, that's a five-alarm fire. Don't wait — reduce burn or start fundraising conversations now.\n\nCash is oxygen. Never let it surprise you.",
        buttonText: "ON IT",
    },
    4: {
        character: "sam",
        trigger: "sam_month_4",
        title: "👥 WHEN TO HIRE",
        message: "You're probably thinking about hiring. Good instinct — but don't rush it.\n\nHire when a specific bottleneck is costing you users or revenue. Not before. Every salary is a commitment you can't easily unwind.\n\nThe best first hires are people who remove constraints, not people who look good on a pitch deck.",
        buttonText: "SMART HIRING",
    },
    6: {
        character: "sam",
        trigger: "sam_month_6",
        title: "💸 READING INVESTOR SIGNALS",
        message: "If investors are starting to notice you, they'll send signals — intro requests, questions about metrics, casual coffee chats. Don't dismiss these.\n\nBut don't let fundraising distract you from building either. One founder focused entirely on pitching while their PMF score collapsed.\n\nFundraise in parallel, not in place of building.",
        buttonText: "BALANCING ACT",
    },
};

// ─── Sam's Island Farewell (Month 7) ─────────────────────────────────────────

export const SAM_ISLAND_FAREWELL: StorylineDialog = {
    character: "sam",
    trigger: "sam_island_farewell",
    title: "🏝️ TIME FOR MY ISLAND",
    message: "Six months in — and look at you. You know your runway, you've seen Chad's move, and you're still standing.\n\nI think you're ready to sail solo.\n\nI earned a place on my private island doing exactly what I've been teaching you. I'm going there now. But if things get serious — tap 'Consult Sam' and I'll swim back.",
    buttonText: "ENJOY THE ISLAND, SAM 🌊",
};

// ─── Sam's Consult Return (called from Consult Sam button) ───────────────────

export function getSamConsultDialog(
    advice: { title: string; message: string; buttonText: string },
    hasConsultedSam?: boolean
): StorylineDialog {
    const intro = hasConsultedSam
        ? ""
        : "Pulled me off the beach for this? Fine — I was getting a bit too tan anyway.\n\n";

    return {
        character: "sam",
        trigger: `consult_${Date.now()}`,
        title: advice.title,
        message: `${intro}${advice.message}`,
        buttonText: advice.buttonText || "THANKS, SAM 🏄",
    };
}

// ─── Sam's Post-Chad Dialog Pool ─────────────────────────────────────────────

export const SAM_DIALOGS: Record<string, StorylineDialog> = {
    act1_chad_rebuttal: {
        character: "sam",
        trigger: "act1_chad_rebuttal",
        title: "IGNORE THE NOISE 🎧",
        message: "Chad loves to talk. That's all it is. Every company I've backed that Chad-types wrote off went on to raise on their own terms. Don't react. Execute.",
        buttonText: "STAYING FOCUSED",
    },
    fundraise_rebuttal: {
        character: "sam",
        trigger: "fundraise_rebuttal",
        title: "IGNORE HIS ROUND SIZE 💡",
        message: "Big raises don't equal big results. More money means more pressure, more dilution, more runway to miss the point. Focus on your unit economics — those will outlast any headline funding number.",
        buttonText: "UNDERSTOOD",
    },
    users_rebuttal: {
        character: "sam",
        trigger: "users_rebuttal",
        title: "QUALITY > QUANTITY 📊",
        message: "Chadly has users. You have the right users. Know the difference. One churned-mass user base crashes; one retained power base compounds. Build for retention, not vanity.",
        buttonText: "CHARTING COURSE",
    },
    burnout_support: {
        character: "sam",
        trigger: "burnout_support",
        title: "THE FOUNDER'S TRAP ⚠️",
        message: "Chad's playing you. He wants you burned out and distracted. The best thing you can do right now is rest. A clear mind makes better decisions than any hustle.",
        buttonText: "TAKING A BREATH",
    },
    valuation_milestone: {
        character: "sam",
        trigger: "valuation_milestone",
        title: "THIS IS REAL 🚀",
        message: "Look at what you've built. That valuation isn't a number on a slide — it's a reflection of real users, real revenue, and real decisions. Chad can't buy that.",
        buttonText: "JUST GETTING STARTED",
    },
    act3_support: {
        character: "sam",
        trigger: "act3_support",
        title: "THE FINAL STRETCH 🏁",
        message: "You and Chadly are the last ones standing. Everything you've built leads to this moment. Stay disciplined, stay focused. The market will crown the right winner.",
        buttonText: "LET'S FINISH THIS",
    },
    victory: {
        character: "sam",
        trigger: "victory",
        title: "YOU DID IT. 🏆",
        message: "Chadly's valuation is in your rearview mirror. You proved that sustainable beats flashy every single time. I'm proud of what you built — and so should you be.",
        buttonText: "THANKS, SAM 🙏",
    },
};

// ─── Chad's Dialog Pool ───────────────────────────────────────────────────────

export function getChadDialog(
    trigger: string,
    chadly: Competitor | undefined,
    playerMetrics: { valuation: number; users: number; cash: number; runway: number }
): StorylineDialog {
    const cv = chadly?.valuation ?? 2000000;
    const cu = chadly?.users ?? 500;

    const dialogs: Record<string, StorylineDialog> = {
        act1_intro: {
            character: "chad",
            trigger: "act1_intro",
            title: "OH, YOU LAUNCHED 😏",
            message: `I heard you finally shipped. Cute. My team at Chadly has ${cu.toLocaleString()} users already and we're just warming up. Enjoy your "launch day" while it lasts.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Stay disciplined",
            choiceADescription: "Focus on product quality and retention fundamentals",
            choiceAActionId: "build_mvp_features",
            choiceBLabel: "CHAD'S WAY: Match the energy",
            choiceBDescription: "Go aggressive on growth — higher risk, higher ceiling",
            choiceBActionId: "organic_social",
        },
        taunt_fundraise: {
            character: "chad",
            trigger: "taunt_fundraise",
            title: "CUTE ROUND 💸",
            message: `You raised? Nice. Chadly is sitting at ${formatMoney(cv)} valuation. Your entire raise is our monthly headcount bill. Keep grinding, though — it's entertaining.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Focus on fundamentals",
            choiceADescription: "Strengthen unit economics instead of chasing headlines",
            choiceAActionId: "refactor_codebase",
            choiceBLabel: "CHAD'S WAY: Double down on growth",
            choiceBDescription: "Spend it all on aggressive marketing this month",
            choiceBActionId: "paid_acquisition",
        },
        taunt_users: {
            character: "chad",
            trigger: "taunt_users",
            title: "YOUR USERS vs MINE 📈",
            message: `You hit a milestone? Chadly crossed ${cu.toLocaleString()} users this month alone. I don't think in milestones — I think in multiples.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Double down on retention",
            choiceADescription: "Build for LTV and stickiness, not vanity numbers",
            choiceAActionId: "add_core_features",
            choiceBLabel: "CHAD'S WAY: Go for volume",
            choiceBDescription: "Run a full paid acquisition push to close the gap",
            choiceBActionId: "paid_acquisition",
        },
        taunt_burnout: {
            character: "chad",
            trigger: "taunt_burnout",
            title: "BREAKING DOWN? 😈",
            message: `Burned out already? I sleep 4 hours and manage ${cu.toLocaleString()} users. Founders who need "rest" don't survive Series B. See you on the other side — if you make it.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Rest and recover",
            choiceADescription: "Recharge — a clear mind is your best competitive advantage",
            choiceAActionId: "rest_day",
            choiceBLabel: "CHAD'S WAY: Push through anyway",
            choiceBDescription: "Ignore the burnout and keep shipping — risky but fast",
            choiceBActionId: "personal_hackathon",
        },
        taunt_generic_a: {
            character: "chad",
            trigger: "taunt_generic_a",
            title: "STILL HERE? 🙄",
            message: `Chadly is at ${formatMoney(cv)} and accelerating. You're still debugging your MVP. The market doesn't care about your journey — it cares about results.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Build smarter",
            choiceADescription: "Focus on technical debt and architecture for long-term scale",
            choiceAActionId: "refactor_codebase",
            choiceBLabel: "CHAD'S WAY: Outspend him",
            choiceBDescription: "Match Chadly's aggression with a bold marketing push",
            choiceBActionId: "paid_acquisition",
        },
        taunt_generic_b: {
            character: "chad",
            trigger: "taunt_generic_b",
            title: "CATCHING UP YET? 📊",
            message: `My investors asked about you in our last board meeting. I told them you weren't a threat. That was months ago. Nothing's changed. Chadly: ${formatMoney(cv)}.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Stay the course",
            choiceADescription: "Trust your unit economics and long-term moat",
            choiceAActionId: "analyze_competitor",
            choiceBLabel: "CHAD'S WAY: Raise a bigger round",
            choiceBDescription: "Pitch investors aggressively to close the valuation gap",
            choiceBActionId: "investor_dinner",
        },
        taunt_act3: {
            character: "chad",
            trigger: "taunt_act3",
            title: "THE ENDGAME 🏁",
            message: `Chadly is at ${formatMoney(cv)}. You're at ${formatMoney(playerMetrics.valuation)}. I'm going to hit $1B before you finish reading this. The race is over.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Execute the playbook",
            choiceADescription: "Stay disciplined — great companies aren't built in a sprint",
            choiceAActionId: "architecture_design",
            choiceBLabel: "CHAD'S WAY: All in",
            choiceBDescription: "Take a massive swing — everything on growth this month",
            choiceBActionId: "pr_campaign",
        },
        chad_loses: {
            character: "chad",
            trigger: "chad_loses",
            title: "...FINE. 😤",
            message: `You beat Chadly. I don't know how. You weren't supposed to win. I'll be back — Core doesn't die, it pivots. Watch your back.`,
            buttonText: "SEE YOU AROUND, CHAD",
        },
        player_overtakes_chad: {
            character: "chad",
            trigger: "player_overtakes_chad",
            title: "GLITCH IN THE MATRIX? 📉",
            message: `Wait, my dashboard says you're worth more than Chadly? That's definitely a rounding error in your favor. Don't get comfortable — the king is just reloading.`,
            buttonText: "READY WHEN YOU ARE",
        },
    };

    return dialogs[trigger] ?? dialogs.taunt_generic_a;
}

// ─── Main Trigger Engine ──────────────────────────────────────────────────────

export function getStorylineDialog(
    month: number,
    metrics: { valuation: number; users: number; cash: number; runway: number; burnout: number },
    competitors: Competitor[],
    state: StorylineState,
    justFundraised: boolean
): StorylineDialog | null {

    const chadly = competitors.find(c => c.id === "chadly");
    const seen = new Set(state.seenTriggers);
    const act = month >= 15 ? 3 : month >= 4 ? 2 : 1;

    // ── Tutorial steps fire first (Month 1 only) ──
    if (month === 1 && state.tutorialStep >= 0 && state.tutorialStep < TUTORIAL_STEPS.length) {
        return TUTORIAL_STEPS[state.tutorialStep];
    }

    // ── Sam island farewell (Month 7, once) ──
    if (month === 7 && !seen.has("sam_island_farewell") && !state.samGoneToIsland) {
        return SAM_ISLAND_FAREWELL;
    }

    // ── Monthly guaranteed Sam guidance (Months 3, 4, 6) ──
    // Prioritize these over reactive rebuttals so they aren't skipped
    const samStillActive = month <= 6;
    if (samStillActive && SAM_MONTHLY[month] && !seen.has(SAM_MONTHLY[month].trigger)) {
        return SAM_MONTHLY[month];
    }

    // ── Sam responds to Chad exactly 1 month later (while still active) ──
    if (state.chadMustRespondNext && samStillActive) {
        const trigger = act === 1 ? "act1_chad_rebuttal"
            : justFundraised ? "fundraise_rebuttal"
            : metrics.burnout > 70 ? "burnout_support"
            : metrics.users > 1000 ? "users_rebuttal"
            : "valuation_milestone";
        return SAM_DIALOGS[trigger] ?? SAM_DIALOGS.act1_chad_rebuttal;
    }

    // ── Act 1: Chad intro at Month 2 ──
    if (month === 2 && !seen.has("act1_intro")) {
        return getChadDialog("act1_intro", chadly, metrics);
    }

    // ── Guaranteed Chad months: 5, 8, 11, 14, 17 ──
    const guaranteedMonths = [5, 8, 11, 14, 17];
    if (guaranteedMonths.includes(month) && month !== state.lastChadMonth) {
        if (act === 3) return getChadDialog("taunt_act3", chadly, metrics);
        const isMajor = month % 8 === 5;
        return getChadDialog(isMajor ? "taunt_generic_b" : "taunt_generic_a", chadly, metrics);
    }

    // ── Reactive: player just fundraised ──
    if (justFundraised && month !== state.lastChadMonth) {
        return getChadDialog("taunt_fundraise", chadly, metrics);
    }

    // ── Reactive: burnout > 72% ──
    if (metrics.burnout > 72 && !seen.has("taunt_burnout")) {
        return getChadDialog("taunt_burnout", chadly, metrics);
    }

    // ── Reactive: player overtakes Chad ──
    if (chadly && metrics.valuation > chadly.valuation && !seen.has("player_overtakes_chad") && month < 15) {
        return getChadDialog("player_overtakes_chad", chadly, metrics);
    }

    // ── Endgame victory/loss (Act 3) ──
    if (act === 3) {
        if (chadly && metrics.valuation > chadly.valuation && !seen.has("chad_loses")) {
            return getChadDialog("chad_loses", chadly, metrics);
        }
        if (!seen.has("act3_support") && !seen.has("taunt_act3")) {
            return SAM_DIALOGS.act3_support;
        }
    }

    return null;
}
