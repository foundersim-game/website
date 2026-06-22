// src/lib/story/engine.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE STORY ENGINE
//
// ⚠️  ISOLATION RULES — READ BEFORE EDITING:
//   - This file NEVER imports from simulation.ts
//   - This file NEVER imports from events.ts, crisisEngine.ts, competitors.ts
//   - This file NEVER imports from storyline.ts or actions.ts
//   - It only imports from: ./types, ./campaigns/*
//
// How it works:
//   1. The story game page calls checkStoryEvents() every time month advances
//   2. checkStoryEvents() returns events that should fire this month
//   3. UI shows them as modals one at a time
//   4. When player picks a choice, UI calls applyStoryChoice()
//   5. applyStoryChoice() returns new snapshot + state objects (never mutates)
//   6. The game page saves these to localStorage
// ─────────────────────────────────────────────────────────────────────────────

import type { Startup } from "../types/database.types";
import {
  StoryCampaign,
  StoryEvent,
  StoryModeState,
  StoryMetricDeltas,
  StoryStartupSnapshot,
  SprintAllocation,
  KeyPerson,
  CultureArchetype,
  HistoricalRival,
} from "./types";
import { PINEAPPLE_CAMPAIGN } from "./campaigns/pineapple";
import { BOOKFACE_CAMPAIGN } from "./campaigns/bookface"; // IDE cache bust
import { SEARCHGO_CAMPAIGN } from "./campaigns/searchgo"; // IDE cache bust

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Registry
// ─────────────────────────────────────────────────────────────────────────────
export const CAMPAIGNS: Record<string, StoryCampaign> = {
  pineapple: PINEAPPLE_CAMPAIGN,
  bookface: BOOKFACE_CAMPAIGN,
  searchgo: SEARCHGO_CAMPAIGN,
};

