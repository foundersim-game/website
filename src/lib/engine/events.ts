import { GameEvent } from "@/components/EventModal";

// Event pool — 100+ predefined game events for a realistic startup simulation
export const PREDEFINED_EVENTS: GameEvent[] = [

    // ══════════════════════════════════════════
    // EARLY CONFLICT & CULTURE
    // ══════════════════════════════════════════
    {
        event_id: "cofounder_conflict",
        stage: "early_startup",
        title: "Co-Founder Conflict",
        description: "Your co-founder wants to pivot the company. They feel the current market is too saturated and thinks you've been building the wrong thing for 3 months.",
        choices: [
            { text: "Stay the course — your vision is correct", effects: { team_morale: -25, risk_appetite: -5 } },
            { text: "Pivot strategy together", effects: { product_quality: -15, team_morale: 5, intelligence: 5 } },
            { text: "Buy out co-founder's stake ($15K)", effects: { cash: -15000, team_morale: -20, employees: -1 } }
        ],
        repeatable: false
    },
    {
        event_id: "cofounder_equity_dispute",
        stage: "early_startup",
        title: "Equity Dispute 📄",
        description: "Your co-founder is demanding a larger equity slice, citing they've contributed more technical work. There's no signed agreement in place yet.",
        choices: [
            { text: "Give them 5% more — keep the peace", effects: { team_morale: 15, networking: -5 } },
            { text: "Mediate with a lawyer ($3K)", effects: { cash: -3000, team_morale: 5, reputation: 5 } },
            { text: "Refuse. Threaten to dissolve the company.", effects: { team_morale: -30, risk_appetite: 10 } }
        ]
    },
    {
        event_id: "server_outage",
        stage: "mvp",
        title: "Server Outage! 🚨",
        description: "Your cloud provider goes down during a critical marketing launch. 40% of users can't access the product for 6 hours. Refund requests are flooding in.",
        choices: [
            { text: "Write an honest public post-mortem", effects: { brand_awareness: 5, product_quality: -5 } },
            { text: "Offer free credits to affected users", effects: { cash: -8500, team_morale: -5 } },
            { text: "Suppress it — fix quietly and hope nobody noticed", effects: { brand_awareness: -15, reputation: -15 } }
        ],
        repeatable: true
    },
    {
        event_id: "viral_tweet",
        stage: "mvp",
        title: "Viral Tweet 🐦",
        description: "A prominent tech influencer tweeted about your product calling it 'the tool I've been waiting for'. You've had 10,000 signups in 24 hours.",
        choices: [
            { text: "Engage personally with every comment", effects: { brand_awareness: 15, networking: 5 } },
            { text: "Focus on stability: monitor servers first", effects: { product_quality: 5, brand_awareness: 5 } },
            { text: "Pitch the influencer for a partnership deal", effects: { networking: 10, brand_awareness: -5 } }
        ]
    },
    {
        event_id: "talent_poaching",
        stage: "early_startup",
        title: "Talent Poaching 🎯",
        description: "A Big Tech company (Meta) is trying to poach your lead engineer with a 2.5× salary offer and $200K RSUs. They want an answer by Friday.",
        choices: [
            { text: "Match the salary (costs $12K/mo extra)", effects: { cash: -12000, burn_rate: 1500, team_morale: 5 } },
            { text: "Offer more equity — convince them to stay", effects: { team_morale: 10, networking: -10 } },
            { text: "Wish them well and start hiring immediately", effects: { employees: -1, team_morale: -25, cash: 5000 } }
        ],
        repeatable: true
    },
    {
        event_id: "legal_threat",
        stage: "growth_stage",
        title: "Patent Troll ⚖️",
        description: "A mystery shell company in Delaware claims your core feature infringes Patent #7,843,281 — filed in 2009. They want $200K to settle.",
        choices: [
            { text: "Fight in court (long, expensive)", effects: { cash: -35000, reputation: 10, stress_tolerance: -15 } },
            { text: "Pay the settlement — not worth the fight", effects: { cash: -75000, risk_appetite: -5 } },
            { text: "Ignore — call their bluff", effects: { reputation: -20, stress_tolerance: -10, risk_appetite: 15 } }
        ]
    },
    {
        event_id: "acquisition_rumor",
        stage: "growth_stage",
        title: "Acquisition Rumors 👀",
        description: "TechCrunch is reporting that a major tech company is circling your company with a $15M acquisition interest. Your team is distracted with interviews.",
        choices: [
            { text: "Issue a denial statement publicly", effects: { reputation: 5, team_morale: -5, product_quality: 5 } },
            { text: "Quietly reach out to explore the offer", effects: { networking: 15, risk_appetite: 10, product_quality: -10 } },
            { text: "Host a team meeting to address uncertainty", effects: { team_morale: 20, cash: -2000 } }
        ]
    },
    {
        event_id: "security_breach",
        stage: "early_startup",
        title: "Data Breach 🔓",
        description: "A hacker claims to have 5,000 user email addresses and hashed passwords. They're demanding $20K in crypto to stay quiet. You've confirmed the breach.",
        choices: [
            { text: "Full transparency: notify all users immediately", effects: { reputation: 15, brand_awareness: -15, cash: -10000 } },
            { text: "Patch quietly and force password resets", effects: { reputation: -45, product_quality: 10 } },
            { text: "Pay the ransom", effects: { cash: -35000, reputation: -10 } }
        ]
    },

    // ══════════════════════════════════════════
    // HIRING & TEAM DYNAMICS
    // ══════════════════════════════════════════
    {
        event_id: "team_overworked",
        stage: "early_startup",
        title: "Team Burnout Warning 🔥",
        description: "Engineering has been pulling 80-hour weeks for 2 months. Three engineers are quietly browsing LinkedIn. Sprint velocity has dropped 40%.",
        choices: [
            { text: "Cancel all non-essential projects for 2 weeks", effects: { product_quality: -10, team_morale: 25 } },
            { text: "Give a surprise $2K bonus per person", effects: { cash: -8000, team_morale: 20 } },
            { text: "Push through — launch is priority", effects: { team_morale: -35, product_quality: 15 } }
        ]
    },
    {
        event_id: "employee_raise_demand",
        stage: "early_startup",
        title: "Salary Ultimatum 💸",
        description: "Your senior engineer just slid a competing offer across the table — $30K more per year. They're giving you 48 hours.",
        choices: [
            { text: "Match the offer", effects: { cash: -3500, burn_rate: 3500, team_morale: 15 } },
            { text: "Counter with equity acceleration", effects: { team_morale: 10, networking: 5 } },
            { text: "Decline. Wish them luck.", effects: { employees: -1, team_morale: -30, technical_skill: -15 } }
        ]
    },
    {
        event_id: "toxic_employee",
        stage: "growth_stage",
        title: "Toxic High Performer 💀",
        description: "Your best salesperson is smashing quota but creating a hostile environment. Three employees have filed formal HR complaints. HR says act now.",
        choices: [
            { text: "Fire them. Culture over metrics.", effects: { team_morale: 20, cash: -3000, brand_awareness: -5 } },
            { text: "Final written warning + coaching", effects: { team_morale: 5, risk_appetite: -5 } },
            { text: "Ignore it — revenue wins.", effects: { team_morale: -25, reputation: -10 } }
        ]
    },
    {
        event_id: "remote_work_debate",
        stage: "mvp",
        title: "Return to Office Mandate? 🏢",
        description: "Half your team wants full remote. The other half demands an office for collaboration. A VP just threatened to quit if you don't decide by Monday.",
        choices: [
            { text: "Fully remote forever", effects: { team_morale: 15, cash: 3000, burn_rate: -500 } },
            { text: "Flexible hybrid — 2 days office", effects: { team_morale: 5, product_quality: 5 } },
            { text: "Mandatory office 5 days", effects: { team_morale: -20, product_quality: 10 } }
        ]
    },
    {
        event_id: "team_offsite",
        stage: "early_startup",
        title: "Team Retreat Offer 🏔️",
        description: "A boutique resort offers a 3-day corporate retreat package for $8K. The team hasn't had a team event in 18 months.",
        choices: [
            { text: "Book it — team culture is the product", effects: { cash: -8000, team_morale: 30, networking: 10 } },
            { text: "Local team dinner instead", effects: { cash: -800, team_morale: 10 } },
            { text: "Skip it — burn rate is too high", effects: { team_morale: -5 } }
        ]
    },
    {
        event_id: "mass_resignation",
        stage: "growth_stage",
        title: "Great Resignation 😱",
        description: "Three engineers have just handed in back-to-back resignation letters. They say compensation isn't competitive and there's no career growth visible.",
        choices: [
            { text: "Emergency retention bonuses ($5K each)", effects: { cash: -15000, team_morale: 15 } },
            { text: "Promote the remaining team + revamp roles", effects: { team_morale: 10, product_quality: -10 } },
            { text: "Accept it. Begin mass hiring immediately.", effects: { employees: -3, burn_rate: 5000, team_morale: -10 } }
        ]
    },
    {
        event_id: "bad_hire",
        stage: "mvp",
        title: "Reference Check Red Flag 🚩",
        description: "Your new marketing hire's previous employer just called asking if they took proprietary client data when they left. They're now on your team.",
        choices: [
            { text: "Investigate internally before acting", effects: { team_morale: -5, product_quality: 5 } },
            { text: "Let them go immediately", effects: { employees: -1, team_morale: -10, reputation: 10 } },
            { text: "Ignore it — past is past", effects: { risk_appetite: 5, reputation: -10 } }
        ]
    },
    {
        event_id: "culture_recognition",
        stage: "growth_stage",
        title: "Best Place to Work 🏆",
        description: "A tech publication is profiling your company as one of the top startups to work for in the region. They want a feature interview.",
        choices: [
            { text: "Do the interview — free PR!", effects: { brand_awareness: 20, team_morale: 15, networking: 5 } },
            { text: "Decline — need to stay focused", effects: {} },
            { text: "Request they wait till after the product launch", effects: { brand_awareness: 10 } }
        ]
    },

    // ══════════════════════════════════════════
    // MARKET & COMPETITIVE EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "competitor_price_war",
        stage: "growth_stage",
        title: "Price War Declared ⚔️",
        description: "A well-funded competitor just slashed their prices by 40% and is running aggressive ads targeting your exact customer segments.",
        choices: [
            { text: "Match price temporarily", effects: { cash: -8000, users: -150, brand_awareness: 5 } },
            { text: "Double down on quality differentiation", effects: { product_quality: 15, users: -250, brand_awareness: 10 } },
            { text: "Move upmarket — ignore them", effects: { brand_awareness: 5, risk_appetite: 15 } }
        ]
    },
    {
        event_id: "copycat_launch",
        stage: "growth_stage",
        title: "Copycat Competitor 🪞",
        description: "A well-resourced startup just launched what is clearly a clone of your product. They have $5M raised, a bigger team, and aggressive marketing.",
        choices: [
            { text: "Ship features faster — widen the moat", effects: { product_quality: 15, burn_rate: 3500 } },
            { text: "Focus on brand and community loyalty", effects: { brand_awareness: 15, users: 50 } },
            { text: "Threaten legal action for IP", effects: { reputation: 10, cash: -12000 } }
        ]
    },
    {
        event_id: "industry_award",
        stage: "growth_stage",
        title: "Industry Award Nomination 🏆",
        description: "You've been nominated for 'Best Startup of the Year' at a major tech conference gala. Winning requires schmoozing and a $3K table sponsorship.",
        choices: [
            { text: "Attend and campaign hard for the win", effects: { cash: -3000, reputation: 25, brand_awareness: 15, networking: 10 } },
            { text: "Attend but skip the politics", effects: { cash: -1500, reputation: 10, brand_awareness: 5 } },
            { text: "Skip it. Ship product instead.", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "economic_downturn",
        stage: "growth_stage",
        title: "Market Downturn 📉",
        description: "The economy is tightening. Investors are pulling back, SaaS churn is up 30% industry-wide, and customers are asking for discounts to renew.",
        choices: [
            { text: "Survival mode: cut all non-essential spend", effects: { cash: 8000, burn_rate: -2000, team_morale: -10 } },
            { text: "Invest aggressively while others retreat", effects: { cash: -10000, brand_awareness: 20, risk_appetite: 10 } },
            { text: "Pivot to SMB — they're still spending", effects: { product_quality: -5, brand_awareness: 5, users: 50 } }
        ]
    },
    {
        event_id: "platform_policy_change",
        stage: "mvp",
        title: "Platform Policy Change ⚠️",
        description: "Apple has changed App Store review policies. Your app's primary feature violates the new guidelines. You have 30 days to comply or get delisted.",
        choices: [
            { text: "Comply immediately — redesign the feature", effects: { product_quality: -15, cash: -5000 } },
            { text: "File an appeal and wait", effects: { risk_appetite: 10, brand_awareness: -5 } },
            { text: "Launch a web version as a fallback", effects: { cash: -8000, users: 50 } }
        ]
    },
    {
        event_id: "api_shutdown",
        stage: "mvp",
        title: "3rd Party API Shutdown 🔌",
        description: "A third-party API your product is built on just announced they're shutting down in 60 days with no replacement guidance.",
        choices: [
            { text: "Build the functionality in-house (expensive)", effects: { cash: -15000, technical_debt: -10, product_quality: 10 } },
            { text: "Migrate to a competing API ($3K integration)", effects: { cash: -3000, product_quality: -5 } },
            { text: "Notify users and give them a credit", effects: { cash: -5000, reputation: 10 } }
        ]
    },
    {
        event_id: "cloud_bill_spike",
        stage: "growth_stage",
        title: "Cloud Bill Spike 💸",
        description: "Your AWS bill just tripled from $2K to $6K due to a viral usage spike from an unexpected source. Optimization is needed immediately.",
        choices: [
            { text: "Immediately optimize and reduce instances", effects: { technical_debt: 15, burn_rate: -2000 } },
            { text: "Negotiate an enterprise contract with AWS", effects: { cash: -5000, burn_rate: -3000 } },
            { text: "Absorb the cost — growth means profit soon", effects: { burn_rate: 6000, cash: -10000 } }
        ],
        repeatable: true
    },
    {
        event_id: "competitor_funding",
        stage: "growth_stage",
        title: "Competitor Raises $20M 😰",
        description: "Your main competitor just announced a $20M Series A. They'll be 3× outspending you on marketing and hiring in the next quarter.",
        choices: [
            { text: "Accelerate your own raise timeline immediately", effects: { networking: 15, risk_appetite: 10 } },
            { text: "Find your niche — avoid direct competition", effects: { product_quality: 10, brand_awareness: -5 } },
            { text: "Stay the course — product quality wins", effects: { team_morale: 10 } }
        ]
    },

    // ══════════════════════════════════════════
    // FUNDING & INVESTOR EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "investor_ghosting",
        stage: "early_startup",
        title: "VC Ghosting 👻",
        description: "A partner at a top-tier VC said 'let's move forward' after your pitch 3 weeks ago. They've now stopped responding to all emails and calls.",
        choices: [
            { text: "Send a polite final follow-up and move on", effects: { stress_tolerance: -5, networking: -5 } },
            { text: "Ask a mutual connection for an introduction", effects: { networking: 10, stress_tolerance: -5 } },
            { text: "Post a subtle 'excited about our next meeting' tweet", effects: { reputation: -10, stress_tolerance: 5 } }
        ]
    },
    {
        event_id: "angel_investment_offer",
        stage: "early_startup",
        title: "Angel Investor Knocking 👼",
        description: "A successful founder angel wants to write a $50K check at a $1M cap SAFE. In exchange they want monthly updates and advisory access.",
        choices: [
            { text: "Accept — cash and a mentor", effects: { cash: 50000, networking: 20 } },
            { text: "Negotiate the cap to $1.5M first", effects: { networking: 5, cash: 50000 } },
            { text: "Decline — not diluting this early", effects: { risk_appetite: 5 } }
        ]
    },
    {
        event_id: "investor_update_missed",
        stage: "growth_stage",
        title: "Missed Investor Update ⚡",
        description: "You forgot to send the monthly investor update for 2 months. One investor just sent a terse email: 'We need to discuss your commitment to transparency.'",
        choices: [
            { text: "Send a detailed catch-up update immediately", effects: { reputation: 10, networking: 5 } },
            { text: "Schedule a call to address it directly", effects: { networking: 15, stress_tolerance: -5 } },
            { text: "Blame it on being too busy building", effects: { reputation: -15, networking: -10 } }
        ]
    },
    {
        event_id: "down_round_pressure",
        stage: "growth_stage",
        title: "Down Round Pressure 📉",
        description: "You're out of runway in 3 months. A VC is willing to invest but only at a 30% lower valuation than your last round. Existing investors are furious.",
        choices: [
            { text: "Accept the down round — survival first", effects: { cash: 200000, reputation: -20, risk_appetite: -10 } },
            { text: "Cut 40% of costs to extend runway", effects: { burn_rate: -5000, team_morale: -25, employees: -2 } },
            { text: "Find an acquirer before it's too late", effects: { networking: 20, risk_appetite: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // PRODUCT & TECHNICAL EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "product_hunt_launch",
        stage: "mvp",
        title: "Product Hunt Launch Day 🚀",
        description: "You've decided to launch on Product Hunt. It's 12:01 AM. Your listing is live. You need to spam every contact you have for upvotes and comments.",
        choices: [
            { text: "All-hands hustle — email every connection", effects: { brand_awareness: 25, users: 200, team_morale: -5 } },
            { text: "Organic only — let the product speak", effects: { brand_awareness: 10, users: 80 } },
            { text: "Launch quietly and gather feedback first", effects: { product_quality: 5, brand_awareness: 5 } }
        ]
    },
    {
        event_id: "critical_bug_in_prod",
        stage: "mvp",
        title: "Critical Bug in Production 🐛",
        description: "A payment processing bug has been corrupting transactions for 48 hours. $12,000 in duplicate charges have hit user accounts. The Twitter thread is going viral.",
        choices: [
            { text: "Full refund + public apology page", effects: { cash: -12000, reputation: 15, brand_awareness: -5 } },
            { text: "Fix and retroactively fix data — no public statement", effects: { reputation: -20, product_quality: 10 } },
            { text: "Give affected users 3 months free", effects: { cash: -5000, reputation: 10 } }
        ],
        repeatable: true
    },
    {
        event_id: "tech_debt_crisis",
        stage: "growth_stage",
        title: "Tech Debt Implosion ⚙️",
        description: "Your engineers say the codebase is 'unmaintainable.' Every new feature takes 3× as long to ship. A major refactor is needed but will take 6 weeks.",
        choices: [
            { text: "Approve the full 6-week refactor sprint", effects: { technical_debt: -40, product_quality: 15, burn_rate: 3000 } },
            { text: "Partial refactor — 2 weeks, reduce debt slowly", effects: { technical_debt: -15, product_quality: 5 } },
            { text: "Keep shipping — deal with debt later", effects: { technical_debt: 20, product_quality: -10 } }
        ]
    },
    {
        event_id: "ai_feature_opportunity",
        stage: "mvp",
        title: "AI Feature Opportunity 🤖",
        description: "GPT-4 API is now available. Competitors are scrambling to add AI features. Your CTO says you can ship an AI feature in 3 weeks for $15K compute budget.",
        choices: [
            { text: "Ship it ASAP — first mover advantage", effects: { cash: -15000, innovation: 20, brand_awareness: 15 } },
            { text: "Wait and build it right (6 weeks)", effects: { product_quality: 20, innovation: 15 } },
            { text: "Skip AI — it's just hype", effects: { brand_awareness: -10 } }
        ]
    },
    {
        event_id: "uptime_achievement",
        stage: "growth_stage",
        title: "99.9% Uptime Milestone ✅",
        description: "You've just crossed 12 months of 99.9% uptime — a key enterprise buying criteria. Enterprise customers are now asking about your SLA documentation.",
        choices: [
            { text: "Publish a formal SLA and pursue enterprise deals", effects: { brand_awareness: 15, reputation: 20, networking: 10 } },
            { text: "Announce it on social media for marketing", effects: { brand_awareness: 20 } },
            { text: "Use it in press release to raise valuation", effects: { reputation: 15, networking: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // FINANCIAL & LEGAL EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "tax_audit",
        stage: "growth_stage",
        title: "Tax Audit Notice 📋",
        description: "The IRS has flagged your R&D tax credit claim from last year. An audit has been opened. Your accountant says it could take 6 months and cost $15K in fees.",
        choices: [
            { text: "Hire a tax attorney, fight the claim", effects: { cash: -15000, reputation: 5 } },
            { text: "Settle with a partial repayment", effects: { cash: -8000, stress_tolerance: -5 } },
            { text: "Represent yourself — you have the documentation", effects: { cash: -2000, risk_appetite: 10, stress_tolerance: -10 } }
        ]
    },
    {
        event_id: "gdpr_violation",
        stage: "growth_stage",
        title: "GDPR Fine Warning ⚖️",
        description: "A user complaint has triggered a GDPR investigation in the EU. You're not fully compliant — no DPA agreement, no data deletion flow. Fine could be up to $50K.",
        choices: [
            { text: "Hire a GDPR consultant and become compliant ($10K)", effects: { cash: -10000, reputation: 15 } },
            { text: "Block EU users until compliant", effects: { users: -200, reputation: 10 } },
            { text: "Ignore — unlikely they'll pursue a startup", effects: { risk_appetite: 5, reputation: -15 } }
        ]
    },
    {
        event_id: "contract_dispute",
        stage: "growth_stage",
        title: "Customer Contract Dispute 📜",
        description: "Your biggest enterprise customer ($8K/mo) is claiming the product doesn't meet SLA requirements and is withholding 3 months of payments.",
        choices: [
            { text: "Negotiate a credit and fix the SLA", effects: { reputation: 5, cash: -5000 } },
            { text: "Escalate to legal — enforce the contract", effects: { cash: -8000, reputation: -5, networking: -5 } },
            { text: "Offer a full refund and walk away", effects: { cash: -24000, team_morale: -10, reputation: 15 } }
        ]
    },
    {
        event_id: "ip_registration",
        stage: "mvp",
        title: "Patent Filing Opportunity 📑",
        description: "Your attorney recommends filing a provisional patent on your core algorithm before competitors copy it. Cost: $8K for provisional + $25K for full.",
        choices: [
            { text: "File the provisional patent now", effects: { cash: -8000, reputation: 10 } },
            { text: "File full patent immediately", effects: { cash: -25000, reputation: 20, networking: 5 } },
            { text: "Skip — patents take too long to matter", effects: { risk_appetite: 5 } }
        ]
    },
    {
        event_id: "regulatory_license",
        stage: "growth_stage",
        title: "Regulatory License Required 📋",
        description: "Your FinTech feature requires an NBFC license to operate legally. The application process takes 4 months and costs $20K in legal fees.",
        choices: [
            { text: "Apply for the license now", effects: { cash: -20000, reputation: 15 } },
            { text: "Operate without it — you're small enough to fly under radar", effects: { risk_appetite: 10, reputation: -20 } },
            { text: "Find a licensed partner to white-label through", effects: { cash: -5000, networking: 10 } }
        ]
    },

    // ══════════════════════════════════════════
    // FOUNDER PERSONAL LIFE
    // ══════════════════════════════════════════
    {
        event_id: "relationship_strain",
        stage: "early_startup",
        title: "Relationship Under Pressure 💔",
        description: "Your partner says they feel neglected — you haven't had a day off in months. They've given you an ultimatum: one real weekend off, or things get serious.",
        choices: [
            { text: "Take the weekend completely off", effects: { stress_tolerance: 15, team_morale: 5 } },
            { text: "Promise to improve but keep working", effects: { stress_tolerance: -5 } },
            { text: "Have an honest conversation about the startup journey", effects: { stress_tolerance: 10, networking: 5 } }
        ]
    },
    {
        event_id: "health_scare",
        stage: "early_startup",
        title: "Founder Health Scare 🏥",
        description: "You've been ignoring chest tightness for weeks. Your doctor ran tests — stress-induced, not cardiac. But you're ordered to reduce work hours immediately.",
        choices: [
            { text: "Follow doctor's orders strictly", effects: { founder_health: 20, stress_tolerance: 15, team_morale: -5 } },
            { text: "Delegate more to your team this month", effects: { founder_health: 10, team_morale: 5, leadership: 5 } },
            { text: "Ignore it — deadlines don't care about health", effects: { founder_health: -20, risk_appetite: 5 } }
        ]
    },
    {
        event_id: "family_obligation",
        stage: "mvp",
        title: "Family Emergency ✈️",
        description: "A family member is critically ill. You need to travel for 2 weeks. Your team is capable but hasn't run without you before.",
        choices: [
            { text: "Go. Empower your team to lead.", effects: { founder_health: 15, leadership: 10, product_quality: -5 } },
            { text: "Go but stay partially online", effects: { stress_tolerance: -10, founder_health: 5 } },
            { text: "Stay — send support but can't leave right now", effects: { stress_tolerance: -20, reputation: -5 } }
        ]
    },
    {
        event_id: "gym_habit",
        stage: "mvp",
        title: "New Morning Routine 💪",
        description: "A fitness coach friend offers to design a personalized morning routine. Just 45 minutes a day. You've gained 12kg since founding the company.",
        choices: [
            { text: "Commit fully — block 6-7 AM daily", effects: { founder_health: 25, stress_tolerance: 15 } },
            { text: "Try it for 30 days first", effects: { founder_health: 10, stress_tolerance: 5 } },
            { text: "No time for it right now", effects: { founder_health: -5 } }
        ]
    },
    {
        event_id: "therapy_session",
        stage: "early_startup",
        title: "Burnout Therapy Recommendation 🧠",
        description: "Your co-founder and a mentor have both separately recommended you see a therapist. You've been snapping at your team and your anxiety has been high.",
        choices: [
            { text: "Book a therapist. Mental health is critical.", effects: { stress_tolerance: 20, founder_health: 10, team_morale: 5 } },
            { text: "Try meditation apps first", effects: { stress_tolerance: 10 } },
            { text: "I'm fine. It's just startup stress.", effects: { stress_tolerance: -10, founder_health: -5 } }
        ]
    },
    {
        event_id: "mentor_dinner",
        stage: "early_startup",
        title: "Mentor Dinner Invite 🍽️",
        description: "A highly successful second-time founder has offered to have dinner with you. They've exited two companies. The conversation could be invaluable.",
        choices: [
            { text: "Accept and come prepared with questions", effects: { networking: 20, intelligence: 5, stress_tolerance: 5 } },
            { text: "Accept casually — just enjoy the meal", effects: { networking: 10 } },
            { text: "Decline — too busy this week", effects: { networking: -5 } }
        ]
    },
    {
        event_id: "imposter_syndrome",
        stage: "early_startup",
        title: "Imposter Syndrome Attack 😰",
        description: "You're at a dinner with top founders and VCs. Everyone seems to have it figured out. You feel like the least experienced person in the room — and someone just asked about your metrics.",
        choices: [
            { text: "Be honest — share your real challenges", effects: { networking: 15, reputation: 10, stress_tolerance: 5 } },
            { text: "Fake confidence — nobody reveals weakness here", effects: { stress_tolerance: -10, networking: 5 } },
            { text: "Leave early — you need some air", effects: { stress_tolerance: 5, networking: -10 } }
        ]
    },
    {
        event_id: "social_isolation",
        stage: "mvp",
        title: "Isolation Setting In 🏠",
        description: "You realize you haven't seen friends outside of work in 3 months. Your social circle has shrunk to investors and employees. You feel increasingly alone.",
        choices: [
            { text: "Plan a proper social weekend — no laptops", effects: { stress_tolerance: 15, founder_health: 10 } },
            { text: "Join a founder peer group for connection", effects: { networking: 15, stress_tolerance: 10 } },
            { text: "Push through — loneliness is part of the journey", effects: { stress_tolerance: -15, founder_health: -5 } }
        ]
    },

    // ══════════════════════════════════════════
    // GROWTH & MEDIA
    // ══════════════════════════════════════════
    {
        event_id: "press_feature",
        stage: "growth_stage",
        title: "Major Press Cover 📰",
        description: "TechCrunch wants to write a profile of your company. The reporter is thorough and will ask hard questions about your path to profitability.",
        choices: [
            { text: "Do the feature — prepare thoroughly", effects: { brand_awareness: 30, reputation: 15, networking: 10 } },
            { text: "Decline — not ready for the scrutiny", effects: { brand_awareness: -5 } },
            { text: "Do it but only answer safe questions", effects: { brand_awareness: 15, reputation: -5 } }
        ]
    },
    {
        event_id: "key_customer_churn",
        stage: "growth_stage",
        title: "Key Customer Churned 😱",
        description: "Acme Corp, your largest customer at $15K/mo, has cancelled their membership. Their reason: 'We found a more complete solution at a lower price.'",
        choices: [
            { text: "Schedule an exit interview to learn deeply", effects: { intelligence: 10, product_quality: 5 } },
            { text: "Offer them a 50% discount to stay", effects: { cash: -5000, users: 50 } },
            { text: "Accept and move on — learn from it", effects: { product_quality: 10, brand_awareness: -5 } }
        ]
    },
    {
        event_id: "conference_speaking",
        stage: "growth_stage",
        title: "Conference Speaking Slot 🎙️",
        description: "A major tech conference has offered you a keynote speaking slot in front of 2,000 attendees. You'd need to prepare for 2 weeks.",
        choices: [
            { text: "Accept and nail the keynote", effects: { brand_awareness: 25, reputation: 20, networking: 15, cash: -2000 } },
            { text: "Accept but do a quick 15-min talk", effects: { brand_awareness: 10, networking: 5 } },
            { text: "Decline — product needs you more", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "media_scandal",
        stage: "growth_stage",
        title: "Media Scandal 📺",
        description: "A disgruntled former employee posted a detailed expose of your company culture on Glassdoor. It's being shared on Twitter and HN.",
        choices: [
            { text: "Respond publicly with facts and honesty", effects: { reputation: 5, brand_awareness: -10, team_morale: -5 } },
            { text: "Address it internally — all-hands meeting", effects: { team_morale: 10, reputation: -5 } },
            { text: "Say nothing — it'll blow over", effects: { reputation: -20, team_morale: -10 } }
        ]
    },
    {
        event_id: "viral_product_review",
        stage: "mvp",
        title: "Viral 5-Star Review ⭐⭐⭐⭐⭐",
        description: "A YouTube creator with 800K subscribers just uploaded a 12-minute review of your product saying it 'changed how they work.' Comments section is exploding.",
        choices: [
            { text: "DM the creator — offer partnership", effects: { brand_awareness: 20, networking: 15, users: 300 } },
            { text: "Amplify it across all your channels", effects: { brand_awareness: 25, users: 200 } },
            { text: "Prepare servers first — plan for traffic spike", effects: { product_quality: 10, users: 150 } }
        ]
    },

    // ══════════════════════════════════════════
    // STRATEGIC PIVOTS & OPPORTUNITIES
    // ══════════════════════════════════════════
    {
        event_id: "enterprise_inbound",
        stage: "growth_stage",
        title: "Enterprise Inbound Lead 💼",
        description: "A Fortune 500 company has inbound-requested a demo. Potential deal size: $120K/year. Only problem — they need ISO 27001 certification you don't have.",
        choices: [
            { text: "Start ISO certification immediately ($15K, 3 months)", effects: { cash: -15000, reputation: 20, brand_awareness: 10 } },
            { text: "Start the demo process anyway and buy time", effects: { networking: 10, risk_appetite: 10 } },
            { text: "Decline — you're not enterprise-ready yet", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "pivot_pressure",
        stage: "mvp",
        title: "Pivot Pressure from Investors 🔄",
        description: "Two of your investors attended your board meeting and suggested pivoting entirely to B2B enterprise. They believe consumer is too hard to monetize.",
        choices: [
            { text: "Follow investor advice — pivot to B2B", effects: { product_quality: -15, brand_awareness: 10, networking: 10 } },
            { text: "Defend your current strategy with data", effects: { reputation: 15 } },
            { text: "Test B2B alongside consumer for one quarter", effects: { burn_rate: 2000, intelligence: 10 } }
        ]
    },
    {
        event_id: "partnership_opportunity",
        stage: "growth_stage",
        title: "Strategic Partnership Offer 🤝",
        description: "A market leader with 200K users wants to integrate your product into their platform. Revenue share: 30% of new users they send you. They want exclusivity.",
        choices: [
            { text: "Accept with exclusivity for 12 months", effects: { users: 500, brand_awareness: 20, networking: 15 } },
            { text: "Accept without exclusivity — negotiate harder", effects: { users: 300, brand_awareness: 15 } },
            { text: "Decline exclusivity entirely", effects: { networking: -5, risk_appetite: 5 } }
        ]
    },
    {
        event_id: "international_expansion",
        stage: "growth_stage",
        title: "International Expansion Signal 🌍",
        description: "30% of your signups are coming from India and Southeast Asia — markets where you have zero presence. Several reseller inquiries have arrived.",
        choices: [
            { text: "Hire a regional sales manager ($8K/mo)", effects: { cash: -8000, burn_rate: 8000, users: 500, brand_awareness: 15 } },
            { text: "Work with the resellers on commission basis", effects: { users: 200, networking: 10 } },
            { text: "Ignore international for now — focus on core market", effects: {} }
        ]
    },
    {
        event_id: "acqui_hire_threat",
        stage: "growth_stage",
        title: "Acqui-Hire Threat 🔮",
        description: "A Big Tech company has approached 4 of your top engineers with acqui-hire packages worth $500K each. They're meeting with the tech team this Friday.",
        choices: [
            { text: "Counter with retention equity packages", effects: { cash: -20000, team_morale: 20, burn_rate: 3000 } },
            { text: "Meet with leadership to understand intent", effects: { networking: 15, team_morale: -10 } },
            { text: "Let them go — rebuild with better aligned team", effects: { employees: -4, team_morale: -20, cash: 5000 } }
        ]
    },

    // ══════════════════════════════════════════
    // POSITIVE & MILESTONE EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "nps_milestone",
        stage: "mvp",
        title: "NPS Score: 72 🎉",
        description: "Your quarterly NPS survey returned a score of 72 — world-class. Users are calling your product 'life-changing.' You can use this in all sales materials.",
        choices: [
            { text: "Feature it prominently on landing page", effects: { brand_awareness: 15, users: 100 } },
            { text: "Share with investors in next update", effects: { networking: 15, reputation: 10 } },
            { text: "Dig into the qualitative feedback to improve", effects: { product_quality: 15 } }
        ]
    },
    {
        event_id: "mrr_milestone",
        stage: "growth_stage",
        title: "MRR Milestone: $10K 📈",
        description: "You've crossed your first $10K MRR. The team is ecstatic. A Hacker News post is trending with your story and 200 people are asking questions.",
        choices: [
            { text: "Write a transparent public earnings post", effects: { brand_awareness: 25, reputation: 15, networking: 10 } },
            { text: "Celebrate internally with the team", effects: { team_morale: 20, cash: -500 } },
            { text: "Stay quiet — don't attract copycats", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "first_enterprise_close",
        stage: "growth_stage",
        title: "First Enterprise Customer Signed 🤝",
        description: "After 3 months of back-and-forth, your first enterprise deal just closed at $50K ARR. The legal docs are signed. Wire is incoming.",
        choices: [
            { text: "Celebrate with the team and announce publicly", effects: { team_morale: 25, brand_awareness: 15 } },
            { text: "Treat it as validation — double down on enterprise sales", effects: { networking: 15, burn_rate: 2000 } },
            { text: "Use it as social proof to close 3 more", effects: { brand_awareness: 10, networking: 20 } }
        ]
    },
    {
        event_id: "feature_idea_from_user",
        stage: "mvp",
        title: "Feature Request Goes Viral 💡",
        description: "A power user posted a detailed feature request thread that collected 400 comments and 800 upvotes. It's clearly something people desperately need.",
        choices: [
            { text: "Ship it next sprint — customer obsession", effects: { product_quality: 15, users: 100, team_morale: 5 } },
            { text: "Add it to the roadmap officially", effects: { brand_awareness: 10, product_quality: 5 } },
            { text: "Research if it should be a paid add-on", effects: { intelligence: 5, cash: 2000 } }
        ]
    },
    {
        event_id: "superuser_emerged",
        stage: "mvp",
        title: "Power User Community 🌟",
        description: "50 of your most engaged users have self-organized into a community Discord server with 800 members. They're creating tutorials and onboarding new users for you.",
        choices: [
            { text: "Invest in the community ($2K/mo community manager)", effects: { cash: -2000, burn_rate: 2000, users: 200, team_morale: 10 } },
            { text: "Join and participate authentically", effects: { brand_awareness: 20, networking: 15 } },
            { text: "Let it grow organically — don't interfere", effects: { users: 100 } }
        ]
    },

    // ══════════════════════════════════════════
    // ADDITIONAL EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "office_lease_crisis",
        stage: "growth_stage",
        title: "Office Lease Expiry 🏢",
        description: "Your office lease is up for renewal. The landlord wants to increase rent by 60%. The team is split on whether to renew, go remote, or find a new space.",
        choices: [
            { text: "Go fully remote — save the rent money", effects: { cash: 5000, burn_rate: -5000, team_morale: 5 } },
            { text: "Negotiate aggressively — accept a small increase", effects: { cash: -2000, team_morale: 5 } },
            { text: "Move to a coworking space temporarily", effects: { cash: -3000, burn_rate: -2000, team_morale: -5 } }
        ]
    },
    {
        event_id: "board_pressure",
        stage: "growth_stage",
        title: "Board Intervention 🚨",
        description: "Your board called an emergency meeting. Growth has slowed for 2 quarters. Two investors are pushing for a CEO change or a strategic pivot before they'll support the next raise.",
        choices: [
            { text: "Present a bold turnaround plan with clear milestones", effects: { reputation: 15, stress_tolerance: -10 } },
            { text: "Agree to hire a President/COO to share leadership", effects: { networking: 10, team_morale: 5, burn_rate: 10000 } },
            { text: "Push back — defend your right to lead", effects: { reputation: -10, risk_appetite: 10, stress_tolerance: -15 } }
        ]
    },
    {
        event_id: "data_privacy_law",
        stage: "growth_stage",
        title: "New Privacy Law Enacted 📜",
        description: "A new data privacy law requires users to explicitly opt-in to analytics tracking. Your conversion funnel data will drop 40% without proper UX updates.",
        choices: [
            { text: "Full compliance immediately with proper consent flows", effects: { reputation: 15, cash: -5000 } },
            { text: "Soft compliance — minimal changes", effects: { reputation: -5 } },
            { text: "Ignore until enforcement begins", effects: { risk_appetite: 5, reputation: -15 } }
        ]
    },
    {
        event_id: "founder_opportunity_conference",
        stage: "mvp",
        title: "YC Founder Summit Invite 🏫",
        description: "Y Combinator has invited you to their founder summit — 500 elite founders and investors for 2 days. Travel + hotel costs ~$3K. It's the best network event of the year.",
        choices: [
            { text: "Attend — every connection is potentially transformative", effects: { networking: 30, cash: -3000, stress_tolerance: -5 } },
            { text: "Attend and pitch to investors on the side", effects: { networking: 20, reputation: 10, cash: -3000 } },
            { text: "Skip — too much to do at the office", effects: { networking: -10 } }
        ]
    },

    // ══════════════════════════════════════════
    // PERSONAL LIFE & FOUNDER PSYCHOLOGY
    // ══════════════════════════════════════════
    {
        event_id: "relationship_strain",
        stage: "early_startup",
        title: "Relationship Strain 💔",
        description: "Your partner says you work 90-hour weeks and they barely see you. They've given you an ultimatum — either make time for them or they're leaving. The stress is visible in your work.",
        choices: [
            { text: "Take a week off to reconnect", effects: { founder_burnout: -20, team_morale: -5, founder_health: 15 } },
            { text: "Hire a COO to take load off you", effects: { cash: -15000, burn_rate: 5000, founder_burnout: -10 } },
            { text: "Ask for more time — company needs you now", effects: { founder_burnout: 15, founder_health: -10, intelligence: -5 } }
        ]
    },
    {
        event_id: "founder_health_scare",
        stage: "mvp",
        title: "Health Scare 🩺",
        description: "After months of running on 4-hour sleep and caffeine, you collapse during a board call. Doctor says it's exhaustion-induced chest pains and orders 2 weeks of rest.",
        choices: [
            { text: "Follow doctor's orders — full rest", effects: { founder_health: 40, founder_burnout: -40, product_quality: -5, team_morale: -10 } },
            { text: "Take 3 days off then ease back in", effects: { founder_health: 20, founder_burnout: -15 } },
            { text: "Keep working from bed — too much is at stake", effects: { founder_health: -10, founder_burnout: 20, reputation: -5 } }
        ]
    },
    {
        event_id: "family_emergency",
        stage: "mvp",
        title: "Family Emergency 🏠",
        description: "A close family member is hospitalised and you need to travel urgently. The timing is rough — you have an investor meeting next week and quarterly review is due.",
        choices: [
            { text: "Cancel everything and be with family", effects: { founder_health: 10, founder_burnout: -10, reputation: -5 } },
            { text: "Delegate to team and handle remotely", effects: { leadership: 5, team_morale: 5, founder_burnout: 5 } },
            { text: "Push through — reschedule family trip", effects: { founder_burnout: 15, founder_health: -5, technical_skill: -3 } }
        ]
    },
    {
        event_id: "founder_therapy",
        stage: "early_startup",
        title: "Founder Therapy 🧠",
        description: "A mentor suggests you start seeing a therapist. Silicon Valley therapists specialising in founder burnout charge $300/session. Studies show top performers who invest in mental health outperform those who don't.",
        choices: [
            { text: "Start bi-weekly sessions ($600/mo)", effects: { cash: -600, founder_burnout: -8, intelligence: 5, leadership: 5 } },
            { text: "Try a founder coaching group ($200/mo)", effects: { cash: -200, networking: 10, founder_burnout: -4 } },
            { text: "Handle it yourself — you're fine", effects: { founder_burnout: 5 } }
        ]
    },
    {
        event_id: "sleep_deprivation",
        stage: "early_startup",
        title: "Sleep Deprivation Crunch ⏰",
        description: "You've been averaging 4 hours of sleep for 6 weeks straight. Team members say you're irritable in meetings and making inconsistent decisions. You missed a major product bug because of it.",
        choices: [
            { text: "Enforce a strict 8-hour rule starting now", effects: { founder_health: 20, founder_burnout: -15, product_quality: 5, intelligence: 5 } },
            { text: "Power through til the launch", effects: { founder_burnout: 20, founder_health: -15, product_quality: -8, team_morale: -5 } },
            { text: "Hire a deputy to take some load off", effects: { cash: -10000, burn_rate: 4000, founder_burnout: -10 } }
        ]
    },
    {
        event_id: "imposter_syndrome",
        stage: "early_startup",
        title: "Imposter Syndrome 😰",
        description: "You're in a room full of Stanford MBAs and ex-Google engineers. You suddenly feel deeply out of place. A VC asks you a question about unit economics and you blank out.",
        choices: [
            { text: "Be honest about your background — authenticity is rare", effects: { networking: 10, reputation: 5, intelligence: 5 } },
            { text: "Bluff through it and study harder tonight", effects: { technical_skill: 5, intelligence: -3, founder_burnout: 5 } },
            { text: "Excuse yourself — this crowd isn't for you yet", effects: { networking: -10, founder_burnout: -5 } }
        ]
    },

    // ══════════════════════════════════════════
    // B2B SALES PIPELINE & ENTERPRISE
    // ══════════════════════════════════════════
    {
        event_id: "enterprise_rfp",
        stage: "growth_stage",
        title: "Enterprise RFP 📋",
        description: "A Fortune 500 company has sent you a 47-page RFP (Request for Proposal). They want SSO, SOC2, custom SLAs, and 99.99% uptime — things you don't have yet. Potential deal: $240K/yr.",
        choices: [
            { text: "Respond and promise to build the features", effects: { cash: 20000, product_quality: -5, technical_debt: 15, burn_rate: 3000 } },
            { text: "Respond honestly — offer a phased roadmap", effects: { reputation: 10, networking: 5, cash: 5000 } },
            { text: "Pass — too much distraction from core product", effects: { product_quality: 5 } }
        ]
    },
    {
        event_id: "enterprise_pilot_success",
        stage: "growth_stage",
        title: "Enterprise Pilot Converts 🤝",
        description: "The 3-month pilot with TechCorp ($30K) just concluded. Their VP of Engineering says the product exceeded expectations. They want to discuss a $200K annual contract.",
        choices: [
            { text: "Push for $250K — you have leverage now", effects: { cash: 25000, reputation: 10, networking: 5 } },
            { text: "Accept $200K quickly — lock it in", effects: { cash: 200000, brand_awareness: 10 } },
            { text: "Ask for a referral to 3 other enterprises", effects: { networking: 20, cash: 15000, reputation: 5 } }
        ]
    },
    {
        event_id: "enterprise_churn",
        stage: "growth_stage",
        title: "Enterprise Customer Churns ⚠️",
        description: "Your biggest customer ($15K MRR) has notified you of non-renewal. The reason: a competitor launched a feature you've had on the backlog for 8 months. Their migration starts in 30 days.",
        choices: [
            { text: "Emergency feature sprint to win them back", effects: { product_quality: 10, technical_debt: 20, burn_rate: 5000, team_morale: -10 } },
            { text: "Negotiate a discount to retain them ($10K MRR)", effects: { cash: -5000, reputation: 5 } },
            { text: "Accept the loss — focus on replacing the revenue", effects: { team_morale: -15, brand_awareness: -5, product_quality: 5 } }
        ]
    },
    {
        event_id: "sales_team_miss",
        stage: "growth_stage",
        title: "Sales Team Misses Quota ❌",
        description: "Q3 sales target was $200K. Actual closed: $82K. Your Head of Sales blames the product — no enterprise features, slow onboarding. Product team says sales promised features that don't exist.",
        choices: [
            { text: "Hold a joint post-mortem and fix the process", effects: { team_morale: 5, product_quality: 5, intelligence: 5 } },
            { text: "Put pressure on sales — fire the bottom performer", effects: { team_morale: -20, cash: 5000, reputation: -5 } },
            { text: "Invest in sales enablement (playbooks, tools)", effects: { cash: -5000, team_morale: 10, brand_awareness: 5 } }
        ]
    },
    {
        event_id: "channel_partnership",
        stage: "growth_stage",
        title: "Channel Partnership Offer 🤝",
        description: "A larger company in an adjacent space wants to resell your product to their 50K customer base for a 25% revenue share. This could 5x your distribution overnight.",
        choices: [
            { text: "Accept — distribution at this scale is rare", effects: { users: 500, brand_awareness: 20, cash: 10000, networking: 10 } },
            { text: "Negotiate — counter with 15% share", effects: { users: 200, cash: 15000, networking: 5, reputation: 5 } },
            { text: "Decline — maintain direct control", effects: { product_quality: 3 } }
        ]
    },

    // ══════════════════════════════════════════
    // BOARD PRESSURE & INVESTOR RELATIONS
    // ══════════════════════════════════════════
    {
        event_id: "board_ceo_pressure",
        stage: "growth_stage",
        title: "Board Pressure: CEO Succession 🪑",
        description: "Two of your board members have privately suggested bringing in an 'experienced CEO' to scale the company. They think you're great as a product visionary but question your ability to run a 50-person company.",
        choices: [
            { text: "Push back firmly — this is your company", effects: { leadership: -5, reputation: 5, networking: -10 } },
            { text: "Hire a COO and demonstrate you can delegate", effects: { cash: -20000, burn_rate: 8000, leadership: 10, reputation: 5 } },
            { text: "Agree to a structured CEO transition plan", effects: { networking: 10, team_morale: -10, reputation: 5 } }
        ]
    },
    {
        event_id: "board_expansion",
        stage: "growth_stage",
        title: "Board Seat Demand 📊",
        description: "Your lead investor is insisting on adding two new board seats (their nominees) before releasing the next tranche. This would give investors majority board control.",
        choices: [
            { text: "Accept — you need the capital", effects: { cash: 50000, networking: 10, leadership: -5 } },
            { text: "Negotiate for observer seats only", effects: { reputation: 10, networking: 5, cash: 20000 } },
            { text: "Refuse — seek alternative funding", effects: { cash: -20000, reputation: 5, networking: -10 } }
        ]
    },
    {
        event_id: "investor_update_ghosted",
        stage: "mvp",
        title: "Investor Stops Responding 📵",
        description: "You've sent 3 monthly investor updates and gotten zero replies. When you call, it goes to voicemail. Then you read on Twitter they 'passed' on similar companies at your stage.",
        choices: [
            { text: "Send one final direct email — ask for honest feedback", effects: { networking: 5, intelligence: 5 } },
            { text: "Move on — find new investors", effects: { networking: -5, reputation: 3 } },
            { text: "Show up at their next portfolio event", effects: { networking: 15, reputation: -5, risk_appetite: 10 } }
        ]
    },
    {
        event_id: "down_round_pressure",
        stage: "growth_stage",
        title: "Down Round Pressure 📉",
        description: "With 3 months runway left and no term sheets, your existing investors are offering a bridge at a 40% lower valuation than your last round. Pride vs survival.",
        choices: [
            { text: "Accept the down round — survival matters", effects: { cash: 200000, reputation: -15, networking: 5 } },
            { text: "Negotiate a flat round with warrants", effects: { cash: 100000, reputation: -5, networking: 5 } },
            { text: "Aggressively cut costs to extend runway", effects: { cash: 30000, team_morale: -25, burn_rate: -5000 } }
        ]
    },

    // ══════════════════════════════════════════
    // LEGAL & COMPLIANCE
    // ══════════════════════════════════════════
    {
        event_id: "gdpr_audit",
        stage: "growth_stage",
        title: "GDPR Audit Notice 📧",
        description: "You've received a formal GDPR compliance audit notice from EU regulators. You have 60 days to demonstrate data handling practices. Legal fees + engineering time: estimated $25K.",
        choices: [
            { text: "Hire a DPO and comply fully ($25K)", effects: { cash: -25000, reputation: 10, brand_awareness: 5 } },
            { text: "Patch the biggest gaps now ($10K)", effects: { cash: -10000, reputation: 0, risk_appetite: -5 } },
            { text: "Ignore temporarily — low enforcement risk", effects: { reputation: -15, risk_appetite: 10, cash: 5000 } }
        ]
    },
    {
        event_id: "ip_lawsuit",
        stage: "growth_stage",
        title: "IP Infringement Lawsuit ⚖️",
        description: "A patent troll has filed a cease & desist claiming your core algorithm infringes on Patent #US9,123,456. Their lawyer demands $500K or licensing fees of $50K/year.",
        choices: [
            { text: "Fight it — hire IP attorneys ($30K retainer)", effects: { cash: -30000, reputation: 5, risk_appetite: 10 } },
            { text: "Settle for $50K/yr licensing", effects: { cash: -50000, burn_rate: 4167, reputation: -5 } },
            { text: "Redesign around the patent (engineering sprint)", effects: { technical_debt: 15, product_quality: -5, cash: -10000 } }
        ]
    },
    {
        event_id: "data_breach",
        stage: "mvp",
        title: "Security Breach 🔓",
        description: "A penetration tester (hired by a customer) found a SQL injection vulnerability. It's not exploited yet, but your entire user database is readable. You must disclose or fix quietly.",
        choices: [
            { text: "Disclose publicly, thank the researcher, fix it", effects: { reputation: 10, brand_awareness: -5, technical_debt: -10, product_quality: 5 } },
            { text: "Fix quietly over the weekend, no public notice", effects: { reputation: -10, technical_debt: -10 } },
            { text: "Blame it on a third-party service integration", effects: { reputation: -20, brand_awareness: -10, team_morale: -5 } }
        ]
    },
    {
        event_id: "employment_lawyer",
        stage: "mvp",
        title: "Employment Dispute 📄",
        description: "A former employee is suing you for wrongful termination, claiming their firing was retaliatory after they raised a workplace concern. They're asking for 3 months severance + legal costs.",
        choices: [
            { text: "Settle quickly ($15K) to avoid distraction", effects: { cash: -15000, reputation: 5, team_morale: 5 } },
            { text: "Fight it — have your legal team respond", effects: { cash: -25000, reputation: -5, team_morale: -10 } },
            { text: "Settle with NDA and improved HR policies", effects: { cash: -10000, brand_awareness: 5, culture_score: 10 } }
        ]
    },
    {
        event_id: "soc2_requirement",
        stage: "growth_stage",
        title: "SOC2 Compliance Required 🔒",
        description: "Three of your largest enterprise prospects have made SOC2 Type II certification a dealbreaker. The audit process takes 6 months and costs $30K. But it could unlock $500K+ in ARR.",
        choices: [
            { text: "Start SOC2 immediately — the ROI is obvious", effects: { cash: -30000, reputation: 15, technical_debt: -10, brand_awareness: 10 } },
            { text: "Start with SOC2 Type I first ($15K, faster)", effects: { cash: -15000, reputation: 8, brand_awareness: 5 } },
            { text: "Deprioritize — focus on product first", effects: { product_quality: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // CXO DEPARTURES & TEAM DISRUPTION
    // ══════════════════════════════════════════
    {
        event_id: "cto_departure",
        stage: "growth_stage",
        title: "CTO Resigns 😮",
        description: "Your CTO — who built the core architecture — has accepted an offer from a Series C-funded company at 3× their current salary. They're offering 2 weeks notice but own 8% of engineering knowledge.",
        choices: [
            { text: "Counter-offer: 2× salary + 2% more equity", effects: { cash: -30000, burn_rate: 5000, technical_debt: -5 } },
            { text: "Accept and launch emergency hiring", effects: { technical_debt: 25, product_quality: -15, team_morale: -10, cash: -10000 } },
            { text: "Ask them to stay for 90 days + knowledge transfer", effects: { technical_debt: 10, product_quality: -5, cash: -5000 } }
        ]
    },
    {
        event_id: "cmo_failure",
        stage: "growth_stage",
        title: "CMO Underperforming 📉",
        description: "6 months in, your CMO has spent $80K on campaigns delivering minimal results. CAC is 4× your target. The team has lost confidence in marketing leadership.",
        choices: [
            { text: "Fire the CMO and hire a performance marketer", effects: { cash: -20000, burn_rate: -3000, team_morale: -5, brand_awareness: 5 } },
            { text: "Give 90-day PIP with clear metrics", effects: { team_morale: -5, brand_awareness: 5 } },
            { text: "Bring in a fractional CMO instead", effects: { cash: -5000, burn_rate: -2000, brand_awareness: 10 } }
        ]
    },
    {
        event_id: "cofounder_burnout_leave",
        stage: "mvp",
        title: "Co-Founder Takes Leave 😔",
        description: "Your technical co-founder has been showing signs of severe burnout for months. They've now asked for a 2-month unpaid sabbatical. The timing is terrible — you're 4 weeks from launch.",
        choices: [
            { text: "Grant the leave — they've earned it", effects: { team_morale: 10, technical_debt: 15, product_quality: -10, founder_burnout: 10 } },
            { text: "Ask them to delay by 6 weeks", effects: { team_morale: -5, founder_burnout: 15, product_quality: -3 } },
            { text: "Bring in a contractor for the gap ($15K)", effects: { cash: -15000, technical_debt: 5, product_quality: -3 } }
        ]
    },

    // ══════════════════════════════════════════
    // MARKET & COMPETITIVE THREATS
    // ══════════════════════════════════════════
    {
        event_id: "well_funded_competitor",
        stage: "growth_stage",
        title: "Competitor Raises $20M 💣",
        description: "Your direct competitor just closed a $20M Series A. Their job board shows 30 open roles. A VC tweets: 'This space just got serious.' Your investor calls asking for a plan.",
        choices: [
            { text: "Stay focused — execution beats fundraising", effects: { product_quality: 5, team_morale: 5 } },
            { text: "Accelerate fundraising now", effects: { cash: 50000, networking: 10, founder_burnout: 10 } },
            { text: "Find your defensible niche — go deeper, not broader", effects: { product_quality: 10, brand_awareness: 5, users: -30 } }
        ]
    },
    {
        event_id: "product_copycat",
        stage: "mvp",
        title: "Someone Cloned Your Product 😡",
        description: "A team in India has shipped an identical product at 1/5th your pricing. They have fewer features but their $5/mo vs your $49/mo is already attracting your price-sensitive users.",
        choices: [
            { text: "Launch a startup-plan at $9/mo", effects: { cash: -5000, users: 100, brand_awareness: 5, revenue: -500 } },
            { text: "Double down on premium features and brand", effects: { product_quality: 10, brand_awareness: 10, technical_debt: 5 } },
            { text: "Name them publicly — let the community know", effects: { brand_awareness: 15, reputation: -5, networking: 5 } }
        ]
    },
    {
        event_id: "big_tech_entry",
        stage: "growth_stage",
        title: "Google Enters Your Market 😰",
        description: "At Google I/O, they demoed a free tool that does 60% of what you charge $99/mo for. Your Slack DMs are flooded with 'What are you going to do?' Your churn spikes 15% overnight.",
        choices: [
            { text: "Lean into trust, compliance, and support — Google can't", effects: { reputation: 15, brand_awareness: 10, users: -50 } },
            { text: "Pivot to the enterprise tier immediately", effects: { product_quality: -10, technical_debt: 20, cash: -15000, users: -30 } },
            { text: "Write a viral thread: 'Why this is actually good for us's", effects: { brand_awareness: 20, reputation: 5, networking: 10 } }
        ]
    },
    {
        event_id: "acquihire_approach",
        stage: "growth_stage",
        title: "Acqui-Hire Offer 💼",
        description: "A $2B company approaches you not for your product, but for your engineering team. They're offering $3M split across the team ($1M upfront, $2M over 2 years). No product continuity.",
        choices: [
            { text: "Entertain it — negotiate harder", effects: { networking: 15, reputation: 5, team_morale: -10 } },
            { text: "Decline — you believe in this product", effects: { team_morale: 10, reputation: 5, risk_appetite: -5 } },
            { text: "Tell the team — let them vote", effects: { team_morale: -5, intelligence: 5, leadership: 5 } }
        ]
    },

    // ══════════════════════════════════════════
    // PRODUCT MILESTONES & POSITIVE EVENTS
    // ══════════════════════════════════════════
    {
        event_id: "product_hunt_launch",
        stage: "mvp",
        title: "Product Hunt Launch 🚀",
        description: "Your product just hit #1 on Product Hunt with 1,200 upvotes. You're getting 500 sign-ups per hour and your servers are straining. The next 24 hours could define your brand.",
        choices: [
            { text: "Go live directly — absorb the traffic", effects: { users: 800, brand_awareness: 20, reliability: -10, product_quality: -3 } },
            { text: "Enable a waitlist and onboard in batches", effects: { users: 400, brand_awareness: 15, product_quality: 5 } },
            { text: "Post a live update thread on Twitter as it unfolds", effects: { users: 600, brand_awareness: 25, networking: 15 } }
        ]
    },
    {
        event_id: "app_store_feature",
        stage: "mvp",
        title: "App Store Featured! 🌟",
        description: "Apple's editorial team has reached out to feature your app in 'Apps We Love' across 40 countries this weekend. You have 48 hours to submit screenshots and fix any review issues.",
        choices: [
            { text: "Polish everything and submit", effects: { users: 1000, brand_awareness: 30, product_quality: 5 } },
            { text: "Submit as-is — don't over-optimize", effects: { users: 600, brand_awareness: 20 } },
            { text: "Decline — product isn't ready", effects: { brand_awareness: 5, product_quality: 5 } }
        ]
    },
    {
        event_id: "top_startup_list",
        stage: "growth_stage",
        title: "Forbes Top 50 Startups 🏆",
        description: "Forbes just included you in their '50 Startups to Watch' list alongside names like Notion and Linear. Inbound investor interest has tripled overnight.",
        choices: [
            { text: "Write a founder perspective article riding the wave", effects: { brand_awareness: 20, networking: 15, reputation: 15 } },
            { text: "Use it to accelerate your current raise", effects: { cash: 50000, networking: 20, founder_burnout: 5 } },
            { text: "Stay heads down — don't let it distract the team", effects: { product_quality: 5, team_morale: 10 } }
        ]
    },
    {
        event_id: "strategic_partnership",
        stage: "growth_stage",
        title: "Strategic Partnership Offer 🤝",
        description: "A publicly traded company wants a strategic partnership — deep API integration, co-marketing, and a $500K investment in exchange for 5% equity and preferred data access rights.",
        choices: [
            { text: "Accept — the cash, distribution, and validation are worth it", effects: { cash: 500000, brand_awareness: 25, networking: 20 } },
            { text: "Negotiate better terms (3% equity, no data exclusivity)", effects: { cash: 300000, brand_awareness: 15, reputation: 10 } },
            { text: "Decline — data moat is your core asset", effects: { product_quality: 5, reputation: 5 } }
        ]
    },
    {
        event_id: "nps_breakout",
        stage: "growth_stage",
        title: "NPS Score Hits 72 🎯",
        description: "Industry average NPS is 31. Your latest survey shows 72 — exceptionally high. 3 users even emailed saying your product changed their workflow. This is a rare moment of validation.",
        choices: [
            { text: "Turn promoters into case studies and references", effects: { brand_awareness: 20, reputation: 15, networking: 10 } },
            { text: "Interview top users to drive the next feature set", effects: { product_quality: 15, intelligence: 5 } },
            { text: "Share the score publicly + run a referral campaign", effects: { users: 200, brand_awareness: 15 } }
        ]
    },

    // ══════════════════════════════════════════
    // FUNDRAISING & FINANCIAL STRESS
    // ══════════════════════════════════════════
    {
        event_id: "term_sheet_competition",
        stage: "growth_stage",
        title: "Competing Term Sheets 💫",
        description: "You have two term sheets on the table. Sequoia offers $5M at $20M post but wants a board seat. Tiger Global offers $5M at $25M post with no board seat but strict anti-dilution clauses.",
        choices: [
            { text: "Take Sequoia — the brand and advice is worth it", effects: { cash: 500000, networking: 30, reputation: 20 } },
            { text: "Take Tiger — higher valuation, more founder control", effects: { cash: 500000, reputation: 10, networking: 10 } },
            { text: "Use both term sheets to negotiate a third investor", effects: { cash: 600000, networking: 15, founder_burnout: 10 } }
        ]
    },
    {
        event_id: "payroll_crisis",
        stage: "mvp",
        title: "Payroll Emergency 💸",
        description: "It's the 28th. Payroll is due on the 1st. Due to delayed payments from two enterprise customers, you're $40K short. You have 72 hours to find a solution.",
        choices: [
            { text: "Take a personal loan to cover payroll", effects: { cash: 40000, founder_burnout: 20, founder_health: -5 } },
            { text: "Negotiate with employees for 2-week delay (with interest)", effects: { team_morale: -25, cash: 2000 } },
            { text: "Emergency revenue push — call every prospect", effects: { cash: 20000, founder_burnout: 15 } }
        ]
    },
    {
        event_id: "runway_crisis",
        stage: "mvp",
        title: "2 Months Runway Remaining 🚨",
        description: "Your CFO's monthly report shows 2 months of cash left. No term sheets. Your best prospect is still in 'legal review'. The board asks for your plan in 48 hours.",
        choices: [
            { text: "Emergency layoffs — reduce burn by 40%", effects: { cash: 30000, team_morale: -30, burn_rate: -8000, employees: -2 } },
            { text: "Founders take no salary for 3 months", effects: { cash: 15000, team_morale: 10, founder_burnout: 15 } },
            { text: "Go all-in on closing the best prospect this week", effects: { cash: 50000, founder_burnout: 20, networking: 10 } }
        ]
    },
    {
        event_id: "revenue_milestone",
        stage: "growth_stage",
        title: "$1M ARR Milestone 🎉",
        description: "You just crossed $1M ARR. The team is ecstatic. A major VC tweets congratulations. This is the moment you've been building toward for 18+ months.",
        choices: [
            { text: "Celebrate with the team — throw a dinner", effects: { team_morale: 30, cash: -3000, reputation: 5 } },
            { text: "Announce it publicly — ride the momentum", effects: { brand_awareness: 25, networking: 15, reputation: 20 } },
            { text: "Set a private $5M ARR goal immediately", effects: { team_morale: 10, founder_burnout: 5, product_quality: 5 } }
        ]
    },
    {
        event_id: "major_server_meltdown",
        stage: "growth_stage",
        title: "Total Infrastructure Meltdown 💀",
        description: "Your primary database cluster has corrupted due to a rare race condition. Backups are 24 hours old. Your service is down, and will stay down for at least 48 hours while you reconstruct data.",
        choices: [
            { text: "Recover from 24h old backups — lose some data", effects: { users: -500, product_quality: -15, reputation: -20, team_morale: -10 } },
            { text: "Attempt manual reconstruction (expensive expert help)", effects: { cash: -45000, product_quality: -5, team_morale: -20, technical_debt: 20 } },
            { text: "Full transparency: refund everyone for the month", effects: { cash: -100000, reputation: 25, brand_awareness: 5 } }
        ]
    },
    {
        event_id: "platform_ban_hammer",
        stage: "growth_stage",
        title: "The Ban Hammer 🔨",
        description: "A major platform (Google/Apple/AWS) has flagged your account for a Terms of Service violation. They've disabled your API access. You're effectively dead until you clear this up, which could take weeks.",
        choices: [
            { text: "Fly to HQ and demand a meeting ($10K)", effects: { cash: -10000, networking: 25, stress_tolerance: -15, risk_appetite: 15 } },
            { text: "Pivot the tech stack to avoid the platform", effects: { technical_debt: 40, product_quality: -20, cash: -30000, team_morale: -15 } },
            { text: "Lawyer up and sue for anti-competitive behavior", effects: { cash: -60000, reputation: 10, risk_appetite: 20 } }
        ]
    },
    {
        event_id: "toxic_culture_crisis",
        stage: "growth_stage",
        title: "Culture Crisis: The Silent Exit 🚶‍♂️",
        description: "A group of your top performers have been meeting in secret. They feel the company has lost its way and the culture is 'toxic'. 4 key engineers have resigned simultaneously today.",
        choices: [
            { text: "Emergency town hall + retention bonuses ($50K)", effects: { cash: -50000, team_morale: 20, internal_stability: 10 } },
            { text: "Let them go — they were 'wrong for the mission'", effects: { employees: -4, product_quality: -25, team_morale: -30, technical_debt: 35 } },
            { text: "Promote from within and double ownership", effects: { team_morale: 15, product_quality: -10, technical_debt: 10 } }
        ],
    },
    {
        event_id: "compute_shortage",
        scenario: "ai_rush",
        title: "GPU Shortage 🔌",
        description: "The demand for H100s is insane. Your cloud provider just bumped your compute costs by 300%. Your runway is evaporating.",
        choices: [
            { text: "Pay the premium — innovation is life", effects: { cash: -50000, innovation: 10, burn_rate: 10000 } },
            { text: "Optimize models to run on cheaper hardware", effects: { technical_debt: 20, innovation: -5 } },
            { text: "Pivot to a lightweight 'Edge' AI strategy", effects: { product_quality: -10, burn_rate: -5000, intelligence: 5 } }
        ]
    },
    {
        event_id: "hype_cycle_peak",
        scenario: "ai_rush",
        title: "The Hype Cycle Peaks 📉",
        description: "A major AI lab just released a paper proving your 'proprietary' method is easily replicable. Your valuation is under fire.",
        choices: [
            { text: "Pivot to vertical-specific applications", effects: { innovation: 15, networking: 10 } },
            { text: "Aggressive PR campaign about your 'Moat'", effects: { cash: -20000, brand_awareness: 20, reputation: -10 } },
            { text: "Ignore the paper — focus on user growth", effects: { users: 500, risk_appetite: 15 } }
        ]
    },
    {
        event_id: "server_meltdown",
        scenario: "viral",
        title: "Server Meltdown 💥",
        description: "10,000 users just tried to upload 4K video at once. Your AWS instance is melting. Technical debt is at critical levels.",
        choices: [
            { text: "Shut down the service for 24h to refactor", effects: { users: -2000, technical_debt: -30, reliability: 20 } },
            { text: "Throw money at the problem (Horizontal scaling)", effects: { cash: -15000, burn_rate: 8000 } },
            { text: "Let it crash — users will wait for 'exclusive' access", effects: { brand_awareness: 10, reliability: -40, users: -500 } }
        ]
    },
    {
        event_id: "forced_monetization",
        scenario: "viral",
        title: "Monetize or Die 💰",
        description: "You have 100k free users and zero revenue. Your personal bank account is empty. You need to start charging or shut down.",
        choices: [
            { text: "Launch a $19/mo 'Pro' tier immediately", effects: { revenue: 5000, users: -5000, pmf_score: -10 } },
            { text: "Add aggressive ads to the free version", effects: { revenue: 2000, brand_awareness: -15, team_morale: -5 } },
            { text: "Pitch a 'Save Us' crowdfunding campaign", effects: { cash: 10000, reputation: 10, brand_awareness: 5 } }
        ]
    }
];

export function getRandomEvent(stage: string, seenIds: string[] = [], scenarioId?: string): GameEvent | null {
    // ~70% chance to trigger an event per month
    if (Math.random() > 0.30) return null;

    // Map game phases to event stages
    const mappedStage = (stage || "").toLowerCase();
    
    const validEvents = PREDEFINED_EVENTS.filter(e => {
        // Exclude if already seen and not repeatable
        if (e.event_id && seenIds.includes(e.event_id) && !e.repeatable) return false;

        // If event has a scenario requirement, it must match
        if (e.scenario && e.scenario !== scenarioId) return false;
        
        // If no scenario required, check stage
        if (!e.scenario && e.stage) {
            const eventStage = e.stage.toLowerCase();
            
            // Exact match
            if (eventStage === mappedStage) return true;
            
            // Logical mapping
            if (mappedStage === "idea phase" && eventStage === "mvp") return true;
            if (mappedStage === "early startup" && eventStage === "early_startup") return true;
            if (mappedStage === "traction" && eventStage === "early_startup") return true;
            if (mappedStage === "growth" && eventStage === "growth_stage") return true;
            if (mappedStage === "scaling" && eventStage === "growth_stage") return true;
            
            // Fallbacks for any/wildcard
            if (mappedStage === "any" || eventStage === "any") return true;
            if (eventStage === "early_startup" && (mappedStage === "growth" || mappedStage === "scaling")) return true; // Growth can still have early problems
            
            return false;
        }
        return true;
    });

    if (validEvents.length === 0) return null;

    // Prioritize scenario-specific events if they exist (40% bias)
    const scenarioSpecific = validEvents.filter(e => e.scenario === scenarioId);
    const pool = (scenarioSpecific.length > 0 && Math.random() < 0.4) ? scenarioSpecific : validEvents;

    return pool[Math.floor(Math.random() * pool.length)];
}
