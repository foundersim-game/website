// src/lib/story/archiveRegistry.ts
import { StoryModeState, StoryStartupSnapshot, CampaignId } from "./types";
import { getCampaign } from "./engine";
import { submitStoryRun } from "@/lib/services/leaderboardService";
import { getLbUsername } from "@/lib/services/leaderboardService";

export interface ArchivedRun {
  id: string;
  campaignId: CampaignId;
  companyName: string;
  dateCompleted: string; // ISO
  outcome: "win" | "loss";
  monthsPlayed: number;
  finalValuation: number;
  timeline: { month: number; text: string }[];
}

const ARCHIVE_KEY = "founder_sim_story_archive";

export function getArchivedRuns(): ArchivedRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveRunToArchive(
  state: StoryModeState,
  snapshot: StoryStartupSnapshot,
  timeline: { month: number; text: string }[],
  outcome: "win" | "loss"
) {
  if (typeof window === "undefined") return;
  const campaign = getCampaign(state.campaignId);
  if (!campaign) return;

  const run: ArchivedRun = {
    id: `${state.campaignId}_${Date.now()}`,
    campaignId: state.campaignId,
    companyName: campaign.companyName,
    dateCompleted: new Date().toISOString(),
    outcome,
    monthsPlayed: state.currentMonth,
    finalValuation: snapshot.valuation,
    timeline,
  };

  const runs = getArchivedRuns();
  runs.unshift(run); // newer first
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(runs));

  // Submit to Speedrun Leaderboard if win
  if (outcome === "win") {
    const username = getLbUsername();
    if (username) {
      submitStoryRun(username, state.campaignId, state.currentMonth, outcome);
    }
  }
}
