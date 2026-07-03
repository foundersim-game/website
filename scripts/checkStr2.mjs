import fs from 'fs';
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
console.log("EN Founder:", en.dashboard.founder.str_6b76dc4f);
console.log("ES Founder:", es.dashboard.founder.str_6b76dc4f);
