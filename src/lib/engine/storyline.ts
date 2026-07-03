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
    character: "sam" | "chad" | "board";
    title: string;
    message: string;
    messageParams?: Record<string, string | number>;
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
        title: "storyline.storyline_tutorial_0_title",
        message: "storyline.storyline_tutorial_0_message",
        buttonText: "storyline.storyline_tutorial_0_buttonText",
    },
    {
        character: "sam",
        trigger: "tutorial_1",
        title: "storyline.storyline_tutorial_1_title",
        message: "storyline.storyline_tutorial_1_message",
        buttonText: "storyline.storyline_tutorial_1_buttonText",
    },
    {
        character: "sam",
        trigger: "tutorial_2",
        title: "storyline.storyline_tutorial_2_title",
        message: "storyline.storyline_tutorial_2_message",
        buttonText: "storyline.storyline_tutorial_2_buttonText",
    },
    {
        character: "sam",
        trigger: "tutorial_3",
        title: "storyline.storyline_tutorial_3_title",
        message: "storyline.storyline_tutorial_3_message",
        buttonText: "storyline.storyline_tutorial_3_buttonText",
    },
    {
        character: "sam",
        trigger: "tutorial_4",
        title: "storyline.storyline_tutorial_4_title",
        message: "storyline.storyline_tutorial_4_message",
        buttonText: "storyline.storyline_tutorial_4_buttonText",
    },
];

export const SAM_EXPERT_WELCOME: StorylineDialog = {
    character: "sam",
    trigger: "sam_expert_welcome",
    title: "storyline.storyline_sam_expert_welcome_title",
    message: "storyline.storyline_sam_expert_welcome_message",
    buttonText: "storyline.storyline_sam_expert_welcome_buttonText",
};

// ─── Sam's Monthly Guidance (Months 3–6) ─────────────────────────────────────

export const SAM_MONTHLY: Record<number, StorylineDialog> = {
    3: {
        character: "sam",
        trigger: "sam_month_3",
        title: "storyline.storyline_sam_month_3_title",
        message: "storyline.storyline_sam_month_3_message",
        buttonText: "storyline.storyline_sam_month_3_buttonText",
    },
    4: {
        character: "sam",
        trigger: "sam_month_4",
        title: "storyline.storyline_sam_month_4_title",
        message: "storyline.storyline_sam_month_4_message",
        buttonText: "storyline.storyline_sam_month_4_buttonText",
    },
    6: {
        character: "sam",
        trigger: "sam_month_6",
        title: "storyline.storyline_sam_month_6_title",
        message: "storyline.storyline_sam_month_6_message",
        buttonText: "storyline.storyline_sam_month_6_buttonText",
    },
};

// ─── Sam's Island Farewell (Month 7) ─────────────────────────────────────────

