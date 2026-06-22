// src/lib/story/pitchDeck.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pitch Deck card game helpers — dealing, scoring, result interpretation.
// NO imports from sandbox engine files.
// ─────────────────────────────────────────────────────────────────────────────

import { PitchCardType, VCPersonality, PitchDeckResult } from "./types";

// ── Full card deck ────────────────────────────────────────────────────────────

const FULL_DECK: PitchCardType[] = [
  "revenue_traction",
  "revenue_traction",
  "vision_demo",
  "vision_demo",
  "team_bio",
  "team_bio",
  "market_size",
  "market_size",
  "customer_proof",
  "customer_proof",
  "product_demo",
  "product_demo",
];

// ── Deal 6 cards from the deck (shuffled) ─────────────────────────────────────

export function dealPitchHand(): PitchCardType[] {
  const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

// ── Score a hand of 3 selected cards against VC personality ──────────────────
// Returns a score 0–100.

const CARD_SCORES: Record<VCPersonality, Record<PitchCardType, number>> = {
  data_driven: {
    revenue_traction: 30,
    market_size: 20,
    customer_proof: 20,
    product_demo: 15,
    team_bio: 10,
    vision_demo: 5,
  },
  vision_first: {
    vision_demo: 30,
    product_demo: 25,
    market_size: 20,
    team_bio: 15,
    revenue_traction: 5,
    customer_proof: 5,
  },
  team_focused: {
    team_bio: 35,
    vision_demo: 20,
    product_demo: 20,
    revenue_traction: 10,
    customer_proof: 10,
    market_size: 5,
  },
  fomo_driven: {
    market_size: 30,
    revenue_traction: 25,
    vision_demo: 20,
    customer_proof: 15,
    product_demo: 5,
    team_bio: 5,
  },
  risk_averse: {
    customer_proof: 30,
    revenue_traction: 25,
    team_bio: 20,
    product_demo: 15,
    market_size: 5,
    vision_demo: 5,
  },
};

export function scorePitchDeck(selected: PitchCardType[], vcPersonality: VCPersonality): number {
  if (selected.length !== 3) return 0;
  const scores = CARD_SCORES[vcPersonality];
  const raw = selected.reduce((sum, card) => sum + (scores[card] ?? 5), 0);
  // Max possible from 3 cards is ~85 (top 3 cards for this personality)
  // Normalize to 0–100
  return Math.min(100, Math.round((raw / 85) * 100));
}

// ── Interpret score into result ───────────────────────────────────────────────

export function interpretPitchScore(score: number): PitchDeckResult {
  if (score >= 80) return "great_terms";
  if (score >= 55) return "fair_terms";
  if (score >= 35) return "poor_terms";
  return "rejected";
}

// ── Result → human-readable impact ───────────────────────────────────────────

export interface PitchResultDetail {
  result: PitchDeckResult;
  headline: string;
  subtext: string;
  cashBonus: number;
  dilutionPct: number;
  emoji: string;
}

export function getPitchResultDetail(result: PitchDeckResult, baseFunding: number): PitchResultDetail {
  const details: Record<PitchDeckResult, Omit<PitchResultDetail, "result">> = {
    great_terms: {
      headline: "Term Sheet Signed! 🎉",
      subtext: "They loved it. Founder-friendly terms, minimal dilution.",
      cashBonus: Math.round(baseFunding * 1.0),
      dilutionPct: 10,
      emoji: "🤝",
    },
    fair_terms: {
      headline: "Deal Closed",
      subtext: "Standard market terms. You could've done better, but it's solid.",
      cashBonus: Math.round(baseFunding * 0.8),
      dilutionPct: 18,
      emoji: "✅",
    },
    poor_terms: {
      headline: "Tough Terms",
      subtext: "They're interested but don't fully believe. Heavy dilution.",
      cashBonus: Math.round(baseFunding * 0.5),
      dilutionPct: 28,
      emoji: "⚠️",
    },
    rejected: {
      headline: "Passed",
      subtext: "They're not the right fit. Find another investor.",
      cashBonus: 0,
      dilutionPct: 0,
      emoji: "❌",
    },
  };
  return { result, ...details[result] };
}

// ── VC Personality metadata ───────────────────────────────────────────────────

export interface VCPersonalityMeta {
  id: VCPersonality;
  name: string;
  description: string;
  emoji: string;
  strongCards: PitchCardType[];
}

export const VC_PERSONALITIES: VCPersonalityMeta[] = [
  {
    id: "data_driven",
    name: "The Analyst",
    description: "Brings a spreadsheet to every meeting. Revenue and customer proof are everything.",
    emoji: "📊",
    strongCards: ["revenue_traction", "market_size", "customer_proof"],
  },
  {
    id: "vision_first",
    name: "The Visionary",
    description: "Bets on moonshots and founders who think in decades, not quarters.",
    emoji: "🔭",
    strongCards: ["vision_demo", "product_demo", "market_size"],
  },
  {
    id: "team_focused",
    name: "The People Investor",
    description: "Invests in people first. If the team is world-class, they'll figure out the product.",
    emoji: "👥",
    strongCards: ["team_bio", "vision_demo", "product_demo"],
  },
  {
    id: "fomo_driven",
    name: "The FOMO Capitalist",
    description: "Scared of missing the next big thing. Market size and momentum are everything.",
    emoji: "🏃",
    strongCards: ["market_size", "revenue_traction", "vision_demo"],
  },
  {
    id: "risk_averse",
    name: "The Safety-First Partner",
    description: "Lost money on big bets before. Needs social proof and clear customer demand.",
    emoji: "🛡️",
    strongCards: ["customer_proof", "revenue_traction", "team_bio"],
  },
];

// ── Card metadata ─────────────────────────────────────────────────────────────

export interface CardMeta {
  id: PitchCardType;
  name: string;
  description: string;
  emoji: string;
}

export const PITCH_CARD_META: Record<PitchCardType, CardMeta> = {
  revenue_traction: {
    id: "revenue_traction",
    name: "Revenue Traction",
    description: "Show your MRR growth. Nothing convinces like a hockey stick.",
    emoji: "📈",
  },
  vision_demo: {
    id: "vision_demo",
    name: "Vision Demo",
    description: "Paint the 10-year picture. What does the world look like if you win?",
    emoji: "🌅",
  },
  team_bio: {
    id: "team_bio",
    name: "Team Bio",
    description: "Credentials, domain expertise, and founder-market fit.",
    emoji: "🧑‍🤝‍🧑",
  },
  market_size: {
    id: "market_size",
    name: "Market Size",
    description: "TAM/SAM/SOM. The bigger the pond, the easier the fish.",
    emoji: "🌎",
  },
  customer_proof: {
    id: "customer_proof",
    name: "Customer Proof",
    description: "Testimonials, case studies, signed LOIs. Real people, real demand.",
    emoji: "🗣️",
  },
  product_demo: {
    id: "product_demo",
    name: "Product Demo",
    description: "Show, don't tell. A 3-minute live demo beats a 30-slide deck.",
    emoji: "🖥️",
  },
};

// ── Random VC for an event ────────────────────────────────────────────────────

export function getRandomVCPersonality(): VCPersonality {
  const all: VCPersonality[] = ["data_driven", "vision_first", "team_focused", "fomo_driven", "risk_averse"];
  return all[Math.floor(Math.random() * all.length)];
}
