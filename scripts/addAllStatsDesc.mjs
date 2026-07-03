import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];

const descs = {
    en: {
        paid_users_desc: "Number of active users paying for your product.",
        volume_desc: "Total transaction or API volume flowing through your platform.",
        mrr_desc: "Monthly Recurring Revenue. The most important metric for a SaaS business.",
        growth_desc: "Month-over-month revenue growth rate. Investors want to see >10% at early stages.",
        pq_desc: "Product Quality. Impacts conversion, churn, and brand reputation. Boosted by engineers.",
        debt_desc: "Technical Debt. High debt slows development and hurts reliability. Refactor to reduce it.",
        reliability_desc: "System uptime and stability. Drops cause user churn and reputation damage.",
        brand_desc: "Brand Awareness. Higher brand lowers CAC and boosts organic growth. Driven by marketers.",
        morale_desc: "Team Morale. High morale boosts productivity. Low morale causes employee churn.",
        pmf_desc: "Product-Market Fit. The holy grail. Reaching 100 unlocks explosive, efficient scale."
    },
    es: {
        paid_users_desc: "Número de usuarios activos que pagan por tu producto.",
        volume_desc: "Volumen total de transacciones o API que fluye por tu plataforma.",
        mrr_desc: "Ingresos Recurrentes Mensuales. La métrica más importante para un negocio SaaS.",
        growth_desc: "Tasa de crecimiento mensual. Los inversores buscan >10% en etapas tempranas.",
        pq_desc: "Calidad del Producto. Afecta conversión, churn y reputación. Mejorada por ingenieros.",
        debt_desc: "Deuda Técnica. Una deuda alta ralentiza el desarrollo y daña la fiabilidad. Refactoriza para reducirla.",
        reliability_desc: "Tiempo de actividad y estabilidad. Las caídas causan pérdida de usuarios y daño a la reputación.",
        brand_desc: "Conocimiento de Marca. Reduce el CAC e impulsa el crecimiento orgánico. Impulsado por marketers.",
        morale_desc: "Moral del Equipo. Alta moral mejora productividad. Baja moral causa renuncia de empleados.",
        pmf_desc: "Product-Market Fit. El santo grial. Llegar a 100 desbloquea una escala explosiva y eficiente."
    },
    de: {
        paid_users_desc: "Anzahl der aktiven Nutzer, die für Ihr Produkt bezahlen.",
        volume_desc: "Gesamtes Transaktions- oder API-Volumen, das durch Ihre Plattform fließt.",
        mrr_desc: "Monatlich wiederkehrender Umsatz. Die wichtigste Metrik für ein SaaS-Unternehmen.",
        growth_desc: "Monatliches Umsatzwachstum. Investoren wollen in frühen Phasen >10% sehen.",
        pq_desc: "Produktqualität. Beeinflusst Konversion, Abwanderung und Ruf. Wird von Ingenieuren verbessert.",
        debt_desc: "Technische Schulden. Hohe Schulden verlangsamen die Entwicklung und schaden der Zuverlässigkeit. Refaktorisieren zur Reduzierung.",
        reliability_desc: "Systemverfügbarkeit und Stabilität. Ausfälle verursachen Nutzerabwanderung und Rufschädigung.",
        brand_desc: "Markenbekanntheit. Senkt CAC und fördert organisches Wachstum. Getrieben von Marketern.",
        morale_desc: "Teammoral. Hohe Moral steigert die Produktivität. Niedrige Moral führt zu Mitarbeiterfluktuation.",
        pmf_desc: "Product-Market Fit. Der heilige Gral. Das Erreichen von 100 ermöglicht explosives, effizientes Wachstum."
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (!data.dashboard.stats) data.dashboard.stats = {};
    Object.assign(data.dashboard.stats, descs[lang]);

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Added all missing stats descriptions.");
