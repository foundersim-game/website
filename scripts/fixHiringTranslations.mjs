import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

const translations = {
    es: {
        marketer: "Growth Marketer", // leaving it, since it is a common term in Spanish startups, but maybe user wants "Especialista en Growth"
        learning_dev: {
            title: "Presupuesto de Formación",
            desc: "Fondo de formación ($300/cabeza/mes)"
        },
        social: {
            title: "Eventos Sociales del Equipo",
            desc: "Paquete social para el equipo ($5k/mes)"
        }
    },
    de: {
        marketer: "Wachstums-Marketer",
        learning_dev: {
            title: "Weiterbildungsbudget",
            desc: "Schulungsfonds ($300/Kopf/Monat)"
        },
        social: {
            title: "Teamevents",
            desc: "Team Social Paket ($5k/Monat)"
        }
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    // Fix marketer role
    if (data.dashboard.ops && data.dashboard.ops.hiring && data.dashboard.ops.hiring.roles) {
        data.dashboard.ops.hiring.roles.marketer = translations[lang].marketer;
    }

    // Now fix the Action cards. We know they might be in `dashboard.actions` or something. Let's see if we can find them.
    Object.keys(data).forEach(k => {
        if (data[k] && typeof data[k] === 'object') {
            Object.keys(data[k]).forEach(k2 => {
                const action = data[k][k2];
                if (action && action.label === "Learning & Dev Budget") {
                    action.label = translations[lang].learning_dev.title;
                    action.desc = translations[lang].learning_dev.desc;
                }
                if (action && action.label === "Team Social Events") {
                    action.label = translations[lang].social.title;
                    action.desc = translations[lang].social.desc;
                }
            })
        }
    });

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed Hiring Translations");
