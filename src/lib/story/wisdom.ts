// src/lib/story/wisdom.ts
// ─────────────────────────────────────────────────────────────────────────────
// Wisdom Callouts — Contextual insight shown in StoryEventModal
// Each event can carry a wisdom quote that gives a real-world lesson.
// Kept entirely fictional/generic — no attribution to real people.
// ─────────────────────────────────────────────────────────────────────────────

export interface WisdomCallout {
  quote: string;
  category: "lesson" | "warning" | "insight" | "principle";
}

// Map from event ID → wisdom callout
// Covers all key events across pineapple, bookface, searchgo
export const EVENT_WISDOM: Record<string, WisdomCallout> = {

  // ── PINEAPPLE ──────────────────────────────────────────────────────────────
  pineapple_founding: {
    quote: "Every trillion-dollar company was once an embarrassing garage project that most people thought was a waste of time.",
    category: "insight",
  },
  pineapple_apple_ii_launch: {
    quote: "The product doesn't have to be perfect. It has to be ready. Perfect ships later, or never.",
    category: "lesson",
  },
  pineapple_ouster: {
    quote: "Getting fired from your own company is a signal — not necessarily that you were wrong, but that you hadn't yet learned to lead people, not just ideas.",
    category: "lesson",
  },
  pineapple_next_era: {
    quote: "Exile forces reinvention. The years when you have nothing to lose are often the years you build the most important things.",
    category: "insight",
  },
  pineapple_return: {
    quote: "A comeback is not about proving people wrong. It's about finishing what you started when no one believed you could.",
    category: "principle",
  },
  pineapple_iMac_launch: {
    quote: "Design is not a skin. It is the product. The box, the color, the feel — all of it speaks before the user opens the lid.",
    category: "principle",
  },
  pineapple_itunes_store: {
    quote: "The best distribution moat is not logistics — it's making the ecosystem so convenient that leaving feels like a step backward.",
    category: "insight",
  },
  pineapple_ipod: {
    quote: "Hardware is hard. But hardware that software companies don't think they can build is how you create a category no one else occupies.",
    category: "lesson",
  },
  pineapple_iphone_project: {
    quote: "The most dangerous product you can build is the one that makes your own best product obsolete. Build it anyway, before someone else does.",
    category: "warning",
  },
  pineapple_orchard_store: {
    quote: "Platform businesses are asymmetric. You provide the rails. Everyone else builds the trains. You collect the ticket price regardless.",
    category: "insight",
  },

  // ── BOOKFACE ───────────────────────────────────────────────────────────────
  bookface_launch: {
    quote: "The most dangerous social networks are the ones that feel like the truth — real names, real faces, real stakes.",
    category: "insight",
  },
  bookface_equity_dilution: {
    quote: "Cap tables are where friendships go to die. Get everything in writing before you need it.",
    category: "warning",
  },
  bookface_seed_funding: {
    quote: "The first check is rarely about the business. It is about whether the investor thinks you are the kind of person who builds it.",
    category: "lesson",
  },
  bookface_news_feed: {
    quote: "The feature that changes engagement the most is rarely the one users asked for. It's the one they didn't know they couldn't live without.",
    category: "insight",
  },
  bookface_privacy_crisis: {
    quote: "Trust is the only asset you cannot buy back. Once users feel surveilled rather than served, the contract is broken.",
    category: "warning",
  },
  bookface_congressional_hearing: {
    quote: "Regulators move slowly. But when they move, they move forever. Get ahead of the rule, or the rule gets ahead of you.",
    category: "warning",
  },
  bookface_mobile_pivot: {
    quote: "The companies that survive platform shifts are not the ones who moved fastest. They are the ones who moved before they had to.",
    category: "lesson",
  },
  bookface_instagram: {
    quote: "The best acquisitions are the ones that feel irrationally expensive the day you announce them and obviously cheap five years later.",
    category: "insight",
  },
  bookface_metaverse_bet: {
    quote: "The founder who bets the company on the next platform either looks like a genius or a fool. The difference is usually a decade.",
    category: "insight",
  },

  // ── SEARCHGO ──────────────────────────────────────────────────────────────
  searchgo_backrub: {
    quote: "The index is not the product. Relevance is the product. Every competitor who forgot this lost.",
    category: "principle",
  },
  searchgo_pagerank: {
    quote: "The best algorithms feel obvious in retrospect. The hard part is being the first to believe something obvious before anyone else does.",
    category: "insight",
  },
  searchgo_hire_eric: {
    quote: "Bringing in experienced management is not a concession — it is leverage. The founder who refuses all help eventually runs out of both.",
    category: "lesson",
  },
  searchgo_adwords: {
    quote: "The best business model is one where the customer pays voluntarily, gets value immediately, and the more they use it, the more valuable it becomes for everyone.",
    category: "principle",
  },
  searchgo_gmail: {
    quote: "Give users something 100x better than what they have for free. The value created will eventually find a way to become revenue.",
    category: "lesson",
  },
  searchgo_ipo: {
    quote: "An IPO is not the finish line. It is the moment when your new boss becomes every investor on earth simultaneously.",
    category: "warning",
  },
  searchgo_china: {
    quote: "Revenue is not the only currency in business. The cost of a deal is not always measured in dollars.",
    category: "warning",
  },
  searchgo_android: {
    quote: "The most powerful strategic moves are the ones that make your core business distribution inevitable across every device on earth.",
    category: "principle",
  },
  searchgo_youtube: {
    quote: "When someone offers you a category leader at a price that seems absurd, the question is not 'is it worth it?' The question is 'what does the world look like if your competitor buys it instead?'",
    category: "insight",
  },
  searchgo_ai_threat: {
    quote: "Every technology company eventually faces a product that makes its core product look dated. The question is whether you build it or someone else does.",
    category: "warning",
  },
};

export function getWisdomForEvent(eventId: string): WisdomCallout | null {
  return EVENT_WISDOM[eventId] ?? null;
}
