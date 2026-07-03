#!/usr/bin/env node
/**
 * Add competitors translations to all locale files.
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

en.competitors = {
    rival_move: "Rival Move",
    poached: "Poached",
    lost_team_member: "You lost a valuable team member.",
    action: {
        price_cut: "slashed their prices by 40%! Growth is accelerating.",
        feature_launch: "launched a new platform feature you don't have yet!",
        ai_pivot: "just announced a pivot to 'AI-First' architecture.",
        massive_marketing: "is running a massive ad campaign targeting your users.",
        vulture_talent: "is aggressively poaching your top talent with high bonuses.",
        press_attack: "published a hit-piece on your recent downtime."
    }
};
es.competitors = {
    rival_move: "Movimiento Rival",
    poached: "Captado",
    lost_team_member: "Perdiste un valioso miembro del equipo.",
    action: {
        price_cut: "redujo sus precios un 40%! El crecimiento se acelera.",
        feature_launch: "lanzó una nueva función de plataforma que tú no tienes aún.",
        ai_pivot: "acaba de anunciar un giro hacia arquitectura 'AI-First'.",
        massive_marketing: "está ejecutando una campaña publicitaria masiva dirigida a tus usuarios.",
        vulture_talent: "está captando agresivamente tu mejor talento con altos bonos.",
        press_attack: "publicó un artículo negativo sobre tu reciente caída."
    }
};
de.competitors = {
    rival_move: "Rivalenzug",
    poached: "Abgeworben",
    lost_team_member: "Du hast ein wertvolles Teammitglied verloren.",
    action: {
        price_cut: "hat ihre Preise um 40% gesenkt! Das Wachstum beschleunigt sich.",
        feature_launch: "hat eine neue Plattformfunktion gestartet, die du noch nicht hast!",
        ai_pivot: "hat gerade einen Schwenk zur 'KI-First'-Architektur angekündigt.",
        massive_marketing: "führt eine massive Werbekampagne durch, die auf deine Nutzer abzielt.",
        vulture_talent: "wirbt aggressiv dein Top-Talent mit hohen Boni ab.",
        press_attack: "hat einen negativen Artikel über deine jüngste Ausfallzeit veröffentlicht."
    }
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('✅ Added competitor translations!');
