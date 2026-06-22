// src/lib/story/boardRoom.ts
// ─────────────────────────────────────────────────────────────────────────────
// Board Room helper functions — vote tallying, lobbying, composition display.
// NO imports from sandbox engine files.
// ─────────────────────────────────────────────────────────────────────────────

import { StoryBoardMember, BoardVoteItem, StoryModeState, StoryMetricDeltas } from "./types";

// ── Vote Result ───────────────────────────────────────────────────────────────

export type VoteResult = "pass" | "fail" | "tie";

export interface VoteTally {
  result: VoteResult;
  yesInfluence: number;
  noInfluence: number;
  yesVoters: StoryBoardMember[];
  noVoters: StoryBoardMember[];
  abstainVoters: StoryBoardMember[];
}

// A member votes YES if their loyaltyToFounder >= 50.
// Their influence is their vote weight.
export function computeBoardVoteResult(
  vote: BoardVoteItem,
  boardMembers: StoryBoardMember[]
): VoteTally {
  const active = boardMembers.filter((m) => m.isActive);
  const yesVoters: StoryBoardMember[] = [];
  const noVoters: StoryBoardMember[] = [];
  const abstainVoters: StoryBoardMember[] = [];

  let yesInfluence = 0;
  let noInfluence = 0;

  active.forEach((m) => {
    if (m.loyaltyToFounder >= 55) {
      yesVoters.push(m);
      yesInfluence += m.influence;
    } else if (m.loyaltyToFounder <= 35) {
      noVoters.push(m);
      noInfluence += m.influence;
    } else {
      abstainVoters.push(m);
    }
  });

  let result: VoteResult = "fail";
  if (yesInfluence > noInfluence && yesInfluence >= vote.requiredInfluenceToPass) {
    result = "pass";
  } else if (yesInfluence === noInfluence) {
    result = "tie";
  }

  return { result, yesInfluence, noInfluence, yesVoters, noVoters, abstainVoters };
}

// ── Lobby a Board Member ──────────────────────────────────────────────────────
// Spending "influence tokens" (earned via networking/events) boosts a member's loyalty.
// Returns the updated board members array.
// influenceSpent: 1–5 tokens. Each token = +8 loyalty.

export function lobbyBoardMember(
  memberId: string,
  tokensSpent: number,
  boardMembers: StoryBoardMember[]
): StoryBoardMember[] {
  const loyaltyGain = Math.min(40, tokensSpent * 8); // cap at 40 per lobby action
  return boardMembers.map((m) =>
    m.id === memberId
      ? { ...m, loyaltyToFounder: Math.min(100, m.loyaltyToFounder + loyaltyGain) }
      : m
  );
}

// ── Board Composition ─────────────────────────────────────────────────────────

export interface BoardComposition {
  founderSeats: StoryBoardMember[];
  investorSeats: StoryBoardMember[];
  independentSeats: StoryBoardMember[];
  totalInfluence: number;
  founderControlledInfluence: number;
  founderControlled: boolean; // true if founder-loyal members control > 50% influence
}

export function getBoardComposition(boardMembers: StoryBoardMember[]): BoardComposition {
  const active = boardMembers.filter((m) => m.isActive);
  const founderSeats = active.filter((m) => m.seat === "founder");
  const investorSeats = active.filter((m) => m.seat === "investor");
  const independentSeats = active.filter((m) => m.seat === "independent");

  const totalInfluence = active.reduce((sum, m) => sum + m.influence, 0);
  const founderControlledInfluence = active
    .filter((m) => m.loyaltyToFounder >= 50)
    .reduce((sum, m) => sum + m.influence, 0);

  return {
    founderSeats,
    investorSeats,
    independentSeats,
    totalInfluence,
    founderControlledInfluence,
    founderControlled: totalInfluence > 0
      ? founderControlledInfluence / totalInfluence > 0.5
      : true,
  };
}

// ── Agenda Label ──────────────────────────────────────────────────────────────

export function getAgendaLabel(agenda: StoryBoardMember["agenda"]): string {
  const labels: Record<string, string> = {
    growth: "🚀 Growth First",
    profitability: "💰 Profitability First",
    exit: "🚪 Exit Strategy",
    control: "⚔️ Control Agenda",
  };
  return labels[agenda] ?? agenda;
}

export function getSeatLabel(seat: StoryBoardMember["seat"]): string {
  const labels: Record<string, string> = {
    founder: "Founder",
    investor: "Investor",
    independent: "Independent",
  };
  return labels[seat] ?? seat;
}
