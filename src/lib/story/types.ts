// src/lib/story/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// ALL story-mode-specific TypeScript types live here.
// ⚠️  This file does NOT import from simulation.ts, events.ts, crisisEngine.ts,
//     competitors.ts, or any other sandbox engine file.
// ⚠️  Importing the Startup type from database.types.ts is allowed because
//     we only read it — we never write to sandbox-owned fields.
// ─────────────────────────────────────────────────────────────────────────────

// We import only the Startup type for condition-check function signatures.
// Nothing else from database.types is used here.
import type { Startup } from "../types/database.types";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Campaign IDs
// ─────────────────────────────────────────────────────────────────────────────
export type CampaignId = "pineapple" | "bookface" | "searchgo";

// ─────────────────────────────────────────────────────────────────────────────
// 2. Story Trigger Types
// An event fires when one of these conditions becomes true.
// ─────────────────────────────────────────────────────────────────────────────
export type StoryTrigger =
  | { type: "month_reached"; value: number }
  | { type: "users_reached"; value: number }
  | { type: "valuation_reached"; value: number };

// ─────────────────────────────────────────────────────────────────────────────
// 3. Metric Deltas
// What a story event can change. All optional — only set the fields that change.
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryMetricDeltas {
  cash?: number;
  burn_rate?: number;
  users?: number;
  product_quality?: number;
  technical_debt?: number;
  team_morale?: number;
  brand_awareness?: number;
  innovation?: number;
  pmf_score?: number;
  reliability?: number;
  founder_health?: number;
  founder_burnout?: number;
  ceo_reputation?: number;
  // Multiplicative valuation change — e.g. 1.5 = +50%, 0.8 = -20%
  valuation_multiplier?: number;
  // Key People effects
  keyPersonLoyaltyDelta?: { personId: string; delta: number }[];
  // Board effects
  boardMemberLoyaltyDelta?: { memberId: string; delta: number }[];
  revenue?: number;
  // Narrative flags (unlock/block future events, no numeric effect)
  unlocksEventId?: string;
  blocksEventId?: string;
  // Activates a key person who was previously inactive
  activatesKeyPersonId?: string;
  // Deactivates a key person (they leave)
  deactivatesKeyPersonId?: string;
  // Founder role change (e.g. after hiring an outside CEO)
  founderRoleChange?: "ceo" | "cpo_chairman";
  // Sets a narrative flag by key
  setsFlag?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Story Choice
// Each event presents 2–3 choices. A choice can be conditionally locked.
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryChoice {
  id: string;
  label: string;
  description: string;
  // If condition returns false → choice is locked, conditionFailReason is shown
  condition?: (startup: Startup, storyState: StoryModeState) => boolean;
  conditionFailReason?: string;
  // Applied when the player picks this choice (and condition passes)
  onSuccess: StoryMetricDeltas;
  // Applied when condition passes but the outcome is bad (probabilistic events)
  onFail?: StoryMetricDeltas;
  // Probability of success (0–1). Default 1.0 (always succeeds).
  successRate?: number;
  successText: string;
  failText?: string;
  // Special sub-system flags — these open mini-game modals
  triggersKeynoteMiniGame?: boolean;
  triggersPitchDeckGame?: boolean;
  triggersAcquisitionPoker?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Story Event
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryEvent {
  id: string;           // Unique, kebab-case e.g. "pineapple_ipo"
  title: string;        // Emoji + bold headline
  description: string;  // Narrative paragraph (2–4 sentences, immersive)
  trigger: StoryTrigger;
  act: 1 | 2 | 3 | 4;
  choices: StoryChoice[];
  // Optional: pixel-art illustration slug. Maps to /public/story/[slug].png
  imageSlug?: string;
  // Optional: shift the ambient soundtrack
  soundtrackCue?: StorySoundtrackCue;
  // Clinmax events get special cinematic UI treatment (full-screen overlay)
  isClimax?: boolean;
  // Other event IDs that must be in completedEventIds before this fires
  requiredPriorEvents?: string[];
  // If any of these are in completedEventIds → this event is permanently skipped
  blockedByEvents?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Key Person
// Named inner circle (co-founders, key hires). Each has a loyalty meter.
// ─────────────────────────────────────────────────────────────────────────────
export interface KeyPerson {
  id: string;
  displayName: string;      // Short name shown in UI e.g. "Woz"
  title: string;            // Role e.g. "Co-Founder & Chief Engineer"
  historicalName: string;   // Flavor only — fictional name used for display
  emoji: string;
  loyalty: number;          // 0–100. Displayed as hearts.
  loyaltyThreshold: number; // Below this → triggers betrayal/departure event
  competence: {
    technical: number;      // 0–100
    marketing: number;
    leadership: number;
    fundraising: number;
  };
  secretAgenda?: string;    // Hidden text revealed when loyalty is low
  monthJoined: number;
  monthLeft?: number;
  isActive: boolean;        // false = not yet hired, or has left
  // Applied every month while isActive = true
  passiveEffect?: StoryMetricDeltas;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Board Member (Story Version)
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryBoardMember {
  id: string;
  name: string;
  seat: "founder" | "investor" | "independent";
  agenda: "growth" | "profitability" | "exit" | "control";
  loyaltyToFounder: number; // 0–100. Below 30 = will vote against you
  influence: number;        // 0–100 voting weight
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Board Vote Item
// Used when BoardRoomModal is shown.
// ─────────────────────────────────────────────────────────────────────────────
export interface BoardVoteItem {
  id: string;
  topic: string;
  description: string;
  requiredInfluenceToPass: number; // Total influence needed from yes-voters
  onPass: StoryMetricDeltas;
  onFail: StoryMetricDeltas;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Sprint Allocation
// Player distributes 100 points across 5 buckets each month.
// ─────────────────────────────────────────────────────────────────────────────
export type SprintBucket =
  | "engineering"
  | "design"
  | "marketing"
  | "sales"
  | "research";

export interface SprintAllocation {
  engineering: number;  // Must sum to 100 total
  design: number;
  marketing: number;
  sales: number;
  research: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Historical Rival
// Named rivals that run on a scripted timeline alongside the player.
// ─────────────────────────────────────────────────────────────────────────────
export interface HistoricalRival {
  id: string;
  name: string;        // Fictional analog e.g. "Big Blue" for IBM
  tagline: string;     // Shown in rival panel
  emoji: string;
  scheduledActions: {
    atMonth: number;
    description: string;
    impactOnPlayer: StoryMetricDeltas;
  }[];
  status: "dormant" | "threatening" | "dominant" | "defeated";
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Culture Archetype
// Derived from cumulative event choices. Affects talent and crisis risk.
// ─────────────────────────────────────────────────────────────────────────────
export type CultureArchetype =
  | "craft"       // Deliberate. Loyal senior engineers. Slow growth.
  | "hustle"      // Fast. High churn risk. PR volatile.
  | "ownership"   // Equity-first. Team fights for quality.
  | "enterprise"  // Process-heavy. Stable but slow.
  | "bro";        // High energy. PR liability.

// ─────────────────────────────────────────────────────────────────────────────
// 12. Soundtrack Cues
// ─────────────────────────────────────────────────────────────────────────────
export type StorySoundtrackCue =
  | "garage_era"        // lo-fi, intimate
  | "hypergrowth"       // kinetic electronic
  | "boardroom_crisis"  // tense strings
  | "comeback_arc"      // triumphant swell
  | "closing_bell";     // full orchestral milestone

// ─────────────────────────────────────────────────────────────────────────────
// 13. Keynote Mini-Game Types
// ─────────────────────────────────────────────────────────────────────────────
export interface KeynoteTarget {
  id: string;
  x: number;         // 0–100% of container width
  y: number;         // 0–100% of container height
  appearsAtMs: number;
  windowMs: number;  // How long the click window stays open
}

export type KeynoteMiniGamePhase = "countdown" | "active" | "results";

export interface KeynoteMiniGameState {
  eventId: string;
  targets: KeynoteTarget[];
  hitsLanded: number;
  totalTargets: number;
  score: number;     // 0–100 normalized
  phase: KeynoteMiniGamePhase;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Pitch Deck Card Types
// ─────────────────────────────────────────────────────────────────────────────
export type PitchCardType =
  | "revenue_traction"
  | "vision_demo"
  | "team_bio"
  | "market_size"
  | "customer_proof"
  | "product_demo";

export type VCPersonality =
  | "data_driven"
  | "vision_first"
  | "team_focused"
  | "fomo_driven"
  | "risk_averse";

export type PitchDeckResult =
  | "great_terms"   // Score 80–100 → favorable terms, less dilution
  | "fair_terms"    // Score 55–79 → standard terms
  | "poor_terms"    // Score 35–54 → high dilution
  | "rejected";     // Score <35 → no deal

export interface PitchDeckGameState {
  eventId: string;
  vcPersonality: VCPersonality;
  vcDescription: string;  // e.g. "Bets on moonshots, not spreadsheets"
  playerHand: PitchCardType[];    // 6 cards dealt
  selectedCards: PitchCardType[]; // Player picks 3
  phase: "select" | "results";
  result?: PitchDeckResult;
  score?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Win Condition
// ─────────────────────────────────────────────────────────────────────────────
export interface WinCondition {
  description: string;
  check: (startup: Startup, storyState: StoryModeState) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Act Definition
// ─────────────────────────────────────────────────────────────────────────────
export interface ActDefinition {
  act: 1 | 2 | 3 | 4;
  title: string;
  monthRange: [number, number];
  description: string;
  color: string;  // Tailwind color class for act badge e.g. "from-amber-500 to-orange-600"
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Campaign Definition
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 17. Historical Baselines
// Used by the Rubber-Band Engine to anchor the simulation to reality over time.
// ─────────────────────────────────────────────────────────────────────────────
export interface HistoricalBaseline {
  month: number;
  targetValuation: number;
  targetUsers: number;
  targetCash: number;
}

export interface StoryCampaign {
  id: CampaignId;
  companyName: string;
  founderName: string;
  founderEmoji: string;
  industry: string;
  tagline: string;
  description: string;
  difficulty: "Normal" | "Hard" | "Legendary";
  themeColors: {
    primary: string;    // e.g. "from-slate-700 to-slate-900"
    accent: string;     // e.g. "#6366f1"
    badge: string;      // e.g. "bg-slate-800 text-slate-200"
  };
  startingMetrics: {
    cash: number;
    burn_rate?: number;
    pricing?: number;
    users: number;
    product_quality: number;
    technical_debt: number;
    team_morale: number;
    brand_awareness: number;
    pmf_score: number;
    ceo_reputation: number;
    innovation: number;
  };
  winCondition: WinCondition;
  events: StoryEvent[];
  initialKeyPeople: KeyPerson[];        // isActive = true ones start immediately
  initialBoardMembers: StoryBoardMember[];
  initialRivals: HistoricalRival[];
  historicalBaselines?: HistoricalBaseline[];
  acts: ActDefinition[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. The Master Story State
// Stored in localStorage separately from sandbox saves.
// Key: founder_sim_story_{campaignId}
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryModeState {
  campaignId: CampaignId;
  currentAct: 1 | 2 | 3 | 4;
  currentMonth: number;
  completedEventIds: string[];
  skippedEventIds: string[];
  keyPeople: KeyPerson[];
  boardMembers: StoryBoardMember[];
  sprintAllocation: SprintAllocation;
  historicalRivals: HistoricalRival[];
  cultureArchetype: CultureArchetype;
  founderRole: "ceo" | "cpo_chairman";
  parallelUniverseUnlocked: boolean;
  hallOfLegendsEligible: boolean;
  keynoteScores: { eventId: string; score: number }[];
  pitchResults: {
    eventId: string;
    won: boolean;
    result: PitchDeckResult;
  }[];
  // Narrative flags: key = flag name, value = true when flag is set
  // Examples: { "hired_sculley": true, "completed_ipo": true }
  narrativeFlags: Record<string, boolean>;
  // Monthly notices from rival actions, key person effects etc.
  lastMonthNotices: string[];
  // Track pacing for filler events
  lastEventMonth?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. Story Save File (what goes into localStorage)
// ─────────────────────────────────────────────────────────────────────────────
export interface StorySaveFile {
  storyState: StoryModeState;
  // We store a lightweight snapshot of startup metrics — not the full Startup type
  // because Startup has Supabase-tied IDs we don't need in story mode
  startupSnapshot: StoryStartupSnapshot;
  // Rewind Feature (Premium)
  previousMonthState?: StoryModeState;
  previousMonthSnapshot?: StoryStartupSnapshot;
  savedAt: string; // ISO timestamp
  version: number; // For future migration. Start at 1.
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. Story Startup Snapshot
// A lightweight standalone model of the company state in Story Mode.
// This is NOT a Startup. It does NOT go to Supabase.
// It lives only in localStorage under founder_sim_story_{campaignId}.
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryStartupSnapshot {
  name: string;
  valuation: number;
  ceo_reputation: number;
  metrics: {
    cash: number;
    burn_rate: number;
    runway: number;
    users: number;
    revenue: number;
    product_quality: number;
    technical_debt: number;
    team_morale: number;
    brand_awareness: number;
    innovation: number;
    pmf_score: number;
    reliability: number;
    founder_health: number;
    founder_burnout: number;
    pricing: number;
  };
}

export interface FounderSkills {
  technical: number;
  leadership: number;
  marketing: number;
  fundraising: number;
  networking: number;
}
