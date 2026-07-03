import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// --- FINES ---
content = content.replace(
    /<h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Legal & Compliance<\/h3>/g,
    '<h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">{t("dashboard.fines.title")}</h3>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-slate-500">Manage ongoing litigation and regulatory risk\.<\/p>/g,
    '<p className="text-[0.625rem] text-slate-500">{t("dashboard.fines.desc")}</p>'
);
content = content.replace(
    /💎 The PR Fixer/g,
    '{t("dashboard.fines.pr_fixer")}'
);
content = content.replace(
    /Instantly settle all lawsuits, reset Board Anger, and restore Reputation\./g,
    '{t("dashboard.fines.pr_fixer_desc")}'
);
content = content.replace(
    /🛑 Make Problems Disappear/g,
    '{t("dashboard.fines.make_disappear")}'
);
content = content.replace(
    /<h3 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-widest">No Active Lawsuits<\/h3>/g,
    '<h3 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-widest">{t("dashboard.fines.no_lawsuits")}</h3>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-rose-700 dark:text-rose-400 mt-1 max-w-xs">Your company currently has no pending regulatory fines or class-action lawsuits\.<\/p>/g,
    '<p className="text-[0.625rem] text-rose-700 dark:text-rose-400 mt-1 max-w-xs">{t("dashboard.fines.no_lawsuits_desc")}</p>'
);

content = content.replace(
    /<p className="text-\[0\.5rem\] font-black text-slate-400 uppercase tracking-widest">Demand<\/p>/g,
    '<p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest">{t("dashboard.fines.demand")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5rem\] font-black text-slate-400 uppercase tracking-widest">Trial In<\/p>/g,
    '<p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest">{t("dashboard.fines.trial_in")}</p>'
);
content = content.replace(
    /\{suit\.months_to_trial\} Months/g,
    '{suit.months_to_trial} {t("dashboard.fines.months")}'
);
content = content.replace(
    /Settle for \{formatMoney\(suit\.settlement_offer \|\| suit\.demand_amount\)\}/g,
    '{t("dashboard.fines.settle_for", { amount: formatMoney(suit.settlement_offer || suit.demand_amount) })}'
);
content = content.replace(
    /Fighting in Court/g,
    '{t("dashboard.fines.fighting")}'
);
content = content.replace(
    /-\{formatMoney\(suit\.legal_fees_per_month\)\}\/mo fees/g,
    '{t("dashboard.fines.fees_mo", { amount: formatMoney(suit.legal_fees_per_month) })}'
);
content = content.replace(
    /"Pro Bono Exhausted"/g,
    't("dashboard.fines.pro_bono_exhausted")'
);
content = content.replace(
    /`Pro Bono Counsel \(\$\{3 - \(suit\.proBonoUses \|\| 0\)\} Left\)`/g,
    't("dashboard.fines.pro_bono", { left: 3 - (suit.proBonoUses || 0) })'
);
content = content.replace(
    /"Insufficient Funds", \{ description: "You don't have enough corporate cash to settle\." \}/g,
    't("dashboard.fines.insufficient_funds"), { description: t("dashboard.fines.insufficient_desc") }'
);
content = content.replace(
    /toast\.success\("Case Settled"\);/g,
    'toast.success(t("dashboard.fines.case_settled"));'
);
content = content.replace(
    /"Pro Bono Limit Reached", \{ description: "You can only use Pro Bono counsel 3 times per lawsuit\." \}/g,
    't("dashboard.fines.limit_reached"), { description: t("dashboard.fines.limit_desc") }'
);
content = content.replace(
    /"Pro Bono Counsel Secured!", \{ description: "Settlement demand reduced by 20% and trial win probability increased by 15%\.", icon: "💼" \}/g,
    't("dashboard.fines.pro_bono_secured"), { description: t("dashboard.fines.pro_bono_secured_desc"), icon: "💼" }'
);


