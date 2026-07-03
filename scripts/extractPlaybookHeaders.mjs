import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// English
en.dashboard = en.dashboard || {};
en.dashboard.playbook = {
    "header": "Strategy Playbook",
    "your_customers": "Your Customers",
    "mrr_formula": "MRR Formula",
    "growth_lever": "Growth Lever",
    "main_risk": "Main Risk",
    "pricing_free": "Free",
    "pricing_freemium": "Freemium Pricing",
    "pricing_balanced": "Balanced Pricing",
    "pricing_premium": "Premium Pricing (Over-priced)",
    "pro": "Pro",
    "con": "Con"
};

// Spanish
es.dashboard = es.dashboard || {};
es.dashboard.playbook = {
    "header": "Manual de Estrategia",
    "your_customers": "Tus Clientes",
    "mrr_formula": "Fórmula MRR",
    "growth_lever": "Palanca de Crecimiento",
    "main_risk": "Riesgo Principal",
    "pricing_free": "Gratis",
    "pricing_freemium": "Precios Freemium",
    "pricing_balanced": "Precios Equilibrados",
    "pricing_premium": "Precios Premium (Sobrevalorado)",
    "pro": "Pro",
    "con": "Contra"
};

// German
de.dashboard = de.dashboard || {};
de.dashboard.playbook = {
    "header": "Strategie-Handbuch",
    "your_customers": "Deine Kunden",
    "mrr_formula": "MRR-Formel",
    "growth_lever": "Wachstumshebel",
    "main_risk": "Hauptrisiko",
    "pricing_free": "Kostenlos",
    "pricing_freemium": "Freemium-Preise",
    "pricing_balanced": "Ausgewogene Preise",
    "pricing_premium": "Premium-Preise (Überteuert)",
    "pro": "Pro",
    "con": "Contra"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("Playbook header translations applied.");
