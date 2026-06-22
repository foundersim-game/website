// src/lib/story/sprintAllocation.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sprint Allocation helper functions.
// NO imports from sandbox engine files.
// ─────────────────────────────────────────────────────────────────────────────

import { SprintAllocation, SprintBucket, StoryMetricDeltas } from "./types";

// ── Default Allocation ────────────────────────────────────────────────────────

export const DEFAULT_SPRINT_ALLOCATION: SprintAllocation = {
  engineering: 40,
  design: 20,
  marketing: 20,
  sales: 10,
  research: 10,
};

// ── Validation ────────────────────────────────────────────────────────────────

export function validateAllocation(allocation: SprintAllocation): boolean {
  const total = Object.values(allocation).reduce((sum, v) => sum + v, 0);
  return Math.round(total) === 100;
}

export function getAllocationTotal(allocation: SprintAllocation): number {
  return Object.values(allocation).reduce((sum, v) => sum + v, 0);
}

// ── Computed Effects ──────────────────────────────────────────────────────────
// Returns the metric deltas that will be applied this month based on allocation.

export function computeSprintEffects(allocation: SprintAllocation): Partial<StoryMetricDeltas> {
  const total = getAllocationTotal(allocation);
  if (total === 0) return {};

  // Normalize fractions (sum to 1.0)
  const eng  = allocation.engineering / 100;
  const des  = allocation.design / 100;
  const mkt  = allocation.marketing / 100;
  const sal  = allocation.sales / 100;
  const res  = allocation.research / 100;

  return {
    product_quality:  Math.round(eng * 8 + des * 5),
    technical_debt:   Math.round(eng * 3),       // fast building = some debt
    brand_awareness:  Math.round(mkt * 4),
    users:            Math.round(mkt * 150 + sal * 80),
    pmf_score:        Math.round(res * 4),
    innovation:       Math.round(res * 3),
    team_morale:      Math.round(eng * 1 + des * 2 - sal * 1), // sales pressure slightly erodes morale
  };
}

// ── Human-Readable Impact Lines ───────────────────────────────────────────────

export interface AllocationImpactLine {
  bucket: SprintBucket;
  label: string;
  emoji: string;
  impacts: string[];
  value: number;
}

export function describeAllocationImpacts(allocation: SprintAllocation): AllocationImpactLine[] {
  const effects = computeSprintEffects(allocation);
  const lines: AllocationImpactLine[] = [
    {
      bucket: "engineering",
      label: "Engineering",
      emoji: "⚙️",
      value: allocation.engineering,
      impacts: [
        effects.product_quality ? `+${effects.product_quality} Product Quality` : "",
        effects.technical_debt ? `+${effects.technical_debt} Tech Debt (fast shipping)` : "",
      ].filter(Boolean),
    },
    {
      bucket: "design",
      label: "Design",
      emoji: "🎨",
      value: allocation.design,
      impacts: [
        allocation.design >= 20 ? "+5 Product Quality" : "+2 Product Quality",
        allocation.design >= 30 ? "+3 Brand Awareness" : "",
      ].filter(Boolean),
    },
    {
      bucket: "marketing",
      label: "Marketing",
      emoji: "📣",
      value: allocation.marketing,
      impacts: [
        effects.brand_awareness ? `+${effects.brand_awareness} Brand Awareness` : "",
        effects.users ? `+${effects.users} New Users` : "",
      ].filter(Boolean),
    },
    {
      bucket: "sales",
      label: "Sales",
      emoji: "💼",
      value: allocation.sales,
      impacts: [
        effects.users ? `+${Math.round(allocation.sales * 0.8)} Paid Conversions` : "",
        allocation.sales >= 30 ? "Minor morale pressure on team" : "",
      ].filter(Boolean),
    },
    {
      bucket: "research",
      label: "Research",
      emoji: "🔬",
      value: allocation.research,
      impacts: [
        effects.pmf_score ? `+${effects.pmf_score} PMF Score` : "",
        effects.innovation ? `+${effects.innovation} Innovation` : "",
      ].filter(Boolean),
    },
  ];

  return lines;
}

// ── Bucket Metadata ───────────────────────────────────────────────────────────

export const SPRINT_BUCKETS: { id: SprintBucket; label: string; emoji: string; description: string }[] = [
  { id: "engineering", label: "Engineering", emoji: "⚙️", description: "Build features, reduce technical debt, improve reliability." },
  { id: "design",      label: "Design",      emoji: "🎨", description: "Polish UI/UX, improve product quality and brand perception." },
  { id: "marketing",   label: "Marketing",   emoji: "📣", description: "Grow brand awareness and acquire new users." },
  { id: "sales",       label: "Sales",       emoji: "💼", description: "Convert users to paid customers, close enterprise deals." },
  { id: "research",    label: "Research",    emoji: "🔬", description: "Improve product-market fit and drive innovation." },
];
