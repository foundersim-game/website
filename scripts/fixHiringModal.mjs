import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];
const additions = {
    en: {
        insufficient_option_pool: "Insufficient Option Pool",
        you_need_x_but_have_y: "You need {{required}}% but only have {{available}}% available.",
        expand_pool_10: "Expand Pool (+10% Dilution)",
        vesting_terms: "Vesting Terms:",
        vesting_desc: "Offers follow standard 1-year cliff & 4-year linear timelines. Should employees leave pre-cliff, 100% of unvested equity restores to the option pool automatically safely.",
        withdraw: "Withdraw",
        extend_offer: "Extend Offer (⚡10-20h)"
    },
    es: {
        insufficient_option_pool: "Fondo de Opciones Insuficiente",
        you_need_x_but_have_y: "Necesitas {{required}}% pero solo tienes {{available}}% disponible.",
        expand_pool_10: "Expandir Fondo (+10% Dilución)",
        vesting_terms: "Términos de Vesting:",
        vesting_desc: "Las ofertas siguen un precipicio de 1 año y 4 años de vesting lineal. Si los empleados se van antes del cliff, el 100% del capital no consolidado vuelve al fondo automáticamente.",
        withdraw: "Retirar",
        extend_offer: "Extender Oferta (⚡10-20h)"
    },
    de: {
        insufficient_option_pool: "Unzureichender Optionspool",
        you_need_x_but_have_y: "Sie benötigen {{required}}%, haben aber nur {{available}}% verfügbar.",
        expand_pool_10: "Pool Erweitern (+10% Verwässerung)",
        vesting_terms: "Vesting-Bedingungen:",
        vesting_desc: "Angebote folgen 1-Jahr-Cliff & 4-Jahre linear. Verlassen Mitarbeiter das Unternehmen vor dem Cliff, geht das unverfallbare Eigenkapital zu 100% in den Pool zurück.",
        withdraw: "Zurückziehen",
        extend_offer: "Angebot machen (⚡10-20h)"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.dashboard.ops) data.dashboard.ops = {};
    if (!data.dashboard.ops.hiring) data.dashboard.ops.hiring = {};
    Object.assign(data.dashboard.ops.hiring, additions[lang]);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed Hiring Modal");
