import fs from 'fs';
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
console.log("Actions Example (read_book):", es.actions.read_book);
console.log("Skills Example (systems_thinker):", es.founder_skills ? es.founder_skills.systems_thinker : "Missing");
console.log("Lifestyle Example (private_chef):", es.lifestyle ? es.lifestyle.private_chef : "Missing");
console.log("Lifestyle Asset Example (vintage_chronograph):", es.lifestyle ? es.lifestyle.vintage_chronograph : "Missing");
