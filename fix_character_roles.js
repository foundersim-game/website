const fs = require('fs');

const enUpdates = {
  "character_sam_name": "Sam",
  "character_sam_role": "Startup Mentor",
  "character_chad_name": "Chad",
  "character_chad_role": "Core AI — Your Rival",
  "character_board_name": "The Board",
  "character_board_role": "Lead Investors"
};

const esUpdates = {
  "character_sam_name": "Sam",
  "character_sam_role": "Mentor de Startups",
  "character_chad_name": "Chad",
  "character_chad_role": "Core AI — Tu Rival",
  "character_board_name": "La Junta",
  "character_board_role": "Inversores Principales"
};

const deUpdates = {
  "character_sam_name": "Sam",
  "character_sam_role": "Startup-Mentor",
  "character_chad_name": "Chad",
  "character_chad_role": "Core AI — Dein Rivale",
  "character_board_name": "Der Vorstand",
  "character_board_role": "Hauptinvestoren"
};

const langs = [
  { code: 'en', dict: enUpdates },
  { code: 'es', dict: esUpdates },
  { code: 'de', dict: deUpdates }
];

langs.forEach(({ code, dict }) => {
  const filePath = `src/locales/${code}.json`;
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.storyline = { ...(data.storyline || {}), ...dict };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${code}.json`);
  }
});
