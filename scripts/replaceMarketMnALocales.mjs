import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// --- MARKET ---
content = content.replace(
    /The market is quiet\.\.\. for now\./g,
    '{t("dashboard.market.quiet")}'
);
content = content.replace(
    /Sentiment: /g,
    '{t("dashboard.market.sentiment")} '
);
content = content.replace(
    /<p className="text-\[0\.5rem\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0\.5 leading-none">Valuation<\/p>/g,
    '<p className="text-[0.5rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5 leading-none">{t("dashboard.market.valuation")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5rem\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0\.5 leading-none">Users<\/p>/g,
    '<p className="text-[0.5rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5 leading-none">{t("dashboard.market.users")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5rem\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0\.5 leading-none">Velocity<\/p>/g,
    '<p className="text-[0.5rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5 leading-none">{t("dashboard.market.velocity")}</p>'
);
content = content.replace(
    /Battle Actions/g,
    '{t("dashboard.market.battle_actions")}'
);
content = content.replace(
    /<span>👑 Hostile Takeover Chadly for \{formatMoney\(Math\.floor\(comp\.valuation \* 1\.25\)\)\}<\/span>/g,
    '<span>👑 {t("dashboard.market.hostile_takeover", { amount: formatMoney(Math.floor(comp.valuation * 1.25)) })}</span>'
);
content = content.replace(
    /Last Intel:/g,
    '{t("dashboard.market.last_intel")}'
);
content = content.replace(
    /success<\/span>/g,
    '{t("dashboard.market.success")}</span>'
);
content = content.replace(
    /Last Move: /g,
    '{t("dashboard.market.last_move")} '
);
content = content.replace(
    /Due Diligence Intel/g,
    '{t("dashboard.market.due_diligence_intel")}'
);
content = content.replace(
    /Integration Risk:/g,
    '{t("dashboard.market.integration_risk")}'
);
content = content.replace(
    /Financial Health:/g,
    '{t("dashboard.market.financial_health")}'
);
content = content.replace(
    /"⚠️ Flight risk and tech fragmentation\. Est\. -20 Team Morale\."/g,
    't("dashboard.market.risk_high")'
);
content = content.replace(
    /"⚠️ Redundancies, moderate friction\. Est\. -10 Team Morale\."/g,
    't("dashboard.market.risk_med")'
);
content = content.replace(
    /"✅ Culture fit, clean stack\. Est\. \+5 Team Morale boost\."/g,
    't("dashboard.market.risk_low")'
);
content = content.replace(
    /🔬 Run Due Diligence \(\{formatMoney\(Math\.min\(250000, Math\.max\(5000, Math\.floor\(comp\.valuation \* 0\.005\)\)\)\)\}\)/g,
    '🔬 {t("dashboard.market.run_dd", { amount: formatMoney(Math.min(250000, Math.max(5000, Math.floor(comp.valuation * 0.005)))) })}'
);
content = content.replace(
    /🕵️<\/span> Gather Intel \(Ad\)/g,
    '🕵️</span> {t("dashboard.market.gather_intel")}'
);
content = content.replace(
    /`Takeover Public Rival for \$\{formatMoney\(Math\.floor\(comp\.valuation \* 1\.15\)\)\}`/g,
    't("dashboard.market.takeover_public", { amount: formatMoney(Math.floor(comp.valuation * 1.15)) })'
);
content = content.replace(
    /`Buyout Rival for \$\{formatMoney\(comp\.valuation\)\}`/g,
    't("dashboard.market.buyout_rival", { amount: formatMoney(comp.valuation) })'
);

content = content.replace(
    /"Corporate Espionage Successful!", \{ description: "Integration risk lowered to 'Low' and valuation reduced by 10%\.", icon: "🕵️" \}/g,
    't("dashboard.market.espionage_success"), { description: t("dashboard.market.espionage_desc"), icon: "🕵️" }'
);
content = content.replace(
    /"Not enough corporate cash!"/g,
    't("dashboard.market.no_cash")'
);
content = content.replace(
    /"Due Diligence Complete", \{ description: `Unlocked intelligence report for \$\{comp\.name\}` \}/g,
    't("dashboard.market.dd_complete"), { description: t("dashboard.market.dd_desc", { name: comp.name }) }'
);

