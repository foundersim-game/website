import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// --- Hiring Replacement ---
content = content.replace(
    /\{sheetHeader\("👥", "Hiring Pipeline", `\$\{employees\.length\} on team · \$\{m\.team_morale \|\| 0\}% morale`\)\}/g,
    '{sheetHeader("👥", t("dashboard.ops.hiring.pipeline"), t("dashboard.ops.hiring.on_team", { count: employees.length, morale: m.team_morale || 0 }))}'
);
content = content.replace(
    /<p className="text-\[0\.5rem\] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">🎯 Hiring Priority for \{pb\.model\}<\/p>/g,
    '<p className="text-[0.5rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{t("dashboard.ops.hiring.hiring_priority", { model: pb.model })}</p>'
);
content = content.replace(
    /💎 Poach a 10x Rockstar/g,
    '{t("dashboard.ops.hiring.poach_10x")}'
);
content = content.replace(
    /Bypass the RNG\. Instantly hire a Level 99 Senior employee\./g,
    '{t("dashboard.ops.hiring.poach_desc")}'
);

content = content.replace(
    /\{ role: "engineer" as const, emoji: "👨‍💻", label: "Software Engineer",/g,
    '{ role: "engineer" as const, emoji: "👨‍💻", label: t("dashboard.ops.hiring.roles.engineer"),'
);
content = content.replace(
    /\{ role: "marketer" as const, emoji: "📣", label: "Growth Marketer",/g,
    '{ role: "marketer" as const, emoji: "📣", label: t("dashboard.ops.hiring.roles.marketer"),'
);
content = content.replace(
    /\{ role: "legal" as const, emoji: "⚖️", label: "Legal Counsel",/g,
    '{ role: "legal" as const, emoji: "⚖️", label: t("dashboard.ops.hiring.roles.legal"),'
);

content = content.replace(
    /<span className="flex items-center gap-2">👨‍💻 Poach Software Engineer<\/span>/g,
    '<span className="flex items-center gap-2">👨‍💻 {t("dashboard.ops.hiring.poach_btn", { role: t("dashboard.ops.hiring.roles.engineer") })}</span>'
);
content = content.replace(
    /<span className="flex items-center gap-2">📣 Poach Growth Marketer<\/span>/g,
    '<span className="flex items-center gap-2">📣 {t("dashboard.ops.hiring.poach_btn", { role: t("dashboard.ops.hiring.roles.marketer") })}</span>'
);
content = content.replace(
    /<span className="flex items-center gap-2">🤝 Poach Head of Sales<\/span>/g,
    '<span className="flex items-center gap-2">🤝 {t("dashboard.ops.hiring.poach_btn", { role: activeConfig.salesRoleName })}</span>'
);

content = content.replace(
    /\{ label: "Lead", skillBase: 88, salaryBase: 14000, cultureFit: 88 \},/g,
    '{ label: t("dashboard.ops.hiring.tiers.lead"), skillBase: 88, salaryBase: 14000, cultureFit: 88 },'
);
content = content.replace(
    /\{ label: "Senior", skillBase: 75, salaryBase: 10000, cultureFit: 85 \},/g,
    '{ label: t("dashboard.ops.hiring.tiers.senior"), skillBase: 75, salaryBase: 10000, cultureFit: 85 },'
);
content = content.replace(
    /\{ label: "Mid", skillBase: 55, salaryBase: 7000, cultureFit: 72 \},/g,
    '{ label: t("dashboard.ops.hiring.tiers.mid"), skillBase: 55, salaryBase: 7000, cultureFit: 72 },'
);
content = content.replace(
    /\{ label: "Junior", skillBase: 35, salaryBase: 4000, cultureFit: 65 \},/g,
    '{ label: t("dashboard.ops.hiring.tiers.junior"), skillBase: 35, salaryBase: 4000, cultureFit: 65 },'
);

content = content.replace(
    /No candidates available for \{def\.label\} this month\./g,
    '{t("dashboard.ops.hiring.no_candidates", { role: def.label })}'
);
content = content.replace(
    /\$\{(c\.salary || 0)\.toLocaleString\(\)\}\/mo/g,
    '{t("dashboard.ops.hiring.card.salary", { salary: (c.salary || 0).toLocaleString() })}'
);
content = content.replace(
    /Skill \{c\.skill\}/g,
    '{t("dashboard.ops.hiring.card.skill", { skill: c.skill })}'
);
content = content.replace(
    /Culture \{c\.cultureFit\}/g,
    '{t("dashboard.ops.hiring.card.culture", { fit: c.cultureFit })}'
);
content = content.replace(
    /Hire \{c\.tierLabel\}/g,
    '{t("dashboard.ops.hiring.card.hire_btn", { tier: c.tierLabel })}'
);

// --- Pricing Strategy Replacement ---
content = content.replace(
    /<p className="text-\[0\.5625rem\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Pricing Strategy<\/p>/g,
    '<p className="text-[0.5625rem] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">{t("dashboard.ops.pricing.title")}</p>'
);
content = content.replace(
    /\{startup\.gtm_motion === "PLG" \? "✨ Product-Led Growth Active" : "🤝 Sales-Led Growth Active"\}/g,
    '{startup.gtm_motion === "PLG" ? t("dashboard.ops.pricing.plg_active") : t("dashboard.ops.pricing.slg_active")}'
);
content = content.replace(
    /<span>Free<\/span>/g,
    '<span>{t("dashboard.ops.pricing.free")}</span>'
);

fs.writeFileSync(pagePath, content);
console.log('Ops locales replaced.');
