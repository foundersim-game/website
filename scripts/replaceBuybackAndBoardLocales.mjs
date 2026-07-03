import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// --- BUYBACK ---
content = content.replace(
    /<p className="text-\[0\.5625rem\] uppercase font-black text-slate-400">Shares Outstanding<\/p>/g,
    '<p className="text-[0.5625rem] uppercase font-black text-slate-400">{t("dashboard.buyback.shares_outstanding")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] uppercase font-black text-slate-400">Public Float Shares<\/p>/g,
    '<p className="text-[0.5625rem] uppercase font-black text-slate-400">{t("dashboard.buyback.float_shares")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] uppercase font-black text-slate-400">EPS \(Earnings \/ Sh\)<\/p>/g,
    '<p className="text-[0.5625rem] uppercase font-black text-slate-400">{t("dashboard.buyback.eps")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] uppercase font-black text-slate-400">Authorized Program<\/p>/g,
    '<p className="text-[0.5625rem] uppercase font-black text-slate-400">{t("dashboard.buyback.auth_program")}</p>'
);

content = content.replace(
    /<h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">Authorize Buyback Program<\/h4>/g,
    '<h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">{t("dashboard.buyback.auth_title")}</h4>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-slate-500 mt-1 mb-3">Instruct the Board of Directors to approve capital allocation for share repurchases\.<\/p>/g,
    '<p className="text-[0.625rem] text-slate-500 mt-1 mb-3">{t("dashboard.buyback.auth_desc")}</p>'
);
content = content.replace(
    /Authorize 1% Program<br \/>/g,
    '{t("dashboard.buyback.auth_1pct")}<br />'
);
content = content.replace(
    /Authorize 5% Program<br \/>/g,
    '{t("dashboard.buyback.auth_5pct")}<br />'
);

content = content.replace(
    /<h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">Open Market Buyback Program<\/h4>/g,
    '<h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">{t("dashboard.buyback.open_market_title")}</h4>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-slate-500 mt-1 mb-3">Execute repurchases against your active \{formatMoney\(auth\)\} authorization\. Retires public float shares to boost EPS\.<\/p>/g,
    '<p className="text-[0.625rem] text-slate-500 mt-1 mb-3">{t("dashboard.buyback.open_market_desc", { auth: formatMoney(auth) })}</p>'
);
content = content.replace(
    /Repurchase 0\.5% Float<br \/>/g,
    '{t("dashboard.buyback.rep_half_pct")}<br />'
);
content = content.replace(
    /Repurchase 2\.0% Float<br \/>/g,
    '{t("dashboard.buyback.rep_two_pct")}<br />'
);
content = content.replace(
    /Repurchase Max Available \(\{formatMoney\(Math\.min\(auth, m\.cash\)\)\}\)/g,
    '{t("dashboard.buyback.rep_max", { max: formatMoney(Math.min(auth, m.cash)) })}'
);
content = content.replace(
    /\(\+\{popSmall\}% pop\)/g,
    '({t("dashboard.buyback.pop_text", { pop: popSmall })})'
);
content = content.replace(
    /\(\+\{popMedium\}% pop\)/g,
    '({t("dashboard.buyback.pop_text", { pop: popMedium })})'
);

content = content.replace(
    /<h4 className="text-xs font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider">Dutch Auction Tender Offer<\/h4>/g,
    '<h4 className="text-xs font-black uppercase text-rose-700 dark:text-rose-400 tracking-wider">{t("dashboard.buyback.tender_title")}</h4>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-slate-500 mt-1 mb-3">Make a direct public offer to bypass open markets and buy back a massive block of shares at a \*\*10% Premium\*\* to defend against short sellers\.<\/p>/g,
    '<p className="text-[0.625rem] text-slate-500 mt-1 mb-3">{t("dashboard.buyback.tender_desc")}</p>'
);
content = content.replace(
    /Launch 5% Float Tender Offer \(10% Premium\)<br \/>/g,
    '{t("dashboard.buyback.tender_btn")}<br />'
);
content = content.replace(
    /\{formatMoney\(costTender\)\} \(Triggers \+6\.0% immediate price jump\)/g,
    '{t("dashboard.buyback.tender_sub", { cost: formatMoney(costTender) })}'
);

// Buyback Toast
content = content.replace(
    /"Buyback Cooldown Active"/g,
    't("dashboard.buyback.cooldown")'
);
content = content.replace(
    /`The SEC restricts back-to-back buybacks to prevent market manipulation\. Please wait \$\{3 - \(month - \(pub\?\.last_buyback_month \|\| -12\)\)\} more month\(s\)\.`/g,
    't("dashboard.buyback.cooldown_desc", { months: 3 - (month - (pub?.last_buyback_month || -12)) })'
);
content = content.replace(
    /"Insufficient Cash", \{ description: "You don't have enough corporate cash to execute this buyback\." \}/g,
    't("dashboard.buyback.no_cash"), { description: t("dashboard.buyback.no_cash_desc") }'
);
content = content.replace(
    /"Insufficient Authorization", \{ description: "The authorized program limit is too small\." \}/g,
    't("dashboard.buyback.no_auth"), { description: t("dashboard.buyback.no_auth_desc") }'
);
content = content.replace(
    /"Buyback Too Small", \{ description: "The buyback amount is too small to purchase a single share at current prices\." \}/g,
    't("dashboard.buyback.too_small"), { description: t("dashboard.buyback.too_small_desc") }'
);
content = content.replace(
    /"Buyback Executed!", \{ description: `Retired \$\{sharesRetired\.toLocaleString\("en-US"\)\} float shares!` \}/g,
    't("dashboard.buyback.success"), { description: t("dashboard.buyback.success_desc", { shares: sharesRetired.toLocaleString() }) }'
);

