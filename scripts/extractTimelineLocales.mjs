import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

en.dashboard.top_header.event_labels = {
    funding: "Funding",
    crisis: "Crisis",
    win: "Win",
    team: "Team",
    milestone: "Milestone",
    market: "Market",
    event: "Event"
};
en.dashboard.top_header.month_num = "Month {{month}}";
en.dashboard.top_header.now = "Now";

es.dashboard.top_header.event_labels = {
    funding: "Fondos",
    crisis: "Crisis",
    win: "Logro",
    team: "Equipo",
    milestone: "Hito",
    market: "Mercado",
    event: "Evento"
};
es.dashboard.top_header.month_num = "Mes {{month}}";
es.dashboard.top_header.now = "Ahora";

de.dashboard.top_header.event_labels = {
    funding: "Finanzierung",
    crisis: "Krise",
    win: "Erfolg",
    team: "Team",
    milestone: "Meilenstein",
    market: "Markt",
    event: "Ereignis"
};
de.dashboard.top_header.month_num = "Monat {{month}}";
de.dashboard.top_header.now = "Jetzt";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Timeline locales added.');
