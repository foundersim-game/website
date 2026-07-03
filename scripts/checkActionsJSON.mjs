import fs from 'fs';
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
console.log(es.actions.weekly_1on1s);
console.log(es.actions.learning_dev_budget);
console.log(es.actions.team_social_events);
console.log(es.actions.okr_system);
