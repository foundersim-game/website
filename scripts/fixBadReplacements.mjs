import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Reverse bad replacements
content = content.replace(/assetargetItem/g, 'asset');
content = content.replace(/optargetItem/g, 'opt');
content = content.replace(/suitargetItem/g, 'suit');
content = content.replace(/catargetItem/g, 'cat');
content = content.replace(/assetmpl/g, 'asset');
content = content.replace(/targetargetItem/g, 'target');

// Wait, what about `targetItem` being used where it shouldn't?
// In page.tsx(6919,57), it says: Cannot find name 'targetItem'.
// In page.tsx(9343,109), it says: Cannot find name 'targetItem'.
// Where did `targetItem` replace something without a prefix?
// Let's check those manually via command line if needed, or we can just replace 'targetItem' back to 't' ONLY where it was not supposed to be?
// Actually, `t.name` was replaced with `targetItem.name`.
// If `t.name` was a standalone variable `t` (e.g. from i18n)? `t` is a function, it doesn't have `t.name`.
// So it must be another variable ending in t? like `event.name` -> `eventargetItem.name`? No, `event` doesn't end in `t.name`. Wait `event` ends in `t`! `event.name` -> `eventargetItem.name` -> wait, `even` + `targetItem.name`.
// Oh! `event.name` -> `even` + `targetItem.name`!
// Wait, `t.name` was replaced with `targetItem.name` in `mnaTargets` logic. But `event.name` matched `t.name`? Yes!
content = content.replace(/eventargetItem/g, 'event');
content = content.replace(/eventmpl/g, 'event');

// Wait, I did replace(/t\.name/g, 'tmpl.name') and replace(/t\.name/g, 'targetItem.name').
// So `event.name` became `even` + `tmpl.name` -> `eventmpl.name`
// Then it might have become `even` + `targetItem.name` -> `eventargetItem.name`.
// Any word ending in t followed by .name:
// e.g., `account.name` -> `accoun` + `targetItem.name` -> `accountargetItem`
content = content.replace(/([a-zA-Z0-9]+)targetItem/g, '$1t');
content = content.replace(/([a-zA-Z0-9]+)tmpl/g, '$1t');

fs.writeFileSync(pagePath, content);
console.log('Fixed variable collisions reverse.');
