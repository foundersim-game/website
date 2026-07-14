// src/lib/story/legacyEngine.ts
import { getArchivedRuns } from "./archiveRegistry";

export interface FounderLegacyPerks {
  startingCashBonus: number;
  startingUsersBonus: number;
  initialMoraleBonus: number;
  totalWins: number;
  totalLosses: number;
}

export function calculateLegacyPerks(): FounderLegacyPerks {
  if (typeof window === "undefined") {
    return { startingCashBonus: 0, startingUsersBonus: 0, initialMoraleBonus: 0, totalWins: 0, totalLosses: 0 };
  }

  const runs = getArchivedRuns();
  const wins = runs.filter((r) => r.outcome === "win").length;
  const losses = runs.length - wins;

  // Each win gives a persistent starting bonus to future campaigns
  return {
    startingCashBonus: wins * 50_000,
    startingUsersBonus: wins * 10_000,
    initialMoraleBonus: wins * 5,
    totalWins: wins,
    totalLosses: losses,
  };
}
