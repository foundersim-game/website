import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/en.json'), 'utf8'));
const es = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/es.json'), 'utf8'));
const de = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/de.json'), 'utf8'));

function copyEmojis(source, target) {
    for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'object' && value !== null) {
            if (!target[key]) target[key] = {};
            copyEmojis(value, target[key]);
        } else if (key.startsWith('str_')) {
            target[key] = value; // Copy emoji back
        }
    }
}

copyEmojis(en.dashboard, es.dashboard);
copyEmojis(en.dashboard, de.dashboard);

// Add sec_safe_harbor_conservative
en.dashboard['10b51'].sec_safe_harbor_conservative = "SEC Safe-Harbor Conservative";
es.dashboard['10b51'].sec_safe_harbor_conservative = "SEC Safe-Harbor Conservador";
de.dashboard['10b51'].sec_safe_harbor_conservative = "SEC Safe-Harbor Konservativ";

fs.writeFileSync(path.join(ROOT, 'src/locales/en.json'), JSON.stringify(en, null, 2));
fs.writeFileSync(path.join(ROOT, 'src/locales/es.json'), JSON.stringify(es, null, 2));
fs.writeFileSync(path.join(ROOT, 'src/locales/de.json'), JSON.stringify(de, null, 2));

console.log("Restored emojis successfully!");
