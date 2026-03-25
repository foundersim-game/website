/**
 * storyline.ts — The Sam vs Chad 3-Act Rivalry Arc
 *
 * Determines which character dialog to show each month based on:
 * - Month number (guaranteed beats)
 * - Player metrics (reactive triggers)
 * - Chadly's LIVE stats (pulled from competitors state)
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
    /**  action id to execute via Dynamic Impact when Sam's way chosen */
    choiceAActionId?: string;
    choiceBLabel?: string;
    choiceBDescription?: string;
    /** action id to execute via Dynamic Impact when Chad's way chosen */
    choiceBActionId?: string;
};

// ─── Sam's Dialog Pool ───────────────────────────────────────────────────────

export const SAM_DIALOGS: Record<string, StorylineDialog> = {
    // Act 1
    act1_chad_rebuttal: {
        character: "sam",
        title: "IGNORE THE NOISE 🎧",
        message: "Chad loves to talk. That's all it is. Every company I've backed that Chad-types wrote off went on to raise on their own terms. Don't react. Execute.",
        buttonText: "STAYING FOCUSED",
        trigger: "act1_chad_rebuttal",
    },

    // Act 2
    fundraise_rebuttal: {
        character: "sam",
        title: "IGNORE HIS ROUND SIZE 💡",
        message: "Big raises don't equal big results. More money means more pressure, more dilution, more runway to miss the point. Focus on your unit economics — those will outlast any headline funding number.",
        buttonText: "UNDERSTOOD",
        trigger: "fundraise_rebuttal",
    },
    users_rebuttal: {
        character: "sam",
        title: "QUALITY > QUANTITY 📊",
        message: "Chadly has users. You have the right users. Know the difference. One churned-mass user base crashes; one retained power base compounds. Build for retention, not vanity.",
        buttonText: "CHARTING COURSE",
        trigger: "users_rebuttal",
    },
    burnout_support: {
        character: "sam",
        title: "THE FOUNDER'S TRAP ⚠️",
        message: "Chad's playing you. He wants you burned out and distracted. The best thing you can do right now is rest. A clear mind makes better decisions than any hustle.",
        buttonText: "TAKING A BREATH",
        trigger: "burnout_support",
    },

    // Milestone celebrations
    valuation_milestone: {
        character: "sam",
        title: "THIS IS REAL 🚀",
        message: "Look at what you've built. That valuation isn't a number on a slide — it's a reflection of real users, real revenue, and real decisions. Chad can't buy that.",
        buttonText: "JUST GETTING STARTED",
        trigger: "valuation_milestone",
    },

    // Act 3 — Endgame support
    act3_support: {
        character: "sam",
        title: "THE FINAL STRETCH 🏁",
        message: "You and Chadly are the last ones standing. Everything you've built leads to this moment. Stay disciplined, stay focused. The market will crown the right winner.",
        buttonText: "LET'S FINISH THIS",
        trigger: "act3_support",
    },

    // Victory
    victory: {
        character: "sam",
        title: "YOU DID IT. 🏆",
        message: "Chadly's valuation is in your rearview mirror. You proved that sustainable beats flashy every single time. I'm proud of what you built — and so should you be.",
        buttonText: "THANKS, SAM 🙏",
        trigger: "victory",
    },
};

// ─── Chad's Dialog Pool (uses Chadly live stats via template) ────────────────

