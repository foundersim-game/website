#!/usr/bin/env node
/**
 * Add event_modal translations and any other missing top-level keys to locale files.
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

// ── EventModal strings ──
en.event_modal = {
    dynamic_event: "Dynamic Event",
    analysis_complete: "Analysis Complete",
    the_outcome: "The Outcome",
    acknowledged: "Acknowledged"
};
es.event_modal = {
    dynamic_event: "Evento Dinámico",
    analysis_complete: "Análisis Completo",
    the_outcome: "El Resultado",
    acknowledged: "Reconocido"
};
de.event_modal = {
    dynamic_event: "Dynamisches Ereignis",
    analysis_complete: "Analyse Abgeschlossen",
    the_outcome: "Das Ergebnis",
    acknowledged: "Bestätigt"
};

// ── Month simulation loading screen strings ──
// These appear in the "SIMULATING MONTH X..." loading screen
en.simulation = {
    simulating_month: "Simulating Month {{month}}...",
    running_gtm: "Running GTM Strategy · Synthesizing Market Data"
};
es.simulation = {
    simulating_month: "Simulando Mes {{month}}...",
    running_gtm: "Ejecutando Estrategia GTM · Sintetizando Datos de Mercado"
};
de.simulation = {
    simulating_month: "Simuliere Monat {{month}}...",
    running_gtm: "GTM-Strategie ausführen · Marktdaten synthetisieren"
};

// ── Timeline/History event strings (shown in dashboard event list) ──
// These are hardcoded template literals in page.tsx so we can't translate them
// easily - but we can at least ensure the dashboard label "EVENTO" is translated
en.dashboard.timeline_event_label = "Event";
es.dashboard.timeline_event_label = "Evento";
de.dashboard.timeline_event_label = "Ereignis";

// ── Make sure product and marketing actions have ES translations ──
// (actions section already copied in previous script)

// ── Add missing month advance button ──  
en.dashboard.advance_month = en.dashboard.advance_month || "Advance to Month {{month}} →";
es.dashboard.advance_month = es.dashboard.advance_month || "Avanzar al Mes {{month}} →";
de.dashboard.advance_month = de.dashboard.advance_month || "Weiter zu Monat {{month}} →";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('✅ Added event_modal and simulation translations!');
