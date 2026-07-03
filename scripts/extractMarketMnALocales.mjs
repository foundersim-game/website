import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.market) en.dashboard.market = {};
if (!es.dashboard.market) es.dashboard.market = {};
if (!de.dashboard.market) de.dashboard.market = {};

if (!en.dashboard.manda) en.dashboard.manda = {};
if (!es.dashboard.manda) es.dashboard.manda = {};
if (!de.dashboard.manda) de.dashboard.manda = {};

Object.assign(en.dashboard.market, {
    title: "Market",
    desc: "Analyze and acquire competitors.",
    quiet: "The market is quiet... for now.",
    sentiment: "Sentiment:",
    valuation: "Valuation",
    users: "Users",
    velocity: "Velocity",
    battle_actions: "Battle Actions",
    hostile_takeover: "Hostile Takeover Chadly for {{amount}}",
    last_intel: "Last Intel:",
    success: "success",
    last_move: "Last Move:",
    due_diligence_intel: "Due Diligence Intel",
    integration_risk: "Integration Risk:",
    financial_health: "Financial Health:",
    risk_high: "⚠️ Flight risk and tech fragmentation. Est. -20 Team Morale.",
    risk_med: "⚠️ Redundancies, moderate friction. Est. -10 Team Morale.",
    risk_low: "✅ Culture fit, clean stack. Est. +5 Team Morale boost.",
    run_dd: "🔬 Run Due Diligence ({{amount}})",
    gather_intel: "🕵️ Gather Intel (Ad)",
    takeover_public: "🦈 Takeover Public Rival for {{amount}}",
    buyout_rival: "🦈 Buyout Rival for {{amount}}",
    espionage_success: "Corporate Espionage Successful!",
    espionage_desc: "Integration risk lowered to 'Low' and valuation reduced by 10%.",
    no_cash: "Not enough corporate cash!",
    dd_complete: "Due Diligence Complete",
    dd_desc: "Unlocked intelligence report for {{name}}"
});

Object.assign(es.dashboard.market, {
    title: "Mercado",
    desc: "Analiza y adquiere competidores.",
    quiet: "El mercado está tranquilo... por ahora.",
    sentiment: "Sentimiento:",
    valuation: "Valoración",
    users: "Usuarios",
    velocity: "Velocidad",
    battle_actions: "Acciones de Batalla",
    hostile_takeover: "Adquisición Hostil de Chadly por {{amount}}",
    last_intel: "Última Info:",
    success: "éxito",
    last_move: "Último Movimiento:",
    due_diligence_intel: "Info de Due Diligence",
    integration_risk: "Riesgo de Integración:",
    financial_health: "Salud Financiera:",
    risk_high: "⚠️ Riesgo de fuga. Est. -20 Moral del Equipo.",
    risk_med: "⚠️ Fricción moderada. Est. -10 Moral del Equipo.",
    risk_low: "✅ Buen ajuste. Est. +5 Impulso de Moral.",
    run_dd: "🔬 Hacer Due Diligence ({{amount}})",
    gather_intel: "🕵️ Recopilar Info (Anuncio)",
    takeover_public: "🦈 Adquirir Rival Público por {{amount}}",
    buyout_rival: "🦈 Comprar Rival por {{amount}}",
    espionage_success: "¡Espionaje Corporativo Exitoso!",
    espionage_desc: "Riesgo de integración bajó a 'Bajo' y valoración reducida en 10%.",
    no_cash: "¡Sin efectivo suficiente!",
    dd_complete: "Due Diligence Completo",
    dd_desc: "Reporte de inteligencia desbloqueado para {{name}}"
});

Object.assign(de.dashboard.market, {
    title: "Markt",
    desc: "Wettbewerber analysieren und übernehmen.",
    quiet: "Der Markt ist ruhig... vorerst.",
    sentiment: "Stimmung:",
    valuation: "Bewertung",
    users: "Nutzer",
    velocity: "Geschwindigkeit",
    battle_actions: "Kampfaktionen",
    hostile_takeover: "Feindliche Übernahme von Chadly für {{amount}}",
    last_intel: "Letzte Info:",
    success: "Erfolg",
    last_move: "Letzter Zug:",
    due_diligence_intel: "Due Diligence Info",
    integration_risk: "Integrationsrisiko:",
    financial_health: "Finanzielle Gesundheit:",
    risk_high: "⚠️ Fluchtrisiko. Ca. -20 Team Moral.",
    risk_med: "⚠️ Mittlere Reibung. Ca. -10 Team Moral.",
    risk_low: "✅ Gute Passform. Ca. +5 Team Moral.",
    run_dd: "🔬 Due Diligence durchführen ({{amount}})",
    gather_intel: "🕵️ Info sammeln (Werbung)",
    takeover_public: "🦈 Öffentlichen Rivalen übernehmen für {{amount}}",
    buyout_rival: "🦈 Rivalen auskaufen für {{amount}}",
    espionage_success: "Unternehmensspionage erfolgreich!",
    espionage_desc: "Integrationsrisiko auf 'Niedrig' gesenkt, Bewertung um 10% reduziert.",
    no_cash: "Nicht genug Geld!",
    dd_complete: "Due Diligence abgeschlossen",
    dd_desc: "Geheimdienstbericht für {{name}} freigeschaltet"
});


