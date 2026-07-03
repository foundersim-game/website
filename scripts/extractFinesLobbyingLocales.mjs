import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.fines) en.dashboard.fines = {};
if (!es.dashboard.fines) es.dashboard.fines = {};
if (!de.dashboard.fines) de.dashboard.fines = {};

if (!en.dashboard.lobbying) en.dashboard.lobbying = {};
if (!es.dashboard.lobbying) es.dashboard.lobbying = {};
if (!de.dashboard.lobbying) de.dashboard.lobbying = {};

Object.assign(en.dashboard.fines, {
    title: "Legal & Compliance",
    desc: "Manage ongoing litigation and regulatory risk.",
    pr_fixer: "💎 The PR Fixer",
    pr_fixer_desc: "Instantly settle all lawsuits, reset Board Anger, and restore Reputation.",
    make_disappear: "🛑 Make Problems Disappear",
    no_lawsuits: "No Active Lawsuits",
    no_lawsuits_desc: "Your company currently has no pending regulatory fines or class-action lawsuits.",
    demand: "Demand",
    trial_in: "Trial In",
    months: "Months",
    settle_for: "Settle for {{amount}}",
    fighting: "Fighting in Court",
    fees_mo: "-{{amount}}/mo fees",
    pro_bono: "Pro Bono Counsel ({{left}} Left)",
    pro_bono_exhausted: "Pro Bono Exhausted",
    insufficient_funds: "Insufficient Funds",
    insufficient_desc: "You don't have enough corporate cash to settle.",
    case_settled: "Case Settled",
    limit_reached: "Pro Bono Limit Reached",
    limit_desc: "You can only use Pro Bono counsel 3 times per lawsuit.",
    pro_bono_secured: "Pro Bono Counsel Secured!",
    pro_bono_secured_desc: "Settlement demand reduced by 20% and trial win probability increased by 15%."
});

Object.assign(es.dashboard.fines, {
    title: "Legal y Cumplimiento",
    desc: "Gestiona litigios en curso y riesgo regulatorio.",
    pr_fixer: "💎 El Solucionador de RRPP",
    pr_fixer_desc: "Liquida al instante demandas, reinicia enojo de la Junta y restaura reputación.",
    make_disappear: "🛑 Hacer que los problemas desaparezcan",
    no_lawsuits: "Sin Demandas Activas",
    no_lawsuits_desc: "Tu empresa no tiene multas o demandas pendientes.",
    demand: "Demanda",
    trial_in: "Juicio en",
    months: "Meses",
    settle_for: "Acordar por {{amount}}",
    fighting: "Peleando en Corte",
    fees_mo: "-{{amount}}/mes tarifas",
    pro_bono: "Abogado Pro Bono ({{left}} Disp)",
    pro_bono_exhausted: "Pro Bono Agotado",
    insufficient_funds: "Fondos Insuficientes",
    insufficient_desc: "No tienes suficiente efectivo para acordar.",
    case_settled: "Caso Acordado",
    limit_reached: "Límite Pro Bono Alcanzado",
    limit_desc: "Solo puedes usar abogado Pro Bono 3 veces por caso.",
    pro_bono_secured: "¡Abogado Pro Bono Conseguido!",
    pro_bono_secured_desc: "Demanda reducida 20% y probabilidad de ganar aumentada 15%."
});

Object.assign(de.dashboard.fines, {
    title: "Recht & Compliance",
    desc: "Laufende Rechtsstreitigkeiten verwalten.",
    pr_fixer: "💎 Der PR-Fixer",
    pr_fixer_desc: "Klär alle Klagen, setze Vorstandswut zurück und stelle Ruf wieder her.",
    make_disappear: "🛑 Probleme verschwinden lassen",
    no_lawsuits: "Keine aktiven Klagen",
    no_lawsuits_desc: "Dein Unternehmen hat derzeit keine offenen Geldstrafen oder Klagen.",
    demand: "Forderung",
    trial_in: "Prozess in",
    months: "Monaten",
    settle_for: "Einigen für {{amount}}",
    fighting: "Kämpft vor Gericht",
    fees_mo: "-{{amount}}/M Gebühren",
    pro_bono: "Pro Bono Anwalt ({{left}} Übrig)",
    pro_bono_exhausted: "Pro Bono erschöpft",
    insufficient_funds: "Unzureichende Mittel",
    insufficient_desc: "Nicht genug Geld für eine Einigung.",
    case_settled: "Fall Beigelegt",
    limit_reached: "Pro Bono Limit erreicht",
    limit_desc: "Du kannst Pro Bono nur 3x pro Klage nutzen.",
    pro_bono_secured: "Pro Bono Anwalt gesichert!",
    pro_bono_secured_desc: "Forderung um 20% reduziert, Gewinnwahrscheinlichkeit +15%."
});

