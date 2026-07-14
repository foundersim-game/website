// src/lib/story/campaigns/searchgo.ts
// ─────────────────────────────────────────────────────────────────────────────
// SEARCHGO CAMPAIGN
// Company Name: SearchGo
// Founders: Larry (player) & Serge (key person) (fictional)
// Win Condition: Reach $1 Trillion Valuation OR 10 Billion daily searches
// Duration: ~240 in-game months (20 years)
// ⚠️  All characters and products are fictional. Any resemblance to real persons is satirical.
//
// Acts:
//   Act 1 (Mo 1–36):   The Campus Garage
//   Act 2 (Mo 37–96):  The Algorithm & The Money
//   Act 3 (Mo 97–168): "Don't Be Evil" Goes Public
//   Act 4 (Mo 169–240): The Everything Company
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

const SERGEY: KeyPerson = {
  id: "sergey",
  displayName: "Serge",
  title: "Co-Founder & President of Technology",
  historicalName: "Serge Bell",
  emoji: "🔬",
  loyalty: 95,
  loyaltyThreshold: 30,
  competence: { technical: 95, marketing: 50, leadership: 65, fundraising: 70 },
  secretAgenda: undefined,
  monthJoined: 1,
  isActive: true,
  passiveEffect: { product_quality: 6, innovation: 5 },
};

const ERIC_SCHMIDT: KeyPerson = {
  id: "eric",
  displayName: "Eric",
  title: "Chief Executive Officer",
  historicalName: "Erik Stein",
  emoji: "🧳",
  loyalty: 70,
  loyaltyThreshold: 25,
  competence: { technical: 60, marketing: 70, leadership: 88, fundraising: 85 },
  secretAgenda: "He's the adult supervision the VCs demanded. He's excellent — but he limits your moves.",
  monthJoined: 28,
  isActive: false,
  passiveEffect: { ceo_reputation: 3, team_morale: 2 },
};

const SUNDAR: KeyPerson = {
  id: "sundar",
  displayName: "Sundar",
  title: "SVP Products → CEO",
  historicalName: "Sanjay Patel",
  emoji: "🌟",
  loyalty: 90,
  loyaltyThreshold: 20,
  competence: { technical: 85, marketing: 75, leadership: 90, fundraising: 80 },
  secretAgenda: undefined,
  monthJoined: 120,
  isActive: false,
  passiveEffect: { product_quality: 8, team_morale: 4 },
};

