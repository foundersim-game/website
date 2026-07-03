import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Spanish Translations
es.mentorship = {
    "intro_plg.title": "👋 ¡BIENVENIDO, {name}!",
    "intro_plg.message": "Soy Sam, {name} — he apoyado a más de cien startups en mi tiempo. Piensa en mí como tu asesor en el asiento del copiloto. Me reportaré cuando las cosas se pongan difíciles.\n\nPrimera orden del día: vigila tu Runway — esos son los meses de efectivo que te quedan. Construyamos algo grande.",
    "intro_plg.buttonText": "ENTENDIDO, GRACIAS SAM",
    "intro_slg.title": "👋 ¡BIENVENIDO, {name}!",
    "intro_slg.message": "Soy Sam, {name} — he apoyado a más de cien startups en mi tiempo. Piensa en mí como tu asesor en el asiento del copiloto. Me reportaré cuando las cosas se pongan difíciles.\n\nPrimera orden del día: vigila tu Runway — esos son los meses de efectivo que te quedan. Construyamos algo grande.",
    "intro_slg.buttonText": "ENTENDIDO, GRACIAS SAM",
    "low_runway.title": "¡ALERTA DE RUNWAY! ⚠️",
    "low_runway.message": "Te quedan menos de 4 meses de efectivo. Esta es la zona de 'Muerte por Defecto'. Necesitas 'Hacer Pitch a Inversores' inmediatamente o reducir tu tasa de quema de efectivo. Considera despedir personal no esencial o pausar el marketing costoso.",
    "low_runway.buttonText": "ESTOY EN ELLO",
    "high_burnout.title": "¡TE ESTÁS QUEMANDO! 🧘",
    "high_burnout.message": "Tu agotamiento está por encima del 70%. Tu toma de decisiones está sufriendo y el equipo empieza a notarlo. Debes 'Descansar y Recargar' este mes. Un fundador muerto no puede liderar un unicornio.",
    "high_burnout.buttonText": "GRACIAS, SAM",
    "hiring_first.title": "¡HORA DE DELEGAR! 👥",
    "hiring_first.message": "¡Tienes algo de tracción! Ya no puedes hacerlo todo solo. Contratar a tu primer Ingeniero aumentará la calidad del producto de forma pasiva, pero vigila tu efectivo. Contrata lento, despide rápido.",
    "hiring_first.buttonText": "MOSTRAR CANDIDATOS",
    "scaling_fast.title": "¡MANTENTE AGRESIVO! 🚀",
    "scaling_fast.message": "Los fundamentos se ven sólidos. Tienes runway, el PMF está mejorando y tus métricas unitarias son saludables. Ahora es el momento de ser audaz. Experimenta con 'Nuevos Canales de Marketing' o redobla esfuerzos en 'Innovación de Producto'.",
    "scaling_fast.buttonText": "ENTENDIDO, GRACIAS SAM",
    "consult_profit.title": "¡LAS GANANCIAS SUBEN! 💰",
    "consult_profit.message": "Estás en el raro grupo de startups rentables. Ahora puedes crecer con tus propios ingresos o levantar una ronda 'limpia' con apalancamiento masivo. Sugeriría contrataciones agresivas en Ventas para dominar el mercado.",
    "consult_profit.buttonText": "CONSEJO PRUDENTE",
    "consult_pmf.title": "ARREGLA EL PRODUCTO 🛠️",
    "consult_pmf.message": "Tu puntaje de PMF es bajo. Hacer marketing ahora es como echar agua en un cubo agujereado. Detén los anuncios. Pon el 100% de tu energía en 'Arreglar Errores' y 'Funciones MVP' hasta que los usuarios realmente se queden.",
    "consult_pmf.buttonText": "TRAZANDO EL CURSO"
};

