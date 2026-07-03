import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.funding) en.dashboard.funding = {};
if (!es.dashboard.funding) es.dashboard.funding = {};
if (!de.dashboard.funding) de.dashboard.funding = {};

const newEn = {
    quiet_period_title: "SEC Quiet Period Active",
    quiet_period_desc: "Your firm is actively in the **IPO registration process (Stage {{stage}}/3)**. Federal regulations strictly prohibit raising private capital or making public announcements about pricing or prospects.",
    quiet_period_status: "Filing Phase: S-1 Submitted",
    quiet_period_lock: "All fundraising rounds are locked. Advance the month to complete listing.",
    fpo_cooldown_title: "FPO Cooldown Active",
    fpo_cooldown_desc: "You can only conduct a Follow-on Public Offering once every 6 months. Please wait {{months}} more month(s).",
    pitch: "Pitch {{round}}",
    sub_angel: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% equity",
    sub_seed: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% equity",
    sub_series: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% equity",
    sub_inst: "Institutional Scaling Capital · 5-10% equity",
    sub_dynamic: "{{sub}} · Dynamic Leads (Net, Rep, Inno)",
    maxed_out: "You have sold too much equity to raise more capital without losing control."
};

const newEs = {
    quiet_period_title: "Período de Silencio SEC",
    quiet_period_desc: "Tu firma está en el **proceso de registro de IPO (Etapa {{stage}}/3)**. Las regulaciones federales prohíben estrictamente levantar capital privado o hacer anuncios públicos sobre perspectivas.",
    quiet_period_status: "Fase de Presentación: S-1 Entregado",
    quiet_period_lock: "Todas las rondas están bloqueadas. Avanza el mes para completar el listado.",
    fpo_cooldown_title: "Enfriamiento FPO Activo",
    fpo_cooldown_desc: "Solo puedes hacer una Oferta Pública de Seguimiento cada 6 meses. Por favor espera {{months}} mes(es) más.",
    pitch: "Presentar a {{round}}",
    sub_angel: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% acciones",
    sub_seed: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% acciones",
    sub_series: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% acciones",
    sub_inst: "Capital Institucional de Escala · 5-10% acciones",
    sub_dynamic: "{{sub}} · Liderazgo Dinámico",
    maxed_out: "Has vendido demasiadas acciones para levantar más capital sin perder el control."
};

const newDe = {
    quiet_period_title: "SEC-Ruheperiode aktiv",
    quiet_period_desc: "Deine Firma befindet sich im **IPO-Registrierungsprozess (Phase {{stage}}/3)**. Bundesvorschriften verbieten private Kapitalbeschaffung oder öffentliche Ankündigungen.",
    quiet_period_status: "Einreichungsphase: S-1 übermittelt",
    quiet_period_lock: "Alle Finanzierungsrunden sind gesperrt. Gehe in den nächsten Monat, um die Listung abzuschließen.",
    fpo_cooldown_title: "FPO-Abklingzeit aktiv",
    fpo_cooldown_desc: "Du kannst nur alle 6 Monate ein FPO durchführen. Bitte warte noch {{months}} Monat(e).",
    pitch: "Pitch {{round}}",
    sub_angel: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% Eigenkapital",
    sub_seed: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% Eigenkapital",
    sub_series: "${{min}}–${{max}} · {{eqMin}}–{{eqMax}}% Eigenkapital",
    sub_inst: "Institutionelles Skalierungskapital · 5-10% Eigenkapital",
    sub_dynamic: "{{sub}} · Dynamische Leads",
    maxed_out: "Du hast zu viel Eigenkapital verkauft, um mehr Kapital aufzunehmen, ohne die Kontrolle zu verlieren."
};

Object.assign(en.dashboard.funding, newEn);
Object.assign(es.dashboard.funding, newEs);
Object.assign(de.dashboard.funding, newDe);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Funding locales added.');
