import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];
const additions = {
    en: {
        max_impact: "Max Impact",
        high_impact: "High Impact",
        low_impact: "Low Impact",
        minimal_impact: "Minimal Impact",
        no_effect: "No Effect",
        burnout_recovery: "Burnout Recovery"
    },
    es: {
        max_impact: "Impacto Máximo",
        high_impact: "Impacto Alto",
        low_impact: "Impacto Bajo",
        minimal_impact: "Impacto Mínimo",
        no_effect: "Sin Efecto",
        burnout_recovery: "Recuperación de Agotamiento"
    },
    de: {
        max_impact: "Max. Wirkung",
        high_impact: "Hohe Wirkung",
        low_impact: "Niedrige Wirkung",
        minimal_impact: "Minimale Wirkung",
        no_effect: "Keine Wirkung",
        burnout_recovery: "Burnout-Erholung"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.dashboard.founder) data.dashboard.founder = {};
    Object.assign(data.dashboard.founder, additions[lang]);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed Impact Labels");
