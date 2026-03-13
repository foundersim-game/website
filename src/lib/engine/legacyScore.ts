import { Founder, Startup, StartupOutcome } from "../types/database.types";

export type LegacyTier = {
    name: string;
    emoji: string;
    flavourText: string;
    perk: string; // Bonus for next run
    minScore: number;
};

export const LEGACY_TIERS: LegacyTier[] = [
    {
        name: "Unicorn Founder",
        emoji: "🦄",
        flavourText: "\"Exits define generations. You built something the world still talks about.\"",
        perk: "+10 Networking for your next startup.",
        minScore: 90,
    },
    {
        name: "Rocketship",
        emoji: "🚀",
        flavourText: "\"You built something that mattered. The market noticed. Your investors certainly did.\"",
        perk: "+8 Leadership & +5 Technical Skill next run.",
        minScore: 70,
    },
    {
        name: "Traction Machine",
        emoji: "📈",
        flavourText: "\"Solid exit. The lessons were real, the scars are real, and the bank account isn't bad either.\"",
        perk: "+6 Marketing Skill next run.",
        minScore: 50,
    },
    {
        name: "First Steps",
        emoji: "🌱",
        flavourText: "\"Every great founder has a 'first startup story'. This is yours. The next one will be different.\"",
        perk: "+5 Intelligence next run.",
        minScore: 30,
    },
    {
        name: "Burned Out",
        emoji: "💀",
        flavourText: "\"The best founders fail forward. You now know exactly what not to do.\"",
        perk: "+3 Stress Tolerance next run.",
        minScore: 0,
    },
];

export type LegacyResult = {
    score: number;
    tier: LegacyTier;
    breakdown: Record<string, number>; // category → points scored
};

export function computeLegacyScore(
    founder: Founder,
    startup: Startup,
    monthsSurvived: number
): LegacyResult {
    const m = startup.metrics;
    const outcome = startup.outcome ?? "wound_down";
    const peakVal = startup.peak_valuation ?? startup.valuation;
    const peakUsers = startup.peak_users ?? m.users;

    // ── Peak Valuation (0–30 pts) ──────────────────────────────────────────
    const valScore = Math.min(30, Math.floor(Math.log10(Math.max(1, peakVal)) * 4));

    // ── Exit Outcome (0–25 pts) ────────────────────────────────────────────
    const outcomeScores: Record<StartupOutcome, number> = {
        ipo: 25,
        acquired: 20,
        wound_down: 10,
        active: 8,
        bankrupt: 0,
        burnout: 5,
        other: 5,
    };
    const outcomeScore = outcomeScores[outcome] ?? 0;

    // ── Peak Users (0–15 pts) ──────────────────────────────────────────────
    const userScore = Math.min(15, Math.floor(Math.log10(Math.max(1, peakUsers)) * 3));

    // ── PMF Score at Exit (0–10 pts) ──────────────────────────────────────
    const pmfScore = Math.min(10, Math.floor((m.pmf_score || 0) / 10));

    // ── Months Survived (0–10 pts) ─────────────────────────────────────────
    const monthScore = Math.min(10, Math.floor(monthsSurvived / 6));

    // ── Team Size at Exit (0–5 pts) ────────────────────────────────────────
    const teamScore = Math.min(5, Math.floor((startup.employees?.length ?? 0) / 3));

    // ── Founder Health at Exit (0–5 pts) ──────────────────────────────────
    const healthScore = Math.min(5, Math.floor((m.founder_health ?? 100) / 20));

    const total = valScore + outcomeScore + userScore + pmfScore + monthScore + teamScore + healthScore;

    const tier = LEGACY_TIERS.find(t => total >= t.minScore) ?? LEGACY_TIERS[LEGACY_TIERS.length - 1];

    return {
        score: total,
        tier,
        breakdown: {
            "Peak Valuation": valScore,
            "Exit Outcome": outcomeScore,
            "Peak Users": userScore,
            "PMF Score": pmfScore,
            "Months Survived": monthScore,
            "Team Size": teamScore,
            "Founder Health": healthScore,
        },
    };
}
