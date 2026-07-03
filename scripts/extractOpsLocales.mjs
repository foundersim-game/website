import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Initialize if not present
if (!en.dashboard.ops) en.dashboard.ops = {};
if (!es.dashboard.ops) es.dashboard.ops = {};
if (!de.dashboard.ops) de.dashboard.ops = {};

// --- Hiring ---
en.dashboard.ops.hiring = {
    pipeline: "Hiring Pipeline",
    on_team: "{{count}} on team · {{morale}}% morale",
    hiring_priority: "🎯 Hiring Priority for {{model}}",
    poach_10x: "💎 Poach a 10x Rockstar",
    poach_desc: "Bypass the RNG. Instantly hire a Level 99 Senior employee.",
    roles: {
        engineer: "Software Engineer",
        marketer: "Growth Marketer",
        legal: "Legal Counsel"
    },
    poach_btn: "Poach {{role}}",
    tiers: {
        lead: "Lead",
        senior: "Senior",
        mid: "Mid",
        junior: "Junior"
    },
    card: {
        salary: "${{salary}}/mo",
        skill: "Skill {{skill}}",
        culture: "Culture {{fit}}",
        hire_btn: "Hire {{tier}}"
    },
    no_candidates: "No candidates available for {{role}} this month."
};

es.dashboard.ops.hiring = {
    pipeline: "Candidatos",
    on_team: "{{count}} en equipo · {{morale}}% moral",
    hiring_priority: "🎯 Prioridad de Contratación para {{model}}",
    poach_10x: "💎 Fichar a un Rockstar 10x",
    poach_desc: "Ignora el azar. Contrata instantáneamente a un Senior Nivel 99.",
    roles: {
        engineer: "Ingeniero de Software",
        marketer: "Growth Marketer",
        legal: "Asesor Legal"
    },
    poach_btn: "Fichar {{role}}",
    tiers: {
        lead: "Líder",
        senior: "Senior",
        mid: "Mid",
        junior: "Junior"
    },
    card: {
        salary: "${{salary}}/mes",
        skill: "Habilidad {{skill}}",
        culture: "Cultura {{fit}}",
        hire_btn: "Contratar {{tier}}"
    },
    no_candidates: "No hay candidatos disponibles para {{role}} este mes."
};

de.dashboard.ops.hiring = {
    pipeline: "Bewerber-Pipeline",
    on_team: "{{count}} im Team · {{morale}}% Moral",
    hiring_priority: "🎯 Einstellungs-Priorität für {{model}}",
    poach_10x: "💎 10x Rockstar abwerben",
    poach_desc: "Überspringe den Zufall. Stelle sofort einen Level 99 Senior ein.",
    roles: {
        engineer: "Softwareentwickler",
        marketer: "Growth Marketer",
        legal: "Rechtsberater"
    },
    poach_btn: "{{role}} abwerben",
    tiers: {
        lead: "Lead",
        senior: "Senior",
        mid: "Mid",
        junior: "Junior"
    },
    card: {
        salary: "${{salary}}/Monat",
        skill: "Fähigkeit {{skill}}",
        culture: "Kultur {{fit}}",
        hire_btn: "{{tier}} einstellen"
    },
    no_candidates: "In diesem Monat keine Kandidaten für {{role}} verfügbar."
};


// --- Stats ---
en.dashboard.ops.stats = {
    title: "Financials & Metrics",
    your_metrics: "Your Metrics",
    cash_flow: "Cash Flow",
    runway: "Runway",
    months: "months",
    mrr: "MRR",
    growth_rate: "Growth Rate",
    users: "Users",
    burn_rate: "Burn Rate",
    rev_breakdown: "Revenue Breakdown",
    rev_products: "Products",
    rev_services: "Services",
    rev_ads: "Ads & Other"
};
es.dashboard.ops.stats = {
    title: "Finanzas y Métricas",
    your_metrics: "Tus Métricas",
    cash_flow: "Flujo de Caja",
    runway: "Runway",
    months: "meses",
    mrr: "MRR",
    growth_rate: "Crecimiento",
    users: "Usuarios",
    burn_rate: "Burn Rate",
    rev_breakdown: "Desglose de Ingresos",
    rev_products: "Productos",
    rev_services: "Servicios",
    rev_ads: "Anuncios y Otros"
};
de.dashboard.ops.stats = {
    title: "Finanzen & Metriken",
    your_metrics: "Deine Metriken",
    cash_flow: "Cashflow",
    runway: "Runway",
    months: "Monate",
    mrr: "MRR",
    growth_rate: "Wachstum",
    users: "Nutzer",
    burn_rate: "Burn Rate",
    rev_breakdown: "Umsatzaufteilung",
    rev_products: "Produkte",
    rev_services: "Dienstleistungen",
    rev_ads: "Werbung & Sonstiges"
};

// --- Pricing ---
en.dashboard.ops.pricing = {
    title: "Pricing Strategy",
    plg_active: "✨ Product-Led Growth Active",
    slg_active: "🤝 Sales-Led Growth Active",
    free: "Free"
};
es.dashboard.ops.pricing = {
    title: "Estrategia de Precios",
    plg_active: "✨ Crecimiento por Producto",
    slg_active: "🤝 Crecimiento por Ventas",
    free: "Gratis"
};
de.dashboard.ops.pricing = {
    title: "Preisstrategie",
    plg_active: "✨ Produktgeführtes Wachstum",
    slg_active: "🤝 Vertriebsgeführtes Wachstum",
    free: "Kostenlos"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Ops locales added.');
