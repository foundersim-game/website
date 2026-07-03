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
if (!en.dashboard.menu) en.dashboard.menu = {};
if (!es.dashboard.menu) es.dashboard.menu = {};
if (!de.dashboard.menu) de.dashboard.menu = {};

en.dashboard.menu.terminals = {
    operations: "🏢 Operations",
    strategy: "📈 Strategy",
    founder: "👤 Founder",
    corporate: "🏛️ Corporate"
};
es.dashboard.menu.terminals = {
    operations: "🏢 Operaciones",
    strategy: "📈 Estrategia",
    founder: "👤 Fundador",
    corporate: "🏛️ Corporativo"
};
de.dashboard.menu.terminals = {
    operations: "🏢 Operationen",
    strategy: "📈 Strategie",
    founder: "👤 Gründer",
    corporate: "🏛️ Unternehmen"
};

en.dashboard.menu.categories = {
    product_desc: "Build & manage tech",
    marketing_desc: "Acquire users",
    hiring_desc: "Recruit & manage team",
    stats_desc: "Financials & metrics",
    market_desc: "Attack competitors",
    analysts_desc: "Public relations",
    manda_acquire_desc: "M&A acquisition",
    subsidiary_desc: "Subsidiary oversight",
    options_desc: "ESOP & Stock Grants",
    funding_desc: "Raise capital",
    board_mgmt_desc: "Manage board",
    fines_desc: "Settle lawsuits",
    lobbying_desc: "Influence regulations",
    buyback_desc: "Share buybacks",
    corporate_debt_desc: "Venture debt & bonds",
    founder_desc: "Manage energy",
    lifestyle_desc: "Luxury assets & perks",
    philanthropy_desc: "Charity for reputation",
    margin_loan_desc: "Borrow against stock",
    b51_desc: "Automated trading"
};

es.dashboard.menu.categories = {
    product_desc: "Crear y gestionar tech",
    marketing_desc: "Adquirir usuarios",
    hiring_desc: "Reclutar y gestionar",
    stats_desc: "Finanzas y métricas",
    market_desc: "Atacar competidores",
    analysts_desc: "Relaciones públicas",
    manda_acquire_desc: "Adquisiciones M&A",
    subsidiary_desc: "Gestión de filiales",
    options_desc: "Opciones y acciones",
    funding_desc: "Levantar capital",
    board_mgmt_desc: "Gestionar junta",
    fines_desc: "Resolver demandas",
    lobbying_desc: "Influencia y leyes",
    buyback_desc: "Recomprar acciones",
    corporate_debt_desc: "Deuda y bonos",
    founder_desc: "Gestionar energía",
    lifestyle_desc: "Lujos y beneficios",
    philanthropy_desc: "Caridad y reputación",
    margin_loan_desc: "Pedir prestado",
    b51_desc: "Trading automático"
};

de.dashboard.menu.categories = {
    product_desc: "Tech entwickeln",
    marketing_desc: "Nutzer gewinnen",
    hiring_desc: "Team rekrutieren",
    stats_desc: "Finanzen & Metriken",
    market_desc: "Konkurrenz angreifen",
    analysts_desc: "Öffentlichkeitsarbeit",
    manda_acquire_desc: "M&A Übernahmen",
    subsidiary_desc: "Tochtergesellschaft",
    options_desc: "ESOP & Aktien",
    funding_desc: "Kapital beschaffen",
    board_mgmt_desc: "Vorstand verwalten",
    fines_desc: "Klagen beilegen",
    lobbying_desc: "Gesetze beeinflussen",
    buyback_desc: "Aktienrückkauf",
    corporate_debt_desc: "Anleihen & Schulden",
    founder_desc: "Energie verwalten",
    lifestyle_desc: "Luxus & Vorteile",
    philanthropy_desc: "Spenden & Image",
    margin_loan_desc: "Gegen Aktien leihen",
    b51_desc: "Autohandel (10b51)"
};

en.dashboard.menu.locks = {
    locked_module: "Locked Module",
    unlocks_post_ipo: "Unlocks Post-IPO",
    feature_unlocks_later: "This feature unlocks at a later corporate stage."
};
es.dashboard.menu.locks = {
    locked_module: "Módulo Bloqueado",
    unlocks_post_ipo: "Se desbloquea tras IPO",
    feature_unlocks_later: "Esta función se desbloquea en una etapa corporativa posterior."
};
de.dashboard.menu.locks = {
    locked_module: "Gesperrtes Modul",
    unlocks_post_ipo: "Wird nach IPO freigeschaltet",
    feature_unlocks_later: "Diese Funktion wird in einer späteren Unternehmensphase freigeschaltet."
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Menu locales added.');