// --- LOBBYING ---
content = content.replace(
    /💎 Bribe a Senator/g,
    '{t("dashboard.lobbying.bribe_senator")}'
);
content = content.replace(
    /Call in a massive favor\. Forces a global Bull Market for 12 months\./g,
    '{t("dashboard.lobbying.bribe_desc")}'
);
content = content.replace(
    /📈 Force Bull Market/g,
    '{t("dashboard.lobbying.force_bull")}'
);
content = content.replace(
    /<h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Influence Score<\/h3>/g,
    '<h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">{t("dashboard.lobbying.influence_score")}</h3>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-slate-400 mt-0\.5">Your regulatory capture percentage<\/p>/g,
    '<p className="text-[0.5625rem] text-slate-400 mt-0.5">{t("dashboard.lobbying.capture_pct")}</p>'
);
content = content.replace(
    /Tier 1 \(30\+\): Audit & Investigation Protection/g,
    '{t("dashboard.lobbying.tier1")}'
);
content = content.replace(
    /-50% Crisis Chance/g,
    '{t("dashboard.lobbying.tier1_perk")}'
);
content = content.replace(
    /Tier 2 \(70\+\): Complete Regulatory Capture/g,
    '{t("dashboard.lobbying.tier2")}'
);
content = content.replace(
    /\+15% Monthly Tax Credit/g,
    '{t("dashboard.lobbying.tier2_perk")}'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] font-black text-slate-400 uppercase tracking-widest mb-3">Lobbying Initiatives &amp; Campaigns<\/p>/g,
    '<p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mb-3">{t("dashboard.lobbying.initiatives")}</p>'
);
content = content.replace(
    /<p className="text-xs font-black text-slate-800 dark:text-slate-100">K-Street Law Retainer<\/p>/g,
    '<p className="text-xs font-black text-slate-800 dark:text-slate-100">{t("dashboard.lobbying.k_street")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-slate-400 font-bold mt-0\.5">-\$2M Corporate Cash<\/p>/g,
    '<p className="text-[0.5625rem] text-slate-400 font-bold mt-0.5">{t("dashboard.lobbying.k_street_cost")}</p>'
);
content = content.replace(
    /<p className="text-xs font-black text-slate-800 dark:text-slate-100">Targeted PAC Contribution<\/p>/g,
    '<p className="text-xs font-black text-slate-800 dark:text-slate-100">{t("dashboard.lobbying.pac")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-slate-400 font-bold mt-0\.5">-\$10M Corporate Cash<\/p>/g,
    '<p className="text-[0.5625rem] text-slate-400 font-bold mt-0.5">{t("dashboard.lobbying.pac_cost")}</p>'
);
content = content.replace(
    /<p className="text-xs font-black text-slate-800 dark:text-slate-100">Federal Regulatory Liaison<\/p>/g,
    '<p className="text-xs font-black text-slate-800 dark:text-slate-100">{t("dashboard.lobbying.liaison")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-slate-400 font-bold mt-0\.5">-\$20M Corporate Cash · Boost Reputation<\/p>/g,
    '<p className="text-[0.5625rem] text-slate-400 font-bold mt-0.5">{t("dashboard.lobbying.liaison_cost")}</p>'
);
content = content.replace(
    /<p className="text-xs font-black text-indigo-900 dark:text-indigo-300">Bipartisan Coalition Sponsorship<\/p>/g,
    '<p className="text-xs font-black text-indigo-900 dark:text-indigo-300">{t("dashboard.lobbying.coalition")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-indigo-700\/50 dark:text-indigo-400\/50 font-bold mt-0\.5">-\$50M Corporate Cash · Secures \$15M Federal Grant<\/p>/g,
    '<p className="text-[0.5625rem] text-indigo-700/50 dark:text-indigo-400/50 font-bold mt-0.5">{t("dashboard.lobbying.coalition_cost")}</p>'
);
content = content.replace(
    /\+4 Influence/g,
    '{t("dashboard.lobbying.add_infl", { val: 4 })}'
);
content = content.replace(
    /\+15 Influence/g,
    '{t("dashboard.lobbying.add_infl", { val: 15 })}'
);
content = content.replace(
    /\+30 Influence/g,
    '{t("dashboard.lobbying.add_infl", { val: 30 })}'
);
content = content.replace(
    /\+60 Influence/g,
    '{t("dashboard.lobbying.add_infl", { val: 60 })}'
);

content = content.replace(
    /"Insufficient Cash", \{ description: "You don't have enough corporate cash to fund this campaign\." \}/g,
    't("dashboard.lobbying.no_cash"), { description: t("dashboard.lobbying.no_cash_desc") }'
);
content = content.replace(
    /"Liaison Active", \{ description: "Your Washington influence has elevated your reputation!" \}/g,
    't("dashboard.lobbying.liaison_active"), { description: t("dashboard.lobbying.liaison_active_desc") }'
);
content = content.replace(
    /"Subsidy Secured!", \{ description: "Received \$15M federal R&D grant!" \}/g,
    't("dashboard.lobbying.subsidy"), { description: t("dashboard.lobbying.subsidy_desc") }'
);
content = content.replace(
    /"PAC Funded", \{ description: `Lobbying Influence increased by \+\$\{points\}!` \}/g,
    't("dashboard.lobbying.pac_funded"), { description: t("dashboard.lobbying.pac_funded_desc", { val: points }) }'
);

fs.writeFileSync(pagePath, content);
console.log('Fines and Lobbying locales replaced.');
