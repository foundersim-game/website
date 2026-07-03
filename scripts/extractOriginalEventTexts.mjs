#!/usr/bin/env node
/**
 * Extract original English event texts from git history and populate locale files.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const enPath = path.join(ROOT, 'src/locales/en.json');
const esPath = path.join(ROOT, 'src/locales/es.json');
const dePath = path.join(ROOT, 'src/locales/de.json');

// Get original events.ts from git history (before i18n keys were introduced)
let origSource = '';
try {
    // Try HEAD~1
    origSource = execSync('git show HEAD~1:src/lib/engine/events.ts', { cwd: ROOT }).toString();
    console.log('Got original events.ts from HEAD~1');
} catch(e) {
    try {
        origSource = execSync('git show HEAD~2:src/lib/engine/events.ts', { cwd: ROOT }).toString();
        console.log('Got original events.ts from HEAD~2');
    } catch(e2) {
        console.log('Cannot get from git, using current source (keys only)');
    }
}

const currentSource = fs.readFileSync(path.join(ROOT, 'src/lib/engine/events.ts'), 'utf8');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.events) en.events = {};
if (!es.events) es.events = {};
if (!de.events) de.events = {};

if (origSource) {
    // Parse original source: extract event objects
    // Use a state-machine approach to parse the event objects
    
    // Extract all event_id, title, description, and choice texts
    const eventIdPattern = /event_id:\s*"([^"]+)"/g;
    const titlePattern = /title:\s*"([^"]+)"/g;
    const descPattern = /description:\s*"([^"]+)"/g;
    const choiceTextPattern = /\{\s*text:\s*"([^"]+)"/g;
    
    // Current events.ts patterns (with keys)
    const curEventIdPattern = /event_id:\s*"([^"]+)"/g;
    const curTitlePattern = /title:\s*"(events\.[^"]+)"/g;
    const curDescPattern = /description:\s*"(events\.[^"]+)"/g;
    const curChoicePattern = /\{\s*text:\s*"(events\.[^"]+)"/g;
    
    const origTitles = [];
    const origDescs = [];
    const origChoices = [];
    
    let m;
    while ((m = titlePattern.exec(origSource)) !== null) origTitles.push(m[1]);
    while ((m = descPattern.exec(origSource)) !== null) origDescs.push(m[1]);
    while ((m = choiceTextPattern.exec(origSource)) !== null) origChoices.push(m[1]);
    
    const curTitleKeys = [];
    const curDescKeys = [];
    const curChoiceKeys = [];
    
    while ((m = curTitlePattern.exec(currentSource)) !== null) curTitleKeys.push(m[1]);
    while ((m = curDescPattern.exec(currentSource)) !== null) curDescKeys.push(m[1]);
    while ((m = curChoicePattern.exec(currentSource)) !== null) curChoiceKeys.push(m[1]);
    
    console.log(`Found ${origTitles.length} original titles, ${curTitleKeys.length} key titles`);
    console.log(`Found ${origDescs.length} original descs, ${curDescKeys.length} key descs`);
    console.log(`Found ${origChoices.length} original choices, ${curChoiceKeys.length} key choices`);
    
    // Map keys to original texts
    curTitleKeys.forEach((key, i) => {
        if (origTitles[i]) {
            const flatKey = key.replace('events.', '');
            en.events[flatKey] = origTitles[i];
            if (!es.events[flatKey] || es.events[flatKey] === en.events[flatKey]) es.events[flatKey] = origTitles[i];
            if (!de.events[flatKey] || de.events[flatKey] === en.events[flatKey]) de.events[flatKey] = origTitles[i];
        }
    });
    
    curDescKeys.forEach((key, i) => {
        if (origDescs[i]) {
            const flatKey = key.replace('events.', '');
            en.events[flatKey] = origDescs[i];
            if (!es.events[flatKey] || es.events[flatKey] === en.events[flatKey]) es.events[flatKey] = origDescs[i];
            if (!de.events[flatKey] || de.events[flatKey] === en.events[flatKey]) de.events[flatKey] = origDescs[i];
        }
    });
    
    curChoiceKeys.forEach((key, i) => {
        if (origChoices[i]) {
            const flatKey = key.replace('events.', '');
            en.events[flatKey] = origChoices[i];
            if (!es.events[flatKey] || es.events[flatKey] === en.events[flatKey]) es.events[flatKey] = origChoices[i];
            if (!de.events[flatKey] || de.events[flatKey] === en.events[flatKey]) de.events[flatKey] = origChoices[i];
        }
    });
    
    console.log(`✅ Mapped ${Object.keys(en.events).length} event translations from original source`);
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('✅ Done!');
