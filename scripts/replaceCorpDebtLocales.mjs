import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace Corporate Debt strings
content = content.replace(
    /🏦 Corporate Debt/g,
    '🏦 {t("dashboard.debt.title")}'
);
content = content.replace(
    /`Active Debt Obligations: \$\{formatMoney\(totalDebtMonthly\)\}\/mo`/g,
    't("dashboard.debt.active_obligations_summary", { amount: formatMoney(totalDebtMonthly) })'
);
content = content.replace(
    /"Reach Series A to access corporate debt instruments\."/g,
    't("dashboard.debt.locked_summary")'
);
content = content.replace(
    /<span className="text-rose-300 font-medium">Credit Score<\/span>/g,
    '<span className="text-rose-300 font-medium">{t("dashboard.debt.credit_score")}</span>'
);
content = content.replace(
    /Requires Series A/g,
    '{t("dashboard.debt.requires_series_a")}'
);
content = content.replace(
    /Close your Series A round to access venture debt and non-dilutive financing instruments\./g,
    '{t("dashboard.debt.requires_series_a_desc")}'
);
content = content.replace(
    /Active Obligations/g,
    '{t("dashboard.debt.active_obligations")}'
);
content = content.replace(
    /\{formatMoney\(d\.monthly_payment\)\}\/mo · \{d\.months_left\}mo left/g,
    '{t("dashboard.debt.obligation_detail", { amount: formatMoney(d.monthly_payment), months: d.months_left })}'
);
content = content.replace(
    /Requires \{minScoreRequired\} Score/g,
    '{t("dashboard.debt.requires_score", { score: minScoreRequired })}'
);
content = content.replace(
    /"Credit Score Too Low"/g,
    't("dashboard.debt.score_too_low")'
);
content = content.replace(
    /`You need a score of \$\{minScoreRequired\} to access this\.`/g,
    't("dashboard.debt.score_too_low_desc", { score: minScoreRequired })'
);
content = content.replace(
    /`Debt Approved`/g,
    't("dashboard.debt.debt_approved")'
);
content = content.replace(
    /`\$\{formatMoney\(dp\.amount\)\} deposited\. \$\{formatMoney\(monthly\)\}\/mo repayment\.`/g,
    't("dashboard.debt.debt_approved_desc", { amount: formatMoney(dp.amount), monthly: formatMoney(monthly) })'
);
content = content.replace(
    /"Locked"/g,
    't("dashboard.debt.locked_btn")'
);
content = content.replace(
    /`Draw \$\{formatMoney\(dp\.amount\)\} @ \$\{dp\.rate\}% APR`/g,
    't("dashboard.debt.draw_btn", { amount: formatMoney(dp.amount), rate: dp.rate })'
);

// We need to replace the names and descs in the array as well, but they are defined outside the render.
content = content.replace(
    /name: "Venture Debt", emoji: "🏦", provider: "Silicon Valley Bank", term: 24, amount: Math\.floor\(startup\.valuation \* 0\.05\), rate: 8\.5, desc: "Non-dilutive financing tied to ARR\. Common for Series A\+\."/g,
    'name: t("dashboard.debt.products.venture_debt.name"), emoji: "🏦", provider: "Silicon Valley Bank", term: 24, amount: Math.floor(startup.valuation * 0.05), rate: 8.5, desc: t("dashboard.debt.products.venture_debt.desc")'
);
content = content.replace(
    /name: "Revenue-Based Loan", emoji: "📊", provider: "Clearco Capital", term: 18, amount: Math\.floor\(startup\.metrics\.revenue \* 6\), rate: 12\.0, desc: "Repay as % of monthly revenue\. Ideal for high-growth SaaS\."/g,
    'name: t("dashboard.debt.products.revenue_loan.name"), emoji: "📊", provider: "Clearco Capital", term: 18, amount: Math.floor(startup.metrics.revenue * 6), rate: 12.0, desc: t("dashboard.debt.products.revenue_loan.desc")'
);
content = content.replace(
    /name: "Bridge Loan", emoji: "⛓️", provider: "Brex Financial", term: 12, amount: Math\.floor\(startup\.valuation \* 0\.02\), rate: 15\.0, desc: "Short-term bridge to your next funding round\. Quick approval\."/g,
    'name: t("dashboard.debt.products.bridge_loan.name"), emoji: "⛓️", provider: "Brex Financial", term: 12, amount: Math.floor(startup.valuation * 0.02), rate: 15.0, desc: t("dashboard.debt.products.bridge_loan.desc")'
);

// The button has a check for "Venture Debt" or "Revenue-Based Loan". I should fix that to use a static ID, or change the condition.
// `dp.name === "Venture Debt"` needs to check the ID or something. 
// Ah, `debtProducts` is defined locally. Let's add an `id` field.
content = content.replace(
    /\{ name: t\("dashboard\.debt\.products\.venture_debt\.name"\), emoji: "🏦"/g,
    '{ id: "venture_debt", name: t("dashboard.debt.products.venture_debt.name"), emoji: "🏦"'
);
content = content.replace(
    /\{ name: t\("dashboard\.debt\.products\.revenue_loan\.name"\), emoji: "📊"/g,
    '{ id: "revenue_loan", name: t("dashboard.debt.products.revenue_loan.name"), emoji: "📊"'
);
content = content.replace(
    /\{ name: t\("dashboard\.debt\.products\.bridge_loan\.name"\), emoji: "⛓️"/g,
    '{ id: "bridge_loan", name: t("dashboard.debt.products.bridge_loan.name"), emoji: "⛓️"'
);
content = content.replace(
    /const minScoreRequired = dp\.name === "Venture Debt" \? 720 : dp\.name === "Revenue-Based Loan" \? 650 : 600;/g,
    'const minScoreRequired = (dp as any).id === "venture_debt" ? 720 : (dp as any).id === "revenue_loan" ? 650 : 600;'
);

fs.writeFileSync(pagePath, content);
console.log('Corp Debt locales replaced.');
