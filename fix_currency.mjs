import fs from 'fs';

function replaceCurrency(obj, symbol) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/\$/g, symbol);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      replaceCurrency(obj[key], symbol);
    }
  }
}

const langs = [
  { file: 'src/locales/es.json', symbol: '€' },
  { file: 'src/locales/fr.json', symbol: '€' },
  { file: 'src/locales/de.json', symbol: '€' },
  { file: 'src/locales/pt.json', symbol: 'R$' }
];

for (const { file, symbol } of langs) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  replaceCurrency(data, symbol);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
console.log('Done!');
