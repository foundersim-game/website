import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.sheets) en.dashboard.sheets = {};
if (!es.dashboard.sheets) es.dashboard.sheets = {};
if (!de.dashboard.sheets) de.dashboard.sheets = {};

const newEn = {
    product: { title: "Product", desc: "Instant technical execution" },
    marketing: { title: "Marketing", desc: "Actions + Ongoing Programs" },
    funding: { title: "Funding", stage_sec: "Stage: SEC Quiet Period", stage_info: "Stage: {{stage}} · {{equity}}% founder equity" },
    public_markets: { title: "Public Markets", ticker_info: "Ticker: {{symbol}} · {{equity}}% founder equity" },
    founder: { focus_used: "⚡ {{used}}h / {{max}}h focus used this month" },
    market: { title: "Market & Rivals", desc: "Track your competition" },
    lifestyle: { title: "Personal Lifestyle", desc: "Spend your personal wealth" },
    margin: { title: "Margin Account", desc: "Personal Credit Terminal" },
    lobbying: { title: "Lobbying & Capture", desc: "Washington Influence Terminal" },
    buybacks: { title: "Buybacks", desc: "Capital Allocation Terminal" },
    b10b51: { title: "10b51 Plans", desc: "Automated Trading" },
    board: { title: "Board Management", desc: "Corporate Governance" },
    philanthropy: { title: "Philanthropy", desc: "Charitable Donations" },
    analysts: { title: "Analysts & PR", desc: "Manage Public Image" },
    fines: { title: "Fines & Lawsuits", desc: "Legal Department" },
    manda: { title: "M&A", desc: "Acquire Companies" },
    subsidiary: { title: "Subsidiary", desc: "Manage Child Companies" },
    debt: { title: "Corporate Debt", desc: "Manage Borrowing" },
    options: { title: "Options & ESOP", desc: "Manage Employee Equity" }
};

const newEs = {
    product: { title: "Producto", desc: "Ejecución técnica instantánea" },
    marketing: { title: "Marketing", desc: "Acciones + Programas" },
    funding: { title: "Financiación", stage_sec: "Etapa: Periodo de Silencio SEC", stage_info: "Etapa: {{stage}} · {{equity}}% acciones de fundador" },
    public_markets: { title: "Mercados Públicos", ticker_info: "Ticker: {{symbol}} · {{equity}}% acciones de fundador" },
    founder: { focus_used: "⚡ {{used}}h / {{max}}h enfoque usado este mes" },
    market: { title: "Mercado y Rivales", desc: "Rastrea a tu competencia" },
    lifestyle: { title: "Estilo de Vida", desc: "Gasta tu riqueza personal" },
    margin: { title: "Cuenta de Margen", desc: "Terminal de Crédito Personal" },
    lobbying: { title: "Lobbying y Captura", desc: "Influencia en Washington" },
    buybacks: { title: "Recompras", desc: "Terminal de Asignación de Capital" },
    b10b51: { title: "Planes 10b51", desc: "Trading Automatizado" },
    board: { title: "Gestión de Junta", desc: "Gobierno Corporativo" },
    philanthropy: { title: "Filantropía", desc: "Donaciones Caritativas" },
    analysts: { title: "Analistas y RRPP", desc: "Gestionar Imagen Pública" },
    fines: { title: "Multas y Demandas", desc: "Departamento Legal" },
    manda: { title: "M&A", desc: "Adquirir Empresas" },
    subsidiary: { title: "Filial", desc: "Gestionar Empresas Hijas" },
    debt: { title: "Deuda Corporativa", desc: "Gestionar Préstamos" },
    options: { title: "Opciones y ESOP", desc: "Gestionar Acciones de Empleados" }
};

const newDe = {
    product: { title: "Produkt", desc: "Sofortige technische Ausführung" },
    marketing: { title: "Marketing", desc: "Aktionen + Laufende Programme" },
    funding: { title: "Finanzierung", stage_sec: "Phase: SEC-Ruheperiode", stage_info: "Phase: {{stage}} · {{equity}}% Gründeranteile" },
    public_markets: { title: "Öffentliche Märkte", ticker_info: "Ticker: {{symbol}} · {{equity}}% Gründeranteile" },
    founder: { focus_used: "⚡ {{used}}h / {{max}}h Fokus diesen Monat verbraucht" },
    market: { title: "Markt & Konkurrenten", desc: "Verfolge deine Konkurrenz" },
    lifestyle: { title: "Lebensstil", desc: "Gib dein persönliches Vermögen aus" },
    margin: { title: "Margenkonto", desc: "Persönliches Kredit-Terminal" },
    lobbying: { title: "Lobbyarbeit", desc: "Washington Einfluss-Terminal" },
    buybacks: { title: "Rückkäufe", desc: "Kapitalallokations-Terminal" },
    b10b51: { title: "10b51-Pläne", desc: "Automatisierter Handel" },
    board: { title: "Vorstandsverwaltung", desc: "Unternehmensführung" },
    philanthropy: { title: "Philanthropie", desc: "Wohltätige Spenden" },
    analysts: { title: "Analysten & PR", desc: "Öffentliches Image verwalten" },
    fines: { title: "Strafen & Klagen", desc: "Rechtsabteilung" },
    manda: { title: "M&A", desc: "Unternehmen erwerben" },
    subsidiary: { title: "Tochtergesellschaft", desc: "Tochterunternehmen verwalten" },
    debt: { title: "Unternehmensschulden", desc: "Kredite verwalten" },
    options: { title: "Optionen & ESOP", desc: "Mitarbeiterkapital verwalten" }
};

Object.assign(en.dashboard.sheets, newEn);
Object.assign(es.dashboard.sheets, newEs);
Object.assign(de.dashboard.sheets, newDe);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('All Sheets locales added.');
