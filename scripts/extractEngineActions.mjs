import fs from 'fs';
import path from 'path';

const actionsFile = path.join(process.cwd(), 'src/lib/engine/actions.ts');
const actionsCode = fs.readFileSync(actionsFile, 'utf8');

const actions = {};

const regex = /id:\s*["']([^"']+)["'],\s*label:\s*["']([^"']+)["'],[\s\S]*?description:\s*["']([^"']+)["']/g;
let match;
while ((match = regex.exec(actionsCode)) !== null) {
    const id = match[1];
    const label = match[2];
    const desc = match[3];
    actions[id] = { label, description: desc };
}

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

en.actions = actions;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

// Generate the script to replace in actions.ts
let newActionsCode = actionsCode.replace(/label:\s*["']([^"']+)["']/g, 'labelKey: "actions.$1.label"'); // wait this would put the literal string
// better to use the id:
// replace label: "xyz" with labelKey: "actions.id.label"

let newCode = actionsCode;
for (const [id, data] of Object.entries(actions)) {
    newCode = newCode.replace(new RegExp(`id:\\s*["']${id}["'],\\s*label:\\s*["'][^"']+["']`), `id: "${id}",\n        labelKey: "actions.${id}.label"`);
    newCode = newCode.replace(new RegExp(`id:\\s*["']${id}["'],[\\s\\S]*?description:\\s*["'][^"']+["']`), (match) => {
        return match.replace(/description:\s*["'][^"']+["']/, `descKey: "actions.${id}.description"`);
    });
}
newCode = newCode.replace(/label: string;/g, 'labelKey?: string;\n    label?: string;');
newCode = newCode.replace(/description: string;/g, 'descKey?: string;\n    description?: string;');

fs.writeFileSync(actionsFile, newCode);
console.log('Extracted actions to en.json and modified actions.ts');
