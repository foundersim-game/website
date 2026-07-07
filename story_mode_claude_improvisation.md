# Founder Sim — Story Mode Enhancement Specification

**Purpose:** This document outlines proposed additions to the existing Story Engine (`src/lib/story/engine.ts`) to increase player engagement, retention, replayability, and revenue — without disrupting the core architecture already in place.

**Audience:** Antigravity IDE / development handoff
**Status:** Proposal for review and prioritization
**Existing system reference:** Story Engine v1 (processStoryMonth, checkStoryEvents, applyStoryChoice, win/loss conditions, mini-games, Boardroom system)

---

## 1. Guiding Principles

Before the specific features, three principles should guide every addition below:

1. **Reuse before you build.** Every feature here is designed to extend existing systems (event engine, narrative flags, mutations, mini-games) rather than introduce entirely new architecture. This keeps engineering cost low and risk of breaking the sandbox-story isolation minimal.
2. **Emotional peaks drive revenue.** Monetisation should be placed at moments of highest emotional stakes — right after a failure, right before a high-stakes mini-game, right when a player discovers something rare. Placing paywalls at low-stakes moments converts poorly.
3. **Make invisible systems visible.** Several backend systems already exist (narrative flags, culture archetypes, loyalty scores) but are not surfaced to the player. Surfacing them costs little engineering effort and adds significant perceived depth.

---

## 2. Feature 1 — Failure Epilogues + "Rewind One Decision"

### Why
Currently, loss conditions (cash = 0, burnout = 100%, health < 5%) likely end the campaign with a standard game-over screen. This is the single highest-emotion moment in the game and is currently under-utilized both narratively and commercially.

### What To Build

**A. Dramatized Alternate-History Epilogues**
- On loss, instead of a generic "Game Over," generate a short narrative epilogue card specific to the story, act, and cause of failure.
- Example (Pineapple story, fired without Sculley loyalty): *"Without an ally on the board, you were pushed out in 1985. The company you built went on to nearly collapse before a surprise return a decade later — but that's a different story."*
- Each story needs 3-5 epilogue variants mapped to: (a) which Act the failure occurred in, (b) which failure type (cash/burnout/health), (c) key narrative flags active at time of failure.
- These should be visually treated as a "shareable" card (styled screenshot-friendly) to encourage organic social sharing.

**B. Rewind One Decision (monetisation hook)**
- On the failure screen, before showing the epilogue, offer: *"Rewind your last decision?"*
- Mechanic: reverts the StoryMetricDelta and narrative flag changes from the single most recent `applyStoryChoice` call, returning the player to the event modal to choose again.
- Access: one free rewind per campaign via rewarded video ad. Additional rewinds within the same campaign via IAP (e.g., ₹49/$0.59 "Second Chance" pack of 3).
- Engineering note: this requires storing the pre-choice Snapshot temporarily (last state only, not full history) so it can be restored on rewind. Should be a lightweight addition to `applyStoryChoice`.

### Engineering Scope
- New: epilogue content data (text only, per story/act/failure-type)
- New: single-state rollback capability in the choice engine
- New: rewarded ad + IAP hook on failure screen
- Reuses: existing loss detection, existing choice/mutation system

---

## 3. Feature 2 — Timeline Archive (Scrapbook System)

### Why
Narrative flags (e.g., `hired_sculley: true`) already exist and drive branching, but are invisible to the player. Players have no way to see how much content they've discovered or missed, which limits the completionist replay driver that this system is naturally suited for.

### What To Build
- A per-story "Timeline Archive" screen accessible from the story's main menu.
- Displays all discoverable narrative flags/branches as locked ("???") or unlocked (with title + short description) cards, organized chronologically by Act.
- Example unlocked card: *"Kept Sculley — Act 2. Your co-founder rift never came. The company's culture stayed founder-led longer, but growth slowed."*
- A completion percentage per story ("You've discovered 7 of 22 possible paths in Pineapple's story") to drive replay motivation.
- Rare/hard-to-reach flags should be visually distinguished (gold border, "Rare Path" tag) to reward players who make unusual choice combinations.

### Monetisation Hook
- 1-2 genuinely rare narrative branches per story can be flagged as "Legendary Paths" — reachable only through very specific choice sequences, OR unlockable directly via a small IAP that reveals the required choice sequence as a hint (not the outcome itself — preserve discovery value).

### Engineering Scope
- New: Timeline Archive UI screen (reuses existing card component styling)
- New: a registry mapping each narrative flag to display metadata (title, description, rarity tier)
- New: completion percentage calculation per story
- Reuses: existing narrative flag system entirely — no changes needed to how flags are set

