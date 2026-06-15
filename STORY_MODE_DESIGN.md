# Founder Sim: Story Mode Design Document

The "Clone Companies" feature will be elevated into a fully-fledged **Story Mode**. Instead of just playing the sandbox game with a few random popups, players will step into the shoes of iconic founders and navigate a highly curated, narrative-driven timeline. 

The timeline will not just force events on the player; it will offer **branching choices** where the outcome is determined dynamically by the player's real-time stats (Cash, Tech Debt, Team Morale, etc.).

---

## 1. The Story Engine Architecture

We will build a new engine (`src/lib/engine/storyMode.ts`) to handle narratives.

### The Role of the Founder
If a player chooses to hire a CEO (e.g., John Sculley or Eric Schmidt) during a historical event, the player assumes the role of **Chief Product Officer / Chairman**. 
*   **Gameplay Impact:** The player still controls R&D, product launches, and company strategy. However, the AI CEO automatically handles investor relations, providing massive buffs to institutional funding and valuation. The downside? The CEO costs massive monthly cash, and the Board will occasionally override your decisions (e.g., forcing a product cancellation or attempting to fire you) if the CEO's relationship with you deteriorates.

### The Data Model
```typescript
export interface StoryChoice {
    label: string;
    description: string;
    // Dynamic Stat Check: The choice's success depends on the player's current state
    condition?: (startup: Startup) => boolean; 
    conditionFailReason?: string; // e.g., "Requires > 80 Team Morale"
    
    // Outcomes
    onSuccess: (startup: Startup) => Partial<StartupMetrics>;
    onFail?: (startup: Startup) => Partial<StartupMetrics>;
    successText: string;
    failText?: string;
}

export interface StoryEvent {
    id: string;
    title: string;
    description: string;
    trigger: {
        type: "month_reached" | "users_reached" | "valuation_reached";
        value: number;
    };
    choices: StoryChoice[];
}

export interface StoryCampaign {
    id: string;
    companyName: string; // e.g., "Pineapple"
    founderName: string;
    industry: string;
    startingMetrics: Partial<StartupMetrics>;
    winCondition: (startup: Startup) => boolean; // e.g., Reach $1 Trillion valuation
    events: StoryEvent[];
}
```

---

## 2. Campaign: "Pineapple" (Apple Clone)

**Theme:** Hardware innovation, ruthless perfectionism, and boardroom drama.
**Win Condition:** Reach $1 Trillion Valuation and build a closed-ecosystem monopoly.

### The 40+ Event Historical Timeline

This campaign spans over decades of in-game time. Events trigger either by month or by reaching specific milestones.

#### Act I: The Garage & The Rise (Months 1 - 48)
1. **The Garage (M1):** You and Woz craft the Pineapple I. *Choice: Sell calculators to fund it or beg a local store for a pre-order.*
2. **The Faire (M6):** Debuting the Pineapple II. *Stat Check: Requires `product_quality > 60` for massive initial sales.*
3. **The First Angel (M10):** Markkula offers funding. *Choice: Give up 30% equity for early massive cash, or bootstrap and struggle.*
4. **Pineapple DOS (M14):** Developing your first OS. 
5. **The PARC Visit (M20):** You visit a massive tech lab and see a GUI. *Choice: Trade pre-IPO stock to steal the GUI idea (Massive Tech Debt, but unlocks GUI).*
6. **The Pineapple III Failure (M26):** Rushed hardware causes overheating. *Stat Check: If `tech_debt > 50`, the launch flops (-$2M).*
7. **The IPO (M30):** Going public. *Choice: Who gets stock? (Affects Morale vs Cash).*
8. **Co-Founder Crash (M34):** Woz crashes his plane and takes a leave. *Effect: -20 Innovation, -10 Morale.*
9. **The Big Blue Threat (M38):** IBM enters the market. *Choice: Run a defiant ad campaign or ignore them.*
10. **Project Lisa (M42):** You lead a premium, overpriced computer project.
11. **Ousted from Lisa (M46):** The Board moves you to a rag-tag team (The Macintosh team). *Effect: -10 CEO Rep, but unlocks Macintosh project.*

