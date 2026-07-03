import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];
const additions = {
    en: {
        safe_ltv: "Safe (LTV < 35%)",
        warning_ltv: "Warning (LTV >= 35% - Monitor Market)",
        critical_ltv: "CRITICAL (LTV >= 50% - Liquidation Risk)"
    },
    es: {
        safe_ltv: "Seguro (LTV < 35%)",
        warning_ltv: "Precaución (LTV >= 35% - Monitorear Mercado)",
        critical_ltv: "CRÍTICO (LTV >= 50% - Riesgo de Liquidación)"
    },
    de: {
        safe_ltv: "Sicher (LTV < 35%)",
        warning_ltv: "Warnung (LTV >= 35% - Markt Überwachen)",
        critical_ltv: "KRITISCH (LTV >= 50% - Liquidationsrisiko)"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    Object.assign(data.dashboard.margin_loan, additions[lang]);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed margin loan labels");
