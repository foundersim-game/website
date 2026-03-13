/**
 * ongoingPrograms.ts — Ongoing program streak logic & monthly processor
 */

import { OngoingProgramDef, StatEffect, getOngoingProgramDef } from "./actions";
import { applyEffectsToState } from "./dynamicImpact";

export interface ActiveProgram {
    id: string;
    startedMonth: number;
    streakMonths: number;       // consecutive months active
    lastAppliedMonth: number;
}

// ─── Streak multiplier ────────────────────────────────────────────────────────
export function getStreakMultiplier(def: OngoingProgramDef, streakMonths: number): number {
    const thresholds = [...def.streakMultipliers].sort((a, b) => b.atMonth - a.atMonth);
    for (const t of thresholds) {
        if (streakMonths >= t.atMonth) return t.multiplier;
    }
    return 1.0;
}

// ─── Monthly processor — called in handleNextMonth ────────────────────────────
export function processOngoingPrograms(
    programs: ActiveProgram[],
    currentMonth: number,
    startup: any,
    founder: any,
): { startup: any; founder: any; log: string[] } {
    let newStartup = startup;
    let newFounder = founder;
    const log: string[] = [];

    for (const prog of programs) {
        const def = getOngoingProgramDef(prog.id);
        if (!def) continue;

        // Check if it was supposed to run this month
        const wasPreviousMonth = prog.lastAppliedMonth === currentMonth - 1;
        if (!wasPreviousMonth && prog.lastAppliedMonth !== -1) {
            // Streak broken (missed a month)
            prog.streakMonths = 0;
        }

        const streak = prog.streakMonths;
        const multiplier = getStreakMultiplier(def, streak);

        // Phase scaling for Ongoing Programs
        // Formula: floor(sqrt(valuation / 250k)) - ensures gradual scaling as company grows
        const phaseMult = Math.max(1, Math.floor(Math.sqrt(startup.valuation / 250_000)));

        // Scale effects
        const scaledEffects: StatEffect = {};
        for (const [key, val] of Object.entries(def.baseMonthlyEffect)) {
            if (val === undefined) continue;

            const applyPhaseScale = ['cash', 'users', 'revenue'].includes(key.toLowerCase());

            const scaledVal = val > 0
                ? Math.max(1, Math.round((val as number) * multiplier))
                : Math.min(-1, Math.round((val as number) * multiplier));

            (scaledEffects as any)[key] = scaledVal * (applyPhaseScale ? phaseMult : 1);
        }

        // Deduct cost
        const cost = def.monthlyCost === -1
            ? (startup.employees || []).length * 300  // headcount-based
            : def.monthlyCost * phaseMult;
        if (cost > 0) {
            if (!scaledEffects.cash) scaledEffects.cash = 0;
            (scaledEffects.cash as number) -= cost;
        }

        // Apply effects
        const result = applyEffectsToState(scaledEffects, newStartup, newFounder);
        newStartup = result.startup;
        newFounder = result.founder;

        // Streak badge
        const streakBadge = streak >= 6 ? " 🔥🔥🔥" : streak >= 3 ? " 🔥🔥" : streak >= 1 ? " 🔥" : "";
        const multStr = multiplier > 1 ? ` (×${multiplier.toFixed(0)} streak bonus)` : "";
        log.push(`${def.emoji} ${def.label}${streakBadge} applied${multStr}`);

        // Update streak
        prog.streakMonths++;
        prog.lastAppliedMonth = currentMonth;
    }

    return { startup: newStartup, founder: newFounder, log };
}

// ─── Toggle program on ────────────────────────────────────────────────────────
export function startProgram(
    programs: ActiveProgram[],
    id: string,
    currentMonth: number
): ActiveProgram[] {
    if (programs.find(p => p.id === id)) return programs; // already running
    return [
        ...programs,
        { id, startedMonth: currentMonth, streakMonths: 0, lastAppliedMonth: -1 },
    ];
}

// ─── Toggle program off ───────────────────────────────────────────────────────
export function stopProgram(programs: ActiveProgram[], id: string): ActiveProgram[] {
    return programs.filter(p => p.id !== id);
}

// ─── Get total monthly energy committed to programs ───────────────────────────
export function ongoingProgramsTotalEnergy(programs: ActiveProgram[]): number {
    return programs.reduce((sum, prog) => {
        const def = getOngoingProgramDef(prog.id);
        return sum + (def?.monthlyEnergy || 0);
    }, 0);
}

// ─── Get total monthly cost of running programs ───────────────────────────────
export function ongoingProgramsTotalCost(
    programs: ActiveProgram[],
    headcount: number
): number {
    return programs.reduce((sum, prog) => {
        const def = getOngoingProgramDef(prog.id);
        if (!def) return sum;
        const cost = def.monthlyCost === -1 ? headcount * 300 : def.monthlyCost;
        return sum + cost;
    }, 0);
}