// --- BOARD ---
content = content.replace(
    /<h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Board of Directors<\/h3>/g,
    '<h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">{t("dashboard.board.title")}</h3>'
);
content = content.replace(
    /<p className="text-\[0\.625rem\] text-slate-500 mb-4">Execute high-level corporate governance actions\.<\/p>/g,
    '<p className="text-[0.625rem] text-slate-500 mb-4">{t("dashboard.board.desc")}</p>'
);
content = content.replace(
    /<p className="text-xs font-black text-slate-800 dark:text-slate-200">2-for-1 Stock Split<\/p>/g,
    '<p className="text-xs font-black text-slate-800 dark:text-slate-200">{t("dashboard.board.stock_split")}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-slate-500 mt-0\.5">Halves share price, doubles share count\. Boosts retail sentiment\.<\/p>/g,
    '<p className="text-[0.5625rem] text-slate-500 mt-0.5">{t("dashboard.board.stock_split_desc")}</p>'
);
content = content.replace(
    /\{(!pub \|\| pub\.share_price < 50) \? "Req \$50\+" : "Execute"\}/g,
    '{(!pub || pub.share_price < 50) ? t("dashboard.board.stock_split_req") : t("dashboard.board.stock_split_execute")}'
);
content = content.replace(
    /"Stock Split Executed", \{ description: "Retail investors are piling in!" \}/g,
    't("dashboard.board.split_executed"), { description: t("dashboard.board.split_executed_desc") }'
);
content = content.replace(
    /toast\.error\("Insufficient Corporate Cash"\);/g,
    'toast.error(t("dashboard.board.no_cash"));'
);
content = content.replace(
    /toast\.error\(`The Board rejected the resolution: \$\{name\}`\);/g,
    'toast.error(t("dashboard.board.rejected", { name }));'
);
content = content.replace(
    /toast\.success\("Hostile takeover defense active\."\);/g,
    'toast.success(t("dashboard.board.hostile_defense"));'
);
content = content.replace(
    /toast\.success\("Resolution Passed"\);/g,
    'toast.success(t("dashboard.board.resolution_passed"));'
);

content = content.replace(
    /\{ emoji: "🧑‍⚖️", label: "Appoint Independent Director", desc: "Brings oversight\. \(\+5 CEO Rep, \+5 Brand\)", btn: "Appoint" \}/g,
    '{ emoji: "🧑‍⚖️", label: "Appoint Independent Director", display: t("dashboard.board.resolutions.indep_director.name"), desc: t("dashboard.board.resolutions.indep_director.desc"), btn: t("dashboard.board.resolutions.indep_director.btn") }'
);
content = content.replace(
    /\{ emoji: "🏝️", label: "Executive Retreat", desc: "Fully cures Founder Burnout\. \(0 Burnout\)", btn: "Retreat" \}/g,
    '{ emoji: "🏝️", label: "Executive Retreat", display: t("dashboard.board.resolutions.retreat.name"), desc: t("dashboard.board.resolutions.retreat.desc"), btn: t("dashboard.board.resolutions.retreat.btn") }'
);
content = content.replace(
    /\{ emoji: "🎨", label: "Rebrand Company", desc: "Major marketing overhaul\. \(\+20 Brand Awareness\)", btn: "Rebrand" \}/g,
    '{ emoji: "🎨", label: "Rebrand Company", display: t("dashboard.board.resolutions.rebrand.name"), desc: t("dashboard.board.resolutions.rebrand.desc"), btn: t("dashboard.board.resolutions.rebrand.btn") }'
);
content = content.replace(
    /\{ emoji: "🛡️", label: "Adopt Poison Pill", desc: "Defends against hostile takeovers\.", btn: "Adopt", locked: !pub \}/g,
    '{ emoji: "🛡️", label: "Adopt Poison Pill", display: t("dashboard.board.resolutions.poison_pill.name"), desc: t("dashboard.board.resolutions.poison_pill.desc"), btn: t("dashboard.board.resolutions.poison_pill.btn"), locked: !pub }'
);

content = content.replace(
    /<p className="text-xs font-black text-slate-800 dark:text-slate-200">\{opt\.label\}<\/p>/g,
    '<p className="text-xs font-black text-slate-800 dark:text-slate-200">{(opt as any).display}</p>'
);
content = content.replace(
    /<p className="text-\[0\.5625rem\] text-slate-500 mt-0\.5">Costs \{formatMoney\(cost\)\}\. \{opt\.desc\}<\/p>/g,
    '<p className="text-[0.5625rem] text-slate-500 mt-0.5">{t("dashboard.board.costs_format", { amount: formatMoney(cost), desc: opt.desc })}</p>'
);
content = content.replace(
    /\{opt\.locked \? "Post-IPO" : opt\.btn\}/g,
    '{opt.locked ? t("dashboard.board.post_ipo") : opt.btn}'
);

fs.writeFileSync(pagePath, content);
console.log('Buyback & Board locales replaced.');
