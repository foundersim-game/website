import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Adding Dashboard Financials strings
const enAdditions = {
    "gross_margin": "Gross Margin",
    "cogs": "COGS",
    "opex": "OpEx",
    "net_loss": "Net Loss",
    "net_income": "Net Income",
    "cac": "CAC",
    "ltv": "LTV",
    "ltv_cac": "LTV:CAC",
    "revenue": "Revenue",
    "gross_profit": "Gross Profit"
};

const esAdditions = {
    "gross_margin": "Margen Bruto",
    "cogs": "COGS",
    "opex": "OpEx",
    "net_loss": "Pérdida Neta",
    "net_income": "Ingreso Neto",
    "cac": "CAC",
    "ltv": "LTV",
    "ltv_cac": "LTV:CAC",
    "revenue": "Ingresos",
    "gross_profit": "Beneficio Bruto"
};

const deAdditions = {
    "gross_margin": "Bruttomarge",
    "cogs": "COGS",
    "opex": "OpEx",
    "net_loss": "Nettoverlust",
    "net_income": "Nettoeinkommen",
    "cac": "CAC",
    "ltv": "LTV",
    "ltv_cac": "LTV:CAC",
    "revenue": "Umsatz",
    "gross_profit": "Bruttogewinn"
};

en.dashboard.financials = enAdditions;
es.dashboard.financials = esAdditions;
de.dashboard.financials = deAdditions;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("Dashboard financials locales added.");