// --- M&A ---
content = content.replace(
    /<h3 className="text-xs font-black text-blue-200 uppercase tracking-widest">🦈 M&A Strategy<\/h3>/g,
    '<h3 className="text-xs font-black text-blue-200 uppercase tracking-widest">{t("dashboard.manda.strategy_title")}</h3>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-blue-400">Acquire active market assets to scale your corporate treasury and operations\.<\/p>/g,
    '<p className="text-[0.625rem] text-blue-400">{t("dashboard.manda.strategy_desc")}</p>'
);
content = content.replace(
    /<h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">Scan Market<\/h3>/g,
    '<h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">{t("dashboard.manda.scan_market")}</h3>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-slate-500 mb-4 mt-2">Find potential acquisition targets scaled to your current valuation\.<\/p>/g,
    '<p className="text-[0.625rem] text-slate-500 mb-4 mt-2">{t("dashboard.manda.scan_market_desc")}</p>'
);
content = content.replace(
    /Scan Market for Targets/g,
    '{t("dashboard.manda.scan_btn")}'
);
content = content.replace(
    /⟳ Rescan Market/g,
    '{t("dashboard.manda.rescan")}'
);
content = content.replace(
    /Titan -50% Off/g,
    '{t("dashboard.manda.titan_off")}'
);
content = content.replace(
    /Due Diligence Report/g,
    '{t("dashboard.manda.dd_report")}'
);
content = content.replace(
    />True Value:</g,
    '>{t("dashboard.manda.true_value")}'
);
content = content.replace(
    />Financial Health:</g,
    '>{t("dashboard.manda.fin_health")}'
);
content = content.replace(
    />Integration Risk:</g,
    '>{t("dashboard.manda.integration_risk")}'
);
content = content.replace(
    /"⚠️ Fragmented tech stack, flight risk of core team\. Est\. -20 Team Morale impact on merge\."/g,
    't("dashboard.manda.risk_high")'
);
content = content.replace(
    /"⚠️ Moderate culture clash, redundant roles to consolidate\. Est\. -10 Team Morale\."/g,
    't("dashboard.manda.risk_med")'
);
content = content.replace(
    /"✅ Clean codebase, shared tech stack\. Est\. \+5 Team Morale boost\."/g,
    't("dashboard.manda.risk_low")'
);
content = content.replace(
    /Due Diligence \(\{formatMoney\(ddCost\)\}\)/g,
    '{t("dashboard.manda.run_dd", { amount: formatMoney(ddCost) })}'
);
content = content.replace(
    /Acquire · \{formatMoney\(t\.ask\)\}/g,
    '{t("dashboard.manda.acquire_btn", { amount: formatMoney(t.ask) })}'
);
content = content.replace(
    /"Insufficient cash for Due Diligence\."/g,
    't("dashboard.manda.no_cash_dd")'
);
content = content.replace(
    /`Due Diligence Completed`, \{ description: `Revealed hidden metrics for \$\{t\.name\}\.` \}/g,
    't("dashboard.manda.dd_completed"), { description: t("dashboard.manda.dd_desc", { name: t.name }) }'
);
content = content.replace(
    /"Insufficient cash for this acquisition\."/g,
    't("dashboard.manda.no_cash_acq")'
);
content = content.replace(
    /`Acquisition Complete`, \{ description: `\$\{t\.name\} is now a subsidiary\.` \}/g,
    't("dashboard.manda.acq_complete"), { description: t("dashboard.manda.acq_desc", { name: t.name }) }'
);

// We need to handle `<p className="text-[0.4375rem] font-black text-slate-400 dark:text-slate-500 uppercase">Valuation</p>` in the other comp view too.
content = content.replace(
    /<p className="text-\[0\.4375rem\] font-black text-slate-400 dark:text-slate-500 uppercase">Valuation<\/p>/g,
    '<p className="text-[0.4375rem] font-black text-slate-400 dark:text-slate-500 uppercase">{t("dashboard.market.valuation")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.4375rem\] font-black text-slate-400 dark:text-slate-500 uppercase">Users<\/p>/g,
    '<p className="text-[0.4375rem] font-black text-slate-400 dark:text-slate-500 uppercase">{t("dashboard.market.users")}</p>'
);

fs.writeFileSync(pagePath, content);
console.log('Market and M&A locales replaced.');
