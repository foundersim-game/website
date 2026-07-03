import fs from 'fs';
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

function findStrKeys(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            findStrKeys(value, path ? `${path}.${key}` : key);
        } else if (key.startsWith('str_')) {
            console.log(`${path ? path + '.' : ''}${key}:`, value);
        }
    }
}
findStrKeys(en.dashboard);
