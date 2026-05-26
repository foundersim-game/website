plan = """# Implementation Plan: Legal & Lawsuit Engine

## Goal Description
Implement a realistic legal module where the startup can face lawsuits (e.g. wrongful termination, patent infringement, regulatory fines). The player must navigate these by settling them for cash or fighting them in court (burning focus hours and legal fees until a verdict). 

## User Review Required
> [!IMPORTANT]
> The Lawsuits will drain monthly legal fees and focus hours if fought in court, or demand a large lump sum cash settlement. Are you okay with this penalty structure? 

## Open Questions
- Do you want a "Legal Counsel" hire position later, or should it remain abstract for now?

## Proposed Changes

### `src/lib/types/database.types.ts`
- **[MODIFY]** `database.types.ts`
  - Add `LawsuitType` union and `Lawsuit` type definition.
  - Extend the `Startup` interface to include an optional `active_lawsuits: Lawsuit[]` array.

### `src/lib/engine/simulation.ts`
- **[MODIFY]** `simulation.ts`
  - In `processMonth`, iterate over `startup.active_lawsuits`.
  - Deduct monthly legal fees.
  - Decrement `months_to_trial`.
  - If `months_to_trial` reaches 0, roll for court verdict using `win_probability`. Resolve with either dismissal or full penalty, and push notices to the timeline.

### `src/lib/engine/crisisEngine.ts`
- **[MODIFY]** `crisisEngine.ts`
  - Add logic so certain crises (like "Data Breach" or "Privacy Scare") can push a lawsuit into `startup.active_lawsuits`.

### `src/app/dashboard/page.tsx`
- **[MODIFY]** `page.tsx`
  - Overhaul the `category === "fines"` block to map through `startup.active_lawsuits`.
  - Create interactive cards for each lawsuit showing details, a "Settle" button, and a "Fight in Court" button.

## Verification Plan
### Manual Verification
- Trigger a crisis that spawns a lawsuit.
- Verify it appears on the Legal screen.
- Verify settling correctly subtracts the settlement amount and clears the suit.
- Verify fighting it correctly subtracts monthly fees and eventually resolves in `processMonth`.
"""

import os
os.makedirs('.gemini/antigravity/brain/b75f2902-0685-4e79-9530-210258f040f8', exist_ok=True)
with open('/Users/viacreativetech/.gemini/antigravity/brain/b75f2902-0685-4e79-9530-210258f040f8/implementation_plan.md', 'w') as f:
    f.write(plan)
