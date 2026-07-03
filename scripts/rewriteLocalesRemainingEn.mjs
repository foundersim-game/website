import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const p = path.join(ROOT, 'src/locales/en.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

Object.assign(data.dashboard.options, {
    package_names: {
        annual_performance_package: "Annual Performance Package",
        executive_retention_plan: "Executive Retention Plan",
        elon_style_megapackage: "Elon-Style Megapackage",
        sovereign_strategic_milestone_grant: "Sovereign Strategic Milestone Grant"
    },
    "mos_vest": "{{mos}} mos vest",
    "req": "Req.",
    "board": "Board"
});

if (!data.dashboard.pr) data.dashboard.pr = {};
Object.assign(data.dashboard.pr, {
    current_market_season: "Current Market Season",
    neutral_market: "Neutral Market",
    sector_conditions: "Sector conditions dynamically affect investor sentiment and marketing yield."
});

fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log("Updated en.json for remaining keys");
