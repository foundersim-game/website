import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Adding Dashboard Stat strings
const enAdditions = {
    "cash": "Cash",
    "net_profit": "Net Profit",
    "monthly_burn": "Monthly Burn",
    "valuation": "Valuation",
    "runway": "Runway",
    "users": "Users",
    "paid_users": "Paid Users",
    "mrr": "MRR",
    "growth_rate": "Growth Rate",
    "product_quality": "Product Quality",
    "tech_debt": "Tech Debt",
    "reliability": "Reliability",
    "brand_awareness": "Brand Awareness",
    "team_morale": "Team Morale",
    "pmf_score": "PMF Score",
    "cash_desc": "Your company bank account. When this hits zero, game over. Try to keep at least 3 months of expenses in reserve.",
    "burn_desc": "Monthly Profit/Loss. Positive means you are gaining cash; negative (Burn) means you are losing it. Hire a CFO to optimize expenses.",
    "valuation_desc": "The estimated market value of your startup. Driven by user growth, revenue, product quality, and market conditions.",
    "runway_desc": "How many months you can survive at current burn before running out of cash. ∞ means you are profitable."
};

const esAdditions = {
    "cash": "Efectivo",
    "net_profit": "Beneficio Neto",
    "monthly_burn": "Quema Mensual",
    "valuation": "Valoración",
    "runway": "Runway",
    "users": "Usuarios",
    "paid_users": "Usuarios Pagos",
    "mrr": "MRR",
    "growth_rate": "Tasa de Crecimiento",
    "product_quality": "Calidad del Prod.",
    "tech_debt": "Deuda Técnica",
    "reliability": "Fiabilidad",
    "brand_awareness": "Conocimiento Marca",
    "team_morale": "Moral del Equipo",
    "pmf_score": "Puntuación PMF",
    "cash_desc": "La cuenta bancaria de tu empresa. Cuando llega a cero, se acaba el juego. Intenta mantener al menos 3 meses de gastos en reserva.",
    "burn_desc": "Pérdidas/Ganancias mensuales. Positivo significa que estás ganando efectivo; negativo (Quema) significa que lo estás perdiendo.",
    "valuation_desc": "El valor de mercado estimado de tu startup. Impulsado por crecimiento de usuarios, ingresos, calidad del producto y condiciones del mercado.",
    "runway_desc": "Cuántos meses puedes sobrevivir con la quema actual antes de quedarte sin efectivo. ∞ significa que eres rentable."
};

const deAdditions = {
    "cash": "Bargeld",
    "net_profit": "Nettogewinn",
    "monthly_burn": "Monatl. Burn",
    "valuation": "Bewertung",
    "runway": "Runway",
    "users": "Nutzer",
    "paid_users": "Zahlende Nutzer",
    "mrr": "MRR",
    "growth_rate": "Wachstumsrate",
    "product_quality": "Produktqualität",
    "tech_debt": "Tech. Schulden",
    "reliability": "Zuverlässigkeit",
    "brand_awareness": "Markenbekanntheit",
    "team_morale": "Team-Moral",
    "pmf_score": "PMF-Score",
    "cash_desc": "Das Bankkonto deines Unternehmens. Wenn das auf Null fällt, ist das Spiel vorbei. Versuche, mindestens 3 Monate an Ausgaben als Reserve zu halten.",
    "burn_desc": "Monatlicher Gewinn/Verlust. Positiv bedeutet, dass du Geld einnimmst; negativ (Burn) bedeutet, dass du es verlierst.",
    "valuation_desc": "Der geschätzte Marktwert deines Startups. Getrieben von Nutzerwachstum, Umsatz, Produktqualität und Marktbedingungen.",
    "runway_desc": "Wie viele Monate du mit dem aktuellen Burn überleben kannst, bevor dir das Geld ausgeht. ∞ bedeutet, dass du profitabel bist."
};

en.dashboard.stats = enAdditions;
es.dashboard.stats = esAdditions;
de.dashboard.stats = deAdditions;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log("Dashboard stat locales added.");
