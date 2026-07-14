// src/lib/story/campaigns/bookface.ts
// ─────────────────────────────────────────────────────────────────────────────
// BOOKFACE CAMPAIGN
// Company Name: BookFace
// Founder Name: Max Zeller (fictional)
// Win Condition: 2 Billion Users
// Duration: ~240 in-game months (20 years)
// ⚠️  All characters and products are fictional. Any resemblance to real persons is satirical.
//
// Acts:
//   Act 1 (Mo 1–36):   The Dorm Room
//   Act 2 (Mo 37–96):  Growth at All Costs
//   Act 3 (Mo 97–180): Going Public
//   Act 4 (Mo 181–240): The Reckoning
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

const EDUARDO: KeyPerson = {
  id: "eduardo",
  displayName: "Eduardo",
  title: "Co-Founder & CFO",
  historicalName: "Eddie Savin",
  emoji: "🤝",
  loyalty: 80,
  loyaltyThreshold: 30,
  competence: { technical: 30, marketing: 50, leadership: 40, fundraising: 80 },
  secretAgenda: "He put in the seed money. He expects to be treated as an equal partner — permanently.",
  monthJoined: 1,
  isActive: true,
  passiveEffect: { cash: 500 }, // Small monthly positive from his business relationships
};

const SEAN: KeyPerson = {
  id: "sean",
  displayName: "Sean",
  title: "President (Advisor)",
  historicalName: "Shane Paxton",
  emoji: "🎸",
  loyalty: 65,
  loyaltyThreshold: 20,
  competence: { technical: 35, marketing: 75, leadership: 50, fundraising: 70 },
  secretAgenda: "He's charming and brilliant — but every company he touches gets complicated.",
  monthJoined: 14,
  isActive: false,
  passiveEffect: { brand_awareness: 5, ceo_reputation: -2 },
};

const SHERYL: KeyPerson = {
  id: "sheryl",
  displayName: "Sheryl",
  title: "Chief Operating Officer",
  historicalName: "Sara Segal",
  emoji: "👩‍💼",
  loyalty: 85,
  loyaltyThreshold: 25,
  competence: { technical: 40, marketing: 90, leadership: 95, fundraising: 85 },
  secretAgenda: undefined,
  monthJoined: 55,
  isActive: false,
  passiveEffect: { brand_awareness: 6, revenue: 2_000_000 },
};

