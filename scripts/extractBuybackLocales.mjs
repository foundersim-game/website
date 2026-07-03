import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

if (!en.dashboard.buyback) en.dashboard.buyback = {};
if (!es.dashboard.buyback) es.dashboard.buyback = {};
if (!de.dashboard.buyback) de.dashboard.buyback = {};

Object.assign(en.dashboard.buyback, {
    shares_outstanding: "Shares Outstanding",
    float_shares: "Public Float Shares",
    eps: "EPS (Earnings / Sh)",
    auth_program: "Authorized Program",
    auth_title: "Authorize Buyback Program",
    auth_desc: "Instruct the Board of Directors to approve capital allocation for share repurchases.",
    auth_1pct: "Authorize 1% Program",
    auth_5pct: "Authorize 5% Program",
    open_market_title: "Open Market Buyback Program",
    open_market_desc: "Execute repurchases against your active {{auth}} authorization. Retires public float shares to boost EPS.",
    rep_half_pct: "Repurchase 0.5% Float",
    rep_two_pct: "Repurchase 2.0% Float",
    rep_max: "Repurchase Max Available ({{max}})",
    pop_text: "+{{pop}}% pop",
    tender_title: "Dutch Auction Tender Offer",
    tender_desc: "Make a direct public offer to bypass open markets and buy back a massive block of shares at a **10% Premium** to defend against short sellers.",
    tender_btn: "Launch 5% Float Tender Offer (10% Premium)",
    tender_sub: "{{cost}} (Triggers +6.0% immediate price jump)",
    cooldown: "Buyback Cooldown Active",
    cooldown_desc: "The SEC restricts back-to-back buybacks to prevent market manipulation. Please wait {{months}} more month(s).",
    no_cash: "Insufficient Cash",
    no_cash_desc: "You don't have enough corporate cash to execute this buyback.",
    no_auth: "Insufficient Authorization",
    no_auth_desc: "The authorized program limit is too small.",
    too_small: "Buyback Too Small",
    too_small_desc: "The buyback amount is too small to purchase a single share at current prices.",
    success: "Buyback Executed!",
    success_desc: "Retired {{shares}} float shares!"
});

Object.assign(es.dashboard.buyback, {
    shares_outstanding: "Acciones en Circulación",
    float_shares: "Acciones de Flotación",
    eps: "BPA (Beneficio por Acción)",
    auth_program: "Programa Autorizado",
    auth_title: "Autorizar Programa de Recompra",
    auth_desc: "Instruye a la Junta Directiva a aprobar la asignación de capital para recompras.",
    auth_1pct: "Autorizar Programa 1%",
    auth_5pct: "Autorizar Programa 5%",
    open_market_title: "Recompra en Mercado Abierto",
    open_market_desc: "Ejecuta recompras contra tu autorización activa de {{auth}}. Retira acciones de flotación para aumentar el BPA.",
    rep_half_pct: "Recomprar 0.5% Flotación",
    rep_two_pct: "Recomprar 2.0% Flotación",
    rep_max: "Recomprar Máximo Disponible ({{max}})",
    pop_text: "+{{pop}}% salto",
    tender_title: "Oferta Pública de Adquisición (Subasta Holandesa)",
    tender_desc: "Haz una oferta pública directa para comprar un bloque masivo de acciones con un **10% de Prima** para defenderte de vendedores en corto.",
    tender_btn: "Lanzar Oferta del 5% (10% Prima)",
    tender_sub: "{{cost}} (Provoca un salto del +6.0% en precio)",
    cooldown: "Enfriamiento de Recompra Activo",
    cooldown_desc: "La SEC restringe recompras seguidas. Espera {{months}} mes(es).",
    no_cash: "Efectivo Insuficiente",
    no_cash_desc: "No tienes suficiente efectivo para ejecutar la recompra.",
    no_auth: "Autorización Insuficiente",
    no_auth_desc: "El límite del programa autorizado es muy pequeño.",
    too_small: "Recompra muy pequeña",
    too_small_desc: "El monto es muy pequeño para comprar al menos una acción.",
    success: "¡Recompra Ejecutada!",
    success_desc: "¡Se retiraron {{shares}} acciones de flotación!"
});

Object.assign(de.dashboard.buyback, {
    shares_outstanding: "Ausstehende Aktien",
    float_shares: "Streubesitz-Aktien",
    eps: "EPS (Gewinn je Aktie)",
    auth_program: "Autorisiertes Programm",
    auth_title: "Rückkaufprogramm autorisieren",
    auth_desc: "Weise den Vorstand an, Kapital für Aktienrückkäufe freizugeben.",
    auth_1pct: "1% Programm autorisieren",
    auth_5pct: "5% Programm autorisieren",
    open_market_title: "Offener Markt Rückkauf",
    open_market_desc: "Führe Rückkäufe aus deiner {{auth}} Autorisierung durch. Erhöht das EPS.",
    rep_half_pct: "0,5% Streubesitz zurückkaufen",
    rep_two_pct: "2,0% Streubesitz zurückkaufen",
    rep_max: "Maximal verfügbar zurückkaufen ({{max}})",
    pop_text: "+{{pop}}% Sprung",
    tender_title: "Dutch Auction Übernahmeangebot",
    tender_desc: "Mache ein direktes öffentliches Angebot, um einen massiven Aktienblock mit **10% Prämie** zurückzukaufen.",
    tender_btn: "5% Streubesitz-Angebot starten (10% Prämie)",
    tender_sub: "{{cost}} (Löst +6.0% Preissprung aus)",
    cooldown: "Rückkauf-Abklingzeit",
    cooldown_desc: "Die SEC beschränkt aufeinanderfolgende Rückkäufe. Warte noch {{months}} Monat(e).",
    no_cash: "Zu wenig Bargeld",
    no_cash_desc: "Du hast nicht genug Unternehmensbargeld für diesen Rückkauf.",
    no_auth: "Unzureichende Autorisierung",
    no_auth_desc: "Das Limit des autorisierten Programms ist zu klein.",
    too_small: "Rückkauf zu klein",
    too_small_desc: "Der Betrag reicht nicht für eine einzige Aktie.",
    success: "Rückkauf ausgeführt!",
    success_desc: "{{shares}} Streubesitz-Aktien eingezogen!"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Buyback locales added.');