#### Act II: The Fall & The Wilderness (Months 50 - 120)
12. **The "Sugar Water" Pitch (M50):** Recruiting John Sculley as CEO. *Choice: Hire him (Lose founder power) or stay CEO (Harder to get institutional backing).*
13. **The Super Bowl Ad (M58):** *Stat Check: Requires `$5M Cash` and `marketing_skill > 80`. Success: Massive brand awareness.*
14. **The Mac Launch (M60):** *Choice: Price it high (high MRR, low users) or low (loss leader, high users).*
15. **The Slump (M68):** Mac sales drop. Board turns on you.
16. **The Boardroom Coup (M72):** You try to oust Sculley. *Stat Check: Requires `leadership > 90`. Fail: You are fired.*
17. **The Exile (M73):** You are fired. (Simulated time jump or mini-game where you build "NeXT"). *Effect: -50% personal wealth, Pineapple valuation plummets.*
18. **The Dark Days of Pineapple (M80-100):** You watch from afar as Pineapple releases flop after flop (Newton, Copland).

#### Act III: The Return of the King (Months 120 - 180)
19. **The Acquisition (M120):** Pineapple buys your new company and brings you back as an advisor.
20. **The iCEO (M124):** You convince the board to fire the CEO and make you interim CEO. *Effect: You regain control. Pineapple is 90 days from bankruptcy.*
21. **The Microsoft Pact (M126):** *Choice: Accept a $150M bailout from your biggest rival, saving the company but hurting your pride.*
22. **The Product Purge (M130):** You kill 70% of Pineapple's products. *Effect: +20 Morale, -50% OPEX, but -20% MRR instantly.*
23. **"Think Different" (M135):** Rebranding campaign. *Stat Check: Requires `marketing > 80`.*
24. **The iMac (M140):** Candy-colored computers without floppy drives. *Choice: Remove legacy ports. Success: Trendsetter. Fail: Backlash.*
25. **The OS X Transition (M150):** Moving to a Unix base. *Effect: +30 Tech Debt temporarily, but permanent +50 Reliability.*
26. **The Retail Store Risk (M160):** Building physical Pineapple Stores. *Choice: High risk, high upfront cost. Do you build them?*
27. **The iPod (M170):** 1,000 songs in your pocket. *Stat Check: Requires `innovation > 90` to invent the click-wheel.*
28. **The iTunes Store (M180):** Convincing record labels to sell songs for 99 cents. *Choice: Hard negotiation. Requires `sales_skill > 80`.*

#### Act IV: The Ecosystem Monopoly (Months 190+)
29. **The Health Scare (M190):** You are diagnosed with a rare illness. *Effect: -50 Founder Health. You must manage medical leaves.*
30. **The Intel Switch (M200):** Changing chip architectures. *Effect: Temporary hit to feature output, long-term massive speed boost.*
31. **The iPhone Project (M210):** A phone, an iPod, an internet communicator. *Choice: Partner with a carrier or demand total control of the hardware design.*
32. **The Keynote (M220):** Faking the iPhone demo on stage. *Stat Check: `tech_skill > 90`.*
33. **The App Store (M230):** Opening the ecosystem to third-party devs. *Choice: Take a 30% cut. Enrages devs but generates massive MRR.*
34. **Antennagate (M240):** "You're holding it wrong." *Choice: Give out free cases (Cash hit) or double down (Reputation hit).*
35. **The iPad Launch (M250):** Creating the tablet market.
36. **The Foxconn Scandal (M260):** Supply chain labor issues leak to the press. *Choice: PR Spin vs Supply Chain Audit.*
37. **The Succession Plan (M270):** Appointing Tim Cook (Supply Chain Genius). *Effect: +100% Efficiency, but Innovation locks permanently.*
38. **The Final Keynote (M280):** Your health deteriorates to 0. You step down.
39. **The Trillion Dollar March (M300):** As Chairman, you guide the company to $1T.
40. **Legacy Secured (M310):** The story campaign ends. Your score is uploaded to the Leaderboard.

---

## 3. Campaign 2: "BookFace" (Facebook Clone)

**Theme:** Viral growth, privacy scandals, and aggressive acquisitions.
**Win Condition:** Reach 3 Billion Active Users and rebrand the company to build the "MetaVerse".

### The 40+ Event Historical Timeline

