import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const esPath = path.join(ROOT, 'src/locales/es.json');
const dePath = path.join(ROOT, 'src/locales/de.json');

const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (es.dashboard.ops && es.dashboard.ops.marketing) {
    es.dashboard.marketing = { ...es.dashboard.marketing, ...es.dashboard.ops.marketing };
}
if (de.dashboard.ops && de.dashboard.ops.marketing) {
    de.dashboard.marketing = { ...de.dashboard.marketing, ...de.dashboard.ops.marketing };
}

fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));
console.log("Fixed marketing keys.");