export function getChadDialog(
    trigger: string,
    chadly: Competitor | undefined,
    playerMetrics: { valuation: number; users: number; cash: number; runway: number }
): StorylineDialog {
    const cv = chadly?.valuation ?? 2000000;
    const cu = chadly?.users ?? 500;

    const dialogs: Record<string, StorylineDialog> = {
        // Act 1
        act1_intro: {
            character: "chad",
            title: "OH, YOU LAUNCHED 😏",
            message: `I heard you finally shipped. Cute. My team at Chadly has ${cu.toLocaleString()} users already and we're just warming up. Enjoy your \"launch day\" while it lasts.`,
            buttonText: undefined,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Stay disciplined",
            choiceADescription: "Focus on product quality and retention fundamentals",
            choiceAActionId: "customer_discovery",
            choiceBLabel: "CHAD'S WAY: Match the energy",
            choiceBDescription: "Go aggressive on growth — higher risk, higher ceiling",
            choiceBActionId: "growth_hacking",
            trigger: "act1_intro",
        },

        // Act 2 — Fundraise taunt
        taunt_fundraise: {
            character: "chad",
            title: "CUTE ROUND 💸",
            message: `You raised? Nice. Chadly is sitting at ${formatMoney(cv)} valuation. Your entire raise is our monthly headcount bill. Keep grinding, though — it's entertaining.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Focus on fundamentals",
            choiceADescription: "Strengthen unit economics instead of chasing headlines",
            choiceAActionId: "refactor_code",
            choiceBLabel: "CHAD'S WAY: Double down on growth",
            choiceBDescription: "Spend it all on aggressive marketing this month",
            choiceBActionId: "blitz_marketing",
            trigger: "taunt_fundraise",
        },

        // Act 2 — Users taunt
        taunt_users: {
            character: "chad",
            title: "YOUR USERS vs MINE 📈",
            message: `You hit a milestone? Chadly crossed ${cu.toLocaleString()} users this month alone. I don't think in milestones — I think in multiples.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Double down on retention",
            choiceADescription: "Build for LTV and stickiness, not vanity numbers",
            choiceAActionId: "customer_success",
            choiceBLabel: "CHAD'S WAY: Go for volume",
            choiceBDescription: "Run a full paid acquisition push to close the gap",
            choiceBActionId: "paid_acquisition",
            trigger: "taunt_users",
        },

        // Act 2 — Burnout taunt
        taunt_burnout: {
            character: "chad",
            title: "BREAKING DOWN? 😈",
            message: `Burned out already? I sleep 4 hours and manage ${cu.toLocaleString()} users. Founders who need \"rest\" don't survive Series B. See you on the other side — if you make it.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Rest and recover",
            choiceADescription: "Recharge — a clear mind is your best competitive advantage",
            choiceAActionId: "rest_recharge",
            choiceBLabel: "CHAD'S WAY: Push through anyway",
            choiceBDescription: "Ignore the burnout and keep shipping — risky but fast",
            choiceBActionId: "crunch_sprint",
            trigger: "taunt_burnout",
        },

        // Act 2 — Guaranteed monthly taunts
        taunt_generic_a: {
            character: "chad",
            title: "STILL HERE? 🙄",
            message: `Chadly is at ${formatMoney(cv)} and accelerating. You're still debugging your MVP. The market doesn't care about your journey — it cares about results.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Build smarter",
            choiceADescription: "Focus on technical debt and architecture for long-term scale",
            choiceAActionId: "refactor_code",
            choiceBLabel: "CHAD'S WAY: Outspend him",
            choiceBDescription: "Match Chadly's aggression with a bold marketing push",
            choiceBActionId: "growth_hacking",
            trigger: "taunt_generic_a",
        },
        taunt_generic_b: {
            character: "chad",
            title: "CATCHING UP YET? 📊",
            message: `My investors asked about you in our last board meeting. I told them you weren't a threat. That was months ago. Nothing's changed. Chadly: ${formatMoney(cv)}.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Stay the course",
            choiceADescription: "Trust your unit economics and long-term moat",
            choiceAActionId: "pmf_research",
            choiceBLabel: "CHAD'S WAY: Raise a bigger round",
            choiceBDescription: "Pitch investors aggressively to close the valuation gap",
            choiceBActionId: "pitch_investors",
            trigger: "taunt_generic_b",
        },

        // Act 3 — Endgame
        taunt_act3: {
            character: "chad",
            title: "THE ENDGAME 🏁",
            message: `Chadly is at ${formatMoney(cv)}. You're at ${formatMoney(playerMetrics.valuation)}. I'm going to hit $1B before you finish reading this. The race is over.`,
            hasChoices: true,
            choiceALabel: "SAM'S WAY: Execute the playbook",
            choiceADescription: "Stay disciplined — great companies aren't built in a sprint",
            choiceAActionId: "scale_ops",
            choiceBLabel: "CHAD'S WAY: All in",
            choiceBDescription: "Take a massive swing — everything on growth this month",
            choiceBActionId: "viral_campaign",
            trigger: "taunt_act3",
        },

        // Chad loses
        chad_loses: {
            character: "chad",
            title: "...FINE. 😤",
            message: `You beat Chadly. I don't know how. You weren't supposed to win. I'll be back — Core doesn't die, it pivots. Watch your back.`,
            buttonText: "SEE YOU AROUND, CHAD",
            trigger: "chad_loses",
        },
    };

    return dialogs[trigger] ?? dialogs.taunt_generic_a;
}

// ─── Storyline Trigger Engine ────────────────────────────────────────────────

export type StorylineState = {
    seenTriggers: string[];
    chadMustRespondNext: boolean;    // Sam appears next month after Chad taunt
    lastChadMonth: number;
    act: 1 | 2 | 3;
};

export function getStorylineDialog(
    month: number,
    metrics: { valuation: number; users: number; cash: number; runway: number; burnout: number },
    competitors: Competitor[],
    state: StorylineState,
    justFundraised: boolean
): StorylineDialog | null {

    const chadly = competitors.find(c => c.id === "chadly");
    const seen = new Set(state.seenTriggers);

    // Determine act
    const act = month >= 15 ? 3 : month >= 4 ? 2 : 1;

    // ── Sam responds to Chad exactly 1 month later ──
    if (state.chadMustRespondNext) {
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
        // Alternate between generic taunts
        const isMajor = month % 8 === 5;
        return getChadDialog(isMajor ? "taunt_generic_b" : "taunt_generic_a", chadly, metrics);
    }

    // ── Reactive: player just fundraised ──
    if (justFundraised && month !== state.lastChadMonth) {
        return getChadDialog("taunt_fundraise", chadly, metrics);
    }

    // ── Reactive: burnout > 70% ──
    if (metrics.burnout > 72 && !seen.has("taunt_burnout")) {
        return getChadDialog("taunt_burnout", chadly, metrics);
    }

    // ── Reactive: Chadly overtook player in users ──
    if (chadly && chadly.users > metrics.users * 1.5 && !seen.has("taunt_users") && month > 3) {
        return getChadDialog("taunt_users", chadly, metrics);
    }

    // ── Endgame victory/loss ──
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
