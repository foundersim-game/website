import { getCampaign, initializeStoryState, initializeStorySnapshot } from "../src/lib/story/engine";
import { processStoryMonth, checkStoryEvents, applyStoryChoice, checkLossConditions, checkWinCondition } from "../src/lib/story/engine";

async function play() {
  const campaignId = "pineapple";
  const campaign = getCampaign(campaignId);
  if (!campaign) throw new Error("Pineapple campaign not found");
  
  let state = initializeStoryState(campaignId);
  let snapshot = initializeStorySnapshot(campaignId);
  let log: string[] = [];
  
  if (!state || !snapshot) throw new Error("Failed to init");

  log.push(`# Campaign Playthrough: ${campaign.companyName}\n`);

  for (let month = 1; month <= 600; month++) {
    state.currentMonth = month;
    log.push(`\n## Month ${month}`);
    log.push(`- **Cash**: $${snapshot.metrics.cash.toLocaleString()}`);
    log.push(`- **Users**: ${snapshot.metrics.users.toLocaleString()}`);
    log.push(`- **Valuation**: $${snapshot.valuation.toLocaleString()}`);
    log.push(`- **PMF**: ${snapshot.metrics.pmf_score.toFixed(1)}`);

    // Check Loss
    const loss = checkLossConditions(snapshot, state);
    if (loss) {
      log.push(`\n💀 **GAME OVER**: ${loss}`);
      break;
    }

    // Check Win
    if (checkWinCondition(snapshot, state)) {
      log.push(`\n🏆 **WIN**: ${campaign.winCondition.description}`);
      break;
    }

    // Check events
    let events = checkStoryEvents(snapshot, state, month);
    
    if (events.length > 0) {
      for (const ev of events) {
        if (!state.completedEventIds.includes(ev.id)) {
          log.push(`\n💥 **EVENT TRIGGERED**: ${ev.title}`);
          const validChoices = ev.choices.filter((c: any) => !c.condition || c.condition(snapshot as any, state));
          if (validChoices.length === 0) {
            log.push(`*No valid choices for ${ev.title}!*`);
          } else {
            // Pick the first valid choice for testing
            const choice = validChoices[0];
            log.push(`> **Decision**: ${choice.label}`);
            const result = applyStoryChoice(snapshot, state, ev.id, choice.id, true);
            snapshot = result.newSnapshot;
            state = result.newStoryState;
          }
        }
      }
    } else {
      // Don't log if nothing happens to keep it clean
    }

    // Advance month
    const advanceResult = processStoryMonth(snapshot, state);
    snapshot = advanceResult.newSnapshot;
    
    if (month === 120) state.currentAct = 2;
    if (month === 252) state.currentAct = 3;
    if (month === 348) state.currentAct = 4;
  }

  const fs = require('fs');
  const path = '/Users/viacreativetech/.gemini/antigravity-ide/brain/9e2d06aa-4543-4962-b909-7f36d76077c9/pineapple_playthrough.md';
  fs.writeFileSync(path, log.join('\n'));
  console.log("Wrote playthrough artifact");
}

play().catch(console.error);
