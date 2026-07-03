import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

const additions = {
    es: {
        actions: {
            personal_hackathon: { label: "Hackathon Personal", description: "Sprint de código intenso – mejor cuando el equipo es pequeño" },
            review_codebase: { label: "Revisar Codebase", description: "Análisis profundo de la calidad del código" },
            fix_bug_personally: { label: "Arreglar Bugs Personalmente", description: "Arremángate" },
            architecture_design: { label: "Planificación de Arquitectura", description: "Diseñar sistema a escala" },
            write_tests: { label: "Escribir Suite de Pruebas", description: "Mejorar la fiabilidad del código" },
            team_1on1s: { label: "1 a 1s con el Equipo", description: "Desarrollo y alineación del equipo" },
            company_allhands: { label: "All-Hands de la Empresa", description: "Actualización a nivel de toda la empresa" },
            set_okrs: { label: "Establecer OKRs", description: "Definir metas y métricas" },
            public_speaking: { label: "Hablar en Público", description: "Mejorar la reputación de la industria" },
            team_offsite: { label: "Retiro del Equipo", description: "Construir moral (Cuesta $5k)" },
            founder_coffees: { label: "Cafés entre Fundadores", description: "Conectar con pares" },
            post_on_social: { label: "Publicar en Redes Sociales", description: "Mantener presencia online" },
            speak_at_meetup: { label: "Hablar en Meetup", description: "Networking local" },
            investor_dinner: { label: "Cena de Inversores", description: "Nutrir relaciones con inversores" },
            startup_summit: { label: "Cumbre de Startups", description: "Conferencia importante de la industria" },
            go_for_run: { label: "Salir a Correr", description: "Cardio rápido" },
            gym_session: { label: "Sesión de Gimnasio", description: "Entrenamiento pesado" },
            rest_day: { label: "Día de Descanso", description: "Recuperación completa" },
            doctor_checkup: { label: "Chequeo Médico", description: "Mantenimiento preventivo" },
            short_vacation: { label: "Vacaciones Cortas", description: "Desconexión completa (Cuesta $2k)" },
            meditation: { label: "Meditación", description: "Claridad mental" },
            do_something_fun: { label: "Hacer Algo Divertido", description: "Recreación y hobbies" },
            journaling: { label: "Escribir Diario", description: "Reflexión" },
            delegate_tasks: { label: "Delegar Tareas", description: "Descargar trabajo a subordinados directos" },
            build_mvp_features: { label: "Construir Funciones MVP", description: "Desarrollo de producto principal" },
            add_core_features: { label: "Añadir Funciones Principales", description: "Ampliar producto" },
            refactor_codebase: { label: "Refactorizar Codebase", description: "Pagar deuda técnica" },
            fix_bugs: { label: "Arreglar Bugs", description: "Mejorar la calidad" },
            optimize_cloud: { label: "Optimizar Nube", description: "Reducir costos de servidores" },
            organic_social: { label: "Redes Sociales Orgánicas", description: "Marketing de contenidos gratuito" },
            content_marketing: { label: "Marketing de Contenidos", description: "Publicaciones en blog y guías" },
            seo_growth: { label: "Crecimiento SEO", description: "Optimización de motores de búsqueda" },
            paid_acquisition: { label: "Adquisición de Pago", description: "Ads y rendimiento (Cuesta $1k)" },
            pr_campaign: { label: "Campaña de RR.PP.", description: "Lanzamiento en prensa (Cuesta $2.5k)" }
        },
        dashboard: {
            markets: {
                fpo: "Oferta Pública Secundaria (FPO)",
                fpo_desc: "Diluye el capital accionario para recaudar efectivo corporativo masivo directamente de inversores del mercado de valores.",
                raise_5_float: "Recaudar 5% de Flotante",
                raise_10_float: "Recaudar 10% de Flotante",
                fpo_warning: "Las FPO provocan dilución y un impacto menor en el precio de las acciones (-2% por una oferta del 5%, -6% por un 10%).",
                issue_corporate_bonds: "Emitir Bonos Corporativos (Deuda)",
                issue_bonds_desc: "Apalanca tu capitalización de mercado para pedir prestado capital institucional sin dilución. Las empresas rentables obtienen TAEs más bajas.",
                issue_50m_bonds: "Emitir $50M en Bonos",
                issue_150m_bonds: "Emitir $150M en Bonos"
            },
            philanthropy: {
                community_food_drive: "Colecta de Alimentos",
                open_source_foundation: "Fundación Open Source",
                local_charity_grant: "Beca de Caridad Local",
                global_climate_fund: "Fondo Climático Global",
                endow_scholarship: "Otorgar Beca",
                found_hospital_wing: "Fundar un Pabellón de Hospital",
                space_exploration_grant: "Beca de Exploración Espacial",
                btn_fund: "Financiar",
                btn_sponsor: "Patrocinar",
                btn_donate: "Donar",
                btn_pledge: "Prometer",
                btn_endow: "Otorgar",
                btn_found: "Fundar",
                btn_launch: "Lanzar"
            }
        }
    },
    de: {
        actions: {
            personal_hackathon: { label: "Persönlicher Hackathon", description: "Intensiver Code-Sprint – am besten in kleinem Team" },
            review_codebase: { label: "Codebase prüfen", description: "Tiefer Einblick in Code-Qualität" },
            fix_bug_personally: { label: "Bugs selbst beheben", description: "Ärmel hochkrempeln" },
            architecture_design: { label: "Architekturplanung", description: "System für Skalierung entwerfen" },
            write_tests: { label: "Test-Suite schreiben", description: "Code-Zuverlässigkeit verbessern" },
            team_1on1s: { label: "1-zu-1 mit dem Team", description: "Teamentwicklung und Ausrichtung" },
            company_allhands: { label: "Unternehmens-Allhands", description: "Unternehmensweites Update" },
            set_okrs: { label: "OKRs setzen", description: "Ziele und Metriken definieren" },
            public_speaking: { label: "Öffentliches Reden", description: "Branchenruf verbessern" },
            team_offsite: { label: "Team Offsite", description: "Moral aufbauen (Kosten $5k)" },
            founder_coffees: { label: "Gründer-Kaffee", description: "Mit Kollegen vernetzen" },
            post_on_social: { label: "Social Media Post", description: "Online-Präsenz erhalten" },
            speak_at_meetup: { label: "Vortrag bei Meetup", description: "Lokales Networking" },
            investor_dinner: { label: "Investoren-Dinner", description: "Investorenbeziehungen pflegen" },
            startup_summit: { label: "Startup Gipfel", description: "Große Branchenkonferenz" },
            go_for_run: { label: "Laufen gehen", description: "Schnelles Cardio" },
            gym_session: { label: "Fitnessstudio-Session", description: "Schweres Training" },
            rest_day: { label: "Ruhetag", description: "Vollständige Erholung" },
            doctor_checkup: { label: "Arzt-Checkup", description: "Vorbeugende Wartung" },
            short_vacation: { label: "Kurzurlaub", description: "Komplett abschalten (Kosten $2k)" },
            meditation: { label: "Meditation", description: "Klarheit im Kopf" },
            do_something_fun: { label: "Etwas Lustiges tun", description: "Freizeit und Hobbys" },
            journaling: { label: "Tagebuch schreiben", description: "Reflexion" },
            delegate_tasks: { label: "Aufgaben delegieren", description: "Arbeit an direkte Mitarbeiter abgeben" },
            build_mvp_features: { label: "MVP Features bauen", description: "Kernproduktentwicklung" },
            add_core_features: { label: "Kernfeatures hinzufügen", description: "Produkt erweitern" },
            refactor_codebase: { label: "Codebase überarbeiten", description: "Technische Schulden abbezahlen" },
            fix_bugs: { label: "Bugs beheben", description: "Qualität verbessern" },
            optimize_cloud: { label: "Cloud optimieren", description: "Serverkosten senken" },
            organic_social: { label: "Organisches Social Media", description: "Kostenloses Content-Marketing" },
            content_marketing: { label: "Content Marketing", description: "Blog-Beiträge und Guides" },
            seo_growth: { label: "SEO Wachstum", description: "Suchmaschinenoptimierung" },
            paid_acquisition: { label: "Bezahlte Akquise", description: "Ads und Performance (Kosten $1k)" },
            pr_campaign: { label: "PR Kampagne", description: "Presseveröffentlichung (Kosten $2.5k)" }
        },
        dashboard: {
            markets: {
                fpo: "Folgeangebot (FPO)",
                fpo_desc: "Verdünne das Aktienkapital, um massiv Unternehmensbargeld direkt von Börseninvestoren zu beschaffen.",
                raise_5_float: "5% Streubesitz beschaffen",
                raise_10_float: "10% Streubesitz beschaffen",
                fpo_warning: "FPOs führen zur Verwässerung und einem leichten Aktienkursrückgang (-2% für ein 5% Angebot, -6% für ein 10% Angebot).",
                issue_corporate_bonds: "Unternehmensanleihen (Schulden) ausgeben",
                issue_bonds_desc: "Nutzen Sie Ihre Marktkapitalisierung, um institutionelles Kapital ohne Verwässerung zu leihen. Profitable Unternehmen erhalten niedrigere Zinsen.",
                issue_50m_bonds: "$50M in Anleihen ausgeben",
                issue_150m_bonds: "$150M in Anleihen ausgeben"
            },
            philanthropy: {
                community_food_drive: "Lebensmittelaktion",
                open_source_foundation: "Open-Source-Stiftung",
                local_charity_grant: "Lokales Wohltätigkeitsstipendium",
                global_climate_fund: "Globaler Klimafonds",
                endow_scholarship: "Stipendium stiften",
                found_hospital_wing: "Krankenhausflügel gründen",
                space_exploration_grant: "Weltraumforschungs-Zuschuss",
                btn_fund: "Finanzieren",
                btn_sponsor: "Sponsern",
                btn_donate: "Spenden",
                btn_pledge: "Zusagen",
                btn_endow: "Stiften",
                btn_found: "Gründen",
                btn_launch: "Starten"
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

    if (!data.dashboard.markets) data.dashboard.markets = {};
    Object.assign(data.dashboard.markets, additions[lang].dashboard.markets);

    if (!data.dashboard.philanthropy) data.dashboard.philanthropy = {};
    Object.assign(data.dashboard.philanthropy, additions[lang].dashboard.philanthropy);

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});

console.log("Injected all missing action and market translations!");
