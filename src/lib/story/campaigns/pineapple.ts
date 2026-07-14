// src/lib/story/campaigns/pineapple.ts
// ─────────────────────────────────────────────────────────────────────────────
// PINEAPPLE CAMPAIGN
// Company Name: Pineapple Computers → Pineapple Inc.
// Founder Name: Steve Blake (fictional)
// Win Condition: Reach $1 Trillion Valuation
// Duration: ~300 in-game months (25 years)
// ⚠️  All characters and products are fictional. Any resemblance to real persons is satirical.
//
// Acts:
//   Act 1 (Mo 1–48):   The Garage & The Rise
//   Act 2 (Mo 49–119): The Fall & The Wilderness
//   Act 3 (Mo 120–189): The Return of the King
//   Act 4 (Mo 190–300): The Ecosystem Monopoly
// ─────────────────────────────────────────────────────────────────────────────

import {
  StoryCampaign,
  StoryEvent,
  KeyPerson,
  StoryBoardMember,
  HistoricalRival,
  ActDefinition,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// KEY PEOPLE
// ─────────────────────────────────────────────────────────────────────────────

const WOZ: KeyPerson = {
  id: "boz",
  displayName: "Boz",
  title: "Co-Founder & Chief Engineer",
  historicalName: "Boz Winters",
  emoji: "🧑‍💻",
  loyalty: 90,
  loyaltyThreshold: 25,
  competence: { technical: 95, marketing: 15, leadership: 35, fundraising: 10 },
  secretAgenda: "Wants to give away his designs for free — money has never motivated him.",
  monthJoined: 1,
  isActive: true,
  passiveEffect: { product_quality: 5, innovation: 4 },
};

const MARKKULA: KeyPerson = {
  id: "makkala",
  displayName: "Mike M.",
  title: "Angel Investor & Board Mentor",
  historicalName: "Marcus Kaye",
  emoji: "💼",
  loyalty: 70,
  loyaltyThreshold: 30,
  competence: { technical: 20, marketing: 80, leadership: 75, fundraising: 90 },
  secretAgenda: "His marketing framework will define the brand — or smother your vision.",
  monthJoined: 10,
  isActive: false, // Activated by 'pineapple_first_angel' event
  passiveEffect: { brand_awareness: 2, ceo_reputation: 1 },
};

const SCULLEY: KeyPerson = {
  id: "sullivan",
  displayName: "Sullivan",
  title: "Chief Executive Officer",
  historicalName: "Jack Sullivan",
  emoji: "🍸",
  loyalty: 60,
  loyaltyThreshold: 35,
  competence: { technical: 10, marketing: 95, leadership: 70, fundraising: 85 },
  secretAgenda: "Wants to run this company his way. Your product obsession frustrates him.",
  monthJoined: 50,
  isActive: false, // Activated by 'pineapple_sugar_water' event
  passiveEffect: { brand_awareness: 8, ceo_reputation: -1 },
};

const JONY: KeyPerson = {
  id: "tony",
  displayName: "Tony",
  title: "Chief Design Officer",
  historicalName: "Jon Avery",
  emoji: "🎨",
  loyalty: 85,
  loyaltyThreshold: 20,
  competence: { technical: 50, marketing: 60, leadership: 55, fundraising: 10 },
  secretAgenda: undefined,
  monthJoined: 145,
  isActive: false, // Activated by 'pineapple_design_hire' event
  passiveEffect: { product_quality: 8, brand_awareness: 3 },
};

// ─────────────────────────────────────────────────────────────────────────────
// BOARD MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_BOARD: StoryBoardMember[] = [
  {
    id: "founder_seat",
    name: "You (Founder)",
    seat: "founder",
    agenda: "growth",
    loyaltyToFounder: 100,
    influence: 50,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HISTORICAL RIVALS
// ─────────────────────────────────────────────────────────────────────────────

const IBM_RIVAL: HistoricalRival = {
  id: "big_blue",
  name: "Big Blue",
  tagline: "The establishment. Suits, mainframes, and unlimited budget.",
  emoji: "🏢",
  scheduledActions: [
    {
      atMonth: 38,
      description: "Big Blue enters the personal computer market with a massive ad push and corporate relationships.",
      impactOnPlayer: { brand_awareness: -8, users: -300 },
    },
    {
      atMonth: 55,
      description: "Big Blue captures 25% of the PC market. The press questions if you can survive.",
      impactOnPlayer: { brand_awareness: -12, team_morale: -8 },
    },
    {
      atMonth: 80,
      description: "Big Blue partners with Softek to control the OS market. The industry is consolidating around them.",
      impactOnPlayer: { brand_awareness: -5, pmf_score: -5 },
    },
  ],
  status: "dormant",
};

const MICROSOFT_RIVAL: HistoricalRival = {
  id: "softek",
  name: "Softek",
  tagline: "They copied your vision. Now they're everywhere.",
  emoji: "💻",
  scheduledActions: [
    {
      atMonth: 126,
      description: "Softek launches its new OS — it looks strangely familiar. The press notices.",
      impactOnPlayer: { brand_awareness: -5, ceo_reputation: -5 },
    },
    {
      atMonth: 200,
      description: "Softek's browser is pre-installed on 90% of new computers. Your web strategy is threatened.",
      impactOnPlayer: { users: -500, brand_awareness: -8 },
    },
  ],
  status: "dormant",
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTS
// ─────────────────────────────────────────────────────────────────────────────

const ACTS: ActDefinition[] = [
  {
    act: 1,
    title: "The Garage & The Rise",
    monthRange: [1, 84],
    description: "Two visionaries, a garage, and a dream to put computers in every home.",
    color: "from-amber-500 to-orange-600",
  },
  {
    act: 2,
    title: "The Fall & The Wilderness",
    monthRange: [85, 249],
    description: "Betrayed by the man you hired. Cast out of your own creation.",
    color: "from-slate-600 to-slate-800",
  },
  {
    act: 3,
    title: "The Return of the King",
    monthRange: [250, 305],
    description: "90 days from bankruptcy. One acquisition. One last chance to rewrite history.",
    color: "from-violet-600 to-purple-800",
  },
  {
    act: 4,
    title: "The Ecosystem Monopoly",
    monthRange: [306, 600],
    description: "iSphere. Orchard Store. $1 Trillion. Your legacy, secured forever.",
    color: "from-cyan-500 to-blue-700",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 1: The Garage & The Rise (Months 1–84)
// ─────────────────────────────────────────────────────────────────────────────

const ACT1_EVENTS: StoryEvent[] = [
  {
    id: "pineapple_garage",
    title: "🏠 The Garage",
    description: "It's 1976. You and Boz are hand-building circuit boards in your parents' garage in Los Altos. You have a working prototype of the Pineapple I — but you need $1,300 for parts to build 50 units for Byte Shop, a local computer store that might actually buy them.",
    trigger: { type: "month_reached", value: 1 },
    act: 1,
    imageSlug: "garage",
    soundtrackCue: "garage_era",
    choices: [
      {
        id: "sell_possessions",
        label: "Sell Your VW Bus & Calculators",
        description: "Liquidate your personal electronics and your car to raise parts money. All in.",
        onSuccess: { cash: 1300, team_morale: 15, setsFlag: "sold_possessions" },
        successText: "You raised $1,300 scraping everything together. Boz is impressed. The Pineapple I is being built.",
      },
      {
        id: "beg_byte_shop",
        label: "Convince Byte Shop to Pre-Order",
        description: "Pitch the store owner on a pre-order of 50 units at $500 each before you build them.",
        condition: (_s, state) => (state.narrativeFlags["sold_possessions"] === true) || true,
        onSuccess: { cash: 25000, users: 50, brand_awareness: 12, setsFlag: "byte_shop_deal" },
        onFail: { team_morale: -15, brand_awareness: -5 },
        successRate: 0.65,
        successText: "Byte Shop placed an order for 50 units! You're officially in business.",
        failText: "They weren't convinced yet. You need more credibility.",
      },
    ],
  },

  {
    id: "pineapple_woz_accident",
    title: "🚁 Boz's Accident",
    description: "Boz was in a small plane crash. He's physically okay, but he's shaken up — talking about taking a leave of absence to finish his college degree. The Pineapple II launch is 4 months away.",
    trigger: { type: "month_reached", value: 4 },
    act: 1,
    choices: [
      {
        id: "convince_woz_to_stay",
        label: "Convince Boz to Stay — Passionately",
        description: "Have an honest, personal conversation about what you're building together.",
        onSuccess: {
          keyPersonLoyaltyDelta: [{ personId: "boz", delta: 15 }],
          team_morale: 10,
          setsFlag: "woz_committed",
        },
        successText: "Boz stays. He's all in. That conversation reminded him why you started this.",
      },
      {
        id: "let_woz_take_leave",
        label: "Support Him — Give Him Time",
        description: "Tell him to take the time he needs. He'll come back stronger.",
        onSuccess: {
          keyPersonLoyaltyDelta: [{ personId: "boz", delta: 25 }],
          product_quality: -8,
          team_morale: -10,
        },
        successText: "Boz takes 2 months off. The loyalty runs deep — he returns recharged.",
      },
    ],
  },

  {
    id: "pineapple_faire",
    title: "🖥️ The West Coast Computer Faire",
    description: "April 1977. The first major consumer computer expo. 13,000 attendees. You're debuting the Pineapple II — color graphics, a real keyboard, a molded plastic case. Your booth is at the entrance. Every journalist in tech is here.",
    trigger: { type: "month_reached", value: 12 },
    act: 1,
    imageSlug: "faire",
    soundtrackCue: "garage_era",
    isClimax: true,
    choices: [
      {
        id: "grand_debut",
        label: "Go All-In — Professional Booth, Live Demo",
        description: "Spend $5,000 on a polished booth and run live demos all day.",
        condition: (s) => s.metrics.cash > 5000,
        conditionFailReason: "You need at least $5,000 in cash for a booth like this.",
        onSuccess: {
          cash: -5000,
          users: 1200,
          brand_awareness: 25,
          valuation_multiplier: 2.5,
          ceo_reputation: 15,
        },
        successText: "The Pineapple II is a sensation. Orders flood in. Journalists call it 'the most impressive personal computer ever built.'",
      },
      {
        id: "scrappy_debut",
        label: "Scrappy Booth — Let the Product Speak",
        description: "Minimal setup, no frills. Just the machine running.",
        onSuccess: { users: 400, brand_awareness: 12, cash: -800 },
        successText: "You got solid interest. The machine impressed serious hobbyists.",
      },
      {
        id: "skip_faire",
        label: "Skip It — Product Isn't Ready",
        description: "Keep building. Don't show publicly until it's perfect.",
        condition: (s) => s.metrics.product_quality < 45,
        conditionFailReason: "Your product quality is good enough. Don't miss this.",
        onSuccess: { product_quality: 8 },
        successText: "You skipped the Faire. You used the time to polish. A missed opportunity, but the product is stronger.",
      },
    ],
  },

  {
    id: "pineapple_first_angel",
    title: "💰 The First Angel",
    description: "Marcus Kaye shows up at your garage. Former chip company marketing executive. He believes in what you're building so much he's offering $250,000 and hands-on marketing expertise — in exchange for a 30% equity stake and a board seat. This will change everything.",
    trigger: { type: "month_reached", value: 8 },
    act: 1,
    choices: [
      {
        id: "accept_markkula",
        label: "Accept — Take the $250K",
        description: "Give up 30% equity. Marcus joins the board and brings professional marketing.",
        onSuccess: {
          cash: 250000,
          brand_awareness: 20,
          ceo_reputation: 10,
          activatesKeyPersonId: "makkala",
          keyPersonLoyaltyDelta: [{ personId: "makkala", delta: 20 }],
          setsFlag: "markkula_onboard",
        },
        successText: "Marcus is in. His 'Empathy, Focus, and Impute' marketing philosophy will shape the brand forever.",
      },
      {
        id: "negotiate_equity",
        label: "Negotiate — Push for 20% Equity",
        description: "Try to keep more equity. Risk losing the deal.",
        onSuccess: {
          cash: 250000,
          brand_awareness: 15,
          activatesKeyPersonId: "makkala",
          keyPersonLoyaltyDelta: [{ personId: "makkala", delta: 5 }],
          setsFlag: "markkula_onboard",
        },
        onFail: { team_morale: -10, ceo_reputation: -5 },
        successRate: 0.5,
        successText: "Marcus agreed to 20%. He's slightly less enthusiastic — but he's in.",
        failText: "Marcus walked. He doesn't negotiate on terms he believes in. The deal is off.",
      },
      {
        id: "bootstrap_harder",
        label: "Bootstrap — Keep Full Control",
        description: "Walk away from the money. Stay 100% owners.",
        condition: (s) => s.metrics.cash >= 15000,
        conditionFailReason: "You need at least $15,000 in cash to survive without this investment.",
        onSuccess: { team_morale: 10, ceo_reputation: 5 },
        successText: "You turned down the money. Every % stays yours — for now.",
      },
    ],
  },

  {
    id: "pineapple_ipo_prep",
    title: "📈 Going Public",
    description: "December 1980. The Pineapple II has been a runaway success. Investors are lining up. Your underwriters say you could raise $100M+ in an IPO and it would be the largest tech IPO since Ford. The press is calling it 'the IPO of the decade.'",
    trigger: { type: "month_reached", value: 56 },
    act: 1,
    isClimax: true,
    soundtrackCue: "hypergrowth",
    requiredPriorEvents: ["pineapple_first_angel"],
    choices: [
      {
        id: "do_ipo",
        label: "Ring the Bell — Go Public",
        description: "File the S-1, do the roadshow, and list on NASDAQ. You'll be worth $200M on Day 1.",
        condition: (s) => s.metrics.product_quality >= 55 && s.metrics.users >= 800,
        conditionFailReason: "Need Product Quality ≥ 55 and Users ≥ 800 to satisfy institutional investors.",
        onSuccess: {
          cash: 100_000_000,
          valuation_multiplier: 4.0,
          brand_awareness: 30,
          ceo_reputation: 20,
          setsFlag: "completed_ipo",
        },
        successText: "Day 1: Your stock opens at double the IPO price. You're worth $256M on paper. The team cries on the trading floor.",
        triggersKeynoteMiniGame: false,
      },
      {
        id: "stay_private",
        label: "Stay Private — Keep Control",
        description: "Decline the IPO. Stay private, raise a private round instead.",
        onSuccess: {
          cash: 15_000_000,
          brand_awareness: 10,
          valuation_multiplier: 1.5,
        },
        successText: "You stay private. More control, less pressure — but the press questions your ambition.",
      },
    ],
  },

  {
    id: "pineapple_iii_disaster",
    title: "💀 The Pineapple III Disaster",
    description: "You overrode engineering decisions to make the Pineapple III thinner and fanless. It runs so hot that solder chips melt and clock chips fail. 14,000 units have been shipped. Customers are returning them. The press is calling it 'the most expensive paperweight in Silicon Valley.'",
    trigger: { type: "month_reached", value: 60 },
    act: 1,
    choices: [
      {
        id: "full_recall",
        label: "Full Recall — Own the Mistake",
        description: "Pull all units, offer replacements, issue a public apology. Cost: $2.5M.",
        onSuccess: {
          cash: -2_500_000,
          ceo_reputation: 10,
          brand_awareness: -15,
          team_morale: 10,
          product_quality: -10,
        },
        successText: "You recalled every unit. The press respects your honesty. Trust holds — barely.",
      },
      {
        id: "patch_and_spin",
        label: "Software Patch + PR Spin",
        description: "Release a firmware update and call it a 'thermal management enhancement.'",
        onSuccess: { ceo_reputation: -15, brand_awareness: -25, cash: -200_000 },
        successText: "Nobody bought the spin. The press eviscerated you. Brand awareness craters.",
      },
      {
        id: "blame_engineers",
        label: "Blame Engineering — Fire the VP",
        description: "Publicly blame your hardware VP. Fire him. Deny you overrode decisions.",
        onSuccess: {
          ceo_reputation: -20,
          team_morale: -25,
          brand_awareness: -20,
          keyPersonLoyaltyDelta: [{ personId: "boz", delta: -20 }],
        },
        successText: "The team knows the truth. Morale collapses. Boz is furious — he was in those meetings.",
      },
    ],
  },

  {
    id: "pineapple_xerox_parc",
    title: "🔬 The Zenith Labs Visit",
    description: "You've arranged a visit to Zenith's research lab — Labs — where they've built something extraordinary: a graphical user interface with a mouse, windows, and icons. They've had this for years and done nothing with it. You see the future in one afternoon.",
    trigger: { type: "month_reached", value: 44 },
    act: 1,
    imageSlug: "xerox_parc",
    choices: [
      {
        id: "steal_the_idea",
        label: "Borrow Everything — This Is the Future",
        description: "Take the GUI concept wholesale. Build it into your next machine.",
        onSuccess: {
          innovation: 30,
          product_quality: 15,
          technical_debt: 10,
          setsFlag: "gui_adopted",
        },
        successText: "You saw the future that afternoon. Now you're going to ship it to the world.",
      },
      {
        id: "license_properly",
        label: "License It — Pay Zenith Fairly",
        description: "Negotiate a proper IP license. Slower but cleaner.",
        condition: (s) => s.metrics.cash >= 1_000_000,
        conditionFailReason: "Licensing requires at least $1M in cash reserves.",
        onSuccess: {
          cash: -1_000_000,
          innovation: 25,
          product_quality: 15,
          ceo_reputation: 10,
          setsFlag: "gui_adopted",
        },
        successText: "You paid for a clean license. You can now build without legal risk.",
      },
      {
        id: "build_from_scratch",
        label: "Inspired But Build Our Own Vision",
        description: "Take the concept as inspiration but build your own interpretation from scratch.",
        onSuccess: { innovation: 20, product_quality: 10, setsFlag: "gui_adopted" },
        successText: "You returned to the garage with one mission: build it better.",
      },
    ],
  },

  {
    id: "pineapple_cofounder_split",
    title: "💔 Boz Wants Out",
    description: "Boz has decided he wants to leave. He says the company has changed — it's become political, bureaucratic, corporate. He wants to go back to building things with his hands. He's offering to sell his shares quietly and leave without drama.",
    trigger: { type: "month_reached", value: 66 },
    act: 1,
    requiredPriorEvents: ["pineapple_garage"],
    choices: [
      {
        id: "let_woz_go",
        label: "Respect His Decision — Wish Him Well",
        description: "Buy his shares at a fair price and part as friends.",
        condition: (s) => s.metrics.cash >= 5_000_000,
        conditionFailReason: "You need at least $5M to buy his shares at fair value.",
        onSuccess: {
          cash: -5_000_000,
          deactivatesKeyPersonId: "boz",
          ceo_reputation: 10,
          team_morale: -5,
          setsFlag: "woz_departed_cleanly",
        },
        successText: "Boz leaves with dignity. He tells the press you're 'still the best product mind in Silicon Valley.'",
      },
      {
        id: "fight_to_keep_woz",
        label: "Fight to Keep Him — Make It Personal",
        description: "Have the most honest conversation of your life. Ask him to stay one more year.",
        onSuccess: {
          keyPersonLoyaltyDelta: [{ personId: "boz", delta: 20 }],
          team_morale: 15,
          setsFlag: "woz_stayed",
        },
        onFail: {
          deactivatesKeyPersonId: "boz",
          team_morale: -20,
          ceo_reputation: -5,
        },
        successRate: 0.55,
        successText: "Boz agrees to stay another year. The team sees it as a vote of confidence in the mission.",
        failText: "He's made up his mind. Boz leaves quietly. The company feels different without him.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 2: The Fall & The Wilderness (Months 85–249)
// ─────────────────────────────────────────────────────────────────────────────

const ACT2_EVENTS: StoryEvent[] = [
  {
    id: "pineapple_sugar_water",
    title: "🍬 'Do You Want to Sell Sugar Water?'",
    description: "You've been courting Jack Sullivan — a beverage empire president and marketing genius who ran the Cola Challenge campaign. Your pitch to him: 'Do you want to sell sugar water for the rest of your life, or do you want to come with me and change the world?' He's ready to say yes — but hiring him means giving up the CEO title.",
    trigger: { type: "month_reached", value: 85 },
    act: 2,
    imageSlug: "boardroom",
    soundtrackCue: "boardroom_crisis",
    choices: [
      {
        id: "hire_sculley_as_ceo",
        label: "Hire Sullivan as CEO — You Become Chairman",
        description: "You become President & Chairman of the board. He runs the company day-to-day.",
        onSuccess: {
          brand_awareness: 25,
          ceo_reputation: -8,
          founderRoleChange: "cpo_chairman",
          activatesKeyPersonId: "sullivan",
          keyPersonLoyaltyDelta: [{ personId: "sullivan", delta: 30 }],
          setsFlag: "hired_outside_ceo",
          unlocksEventId: "pineapple_boardroom_coup",
        },
        successText: "Sullivan is CEO. The board is thrilled. You feel the power shift immediately — and you hate it.",
      },
      {
        id: "stay_as_ceo",
        label: "Stay as CEO — Lead It Yourself",
        description: "Decline the Sullivan hire. You lead the company. The board gets nervous.",
        condition: (s) => s.metrics.team_morale >= 55 && (s.ceo_reputation ?? 0) >= 60,
        conditionFailReason: "Your team morale or reputation is too low. The board won't support a solo CEO right now.",
        onSuccess: {
          team_morale: 12,
          ceo_reputation: 15,
          blocksEventId: "pineapple_boardroom_coup",
          setsFlag: "stayed_as_ceo",
        },
        successText: "You stay as CEO. Harder path — but this company was always yours to lead.",
      },
    ],
  },

  {
    id: "pineapple_mac_launch",
    title: "💻 Hello, World",
    description: "January 24, 1984. You've been working on the PineMac in secret for 3 years — a computer with a GUI, a mouse, and a soul. The launch keynote is in 2 days. You're going to introduce it to the world yourself.",
    trigger: { type: "month_reached", value: 94 },
    act: 2,
    imageSlug: "keynote",
    soundtrackCue: "hypergrowth",
    isClimax: true,
    choices: [
      {
        id: "legendary_keynote",
        label: "Deliver the Keynote Yourself",
        description: "Take the stage and introduce the Mac to the world — personally. It's a live performance.",
        triggersKeynoteMiniGame: true,
        onSuccess: {
          users: 50000,
          brand_awareness: 35,
          valuation_multiplier: 2.0,
          ceo_reputation: 25,
          setsFlag: "mac_launched",
        },
        onFail: {
          users: 15000,
          brand_awareness: 15,
          valuation_multiplier: 1.3,
          setsFlag: "mac_launched",
        },
        successText: "The Mac says 'Hello.' The crowd erupts. The '1984' ad airs during the Super Bowl. The world changes.",
        failText: "The demo works but feels flat. Sales are decent. The press calls it 'promising but underwhelming.'",
      },
      {
        id: "press_only_launch",
        label: "Press-Only Preview — No Public Show",
        description: "Invite 100 journalists for a private demo. More controlled, less iconic.",
        onSuccess: {
          users: 20000,
          brand_awareness: 20,
          valuation_multiplier: 1.5,
          setsFlag: "mac_launched",
        },
        successText: "Solid reviews. Strong sales. Less legend — but the Mac is out in the world.",
      },
    ],
  },

  {
    id: "pineapple_boardroom_coup",
    title: "⚔️ The Boardroom Coup",
    description: "Sullivan has called an emergency board meeting — without telling you. He's presented growth numbers you've disputed. The board is about to vote on removing you from all operational roles. You have one hour to fight for your company.",
    trigger: { type: "month_reached", value: 110 },
    act: 2,
    imageSlug: "boardroom",
    soundtrackCue: "boardroom_crisis",
    isClimax: true,
    requiredPriorEvents: ["pineapple_sugar_water"],
    blockedByEvents: ["pineapple_sugar_water"],  // Only fires if Sullivan was hired
    choices: [
      {
        id: "fight_the_board",
        label: "Fight — Present Your Vision to the Board",
        description: "Give the speech of your life. Show them the next 10 years.",
        condition: (s) => (s.ceo_reputation ?? 0) >= 50 && s.metrics.team_morale >= 45,
        conditionFailReason: "CEO Reputation < 50 or Team Morale < 45 — the board won't listen to you.",
        onSuccess: {
          ceo_reputation: 15,
          team_morale: 10,
          keyPersonLoyaltyDelta: [{ personId: "sullivan", delta: -25 }],
          setsFlag: "survived_coup",
        },
        onFail: {
          ceo_reputation: -20,
          founderRoleChange: "cpo_chairman",
          setsFlag: "lost_coup",
        },
        successRate: 0.5,
        successText: "You survived. The board kept you — but Sullivan is now your enemy.",
        failText: "You lost. The board sided with Sullivan. They stripped your operational role.",
      },
      {
        id: "negotiate_exit",
        label: "Negotiate Gracefully — Keep Your Shares",
        description: "Don't fight. Negotiate a dignified exit. You keep all your equity.",
        onSuccess: {
          ceo_reputation: 5,
          team_morale: -15,
          founderRoleChange: "cpo_chairman",
          setsFlag: "negotiated_exit",
        },
        successText: "You exit with your equity and your dignity. The press mourns the loss of Pineapple's soul.",
      },
    ],
  },

  {
    id: "pineapple_exile_begins",
    title: "🏝️ The Wilderness Years",
    description: "You've been pushed out. You're 30 years old, worth $200M, and have no idea what to do with yourself. You could start a new company, buy a movie studio, or travel the world. But every morning you think about Pineapple.",
    trigger: { type: "month_reached", value: 113 },
    act: 2,
    choices: [
      {
        id: "start_nextstep",
        label: "Start NextStep — Build the OS of the Future",
        description: "Found a new company focused on a powerful next-generation operating system.",
        onSuccess: {
          cash: -12_000_000,
          innovation: 25,
          product_quality: 20,
          brand_awareness: 5,
          setsFlag: "nextstep_founded",
        },
        successText: "NextStep is born. The technology is extraordinary. The market doesn't understand it yet.",
      },
      {
        id: "buy_pixar",
        label: "Buy Voxel — The Animation Studio",
        description: "Acquire a struggling computer animation division for $10M. It's a long shot.",
        condition: (s) => s.metrics.cash >= 10_000_000,
        conditionFailReason: "You need at least $10M in personal cash to acquire Voxel.",
        onSuccess: {
          cash: -10_000_000,
          brand_awareness: 10,
          setsFlag: "pixar_acquired",
        },
        successText: "You bought Voxel for $10M. Their first movie will be called 'Block Story.' Nobody knows it yet.",
      },
      {
        id: "travel_and_reflect",
        label: "Travel India — Seek Clarity",
        description: "Take 6 months off. Reflect. Let the ideas marinate.",
        onSuccess: {
          founder_health: 20,
          founder_burnout: -30,
          innovation: 10,
        },
        successText: "Six months of silence. When you return, you see everything differently.",
      },
    ],
  },

  {
    id: "pineapple_pixar_toy_story",
    title: "🎬 Block Story",
    description: "Voxel has finished their first feature film — Block Story. It's the world's first fully computer-animated movie. The Kingdom is distributing it. If it's a hit, Voxel becomes enormously valuable. If it bombs, you've lost $60M.",
    trigger: { type: "month_reached", value: 236 },
    act: 2,
    requiredPriorEvents: ["pineapple_exile_begins"],
    choices: [
      {
        id: "release_toy_story",
        label: "Release It — Trust the Vision",
        description: "Let it out. You believe in this team.",
        condition: (_s, state) => state.narrativeFlags["pixar_acquired"] === true,
        conditionFailReason: "You didn't acquire Voxel. This event isn't available.",
        onSuccess: {
          cash: 80_000_000,
          valuation_multiplier: 1.8,
          brand_awareness: 20,
          ceo_reputation: 15,
          setsFlag: "pixar_success",
        },
        successText: "Block Story grosses $360M. Voxel's IPO raises $140M. Your $10M investment is now worth $1.2B.",
      },
      {
        id: "pixar_missed",
        label: "We Didn't Buy Them",
        description: "You watched from the sidelines as Block Story became a massive hit.",
        condition: (_s, state) => !state.narrativeFlags["pixar_acquired"],
        onSuccess: {},
        successText: "A missed opportunity, but you have other things to focus on.",
      }
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 3: The Return of the King (Months 250–305)
// ─────────────────────────────────────────────────────────────────────────────

const ACT3_EVENTS: StoryEvent[] = [
  {
    id: "pineapple_return",
    title: "🎯 The Return",
    description: "1996. Pineapple is 90 days from bankruptcy. Their OS is a disaster. Their stock is at an all-time low. And they've just agreed to acquire your NextStep company for $427M — which brings you back inside the building you were thrown out of 11 years ago.",
    trigger: { type: "month_reached", value: 250 },
    act: 3,
    imageSlug: "return",
    soundtrackCue: "comeback_arc",
    isClimax: true,
    choices: [
      {
        id: "accept_return",
        label: "Accept — Return as Interim CEO",
        description: "Walk back into One Infinite Loop. Tear everything down. Start rebuilding.",
        onSuccess: {
          cash: 427_000_000,
          valuation_multiplier: 0.5,  // Pineapple is worth very little right now
          ceo_reputation: 20,
          founderRoleChange: "ceo",
          team_morale: 20,
          setsFlag: "returned_as_ceo",
        },
        successText: "You walk back in. 3,000 employees stare at you. 'I'm Steve. I'm back. Let's get to work.'",
      },
    ],
  },

  {
    id: "pineapple_product_purge",
    title: "🔪 The Product Purge",
    description: "Pineapple has 40+ products. Printers, cameras, TVs, a handheld device called Newton, a dozen Mac variants. You've done the analysis: almost all are losing money. You want to kill 70% of them and focus on 4 products. The board is horrified.",
    trigger: { type: "month_reached", value: 256 },
    act: 3,
    requiredPriorEvents: ["pineapple_return"],
    choices: [
      {
        id: "kill_products",
        label: "Kill 70% of Products — Focus Brutally",
        description: "Eliminate everything that isn't core. Fire 3,000 people. Rebuild from 4 products.",
        onSuccess: {
          burn_rate: -5_000_000,
          product_quality: 15,
          team_morale: -15,
          brand_awareness: 5,
          technical_debt: -20,
          setsFlag: "product_focus",
        },
        successText: "The purge is brutal. But the team that remains? They know exactly what they're building.",
      },
      {
        id: "gradual_sunset",
        label: "Gradual Sunset Over 12 Months",
        description: "Slower, softer — fewer layoffs but slower recovery.",
        onSuccess: {
          burn_rate: -2_000_000,
          product_quality: 8,
          team_morale: -5,
        },
        successText: "Slower but humane. The press calls it 'measured.' It's not fast enough — but it works.",
      },
    ],
  },

  {
    id: "pineapple_microsoft_pact",
    title: "🤝 The Enemy at the Gates",
    description: "Softek will invest $150M in Pineapple and guarantee Office on Mac for 5 years — but you have to abandon the IP lawsuit, and they get non-voting shares. At the TechWorld keynote, the Softek CEO's face appears on a giant screen behind you while you announce this. The crowd boos.",
    trigger: { type: "month_reached", value: 257 },
    act: 3,
    requiredPriorEvents: ["pineapple_return"],
    choices: [
      {
        id: "accept_softek_deal",
        label: "Accept the Deal — Survival First",
        description: "Take the $150M. Drop the lawsuit. Make the deal you have to make.",
        onSuccess: {
          cash: 150_000_000,
          ceo_reputation: -10,
          brand_awareness: -10,
          team_morale: -10,
          setsFlag: "softek_deal",
        },
        successText: "The crowd boos. But you have $150M and a guaranteed platform. Pineapple will survive this.",
      },
      {
        id: "reject_softek",
        label: "Reject It — Fight on All Fronts",
        description: "No deal with the enemy. Fight the IP lawsuit. Find another investor.",
        condition: (s) => s.metrics.cash >= 50_000_000,
        conditionFailReason: "You need at least $50M in reserves to survive without Softek.",
        onSuccess: {
          ceo_reputation: 15,
          brand_awareness: 15,
          team_morale: 15,
          cash: -20_000_000, // legal fees
        },
        successText: "The crowd goes wild. You're going to fight. The IP suit drags on — but the team rallies.",
      },
    ],
  },

  {
    id: "pineapple_think_different",
    title: "🌟 'Think Different'",
    description: "You fired your ad agency and hired TBWA. They came back with a concept called 'Think Different' — a tribute to the rebels and misfits who change the world. Einstein. Gandhi. Lennon. Chaplin. It's the most expensive ad campaign in Pineapple's history. It's also exactly what the brand needs.",
    trigger: { type: "month_reached", value: 258 },
    act: 3,
    requiredPriorEvents: ["pineapple_return"],
    choices: [
      {
        id: "greenlight_think_different",
        label: "Greenlight It — This Is Who We Are",
        description: "Spend $100M on the full campaign. TV, print, billboards nationwide.",
        condition: (s) => s.metrics.cash >= 100_000_000,
        conditionFailReason: "You need $100M in cash for a campaign of this scale.",
        onSuccess: {
          cash: -100_000_000,
          brand_awareness: 40,
          ceo_reputation: 20,
          valuation_multiplier: 1.5,
          setsFlag: "think_different",
        },
        successText: "The campaign runs. Pineapple is cool again. Wall Street doesn't understand why — but customers do.",
      },
      {
        id: "cancel_campaign",
        label: "Cancel the Campaign",
        description: "You don't have the cash for either option.",
        onSuccess: {
          brand_awareness: -10,
          team_morale: -10,
        },
        successText: "TBWA resigned the account. The brand remains stagnant.",
      },
      {
        id: "smaller_campaign",
        label: "Smaller Budget — $20M Campaign",
        description: "Same concept, reduced scale.",
        condition: (s) => s.metrics.cash >= 20_000_000,
        conditionFailReason: "You need at least $20M in cash.",
        onSuccess: {
          cash: -20_000_000,
          brand_awareness: 20,
          ceo_reputation: 10,
        },
        successText: "A smaller roll-out. The ads resonate but the reach is limited.",
      },
    ],
  },

  {
    id: "pineapple_imac_launch",
    title: "🖥️ The iMac",
    description: "A translucent blue teardrop-shaped all-in-one computer. The iMac. No floppy drive (the world is outraged). USB ports (nobody uses USB yet). A handle for 'portability.' The press thinks you're insane. Jon A. thinks it's perfect. You agree with Jon A.",
    trigger: { type: "month_reached", value: 266 },
    act: 3,
    requiredPriorEvents: ["pineapple_return"],
    choices: [
      {
        id: "ship_imac",
        label: "Ship It as Designed — No Compromises",
        description: "Release exactly what Ive designed. No floppy. No legacy ports. This is the future.",
        onSuccess: {
          users: 200000,
          brand_awareness: 30,
          innovation: 20,
          valuation_multiplier: 2.0,
          activatesKeyPersonId: "tony",
          setsFlag: "imac_launched",
        },
        successText: "The iMac sells 800,000 units in 5 months. It saves Pineapple. '1984 all over again,' writes the press.",
      },
      {
        id: "add_floppy_drive",
        label: "Add the Floppy — Reduce Friction",
        description: "Compromise on the floppy drive to avoid alienating existing users.",
        onSuccess: {
          users: 100000,
          brand_awareness: 15,
          innovation: 5,
          valuation_multiplier: 1.4,
          setsFlag: "imac_launched",
        },
        successText: "It sells well. But Ive is disappointed. You traded boldness for safety.",
      },
    ],
  },

  {
    id: "pineapple_design_hire",
    title: "🎨 The Quiet Genius",
    description: "There's a quiet British designer at Pineapple named Jon A. Most executives walk past him. You've been watching his work — the iMac was his breakthrough. He wants to redesign every single product Pineapple makes. You want to give him an unlimited mandate.",
    trigger: { type: "month_reached", value: 267 },
    act: 3,
    requiredPriorEvents: ["pineapple_imac_launch"],
    choices: [
      {
        id: "empower_jony",
        label: "Give Jon A. Unlimited Creative Authority",
        description: "Make him Chief Design Officer with veto power on all product decisions.",
        onSuccess: {
          product_quality: 20,
          brand_awareness: 10,
          activatesKeyPersonId: "tony",
          keyPersonLoyaltyDelta: [{ personId: "tony", delta: 30 }],
          setsFlag: "jony_empowered",
        },
        successText: "Jon A.'s studio becomes the most powerful room at Pineapple. Every product will feel inevitable.",
      },
      {
        id: "normal_hire",
        label: "Hire Him Formally — Standard Process",
        description: "Bring him in with a normal VP title. Let him earn the broader mandate.",
        onSuccess: {
          product_quality: 10,
          activatesKeyPersonId: "tony",
        },
        successText: "Jon A. joins officially. He's excellent — but the full extent of his vision is still constrained.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 4: The Ecosystem Monopoly (Months 306–600)
// ─────────────────────────────────────────────────────────────────────────────

const ACT4_EVENTS: StoryEvent[] = [
  {
    id: "pineapple_ipod",
    title: "🎵 1,000 Songs in Your Pocket",
    description: "The music industry is in crisis. StreamRip happened. CDs are dying. Your idea: a pocket-sized device that holds 1,000 songs and syncs with a library application on the Mac. You want to call it the iBud. Your team thinks you're crazy — hardware is hard, and you're a software company.",
    trigger: { type: "month_reached", value: 306 },
    act: 4,
    requiredPriorEvents: ["pineapple_imac_launch"],
    isClimax: true,
    choices: [
      {
        id: "build_ipod",
        label: "Build It — This Changes Music Forever",
        description: "Greenlight the iBud project. 9 months, $30M budget, 100 engineers.",
        condition: (s) => s.metrics.cash >= 30_000_000,
        conditionFailReason: "Need $30M to fund the iBud project.",
        onSuccess: {
          cash: -30_000_000,
          innovation: 25,
          users: 500000,
          brand_awareness: 35,
          valuation_multiplier: 2.5,
          setsFlag: "ipod_launched",
        },
        successText: "iBud ships. 600,000 units in 6 months. It's the Walkman for the digital age. It also opens a door: what if we made the phone?",
      },
      {
        id: "license_hardware",
        label: "License Our Software to a Hardware Partner",
        description: "Let someone else build the device. Collect royalties.",
        onSuccess: {
          cash: 5_000_000,
          brand_awareness: 10,
          innovation: 5,
        },
        successText: "A licensed version ships. It's fine — but not iconic. The door to mobile never fully opens.",
      },
    ],
  },

  {
    id: "pineapple_itunes_store",
    title: "🎸 The iTunes Store",
    description: "You've convinced the 5 major record labels to sell songs for $0.99 each on a new digital music store you'll run. Nobody thought you could get them all in a room together. You did it in 6 months. Now you have to launch it.",
    trigger: { type: "month_reached", value: 324 },
    act: 4,
    requiredPriorEvents: ["pineapple_ipod"],
    choices: [
      {
        id: "launch_itunes_store",
        label: "Launch the iTunes Store",
        description: "Open the world's first legal digital music marketplace.",
        onSuccess: {
          users: 1_000_000,
          revenue: 50_000_000,
          brand_awareness: 25,
          valuation_multiplier: 1.8,
          setsFlag: "itunes_store_live",
        },
        successText: "1 million songs sold in the first week. The music industry didn't know what hit them. The model is proven.",
      },
    ],
  },

  {
    id: "pineapple_iphone_project",
    title: "📱 The iSphere Project",
    description: "You have 2 years of secret development. A phone that is also a computer. No keyboard. Just glass. The carriers call it 'insane.' Your board calls it 'risky.' You call it 'the most important thing you'll ever build.'",
    trigger: { type: "month_reached", value: 348 },
    act: 4,
    isClimax: true,
    requiredPriorEvents: ["pineapple_ipod"],
    choices: [
      {
        id: "build_iphone",
        label: "Build It — Reinvent the Phone",
        description: "Full commit. $150M. 1,000 engineers. 2-year secret project.",
        condition: (s) => s.metrics.cash >= 150_000_000 && s.metrics.innovation >= 60,
        conditionFailReason: "Requires $150M cash and Innovation ≥ 60. Keep building.",
        onSuccess: {
          cash: -150_000_000,
          innovation: 30,
          product_quality: 20,
          setsFlag: "iphone_in_development",
        },
        successText: "The iSphere project begins. You call it 'Project Citrus.' The building is locked down. Nobody leaves until it's done.",
      },
      {
        id: "cancel_iphone",
        label: "Cancel the Project — Focus on Pods",
        description: "It's too expensive and risky. Stick to the music business.",
        onSuccess: {
          cash: 50_000_000,
          team_morale: -15,
          innovation: -20,
        },
        successText: "You played it safe. The iSphere dies in R&D. But your cash position is secure.",
      }
    ],
  },

  {
    id: "pineapple_iphone_keynote",
    title: "🎤 'Every Once in a While...'",
    description: "It's January, 2007. TechWorld. You walk on stage and say: 'Every once in a while, a revolutionary product comes along that changes everything.' Then you introduce the iSphere.",
    trigger: { type: "month_reached", value: 369 },
    act: 4,
    imageSlug: "keynote",
    soundtrackCue: "closing_bell",
    isClimax: true,
    requiredPriorEvents: ["pineapple_iphone_project"],
    choices: [
      {
        id: "iphone_keynote",
        label: "Take the Stage — Make History",
        description: "Deliver the iSphere introduction yourself. It's a 2-hour live performance.",
        triggersKeynoteMiniGame: true,
        onSuccess: {
          users: 5_000_000,
          brand_awareness: 50,
          valuation_multiplier: 3.0,
          ceo_reputation: 35,
          setsFlag: "iphone_launched",
        },
        onFail: {
          users: 2_000_000,
          brand_awareness: 30,
          valuation_multiplier: 2.0,
          setsFlag: "iphone_launched",
        },
        successText: "The world stops. 'An iBud. A phone. And an internet communicator.' The audience understands on the third repeat. They erupt.",
        failText: "It was still extraordinary — just not flawless. The product sells 4M units in the first year.",
      },
    ],
  },

  {
    id: "pineapple_app_store",
    title: "📲 The Orchard Store",
    description: "You initially didn't want third-party apps on the iSphere. Then you changed your mind. Now you're opening a marketplace for developers — 500 apps at launch, 30% of every purchase. It's about to become the most profitable store in history.",
    trigger: { type: "month_reached", value: 387 },
    act: 4,
    requiredPriorEvents: ["pineapple_iphone_keynote"],
    choices: [
      {
        id: "open_app_store",
        label: "Open the Orchard Store to All Developers",
        description: "30% commission. Any developer. Any app. Launch with 500 apps on Day 1.",
        onSuccess: {
          users: 10_000_000,
          revenue: 500_000_000,
          valuation_multiplier: 2.5,
          brand_awareness: 30,
          setsFlag: "app_store_live",
        },
        successText: "500 apps. Then 10,000. Then 1,000,000. The Orchard Store becomes a $70B annual business.",
      },
      {
        id: "curated_store",
        label: "Curated Store — Only Our Approved Apps",
        description: "You control what goes in. Better quality, less revenue.",
        onSuccess: {
          users: 3_000_000,
          revenue: 100_000_000,
          valuation_multiplier: 1.5,
          brand_awareness: 15,
        },
        successText: "The curated store is a premium experience — but you leave billions on the table.",
      },
    ],
  },

  {
    id: "pineapple_health_scare",
    title: "🏥 The Diagnosis",
    description: "You've been diagnosed with a rare form of pancreatic cancer. The doctors say it's treatable if you act immediately. You've kept it private. The board doesn't know. You're 49 years old and the company has never been more important.",
    trigger: { type: "month_reached", value: 390 },
    act: 4,
    isClimax: true,
    choices: [
      {
        id: "get_treatment",
        label: "Get Treatment Immediately",
        description: "Step back from daily operations for 3 months. Trust your team.",
        onSuccess: {
          founder_health: 30,
          founder_burnout: -20,
          team_morale: -10,
          ceo_reputation: -5,
          setsFlag: "received_treatment",
        },
        successText: "You get the surgery. Recovery is hard. But you come back — and the team rallied in your absence.",
      },
      {
        id: "delay_treatment",
        label: "Delay — The iSphere 2 Launch Can't Wait",
        description: "Put the company first. Delay treatment by 9 months.",
        onSuccess: {
          founder_health: -25,
          founder_burnout: 20,
          users: 2_000_000,
          brand_awareness: 15,
          setsFlag: "delayed_treatment",
        },
        successText: "The launch succeeds brilliantly. But your health deteriorates. The decision haunts you.",
      },
    ],
  },

  {
    id: "pineapple_ipad",
    title: "📋 'What Is PinePad?'",
    description: "2010. A device between a phone and a laptop — critics say it fills no need. You disagree. You say there's a whole category of things we do better while leaning back than leaning forward. The PinePad is the most personal computer ever made.",
    trigger: { type: "month_reached", value: 408 },
    act: 4,
    requiredPriorEvents: ["pineapple_app_store"],
    choices: [
      {
        id: "launch_ipad",
        label: "Launch — A New Category of Device",
        description: "Ship the PinePad. Let the world figure out what it is.",
        onSuccess: {
          users: 8_000_000,
          brand_awareness: 25,
          valuation_multiplier: 1.6,
          revenue: 300_000_000,
          setsFlag: "ipad_launched",
        },
        successText: "3M units sold in 80 days. It's a phenomenon. PinePad spawns an entire new market category.",
      },
    ],
  },

  {
    id: "pineapple_succession",
    title: "🎗️ One More Thing",
    description: "Your health is failing. You know this will be your last keynote. You've groomed Tim to take over operations. But the board needs to vote on formally naming him CEO — which means you step down. You believe he can run the company. You just need to trust that belief.",
    trigger: { type: "month_reached", value: 424 },
    act: 4,
    isClimax: true,
    choices: [
      {
        id: "hand_over_to_tim",
        label: "Name Tim as CEO — Trust the Legacy",
        description: "Step down. Name your successor. Your vision lives in the product — it doesn't need you to survive.",
        condition: (s) => s.metrics.product_quality >= 75 && s.metrics.brand_awareness >= 80,
        conditionFailReason: "Product Quality ≥ 75 and Brand Awareness ≥ 80 — the company must be in excellent shape to transition.",
        onSuccess: {
          ceo_reputation: 30,
          team_morale: 10,
          brand_awareness: 10,
          setsFlag: "succession_complete",
        },
        successText: "You named Tim CEO on August 24, 2011. The next day, you wrote a note that simply said: 'I have always said if there ever came a day when I could no longer meet my duties and expectations as Apple's CEO, I would be the first to let you know.'",
      },
      {
        id: "stay_until_end",
        label: "Stay as CEO — Until the Very End",
        description: "Keep the title. Refuse to step down. Let the board deal with succession after.",
        onSuccess: {
          ceo_reputation: 15,
          founder_burnout: 15,
          setsFlag: "held_on",
        },
        successText: "You stay. The team rallies around you. The transition is messier — but your fingerprints are on every product.",
      },
    ],
  },

  {
    id: "pineapple_trillion",
    title: "🏆 $1,000,000,000,000",
    description: "August 2, 2018. Pineapple's stock hits $207.05 per share. The market cap crosses $1 Trillion. It's the first American company to ever reach this milestone. The company you started in a garage with a $1,300 parts budget is now worth more than the GDP of most countries.",
    trigger: { type: "valuation_reached", value: 900_000_000_000 },
    act: 4,
    imageSlug: "trillion",
    soundtrackCue: "closing_bell",
    isClimax: true,
    choices: [
      {
        id: "acknowledge_legacy",
        label: "Issue a Statement — Thank the Team",
        description: "A short internal message. No press release. The number speaks for itself.",
        onSuccess: {
          team_morale: 25,
          ceo_reputation: 15,
          valuation_multiplier: 1.05,
          setsFlag: "game_complete",
        },
        successText: "You did it. A trillion dollars. Built from a garage. The world's most valuable company — and it still makes the best products on earth.",
      },
    ],
  },

  {
    id: "pineapple_watch",
    title: "⌚ The PineWatch",
    description: "It's 2015 (Month 468). Your first major new product category since the PinePad. It's not just a screen on a wrist — it's a fitness tracker, a communication device, and a fashion accessory.",
    trigger: { type: "month_reached", value: 468 },
    act: 4,
    choices: [
      {
        id: "launch_pinewatch",
        label: "Launch The PineWatch",
        description: "Focus heavily on health and fitness.",
        onSuccess: {
          users: 5_000_000,
          revenue: 1_000_000_000,
          brand_awareness: 15,
          valuation_multiplier: 1.1,
          setsFlag: "pinewatch_launched",
        },
        successText: "The PineWatch becomes the best-selling watch in the world, eclipsing the entire Swiss watch industry.",
      },
    ],
  },

  {
    id: "pineapple_silicon",
    title: "💻 PineSilicon",
    description: "It's 2020 (Month 528). You've relied on outside chips for decades. Now, your hardware team has built custom silicon that completely outclasses the competition in performance and power efficiency. It's time to transition the entire PineMac lineup.",
    trigger: { type: "month_reached", value: 528 },
    act: 4,
    choices: [
      {
        id: "transition_silicon",
        label: "Control the Whole Stack",
        description: "Ditch your chip supplier. Transition every computer to custom PineSilicon.",
        onSuccess: {
          product_quality: 35,
          innovation: 40,
          revenue: 2_000_000_000,
          valuation_multiplier: 1.2,
          setsFlag: "silicon_transitioned",
        },
        successText: "The transition is flawless. Your computers are now years ahead of the rest of the industry.",
      },
    ],
  },

  {
    id: "pineapple_vision",
    title: "🥽 PineVision",
    description: "It's 2024 (Month 576). The headset. Spatial computing. It's a $3,500 device that feels like magic but is too expensive for the mass market. It's the biggest hardware gamble in a decade.",
    trigger: { type: "month_reached", value: 576 },
    act: 4,
    choices: [
      {
        id: "launch_pinevision",
        label: "Launch PineVision — Set the Standard",
        description: "Price it high. Target developers and early adopters.",
        onSuccess: {
          innovation: 50,
          users: 500_000,
          brand_awareness: 10,
          setsFlag: "pinevision_launched",
        },
        successText: "The reviews are mixed on utility, but universally praise the engineering. The spatial computing era has begun.",
      },
    ],
  },

  {
    id: "pineapple_end_of_narrative",
    title: "🚀 The Future is Unwritten",
    description: "It is now 2026 (Month 600). You've survived 50 years. From a wooden box in a garage to the most valuable company in human history. The scripted narrative ends here. From now on, you write the new path for Pineapple.",
    trigger: { type: "month_reached", value: 600 },
    act: 4,
    imageSlug: "end_of_narrative",
    isClimax: true,
    choices: [
      {
        id: "continue_sandbox",
        label: "Continue in Sandbox Mode",
        description: "The story ends, but the simulation never does.",
        onSuccess: {
          team_morale: 50,
        },
        successText: "You step out into the unknown. The rest of history is up to you.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const PINEAPPLE_CAMPAIGN: StoryCampaign = {
  id: "pineapple",
  companyName: "Pineapple",
  founderName: "Steve",
  founderEmoji: "🍎",
  industry: "Hardware & Software",
  tagline: "From a garage to a trillion dollars.",
  description: "Start with $5,000 and a dream. Build the personal computer. Get fired from your own company. Return from exile. Build the iSphere. Reach $1 Trillion.",
  difficulty: "Hard",
  themeColors: {
    primary: "from-slate-700 to-slate-900",
    accent: "#a8a8b3",
    badge: "bg-slate-800 text-slate-100",
  },
  startingMetrics: {
    cash: 5_000,
    burn_rate: 100,
    pricing: 100,
    users: 0,
    product_quality: 15,
    technical_debt: 0,
    team_morale: 90,
    brand_awareness: 2,
    pmf_score: 5,
    ceo_reputation: 60,
    innovation: 25,
  },
  winCondition: {
    description: "Survive 600 Months (50 Years) Without Getting Fired or Going Bankrupt",
    check: (startup, storyState) => (storyState?.currentMonth ?? 0) >= 600,
  },
  historicalBaselines: [
    { month: 1, targetValuation: 10_000, targetUsers: 0, targetCash: 1_500 },
    { month: 24, targetValuation: 3_000_000, targetUsers: 500, targetCash: 250_000 },
    { month: 48, targetValuation: 1_800_000_000, targetUsers: 50_000, targetCash: 100_000_000 }, // 1980 IPO
    { month: 120, targetValuation: 2_000_000_000, targetUsers: 250_000, targetCash: 300_000_000 }, // 1986
    { month: 240, targetValuation: 3_000_000_000, targetUsers: 5_000_000, targetCash: 1_200_000_000 }, // 1996 Slump
    { month: 360, targetValuation: 75_000_000_000, targetUsers: 150_000_000, targetCash: 10_000_000_000 }, // 2006 iPod Era
    { month: 420, targetValuation: 350_000_000_000, targetUsers: 500_000_000, targetCash: 50_000_000_000 }, // 2011 iPhone Dominance
    { month: 504, targetValuation: 1_000_000_000_000, targetUsers: 1_000_000_000, targetCash: 250_000_000_000 }, // 2018 $1T Milestone
    { month: 600, targetValuation: 3_500_000_000_000, targetUsers: 2_000_000_000, targetCash: 160_000_000_000 } // 2026 Peak
  ],
  events: [
    ...ACT1_EVENTS,
    ...ACT2_EVENTS,
    ...ACT3_EVENTS,
    ...ACT4_EVENTS,
  ],
  initialKeyPeople: [WOZ, MARKKULA, SCULLEY, JONY],
  initialBoardMembers: INITIAL_BOARD,
  initialRivals: [IBM_RIVAL, MICROSOFT_RIVAL],
  acts: ACTS,
};
