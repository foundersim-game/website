import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace terminal headers
content = content.replace(
    /terminalTab === "operations" \? "🏢 Operations" : terminalTab === "market" \? "📈 Strategy" : terminalTab === "personal" \? "👤 Founder" : "🏛️ Corporate"/g,
    'terminalTab === "operations" ? t("dashboard.menu.terminals.operations") : terminalTab === "market" ? t("dashboard.menu.terminals.strategy") : terminalTab === "personal" ? t("dashboard.menu.terminals.founder") : t("dashboard.menu.terminals.corporate")'
);

// Replace category descriptions
content = content.replace(/desc: "Build & manage tech"/g, 'desc: t("dashboard.menu.categories.product_desc")');
content = content.replace(/desc: "Acquire users"/g, 'desc: t("dashboard.menu.categories.marketing_desc")');
content = content.replace(/desc: "Recruit & manage team"/g, 'desc: t("dashboard.menu.categories.hiring_desc")');
content = content.replace(/desc: "Financials & metrics"/g, 'desc: t("dashboard.menu.categories.stats_desc")');
content = content.replace(/desc: "Attack competitors"/g, 'desc: t("dashboard.menu.categories.market_desc")');
content = content.replace(/desc: "Public relations"/g, 'desc: t("dashboard.menu.categories.analysts_desc")');
content = content.replace(/desc: "M&A acquisition"/g, 'desc: t("dashboard.menu.categories.manda_acquire_desc")');
content = content.replace(/desc: "Subsidiary oversight"/g, 'desc: t("dashboard.menu.categories.subsidiary_desc")');
content = content.replace(/desc: "ESOP & Stock Grants"/g, 'desc: t("dashboard.menu.categories.options_desc")');
content = content.replace(/desc: "Raise capital"/g, 'desc: t("dashboard.menu.categories.funding_desc")');
content = content.replace(/desc: "Manage board"/g, 'desc: t("dashboard.menu.categories.board_mgmt_desc")');
content = content.replace(/desc: "Settle lawsuits"/g, 'desc: t("dashboard.menu.categories.fines_desc")');
content = content.replace(/desc: "Influence regulations"/g, 'desc: t("dashboard.menu.categories.lobbying_desc")');
content = content.replace(/desc: "Share buybacks"/g, 'desc: t("dashboard.menu.categories.buyback_desc")');
content = content.replace(/desc: "Venture debt & bonds"/g, 'desc: t("dashboard.menu.categories.corporate_debt_desc")');
content = content.replace(/desc: "Manage energy"/g, 'desc: t("dashboard.menu.categories.founder_desc")');
content = content.replace(/desc: "Luxury assets & perks"/g, 'desc: t("dashboard.menu.categories.lifestyle_desc")');
content = content.replace(/desc: "Charity for reputation"/g, 'desc: t("dashboard.menu.categories.philanthropy_desc")');
content = content.replace(/desc: "Borrow against stock"/g, 'desc: t("dashboard.menu.categories.margin_loan_desc")');
content = content.replace(/desc: "Automated trading"/g, 'desc: t("dashboard.menu.categories.b51_desc")');

// Replace lock messages
content = content.replace(
    /import\('sonner'\)\.then\(m => m\.toast\.error\("Locked Module", \{ description: "This feature unlocks at a later corporate stage\." \}\)\);/g,
    'import("sonner").then(m => m.toast.error(t("dashboard.menu.locks.locked_module"), { description: t("dashboard.menu.locks.feature_unlocks_later") }));'
);
content = content.replace(
    /\{locked \? "Unlocks Post-IPO" : cat\.desc\}/g,
    '{locked ? t("dashboard.menu.locks.unlocks_post_ipo") : cat.desc}'
);

fs.writeFileSync(pagePath, content);
console.log('Menu locales replaced.');