#### Act I: The Dorm Room & The Valley (Months 1 - 40)
1. **FaceSmash (M1):** You build a hot-or-not site in college. *Check: Tech Skill. Success: Server crashes from traffic.*
2. **The Winklevoss Threat (M4):** Two wealthy twins claim you stole the idea. *Choice: Settle early or string them along.*
3. **The Launch (M6):** BookFace goes live at your university.
4. **Eduardo's Seed (M8):** Your co-founder invests $15,000 for server costs. *Effect: Eduardo owns 30%.*
5. **Ivy League Expansion (M10):** Opening to other schools. *Effect: Exponential user growth.*
6. **Moving to the Valley (M12):** You rent a house in Palo Alto. *Choice: Keep Eduardo as CFO or ice him out.*
7. **Enter Sean Parker (M14):** The charismatic founder of a music-sharing app joins you. *Effect: +Brand Awareness, -Board Trust.*
8. **"Drop the The" (M16):** Sean advises rebranding to just "BookFace".
9. **Peter Thiel's Angel Check (M18):** $500k investment. *Effect: You finally have runway.*
10. **The Wire Transfer Sabotage (M20):** Eduardo freezes the bank accounts. *Effect: -$500k cash, +Emergency.*
11. **Diluting Eduardo (M24):** You restructure the company, reducing his stake from 30% to 0.3%. *Effect: Massive lawsuit triggers.*
12. **High School Expansion (M28):** Opening the network to teens. 
13. **Photo Tagging (M30):** Building a viral loop. *Stat Check: Requires `innovation > 60`.*
14. **Yahoo's $1 Billion Offer (M36):** *Choice: Sell (Game Over, you are rich) or Reject (Team morale drops as they wanted the payout).*
15. **The News Feed (M40):** A live stream of everyone's actions. *Choice: Launch it. Users revolt, but engagement actually skyrockets.*

#### Act II: The Social Monopoly (Months 41 - 100)
16. **Platform API (M45):** Letting third-party devs build apps on your site.
17. **Microsoft Investment (M50):** Microsoft buys 1.6% for $240M, giving you a $15B valuation.
18. **The "Adult Supervision" (M55):** Hiring Sheryl Sandberg as COO. *Effect: Ad revenue (MRR) becomes insanely optimized. +100% Cash Flow.*
19. **The 'Like' Button (M60):** Inventing the digital currency of validation.
20. **FarmVille Craze (M65):** A virtual farming game takes over the site. *Effect: Massive server costs, massive revenue.*
21. **The Movie (M70):** A Hollywood movie is made about your ruthless founding story. *Effect: -20 CEO Reputation.*
22. **The Arab Spring (M80):** Your platform is used to topple governments. *Effect: Unprecedented global scale.*
23. **The $50B Private Valuation (M85):** Secondary markets go crazy for your stock.
24. **Acquiring PhotoGram (M90):** A photo app has 30M users and 13 employees. *Choice: Buy them for $1 Billion. (Requires $1B cash, eliminates biggest threat).*
25. **The Disastrous IPO (M95):** NASDAQ glitches on your opening day. Stock drops. *Effect: Morale plummets.*
26. **The Mobile Pivot (M100):** You realize desktop is dying. You force the whole company to code for mobile. *Stat Check: Requires `tech_debt < 40`.*

#### Act III: The Scandals & The MetaVerse (Months 101+)
27. **Acquiring WhatChat (M110):** The biggest messaging app. *Choice: Spend $19 Billion.*
28. **Acquiring VR Goggles (M115):** Spending $2 Billion on virtual reality.
29. **Live Video (M120):** Launching BookFace Live.
30. **The Algorithm Tweaks (M125):** Prioritizing "meaningful social interactions."
31. **Fake News Crisis (M130):** Foreign actors manipulate your platform during an election. *Effect: Brand Awareness becomes toxic.*
32. **Cambridge Analytica Leak (M140):** Data privacy scandal explodes. *Effect: -$5B in fines, massive user trust drop.*
33. **Congressional Hearings (M145):** You testify. *Choice: Drink water awkwardly or deflect like a robot.*
34. **The Ad Boycott (M150):** Major brands pull spend. *Effect: -30% MRR.*
35. **Cloning TicTac (M160):** A Chinese short-video app is winning. You launch "Reels" to copy them.
36. **Whistleblower Leaks (M170):** Internal documents prove you knew the platform was harmful.
37. **The Privacy Update (M180):** Pineapple (Apple) blocks your ad tracking. *Effect: You instantly lose $10B in annual revenue.*
38. **The Pivot to VR (M190):** You decide social media is over. You want to build the virtual universe.
39. **The "MetaVerse" Rebrand (M200):** You change the company name. *Effect: -50% Valuation temporarily as investors panic.*
40. **3 Billion Users (M220):** You connect half the planet. You win.

---

## 4. Campaign 3: "SearchGo" (Google Clone)

**Theme:** Algorithmic dominance, infinite money glitch, and "Don't Be Evil".
**Win Condition:** Achieve a monopoly in Search, Mobile, and Video, while reaching a $1.5 Trillion valuation.

### The 40+ Event Historical Timeline