export const SAM_ISLAND_FAREWELL: StorylineDialog = {
    character: "sam",
    trigger: "sam_island_farewell",
    title: "storyline.storyline_sam_island_farewell_title",
    message: "storyline.storyline_sam_island_farewell_message",
    buttonText: "storyline.storyline_sam_island_farewell_buttonText",
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
        title: "storyline.storyline_act1_chad_rebuttal_title",
        message: "storyline.storyline_act1_chad_rebuttal_message",
        buttonText: "storyline.storyline_act1_chad_rebuttal_buttonText",
    },
    fundraise_rebuttal: {
        character: "sam",
        trigger: "fundraise_rebuttal",
        title: "storyline.storyline_fundraise_rebuttal_title",
        message: "storyline.storyline_fundraise_rebuttal_message",
        buttonText: "storyline.storyline_fundraise_rebuttal_buttonText",
    },
    users_rebuttal: {
        character: "sam",
        trigger: "users_rebuttal",
        title: "storyline.storyline_users_rebuttal_title",
        message: "storyline.storyline_users_rebuttal_message",
        buttonText: "storyline.storyline_users_rebuttal_buttonText",
    },
    burnout_support: {
        character: "sam",
        trigger: "burnout_support",
        title: "storyline.storyline_burnout_support_title",
        message: "storyline.storyline_burnout_support_message",
        buttonText: "storyline.storyline_burnout_support_buttonText",
    },
    valuation_milestone: {
        character: "sam",
        trigger: "valuation_milestone",
        title: "storyline.storyline_valuation_milestone_title",
        message: "storyline.storyline_valuation_milestone_message",
        buttonText: "storyline.storyline_valuation_milestone_buttonText",
    },
    act3_support: {
        character: "sam",
        trigger: "act3_support",
        title: "storyline.storyline_act3_support_title",
        message: "storyline.storyline_act3_support_message",
        buttonText: "storyline.storyline_act3_support_buttonText",
    },
    victory: {
        character: "sam",
        trigger: "victory",
        title: "storyline.storyline_victory_title",
        message: "storyline.storyline_victory_message",
        buttonText: "storyline.storyline_victory_buttonText",
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
            title: "storyline.storyline_act1_intro_title",
            message: "storyline.storyline_act1_intro_message",
            messageParams: { cu: cu.toLocaleString() },
            hasChoices: true,
            choiceALabel: "storyline.storyline_act1_intro_choiceALabel",
            choiceADescription: "storyline.storyline_act1_intro_choiceADescription",
            choiceAActionId: "build_mvp_features",
            choiceBLabel: "storyline.storyline_act1_intro_choiceBLabel",
            choiceBDescription: "storyline.storyline_act1_intro_choiceBDescription",
            choiceBActionId: "organic_social",
        },
        taunt_fundraise: {
            character: "chad",
            trigger: "taunt_fundraise",
            title: "storyline.storyline_taunt_fundraise_title",
            message: "storyline.storyline_taunt_fundraise_message",
            messageParams: { cv: formatMoney(cv) },
            hasChoices: true,
            choiceALabel: "storyline.storyline_taunt_fundraise_choiceALabel",
            choiceADescription: "storyline.storyline_taunt_fundraise_choiceADescription",
            choiceAActionId: "refactor_codebase",
            choiceBLabel: "storyline.storyline_taunt_fundraise_choiceBLabel",
            choiceBDescription: "storyline.storyline_taunt_fundraise_choiceBDescription",
            choiceBActionId: "paid_acquisition",
        },
        taunt_users: {
            character: "chad",
            trigger: "taunt_users",
            title: "storyline.storyline_taunt_users_title",
            message: "storyline.storyline_taunt_users_message",
            messageParams: { cu: cu.toLocaleString() },
            hasChoices: true,
            choiceALabel: "storyline.storyline_taunt_users_choiceALabel",
            choiceADescription: "storyline.storyline_taunt_users_choiceADescription",
            choiceAActionId: "add_core_features",
            choiceBLabel: "storyline.storyline_taunt_users_choiceBLabel",
            choiceBDescription: "storyline.storyline_taunt_users_choiceBDescription",
            choiceBActionId: "paid_acquisition",
        },
        taunt_burnout: {
            character: "chad",
            trigger: "taunt_burnout",
            title: "storyline.storyline_taunt_burnout_title",
            message: "storyline.storyline_taunt_burnout_message",
            messageParams: { cu: cu.toLocaleString() },
            hasChoices: true,
            choiceALabel: "storyline.storyline_taunt_burnout_choiceALabel",
            choiceADescription: "storyline.storyline_taunt_burnout_choiceADescription",
            choiceAActionId: "rest_day",
            choiceBLabel: "storyline.storyline_taunt_burnout_choiceBLabel",
            choiceBDescription: "storyline.storyline_taunt_burnout_choiceBDescription",
            choiceBActionId: "personal_hackathon",
        },
        taunt_generic_a: {
            character: "chad",
            trigger: "taunt_generic_a",
            title: "storyline.storyline_taunt_generic_a_title",
            message: "storyline.storyline_taunt_generic_a_message",
            messageParams: { cv: formatMoney(cv) },
            hasChoices: true,
            choiceALabel: "storyline.storyline_taunt_generic_a_choiceALabel",
            choiceADescription: "storyline.storyline_taunt_generic_a_choiceADescription",
            choiceAActionId: "refactor_codebase",
            choiceBLabel: "storyline.storyline_taunt_generic_a_choiceBLabel",
            choiceBDescription: "storyline.storyline_taunt_generic_a_choiceBDescription",
            choiceBActionId: "paid_acquisition",
        },
        taunt_generic_b: {
            character: "chad",
            trigger: "taunt_generic_b",
            title: "storyline.storyline_taunt_generic_b_title",
            message: "storyline.storyline_taunt_generic_b_message",
            messageParams: { cv: formatMoney(cv) },
            hasChoices: true,
            choiceALabel: "storyline.storyline_taunt_generic_b_choiceALabel",
            choiceADescription: "storyline.storyline_taunt_generic_b_choiceADescription",
            choiceAActionId: "analyze_competitor",
            choiceBLabel: "storyline.storyline_taunt_generic_b_choiceBLabel",
            choiceBDescription: "storyline.storyline_taunt_generic_b_choiceBDescription",
            choiceBActionId: "investor_dinner",
        },
        taunt_act3: {
            character: "chad",
            trigger: "taunt_act3",
            title: "storyline.storyline_taunt_act3_title",
            message: "storyline.storyline_taunt_act3_message",
            messageParams: { cv: formatMoney(cv), playerVal: formatMoney(playerMetrics.valuation) },
            hasChoices: true,
            choiceALabel: "storyline.storyline_taunt_act3_choiceALabel",
            choiceADescription: "storyline.storyline_taunt_act3_choiceADescription",
            choiceAActionId: "architecture_design",
            choiceBLabel: "storyline.storyline_taunt_act3_choiceBLabel",
            choiceBDescription: "storyline.storyline_taunt_act3_choiceBDescription",
            choiceBActionId: "pr_campaign",
        },
        chad_loses: {
            character: "chad",
            trigger: "chad_loses",
            title: "storyline.storyline_chad_loses_title",
            message: `You beat Chadly. I don't know how. You weren't supposed to win. I'll be back — Core doesn't die, it pivots. Watch your back.`,
            buttonText: "storyline.storyline_chad_loses_buttonText",
        },
        player_overtakes_chad: {
            character: "chad",
            trigger: "player_overtakes_chad",
            title: "storyline.storyline_player_overtakes_chad_title",
            message: `Wait, my dashboard says you're worth more than Chadly? That's definitely a rounding error in your favor. Don't get comfortable — the king is just reloading.`,
            buttonText: "storyline.storyline_player_overtakes_chad_buttonText",
        },
    };

    return dialogs[trigger] ?? dialogs.taunt_generic_a;
}

