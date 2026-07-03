import fs from 'fs';
const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
console.log("Margin Loan:", Object.keys(es.dashboard.margin_loan || {}));
console.log("10B51:", Object.keys(es.dashboard['10b51'] || {}));
console.log("Founder:", Object.keys(es.dashboard.founder || {}));
console.log("Lifestyle:", Object.keys(es.dashboard.lifestyle || {}));
console.log("Philanthropy:", Object.keys(es.dashboard.philanthropy || {}));
