import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Dashboard Top Header Additions
en.dashboard.top_header = {
    month: "MONTH {{month}}",
    store: "STORE",
    bull_market: "📈 Bull Market: Fundraising Sentiment High",
    bear_market: "📉 Bear Market: Investors Risk Averse",
    ai_boom: "🤖 AI Boom: Tech Speed +20% / Salaries Surge",
    privacy_scare: "🔒 Privacy Scare: Marketing Efficiency -30%",
    current_milestone: "Current Milestone",
    next: "Next: {{next}}",
    focus_energy: "Focus Energy",
    available_to_spend: "Available to spend",
    refill: "Refill ⚡",
    cooldown: "Cooldown (1/hr)",
    users: "Users",
    mrr: "MRR",
    burnout: "Burnout",
    ceo_rep: "CEO Rep",
    event: "EVENT"
};

es.dashboard.top_header = {
    month: "MES {{month}}",
    store: "TIENDA",
    bull_market: "📈 Mercado Alcista: Confianza Alta",
    bear_market: "📉 Mercado Bajista: Inversores Precavidos",
    ai_boom: "🤖 Boom de IA: Vel. Técnica +20% / Salarios suben",
    privacy_scare: "🔒 Alarma de Privacidad: Eficiencia Marketing -30%",
    current_milestone: "Hito Actual",
    next: "Siguiente: {{next}}",
    focus_energy: "Energía de Enfoque",
    available_to_spend: "Disponible para gastar",
    refill: "Recargar ⚡",
    cooldown: "Enfriamiento (1/hr)",
    users: "Usuarios",
    mrr: "MRR",
    burnout: "Agotamiento",
    ceo_rep: "Reputación",
    event: "EVENTO"
};

de.dashboard.top_header = {
    month: "MONAT {{month}}",
    store: "SHOP",
    bull_market: "📈 Bullenmarkt: Hohes Investorenvertrauen",
    bear_market: "📉 Bärenmarkt: Risikoscheue Investoren",
    ai_boom: "🤖 KI-Boom: Tech-Speed +20% / Gehälter steigen",
    privacy_scare: "🔒 Datenschutzpanik: Marketing-Effizienz -30%",
    current_milestone: "Aktueller Meilenstein",
    next: "Nächster: {{next}}",
    focus_energy: "Fokus-Energie",
    available_to_spend: "Verfügbar",
    refill: "Auffüllen ⚡",
    cooldown: "Abklingzeit (1/h)",
    users: "Nutzer",
    mrr: "MRR",
    burnout: "Burnout",
    ceo_rep: "Ruf",
    event: "EREIGNIS"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Top Header locales added.');