// ─────────────────────────────────────────────────────────────────────────────
// BOARD
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_BOARD: StoryBoardMember[] = [
  {
    id: "larry_seat",
    name: "You (Larry)",
    seat: "founder",
    agenda: "growth",
    loyaltyToFounder: 100,
    influence: 50,
    isActive: true,
  },
  {
    id: "sergey_seat",
    name: "Serge",
    seat: "founder",
    agenda: "growth",
    loyaltyToFounder: 95,
    influence: 50,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RIVALS
// ─────────────────────────────────────────────────────────────────────────────

const YAHOO_RIVAL: HistoricalRival = {
  id: "yahoo",
  name: "WebPortal",
  tagline: "The internet's homepage. For now.",
  emoji: "📮",
  scheduledActions: [
    {
      atMonth: 10,
      description: "WebPortal licenses your search algorithm for $7.1M — then drops you at Month 60.",
      impactOnPlayer: { cash: 7_100_000 },
    },
    {
      atMonth: 60,
      description: "WebPortal drops your search license to build their own engine. You lose their traffic — and gain your independence.",
      impactOnPlayer: { users: -5000, brand_awareness: 15 },
    },
    {
      atMonth: 80,
      description: "WebPortal's own search engine is a disaster. Users flood to SearchGo.",
      impactOnPlayer: { users: 50000, brand_awareness: 20 },
    },
  ],
  status: "dominant",
};

const MICROSOFT_RIVAL: HistoricalRival = {
  id: "bing_empire",
  name: "Bing Empire",
  tagline: "The corporate search engine. $8B/year to take 3% market share.",
  emoji: "🔷",
  scheduledActions: [
    {
      atMonth: 120,
      description: "Bing Empire launches with a massive marketing campaign. 'Now the search engine is the one being searched for.'",
      impactOnPlayer: { brand_awareness: -5, users: -2000 },
    },
    {
      atMonth: 160,
      description: "Bing Empire powers WebPortal and DuckSearch by default. 30% of the search market.",
      impactOnPlayer: { users: -5000, pmf_score: -5 },
    },
    {
      atMonth: 200,
      description: "Bing Empire announces an AI-powered search product. First existential threat to SearchGo in 20 years.",
      impactOnPlayer: { ceo_reputation: -10, brand_awareness: -15, innovation: -10 },
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
    title: "The Campus Garage",
    monthRange: [1, 36],
    description: "A grad school project becomes the world's most important algorithm.",
    color: "from-green-600 to-emerald-800",
  },
  {
    act: 2,
    title: "The Algorithm & The Money",
    monthRange: [37, 96],
    description: "AdPrint. Venture capital. Adult supervision. The internet is yours.",
    color: "from-yellow-500 to-amber-700",
  },
  {
    act: 3,
    title: "'Don't Be Evil' Goes Public",
    monthRange: [97, 168],
    description: "The largest IPO in history. The motto that becomes a question.",
    color: "from-blue-500 to-cyan-700",
  },
  {
    act: 4,
    title: "The Everything Company",
    monthRange: [169, 240],
    description: "Self-driving cars. Quantum computing. AI that writes code. Alphabet.",
    color: "from-purple-600 to-violet-900",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 1
// ─────────────────────────────────────────────────────────────────────────────

const ACT1_EVENTS: StoryEvent[] = [
  {
    id: "searchgo_backrub",
    title: "🔗 BackRub Becomes SearchGo",
    description: "It's 1998. You and Serge have been building a search engine in your Westlake University dorm room. You called it BackRub because it analyzed back-links. You've decided to rename it: SearchGo. Andy Holt writes a $100K check before you even have a bank account. You cash it 2 weeks later when you finally incorporate.",
    trigger: { type: "month_reached", value: 1 },
    act: 1,
    soundtrackCue: "garage_era",
    choices: [
      {
        id: "incorporate",
        label: "Incorporate and Cash the Check",
        description: "File the paperwork. Open a bank account. SearchGo Inc. is born.",
        onSuccess: {
          cash: 100_000,
          brand_awareness: 5,
          team_morale: 95,
          setsFlag: "searchgo_incorporated",
        },
        successText: "SearchGo is a company. Andy Bechtolsheim believed before there was anything to believe in.",
      },
    ],
  },

  {
    id: "searchgo_pagerank",
    title: "🧮 The Algorithm",
    description: "PageRank works. Every search query returns better results than anything Findit or Seek can produce. The difference is so obvious you could prove it blindfolded. Westlake wants to license the technology to Seek for $1.6M. Seek says no — the search results are 'too good' and would stop users from clicking on portal content.",
    trigger: { type: "month_reached", value: 5 },
    act: 1,
    choices: [
      {
        id: "keep_pagerank",
        label: "Keep It — Build the Company Ourselves",
        description: "Don't license it. Build SearchGo around PageRank exclusively.",
        onSuccess: {
          product_quality: 30,
          innovation: 20,
          pmf_score: 25,
          setsFlag: "pagerank_kept",
        },
        successText: "PageRank is yours. The algorithm that organizes the world's knowledge. You kept it.",
      },
      {
        id: "license_to_yahoo",
        label: "License to WebPortal for $7.1M",
        description: "Take the money. License the algorithm. Use the cash to build something bigger.",
        onSuccess: {
          cash: 7_100_000,
          brand_awareness: 10,
          setsFlag: "pagerank_licensed",
        },
        successText: "WebPortal runs on your algorithm. You have $7.1M. You also gave away your biggest moat.",
      },
    ],
  },

  {
    id: "searchgo_vc_round",
    title: "💰 Kleiner & Sequoia",
    description: "The two most powerful VC firms in Silicon Valley — normally fierce rivals — are both offering to co-invest $25M each. $50M total. The catch: they want 'adult supervision.' They want you to hire a professional CEO within 12 months.",
    trigger: { type: "month_reached", value: 12 },
    act: 1,
    choices: [
      {
        id: "accept_vc_deal",
        label: "Accept — $50M and Find the Right CEO",
        description: "Take the money. Agree to the CEO search — but you control who gets hired.",
        onSuccess: {
          cash: 50_000_000,
          brand_awareness: 20,
          ceo_reputation: 10,
          setsFlag: "vc_funded",
        },
        successText: "Kleiner and Sequoia are in. The search for the 'adult' begins.",
      },
      {
        id: "negotiate_control",
        label: "Take the Money — But Keep CEO Rights",
        description: "Negotiate: you'll hire a President, not a CEO. Larry stays CEO.",
        onSuccess: {
          cash: 25_000_000, // only one firm agrees
          brand_awareness: 15,
          ceo_reputation: 15,
          setsFlag: "partial_vc",
        },
        onFail: {
          cash: 10_000_000,
          brand_awareness: 10,
        },
        successRate: 0.55,
        successText: "Sequoia agreed. Kleiner walked. $25M and you keep the CEO title.",
        failText: "Both firms wanted the CEO clause. You got a smaller angel round instead.",
      },
    ],
  },

  {
    id: "searchgo_hire_eric",
    title: "🧳 'The Adult in the Room'",
    description: "After months of interviews, Erik Stein — ex-tech giant executive — is the candidate the VCs approve. He's the most credentialed person you've ever met. He's also going to tell you what to do with your own company.",
    trigger: { type: "month_reached", value: 28 },
    act: 2,
    choices: [
      {
        id: "accept_ceo",
        label: "Accept Erik — Bring in Adult Supervision",
        description: "You and Serge become Presidents. Erik runs day-to-day operations.",
        onSuccess: {
          ceo_reputation: -5,
          team_morale: 5,
          brand_awareness: 10,
          founderRoleChange: "cpo_chairman",
          activatesKeyPersonId: "erik_stein",
          setsFlag: "eric_hired",
        },
        successText: "Erik joins. The troika is formed. It works — because you made the rules.",
      },
      {
        id: "reject_eric_stay_ceo",
        label: "Reject — Stay as CEO Ourselves",
        description: "You and Serge run the company. Push back on VC pressure.",
        condition: (s) => (s.ceo_reputation ?? 0) >= 70,
        conditionFailReason: "CEO Reputation < 70. The VCs have too much leverage right now.",
        onSuccess: {
          ceo_reputation: 15,
          team_morale: 10,
          blocksEventId: "searchgo_hire_eric",
          setsFlag: "stayed_as_ceo",
        },
        successText: "You stayed. The VCs grumbled but respected the results you delivered.",
      },
    ],
  },

  {
    id: "searchgo_adwords",
    title: "💵 AdPrint — Monetizing Intent",
    description: "Your research team has a concept: instead of banner ads, show ads next to search results that are relevant to what the user just searched for. Pay-per-click. Self-serve. The most targeted ad system ever built. It's simple. It's revolutionary. It will generate $100B/year.",
    trigger: { type: "month_reached", value: 20 },
    act: 1,
    choices: [
      {
        id: "launch_adwords",
        label: "Launch AdPrint — Ads That Respect Users",
        description: "Keyword-based text ads. Ranked by relevance and bid. No banners. No interruptions.",
        onSuccess: {
          revenue: 500_000,
          brand_awareness: 20,
          pmf_score: 10,
          setsFlag: "adprint_live",
        },
        successText: "AdPrint launches. Revenue hits $100K on day 1. It's self-serve. It scales infinitely.",
      },
      {
        id: "display_ads",
        label: "Run Display Ads Instead — Bigger CPMs",
        description: "Traditional banner ads. Less elegant but immediately profitable.",
        onSuccess: {
          revenue: 200_000,
          brand_awareness: -5,
          pmf_score: -5,
        },
        successText: "Revenue comes in but users hate the banners. You'll fix this later.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 2
// ─────────────────────────────────────────────────────────────────────────────

const ACT2_EVENTS: StoryEvent[] = [
  {
    id: "searchgo_gmail",
    title: "📧 1 Gigabyte of MailBox",
    description: "April Fool's Day 2004. You're announcing MailBox — 1GB of free email storage at a time when everyone else offers 4MB. People think it's a joke. It's not. It's the most ambitious product you've ever shipped beyond search, and it re-defines what email is.",
    trigger: { type: "month_reached", value: 50 },
    act: 2,
    choices: [
      {
        id: "launch_gmail",
        label: "Launch MailBox — 1GB Free for Everyone",
        description: "Invite-only to control server costs. 1GB storage minimum.",
        onSuccess: {
          users: 100000,
          brand_awareness: 30,
          innovation: 15,
          product_quality: 10,
          setsFlag: "mailbox_launched",
        },
        successText: "The invite codes sell for $200 on eBay on day one. MailBox is the most desired product in tech.",
      },
      {
        id: "integrate_search",
        label: "Integrate Mail Into Search — Not Standalone",
        description: "Don't launch a separate product. Just add email to your existing platform.",
        onSuccess: {
          users: 20000,
          product_quality: 5,
          brand_awareness: 10,
        },
        successText: "A quieter launch. Functional but not iconic.",
      },
    ],
  },

  {
    id: "searchgo_ipo",
    title: "🔔 The Dutch Auction IPO",
    description: "August 19, 2004. Your IPO is using a Dutch auction — every investor bids what they think shares are worth. No investment bankers getting allocation. No insider favoritism. The regulators almost blocked it over your 'Founder's Letter.' You priced at $85/share. Market opens at $100.01.",
    trigger: { type: "month_reached", value: 70 },
    act: 2,
    isClimax: true,
    soundtrackCue: "closing_bell",
    choices: [
      {
        id: "do_dutch_ipo",
        label: "Proceed with Dutch Auction — Democratize the IPO",
        description: "Every investor gets equal access. Unconventional but principled.",
        condition: (s) => s.metrics.users >= 100000 && s.metrics.revenue >= 1_000_000,
        conditionFailReason: "Need 100K+ Users and $1M+ monthly revenue to proceed with IPO.",
        onSuccess: {
          cash: 1_670_000_000,
          valuation_multiplier: 5.0,
          brand_awareness: 35,
          ceo_reputation: 20,
          setsFlag: "searchgo_public",
        },
        successText: "SearchGo opens at $100. Closes at $185 one year later. Your 'Don't Be Evil' letter becomes the most-read corporate document of 2004.",
      },
      {
        id: "traditional_ipo",
        label: "Traditional IPO — Wall Street Route",
        description: "Let the bankers handle it. Maximize Day 1 pop.",
        onSuccess: {
          cash: 2_000_000_000,
          valuation_multiplier: 4.5,
          brand_awareness: 25,
          ceo_reputation: 5,
          setsFlag: "searchgo_public",
        },
        successText: "Traditional IPO. Huge Day 1 pop. Less principled — but $2B raised.",
      },
    ],
  },

  {
    id: "searchgo_maps",
    title: "🗺️ SearchGo Atlas",
    description: "You acquired a satellite imagery company and a mapping startup. Now you want to merge them into a free mapping product. The plan: make every map on earth free, forever. GPS companies think you're insane. You think GPS companies are about to become obsolete.",
    trigger: { type: "month_reached", value: 80 },
    act: 2,
    requiredPriorEvents: ["searchgo_gmail"],
    choices: [
      {
        id: "launch_maps",
        label: "Launch SearchGo Atlas — Free, Forever",
        description: "Maps for everyone. No charge. Monetize through local business ads.",
        condition: (s) => s.metrics.cash >= 50_000_000,
        conditionFailReason: "Need $50M+ in cash to fund maps infrastructure.",
        onSuccess: {
          cash: -50_000_000,
          users: 500000,
          brand_awareness: 30,
          innovation: 15,
          valuation_multiplier: 1.5,
          setsFlag: "atlas_launched",
        },
        successText: "SearchGo Atlas launches. Within 2 years it's on every phone on earth. Garmin's stock drops 40%.",
      },
    ],
  },

  {
    id: "searchgo_china",
    title: "🇨🇳 The East Decision",
    description: "The government in the East wants SearchGo to operate — but only if you agree to censor search results. Remove content they deem 'harmful.' You have 15% of the market operating through a workaround. The full entry requires compliance. Your 'Don't Be Evil' motto is now literally in the balance.",
    trigger: { type: "month_reached", value: 88 },
    act: 2,
    choices: [
      {
        id: "enter_china_censored",
        label: "Enter the Market — Accept the Censorship Terms",
        description: "50M new users. Enormous market. You censor 'sensitive' results.",
        onSuccess: {
          users: 500000,
          revenue: 100_000_000,
          ceo_reputation: -20,
          brand_awareness: -10,
          setsFlag: "china_entered",
        },
        successText: "You entered the East. Revenue surges. But Serge is deeply uncomfortable. Human rights advocates call you hypocrites.",
      },
      {
        id: "exit_china",
        label: "Walk Away — Values Over Revenue",
        description: "Shut down operations rather than censor results. Take the revenue hit.",
        onSuccess: {
          ceo_reputation: 20,
          brand_awareness: 15,
          revenue: -50_000_000,
        },
        successText: "You walked away from the East. The press celebrated. Serge hugged you.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 3
// ─────────────────────────────────────────────────────────────────────────────

const ACT3_EVENTS: StoryEvent[] = [
  {
    id: "searchgo_android",
    title: "📱 The Mobile Operating System",
    description: "You acquired DroidOS for $50M. A mobile OS that runs on any hardware. If you control the mobile OS, you control search on every smartphone. It's an audacious vertical integration play — and the carriers hate it.",
    trigger: { type: "month_reached", value: 130 },
    act: 4,
    choices: [
      {
        id: "launch_android",
        label: "Launch DroidOS — Open Source, Free to Manufacturers",
        description: "Give DroidOS away for free. Win the market by being everywhere.",
        condition: (s) => s.metrics.cash >= 100_000_000,
        conditionFailReason: "Need $100M+ cash to fund open-source DroidOS development.",
        onSuccess: {
          cash: -100_000_000,
          users: 2_000_000,
          brand_awareness: 40,
          valuation_multiplier: 2.0,
          setsFlag: "android_launched",
        },
        successText: "DroidOS ships. Within 3 years it's on 80% of smartphones worldwide. Pineapple is furious.",
      },
      {
        id: "license_android",
        label: "License DroidOS for $10/Device",
        description: "Charge manufacturers a licensing fee. More revenue, less adoption.",
        onSuccess: {
          cash: 50_000_000,
          users: 200_000,
          brand_awareness: 15,
        },
        successText: "Revenue comes in. Adoption is slower. Pineapple keeps more market share.",
      },
    ],
  },

  {
    id: "searchgo_youtube",
    title: "📺 $1.65 Billion in Stock",
    description: "ViewTube has 100 million video views per day. They're 20 months old and have no revenue model. Everyone thinks you're paying 100× too much. You think video search is the future of the internet. You want to buy them for $1.65B in stock.",
    trigger: { type: "month_reached", value: 140 },
    act: 4,
    choices: [
      {
        id: "buy_youtube",
        label: "Buy ViewTube — Own Video Forever",
        description: "Acquire ViewTube for $1.65B in stock. Let them operate independently.",
        condition: (s) => s.valuation >= 30_000_000_000,
        conditionFailReason: "SearchGo valuation needs to be $30B+ to issue $1.65B in stock.",
        onSuccess: {
          users: 1_000_000,
          brand_awareness: 30,
          valuation_multiplier: 1.6,
          setsFlag: "youtube_acquired",
        },
        successText: "ViewTube becomes the world's second most visited website. You paid $1.65B. It's worth $180B.",
      },
    ],
  },

  {
    id: "searchgo_sundar",
    title: "🌟 The Heir Apparent",
    description: "There's an SVP at SearchGo named Sundar who manages Chrome, Maps, and Gmail. He's the most universally respected leader in the company. When Satoshi at Bing Empire tried to hire him away, you had to make a decision: match the offer, or lose him. You gave him an $8M retention package. Now he's clearly ready to run more.",
    trigger: { type: "month_reached", value: 120 },
    act: 3,
    choices: [
      {
        id: "empower_sundar",
        label: "Put Sundar in Charge of All Products",
        description: "Give him oversight of Search, Ads, DroidOS, Atlas, MailBox — everything.",
        onSuccess: {
          product_quality: 15,
          team_morale: 20,
          activatesKeyPersonId: "sundar",
          keyPersonLoyaltyDelta: [{ personId: "sundar", delta: 25 }],
          setsFlag: "sundar_empowered",
        },
        successText: "Sundar steps up. Product velocity increases 40% in 6 months. He's the answer.",
      },
      {
        id: "keep_control",
        label: "Keep Direct Product Control",
        description: "You're not ready to delegate this much.",
        onSuccess: { product_quality: 5, team_morale: -5 },
        successText: "You keep control. Good products — but slower.",
      },
    ],
  },

  {
    id: "searchgo_nsa",
    title: "🕵️ The Prism Program",
    description: "A contractor has leaked classified documents revealing that the NSA has direct access to SearchGo's servers — and 8 other major tech companies — as part of the PRISM program. You didn't know. You're furious. The press is running it tomorrow morning.",
    trigger: { type: "month_reached", value: 145 },
    act: 3,
    isClimax: true,
    choices: [
      {
        id: "fight_nsa",
        label: "Fight Back Publicly — Sue the Government",
        description: "File a legal challenge. Publish a transparency report. Invest in encryption.",
        onSuccess: {
          ceo_reputation: 20,
          brand_awareness: 15,
          cash: -50_000_000,
          team_morale: 20,
          setsFlag: "fought_nsa",
        },
        successText: "You went to war with the government. The engineering team rallied. You published the first transparency report in tech history.",
      },
      {
        id: "cooperate_quietly",
        label: "Comply Quietly — National Security Matters",
        description: "Work with the government. Keep it quiet. It's legally required.",
        onSuccess: {
          ceo_reputation: -20,
          brand_awareness: -20,
          team_morale: -15,
          setsFlag: "complied_nsa",
        },
        successText: "You complied. When it leaked anyway, the trust damage was catastrophic.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 4
// ─────────────────────────────────────────────────────────────────────────────

const ACT4_EVENTS: StoryEvent[] = [
  {
    id: "searchgo_alphabet",
    title: "🔠 Alphabet",
    description: "You've decided to restructure SearchGo into a conglomerate called Alphabet. SearchGo becomes one company inside it. Waymo self-driving cars. DeepThink AI research. LifeSpan biotech. Each runs independently. You become CEO of Alphabet. Sundar becomes CEO of SearchGo.",
    trigger: { type: "month_reached", value: 170 },
    act: 4,
    requiredPriorEvents: ["searchgo_sundar"],
    isClimax: true,
    choices: [
      {
        id: "create_alphabet",
        label: "Create Alphabet — Bet on Moonshots",
        description: "Restructure everything. Give Sundar SearchGo. Go run the future.",
        onSuccess: {
          brand_awareness: 25,
          innovation: 30,
          valuation_multiplier: 1.5,
          ceo_reputation: 20,
          keyPersonLoyaltyDelta: [{ personId: "sundar", delta: 25 }],
          setsFlag: "alphabet_created",
        },
        successText: "Alphabet is born. The press calls it 'the most ambitious corporate restructuring since General Electric.' You call it 'Tuesday.'",
      },
      {
        id: "stay_as_searchgo",
        label: "Stay Focused on SearchGo — One Company",
        description: "Don't dilute focus. SearchGo remains one unified company.",
        onSuccess: {
          product_quality: 15,
          team_morale: 10,
        },
        successText: "You stayed focused. SearchGo is cleaner — but the moonshots are slower.",
      },
    ],
  },

  {
    id: "searchgo_ai_race",
    title: "🤖 The AI Race",
    description: "Your DeepThink team has achieved something extraordinary: a language model that can hold a conversation, write code, translate text, and generate images. Bing Empire is about to launch their own AI product. If they get there first, it threatens your core search business for the first time in 20 years.",
    trigger: { type: "month_reached", value: 200 },
    act: 4,
    isClimax: true,
    soundtrackCue: "hypergrowth",
    choices: [
      {
        id: "rush_ai_launch",
        label: "Rush AI — Ship in 60 Days",
        description: "Beat Bing Empire. Ship now. Accept that it won't be perfect.",
        onSuccess: {
          brand_awareness: 30,
          innovation: 20,
          ceo_reputation: -5, // early bugs hurt rep
          users: 2_000_000,
          setsFlag: "ai_shipped_fast",
        },
        successText: "You shipped. The product had bugs — one generated a factually wrong answer on launch day. The stock dropped 7%. But the AI war was on.",
      },
      {
        id: "careful_ai_launch",
        label: "Take 6 Months — Ship It Right",
        description: "Bing Empire gets the first-mover headlines. You get the better product.",
        onSuccess: {
          brand_awareness: 15,
          innovation: 30,
          product_quality: 20,
          ceo_reputation: 15,
          users: 3_000_000,
          setsFlag: "ai_shipped_careful",
        },
        successText: "Bing Empire had 6 months of headlines. Your product demolished theirs in every benchmark. The market corrected.",
      },
    ],
  },

  {
    id: "searchgo_trillion_win",
    title: "🏆 $1 Trillion",
    description: "Alphabet's market capitalization has crossed $1 Trillion. SearchGo processes more than 8 billion searches per day — more information queries than all libraries in human history combined, every single day. From a campus dorm room. From PageRank on a whiteboard.",
    trigger: { type: "valuation_reached", value: 900_000_000_000 },
    act: 4,
    isClimax: true,
    soundtrackCue: "closing_bell",
    choices: [
      {
        id: "win_searchgo",
        label: "Organize the World's Information. Mission Accomplished.",
        description: "You set out to organize the world's information. You did it.",
        onSuccess: {
          team_morale: 30,
          ceo_reputation: 25,
          valuation_multiplier: 1.1,
          setsFlag: "game_complete",
        },
        successText: "A trillion dollars. Built on the belief that more information makes better decisions. You were right.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const SEARCHGO_CAMPAIGN: StoryCampaign = {
  id: "searchgo",
  companyName: "SearchGo",
  founderName: "Larry",
  founderEmoji: "🔍",
  industry: "Search & Advertising",
  tagline: "Organize the world's information.",
  description: "Two grad students. One algorithm. $100K check before you had a bank account. Build the world's most important company — and then bet it all on AI.",
  difficulty: "Normal",
  themeColors: {
    primary: "from-green-700 to-emerald-950",
    accent: "#34a853",
    badge: "bg-emerald-900 text-emerald-100",
  },
  startingMetrics: {
    cash: 100_000,
    users: 0,
    product_quality: 70,
    technical_debt: 5,
    team_morale: 90,
    brand_awareness: 3,
    pmf_score: 30,
    ceo_reputation: 75,
    innovation: 50,
  },
  winCondition: {
    description: "Reach $1 Trillion Valuation",
    check: (startup) => startup.valuation >= 1_000_000_000_000,
  },
  events: [
    ...ACT1_EVENTS,
    ...ACT2_EVENTS,
    ...ACT3_EVENTS,
    ...ACT4_EVENTS,
  ],
  initialKeyPeople: [SERGEY, ERIC_SCHMIDT, SUNDAR],
  initialBoardMembers: INITIAL_BOARD,
  initialRivals: [YAHOO_RIVAL, MICROSOFT_RIVAL],
  acts: ACTS,
};
