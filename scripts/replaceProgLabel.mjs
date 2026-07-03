import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(/\{prog\.label\}/g, '{prog.labelKey ? t(prog.labelKey) : prog.label}');

fs.writeFileSync(pagePath, content);
console.log('prog.label replaced with translations in page.tsx');
