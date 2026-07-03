import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];

const descs = {
    en: {
        cash_desc: "Your company bank account. Maintain at least 3 months of runway.",
        revenue_desc: "Total Monthly Revenue. Lifeblood of the business.",
        valuation_desc: "Calculated based on Revenue, growth, and product quality.",
        runway_desc: "Time until cash runs out. Increase this by raising funds or reaching profitability.",
        gross_margin_desc: "Revenue minus direct costs (COGS). Higher is better.",
        cogs_desc: "Cost of Goods Sold. Direct expenses like server costs and API fees.",
        opex_desc: "Operating Expenses. Indirect costs like office rent and software.",
        net_income_desc: "Total monthly profit or loss after all expenses.",
        cac_desc: "Customer Acquisition Cost. Marketing spend per new user.",
        ltv_desc: "Lifetime Value. Total revenue expected from a user."
    },
    es: {
        cash_desc: "Cuenta bancaria de tu empresa. Mantén al menos 3 meses de runway.",
        revenue_desc: "Ingresos Mensuales Totales. El alma del negocio.",
        valuation_desc: "Calculada con base en Ingresos, crecimiento y calidad del producto.",
        runway_desc: "Tiempo hasta que se acabe el efectivo. Auméntalo recaudando fondos o alcanzando rentabilidad.",
        gross_margin_desc: "Ingresos menos costos directos (COGS). Más alto es mejor.",
        cogs_desc: "Costo de Bienes Vendidos (COGS). Gastos directos como servidores y APIs.",
        opex_desc: "Gastos Operativos (OpEx). Costos indirectos como alquiler de oficina y software.",
        net_income_desc: "Ganancia o pérdida mensual total después de todos los gastos.",
        cac_desc: "Costo de Adquisición de Clientes. Gasto en marketing por nuevo usuario.",
        ltv_desc: "Lifetime Value (LTV). Ingresos totales esperados de un usuario."
    },
    de: {
        cash_desc: "Firmenkonto. Behalten Sie mindestens 3 Monate Runway.",
        revenue_desc: "Monatlicher Gesamtumsatz. Das Lebenselixier des Unternehmens.",
        valuation_desc: "Berechnet basierend auf Umsatz, Wachstum und Produktqualität.",
        runway_desc: "Zeit, bis das Geld ausgeht. Erhöhen durch Mittelbeschaffung oder Profitabilität.",
        gross_margin_desc: "Umsatz minus direkte Kosten (COGS). Höher ist besser.",
        cogs_desc: "Umsatzkosten. Direkte Ausgaben wie Serverkosten und API-Gebühren.",
        opex_desc: "Betriebskosten. Indirekte Kosten wie Büromiete und Software.",
        net_income_desc: "Monatlicher Gesamtgewinn oder -verlust nach allen Ausgaben.",
        cac_desc: "Kundenakquisitionskosten. Marketingausgaben pro neuem Nutzer.",
        ltv_desc: "Lifetime Value. Erwarteter Gesamtumsatz von einem Nutzer."
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (!data.dashboard.stats) data.dashboard.stats = {};
    if (!data.dashboard.stats.financials) data.dashboard.stats.financials = {};
    Object.assign(data.dashboard.stats.financials, descs[lang]);

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Added missing financial descriptions.");
