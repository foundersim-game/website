import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];

const translations = {
    en: {
        deals_closed: "Deals Closed",
        financials: {
            overview: "Overview", pnl: "P&L", cap_table: "Cap Table",
            cash: "Cash", revenue: "Revenue", valuation: "Valuation",
            runway: "Runway", profitable: "Profitable", full_financials: "Full Financials",
            unit_economics: "Unit Economics", na: "N/A",
            ownership_distribution: "Ownership Distribution", monthly_pnl: "Monthly P&L (Last 6 Months)",
            ratio_healthy: "Ratio of LTV to CAC. 3x+ is healthy business. Hire a CFO to optimize."
        }
    },
    es: {
        deals_closed: "Tratos Cerrados",
        financials: {
            overview: "Resumen", pnl: "P&G", cap_table: "Cap Table",
            cash: "Efectivo", revenue: "Ingresos", valuation: "Valoración",
            runway: "Runway", profitable: "Rentable", full_financials: "Finanzas Completas",
            unit_economics: "Unit Economics", na: "N/A",
            ownership_distribution: "Distribución de Propiedad", monthly_pnl: "P&G Mensual (Últimos 6 meses)",
            ratio_healthy: "Relación LTV/CAC. Más de 3x es un negocio sano."
        }
    },
    de: {
        deals_closed: "Abgeschlossene Deals",
        financials: {
            overview: "Übersicht", pnl: "GuV", cap_table: "Cap Table",
            cash: "Barmittel", revenue: "Umsatz", valuation: "Bewertung",
            runway: "Runway", profitable: "Profitabel", full_financials: "Gesamte Finanzen",
            unit_economics: "Unit Economics", na: "N/A",
            ownership_distribution: "Eigentumsverteilung", monthly_pnl: "Monatliche GuV (Letzte 6 Monate)",
            ratio_healthy: "LTV-zu-CAC-Verhältnis. 3x+ ist ein gesundes Geschäft."
        }
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    if (!data.dashboard.stats) data.dashboard.stats = {};
    data.dashboard.stats.deals_closed = translations[lang].deals_closed;
    data.dashboard.stats.financials = translations[lang].financials;
    
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Financial translations added.");
