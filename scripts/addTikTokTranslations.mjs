import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const esPath = path.join(ROOT, 'src/locales/es.json');
const dePath = path.join(ROOT, 'src/locales/de.json');

const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

es.dashboard.marketing.viral_tiktok_moment = "💎 Momento Viral en TikTok";
es.dashboard.marketing.instantly_gain = "Gana instantáneamente";
es.dashboard.marketing.and_50_brand = "y +50% de Conocimiento de Marca.";
es.dashboard.marketing.trigger_viral_hit = "🚀 PROVOCAR ÉXITO VIRAL";
es.dashboard.marketing.leads_250 = "250 leads de alta intención";
es.dashboard.marketing.users_50k = "50,000 usuarios activos";

de.dashboard.marketing.viral_tiktok_moment = "💎 Viraler TikTok-Moment";
de.dashboard.marketing.instantly_gain = "Erhalte sofort";
de.dashboard.marketing.and_50_brand = "und +50% Markenbekanntheit.";
de.dashboard.marketing.trigger_viral_hit = "🚀 VIRALEN HIT AUSLÖSEN";
de.dashboard.marketing.leads_250 = "250 kaufbereite Leads";
de.dashboard.marketing.users_50k = "50.000 aktive Nutzer";

fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("TikTok translations added.");
