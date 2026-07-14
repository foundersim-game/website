import { StoryEvent } from "./types";

const FILLER_EVENTS: Omit<StoryEvent, "id" | "trigger">[] = [
  {
    title: "📉 Supply Chain Hiccup",
    description: "A critical component supplier has delayed a major shipment. Your hardware team is scrambling to find alternatives without compromising quality.",
    act: 1, // Doesn't matter, overridden by engine
    choices: [
      {
        id: "pay_premium",
        label: "Pay a Premium for Rush Delivery",
        description: "Maintain quality, but burn cash.",
        onSuccess: { cash: -50000, product_quality: 2, team_morale: -5 },
        successText: "You absorbed the cost. The team worked weekend shifts, but the product shipped on time.",
      },
      {
        id: "use_cheaper",
        label: "Switch to a Cheaper Component",
        description: "Save money, but risk reliability.",
        onSuccess: { cash: 10000, product_quality: -5, reliability: -10 },
        successText: "The shipment went out, but quality control caught a few defects.",
      }
    ]
  },
  {
    title: "📰 Hit Piece in the Press",
    description: "A major tech publication just ran a story criticizing your leadership style and calling the company's culture 'toxic.'",
    act: 1,
    choices: [
      {
        id: "ignore_press",
        label: "Ignore It — Focus on Product",
        description: "Let the work speak for itself.",
        onSuccess: { ceo_reputation: -10, brand_awareness: -5 },
        successText: "The news cycle moves on quickly, though the sting remains.",
      },
      {
        id: "internal_memo",
        label: "Send an Internal Memo",
        description: "Reassure the team and boost morale.",
        onSuccess: { team_morale: 15, ceo_reputation: -5 },
        successText: "The team appreciated your honesty. They stand behind you.",
      }
    ]
  },
  {
    title: "🕵️ Poaching Attempt",
    description: "A rival company is aggressively trying to recruit your top engineers with massive salary bumps.",
    act: 1,
    choices: [
      {
        id: "match_offers",
        label: "Match Their Offers",
        description: "Increase payroll to keep the talent.",
        onSuccess: { burn_rate: 15000, team_morale: 10, technical_debt: -5 },
        successText: "They stayed. But your monthly burn rate just went up permanently.",
      },
      {
        id: "let_them_go",
        label: "Let Them Walk",
        description: "If they want to leave, let them. We only want true believers.",
        onSuccess: { team_morale: -10, product_quality: -5, technical_debt: 10 },
        successText: "A few key players left. Engineering velocity took a hit.",
      }
    ]
  },
  {
    title: "⚡ Server Outage",
    description: "Your infrastructure buckled under a sudden spike in traffic. Services have been down for 4 hours.",
    act: 1,
    choices: [
      {
        id: "all_hands",
        label: "All Hands on Deck",
        description: "Drop everything to fix it.",
        onSuccess: { team_morale: -15, technical_debt: -10, brand_awareness: -5 },
        successText: "It was a brutal 24 hours, but systems are back online and more robust.",
      },
      {
        id: "blame_provider",
        label: "Blame the Hosting Provider",
        description: "Shift the public blame to buy time.",
        onSuccess: { ceo_reputation: -5, brand_awareness: -10, reliability: -5 },
        successText: "The public didn't buy the excuse. The outage left a bad taste.",
      }
    ]
  },
  {
    title: "✨ Minor Feature Viral Hit",
    description: "A small Easter egg feature your design team slipped into the latest update has gone viral on social media.",
    act: 1,
    choices: [
      {
        id: "capitalize",
        label: "Capitalize on the Hype",
        description: "Run an ad campaign around it.",
        onSuccess: { cash: -15000, brand_awareness: 15, users: 5000 },
        successText: "The campaign worked beautifully. A surge of new users signed up.",
      },
      {
        id: "let_it_ride",
        label: "Let It Ride Organically",
        description: "Don't spend money, just enjoy the free press.",
        onSuccess: { brand_awareness: 5, team_morale: 10 },
        successText: "The team is thrilled their little feature got so much love.",
      }
    ]
  }
];

export function getFillerEvent(month: number, act: number): StoryEvent {
  // Pick a deterministic but seemingly random event based on the month
  const index = month % FILLER_EVENTS.length;
  const template = FILLER_EVENTS[index];
  
  return {
    ...template,
    id: `filler_event_${month}`,
    act: act as 1 | 2 | 3 | 4,
    trigger: { type: "month_reached", value: month }
  };
}

export function getBailoutEvent(): StoryEvent {
  return {
    id: "bailout_event",
    title: "🚨 Bankruptcy Looming",
    description: "Your company has completely run out of cash. The board is panicking. A predatory private equity firm is offering a toxic bailout package to save the company from immediate closure.",
    act: 1, // Doesn't matter, it interrupts
    trigger: { type: "month_reached", value: 0 },
    choices: [
      {
        id: "accept_bailout",
        label: "Accept the Toxic Term Sheet",
        description: "Survive, but at a massive cost.",
        onSuccess: { 
          cash: 50_000_000, 
          valuation_multiplier: 0.5, 
          team_morale: -40, 
          ceo_reputation: -30,
          setsFlag: "bailed_out"
        },
        successText: "The company survives another day, but the terms are brutal. Half your valuation is wiped out, and morale is destroyed.",
      },
      {
        id: "reject_bailout",
        label: "Reject the Offer (Game Over)",
        description: "You refuse to sell your soul.",
        onSuccess: { cash: -1 }, // Ensures checkLossConditions fails next check
        successText: "You stood your ground, but the payroll bounced.",
      }
    ]
  };
}
