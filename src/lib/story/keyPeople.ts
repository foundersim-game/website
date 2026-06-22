// src/lib/story/keyPeople.ts
// ─────────────────────────────────────────────────────────────────────────────
// Key People helper functions — used by UI components and the engine.
// NO imports from sandbox engine files.
// ─────────────────────────────────────────────────────────────────────────────

import { KeyPerson, StoryModeState, StoryEvent } from "./types";

// ── Loyalty display helpers ───────────────────────────────────────────────────

export type LoyaltyLabel = "Devoted" | "Trusted" | "Wavering" | "At Risk" | "Hostile";

export function getLoyaltyLabel(loyalty: number): LoyaltyLabel {
  if (loyalty >= 80) return "Devoted";
  if (loyalty >= 60) return "Trusted";
  if (loyalty >= 40) return "Wavering";
  if (loyalty >= 20) return "At Risk";
  return "Hostile";
}

export function getLoyaltyColor(loyalty: number): string {
  if (loyalty >= 80) return "#22c55e";  // green
  if (loyalty >= 60) return "#eab308";  // yellow
  if (loyalty >= 40) return "#f97316";  // orange
  return "#ef4444";                      // red
}

// Renders loyalty as a heart string: ❤️❤️❤️💔💔 (5 hearts, filled = loyalty/20)
export function getLoyaltyHearts(loyalty: number): string {
  const filled = Math.round(loyalty / 20);
  const empty = 5 - filled;
  return "❤️".repeat(filled) + "🖤".repeat(empty);
}

// ── Competence display ────────────────────────────────────────────────────────

export function getTopCompetence(person: KeyPerson): string {
  const entries = Object.entries(person.competence) as [string, number][];
  const [topSkill, topVal] = entries.reduce((best, curr) =>
    curr[1] > best[1] ? curr : best
  );
  const labels: Record<string, string> = {
    technical: "Engineering",
    marketing: "Marketing",
    leadership: "Leadership",
    fundraising: "Fundraising",
  };
  return `${labels[topSkill] ?? topSkill} (${topVal}/100)`;
}

// ── Active people filter ──────────────────────────────────────────────────────

export function getActiveKeyPeople(storyState: StoryModeState): KeyPerson[] {
  return storyState.keyPeople.filter((p) => p.isActive);
}

// ── Betrayal threshold check ──────────────────────────────────────────────────
// Returns a forced departure event ID if any active person is below their loyalty threshold.
// The engine uses this to insert a mandatory event at the start of the next month.

export interface BetrayalAlert {
  person: KeyPerson;
  eventId: string;
  warningMessage: string;
}

export function checkBetrayalThresholds(storyState: StoryModeState): BetrayalAlert[] {
  const alerts: BetrayalAlert[] = [];

  storyState.keyPeople
    .filter((p) => p.isActive && p.loyalty <= p.loyaltyThreshold)
    .forEach((p) => {
      alerts.push({
        person: p,
        eventId: `betrayal_${p.id}`,
        warningMessage: `${p.displayName}'s loyalty has fallen to ${p.loyalty}. They may leave soon.`,
      });
    });

  return alerts;
}

// ── Passive effect summary ────────────────────────────────────────────────────
// Returns a human-readable summary of what a person contributes monthly.

export function getPassiveEffectSummary(person: KeyPerson): string[] {
  if (!person.passiveEffect) return ["No passive monthly effect."];
  const fx = person.passiveEffect;
  const lines: string[] = [];

  if (fx.product_quality) lines.push(`+${fx.product_quality} Product Quality/mo`);
  if (fx.brand_awareness) lines.push(`+${fx.brand_awareness} Brand Awareness/mo`);
  if (fx.innovation) lines.push(`+${fx.innovation} Innovation/mo`);
  if (fx.team_morale) lines.push(`${fx.team_morale > 0 ? "+" : ""}${fx.team_morale} Team Morale/mo`);
  if (fx.ceo_reputation) lines.push(`${fx.ceo_reputation > 0 ? "+" : ""}${fx.ceo_reputation} CEO Reputation/mo`);
  if (fx.revenue) lines.push(`+$${(fx.revenue / 1000).toFixed(0)}K Revenue/mo`);
  if (fx.cash) lines.push(`+$${(fx.cash / 1000).toFixed(0)}K Cash/mo`);

  return lines.length > 0 ? lines : ["Active presence"];
}

// ── Month-since stats ─────────────────────────────────────────────────────────

export function monthsSinceJoined(person: KeyPerson, currentMonth: number): number {
  return Math.max(0, currentMonth - person.monthJoined);
}