export function getCampaign(id: string): StoryCampaign | null {
  return CAMPAIGNS[id] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// checkStoryEvents
// Call this once per month BEFORE showing the month summary.
// Returns an array of events ready to fire (0, 1, or occasionally 2).
// ─────────────────────────────────────────────────────────────────────────────
export function checkStoryEvents(
  snapshot: StoryStartupSnapshot,
  storyState: StoryModeState,
  currentMonth: number
): StoryEvent[] {
  const campaign = getCampaign(storyState.campaignId);
  if (!campaign) return [];

  const completed = new Set(storyState.completedEventIds);
  const skipped = new Set(storyState.skippedEventIds);

  return campaign.events.filter((event) => {
    // Already resolved
    if (completed.has(event.id)) return false;
    if (skipped.has(event.id)) return false;

    // Required prior events must be complete
    if (event.requiredPriorEvents?.length) {
      const allDone = event.requiredPriorEvents.every((id) => completed.has(id));
      if (!allDone) return false;
    }

    // Blocking events: if any completed event blocks this, skip it
    if (event.blockedByEvents?.length) {
      const isBlocked = event.blockedByEvents.some((id) => completed.has(id));
      if (isBlocked) return false;
    }

    // Evaluate trigger
    const t = event.trigger;
    if (t.type === "month_reached") return currentMonth >= t.value;
    if (t.type === "users_reached") return snapshot.metrics.users >= t.value;
    if (t.type === "valuation_reached") return snapshot.valuation >= t.value;
    return false;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// applyStoryChoice
// The core mutation function. Returns NEW objects — never mutates inputs.
// Called after player selects a choice and any mini-game is resolved.
// ─────────────────────────────────────────────────────────────────────────────
export function applyStoryChoice(
  snapshot: StoryStartupSnapshot,
  storyState: StoryModeState,
  eventId: string,
  choiceId: string,
  succeeded: boolean // true = success path, false = fail path
): {
  newSnapshot: StoryStartupSnapshot;
  newStoryState: StoryModeState;
  notices: string[];
} {
  const campaign = getCampaign(storyState.campaignId);
  if (!campaign) {
    return { newSnapshot: snapshot, newStoryState: storyState, notices: [] };
  }

  const event = campaign.events.find((e) => e.id === eventId);
  const choice = event?.choices.find((c) => c.id === choiceId);
  if (!event || !choice) {
    return { newSnapshot: snapshot, newStoryState: storyState, notices: ["❌ Invalid event or choice"] };
  }

  const deltas: StoryMetricDeltas = succeeded
    ? choice.onSuccess
    : (choice.onFail ?? {});

  const notices: string[] = [];

  // ── 1. Apply metric deltas ──────────────────────────────────────────────
  const m = { ...snapshot.metrics };

  const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val));
  const addClamp = (current: number, delta: number | undefined, min = 0, max = 100) =>
    delta !== undefined ? clamp(current + delta, min, max) : current;

  m.cash = m.cash + (deltas.cash ?? 0);
  m.burn_rate = Math.max(0, m.burn_rate + (deltas.burn_rate ?? 0));
  m.users = Math.max(0, m.users + (deltas.users ?? 0));
  m.product_quality = addClamp(m.product_quality, deltas.product_quality);
  m.technical_debt = addClamp(m.technical_debt, deltas.technical_debt);
  m.team_morale = addClamp(m.team_morale, deltas.team_morale);
  m.brand_awareness = addClamp(m.brand_awareness, deltas.brand_awareness);
  m.innovation = addClamp(m.innovation, deltas.innovation);
  m.pmf_score = addClamp(m.pmf_score, deltas.pmf_score);
  m.reliability = addClamp(m.reliability, deltas.reliability);
  m.founder_health = addClamp(m.founder_health, deltas.founder_health);
  m.founder_burnout = addClamp(m.founder_burnout, deltas.founder_burnout);

  // ── 2. Valuation multiplier ─────────────────────────────────────────────
  let newValuation = snapshot.valuation;
  if (deltas.valuation_multiplier && deltas.valuation_multiplier > 0) {
    newValuation = Math.floor(newValuation * deltas.valuation_multiplier);
  }

  // ── 3. CEO reputation ───────────────────────────────────────────────────
  let newCeoRep = snapshot.ceo_reputation;
  if (deltas.ceo_reputation !== undefined) {
    newCeoRep = clamp(newCeoRep + deltas.ceo_reputation);
  }

  // ── 4. Key person loyalty changes ───────────────────────────────────────
  let newKeyPeople = [...storyState.keyPeople];
  if (deltas.keyPersonLoyaltyDelta) {
    deltas.keyPersonLoyaltyDelta.forEach(({ personId, delta }) => {
      newKeyPeople = newKeyPeople.map((p) =>
        p.id === personId
          ? { ...p, loyalty: clamp(p.loyalty + delta) }
          : p
      );
    });
  }

  // ── 5. Activate a key person ────────────────────────────────────────────
  if (deltas.activatesKeyPersonId) {
    newKeyPeople = newKeyPeople.map((p) =>
      p.id === deltas.activatesKeyPersonId
        ? { ...p, isActive: true, monthJoined: storyState.currentMonth }
        : p
    );
    notices.push(`🤝 ${newKeyPeople.find((p) => p.id === deltas.activatesKeyPersonId)?.displayName ?? deltas.activatesKeyPersonId} has joined your inner circle.`);
  }

  // ── 6. Deactivate a key person ──────────────────────────────────────────
  if (deltas.deactivatesKeyPersonId) {
    newKeyPeople = newKeyPeople.map((p) =>
      p.id === deltas.deactivatesKeyPersonId
        ? { ...p, isActive: false, monthLeft: storyState.currentMonth }
        : p
    );
    notices.push(`💔 ${newKeyPeople.find((p) => p.id === deltas.deactivatesKeyPersonId)?.displayName ?? deltas.deactivatesKeyPersonId} has left the company.`);
  }

  // ── 7. Board loyalty changes ────────────────────────────────────────────
  let newBoardMembers = [...storyState.boardMembers];
  if (deltas.boardMemberLoyaltyDelta) {
    deltas.boardMemberLoyaltyDelta.forEach(({ memberId, delta }) => {
      newBoardMembers = newBoardMembers.map((b) =>
        b.id === memberId
          ? { ...b, loyaltyToFounder: clamp(b.loyaltyToFounder + delta) }
          : b
      );
    });
  }

  // ── 8. Narrative flags ──────────────────────────────────────────────────
  const newFlags = { ...storyState.narrativeFlags };
  if (deltas.setsFlag) newFlags[deltas.setsFlag] = true;
  if (deltas.unlocksEventId) newFlags[`unlocked_${deltas.unlocksEventId}`] = true;
  if (deltas.blocksEventId) newFlags[`blocked_${deltas.blocksEventId}`] = true;

  // ── 9. Founder role change ──────────────────────────────────────────────
  const newRole = deltas.founderRoleChange ?? storyState.founderRole;
  if (deltas.founderRoleChange) {
    notices.push(
      deltas.founderRoleChange === "cpo_chairman"
        ? "🎭 Your role has changed: You are now Chairman & Chief Product Officer."
        : "👑 You have reclaimed the CEO role."
    );
  }

  // ── 10. Mark event complete ─────────────────────────────────────────────
  const newCompleted = [...storyState.completedEventIds, eventId];

  // ── 11. Derive culture + act ────────────────────────────────────────────
  const newCulture = deriveCultureArchetype(newKeyPeople, newFlags);
  const newAct = computeCurrentAct(storyState.campaignId, newCompleted);

  // ── 12. Collect notices ─────────────────────────────────────────────────
  if (succeeded && choice.successText) notices.unshift(`✅ ${choice.successText}`);
  else if (!succeeded && choice.failText) notices.unshift(`❌ ${choice.failText}`);

  return {
    newSnapshot: {
      ...snapshot,
      metrics: m,
      valuation: newValuation,
      ceo_reputation: newCeoRep,
    },
    newStoryState: {
      ...storyState,
      currentAct: newAct,
      completedEventIds: newCompleted,
      keyPeople: newKeyPeople,
      boardMembers: newBoardMembers,
      narrativeFlags: newFlags,
      founderRole: newRole,
      cultureArchetype: newCulture,
    },
    notices,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// processStoryMonth
// Applies sprint allocation, key people effects, rival actions, and basic income.
// Returns updated snapshot + notices. Call BEFORE checkStoryEvents.
// ─────────────────────────────────────────────────────────────────────────────
export function processStoryMonth(
  snapshot: StoryStartupSnapshot,
  storyState: StoryModeState
): { newSnapshot: StoryStartupSnapshot; notices: string[] } {
  const notices: string[] = [];
  const m = { ...snapshot.metrics };
  const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

  // ── A. Sprint allocation effects ─────────────────────────────────────────
  const sprint = storyState.sprintAllocation;
  const eng = sprint.engineering / 100;
  const des = sprint.design / 100;
  const mkt = sprint.marketing / 100;
  const res = sprint.research / 100;

  m.product_quality = clamp(m.product_quality + Math.round(eng * 8 + des * 5));
  m.technical_debt = clamp(m.technical_debt + Math.round(eng * 3)); // fast build = some debt
  m.brand_awareness = clamp(m.brand_awareness + Math.round(mkt * 4));
  m.pmf_score = clamp(m.pmf_score + Math.round(res * 4));
  m.innovation = clamp(m.innovation + Math.round(res * 3));

  // ── B. Key people passive effects ────────────────────────────────────────
  storyState.keyPeople
    .filter((p) => p.isActive && p.passiveEffect)
    .forEach((p) => {
      const fx = p.passiveEffect!;
      if (fx.product_quality) m.product_quality = clamp(m.product_quality + fx.product_quality);
      if (fx.brand_awareness) m.brand_awareness = clamp(m.brand_awareness + fx.brand_awareness);
      if (fx.team_morale) m.team_morale = clamp(m.team_morale + fx.team_morale);
      if (fx.innovation) m.innovation = clamp(m.innovation + fx.innovation);
      if (fx.pmf_score) m.pmf_score = clamp(m.pmf_score + fx.pmf_score);
    });

  // ── C. Rival actions for this month ──────────────────────────────────────
  storyState.historicalRivals.forEach((rival) => {
    rival.scheduledActions.forEach((action) => {
      if (action.atMonth === storyState.currentMonth) {
        notices.push(`⚔️ ${rival.name}: ${action.description}`);
        const fx = action.impactOnPlayer;
        if (fx.brand_awareness) m.brand_awareness = clamp(m.brand_awareness + fx.brand_awareness);
        if (fx.users) m.users = Math.max(0, m.users + fx.users);
        if (fx.team_morale) m.team_morale = clamp(m.team_morale + fx.team_morale);
        if (fx.pmf_score) m.pmf_score = clamp(m.pmf_score + fx.pmf_score);
      }
    });
  });

  // ── D. Simple revenue model ───────────────────────────────────────────────
  const pmfFraction = m.pmf_score / 100;
  const qualityFraction = m.product_quality / 100;
  const conversionRate = Math.min(0.20, 0.02 + pmfFraction * 0.08 + qualityFraction * 0.04);
  const paidUsers = Math.floor(m.users * conversionRate);
  m.revenue = paidUsers * m.pricing;

  // ── E. Expenses ───────────────────────────────────────────────────────────
  const activeKeyPeopleCount = storyState.keyPeople.filter((p) => p.isActive).length;
  const keyPeopleSalaries = activeKeyPeopleCount * 8_000; // flat per active key person
  const infraCost = Math.max(500, m.users * 0.4);
  const totalExpenses = m.burn_rate + keyPeopleSalaries + infraCost;

  // ── F. Net profit & cash ──────────────────────────────────────────────────
  const netProfit = m.revenue - totalExpenses;
  m.cash = m.cash + netProfit;

  // ── G. Natural user growth ────────────────────────────────────────────────
  const brandFraction = m.brand_awareness / 100;
  const naturalGrowth = Math.floor(m.users * 0.02 * (1 + brandFraction + pmfFraction * 0.5));
  m.users = Math.max(0, m.users + naturalGrowth);

  // ── H. Runway ────────────────────────────────────────────────────────────
  m.runway = totalExpenses > 0 ? Math.floor(m.cash / totalExpenses) : 999;

  // ── I. Low cash morale penalty ────────────────────────────────────────────
  if (m.cash < 10_000) {
    m.team_morale = clamp(m.team_morale - 5);
    notices.push("💸 Cash critically low. Team morale suffering.");
  }

  // ── J. Burnout drift ─────────────────────────────────────────────────────
  if (m.team_morale < 30) {
    m.founder_burnout = clamp(m.founder_burnout + 3);
  }

  return {
    newSnapshot: { ...snapshot, metrics: m },
    notices,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// checkWinCondition
// ─────────────────────────────────────────────────────────────────────────────
export function checkWinCondition(
  snapshot: StoryStartupSnapshot,
  storyState: StoryModeState
): boolean {
  const campaign = getCampaign(storyState.campaignId);
  if (!campaign) return false;
  // We need a full Startup-like object for the win condition check.
  // We construct a minimal one from our snapshot.
  const fakeStartup = snapshotToStartup(snapshot);
  return campaign.winCondition.check(fakeStartup, storyState);
}

// ─────────────────────────────────────────────────────────────────────────────
// checkLossConditions
// Returns a loss reason string if the game is over, null if still alive.
// ─────────────────────────────────────────────────────────────────────────────
export function checkLossConditions(
  snapshot: StoryStartupSnapshot
): string | null {
  if (snapshot.metrics.cash <= 0) return "Your company ran out of cash. Game over.";
  if (snapshot.metrics.founder_burnout >= 100) return "Complete burnout. You stepped away from everything.";
  if (snapshot.metrics.founder_health <= 5) return "Your health deteriorated to a critical level.";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// initializeStoryState
// Returns a fresh StoryModeState for a new campaign run.
// ─────────────────────────────────────────────────────────────────────────────
export function initializeStoryState(campaignId: string): StoryModeState | null {
  const campaign = getCampaign(campaignId);
  if (!campaign) return null;

  return {
    campaignId: campaign.id,
    currentAct: 1,
    currentMonth: 1,
    completedEventIds: [],
    skippedEventIds: [],
    keyPeople: campaign.initialKeyPeople,
    boardMembers: campaign.initialBoardMembers,
    sprintAllocation: {
      engineering: 40,
      design: 20,
      marketing: 20,
      sales: 10,
      research: 10,
    },
    historicalRivals: campaign.initialRivals,
    cultureArchetype: "craft",
    founderRole: "ceo",
    parallelUniverseUnlocked: false,
    hallOfLegendsEligible: false,
    keynoteScores: [],
    pitchResults: [],
    narrativeFlags: {},
    lastMonthNotices: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// initializeStorySnapshot
// Returns a fresh startup snapshot seeded with campaign starting metrics.
// ─────────────────────────────────────────────────────────────────────────────
export function initializeStorySnapshot(campaignId: string): StoryStartupSnapshot | null {
  const campaign = getCampaign(campaignId);
  if (!campaign) return null;
  const sm = campaign.startingMetrics;

  return {
    name: campaign.companyName,
    valuation: 200_000,
    ceo_reputation: sm.ceo_reputation,
    metrics: {
      cash: sm.cash,
      burn_rate: 2_000,
      runway: Math.floor(sm.cash / 2_000),
      users: sm.users,
      revenue: 0,
      product_quality: sm.product_quality,
      technical_debt: sm.technical_debt,
      team_morale: sm.team_morale,
      brand_awareness: sm.brand_awareness,
      innovation: sm.innovation,
      pmf_score: sm.pmf_score,
      reliability: 90,
      founder_health: 100,
      founder_burnout: 0,
      pricing: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (private)
// ─────────────────────────────────────────────────────────────────────────────

function deriveCultureArchetype(
  keyPeople: KeyPerson[],
  flags: Record<string, boolean>
): CultureArchetype {
  if (flags["hired_outside_ceo"] || flags["enterprise_process_installed"]) return "enterprise";
  if (flags["equity_first_culture"] && keyPeople.filter((p) => p.loyalty > 70 && p.isActive).length >= 2) return "ownership";
  if (flags["strong_culture_program"] && keyPeople.filter((p) => p.loyalty > 75 && p.isActive).length >= 1) return "craft";
  if (flags["mass_hired_fast"]) return "hustle";
  if (flags["culture_scandal"]) return "bro";
  return "hustle";
}

function computeCurrentAct(
  campaignId: string,
  completedEventIds: string[]
): 1 | 2 | 3 | 4 {
  const campaign = getCampaign(campaignId);
  if (!campaign) return 1;

  const completed = new Set(completedEventIds);

  const actsInOrder: (1 | 2 | 3 | 4)[] = [4, 3, 2, 1];
  for (const act of actsInOrder) {
    const actEvents = campaign.events.filter((e) => e.act === act);
    if (actEvents.length === 0) continue;
    const doneCount = actEvents.filter((e) => completed.has(e.id)).length;
    if (doneCount > 0) return act;
  }
  return 1;
}

// Converts a StoryStartupSnapshot to a minimal Startup-like object
// ONLY used for win condition checks — never persisted to Supabase.
function snapshotToStartup(snapshot: StoryStartupSnapshot): Startup {
  return {
    id: "story_mode_snapshot",
    game_session_id: "story_mode",
    name: snapshot.name,
    industry: "Tech SaaS",
    pricing_tier: "free",
    gtm_motion: "PLG",
    active_marketing_channel: "organic",
    metrics: {
      cash: snapshot.metrics.cash,
      burn_rate: snapshot.metrics.burn_rate,
      runway: snapshot.metrics.runway,
      product_quality: snapshot.metrics.product_quality,
      feature_completion: 50,
      users: snapshot.metrics.users,
      growth_rate: 0.05,
      brand_awareness: snapshot.metrics.brand_awareness,
      employees: 5,
      engineers: 3,
      marketers: 1,
      sales: 1,
      team_morale: snapshot.metrics.team_morale,
      technical_debt: snapshot.metrics.technical_debt,
      reliability: snapshot.metrics.reliability,
      innovation: snapshot.metrics.innovation,
      pmf_score: snapshot.metrics.pmf_score,
      revenue: snapshot.metrics.revenue,
      pricing: snapshot.metrics.pricing,
      founder_salary: 0,
      founder_burnout: snapshot.metrics.founder_burnout,
      founder_health: snapshot.metrics.founder_health,
      sleep_quality: 80,
      current_season: "Normal",
      has_legal_dept: false,
      option_pool: 10,
    },
    employees: [],
    phase: "Growth",
    funding_stage: "Series A",
    valuation: snapshot.valuation,
    created_at: new Date().toISOString(),
    ceo_reputation: snapshot.ceo_reputation,
  } as Startup;
}

// ─────────────────────────────────────────────────────────────────────────────
// getSaveKey — localStorage key for each campaign
// ─────────────────────────────────────────────────────────────────────────────
export const STORY_SAVE_VERSION = 1;
export const getStorySaveKey = (campaignId: string) =>
  `founder_sim_story_${campaignId}`;
