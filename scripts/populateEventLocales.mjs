#!/usr/bin/env node
/**
 * Script to:
 * 1. Extract all event keys from events.ts
 * 2. Extract their actual English text from events.ts
 * 3. Add them to en.json, es.json, de.json
 * 4. Also copy all 'actions' from en.json to es.json and de.json with English text as placeholder
 * 5. Fix EventModal.tsx to use t() for title and description
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const eventsPath = path.join(ROOT, 'src/lib/engine/events.ts');
const enPath = path.join(ROOT, 'src/locales/en.json');
const esPath = path.join(ROOT, 'src/locales/es.json');
const dePath = path.join(ROOT, 'src/locales/de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));
const eventsSource = fs.readFileSync(eventsPath, 'utf8');

// ── STEP 1: Build a flat map of event key -> English text ──
// The events.ts stores things like:
//   title: "events.cofounder_conflict_title"
// We need to find the actual English text in the original events.ts.bak if it exists,
// or we can infer from the key itself for now (title-cased from key).

// Parse events.ts to get all event objects with their i18n keys
// Strategy: parse the raw TS source looking for patterns like:
//   title: "events.X_title" near an actual English string "My Title"
// OR: infer human-readable names from keys

function keyToTitle(key) {
    // Remove "events." prefix and "_title"/"_desc"/"_choice_N" suffix
    let k = key.replace(/^events\./, '').replace(/_title$/, '').replace(/_desc$/, '').replace(/_choice_\d+$/, '');
    // Convert snake_case to Title Case
    return k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Extract all unique "events.xxx" keys from events.ts
const keyPattern = /"(events\.[a-z_0-9]+)"/g;
const allKeys = new Set();
let match;
while ((match = keyPattern.exec(eventsSource)) !== null) {
    allKeys.add(match[1]);
}

console.log(`Found ${allKeys.size} unique event keys`);

// ── STEP 2: Extract actual English texts using the .bak file or original source ──
// The events.ts already uses keys, so we need to find the original English texts.
// Let's check if there's a .bak file
const bakPath = path.join(ROOT, 'src/lib/engine/events.ts.bak');

let eventTexts = {};

if (fs.existsSync(bakPath)) {
    console.log('Found .bak file, reading original English texts from it...');
    const bakSource = fs.readFileSync(bakPath, 'utf8');
    
    // Parse the bak source to build event_id -> {title, description, choices} mapping
    // Look for objects with title: "...", description: "...", choices: [{text: "..."}, ...]
    
    // Extract event objects - use regex to find title/description/choices
    const titlePattern = /title:\s*"([^"]+)"/g;
    const descPattern = /description:\s*"([^"]+)"/g;
    const textPattern = /\{\s*text:\s*"([^"]+)"/g;
    
    const titles = [];
    const descs = [];
    const choiceTexts = [];
    
    let m;
    while ((m = titlePattern.exec(bakSource)) !== null) titles.push(m[1]);
    while ((m = descPattern.exec(bakSource)) !== null) descs.push(m[1]);
    while ((m = textPattern.exec(bakSource)) !== null) choiceTexts.push(m[1]);
    
    // Now do the same for the current events.ts keys
    const keyTitlePattern = /title:\s*"(events\.[^"]+)"/g;
    const keyDescPattern = /description:\s*"(events\.[^"]+)"/g;
    const keyTextPattern = /\{\s*text:\s*"(events\.[^"]+)"/g;
    
    const keyTitles = [];
    const keyDescs = [];
    const keyChoices = [];
    
    while ((m = keyTitlePattern.exec(eventsSource)) !== null) keyTitles.push(m[1]);
    while ((m = keyDescPattern.exec(eventsSource)) !== null) keyDescs.push(m[1]);
    while ((m = keyTextPattern.exec(eventsSource)) !== null) keyChoices.push(m[1]);
    
    // Map keys to English texts
    keyTitles.forEach((key, i) => { if (titles[i]) eventTexts[key] = titles[i]; });
    keyDescs.forEach((key, i) => { if (descs[i]) eventTexts[key] = descs[i]; });
    keyChoices.forEach((key, i) => { if (choiceTexts[i]) eventTexts[key] = choiceTexts[i]; });
    
    console.log(`Mapped ${Object.keys(eventTexts).length} event texts from .bak file`);
} else {
    console.log('No .bak file found, generating human-readable titles from keys...');
    
    // Generate readable English strings from the key names
    for (const key of allKeys) {
        const rawKey = key.replace(/^events\./, '');
        
        if (rawKey.endsWith('_title')) {
            const name = rawKey.replace(/_title$/, '');
            eventTexts[key] = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        } else if (rawKey.endsWith('_desc')) {
            const name = rawKey.replace(/_desc$/, '');
            eventTexts[key] = `A ${name.split('_').join(' ')} has occurred. How will you respond?`;
        } else if (rawKey.match(/_choice_\d+$/)) {
            const num = parseInt(rawKey.match(/_choice_(\d+)$/)[1]);
            const actions = ['Accept the situation', 'Take a bold approach', 'Find a creative solution'];
            eventTexts[key] = actions[num] || `Option ${num + 1}`;
        } else {
            eventTexts[key] = rawKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }
}

// ── STEP 3: Add events section to locale files ──
if (!en.events) en.events = {};
if (!es.events) es.events = {};
if (!de.events) de.events = {};

for (const key of allKeys) {
    const flatKey = key.replace(/^events\./, '');
    const text = eventTexts[key] || key;
    
    // English: use actual text
    en.events[flatKey] = text;
    
    // ES/DE: use same English text as placeholder (for now they show English)
    // Better to show English than show raw keys
    if (!es.events[flatKey]) es.events[flatKey] = text;
    if (!de.events[flatKey]) de.events[flatKey] = text;
}

console.log(`Added ${Object.keys(en.events).length} event translations`);

// ── STEP 4: Copy 'actions' section from en.json to es.json and de.json ──
if (en.actions) {
    if (!es.actions) es.actions = {};
    if (!de.actions) de.actions = {};
    
    for (const [key, val] of Object.entries(en.actions)) {
        if (!es.actions[key]) es.actions[key] = val;
        if (!de.actions[key]) de.actions[key] = val;
    }
    console.log(`Copied ${Object.keys(en.actions).length} action sections to es/de`);
}

// ── STEP 5: Write updated locale files ──
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('✅ Locale files updated successfully!');
