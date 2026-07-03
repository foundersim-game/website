const fs = require('fs');

const enUpdates = {
  "storyline_act1_intro_message": "I heard you finally shipped. Cute. My team at Chadly has {{cu}} users already and we're just warming up. Enjoy your \"launch day\" while it lasts.",
  "storyline_taunt_fundraise_message": "You raised? Nice. Chadly is sitting at {{cv}} valuation. Your entire raise is our monthly headcount bill. Keep grinding, though — it's entertaining.",
  "storyline_taunt_users_message": "You hit a milestone? Chadly crossed {{cu}} users this month alone. I don't think in milestones — I think in multiples.",
  "storyline_taunt_burnout_message": "Burned out already? I sleep 4 hours and manage {{cu}} users. Founders who need \"rest\" don't survive Series B. See you on the other side — if you make it.",
  "storyline_taunt_generic_a_message": "Chadly is at {{cv}} and accelerating. You're still debugging your MVP. The market doesn't care about your journey — it cares about results.",
  "storyline_taunt_generic_b_message": "My investors asked about you in our last board meeting. I told them you weren't a threat. That was months ago. Nothing's changed. Chadly: {{cv}}.",
  "storyline_taunt_act3_message": "Chadly is at {{cv}}. You're at {{playerVal}}. I'm going to hit $1B before you finish reading this. The race is over."
};

const esUpdates = {
  "storyline_act1_intro_message": "Escuché que finalmente lanzaste. Lindo. Mi equipo en Chadly ya tiene {{cu}} usuarios y apenas estamos calentando. Disfruta de tu \"día de lanzamiento\" mientras dure.",
  "storyline_taunt_fundraise_message": "¿Recaudaste fondos? Lindo. Chadly tiene una valoración de {{cv}}. Toda tu recaudación es nuestra factura mensual de personal. Sigue esforzándote, sin embargo, es entretenido.",
  "storyline_taunt_users_message": "¿Alcanzaste un hito? Chadly cruzó los {{cu}} usuarios solo este mes. No pienso en hitos, pienso en múltiplos.",
  "storyline_taunt_burnout_message": "¿Agotado ya? Duermo 4 horas y manejo {{cu}} usuarios. Los fundadores que necesitan \"descansar\" no sobreviven a la Serie B. Nos vemos en el otro lado... si llegas.",
  "storyline_taunt_generic_a_message": "Chadly está en {{cv}} y acelerando. Tú todavía estás depurando tu MVP. Al mercado no le importa tu viaje, le importan los resultados.",
  "storyline_taunt_generic_b_message": "Mis inversores preguntaron por ti en nuestra última reunión de directorio. Les dije que no eras una amenaza. Eso fue hace meses. Nada ha cambiado. Chadly: {{cv}}.",
  "storyline_taunt_act3_message": "Chadly está en {{cv}}. Tú estás en {{playerVal}}. Voy a alcanzar los mil millones de dólares antes de que termines de leer esto. La carrera ha terminado."
};

const deUpdates = {
  "storyline_act1_intro_message": "Ich habe gehört, du hast endlich gelauncht. Süß. Mein Team bei Chadly hat bereits {{cu}} Nutzer und wir fangen gerade erst an. Genieß deinen \"Launch-Tag\", solange er dauert.",
  "storyline_taunt_fundraise_message": "Du hast Geld gesammelt? Nett. Chadly hat eine Bewertung von {{cv}}. Deine gesamte Finanzierungsrunde ist unsere monatliche Personalrechnung. Aber mach weiter so, es ist unterhaltsam.",
  "storyline_taunt_users_message": "Du hast einen Meilenstein erreicht? Chadly hat allein in diesem Monat {{cu}} Nutzer überschritten. Ich denke nicht in Meilensteinen — ich denke in Multiplikatoren.",
  "storyline_taunt_burnout_message": "Schon ausgebrannt? Ich schlafe 4 Stunden und manage {{cu}} Nutzer. Gründer, die \"Ruhe\" brauchen, überleben die Series B nicht. Wir sehen uns auf der anderen Seite — falls du es schaffst.",
  "storyline_taunt_generic_a_message": "Chadly ist bei {{cv}} und beschleunigt. Du debuggst immer noch dein MVP. Der Markt interessiert sich nicht für deine Reise — er interessiert sich für Ergebnisse.",
  "storyline_taunt_generic_b_message": "Meine Investoren haben in unserer letzten Vorstandssitzung nach dir gefragt. Ich habe ihnen gesagt, dass du keine Bedrohung bist. Das ist Monate her. Nichts hat sich geändert. Chadly: {{cv}}.",
  "storyline_taunt_act3_message": "Chadly ist bei {{cv}}. Du bist bei {{playerVal}}. Ich werde die 1 Milliarde Dollar erreichen, bevor du dies zu Ende gelesen hast. Das Rennen ist vorbei."
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