// ─────────────────────────────────────────────────────────────────────────────
// BOARD
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_BOARD: StoryBoardMember[] = [
  {
    id: "founder_seat",
    name: "You (Mark)",
    seat: "founder",
    agenda: "growth",
    loyaltyToFounder: 100,
    influence: 60,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RIVALS
// ─────────────────────────────────────────────────────────────────────────────

const MYSPACE_RIVAL: HistoricalRival = {
  id: "myspace",
  name: "MySpace",
  tagline: "The social network before social networking was cool. 100M users and counting.",
  emoji: "🎭",
  scheduledActions: [
    {
      atMonth: 8,
      description: "MySpace launches a new 'bands' feature that goes viral. Music artists flood to their platform.",
      impactOnPlayer: { brand_awareness: -5, users: -200 },
    },
    {
      atMonth: 24,
      description: "MySpace reaches 100M users. News Corp buys them for $580M. They think they've won.",
      impactOnPlayer: { team_morale: -8, brand_awareness: -8 },
    },
    {
      atMonth: 40,
      description: "MySpace redesign backfires. Users are leaving en masse. Your moment has arrived.",
      impactOnPlayer: { users: 5000, brand_awareness: 10 },
    },
  ],
  status: "dominant",
};

const TWITTER_RIVAL: HistoricalRival = {
  id: "chirper",
  name: "Chirper",
  tagline: "140 characters. Real-time news. The antithesis of your strategy.",
  emoji: "🐦",
  scheduledActions: [
    {
      atMonth: 50,
      description: "Chirper launches and becomes the go-to platform for breaking news and celebrity commentary.",
      impactOnPlayer: { brand_awareness: -6, users: -500 },
    },
    {
      atMonth: 100,
      description: "Chirper IPO values them at $14B. Wall Street starts comparing your advertising models.",
      impactOnPlayer: { ceo_reputation: -5 },
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
    title: "The Dorm Room",
    monthRange: [1, 36],
    description: "A dorm room. A stolen dataset. A website that becomes an obsession.",
    color: "from-blue-600 to-blue-900",
  },
  {
    act: 2,
    title: "Growth at All Costs",
    monthRange: [37, 96],
    description: "Move fast. Break things. Break people. Break trust. Keep growing.",
    color: "from-blue-500 to-indigo-700",
  },
  {
    act: 3,
    title: "Going Public",
    monthRange: [97, 180],
    description: "The most anticipated IPO since SearchGo. $104B valuation. And then: silence.",
    color: "from-indigo-600 to-violet-800",
  },
  {
    act: 4,
    title: "The Reckoning",
    monthRange: [181, 240],
    description: "Cambridge Analytica. Senate hearings. 2 billion people's data. A CEO in the hot seat.",
    color: "from-red-700 to-rose-900",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 1: The Dorm Room
// ─────────────────────────────────────────────────────────────────────────────

const ACT1_EVENTS: StoryEvent[] = [
  {
    id: "bookface_launch",
    title: "🏫 thebookface.com",
    description: "It's early 2004. You built the site in 2 weeks from your dorm room at Westbrook University. It's live on campus. Within 24 hours, 1,200 students have signed up. Eddie put in $19,000. You control everything else. The site is simple: real names, real photos, your real social graph.",
    trigger: { type: "month_reached", value: 1 },
    act: 1,
    soundtrackCue: "garage_era",
    choices: [
      {
        id: "keep_harvard_only",
        label: "Westbrook Only — Exclusivity Creates Demand",
        description: "Don't expand yet. Make it feel like a privilege to be on it.",
        onSuccess: {
          users: 1200,
          pmf_score: 15,
          brand_awareness: 8,
          setsFlag: "exclusivity_strategy",
        },
        successText: "Westbrook is obsessed. The waitlist for neighbouring schools is already forming.",
      },
      {
        id: "expand_to_ivies",
        label: "Expand Immediately to All Ivy League Schools",
        description: "Growth over exclusivity. Launch at Yale, Princeton, Columbia, Penn this week.",
        onSuccess: {
          users: 8000,
          brand_awareness: 15,
          technical_debt: 10,
          burn_rate: 500,
        },
        successText: "10,000 students in 2 weeks. The servers are struggling. It doesn't matter.",
      },
    ],
  },

  {
    id: "bookface_winklevoss",
    title: "⚖️ The Twins",
    description: "Tyler and Cameron Westfield, and their partner Divya Nair, claim you stole their idea — CampusConnect. They had commissioned you to help build it, and instead you built your own competing site. They want to settle. Or they'll sue.",
    trigger: { type: "month_reached", value: 5 },
    act: 1,
    choices: [
      {
        id: "settle_early",
        label: "Settle — Pay $65K Cash & $20K Stock",
        description: "Make it go away. It's not worth the distraction.",
        onSuccess: {
          cash: -65_000,
          ceo_reputation: 5,
          setsFlag: "twins_settled",
        },
        successText: "Settled. They'll come back later for more — but for now, the distraction is gone.",
      },
      {
        id: "fight_it",
        label: "Fight — Your Idea Is Completely Different",
        description: "Go to court. Social networking and a dating site for campus athletes are not the same thing.",
        onSuccess: {
          ceo_reputation: -10,
          brand_awareness: 10, // controversy brings press
          cash: -30_000, // legal fees
          setsFlag: "twins_fighting",
        },
        successText: "You fight. The press covers it. The story makes BookFace look interesting — and ruthless.",
      },
    ],
  },

  {
    id: "bookface_palo_alto",
    title: "☀️ Move to Palo Alto",
    description: "Shane Paxton — the guy who co-founded StreamRip — has introduced himself. He says BookFace needs to leave Westbrook and move to Silicon Valley permanently. 'You don't want to be a $10M company. You want to be a $100M company.' Eddie hates him. You're intrigued.",
    trigger: { type: "month_reached", value: 14 },
    act: 1,
    choices: [
      {
        id: "move_to_sv",
        label: "Move — Silicon Valley Is Where It Happens",
        description: "Pack up. Move to a house in Palo Alto. Bring Sean onboard.",
        onSuccess: {
          brand_awareness: 15,
          users: 5000,
          activatesKeyPersonId: "sean",
          keyPersonLoyaltyDelta: [{ personId: "eduardo", delta: -20 }],
          setsFlag: "moved_to_sv",
        },
        successText: "You're in the Valley. VCs are calling. Eduardo is furious — he's still in New York.",
      },
      {
        id: "stay_at_harvard",
        label: "Stay — Focus on the Product",
        description: "Don't let geography distract you from building.",
        onSuccess: {
          product_quality: 10,
          pmf_score: 8,
          keyPersonLoyaltyDelta: [{ personId: "eduardo", delta: 10 }],
        },
        successText: "You stayed. Growth is slower — but the product is cleaner. VCs notice quality.",
      },
    ],
  },

  {
    id: "bookface_first_vc",
    title: "💰 Peter Hale's Check",
    description: "Peter Hale — SwiftPay co-founder, contrarian billionaire — wants to write a $500,000 check for 10% of BookFace. He thinks social networking is the future. He's the only VC who gets it. But you need to get Eddie to agree to the dilution.",
    trigger: { type: "month_reached", value: 18 },
    act: 1,
    choices: [
      {
        id: "take_thiel_money",
        label: "Take the Money — $500K at 10%",
        description: "Dilute Eduardo. Bring in Thiel. This is the rocket fuel you need.",
        onSuccess: {
          cash: 500_000,
          brand_awareness: 15,
          ceo_reputation: 15,
          keyPersonLoyaltyDelta: [{ personId: "eduardo", delta: -15 }],
          setsFlag: "thiel_investment",
        },
        successText: "Thiel's in. The word spreads through Silicon Valley overnight. BookFace is real.",
      },
      {
        id: "negotiate_thiel",
        label: "Negotiate — Push for 7%",
        description: "Thiel is FOMO-driven. Push him. You're worth more.",
        onSuccess: {
          cash: 500_000,
          brand_awareness: 15,
          ceo_reputation: 20,
          keyPersonLoyaltyDelta: [{ personId: "eduardo", delta: -10 }],
          setsFlag: "thiel_investment",
        },
        onFail: {
          team_morale: -10,
          ceo_reputation: -5,
        },
        successRate: 0.55,
        successText: "He agreed to 7%. Thiel respects your conviction.",
        failText: "He walked. You'll need to find another investor.",
      },
    ],
  },

  {
    id: "bookface_dilute_eduardo",
    title: "🔪 The Dilution",
    description: "Your lawyers have recommended restructuring the company in Delaware. In the process, Eddie's equity stake will be diluted from 34% to under 1%. He's been inactive — still in New York. You're in Palo Alto building the future. Shane supports the move. The lawyers say it's legal.",
    trigger: { type: "month_reached", value: 28 },
    act: 1,
    requiredPriorEvents: ["bookface_palo_alto"],
    choices: [
      {
        id: "dilute_eduardo",
        label: "Proceed — His Inactivity Justifies It",
        description: "Execute the restructuring. Eduardo's stake drops to 0.03%.",
        onSuccess: {
          ceo_reputation: -15,
          team_morale: 5,
          deactivatesKeyPersonId: "eduardo",
          setsFlag: "eduardo_diluted",
        },
        successText: "Done. Eduardo's lawyer calls the next morning. This will not be over quickly.",
      },
      {
        id: "be_fair_to_eduardo",
        label: "Renegotiate Fairly — Keep Him at 10%",
        description: "Reduce his stake but treat him fairly. A clean settlement.",
        condition: (s) => s.metrics.cash >= 100_000,
        conditionFailReason: "You need $100K to buy down his stake at a fair valuation.",
        onSuccess: {
          cash: -100_000,
          ceo_reputation: 10,
          keyPersonLoyaltyDelta: [{ personId: "eduardo", delta: -10 }],
          setsFlag: "eduardo_fair_deal",
        },
        successText: "Eduardo agrees. He's unhappy but accepts. No lawsuit. The company stays focused.",
      },
    ],
  },

  {
    id: "bookface_yahoo_offer",
    title: "💸 Yahoo Wants to Buy You",
    description: "Yahoo's CEO calls. They want to buy BookFace for $1 Billion. One billion dollars. You're 21 years old. Eduardo, your investors, Sean — everyone is pressuring you to take it. You would never have to work again.",
    trigger: { type: "month_reached", value: 30 },
    act: 1,
    isClimax: true,
    choices: [
      {
        id: "reject_yahoo",
        label: "Reject the Offer — This Is Bigger",
        description: "Walk away from $1 Billion. You believe BookFace is worth 100× that.",
        onSuccess: {
          ceo_reputation: 20,
          brand_awareness: 20,
          keyPersonLoyaltyDelta: [
            { personId: "sean", delta: 20 },
            { personId: "eduardo", delta: -20 },
          ],
          setsFlag: "yahoo_rejected",
        },
        successText: "You said no. The board was furious. Your investors were pale. You had never been more certain of anything.",
      },
      {
        id: "accept_yahoo",
        label: "Accept — $1B Is Life-Changing",
        description: "Take the deal. It's a legitimate exit and an incredible return.",
        onSuccess: {
          cash: 500_000_000,
          valuation_multiplier: 5.0,
          setsFlag: "yahoo_deal_accepted",
        },
        successText: "You sold. You're a billionaire at 21. But the question lingers: what could it have become?",
      },
      {
        id: "counter_yahoo",
        label: "Counter at $2B — Call Their Bluff",
        description: "If they really want it, they'll pay the right price.",
        onSuccess: {
          ceo_reputation: 15,
          brand_awareness: 15,
          setsFlag: "yahoo_rejected",
        },
        onFail: {
          ceo_reputation: -5,
        },
        successRate: 0.4,
        successText: "Yahoo walked. You never had any intention of selling.",
        failText: "Yahoo countered at $1.1B and you stuck at $2B. They walked. No deal.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 2: Growth at All Costs
// ─────────────────────────────────────────────────────────────────────────────

const ACT2_EVENTS: StoryEvent[] = [
  {
    id: "bookface_news_feed",
    title: "📰 The News Feed",
    description: "You're about to launch News Feed — a constant stream of everything your friends do, automatically surfaced to your homepage. Your team thinks it'll cause a massive backlash. Users will call it a violation of privacy. But you believe this is the core product that makes BookFace truly social.",
    trigger: { type: "month_reached", value: 38 },
    act: 2,
    choices: [
      {
        id: "launch_news_feed",
        label: "Launch It — This Is the Future of Social",
        description: "Ship News Feed to all users. Accept the backlash.",
        onSuccess: {
          users: 100000,
          brand_awareness: 20,
          ceo_reputation: -10, // short-term backlash
          pmf_score: 25,
          setsFlag: "news_feed_live",
        },
        successText: "The backlash is deafening — and then the engagement data comes in. Users spend 3× longer on the site. They hate it and can't stop using it.",
      },
      {
        id: "add_privacy_controls",
        label: "Launch With Granular Privacy Controls",
        description: "Slower to ship, but give users fine-grained control over what appears.",
        onSuccess: {
          users: 40000,
          brand_awareness: 10,
          ceo_reputation: 10,
          pmf_score: 15,
          setsFlag: "news_feed_live",
        },
        successText: "Users appreciate the controls. Growth is slower but backlash is minimal.",
      },
    ],
  },

  {
    id: "bookface_hire_sheryl",
    title: "👩‍💼 The COO Who Changed Everything",
    description: "Sara Segal is running SearchGo's global online sales division. You had dinner with her at a party and talked for 3 hours about monetizing social at scale. She wants to join BookFace as COO. She's the most operationally brilliant person you've ever met — and she'll free you to focus only on product.",
    trigger: { type: "month_reached", value: 55 },
    act: 2,
    choices: [
      {
        id: "hire_sheryl",
        label: "Hire Sheryl as COO",
        description: "Give her full operational authority. You focus on product and vision.",
        onSuccess: {
          brand_awareness: 20,
          activatesKeyPersonId: "sheryl",
          keyPersonLoyaltyDelta: [{ personId: "sheryl", delta: 20 }],
          setsFlag: "sheryl_hired",
        },
        successText: "Sheryl's first month: she restructures sales, hires 40 people, and triples ad revenue. She's extraordinary.",
      },
      {
        id: "keep_control",
        label: "Hire Her as VP Sales — Not COO",
        description: "You're not ready to give up operational control.",
        onSuccess: {
          brand_awareness: 10,
          activatesKeyPersonId: "sheryl",
          keyPersonLoyaltyDelta: [{ personId: "sheryl", delta: -10 }],
        },
        successText: "Sheryl joins but is constrained. She's excellent — but not able to operate at her full ability.",
      },
    ],
  },

  {
    id: "bookface_ad_model",
    title: "📊 'We Don't Do Ads'",
    description: "You famously said you'd never clutter BookFace with ads. Now Sheryl's pitch: personalized ads based on social graph data. It's the most targeted advertising product ever built. The problem is: users' data is the product.",
    trigger: { type: "month_reached", value: 65 },
    act: 2,
    choices: [
      {
        id: "launch_targeted_ads",
        label: "Launch Social Graph Advertising",
        description: "Use user data to hyper-target ads. The revenue potential is enormous.",
        condition: (_s, state) => state.narrativeFlags["sheryl_hired"] === true,
        conditionFailReason: "This requires Sheryl as COO to build the ad system.",
        onSuccess: {
          revenue: 20_000_000,
          brand_awareness: 15,
          ceo_reputation: -8, // privacy critics
          pmf_score: 5,
          setsFlag: "ad_model_launched",
        },
        successText: "The ad engine launches. $1M/day in revenue by month 3. Privacy advocates are outraged. The board loves you.",
      },
      {
        id: "subscription_model",
        label: "Subscription — $5/Month for No Ads",
        description: "Charge users directly. Respect their data.",
        onSuccess: {
          revenue: 2_000_000,
          ceo_reputation: 15,
          brand_awareness: 5,
          users: -5000, // some users leave
        },
        successText: "The press calls you 'the social network that respects users.' Revenue is slower — but clean.",
      },
    ],
  },

  {
    id: "bookface_500m_users",
    title: "🌍 500 Million People",
    description: "July 2010. BookFace hits 500 million active users. A documentary about your co-founder disputes is premiering at Cannes. You don't care about the movie. You care that half a billion humans chose to put their social lives on your platform.",
    trigger: { type: "users_reached", value: 500000 },
    act: 2,
    isClimax: true,
    choices: [
      {
        id: "celebrate_milestone",
        label: "Internal Only — Ship the Next Feature",
        description: "No press release. Just tell the team, then get back to work.",
        onSuccess: {
          team_morale: 20,
          ceo_reputation: 10,
          product_quality: 5,
        },
        successText: "You told the team. Then you asked: 'What's next?' That's your answer.",
      },
      {
        id: "public_celebration",
        label: "Announce It Publicly — A Milestone Moment",
        description: "Press release, media interviews, partner with a charity.",
        onSuccess: {
          brand_awareness: 25,
          ceo_reputation: 15,
          users: 50000,
        },
        successText: "The world celebrates with you. The network effect accelerates.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 3: Going Public
// ─────────────────────────────────────────────────────────────────────────────

const ACT3_EVENTS: StoryEvent[] = [
  {
    id: "bookface_ipo",
    title: "🔔 The IPO",
    description: "May, 2012. The most anticipated tech IPO since SearchGo. BookFace is going public at a $104B valuation. You ring the bell remotely from your Palo Alto HQ in a hoodie. Sterling Bank prices it at $38. First trade: $42.05. Then the NasTech exchange systems glitch. Then the stock starts to fall.",
    trigger: { type: "month_reached", value: 100 },
    act: 3,
    isClimax: true,
    soundtrackCue: "closing_bell",
    choices: [
      {
        id: "ipo_goes_public",
        label: "Ring the Bell — Go Public",
        description: "File the S-1. Do the roadshow. List on NASDAQ at $38/share.",
        condition: (s) => s.metrics.users >= 800000 && s.metrics.revenue >= 3_000_000,
        conditionFailReason: "Need 800K+ Users and $3M+ Monthly Revenue to satisfy SEC requirements.",
        onSuccess: {
          cash: 10_000_000_000,
          valuation_multiplier: 10.0,
          brand_awareness: 40,
          ceo_reputation: 10,
          setsFlag: "bookface_public",
        },
        successText: "Day 1 closes at $38.23 — flat from IPO price. Wall Street is disappointed. Investors are confused. You raised $16B. You don't understand their problem.",
      },
    ],
  },

  {
    id: "bookface_mobile_crisis",
    title: "📱 The Mobile Problem",
    description: "Post-IPO, your stock falls 50% in 3 months. The reason: you have no mobile revenue. Everyone is accessing BookFace on phones but you make money only from desktop ads. Analysts are calling BookFace 'a dead-end desktop company.' You need to fix this — fast.",
    trigger: { type: "month_reached", value: 106 },
    act: 3,
    requiredPriorEvents: ["bookface_ipo"],
    choices: [
      {
        id: "rebuild_mobile",
        label: "Tear Down the App — Rebuild Native",
        description: "Abandon the HTML5 mobile app. Rebuild iOS and DroidOS natively from scratch. 6 months.",
        condition: (s) => s.metrics.technical_debt <= 60,
        conditionFailReason: "Technical debt too high. You need to reduce tech debt before a native rebuild.",
        onSuccess: {
          cash: -50_000_000,
          product_quality: 25,
          brand_awareness: 20,
          valuation_multiplier: 1.8,
          setsFlag: "mobile_rebuilt",
        },
        successText: "The new native app ships. Engagement doubles. The stock starts recovering.",
      },
      {
        id: "mobile_ads_first",
        label: "Prioritize Mobile Ads — Revenue Now",
        description: "Don't rebuild the app. Just focus on fitting ads into the mobile feed.",
        onSuccess: {
          revenue: 50_000_000,
          brand_awareness: 10,
          product_quality: -5,
          setsFlag: "mobile_ads_live",
        },
        successText: "Mobile ad revenue arrives fast. The stock stabilizes. The product quality suffers — but Wall Street is happy.",
      },
    ],
  },

  {
    id: "bookface_instagram",
    title: "📷 The $1 Billion Photo",
    description: "PhotoGram has 30 million users and a tiny team of 13. Your product team is scared: they might become what photo-sharing on mobile looks like. You can buy them for $1 Billion — cash and stock. It's a huge number for a company with no revenue. The board thinks you've lost your mind.",
    trigger: { type: "month_reached", value: 90 },
    act: 3,
    choices: [
      {
        id: "buy_instagram",
        label: "Acquire PhotoGram — $1B",
        description: "Buy them before a competitor does. Let them operate independently.",
        condition: (s) => s.valuation >= 50_000_000_000,
        conditionFailReason: "Your valuation needs to support a $1B acquisition.",
        onSuccess: {
          cash: -1_000_000_000,
          users: 300000,
          brand_awareness: 25,
          valuation_multiplier: 1.4,
          setsFlag: "instagram_acquired",
        },
        successText: "You bought PhotoGram for $1B. Three years later it's worth $100B. The board never brings it up again.",
      },
      {
        id: "build_own",
        label: "Build Our Own — Don't Overpay",
        description: "Internal project: BookFace Camera. Ship in 3 months.",
        onSuccess: {
          cash: -5_000_000,
          product_quality: 10,
          brand_awareness: 5,
        },
        successText: "BookFace Camera ships. It's decent. PhotoGram gets acquired by a rival 4 years later.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS — ACT 4: The Reckoning
// ─────────────────────────────────────────────────────────────────────────────

const ACT4_EVENTS: StoryEvent[] = [
  {
    id: "bookface_cambridge",
    title: "🗂️ The Data Breach",
    description: "A political consultancy harvested data on 87 million BookFace users without their knowledge using a quiz app. The Guardian and New York Times have the story. It publishes in 12 hours. You're going to wake up tomorrow to the worst PR crisis in your company's history.",
    trigger: { type: "month_reached", value: 185 },
    act: 4,
    isClimax: true,
    soundtrackCue: "boardroom_crisis",
    choices: [
      {
        id: "get_ahead_of_crisis",
        label: "Get Ahead of It — Public Apology Today",
        description: "Post a personal apology before the story breaks. Take full responsibility.",
        onSuccess: {
          ceo_reputation: -15,
          brand_awareness: -20,
          users: -100000,
          cash: -1_000_000_000, // legal settlements incoming
          setsFlag: "cambridge_responded",
        },
        successText: "You got ahead of it. The press still eviscerated you — but users respected the transparency. Barely.",
      },
      {
        id: "lawyer_response",
        label: "Legal Team First — Minimize Liability",
        description: "Let lawyers draft a response. Minimize, don't escalate.",
        onSuccess: {
          ceo_reputation: -30,
          brand_awareness: -35,
          users: -500000,
          cash: -5_000_000_000, // massive FTC fine
          setsFlag: "cambridge_lawyered",
        },
        successText: "The press destroyed you. Congress called. The FTC fined you $5 Billion — the largest fine in FTC history.",
      },
    ],
  },

  {
    id: "bookface_senate_hearing",
    title: "🏛️ Senator, We Run Ads",
    description: "You're sitting in front of 44 United States Senators. They're asking you how BookFace works. You've prepared for 2 weeks. One Senator asks how you make money. You think for a beat, and then you say: 'Senator, we run ads.'",
    trigger: { type: "month_reached", value: 190 },
    act: 4,
    requiredPriorEvents: ["bookface_cambridge"],
    isClimax: true,
    choices: [
      {
        id: "prepared_testimony",
        label: "Deliver Prepared Testimony — Stay Precise",
        description: "Stick to your preparation. Acknowledge failures. Commit to changes.",
        onSuccess: {
          ceo_reputation: 10,
          brand_awareness: 5,
          setsFlag: "senate_survived",
        },
        successText: "You survived. Your prepared answers frustrated senators who wanted dramatic moments. The stock barely moved.",
      },
      {
        id: "apologize_broadly",
        label: "Open With a Personal Apology",
        description: "Start by saying sorry — broadly, personally, and without legal hedging.",
        onSuccess: {
          ceo_reputation: 20,
          brand_awareness: 15,
          users: 50000, // users respect the humility
          setsFlag: "senate_survived",
        },
        successText: "The apology landed. You looked human for the first time in years. The press softened. Slightly.",
      },
    ],
  },

  {
    id: "bookface_2b_users",
    title: "🌐 2 Billion People",
    description: "June 27, 2017. BookFace announces 2 billion monthly active users. One in four humans on Earth. You started this in a dorm room with no plan other than 'this is interesting.' It is now the largest social gathering in human history. It's also the largest experiment in human attention ever conducted.",
    trigger: { type: "users_reached", value: 2_000_000 },
    act: 4,
    isClimax: true,
    soundtrackCue: "closing_bell",
    choices: [
      {
        id: "win_bookface",
        label: "Celebrate — Then Keep Connecting the World",
        description: "Post your statement: 'We're just getting started.'",
        onSuccess: {
          team_morale: 25,
          brand_awareness: 20,
          valuation_multiplier: 1.3,
          ceo_reputation: 15,
          setsFlag: "game_complete",
        },
        successText: "2 Billion. The question now isn't whether you connected the world. It's what that means.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const BOOKFACE_CAMPAIGN: StoryCampaign = {
  id: "bookface",
  companyName: "BookFace",
  founderName: "Mark",
  founderEmoji: "📘",
  industry: "Social Media",
  tagline: "Move fast. Break things. Connect the world.",
  description: "A dorm room. A stolen dataset. A website that accidentally became the world's public square. Connect 2 billion people — and reckon with what that power means.",
  difficulty: "Normal",
  themeColors: {
    primary: "from-blue-700 to-blue-950",
    accent: "#1877f2",
    badge: "bg-blue-900 text-blue-100",
  },
  startingMetrics: {
    cash: 19_000,
    users: 0,
    product_quality: 60,
    technical_debt: 20,
    team_morale: 95,
    brand_awareness: 1,
    pmf_score: 20,
    ceo_reputation: 70,
    innovation: 40,
  },
  winCondition: {
    description: "Reach 2 Billion Monthly Active Users",
    check: (startup) => startup.metrics.users >= 2_000_000,
  },
  events: [
    ...ACT1_EVENTS,
    ...ACT2_EVENTS,
    ...ACT3_EVENTS,
    ...ACT4_EVENTS,
  ],
  initialKeyPeople: [EDUARDO, SEAN, SHERYL],
  initialBoardMembers: INITIAL_BOARD,
  initialRivals: [MYSPACE_RIVAL, TWITTER_RIVAL],
  acts: ACTS,
};
