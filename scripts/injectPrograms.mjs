import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

const programs = {
    marketing_course: { label: "Masterclass de Marketing", description: "Aprende bucles de crecimiento y posicionamiento" },
    copywriting_session: { label: "Sesión de Copywriting", description: "Practica escribir textos para landing pages" },
    board_pressure_shield_team: { label: "Proteger al Equipo (Presión de la Junta)", description: "Absorbe la presión de los inversores para que el equipo pueda trabajar" },
    board_pressure_pressure_team: { label: "Presionar al Equipo", description: "Pasa la presión a tus empleados (Aumenta el agotamiento)" },
    seo_content_machine: { label: "Máquina de Contenido SEO", description: "Publicación de contenido constante" },
    social_media_presence: { label: "Presencia en Redes Sociales", description: "Gestión comunitaria activa" },
    email_newsletter: { label: "Boletín de Correo", description: "Actualizaciones semanales para usuarios" },
    podcast_circuit: { label: "Circuito de Podcasts", description: "Apariciones frecuentes como invitado" },
    weekly_1on1s: { label: "1 a 1s Semanales", description: "Reuniones regulares de alineación" },
    agile_sprints: { label: "Sprints Ágiles", description: "Gestión estricta de proyectos" },
    cross_training: { label: "Capacitación Cruzada", description: "Compartir conocimientos internos" },
    performance_reviews: { label: "Revisiones de Desempeño", description: "Retroalimentación estructurada" },
    technical_debt_paydown: { label: "Pago de Deuda Técnica", description: "Refactorización continua" },
    bug_bounty_program: { label: "Programa Bug Bounty", description: "Caza de bugs incentivada" },
    infrastructure_scaling: { label: "Escalado de Infraestructura", description: "Mantenimiento preventivo de servidores" },
    automated_testing: { label: "Pruebas Automatizadas", description: "Cobertura continua de código" },
    investor_updates: { label: "Actualizaciones para Inversores", description: "Reportes mensuales" },
    networking_events: { label: "Eventos de Networking", description: "Asistir a reuniones de la industria" },
    pitch_practice: { label: "Práctica de Pitch", description: "Perfeccionar tu historia" },
    market_research: { label: "Investigación de Mercado", description: "Seguimiento continuo de la competencia" },
    gym_routine: { label: "Rutina de Gimnasio", description: "Hábito de fitness regular" },
    therapy_sessions: { label: "Sesiones de Terapia", description: "Apoyo a la salud mental" },
    daily_meditation: { label: "Meditación Diaria", description: "Práctica de mindfulness" },
    healthy_diet: { label: "Dieta Saludable", description: "Preparación de comidas nutritivas" },
    sleep_hygiene: { label: "Higiene del Sueño", description: "Optimización estricta del descanso" },
    weekend_disconnect: { label: "Desconexión de Fin de Semana", description: "Política de cero trabajo" },
    hobby_time: { label: "Tiempo de Hobbies", description: "Perseguir intereses externos" },
    regular_vacations: { label: "Vacaciones Regulares", description: "Frecuentes descansos de recuperación" },
    executive_assistant: { label: "Asistente Ejecutivo", description: "Soporte administrativo a tiempo completo" },
    chief_of_staff: { label: "Jefe de Gabinete", description: "Gestión estratégica y priorización" },
    leadership_coach: { label: "Coach de Liderazgo", description: "Desarrollo ejecutivo continuo" }
};

files.forEach(f => {
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (!data.actions) data.actions = {};
    for (const [key, val] of Object.entries(programs)) {
        if (!data.actions[key]) data.actions[key] = {};
        Object.assign(data.actions[key], val);
    }

    // Fix translation keys for StockMarketView
    if (!data.dashboard.markets) data.dashboard.markets = {};
    Object.assign(data.dashboard.markets, {
        markets_title: "Mercados",
        stocks_listed: "acciones cotizadas",
        personal: "Personal",
        corporate: "Corporativo",
        cash: "Efectivo",
        portfolio: "Portafolio",
        total: "Total",
        cfo_auto_trading: "CFO Auto-Trading",
        on: "ACTIVADO",
        off: "DESACTIVADO",
        sec_surveillance: "Vigilancia de la SEC Activa",
        market_genius: "Market Genius",
        tips: "Consejos:",
        left: "restantes",
        insider_tip: "Consejo de Información Privilegiada",
        tab_market: "Mercado",
        tab_portfolio: "Portafolio",
        tab_news: "Noticias",
        search_stocks: "Buscar acciones...",
        sector_technology: "Tecnología",
        sector_energy: "Energía",
        sector_healthcare: "Salud",
        sector_defense: "Defensa",
        sector_finance: "Finanzas",
        sector_consumer: "Consumo",
        sector_materials: "Materiales",
        active_tips: "Consejos Activos:",
        mo: "mes",
        held: "EN POSESIÓN",
        rival: "RIVAL",
        no_news: "Sin noticias recientes",
        back: "Atrás",
        your_stake: "TU PARTICIPACIÓN",
        needed_for_takeover: "necesario para toma de control",
        portfolio_value: "Valor del Portafolio",
        all_time: "histórico",
        no_holdings: "Aún no tienes posiciones",
        go_to_market_tab: "Ve a la pestaña Mercado para empezar a invertir",
        holdings: "Posiciones",
        shares_lowercase: "acciones",
        avg: "promedio",
        news_desc: "Noticias de acciones que posees, tu empresa, rivales y subsidiarias"
    });

    if (!data.dashboard.trading) data.dashboard.trading = {};
    if (!data.dashboard.trading.tabs) data.dashboard.trading.tabs = {};
    Object.assign(data.dashboard.trading.tabs, {
        trade: "OPERAR",
        info: "INFO ACCIÓN",
        holders: "ACCIONISTAS"
    });

    Object.assign(data.dashboard.trading, {
        position: "Tu Posición",
        pnl: "P&L",
        shares: "Acciones",
        max_buyable: "Máx comprable:",
        owned: "En propiedad:",
        total_cost: "Costo total",
        est_proceeds: "Ganancias est.",
        buy: "Comprar",
        sell: "Vender"
    });

    if (!data.dashboard.trading.actions) data.dashboard.trading.actions = {};
    Object.assign(data.dashboard.trading.actions, {
        buy_shares: "COMPRAR ACCIONES",
        sell_shares: "VENDER ACCIONES"
    });

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});

console.log("Injected Programs and all StockMarket translations!");
