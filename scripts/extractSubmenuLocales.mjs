import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

en.dashboard.submenu = {
    actions_ongoing: "Actions + Ongoing Programs",
    instant_action: "Instant Action (Costs Energy)",
    requires_focus: "Requires Focus Energy",
    mkt_skill: "MKT Skill",
    brand: "Brand",
    marketers: "Marketers",
    growth_capacity: "Growth Capacity",
    execution_scale: "Execution Scale",
    throttled_marketing: "⚠️ Throttled: Team is too small for {{users}} users. Growth actions are {{pct}}% less effective.",
    eng_capacity: "Eng. Capacity",
    throttled_product: "⚠️ Throttled: Team is too small for {{users}} users. Actions are {{pct}}% less effective.",
    innovation_level: "Innovation Level",
    high_innovation: "High innovation increases valuation & fundraising success.",
    power: "Power",
    sales_velocity: "Sales Velocity",
    pipeline_size: "Pipeline Size",
    sales_reps: "Sales Reps",
    sales_capacity: "Sales Capacity",
    throttled_sales: "⚠️ Throttled: Team is too small for {{mrr}} MRR. Sales actions are {{pct}}% less effective.",
    ops_capacity: "Ops Capacity",
    support_load: "Support Load",
    cs_reps: "CS Reps",
    churn: "Churn",
    throttled_ops: "⚠️ Throttled: Team is too small. High churn risk."
};

es.dashboard.submenu = {
    actions_ongoing: "Acciones + Programas Activos",
    instant_action: "Acción Instantánea (Cuesta Energía)",
    requires_focus: "Requiere Energía de Enfoque",
    mkt_skill: "Habilidad MKT",
    brand: "Marca",
    marketers: "Marketeros",
    growth_capacity: "Capacidad de Crecimiento",
    execution_scale: "Escala de Ejecución",
    throttled_marketing: "⚠️ Limitado: Equipo muy pequeño para {{users}} usuarios. Acciones un {{pct}}% menos efectivas.",
    eng_capacity: "Capacidad Ing.",
    throttled_product: "⚠️ Limitado: Equipo muy pequeño para {{users}} usuarios. Acciones un {{pct}}% menos efectivas.",
    innovation_level: "Nivel de Innovación",
    high_innovation: "Alta innovación aumenta la valoración y éxito en fondos.",
    power: "Poder",
    sales_velocity: "Velocidad de Ventas",
    pipeline_size: "Tamaño Pipeline",
    sales_reps: "Reps. Ventas",
    sales_capacity: "Capacidad de Ventas",
    throttled_sales: "⚠️ Limitado: Equipo muy pequeño para {{mrr}} MRR. Acciones un {{pct}}% menos efectivas.",
    ops_capacity: "Capacidad Ops",
    support_load: "Carga de Soporte",
    cs_reps: "Reps. CS",
    churn: "Abandono",
    throttled_ops: "⚠️ Limitado: Equipo muy pequeño. Alto riesgo de abandono."
};

de.dashboard.submenu = {
    actions_ongoing: "Aktionen + Laufende Programme",
    instant_action: "Sofortaktion (Kostet Energie)",
    requires_focus: "Erfordert Fokus-Energie",
    mkt_skill: "MKT-Skill",
    brand: "Marke",
    marketers: "Marketer",
    growth_capacity: "Wachstumskapazität",
    execution_scale: "Ausführungsskala",
    throttled_marketing: "⚠️ Gedrosselt: Team zu klein für {{users}} Nutzer. Aktionen {{pct}}% weniger effektiv.",
    eng_capacity: "Tech-Kapazität",
    throttled_product: "⚠️ Gedrosselt: Team zu klein für {{users}} Nutzer. Aktionen {{pct}}% weniger effektiv.",
    innovation_level: "Innovationsgrad",
    high_innovation: "Hohe Innovation steigert Bewertung & Finanzierungserfolg.",
    power: "Power",
    sales_velocity: "Verkaufsgeschwindigkeit",
    pipeline_size: "Pipeline-Größe",
    sales_reps: "Vertriebler",
    sales_capacity: "Vertriebskapazität",
    throttled_sales: "⚠️ Gedrosselt: Team zu klein für {{mrr}} MRR. Aktionen {{pct}}% weniger effektiv.",
    ops_capacity: "Ops-Kapazität",
    support_load: "Support-Last",
    cs_reps: "CS-Reps",
    churn: "Abwanderung",
    throttled_ops: "⚠️ Gedrosselt: Team zu klein. Hohes Abwanderungsrisiko."
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Submenu locales added.');
