#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const enPath = path.join(ROOT, 'src/locales/en.json');
const esPath = path.join(ROOT, 'src/locales/es.json');
const dePath = path.join(ROOT, 'src/locales/de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Utility for deep merging
function setDeep(obj, pathString, value) {
    const keys = pathString.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

// 1. Effects strings in renderActionCard
const effectsEs = {
    Int: "Int", Tech: "Téc", Lead: "Lid", Net: "Red", Mkt: "Mkt",
    Burnout: "Burnout", Health: "Salud", Quality: "Calidad",
    Debt: "Deuda", Rel: "Fiabilidad", Brand: "Marca",
    "Pref Score": "Pref", Reputation: "Reputación", Leads: "Leads"
};
const effectsDe = {
    Int: "Int", Tech: "Tech", Lead: "Führ", Net: "Netz", Mkt: "Mkt",
    Burnout: "Burnout", Health: "Gesund", Quality: "Qualität",
    Debt: "Schulden", Rel: "Zuverlässigkeit", Brand: "Marke",
    "Pref Score": "Präf", Reputation: "Ruf", Leads: "Leads"
};
for (const [k, v] of Object.entries(effectsEs)) setDeep(es, `dashboard.effects.${k}`, v);
for (const [k, v] of Object.entries(effectsDe)) setDeep(de, `dashboard.effects.${k}`, v);

// 2. Co-Founder Recruiting
const cofounderEs = {
    title: "RECLUTAR COFUNDADOR",
    desc: "Un cofundador cede capital pero reduce tu burnout a la mitad e impulsa tu habilidad más débil.",
    tech: "Cofundador Técnico",
    tech_desc: "+25 Téc, +50h Enfoque, divide deuda técnica",
    gtm: "Cofundador de Ventas",
    gtm_desc: "+25 Mkt, +50h Enfoque, crecimiento 2x",
    bal: "Cofundador Equilibrado",
    bal_desc: "+15 Habilidades, +50h Enfoque, +20 Moral",
    equity: "capital",
    burnout: "burnout"
};
const cofounderDe = {
    title: "CO-FOUNDER REKRUTIEREN",
    desc: "Ein Mitgründer gibt Anteile ab, halbiert aber dein Burnout und stärkt deine schwächste Fähigkeit.",
    tech: "Technischer Mitgründer",
    tech_desc: "+25 Tech, +50h Fokus, halbiert Tech-Schulden",
    gtm: "Vertriebs-Mitgründer",
    gtm_desc: "+25 Mkt, +50h Fokus, 2x Wachstum",
    bal: "Ausgeglichener Mitgründer",
    bal_desc: "+15 Fähigkeiten, +50h Fokus, +20 Moral",
    equity: "Anteile",
    burnout: "Burnout"
};
for (const [k, v] of Object.entries(cofounderEs)) setDeep(es, `dashboard.ops.hiring.cofounder.${k}`, v);
for (const [k, v] of Object.entries(cofounderDe)) setDeep(de, `dashboard.ops.hiring.cofounder.${k}`, v);

// 3. Advanced Recruiting engine
const recruitingEs = {
    title: "MOTOR DE RECLUTAMIENTO",
    standard: "BÚSQUEDA ESTÁNDAR",
    exec: "BÚSQUEDA EJECUTIVA",
    mass: "RECLUTAMIENTO MASIVO (5X)",
    mid: "NIVEL MEDIO",
    energy: "ENERGÍA",
    watch_ad: "VER ANUNCIO - 0 ENERGÍA",
    view_manage: "VER Y GESTIONAR EQUIPO",
    culture_programs: "PROGRAMAS DE CULTURA",
    run_campaign: "Ejecuta una campaña para conseguir talento."
};
const recruitingDe = {
    title: "ERWEITERTES RECRUITING",
    standard: "STANDARD-SUCHE",
    exec: "EXECUTIVE SUCHE",
    mass: "MASSEN-RECRUITING (5X)",
    mid: "MID-LEVEL",
    energy: "ENERGIE",
    watch_ad: "WERBUNG ANSEHEN - 0 ENERGIE",
    view_manage: "TEAM ANSEHEN & VERWALTEN",
    culture_programs: "KULTURPROGRAMME",
    run_campaign: "Starte eine Kampagne für Talent."
};
for (const [k, v] of Object.entries(recruitingEs)) setDeep(es, `dashboard.ops.hiring.recruiting.${k}`, v);
for (const [k, v] of Object.entries(recruitingDe)) setDeep(de, `dashboard.ops.hiring.recruiting.${k}`, v);

// 4. Marketing Tab Growth Levers & Instant Actions
const marketingEs = {
    growth_rate: "TASA CRECIMIENTO",
    cac: "CAC",
    pmf: "PMF",
    growth_lever: "PALANCA DE CRECIMIENTO",
    instant_action: "ACCIÓN INSTANTÁNEA (CUESTA ENERGÍA)",
    ongoing: "PROGRAMAS CONTINUOS"
};
const marketingDe = {
    growth_rate: "WACHSTUMSRATE",
    cac: "CAC",
    pmf: "PMF",
    growth_lever: "WACHSTUMSHEBEL",
    instant_action: "SOFORT-AKTION (KOSTET ENERGIE)",
    ongoing: "LAUFENDE PROGRAMME"
};
for (const [k, v] of Object.entries(marketingEs)) setDeep(es, `dashboard.ops.marketing.${k}`, v);
for (const [k, v] of Object.entries(marketingDe)) setDeep(de, `dashboard.ops.marketing.${k}`, v);

// 5. Product Tab Remaining translations
const productEs = {
    capacity: "CAPACIDAD ING.",
    scale: "ESCALA DE EJECUCIÓN",
    innovation: "NIVEL DE INNOVACIÓN",
    innovation_desc: "ALTA INNOVACIÓN AUMENTA LA VALORACIÓN Y ÉXITO EN FONDOS.",
    throttled: "LIMITADO - EQUIPO MUY PEQUEÑO PARA {{users}} USUARIOS. ACCIONES UN {{pct}}% MENOS EFECTIVAS.",
    requires_focus: "REQUIERE ENERGÍA DE ENFOQUE"
};
const productDe = {
    capacity: "KAPAZITÄT",
    scale: "SKALIERUNG",
    innovation: "INNOVATIONSGRAD",
    innovation_desc: "HOHE INNOVATION STEIGERT BEWERTUNG UND FUNDING-ERFOLG.",
    throttled: "GEDROSSELT - TEAM ZU KLEIN FÜR {{users}} NUTZER. AKTIONEN SIND {{pct}}% WENIGER EFFEKTIV.",
    requires_focus: "BENÖTIGT FOKUS-ENERGIE"
};
for (const [k, v] of Object.entries(productEs)) setDeep(es, `dashboard.submenu.product_stats.${k}`, v);
for (const [k, v] of Object.entries(productDe)) setDeep(de, `dashboard.submenu.product_stats.${k}`, v);

// 6. Pricing Models
const pricingEs = {
    "self-serve_price": "Precio Autoservicio",
    "enterprise_retainer": "Retención Enterprise",
    "token_bundle_price": "Precio Pack Tokens",
    "api_developers": "Desarrolladores API",
    "billed_projects": "Proyectos Facturados",
    "api_calls_/_mo": "Llamadas API / Mes",
    "enterprise_solution": "Solución Enterprise",
    "sub_price": "Precio Suscripción",
    "free_viewers": "Espectadores Gratis",
    "premium_subs": "Suscriptores Premium",
    "content_license_price": "Licencia de Contenido",
    "iap_item_size": "Tamaño de IAP",
    "daily_active_users": "Usuarios Activos Diarios",
    "iap_spenders": "Compradores IAP",
    "ad_frequency": "Frecuencia Anuncios",
    "engine_license_fee": "Licencia Motor",
    "%_interchange_fee": "Tarifa Intercambio %",
    "active_wallets": "Carteras Activas",
    "avg_txn_size": "Tamaño Medio Txn",
    "infra_sub": "Suscripción Infra",
    "course_ticket": "Entrada Curso",
    "per_seat/mo": "Por Asiento/mes",
    "paid_tier": "Nivel de Pago",
    "enterprise_sso_package": "Paquete SSO Enterprise",
    "take_rate": "Tasa de Toma",
    "active_listings": "Listados Activos",
    "completed_txns": "Transacciones",
    "avg_order_value": "Valor Medio Pedido",
    "supplier_retainer": "Retención Proveedor"
};
for (const [k, v] of Object.entries(pricingEs)) setDeep(es, `dashboard.ops.pricing.labels.${k}`, v);

// 7. Missing Actions translation
const missingActionsEs = {
    "organic_social": { label: "Redes Sociales", description: "Contenido viral y comunidad" },
    "content_marketing": { label: "Marketing de Contenidos", description: "Publicaciones y tutoriales de alto valor" },
    "seo_growth": { label: "Crecimiento SEO", description: "Optimización técnica y palabras clave" },
    "paid_acquisition": { label: "Adquisición Pagada", description: "Publicidad de respuesta directa" },
    "pr_campaign": { label: "Campaña de Relaciones Públicas", description: "Gran lanzamiento y alcance a la prensa" },
    "weekly_1on1s": { label: "1:1s Semanales con Equipo", description: "Reuniones regulares para alinear." },
    "learning_budget": { label: "Presupuesto de Formación", description: "Fondo de formación." },
    "team_socials": { label: "Eventos Sociales", description: "Pack social de equipo." },
    "okr_system": { label: "Sistema de OKRs", description: "Mejora alineación y rendimiento." },
    "unlimited_pto": { label: "Vacaciones Ilimitadas", description: "Mayor moral, menos horas." },
    "founder_coaching": { label: "Coaching para Fundadores", description: "Sesiones para reducir burnout." },
    "refactor_codebase": { label: "Refactorizar Código", description: "Limpieza a gran escala para mejorar velocidad" },
    "optimize_cloud": { label: "Optimizar Infraestructura", description: "Modernizar recursos en la nube para reducir costos" },
    "seo_content_machine": { label: "Máquina de Contenido SEO", description: "Blog y SEO para tráfico recurrente" },
    "social_media_presence": { label: "Presencia en Redes Sociales", description: "Aumento de conciencia de marca" },
    "email_newsletter": { label: "Boletín por Email", description: "Resumen semanal a la audiencia" },
    "podcast_circuit": { label: "Apariciones en Podcasts", description: "Liderazgo de pensamiento de fundadores" }
};
for (const [k, v] of Object.entries(missingActionsEs)) {
    if (!es.actions) es.actions = {};
    if (!es.actions[k]) es.actions[k] = {};
    es.actions[k].label = v.label;
    es.actions[k].description = v.description;
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("All missing locales patched.");
