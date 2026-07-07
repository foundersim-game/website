import fs from 'fs';

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

console.log("sam_encounter:", en.dashboard?.timeline?.sam_encounter);
console.log("rival_entry:", en.dashboard?.timeline?.rival_entry);
console.log("funding_news:", en.timeline?.funding_news);
console.log("rival_mistake:", en.timeline?.rival_mistake);
console.log("personnel_joined_as:", en.timeline?.personnel_joined_as);

