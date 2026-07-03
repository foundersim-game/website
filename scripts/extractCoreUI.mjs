import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Adding Dashboard Core UI strings
const enAdditions = {
    "tab_operations": "Operations",
    "tab_strategy": "Strategy",
    "tab_founder": "Founder",
    "tab_corporate": "Corporate",
    "tab_markets": "Markets",
    "back": "Back",
    "simulate_month": "Simulating Month {month}...",
    "advance_month": "Advance to Month {month} ▶",
    "categories": {
        "product": "Product",
        "marketing": "Growth",
        "hiring": "Hire",
        "stats": "Stats",
        "market": "Rivals",
        "analysts": "PR/Comms",
        "manda_acquire": "Acquire",
        "subsidiary": "Manage",
        "options": "Options",
        "funding": "Funding",
        "board_mgmt": "Board",
        "fines": "Legal",
        "lobbying": "Lobbying",
        "buyback": "Buyback",
        "corporate_debt": "Debt",
        "founder": "Founder",
        "lifestyle": "Lifestyle",
        "philanthropy": "Donate",
        "margin_loan": "Margin",
        "10b51": "10b51"
    }
};

const esAdditions = {
    "tab_operations": "Operaciones",
    "tab_strategy": "Estrategia",
    "tab_founder": "Fundador",
    "tab_corporate": "Corporativo",
    "tab_markets": "Mercados",
    "back": "Atrás",
    "simulate_month": "Simulando Mes {month}...",
    "advance_month": "Avanzar al Mes {month} ▶",
    "categories": {
        "product": "Producto",
        "marketing": "Crecimiento",
        "hiring": "Contratar",
        "stats": "Estadísticas",
        "market": "Rivales",
        "analysts": "RRPP",
        "manda_acquire": "Adquirir",
        "subsidiary": "Gestionar",
        "options": "Opciones",
        "funding": "Financiar",
        "board_mgmt": "Junta",
        "fines": "Legal",
        "lobbying": "Lobby",
        "buyback": "Recompras",
        "corporate_debt": "Deuda",
        "founder": "Fundador",
        "lifestyle": "Estilo de Vida",
        "philanthropy": "Donar",
        "margin_loan": "Margen",
        "10b51": "10b51"
    }
};

const deAdditions = {
    "tab_operations": "Betrieb",
    "tab_strategy": "Strategie",
    "tab_founder": "Gründer",
    "tab_corporate": "Unternehmen",
    "tab_markets": "Märkte",
    "back": "Zurück",
    "simulate_month": "Simuliere Monat {month}...",
    "advance_month": "Weiter zu Monat {month} ▶",
    "categories": {
        "product": "Produkt",
        "marketing": "Wachstum",
        "hiring": "Einstellen",
        "stats": "Statistiken",
        "market": "Rivalen",
        "analysts": "PR/Komm.",
        "manda_acquire": "Übernehmen",
        "subsidiary": "Verwalten",
        "options": "Optionen",
        "funding": "Finanzierung",
        "board_mgmt": "Vorstand",
        "fines": "Recht",
        "lobbying": "Lobbying",
        "buyback": "Rückkäufe",
        "corporate_debt": "Schulden",
        "founder": "Gründer",
        "lifestyle": "Lebensstil",
        "philanthropy": "Spenden",
        "margin_loan": "Marge",
        "10b51": "10b51"
    }
};

en.dashboard.core = enAdditions;
es.dashboard.core = esAdditions;
de.dashboard.core = deAdditions;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("Dashboard core locales added.");
