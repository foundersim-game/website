import fs from 'fs';
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
console.log(en.dashboard.stats.users_desc);
