import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/components/StockMarketView.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

if (!content.includes('useTranslation')) {
    content = content.replace(
        'import React, { useState, useMemo } from "react";',
        'import React, { useState, useMemo } from "react";\nimport { useTranslation } from "react-i18next";'
    );
    content = content.replace(
        'export default function StockMarketView({',
        'export default function StockMarketView({\n    const { t } = useTranslation();'
    );
}

// Ensure the injection point didn't accidentally happen before the actual parameters:
// The signature is:
// export default function StockMarketView({
//   ...props
// }: StockMarketViewProps) {
// So injecting on the first line inside the `{` of the props destructuring would break syntax!
// I should inject it inside the body.
content = content.replace(
    '}: StockMarketViewProps) {',
    '}: StockMarketViewProps) {\n    const { t } = useTranslation();'
);
// Revert the bad replacement if it happened
content = content.replace(
    'export default function StockMarketView({\n    const { t } = useTranslation();',
    'export default function StockMarketView({'
);

content = content.replace(
    'Trade</button>',
    '{t("dashboard.trading.tabs.trade")}</button>'
);
content = content.replace(
    'Stock Info</button>',
    '{t("dashboard.trading.tabs.info")}</button>'
);
content = content.replace(
    'Holders</button>',
    '{t("dashboard.trading.tabs.holders")}</button>'
);
content = content.replace(
    '<span className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">RSI</span>',
    '<span className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{t("dashboard.trading.indicators.rsi")}</span>'
);
content = content.replace(
    '<span className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">MOM</span>',
    '<span className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{t("dashboard.trading.indicators.mom")}</span>'
);
content = content.replace(
    'No recent news',
    '{t("dashboard.trading.no_news")}'
);
content = content.replace(
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Shares owned</p>',
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("dashboard.trading.stats.shares_owned")}</p>'
);
content = content.replace(
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg cost</p>',
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("dashboard.trading.stats.avg_cost")}</p>'
);
content = content.replace(
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Market Value</p>',
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("dashboard.trading.stats.market_value")}</p>'
);
content = content.replace(
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Unrealized</p>',
    '<p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t("dashboard.trading.stats.unrealized")}</p>'
);
content = content.replace(
    '<p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Your Cash</p>',
    '<p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{t("dashboard.trading.stats.your_cash")}</p>'
);
content = content.replace(
    'MAX buyable:',
    '{t("dashboard.trading.stats.max_buyable")}:'
);
content = content.replace(
    '{mode === "buy" ? "Buy Shares" : "Sell Shares"}',
    '{mode === "buy" ? t("dashboard.trading.actions.buy_shares") : t("dashboard.trading.actions.sell_shares")}'
);
content = content.replace(
    'Buy</button>',
    '{t("dashboard.trading.actions.buy")}</button>'
);
content = content.replace(
    'Sell</button>',
    '{t("dashboard.trading.actions.sell")}</button>'
);

fs.writeFileSync(pagePath, content);
console.log('StockMarketView labels replaced.');
