import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];
const additions = {
    en: {
        culture_score: "Culture",
        technical_debt: "Tech Debt",
        innovation: "Innovation",
        sales_skill: "Sales",
        leads: "Leads"
    },
    es: {
        culture_score: "Cultura",
        technical_debt: "Deuda Técnica",
        innovation: "Innovación",
        sales_skill: "Ventas",
        leads: "Leads"
    },
    de: {
        culture_score: "Kultur",
        technical_debt: "Tech-Schulden",
        innovation: "Innovation",
        sales_skill: "Vertrieb",
        leads: "Leads"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!data.dashboard.stats) data.dashboard.stats = {};
    Object.assign(data.dashboard.stats, additions[lang]);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed stats keys");
