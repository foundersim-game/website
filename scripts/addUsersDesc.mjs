import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (!data.dashboard.stats) data.dashboard.stats = {};
    data.dashboard.stats.users_desc = lang === 'es' 
        ? "Métrica central. Aumenta a través de marketing y contratando a un gran equipo de ventas."
        : lang === 'de'
        ? "Kernmetrik. Steigern Sie diese durch Marketing und die Einstellung eines großartigen Vertriebsteams."
        : "Core metric. Increase through marketing and hiring a great sales team.";

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Added users_desc");
