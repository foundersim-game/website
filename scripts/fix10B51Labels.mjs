import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];
const additions = {
    en: {
        standard_safe_harbor: "STANDARD SAFE-HARBOR"
    },
    es: {
        standard_safe_harbor: "SAFE-HARBOR ESTÁNDAR"
    },
    de: {
        standard_safe_harbor: "STANDARD SAFE-HARBOR"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    Object.assign(data.dashboard['10b51'], additions[lang]);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Fixed 10B51 labels");
