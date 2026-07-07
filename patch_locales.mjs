import fs from 'fs';

function update(lang, keyPath, val) {
  const file = `src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const parts = keyPath.split('.');
  let curr = data;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {};
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = val;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

update('es', 'dashboard.timeline.sam_encounter', '💡 Guía del Mentor: Sam {{title}}.');
update('es', 'timeline.funding_news', '💰 NOTICIAS DE FINANCIACIÓN: {{name}} recaudó {{amount}} en nueva financiación.');
update('es', 'timeline.rival_mistake', '⚠️ ERROR DEL RIVAL: El intento de {{name}} de {{type}} sobreapalancó su hoja de ruta, costándoles valoración.');
update('es', 'timeline.personnel_joined_as', 'Personal: {{name}} se unió como {{role}}.');

update('fr', 'dashboard.timeline.sam_encounter', '💡 Conseils du mentor: Sam {{title}}.');
update('fr', 'dashboard.timeline.rival_entry', 'ENTRÉE D\'UN RIVAL: Un nouveau concurrent "{{name}}" est entré sur le marché {{industry}} !');

update('de', 'dashboard.timeline.sam_encounter', '💡 Mentoren-Tipp: Sam {{title}}.');
update('de', 'timeline.funding_news', '💰 FINANZIERUNGSNEWS: {{name}} hat {{amount}} an neuer Finanzierung erhalten.');
update('de', 'timeline.rival_mistake', '⚠️ RIVALEN-FEHLER: Der Versuch von {{name}} zu {{type}} hat ihre Roadmap überlastet und sie Bewertung gekostet.');
update('de', 'timeline.personnel_joined_as', 'Personal: {{name}} ist als {{role}} beigetreten.');

console.log("Patched missing keys");