Object.assign(en.dashboard.lobbying, {
    bribe_senator: "💎 Bribe a Senator",
    bribe_desc: "Call in a massive favor. Forces a global Bull Market for 12 months.",
    force_bull: "📈 Force Bull Market",
    influence_score: "Influence Score",
    capture_pct: "Your regulatory capture percentage",
    tier1: "Tier 1 (30+): Audit & Investigation Protection",
    tier1_perk: "-50% Crisis Chance",
    tier2: "Tier 2 (70+): Complete Regulatory Capture",
    tier2_perk: "+15% Monthly Tax Credit",
    initiatives: "Lobbying Initiatives & Campaigns",
    k_street: "K-Street Law Retainer",
    k_street_cost: "-$2M Corporate Cash",
    pac: "Targeted PAC Contribution",
    pac_cost: "-$10M Corporate Cash",
    liaison: "Federal Regulatory Liaison",
    liaison_cost: "-$20M Corporate Cash · Boost Reputation",
    coalition: "Bipartisan Coalition Sponsorship",
    coalition_cost: "-$50M Corporate Cash · Secures $15M Federal Grant",
    add_infl: "+{{val}} Influence",
    no_cash: "Insufficient Cash",
    no_cash_desc: "You don't have enough corporate cash to fund this campaign.",
    liaison_active: "Liaison Active",
    liaison_active_desc: "Your Washington influence has elevated your reputation!",
    subsidy: "Subsidy Secured!",
    subsidy_desc: "Received $15M federal R&D grant!",
    pac_funded: "PAC Funded",
    pac_funded_desc: "Lobbying Influence increased by +{{val}}!"
});

Object.assign(es.dashboard.lobbying, {
    bribe_senator: "💎 Sobornar un Senador",
    bribe_desc: "Pide un gran favor. Fuerza un Mercado Alcista por 12 meses.",
    force_bull: "📈 Forzar Mercado Alcista",
    influence_score: "Puntuación de Influencia",
    capture_pct: "Porcentaje de captura regulatoria",
    tier1: "Nivel 1 (30+): Protección de Auditoría",
    tier1_perk: "-50% Riesgo de Crisis",
    tier2: "Nivel 2 (70+): Captura Regulatoria Total",
    tier2_perk: "+15% Crédito Fiscal Mensual",
    initiatives: "Iniciativas y Campañas de Lobbying",
    k_street: "Firma de K-Street",
    k_street_cost: "-$2M Efectivo Corporativo",
    pac: "Contribución PAC Dirigida",
    pac_cost: "-$10M Efectivo Corporativo",
    liaison: "Enlace Regulatorio Federal",
    liaison_cost: "-$20M Efectivo Corporativo · Sube Reputación",
    coalition: "Patrocinio de Coalición Bipartidista",
    coalition_cost: "-$50M Efectivo Corporativo · Asegura $15M",
    add_infl: "+{{val}} Influencia",
    no_cash: "Efectivo Insuficiente",
    no_cash_desc: "No tienes suficiente efectivo para fondear esto.",
    liaison_active: "Enlace Activo",
    liaison_active_desc: "¡Tu influencia elevó tu reputación!",
    subsidy: "¡Subsidio Conseguido!",
    subsidy_desc: "¡Recibiste $15M de subsidio I+D!",
    pac_funded: "PAC Fondeado",
    pac_funded_desc: "¡Influencia incrementó en +{{val}}!"
});

Object.assign(de.dashboard.lobbying, {
    bribe_senator: "💎 Senator bestechen",
    bribe_desc: "Einen riesigen Gefallen einfordern. Erzwingt 12 Monate Bullenmarkt.",
    force_bull: "📈 Bullenmarkt erzwingen",
    influence_score: "Einfluss-Score",
    capture_pct: "Prozentsatz der regulatorischen Kontrolle",
    tier1: "Stufe 1 (30+): Prüfungsschutz",
    tier1_perk: "-50% Krisenwahrscheinlichkeit",
    tier2: "Stufe 2 (70+): Komplette Kontrolle",
    tier2_perk: "+15% Mtl. Steuergutschrift",
    initiatives: "Lobbying Initiativen & Kampagnen",
    k_street: "K-Street Kanzlei",
    k_street_cost: "-$2M Unternehmensbargeld",
    pac: "PAC-Beitrag",
    pac_cost: "-$10M Unternehmensbargeld",
    liaison: "Bundesbehörden-Liaison",
    liaison_cost: "-$20M Unternehmensbargeld · Erhöht Ruf",
    coalition: "Überparteiliche Koalition",
    coalition_cost: "-$50M Unternehmensbargeld · Sichert $15M Bundeszuschuss",
    add_infl: "+{{val}} Einfluss",
    no_cash: "Zu wenig Geld",
    no_cash_desc: "Nicht genug Unternehmensbargeld.",
    liaison_active: "Liaison Aktiv",
    liaison_active_desc: "Dein Washington-Einfluss hat deinen Ruf gesteigert!",
    subsidy: "Zuschuss gesichert!",
    subsidy_desc: "$15M F&E Bundeszuschuss erhalten!",
    pac_funded: "PAC finanziert",
    pac_funded_desc: "Einfluss um +{{val}} gestiegen!"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Fines and Lobbying locales added.');
