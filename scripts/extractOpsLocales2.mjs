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
if (!en.dashboard.ops.stats) en.dashboard.ops.stats = {};
if (!es.dashboard.ops.stats) es.dashboard.ops.stats = {};
if (!de.dashboard.ops.stats) de.dashboard.ops.stats = {};

Object.assign(en.dashboard.ops.stats, {
    title: "Stats",
    tap_explain: "Tap any card or label for a plain-english explanation",
    rev_model: "💵 Your Revenue Model —",
    legend: "Legend:",
    legend_good: "Good",
    legend_watch: "Watch",
    legend_danger: "Danger",
    profit: "Net Profit",
    profit_loss: "Net Loss",
    monthly_costs: "Monthly Costs",
    runway_desc: "{{months}}m runway",
    runway_inf: "Infinite runway",
    cogs: "COGS",
    opex: "OPEX"
});

Object.assign(es.dashboard.ops.stats, {
    title: "Estadísticas",
    tap_explain: "Toca cualquier tarjeta o etiqueta para ver una explicación sencilla",
    rev_model: "💵 Tu Modelo de Ingresos —",
    legend: "Leyenda:",
    legend_good: "Bien",
    legend_watch: "Alerta",
    legend_danger: "Peligro",
    profit: "Beneficio Neto",
    profit_loss: "Pérdida Neta",
    monthly_costs: "Costos Mensuales",
    runway_desc: "{{months}}m de runway",
    runway_inf: "Runway infinito",
    cogs: "COGS",
    opex: "OPEX"
});

Object.assign(de.dashboard.ops.stats, {
    title: "Statistiken",
    tap_explain: "Tippe auf eine Karte oder ein Label für eine einfache Erklärung",
    rev_model: "💵 Dein Umsatzmodell —",
    legend: "Legende:",
    legend_good: "Gut",
    legend_watch: "Beobachten",
    legend_danger: "Gefahr",
    profit: "Nettogewinn",
    profit_loss: "Nettoverlust",
    monthly_costs: "Monatliche Kosten",
    runway_desc: "{{months}}m Runway",
    runway_inf: "Unendlicher Runway",
    cogs: "COGS",
    opex: "OPEX"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Stats locales updated.');
