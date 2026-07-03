#!/usr/bin/env node
/**
 * Add the remaining missing core dashboard string keys to locale files.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const enPath = path.join(ROOT, 'src/locales/en.json');
const esPath = path.join(ROOT, 'src/locales/es.json');
const dePath = path.join(ROOT, 'src/locales/de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// ── dashboard.core missing keys ──
en.dashboard.core.journey_begins = "Your journey begins";
en.dashboard.core.timeline_empty = "Take actions below or advance to the next month";

es.dashboard.core.journey_begins = "Tu viaje comienza";
es.dashboard.core.timeline_empty = "Toma acciones abajo o avanza al siguiente mes";

de.dashboard.core.journey_begins = "Deine Reise beginnt";
de.dashboard.core.timeline_empty = "Führe Aktionen durch oder gehe zum nächsten Monat";

// ── Top header event labels ──
if (!en.dashboard.top_header) en.dashboard.top_header = {};
if (!es.dashboard.top_header) es.dashboard.top_header = {};
if (!de.dashboard.top_header) de.dashboard.top_header = {};

if (!en.dashboard.top_header.event_labels) en.dashboard.top_header.event_labels = {
    funding: "Funding",
    crisis: "Crisis",
    win: "Win",
    team: "Team",
    milestone: "Milestone",
    market: "Market",
    event: "Event"
};
if (!es.dashboard.top_header.event_labels) es.dashboard.top_header.event_labels = {
    funding: "Financiación",
    crisis: "Crisis",
    win: "Logro",
    team: "Equipo",
    milestone: "Hito",
    market: "Mercado",
    event: "Evento"
};
if (!de.dashboard.top_header.event_labels) de.dashboard.top_header.event_labels = {
    funding: "Finanzierung",
    crisis: "Krise",
    win: "Erfolg",
    team: "Team",
    milestone: "Meilenstein",
    market: "Markt",
    event: "Ereignis"
};

// Ensure month_num and now keys exist
en.dashboard.top_header.month_num = en.dashboard.top_header.month_num || "Month {{month}}";
en.dashboard.top_header.now = en.dashboard.top_header.now || "Now";
es.dashboard.top_header.month_num = es.dashboard.top_header.month_num || "Mes {{month}}";
es.dashboard.top_header.now = es.dashboard.top_header.now || "Ahora";
de.dashboard.top_header.month_num = de.dashboard.top_header.month_num || "Monat {{month}}";
de.dashboard.top_header.now = de.dashboard.top_header.now || "Jetzt";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('✅ Added remaining dashboard string keys!');
