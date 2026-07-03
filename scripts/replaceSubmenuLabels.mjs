import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace Product submenu strings
content = content.replace(
    'Eng. Capacity</p>',
    '{t("dashboard.submenu.eng_capacity")}</p>'
);
content = content.replace(
    'Execution Scale</p>',
    '{t("dashboard.submenu.execution_scale")}</p>'
);
content = content.replace(
    '🚀 Innovation Level</p>',
    '🚀 {t("dashboard.submenu.innovation_level")}</p>'
);
content = content.replace(
    'High Innovation increases Valuation & Fundraising Success.',
    '{t("dashboard.submenu.high_innovation")}'
);
content = content.replace(
    '⚠️ Throttled: Team is too small for {users.toLocaleString()} users. Actions are {100 - capacityPct}% less effective.',
    '{t("dashboard.submenu.throttled_product", { users: users.toLocaleString(), pct: 100 - capacityPct })}'
);
content = content.replace(
    'Requires Focus Energy</p>',
    '{t("dashboard.submenu.requires_focus")}</p>'
);

// Replace Marketing submenu strings (I will just do them generically)
content = content.replace(
    'MKT Skill</p>',
    '{t("dashboard.submenu.mkt_skill")}</p>'
);
content = content.replace(
    'Brand</p>',
    '{t("dashboard.submenu.brand")}</p>'
);
content = content.replace(
    'Marketers</p>',
    '{t("dashboard.submenu.marketers")}</p>'
);
content = content.replace(
    'Growth Capacity</p>',
    '{t("dashboard.submenu.growth_capacity")}</p>'
);
content = content.replace(
    '⚠️ Throttled: Team is too small for {users.toLocaleString()} users. Growth actions are {100 - capacityPct}% less effective.',
    '{t("dashboard.submenu.throttled_marketing", { users: users.toLocaleString(), pct: 100 - capacityPct })}'
);

// Replace Sales submenu strings
content = content.replace(
    'Sales Velocity</p>',
    '{t("dashboard.submenu.sales_velocity")}</p>'
);
content = content.replace(
    'Pipeline Size</p>',
    '{t("dashboard.submenu.pipeline_size")}</p>'
);
content = content.replace(
    'Sales Reps</p>',
    '{t("dashboard.submenu.sales_reps")}</p>'
);
content = content.replace(
    'Sales Capacity</p>',
    '{t("dashboard.submenu.sales_capacity")}</p>'
);
content = content.replace(
    '⚠️ Throttled: Team is too small for {formatMoney(liveRevenue)} MRR. Sales actions are {100 - capacityPct}% less effective.',
    '{t("dashboard.submenu.throttled_sales", { mrr: formatMoney(liveRevenue), pct: 100 - capacityPct })}'
);

// Replace Ops submenu strings
content = content.replace(
    'Ops Capacity</p>',
    '{t("dashboard.submenu.ops_capacity")}</p>'
);
content = content.replace(
    'Support Load</p>',
    '{t("dashboard.submenu.support_load")}</p>'
);
content = content.replace(
    'CS Reps</p>',
    '{t("dashboard.submenu.cs_reps")}</p>'
);
content = content.replace(
    '⚠️ Throttled: Team is too small. High churn risk.',
    '{t("dashboard.submenu.throttled_ops")}'
);

// Generic replacing "Actions + Ongoing Programs" and "Instant Action (Costs Energy)"
// Note: replacing all instances since they occur multiple times
content = content.split('Actions + Ongoing Programs</p>').join('{t("dashboard.submenu.actions_ongoing")}</p>');
content = content.split('Instant Action (Costs Energy)</p>').join('{t("dashboard.submenu.instant_action")}</p>');

fs.writeFileSync(pagePath, content);
console.log('Submenu labels replaced in page.tsx');
