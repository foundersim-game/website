import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
    'return { strip: "#7c3aed", bg: "#faf5ff", label: "Funding" };',
    'return { strip: "#7c3aed", bg: "#faf5ff", label: t("dashboard.top_header.event_labels.funding") };'
);
content = content.replace(
    'return { strip: "#dc2626", bg: "#fff1f2", label: "Crisis" };',
    'return { strip: "#dc2626", bg: "#fff1f2", label: t("dashboard.top_header.event_labels.crisis") };'
);
content = content.replace(
    'return { strip: "#d97706", bg: "#fffbeb", label: "Win" };',
    'return { strip: "#d97706", bg: "#fffbeb", label: t("dashboard.top_header.event_labels.win") };'
);
content = content.replace(
    'return { strip: "#0284c7", bg: "#f0f9ff", label: "Team" };',
    'return { strip: "#0284c7", bg: "#f0f9ff", label: t("dashboard.top_header.event_labels.team") };'
);
content = content.replace(
    'return { strip: "#059669", bg: "#f0fdf4", label: "Milestone" };',
    'return { strip: "#059669", bg: "#f0fdf4", label: t("dashboard.top_header.event_labels.milestone") };'
);
content = content.replace(
    'return { strip: "#ea580c", bg: "#fff7ed", label: "Market" };',
    'return { strip: "#ea580c", bg: "#fff7ed", label: t("dashboard.top_header.event_labels.market") };'
);
content = content.replace(
    'return { strip: "#6366f1", bg: "#eef2ff", label: "Event" };',
    'return { strip: "#6366f1", bg: "#eef2ff", label: t("dashboard.top_header.event_labels.event") };'
);

fs.writeFileSync(pagePath, content);
console.log('Timeline labels replaced in page.tsx');
