import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace Product
content = content.replace(
    /\{sheetHeader\("🔧", "Product", "Instant technical execution"\)\}/g,
    '{sheetHeader("🔧", t("dashboard.sheets.product.title"), t("dashboard.sheets.product.desc"))}'
);
// Replace Marketing
content = content.replace(
    /\{sheetHeader\("📈", "Marketing", "Actions \+ Ongoing Programs"\)\}/g,
    '{sheetHeader("📈", t("dashboard.sheets.marketing.title"), t("dashboard.sheets.marketing.desc"))}'
);
// Replace Funding
content = content.replace(
    /\{sheetHeader\("🏦", "Funding", "Stage: SEC Quiet Period"\)\}/g,
    '{sheetHeader("🏦", t("dashboard.sheets.funding.title"), t("dashboard.sheets.funding.stage_sec"))}'
);
content = content.replace(
    /\{sheetHeader\("🏦", "Funding", `Stage: \$\{stage\} · \$\{founderEquity\.toFixed\(0\)\}% founder equity`\)\}/g,
    '{sheetHeader("🏦", t("dashboard.sheets.funding.title"), t("dashboard.sheets.funding.stage_info", { stage, equity: founderEquity.toFixed(0) }))}'
);
// Replace Public Markets
content = content.replace(
    /\{sheetHeader\("🏛️", "Public Markets", `Ticker: \$\{startup\.symbol \|\| "CORP"\} · \$\{founderEquity\.toFixed\(1\)\}% founder equity`\)\}/g,
    '{sheetHeader("🏛️", t("dashboard.sheets.public_markets.title"), t("dashboard.sheets.public_markets.ticker_info", { symbol: startup.symbol || "CORP", equity: founderEquity.toFixed(1) }))}'
);
// Replace Founder Focus
content = content.replace(
    /\{sheetHeader\("👤", founder\.name, `⚡ \$\{focusHoursUsed\}h \/ \$\{maxHours\}h focus used this month`\)\}/g,
    '{sheetHeader("👤", founder.name, t("dashboard.sheets.founder.focus_used", { used: focusHoursUsed, max: maxHours }))}'
);
// Replace Market & Rivals
content = content.replace(
    /\{sheetHeader\("⚔️", "Market & Rivals", "Track your competition"\)\}/g,
    '{sheetHeader("⚔️", t("dashboard.sheets.market.title"), t("dashboard.sheets.market.desc"))}'
);
// Replace Personal Lifestyle
content = content.replace(
    /\{sheetHeader\("💎", "Personal Lifestyle", "Spend your personal wealth"\)\}/g,
    '{sheetHeader("💎", t("dashboard.sheets.lifestyle.title"), t("dashboard.sheets.lifestyle.desc"))}'
);
// Replace Margin Account
content = content.replace(
    /\{sheetHeader\("💳", "Margin Account", "Personal Credit Terminal"\)\}/g,
    '{sheetHeader("💳", t("dashboard.sheets.margin.title"), t("dashboard.sheets.margin.desc"))}'
);
// Replace Lobbying & Capture
content = content.replace(
    /\{sheetHeader\("🏛️", "Lobbying & Capture", "Washington Influence Terminal"\)\}/g,
    '{sheetHeader("🏛️", t("dashboard.sheets.lobbying.title"), t("dashboard.sheets.lobbying.desc"))}'
);
// Replace Buybacks
content = content.replace(
    /\{sheetHeader\("💸", "Buybacks", "Capital Allocation Terminal"\)\}/g,
    '{sheetHeader("💸", t("dashboard.sheets.buybacks.title"), t("dashboard.sheets.buybacks.desc"))}'
);

fs.writeFileSync(pagePath, content);
console.log('All Sheets locales replaced.');
