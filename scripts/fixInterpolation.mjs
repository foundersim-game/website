import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const files = ['en.json', 'es.json', 'de.json'];

files.forEach(file => {
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace {month} with {{month}} 
    // And if translation turned {month} into (MONTH) or similar, fix that too
    content = content.replace(/\{month\}/g, '{{month}}');
    content = content.replace(/\(MONTH\)/g, '{{month}}');
    content = content.replace(/\{mes\}/g, '{{month}}');
    content = content.replace(/\{monat\}/g, '{{month}}');
    content = content.replace(/\{Monat\}/g, '{{month}}');
    
    fs.writeFileSync(filePath, content);
});

console.log('Interpolation keys fixed.');
