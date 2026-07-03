import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

const additions = {
    es: {
        actions: {
            read_book: { label: "Leer un Libro", description: "Profundizar conocimientos mediante la lectura" },
            online_course: { label: "Tomar Curso Online", description: "Desarrollo estructurado de habilidades" },
            attend_conference: { label: "Asistir a Conferencia", description: "Conferencia del sector - aprender + networking" },
            analyze_competitor: { label: "Analizar Competidor", description: "Estudiar productos y estrategia de la competencia" },
            listen_podcast: { label: "Escuchar Podcast", description: "Aprendizaje pasivo durante el viaje" },
            gym_routine: { label: "Rutina de Gimnasio", description: "Hábito de gimnasio" },
            founder_health_routine: { label: "Rutina de Salud", description: "Gimnasio y dieta" },
            daily_meditation: { label: "Meditación Diaria", description: "Meditación" },
            regular_reading: { label: "Lectura Regular", description: "Libros de crecimiento" },
            executive_coach: { label: "Coach Ejecutivo", description: "Coach" },
            online_mba_modules: { label: "Módulos MBA Online", description: "Cursos online" },
            user_interviews: { label: "Sesiones de Entrevistas a Usuarios", description: "Ciclos de descubrimiento" },
            bug_bash: { label: "Sprints de Bug Bash", description: "Sprints agresivos" },
            weekly_ab_tests: { label: "Pruebas A/B Semanales", description: "Pruebas de conversión" }
        },
        dashboard: {
            skills: {
                system_design: { label: "Pensador de Sistemas", tagline: "-15% deuda técnica por mes", description: "Tu disciplina arquitectónica significa que el equipo escribe código que envejece mejor. La deuda técnica decae un 15% más rápido cada mes." },
                distributed_systems: { label: "Arquitecto de Escala", tagline: "+2 calidad del producto y +3 fiabilidad/mes", description: "Diseñaste para escalar antes de necesitarlo. Cada mes, el producto obtiene un aumento pasivo de calidad y fiabilidad." },
                code_quality: { label: "Artesano del Código", tagline: "+2 fiabilidad/mes", description: "Tu obsesión por el código limpio rinde frutos. La fiabilidad aumenta pasivamente cada mes incluso sin una acción explícita." },
                security_champion: { label: "Campeón de Seguridad", tagline: "-2 deuda técnica y -10% probabilidad de brecha", description: "Priorizas la seguridad y estableces un estándar alto. La deuda técnica disminuye pasivamente cada mes y tienes mucha menos probabilidad de sufrir brechas." },
                growth_hacker: { label: "Growth Hacker", tagline: "+10% crecimiento viral de usuarios/mes", description: "Ves embudos en todos lados. Tus usuarios se invitan unos a otros, aumentando el crecimiento de usuarios en un 10% pasivamente cada mes." },
                brand_storyteller: { label: "Estratega de Marca", tagline: "+2 conocimiento de marca/mes", description: "Sabes cómo posicionar una narrativa en los medios. El conocimiento de tu marca crece naturalmente mes a mes." },
                retention_loop: { label: "Ingeniero de Retención", tagline: "Duplica pasivamente los usuarios orgánicos nuevos", description: "Optimizas las vías neuronales del producto para mantener enganchados a los usuarios. Los usuarios atraen usuarios, duplicando los registros orgánicos a largo plazo." },
                pr_master: { label: "Veterano de RR.PP.", tagline: "+15% tasa de éxito de campañas PR", description: "Tienes a los medios de comunicación en marcación rápida. Cada campaña de RR.PP. tiene un 15% más de probabilidad de éxito viral." },
                team_builder: { label: "Constructor de Equipos", tagline: "+2 moral de equipo", description: "La gente quiere trabajar para ti. La moral de tu equipo nunca caerá por debajo de un umbral base, y la retención aumenta." },
                executive_presence: { label: "Presencia Ejecutiva", tagline: "+10% tasa de éxito en pitch", description: "Dominas cualquier sala a la que entras. Tienes un 10% más de probabilidad de cerrar rondas de financiación exitosamente." },
                culture_architect: { label: "Arquitecto Cultural", tagline: "La moral baja penaliza un 25% menos", description: "Inculcas resiliencia en la empresa. El estrés afecta a los empleados, pero su productividad decae mucho menos de lo normal." },
                board_management: { label: "Domador del Board", tagline: "El Board interviene un 50% menos", description: "Manejas a los inversores tan bien como a los clientes. Tienes el doble de tiempo para fallar y recuperarte antes de que la junta comience a cuestionarte." },
                term_sheet_literacy: { label: "Experto en Term Sheets", tagline: "+25% éxito en rondas de financiación", description: "Entiendes la jerga legal como si fueras abogado. Tu confianza en negociaciones aumenta el éxito de financiación drásticamente." },
                lp_networker: { label: "Networker de LPs", tagline: "Flujo de inversores en aumento", description: "Pasas los fines de semana con los Limited Partners. Siempre hay flujo de capital hacia tus inversores, haciendo las rondas mucho más fáciles." },
                valuation_expert: { label: "Experto en Valoración", tagline: "+10% tope de valoración", description: "Sabes exactamente cómo estructurar una historia de unicornio. Los inversores ofrecen valoraciones consistentemente más altas en cada ronda." }
            },
            lifestyle: {
                private_chef: "Chef Privado", private_chef_desc: "Comidas orgánicas preparadas a diario.",
                performance_coach: "Coach de Rendimiento", performance_coach_desc: "Optimización personalizada de estado físico y longevidad.",
                bespoke_tailoring: "Sastrería a Medida", bespoke_tailoring_desc: "Trajes a medida y vestuario profesional.",
                concierge_therapy: "Terapia Concierge", concierge_therapy_desc: "Acceso 24/7 a psicología de alto rendimiento.",
                vintage_chronograph: "Cronógrafo Vintage",
                luxury_suv: "SUV de Lujo",
                electric_sportscar: "Deportivo Eléctrico",
                downtown_penthouse: "Penthouse Céntrico",
                country_estate: "Casa de Campo",
                executive_jet: "Jet Ejecutivo",
                city_chopper: "Helicóptero de Ciudad",
                rare_art_collection: "Colección de Arte Raro"
            }
        }
    },
    de: {
        actions: {
            read_book: { label: "Ein Buch lesen", description: "Wissen durch Lesen vertiefen" },
            online_course: { label: "Online-Kurs machen", description: "Strukturierte Kompetenzentwicklung" },
            attend_conference: { label: "Konferenz besuchen", description: "Branchenkonferenz - lernen + netzwerken" },
            analyze_competitor: { label: "Wettbewerber analysieren", description: "Produkte & Strategie der Konkurrenz studieren" },
            listen_podcast: { label: "Podcast hören", description: "Passives Lernen während des Pendelns" },
            gym_routine: { label: "Fitnessstudio", description: "Gym-Gewohnheit" },
            founder_health_routine: { label: "Gesundheitsroutine", description: "Fitnessstudio & Diät" },
            daily_meditation: { label: "Tägliche Meditation", description: "Meditation" },
            regular_reading: { label: "Regelmäßiges Lesen", description: "Bücher über Wachstum" },
            executive_coach: { label: "Führungskräfte-Coach", description: "Coach" },
            online_mba_modules: { label: "Online MBA Module", description: "Online-Kurse" },
            user_interviews: { label: "Benutzer-Interviews", description: "Entdeckungszyklen" },
            bug_bash: { label: "Bug Bash Sprints", description: "Aggressive Sprints" },
            weekly_ab_tests: { label: "Wöchentliche A/B Tests", description: "Conversion-Tests" }
        },
        dashboard: {
            skills: {
                system_design: { label: "Systemdenker", tagline: "-15% technische Schulden pro Monat", description: "Deine Architekturdisziplin bedeutet, dass das Team Code schreibt, der besser altert. Technische Schulden sinken monatlich um 15%." },
                distributed_systems: { label: "Skalierungs-Architekt", tagline: "+2 Produktqualität & +3 Zuverlässigkeit/Mo", description: "Du hast für Skalierung entworfen, bevor du sie brauchst. Jeden Monat erhält das Produkt passive Qualität." },
                code_quality: { label: "Code-Handwerker", tagline: "+2 Zuverlässigkeit/Mo", description: "Deine Obsession für sauberen Code zahlt sich aus. Die Zuverlässigkeit steigt jeden Monat passiv." },
                security_champion: { label: "Sicherheits-Champion", tagline: "-2 Tech-Schulden & -10% Wahrscheinlichkeit", description: "Du setzt Sicherheit als Standard. Technische Schulden sinken und weniger Datenpannen." },
                growth_hacker: { label: "Growth Hacker", tagline: "+10% virales Nutzerwachstum/Mo", description: "Du siehst Trichter überall. Deine Nutzer laden sich gegenseitig ein." },
                brand_storyteller: { label: "Marken-Stratege", tagline: "+2 Markenbekanntheit/Mo", description: "Du weißt, wie man Narrative platziert. Bekanntheit wächst organisch." },
                retention_loop: { label: "Bindungs-Ingenieur", tagline: "Verdoppelt passiv neue Nutzer", description: "Nutzer ziehen Nutzer an. Langfristig werden Anmeldungen verdoppelt." },
                pr_master: { label: "PR-Veteran", tagline: "+15% PR-Erfolgsrate", description: "Medien auf Kurzwahl. Kampagnen haben eine 15% höhere virale Erfolgschance." },
                team_builder: { label: "Teambuilder", tagline: "+2 Team-Moral", description: "Leute wollen für dich arbeiten. Teammoral sinkt nie unter einen Schwellenwert." },
                executive_presence: { label: "Führungspräsenz", tagline: "+10% Pitch-Erfolgsrate", description: "Du beherrschst den Raum. 10% mehr Chancen bei Finanzierungsrunden." },
                culture_architect: { label: "Kultur-Architekt", tagline: "Geringe Moral straft 25% weniger", description: "Mitarbeiter sind resilienter gegen Stress." },
                board_management: { label: "Vorstandsflüsterer", tagline: "Vorstand greift 50% weniger ein", description: "Investoren-Management meisterhaft." },
                term_sheet_literacy: { label: "Term-Sheet-Experte", tagline: "+25% Finanzierungserfolg", description: "Du kennst die legalen Aspekte auswendig." },
                lp_networker: { label: "LP Networker", tagline: "Erhöht Investoren-Pipeline", description: "Immer Kapital für deine Investoren, macht Runden einfacher." },
                valuation_expert: { label: "Bewertungs-Experte", tagline: "+10% Bewertungsobergrenze", description: "Investoren bieten systematisch höhere Bewertungen." }
            },
            lifestyle: {
                private_chef: "Privatkoch", private_chef_desc: "Täglich biologische, nährstoffreiche Mahlzeiten.",
                performance_coach: "Performance Coach", performance_coach_desc: "Maßgeschneiderte Fitness und Langlebigkeit.",
                bespoke_tailoring: "Maßschneiderei", bespoke_tailoring_desc: "Maßanzüge und professionelle Garderobe.",
                concierge_therapy: "Concierge Therapie", concierge_therapy_desc: "24/7 Zugang zu Hochleistungspsychologie.",
                vintage_chronograph: "Vintage Chronograph",
                luxury_suv: "Luxus-SUV",
                electric_sportscar: "Elektro-Sportwagen",
                downtown_penthouse: "Penthouse im Zentrum",
                country_estate: "Landsitz",
                executive_jet: "Business Jet",
                city_chopper: "Stadt-Hubschrauber",
                rare_art_collection: "Seltene Kunstsammlung"
            }
        }
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    // Inject actions (merge)
    if (!data.actions) data.actions = {};
    for (const [key, val] of Object.entries(additions[lang].actions)) {
        if (!data.actions[key]) data.actions[key] = {};
        Object.assign(data.actions[key], val);
    }

    // Inject dashboard skills and lifestyle
    if (!data.dashboard.skills) data.dashboard.skills = {};
    Object.assign(data.dashboard.skills, additions[lang].dashboard.skills);

    if (!data.dashboard.lifestyle) data.dashboard.lifestyle = {};
    Object.assign(data.dashboard.lifestyle, additions[lang].dashboard.lifestyle);

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});

console.log("Injected all missing skill, lifestyle, and action translations!");