// ─── Main Trigger Engine ──────────────────────────────────────────────────────

export function getStorylineDialog(
    month: number,
    metrics: { valuation: number; users: number; cash: number; runway: number; burnout: number; growth_rate: number; net_profit: number },
    competitors: Competitor[],
    state: StorylineState,
    justFundraised: boolean
): StorylineDialog | null {

    const chadly = competitors.find(c => c.id === "chadly");
    const seen = new Set(state.seenTriggers);
    const act = month >= 15 ? 3 : month >= 4 ? 2 : 1;

    // ── INVESTOR PRESSURE (Board Meeting) ──
    if (month > 3 && metrics.growth_rate <= 0 && metrics.net_profit < 0 && metrics.runway <= 6 && !seen.has("board_pressure")) {
        return {
            character: "board",
            trigger: "board_pressure",
            title: "storyline.storyline_board_pressure_title",
            message: `Your growth has stalled to ${Math.round(metrics.growth_rate * 100)}% and you are burning ${formatMoney(Math.abs(metrics.net_profit))} per month with shrinking runway. The Board is losing patience. We expect a path to profitability IMMEDIATELY.`,
            hasChoices: true,
            choiceALabel: "storyline.storyline_board_pressure_choiceALabel",
            choiceADescription: "storyline.storyline_board_pressure_choiceADescription",
            choiceAActionId: "board_pressure_shield_team",
            choiceBLabel: "storyline.storyline_board_pressure_choiceBLabel",
            choiceBDescription: "storyline.storyline_board_pressure_choiceBDescription",
            choiceBActionId: "board_pressure_pressure_team",
        };
    }

    // ── NEW: Sam Bankruptcy Warning (High Priority, Months 2-12) ──
    if (month > 1 && month <= 12 && metrics.runway <= 3 && metrics.cash < 100000 && !seen.has("sam_bankruptcy_warning")) {
        return {
            character: "sam",
            trigger: "sam_bankruptcy_warning",
            title: "storyline.storyline_sam_bankruptcy_warning_title",
            message: `Stop everything. Your runway is down to ${metrics.runway} months. You're bleeding cash faster than you're growing.\n\nIf you don't find funding or a cash grant in the next 30 days, this journey ends. Raise now, or cut your opex immediately.`,
            buttonText: "storyline.storyline_sam_bankruptcy_warning_buttonText",
        };
    }


    // ── Tutorial steps or Expert Welcome (Month 1 only) ──
    if (month === 1) {
        if (state.tutorialStep >= 0 && state.tutorialStep < TUTORIAL_STEPS.length) {
            return TUTORIAL_STEPS[state.tutorialStep];
        }
        // Repeat player: show the expert welcome if they skipped tutorial
        if (!seen.has("tutorial_4") && !seen.has("sam_expert_welcome")) {
            return SAM_EXPERT_WELCOME;
        }
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
