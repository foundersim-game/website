/**
 * reviewService.ts
 * 
 * Wraps @capacitor-community/in-app-review.
 * 
 * Strategy:
 * - Only prompt at defined positive milestones (funding raises, IPO day, etc.)
 * - Never prompt more than once per session
 * - Enforce a 14-day cooldown between prompts using localStorage
 * - The OS itself further rate-limits the native prompt (typically ~3x per year)
 */

import { InAppReview } from "@capacitor-community/in-app-review";
import { Capacitor } from "@capacitor/core";

const REVIEW_KEY = "founder_sim_last_review_prompt";
const COOLDOWN_DAYS = 14;

function canPrompt(): boolean {
    if (!Capacitor.isNativePlatform()) return false; // Web: skip entirely
    const last = localStorage.getItem(REVIEW_KEY);
    if (!last) return true;
    const daysSince = (Date.now() - parseInt(last, 10)) / (1000 * 60 * 60 * 24);
    return daysSince >= COOLDOWN_DAYS;
}

function markPrompted(): void {
    localStorage.setItem(REVIEW_KEY, String(Date.now()));
}

export async function requestReviewIfEligible(reason: string): Promise<void> {
    if (!canPrompt()) {
        console.debug(`[ReviewService] Skipped (${reason}) — cooldown active.`);
        return;
    }
    try {
        console.debug(`[ReviewService] Requesting review: ${reason}`);
        markPrompted();
        await InAppReview.requestReview();
    } catch (e) {
        // Silently fail — never block the game for a review prompt
        console.error("[ReviewService] Failed:", e);
    }
}

/**
 * Named trigger helpers — call these at key moments.
 * The OS decides whether to actually show the dialog.
 */
export const ReviewTriggers = {
    /** First successful funding raise (Seed / Angel) */
    firstFundingRaise: () => requestReviewIfEligible("first_funding_raise"),

    /** Any Series A or above */
    seriesARaise: () => requestReviewIfEligible("series_a_raise"),

    /** Reached Product-Market Fit (PMF ≥ 80) */
    pmfAchieved: () => requestReviewIfEligible("pmf_achieved"),

    /** IPO Day */
    ipoDay: () => requestReviewIfEligible("ipo_day"),
};
