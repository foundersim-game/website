import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    // Fix marketer role explicitly
    if (data.dashboard && data.dashboard.ops && data.dashboard.ops.hiring && data.dashboard.ops.hiring.roles) {
        data.dashboard.ops.hiring.roles.marketer = lang === 'es' ? "Especialista en Growth" : "Wachstums-Marketer";
    }

    // Fix option pool description
    if (data.dashboard && data.dashboard.ops && data.dashboard.ops.hiring) {
        data.dashboard.ops.hiring.option_pool_desc = lang === 'es' 
            ? "Requerido para contratación y compensación. Expande vía dilución si el pool es muy bajo."
            : "Erforderlich für Einstellung & Vergütung. Erweitern Sie durch Verwässerung, wenn der Pool zu klein ist.";
    }

    // Fix action descriptions
    if (data.actions) {
        if (data.actions.learning_dev_budget) {
            data.actions.learning_dev_budget.description = lang === 'es' 
                ? "Fondo de formación ($300/cabeza/mes) — +2 Moral, +3 Cultura"
                : "Schulungsfonds ($300/Kopf/Monat) — +2 Moral, +3 Kultur";
        }
        if (data.actions.team_social_events) {
            data.actions.team_social_events.description = lang === 'es'
                ? "Paquete social para el equipo ($5k/mes) — +6 Moral, +4 Cultura"
                : "Team Social Paket ($5k/Monat) — +6 Moral, +4 Kultur";
        }
    }

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed final translations");
