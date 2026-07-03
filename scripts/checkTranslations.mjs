import fs from 'fs';
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
console.log("MANDA keys:", Object.keys(es.dashboard.manda || {}));
console.log("SUBSIDIARY keys:", Object.keys(es.dashboard.subsidiary || {}));
console.log("OPTIONS keys:", Object.keys(es.dashboard.options || {}));
