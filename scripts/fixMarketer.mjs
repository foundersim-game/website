import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];
const additions = {
    en: { marketer: "Growth Marketer" },
    es: { marketer: "Marketer de Growth" },
    de: { marketer: "Growth Marketer" }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.dashboard.roles) data.dashboard.roles = {};
    Object.assign(data.dashboard.roles, additions[lang]);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed Growth Marketer");