#### Act I: The Stanford Algorithm (Months 1 - 60)
1. **BackRub (M1):** You build a search engine on university servers that ranks by backlinks.
2. **The Garage (M6):** You rent a garage from Susan Wojcicki.
3. **The First Check (M12):** Andy Bechtolsheim writes a $100k check to a company that isn't even incorporated yet.
4. **Burning Servers (M18):** Your search engine is too popular. *Effect: Tech Debt explodes, cash bleeds.*
5. **The Excite Pitch (M24):** You try to sell the company to a portal for $1M. They reject you. *Choice: Keep offering it lower, or walk away.*
6. **The VC Bidding War (M30):** Sequoia and Kleiner Perkins both want in. *Choice: Force them to co-invest (Unprecedented leverage).*
7. **The Revenue Problem (M36):** You have massive traffic but $0 revenue.
8. **AdWords Launched (M40):** You invent text-based, auction-driven ads alongside search results. *Effect: The greatest money-printer in history is born. +1000% MRR.*
9. **"Don't Be Evil" (M45):** You draft a moral manifesto.
10. **The Adult Supervision (M50):** VCs force you to hire Eric Schmidt as CEO. *Effect: You become President of Products. Board happiness maxes out.*
11. **Yahoo Rivalry (M60):** Yahoo realizes you are eating their lunch and drops your engine.

#### Act II: The Empire Expansion (Months 61 - 150)
12. **Gmail on April Fools (M70):** You launch an email service with 1GB storage (100x the competition). People think it's a joke.
13. **The Dutch Auction IPO (M75):** You refuse Wall Street's pricing model. *Choice: Use a Dutch Auction (Alienates bankers, but democratizes shares).*
14. **Acquiring Keyhole (M85):** You buy a satellite mapping company. Unlocks SearchGo Maps.
15. **The TubeVideo Acquisition (M100):** You buy a video site for $1.65B. *Choice: They are bleeding cash and facing copyright lawsuits. Do you take the risk?*
16. **Acquiring GreenRobot (M110):** You buy a tiny mobile OS startup to preempt Pineapple's phone.
17. **Chrome Browser (M120):** You build your own browser to protect search traffic.
18. **The China Dilemma (M130):** The government demands censorship. *Choice: Comply (Keep market share) or pull out (Stand by "Don't Be Evil").*
19. **GreenRobot Launched (M140):** Your open-source mobile OS hits the market. *Effect: Pineapple's CEO declares thermonuclear war on you.*
20. **Self-Driving Cars (M150):** You start spending billions on moonshots.

#### Act III: The AI Wars & Alphabet (Months 151+)
21. **Larry Returns (M160):** Eric Schmidt steps down. You return as CEO.
22. **SearchGo Plus (M170):** You try to force a social network into every product to fight BookFace. *Effect: Massive failure. -Brand Awareness.*
23. **Acquiring DeepMind (M180):** You buy an AI lab in London.
24. **The EU Fines (M190):** Europe fines you $5 Billion for antitrust. *Effect: You barely notice.*
25. **The Alphabet Rebrand (M200):** You restructure the massive conglomerate into a holding company. You become CEO of Alphabet.
26. **The Employee Walkouts (M210):** Employees protest military contracts. *Choice: Cancel the contract (Lose MRR) or ignore them (Lose Morale and top engineers).*
27. **Sundar Pichai Takes Over (M220):** You step away from day-to-day operations.
28. **The Pandemic Surge (M230):** Tech usage skyrockets.
29. **The ChatGPT Threat (M240):** A startup launches a chat AI that threatens search. *Effect: Code Red declared. Panic in the company.*
30. **Launching Gemini/Bard (M250):** Rushing your AI to market. *Choice: Stat Check on Tech Quality.*
31. - 40. **The AI Arms Race (M251-300):** Continuous battles for AI supremacy, requiring massive CapEx data center investments to reach a $1.5T valuation.

---

## Gameplay Integration

1. **New UI Flow:** In the "New Game" menu, a shiny new "Story Mode" tab will appear alongside "Sandbox Mode". 
2. **The Story Modal:** When a Story Event triggers, it will interrupt the game loop with a full-screen modal featuring lore-rich text, images (e.g., a pixel-art garage, or a keynote stage), and the branching choices.
3. **Stat Transparency:** The choices will clearly show the stat requirements (e.g., 🔒 *Requires Tech Debt < 40%*) so the player knows their sandbox management directly impacts the narrative.

> [!IMPORTANT]
> How does this revised, dynamic narrative engine feel? This makes Story Mode a completely distinct, immersive experience where the player's sandbox stats dictate their success in recreating history.
