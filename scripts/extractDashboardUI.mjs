import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Adding pricing and b2b pipeline strings
const enAdditions = {
    "pricing_balanced_pros": "Solid margins with steady, predictable growth.",
    "pricing_balanced_cons": "Standard competition levels apply.",
    "pricing_freemium_pros": "Accelerated virality & high user conversion.",
    "pricing_freemium_cons": "Low cash revenue per user limits burn capacity.",
    "pricing_premium_pros": "Maximizes cash revenue and contract sizes.",
    "pricing_premium_cons": "Slows down organic virality & yields higher churn.",
    "b2b_sales_pipeline": "B2B Sales Pipeline",
    "b2b_leads": "Leads",
    "b2b_active_deals": "Active Deals",
    "b2b_deals_won": "Deals Won",
    "b2b_sales_cycle": "Enterprise sales takes 1-3 months. Win rate depends on quality & sales team.",
    "product_stats": "Product Stats",
    "stat_quality": "Quality",
    "stat_reliability": "Reliability",
    "stat_tech_debt": "Tech Debt",
    "stat_pmf": "PMF Score"
};

const esAdditions = {
    "pricing_balanced_pros": "Márgenes sólidos con un crecimiento estable y predecible.",
    "pricing_balanced_cons": "Se aplican niveles estándar de competencia.",
    "pricing_freemium_pros": "Viralidad acelerada y alta conversión de usuarios.",
    "pricing_freemium_cons": "Bajos ingresos en efectivo por usuario limitan la capacidad de quemar dinero.",
    "pricing_premium_pros": "Maximiza los ingresos en efectivo y los tamaños de los contratos.",
    "pricing_premium_cons": "Ralentiza la viralidad orgánica y produce mayor pérdida de clientes.",
    "b2b_sales_pipeline": "Embudo de Ventas B2B",
    "b2b_leads": "Leads",
    "b2b_active_deals": "Tratos Activos",
    "b2b_deals_won": "Tratos Ganados",
    "b2b_sales_cycle": "Las ventas corporativas toman 1-3 meses. La tasa de éxito depende de la calidad y el equipo.",
    "product_stats": "Estadísticas del Producto",
    "stat_quality": "Calidad",
    "stat_reliability": "Fiabilidad",
    "stat_tech_debt": "Deuda Técnica",
    "stat_pmf": "Puntuación PMF"
};

const deAdditions = {
    "pricing_balanced_pros": "Solide Margen mit stetigem, vorhersehbarem Wachstum.",
    "pricing_balanced_cons": "Es gelten Standard-Wettbewerbsniveaus.",
    "pricing_freemium_pros": "Beschleunigte Viralität & hohe Nutzerkonversion.",
    "pricing_freemium_cons": "Geringer Barumsatz pro Nutzer begrenzt die Burn-Kapazität.",
    "pricing_premium_pros": "Maximiert Barumsätze und Vertragsgrößen.",
    "pricing_premium_cons": "Verlangsamt organische Viralität & führt zu höherer Abwanderung.",
    "b2b_sales_pipeline": "B2B-Vertriebspipeline",
    "b2b_leads": "Leads",
    "b2b_active_deals": "Aktive Deals",
    "b2b_deals_won": "Gewonnene Deals",
    "b2b_sales_cycle": "Enterprise-Verkäufe dauern 1-3 Monate. Die Gewinnrate hängt von Qualität & Vertriebsteam ab.",
    "product_stats": "Produktstatistiken",
    "stat_quality": "Qualität",
    "stat_reliability": "Zuverlässigkeit",
    "stat_tech_debt": "Technische Schulden",
    "stat_pmf": "PMF-Score"
};

en.dashboard.playbook = { ...en.dashboard.playbook, ...enAdditions };
es.dashboard.playbook = { ...es.dashboard.playbook, ...esAdditions };
de.dashboard.playbook = { ...de.dashboard.playbook, ...deAdditions };

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("Pricing & B2B locales added.");
