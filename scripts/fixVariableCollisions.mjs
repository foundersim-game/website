import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Fix first loop (templates.map)
content = content.replace(
    /templates\.map\(\(t, idx\) =>/g,
    'templates.map((tmpl, idx) =>'
);
content = content.replace(
    /t\.name\}/g,
    'tmpl.name}'
);
content = content.replace(
    /\$\{t\.badgeColor\}/g,
    '${tmpl.badgeColor}'
);
content = content.replace(
    /\{t\.badge\}/g,
    '{tmpl.badge}'
);
content = content.replace(
    /\{t\.desc\}/g,
    '{tmpl.desc}'
);
content = content.replace(
    /\{formatNumber\(t\.sharesTotal\)\}/g,
    '{formatNumber(tmpl.sharesTotal)}'
);
content = content.replace(
    /\{formatNumber\(t\.monthly\)\}/g,
    '{formatNumber(tmpl.monthly)}'
);
content = content.replace(
    /\{t\.months\}/g,
    '{tmpl.months}'
);
content = content.replace(
    /handleCreatePlan\(t\)/g,
    'handleCreatePlan(tmpl)'
);

// Fix second loop (mnaTargets.map)
content = content.replace(
    /mnaTargets\.map\(\(t, i\) => \{/g,
    'mnaTargets.map((targetItem, i) => {'
);
content = content.replace(
    /t\.ask/g,
    'targetItem.ask'
);
content = content.replace(
    /t\.id/g,
    'targetItem.id'
);
content = content.replace(
    /t\.emoji/g,
    'targetItem.emoji'
);
content = content.replace(
    /t\.name/g,
    'targetItem.name'
);
content = content.replace(
    /t\.sector/g,
    'targetItem.sector'
);
content = content.replace(
    /t\.rationale/g,
    'targetItem.rationale'
);
content = content.replace(
    /t\.desc/g,
    'targetItem.desc'
);
content = content.replace(
    /t\.is_diligent/g,
    'targetItem.is_diligent'
);
content = content.replace(
    /t\.true_value/g,
    'targetItem.true_value'
);
content = content.replace(
    /t\.financial_health/g,
    'targetItem.financial_health'
);
content = content.replace(
    /t\.inherited_burn/g,
    'targetItem.inherited_burn'
);
content = content.replace(
    /t\.integration_risk/g,
    'targetItem.integration_risk'
);
content = content.replace(
    /t\.users/g,
    'targetItem.users'
);

fs.writeFileSync(pagePath, content);
console.log('Fixed variable collisions.');