Object.assign(en.dashboard.manda, {
    strategy_title: "🦈 M&A Strategy",
    strategy_desc: "Acquire active market assets to scale your corporate treasury and operations.",
    scan_market: "Scan Market",
    scan_market_desc: "Find potential acquisition targets scaled to your current valuation.",
    scan_btn: "Scan Market for Targets",
    rescan: "⟳ Rescan Market",
    titan_off: "Titan -50% Off",
    dd_report: "Due Diligence Report",
    true_value: "True Value:",
    fin_health: "Financial Health:",
    integration_risk: "Integration Risk:",
    risk_high: "⚠️ Fragmented tech stack, flight risk of core team. Est. -20 Team Morale impact on merge.",
    risk_med: "⚠️ Moderate culture clash, redundant roles to consolidate. Est. -10 Team Morale.",
    risk_low: "✅ Clean codebase, shared tech stack. Est. +5 Team Morale boost.",
    run_dd: "Due Diligence ({{amount}})",
    acquire_btn: "Acquire · {{amount}}",
    no_cash_dd: "Insufficient cash for Due Diligence.",
    dd_completed: "Due Diligence Completed",
    dd_desc: "Revealed hidden metrics for {{name}}.",
    no_cash_acq: "Insufficient cash for this acquisition.",
    acq_complete: "Acquisition Complete",
    acq_desc: "{{name}} is now a subsidiary."
});

Object.assign(es.dashboard.manda, {
    strategy_title: "🦈 Estrategia M&A",
    strategy_desc: "Adquiere activos de mercado para escalar tu tesorería.",
    scan_market: "Escanear Mercado",
    scan_market_desc: "Encuentra objetivos de adquisición potenciales.",
    scan_btn: "Escanear Objetivos",
    rescan: "⟳ Reescanear Mercado",
    titan_off: "Titan -50% Dcto",
    dd_report: "Reporte Due Diligence",
    true_value: "Valor Real:",
    fin_health: "Salud Financiera:",
    integration_risk: "Riesgo Integración:",
    risk_high: "⚠️ Riesgo alto. Est. -20 Moral en fusión.",
    risk_med: "⚠️ Choque cultural moderado. Est. -10 Moral.",
    risk_low: "✅ Código limpio. Est. +5 Moral.",
    run_dd: "Due Diligence ({{amount}})",
    acquire_btn: "Adquirir · {{amount}}",
    no_cash_dd: "Efectivo insuficiente para Due Diligence.",
    dd_completed: "Due Diligence Completado",
    dd_desc: "Métricas ocultas reveladas para {{name}}.",
    no_cash_acq: "Efectivo insuficiente para adquisición.",
    acq_complete: "Adquisición Completa",
    acq_desc: "{{name}} ahora es tu filial."
});

Object.assign(de.dashboard.manda, {
    strategy_title: "🦈 M&A Strategie",
    strategy_desc: "Erwirb Marktwerte zur Skalierung.",
    scan_market: "Markt scannen",
    scan_market_desc: "Finde potenzielle Übernahmeziele.",
    scan_btn: "Nach Zielen suchen",
    rescan: "⟳ Erneut suchen",
    titan_off: "Titan -50% Rabatt",
    dd_report: "Due Diligence Bericht",
    true_value: "Wahrer Wert:",
    fin_health: "Finanzielle Gesundheit:",
    integration_risk: "Integrationsrisiko:",
    risk_high: "⚠️ Hohes Risiko. Ca. -20 Moral.",
    risk_med: "⚠️ Moderater Kulturclash. Ca. -10 Moral.",
    risk_low: "✅ Sauberer Code. Ca. +5 Moral.",
    run_dd: "Due Diligence ({{amount}})",
    acquire_btn: "Übernehmen · {{amount}}",
    no_cash_dd: "Zu wenig Geld für Due Diligence.",
    dd_completed: "Due Diligence Abgeschlossen",
    dd_desc: "Versteckte Metriken für {{name}} aufgedeckt.",
    no_cash_acq: "Zu wenig Geld für Übernahme.",
    acq_complete: "Übernahme Abgeschlossen",
    acq_desc: "{{name}} ist jetzt deine Tochtergesellschaft."
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Market and M&A locales added.');
