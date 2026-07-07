import fs from 'fs';

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], prefix + k + '.'));
    } else {
      keys.push(prefix + k);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const langs = ['es', 'fr', 'de', 'pt'];

for (const lang of langs) {
  const data = JSON.parse(fs.readFileSync(`src/locales/${lang}.json`, 'utf8'));
  const langKeys = new Set(getKeys(data));
  
  let missing = [];
  for (const k of enKeys) {
    if (!langKeys.has(k)) missing.push(k);
  }
  
  console.log(`Language ${lang} is missing ${missing.length} keys`);
  if (missing.length > 0 && missing.length < 10) {
    console.log(missing.join(', '));
  }
}