---

## 4. Feature 3 — Founder's Legacy (Cross-Story Meta-Progression)

### Why
This is the highest-impact retention feature on this list. Currently, each story (Pineapple, Bookface, Searchgo, AeroSpaceX) appears to be fully isolated. Without a reason to move between stories, players may finish one and churn rather than start the next. A shared meta-layer converts four separate stories into one connected ecosystem.

### What To Build
- A "Founder's Legacy" profile that persists across all story campaigns (separate from individual campaign saves, but still isolated from the sandbox engine's Supabase-based progression as per current architecture).
- Completing specific milestones within any story (not just winning — e.g., reaching a valuation threshold, surviving a specific Board Vote, discovering a Legendary Path) unlocks small permanent perks usable as optional starting bonuses in other stories.
- Example: Beating Pineapple's win condition unlocks a "Design Obsession" perk — usable as an optional Act 1 starting bonus in any other story, granting +5% Product Quality growth for that campaign.
- Perks should be optional toggles at campaign start, not automatic — this preserves difficulty balance for players who want the "true" historical experience.

### Monetisation Hook
- A bundled "Founder's Legacy Pass" — unlocks all four stories at once (rather than separate per-story purchases) at a bundled price point, plus grants 1-2 exclusive Legacy perks not earnable through free play. This is the anchor monetisation product for the entire Story Mode feature.

### Engineering Scope
- New: Legacy profile data structure and its own save file (`founder_sim_legacy_{userId}`), isolated from both sandbox and individual story saves
- New: perk registry and perk-toggle UI at campaign start screen
- New: milestone-to-perk unlock mapping per story
- Reuses: existing per-story win/milestone detection logic as the trigger source

---

## 5. Feature 4 — Mini-Game Skill Tiers

### Why
The existing mini-games (Keynote Mini-Game, Pitch Deck Game, Acquisition Poker) are a strong differentiator versus other tycoon games, but if they are currently pass/fail only, they lack a skill ceiling that rewards mastery and drives replay purely for score-chasing.

### What To Build
- Convert each mini-game's outcome from binary pass/fail into a tiered score (e.g., D/C/B/A/S rating) based on performance quality, not just completion.
- Tie the tier achieved to a scaled StoryMetricDelta — an S-tier Keynote gives a larger PR/valuation boost than a C-tier pass; a D-tier "pass" gives minimal benefit while still avoiding the failure state.
- Display the tier achieved prominently with satisfying feedback (animation, sound, shareable result card) immediately after the mini-game concludes.

### Monetisation Hook
- A one-time-per-mini-game-instance "Practice Run" — watch a rewarded ad to attempt the mini-game once without it counting, then play for real. This places ad inventory at the moment of highest player investment (about to attempt a high-stakes mini-game) without gating core progress behind ads.

### Engineering Scope
- Modify: existing mini-game scoring logic to output a graded tier instead of boolean pass/fail
- Modify: the StoryMetricDelta applied post-mini-game to scale with tier
- New: practice-run ad-gate wrapper before mini-game entry
- Reuses: existing mini-game mechanics entirely — this only changes scoring/reward mapping, not gameplay

---

## 6. Feature 5 — Boardroom Relationship Management

### Why
The Boardroom system already tracks Loyalty and Influence per board member and uses these in scripted vote events. Currently this appears to be a passive backend calculation. Making it an active, ongoing mini-system between major events adds a strategic layer similar to relationship/court-intrigue mechanics that are proven highly engaging in the strategy genre.

### What To Build
- Once per in-game quarter (or similar cadence), give the player a limited action: "Meet privately with a Board Member."
- This opens a short dialogue interaction (2-3 response choices, reusing existing choice/mutation UI) that can shift that member's Loyalty score up or down depending on the player's approach (aligning with their stated agenda — Growth vs Profit — versus pushing back).
- This should NOT replace scripted Board Vote events — it should be a tool players can use in advance to influence how those votes go.

### Engineering Scope
- New: a lightweight dialogue content set per Board Member archetype (Growth-focused, Profit-focused)
- New: a quarterly action-availability flag and UI entry point
- Reuses: existing Loyalty scoring, existing choice/mutation system, existing Board Vote logic entirely unchanged

---

## 7. Feature 6 — Visible Culture Archetype Badge

### Why
Culture Archetypes (craft, hustle, ownership, enterprise, bro) are already computed from narrative flags and loyalty data but are backend-only. Surfacing this turns an invisible calculation into a visible, evolving identity that makes the same underlying simulation feel more personalized.

### What To Build
- Display the current Culture Archetype as a badge/icon on the main story dashboard, updating live as it shifts.
- Each archetype should have a distinct icon, color, and one-line flavor description.
- Gate a small number of unique random events specifically by archetype (a "hustle" culture triggers a different crunch/burnout-flavored event than a "craft" culture would) to reinforce that the label has real gameplay texture, not just cosmetic value.

### Engineering Scope
- New: badge UI component + archetype-to-visual mapping
- New (optional, can be phased later): 1-2 archetype-gated events per archetype as a first pass
- Reuses: existing Culture Archetype calculation entirely unchanged

---

## 8. Feature 7 — Speedrun / "Beat History" Leaderboard

### Why
This is the lowest-engineering-cost item on this list because the underlying data (months elapsed, valuation achieved, win condition met) is already tracked by the existing engine. It adds a competitive layer for the leaderboard-oriented segment of the existing Founder Sim player base without requiring new systems.

### What To Build
- A per-story leaderboard tracking: fastest in-game months to meet the win condition, and/or highest valuation achieved while beating the historical timeline benchmark (e.g., "Went public 8 months faster than the real Pineapple did").
- Should reuse the existing Global Leaderboard infrastructure from the sandbox game (same visual style, same submission flow) if feasible, to minimize new UI work.

### Engineering Scope
- New: leaderboard submission trigger on win condition met (months elapsed, valuation)
- Reuses: existing win condition detection, ideally existing leaderboard UI/infrastructure from sandbox mode

---

## 9. Recommended Build Priority

Given typical solo/small-team engineering capacity, the suggested order balances impact against cost:

| Priority | Feature | Engineering Cost | Impact |
|---|---|---|---|
| 1 | Failure Epilogues + Rewind | Low | High (retention + direct monetisation) |
| 2 | Timeline Archive | Low-Medium | High (replay driver, shareability) |
| 3 | Speedrun Leaderboard | Very Low | Medium (near-free addition) |
| 4 | Mini-Game Skill Tiers | Low-Medium | Medium-High (differentiator + ad monetisation) |
| 5 | Founder's Legacy Cross-Progression | Medium-High | Highest long-term (ties all 4 stories together) |
| 6 | Boardroom Relationship Management | Medium | Medium (depth for engaged players) |
| 7 | Culture Archetype Badge | Low | Low-Medium (polish, perceived depth) |

**Suggested approach:** Ship items 1-3 first as a single update ("Story Mode: Legacy Update"), measure retention and revenue impact, then proceed to 4-5 as a follow-up major update once the four core stories (Pineapple, Bookface, Searchgo, AeroSpaceX) are otherwise stable and live.

---

## 10. IAP Planning & Revenue Architecture

This section lays out the complete monetisation structure for Story Mode — what to sell, at what price, and why each price point exists. The goal is a tiered structure where low-friction purchases capture casual spenders and a bundled pass captures the most engaged players, without any single paywall feeling mandatory to enjoy the mode.

### 10.1 Access Tier — The Core Paywall

**Free: One Story (Pineapple)**
Pineapple is the flagship free story — most universally recognizable, best hook for new and existing players. This should remain permanently free as the acquisition and retention anchor for the entire Story Mode feature. Existing Founder Sim players should be able to try it with zero friction.

**Story Unlock — Individual — ₹149 / $1.99 each**
Bookface, Searchgo, and AeroSpaceX available as standalone purchases for players who only want one additional story. Priced low enough to be an impulse buy after finishing Pineapple.

**Founder's Legacy Pass — ₹399 / $4.99 (bundle)**
Unlocks all three remaining stories together at a discount versus buying individually (₹149 x 3 = ₹447 separately). Bundle discount should always be visible on the purchase screen ("Save 11% vs buying separately") to nudge players toward the higher-value single transaction.
This pass should also include the 1-2 exclusive Legacy perks described in Section 4, giving it value beyond just the three stories — this is what justifies positioning it as the primary purchase target rather than a convenience option.

**Rationale for this structure:** Single low-price impulse buys convert players who are hesitant about a bigger commitment; the bundle then captures the value from players who already converted once and are likely to want more. Don't skip straight to only offering the bundle — the individual option is what gets the first purchase decision made.

### 10.2 In-Story Consumables

**Rewind Token — ₹49 / $0.59 (pack of 3), or 1 free per campaign via rewarded ad**
As described in Section 2. This is the highest-conversion moment in the entire mode because it's offered exactly at peak emotional stakes (immediately after failure, when the sunk-cost feeling is strongest). Price this low — it's a volume product, not a premium one.

**Practice Run Ad-Gate — Free (ad-supported only, no IAP equivalent)**
As described in Section 5. Keep this ad-only, not purchasable — it should exist purely to generate ad inventory at a high-engagement moment, not to be monetised directly. Offering a paid skip here would cannibalize the ad revenue this feature exists to create.

**Legendary Path Hint — ₹79 / $0.99 each, or discoverable free through play**
As described in Section 3 (Timeline Archive). This should never be the only way to unlock a Legendary Path — it should only ever reveal the required choice sequence as a hint for players who are stuck, never sell the outcome directly. This preserves the discovery value for free players while still monetising impatience.

### 10.3 Note on Cosmetics — Deliberately Excluded

Cosmetic/vanity purchases (portrait skins, frame styles, etc.) were considered but deliberately excluded from this plan. Cosmetics monetise well specifically in games with peer visibility — other players see your appearance/status and that drives the purchase (Fortnite skins, avatar platforms, competitive multiplayer). Story Mode is a solo, narrative-driven experience with no audience for cosmetics beyond the player themselves, so the core psychological mechanism behind cosmetic spending doesn't apply here. Expected attach rate would be very low and would add purchase-screen clutter that dilutes focus from the items below, which sit at genuine functional/emotional decision points. Revisit this only if a social/leaderboard-comparison layer with visible player identities is added later.

### 10.4 Ad Revenue Placement Map

To maximize ad revenue without harming retention, ad placements should be mapped specifically to moments where players are already emotionally invested enough to tolerate an interruption:

| Moment | Ad Type | Why It Works Here |
|---|---|---|
| Immediately after failure, before Rewind offer | Rewarded video (grants 1 free Rewind) | Peak motivation to continue, not just view an ad passively |
| Before a mini-game attempt | Rewarded video (grants Practice Run) | Player is invested in performing well, wants the edge |
| On returning to app after 24+ hours away | Interstitial (skippable after 5s) | Re-engagement moment, low risk of churn since they chose to return |
| After completing an Act (natural narrative pause) | Interstitial (skippable after 5s) | Natural break point, doesn't interrupt active decision-making |

**Avoid placing any ad:** mid-event-choice, mid-mini-game, or immediately at story launch. These interrupt active engagement and are proven to spike churn disproportionately to the revenue gained.

### 10.5 Pricing Summary Table

| Item | Price (INR) | Price (USD) | Type |
|---|---|---|---|
| Pineapple story | Free | Free | Access |
| Bookface / Searchgo / AeroSpaceX (each) | ₹149 | $1.99 | Access |
| Founder's Legacy Pass (bundle, 3 stories + perks) | ₹399 | $4.99 | Access |
| Rewind Token (pack of 3) | ₹49 | $0.59 | Consumable |
| Legendary Path Hint | ₹79 | $0.99 | Consumable |

### 10.6 Revenue Sequencing Recommendation

Launch order matters for maximizing early revenue signal without overwhelming the update with too many purchase decisions at once:

1. **Launch with:** Free Pineapple + paid individual story unlocks + Founder's Legacy Pass bundle. This validates the core access-tier monetisation first.
2. **Add within 2-4 weeks:** Rewind Token consumable, tied to the Failure Epilogue feature shipping (Section 2). This is the highest-conversion item and should not be delayed long after core stories launch.
3. **Add last:** Legendary Path Hints, once enough players have organically discovered some Legendary Paths through free play — this creates social proof ("only 3% of players have found this") that makes the hint purchase more appealing by comparison, and once the Timeline Archive (Section 3) is live to house them.

This sequencing avoids launching every monetisation surface simultaneously, which makes it easier to isolate which specific addition is driving revenue changes — important given the analytics challenges already observed in the main Sandbox mode's IAP tracking.

---

## 11. Naming & Legal Note (Carried Over From Prior Discussion)

As a standing note for whoever implements this: company names (Pineapple, Bookface, Searchgo, AeroSpaceX) and founder names should remain fictionalized as already decided. Avoid using real product names (e.g., "iPhone," "News Feed") inside event text or mini-game content — keep invented equivalents consistent throughout new content added under this spec. Marketing copy and ASO for this feature should not explicitly name the real-world companies being referenced; let players make that connection themselves.

---

*End of specification. This document is intended as a planning and prioritization aid — exact implementation details (data schema, file structure) should be finalized in collaboration with whoever is building in Antigravity, based on the existing engine.ts structure.*