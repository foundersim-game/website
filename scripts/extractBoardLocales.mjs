import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.board) en.dashboard.board = {};
if (!es.dashboard.board) es.dashboard.board = {};
if (!de.dashboard.board) de.dashboard.board = {};

Object.assign(en.dashboard.board, {
    title: "Board of Directors",
    desc: "Execute high-level corporate governance actions.",
    stock_split: "2-for-1 Stock Split",
    stock_split_desc: "Halves share price, doubles share count. Boosts retail sentiment.",
    stock_split_req: "Req $50+",
    stock_split_execute: "Execute",
    split_executed: "Stock Split Executed",
    split_executed_desc: "Retail investors are piling in!",
    no_cash: "Insufficient Corporate Cash",
    rejected: "The Board rejected the resolution: {{name}}",
    hostile_defense: "Hostile takeover defense active.",
    resolution_passed: "Resolution Passed",
    post_ipo: "Post-IPO",
    resolutions: {
        indep_director: {
            name: "Appoint Independent Director",
            desc: "Brings oversight. (+5 CEO Rep, +5 Brand)",
            btn: "Appoint"
        },
        retreat: {
            name: "Executive Retreat",
            desc: "Fully cures Founder Burnout. (0 Burnout)",
            btn: "Retreat"
        },
        rebrand: {
            name: "Rebrand Company",
            desc: "Major marketing overhaul. (+20 Brand Awareness)",
            btn: "Rebrand"
        },
        poison_pill: {
            name: "Adopt Poison Pill",
            desc: "Defends against hostile takeovers.",
            btn: "Adopt"
        }
    },
    costs_format: "Costs {{amount}}. {{desc}}"
});

Object.assign(es.dashboard.board, {
    title: "Junta Directiva",
    desc: "Ejecuta acciones de gobierno corporativo de alto nivel.",
    stock_split: "División de Acciones (2x1)",
    stock_split_desc: "Reduce el precio a la mitad, duplica las acciones. Atrae a inversores minoristas.",
    stock_split_req: "Req $50+",
    stock_split_execute: "Ejecutar",
    split_executed: "División de Acciones Ejecutada",
    split_executed_desc: "¡Los inversores minoristas están entrando!",
    no_cash: "Efectivo Corporativo Insuficiente",
    rejected: "La Junta rechazó la resolución: {{name}}",
    hostile_defense: "Defensa contra adquisición hostil activa.",
    resolution_passed: "Resolución Aprobada",
    post_ipo: "Post-IPO",
    resolutions: {
        indep_director: {
            name: "Nombrar Director Independiente",
            desc: "Aporta supervisión. (+5 Rep CEO, +5 Marca)",
            btn: "Nombrar"
        },
        retreat: {
            name: "Retiro Ejecutivo",
            desc: "Cura completamente el Burnout del Fundador.",
            btn: "Retiro"
        },
        rebrand: {
            name: "Renovar Marca",
            desc: "Renovación de marketing. (+20 Reconocimiento de Marca)",
            btn: "Renovar"
        },
        poison_pill: {
            name: "Adoptar Píldora Envenenada",
            desc: "Defiende contra adquisiciones hostiles.",
            btn: "Adoptar"
        }
    },
    costs_format: "Cuesta {{amount}}. {{desc}}"
});

Object.assign(de.dashboard.board, {
    title: "Vorstand",
    desc: "Hochrangige Unternehmensführungsmaßnahmen ausführen.",
    stock_split: "Aktiensplit 2-für-1",
    stock_split_desc: "Halbiert den Preis, verdoppelt die Aktien. Zieht Kleinanleger an.",
    stock_split_req: "Req $50+",
    stock_split_execute: "Ausführen",
    split_executed: "Aktiensplit Ausgeführt",
    split_executed_desc: "Kleinanleger strömen herbei!",
    no_cash: "Unzureichendes Unternehmensbargeld",
    rejected: "Der Vorstand lehnte die Resolution ab: {{name}}",
    hostile_defense: "Abwehr gegen feindliche Übernahme aktiv.",
    resolution_passed: "Resolution Verabschiedet",
    post_ipo: "Nach-IPO",
    resolutions: {
        indep_director: {
            name: "Unabhängigen Direktor ernennen",
            desc: "Bringt Aufsicht. (+5 CEO Ruf, +5 Marke)",
            btn: "Ernennen"
        },
        retreat: {
            name: "Vorstandsklausur",
            desc: "Heilt Gründer-Burnout vollständig.",
            btn: "Klausur"
        },
        rebrand: {
            name: "Umbenennung",
            desc: "Marketing-Überholung. (+20 Markenbekanntheit)",
            btn: "Umbenennen"
        },
        poison_pill: {
            name: "Giftpille annehmen",
            desc: "Verteidigt gegen feindliche Übernahmen.",
            btn: "Annehmen"
        }
    },
    costs_format: "Kostet {{amount}}. {{desc}}"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Board locales added.');
