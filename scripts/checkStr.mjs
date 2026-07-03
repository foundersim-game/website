import fs from 'fs';
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
console.log("ES:", es.dashboard.margin_loan.str_20a744fb);
console.log("EN:", en.dashboard.margin_loan.str_20a744fb);
