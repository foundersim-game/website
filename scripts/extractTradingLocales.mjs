import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const enPath = path.join(localesDir, 'en.json');
const esPath = path.join(localesDir, 'es.json');
const dePath = path.join(localesDir, 'de.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

en.dashboard.trading = {
    tabs: {
        trade: "Trade",
        info: "Stock Info",
        holders: "Holders"
    },
    indicators: {
        rsi: "RSI",
        mom: "MOM"
    },
    no_news: "No recent news",
    stats: {
        shares_owned: "Shares owned",
        avg_cost: "Avg cost",
        market_value: "Market Value",
        unrealized: "Unrealized",
        your_cash: "Your Cash",
        max_buyable: "MAX buyable"
    },
    actions: {
        buy_shares: "Buy Shares",
        sell_shares: "Sell Shares",
        buy: "Buy",
        sell: "Sell"
    }
};

es.dashboard.trading = {
    tabs: {
        trade: "Operar",
        info: "Info Acción",
        holders: "Accionistas"
    },
    indicators: {
        rsi: "RSI",
        mom: "MOM"
    },
    no_news: "Sin noticias recientes",
    stats: {
        shares_owned: "Acciones propias",
        avg_cost: "Costo prom",
        market_value: "Valor de Mercado",
        unrealized: "No Realizado",
        your_cash: "Tu Efectivo",
        max_buyable: "MÁX comprable"
    },
    actions: {
        buy_shares: "Comprar Acciones",
        sell_shares: "Vender Acciones",
        buy: "Comprar",
        sell: "Vender"
    }
};

de.dashboard.trading = {
    tabs: {
        trade: "Handel",
        info: "Aktieninfo",
        holders: "Aktionäre"
    },
    indicators: {
        rsi: "RSI",
        mom: "MOM"
    },
    no_news: "Keine aktuellen News",
    stats: {
        shares_owned: "Aktien im Besitz",
        avg_cost: "Durchschnittskosten",
        market_value: "Marktwert",
        unrealized: "Nicht realisiert",
        your_cash: "Dein Bargeld",
        max_buyable: "MAX kaufbar"
    },
    actions: {
        buy_shares: "Aktien kaufen",
        sell_shares: "Aktien verkaufen",
        buy: "Kaufen",
        sell: "Verkaufen"
    }
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));
fs.writeFileSync(dePath, JSON.stringify(de, null, 2));

console.log('Trading locales added.');
