import fs from 'fs';
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
console.log(es.dashboard.options['05_option_grant']);
