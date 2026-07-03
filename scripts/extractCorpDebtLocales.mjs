import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.debt) en.dashboard.debt = {};
if (!es.dashboard.debt) es.dashboard.debt = {};
if (!de.dashboard.debt) de.dashboard.debt = {};

Object.assign(en.dashboard.debt, {
    title: "Corporate Debt",
    active_obligations_summary: "Active Debt Obligations: {{amount}}/mo",
    locked_summary: "Reach Series A to access corporate debt instruments.",
    credit_score: "Credit Score",
    requires_series_a: "Requires Series A",
    requires_series_a_desc: "Close your Series A round to access venture debt and non-dilutive financing instruments.",
    active_obligations: "Active Obligations",
    obligation_detail: "{{amount}}/mo · {{months}}mo left",
    requires_score: "Requires {{score}} Score",
    score_too_low: "Credit Score Too Low",
    score_too_low_desc: "You need a score of {{score}} to access this.",
    debt_approved: "Debt Approved",
    debt_approved_desc: "{{amount}} deposited. {{monthly}}/mo repayment.",
    locked_btn: "Locked",
    draw_btn: "Draw {{amount}} @ {{rate}}% APR",
    products: {
        venture_debt: { name: "Venture Debt", desc: "Non-dilutive financing tied to ARR. Common for Series A+." },
        revenue_loan: { name: "Revenue-Based Loan", desc: "Repay as % of monthly revenue. Ideal for high-growth SaaS." },
        bridge_loan: { name: "Bridge Loan", desc: "Short-term bridge to your next funding round. Quick approval." }
    }
});

Object.assign(es.dashboard.debt, {
    title: "Deuda Corporativa",
    active_obligations_summary: "Obligaciones Activas: {{amount}}/mes",
    locked_summary: "Alcanza la Serie A para acceder a deuda corporativa.",
    credit_score: "Puntaje de Crédito",
    requires_series_a: "Requiere Serie A",
    requires_series_a_desc: "Cierra tu Serie A para acceder a deuda de riesgo y financiamiento no dilusivo.",
    active_obligations: "Obligaciones Activas",
    obligation_detail: "{{amount}}/mes · {{months}}m restantes",
    requires_score: "Requiere Puntaje {{score}}",
    score_too_low: "Puntaje de Crédito Muy Bajo",
    score_too_low_desc: "Necesitas un puntaje de {{score}} para acceder a esto.",
    debt_approved: "Deuda Aprobada",
    debt_approved_desc: "{{amount}} depositados. Pago de {{monthly}}/mes.",
    locked_btn: "Bloqueado",
    draw_btn: "Retirar {{amount}} @ {{rate}}% APR",
    products: {
        venture_debt: { name: "Deuda de Riesgo", desc: "Financiamiento no dilusivo ligado al ARR. Común en Serie A+." },
        revenue_loan: { name: "Préstamo sobre Ingresos", desc: "Paga % del ingreso mensual. Ideal para SaaS de alto crecimiento." },
        bridge_loan: { name: "Préstamo Puente", desc: "Puente corto a tu próxima ronda. Aprobación rápida." }
    }
});

Object.assign(de.dashboard.debt, {
    title: "Unternehmensschulden",
    active_obligations_summary: "Aktive Schulden: {{amount}}/Monat",
    locked_summary: "Erreiche Series A für Zugang zu Unternehmensschulden.",
    credit_score: "Bonität",
    requires_series_a: "Erfordert Series A",
    requires_series_a_desc: "Schließe deine Series A ab, um Zugang zu Venture-Debt zu erhalten.",
    active_obligations: "Aktive Verpflichtungen",
    obligation_detail: "{{amount}}/Monat · noch {{months}}M",
    requires_score: "Erfordert Score {{score}}",
    score_too_low: "Bonität zu niedrig",
    score_too_low_desc: "Du benötigst einen Score von {{score}} hierfür.",
    debt_approved: "Kredit Genehmigt",
    debt_approved_desc: "{{amount}} eingezahlt. {{monthly}}/Monat Rückzahlung.",
    locked_btn: "Gesperrt",
    draw_btn: "{{amount}} abheben @ {{rate}}% APR",
    products: {
        venture_debt: { name: "Venture Debt", desc: "Nicht-verwässernde Finanzierung (ARR-gebunden). Üblich ab Series A." },
        revenue_loan: { name: "Umsatzbasiertes Darlehen", desc: "Rückzahlung als % des Monatsumsatzes. Ideal für schnelles Wachstum." },
        bridge_loan: { name: "Überbrückungskredit", desc: "Kurzfristige Überbrückung bis zur nächsten Finanzierungsrunde." }
    }
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Debt locales added.');