// German Translations
de.mentorship = {
    "intro_plg.title": "👋 WILLKOMMEN, {name}!",
    "intro_plg.message": "Ich bin Sam, {name} — ich habe in meiner Zeit über hundert Startups unterstützt. Betrachte mich als deinen Berater auf dem Beifahrersitz. Ich melde mich, wenn es schwierig wird.\n\nErster Punkt auf der Tagesordnung: Behalte deinen Runway im Auge — das ist die Anzahl der Monate an Bargeld, die dir noch bleiben. Lass uns etwas Großartiges aufbauen.",
    "intro_plg.buttonText": "VERSTANDEN, DANKE SAM",
    "intro_slg.title": "👋 WILLKOMMEN, {name}!",
    "intro_slg.message": "Ich bin Sam, {name} — ich habe in meiner Zeit über hundert Startups unterstützt. Betrachte mich als deinen Berater auf dem Beifahrersitz. Ich melde mich, wenn es schwierig wird.\n\nErster Punkt auf der Tagesordnung: Behalte deinen Runway im Auge — das ist die Anzahl der Monate an Bargeld, die dir noch bleiben. Lass uns etwas Großartiges aufbauen.",
    "intro_slg.buttonText": "VERSTANDEN, DANKE SAM",
    "low_runway.title": "RUNWAY-ALARM! ⚠️",
    "low_runway.message": "Dir bleiben weniger als 4 Monate Bargeld. Das ist die 'Default Dead'-Zone. Du musst sofort 'Investoren pitchen' oder deine Burn-Rate senken. Erwäge, nicht wesentliches Personal zu entlassen oder teures Marketing zu pausieren.",
    "low_runway.buttonText": "ICH BIN DRAN",
    "high_burnout.title": "DU BRENNST AUS! 🧘",
    "high_burnout.message": "Dein Burnout liegt bei über 70%. Deine Entscheidungsfindung leidet, und das Team beginnt es zu bemerken. Du musst diesen Monat 'Ausruhen und Auftanken'. Ein toter Gründer kann kein Einhorn führen.",
    "high_burnout.buttonText": "DANKE, SAM",
    "hiring_first.title": "ZEIT ZU DELEGIEREN! 👥",
    "hiring_first.message": "Du hast etwas Traktion! Du kannst nicht mehr alles alleine machen. Die Einstellung deines ersten Ingenieurs wird die Produktqualität passiv steigern, aber behalte dein Geld im Auge. Stelle langsam ein, feuere schnell.",
    "hiring_first.buttonText": "KANDIDATEN ANZEIGEN",
    "scaling_fast.title": "BLEIB AGGRESSIV! 🚀",
    "scaling_fast.message": "Die Grundlagen sehen solide aus. Du hast Runway, der PMF verbessert sich, und deine Unit Economics sind gesund. Jetzt ist die Zeit, mutig zu sein. Experimentiere mit 'Neuen Marketingkanälen' oder verdopple den Einsatz bei der 'Produktinnovation'.",
    "scaling_fast.buttonText": "VERSTANDEN, DANKE SAM",
    "consult_profit.title": "GEWINNE STEIGEN! 💰",
    "consult_profit.message": "Du gehörst zu der seltenen Gruppe profitabler Startups. Du kannst dich jetzt selbst zur Größe hochziehen oder eine 'saubere' Runde mit massivem Hebel aufbringen. Ich würde aggressive Einstellungen im Vertrieb vorschlagen, um den Markt zu dominieren.",
    "consult_profit.buttonText": "KLUGER RAT",
    "consult_pmf.title": "PRODUKT REPARIEREN 🛠️",
    "consult_pmf.message": "Dein PMF-Score ist niedrig. Marketing im Moment ist wie Wasser in einen löchrigen Eimer zu gießen. Stoppe die Anzeigen. Stecke 100% deiner Energie in das 'Beheben von Fehlern' und 'MVP-Funktionen', bis die Nutzer tatsächlich bleiben.",
    "consult_pmf.buttonText": "KURS SETZEN"
};

fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("Translations applied directly.");
