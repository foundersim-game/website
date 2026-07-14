const fs = require('fs');
const file = 'src/lib/story/campaigns/pineapple.ts';
let content = fs.readFileSync(file, 'utf8');

const actReplacements = [
  { search: /monthRange: \[1, 48\]/, replace: 'monthRange: [1, 84]' },
  { search: /monthRange: \[49, 119\]/, replace: 'monthRange: [85, 249]' },
  { search: /monthRange: \[120, 189\]/, replace: 'monthRange: [250, 305]' },
  { search: /monthRange: \[190, 300\]/, replace: 'monthRange: [306, 600]' },
];

const eventReplacements = {
  'pineapple_garage': 1,
  'pineapple_woz_accident': 4,
  'pineapple_faire': 12,
  'pineapple_first_angel': 8,
  'pineapple_ipo_prep': 56,
  'pineapple_iii_disaster': 60,
  'pineapple_xerox_parc': 44,
  'pineapple_cofounder_split': 66,
  'pineapple_sugar_water': 85,
  'pineapple_mac_launch': 94,
  'pineapple_boardroom_coup': 110,
  'pineapple_exile_begins': 113,
  'pineapple_pixar_toy_story': 236,
  'pineapple_return': 250,
  'pineapple_product_purge': 256,
  'pineapple_microsoft_pact': 257,
  'pineapple_think_different': 258,
  'pineapple_imac_launch': 266,
  'pineapple_design_hire': 267,
  'pineapple_ipod': 306,
  'pineapple_itunes_store': 324,
  'pineapple_iphone_project': 348,
  'pineapple_iphone_keynote': 369,
  'pineapple_app_store': 387,
  'pineapple_health_scare': 390,
  'pineapple_ipad': 408,
  'pineapple_succession': 424
};

for (const rep of actReplacements) {
  content = content.replace(rep.search, rep.replace);
}

// Also update the act headers
content = content.replace(/Months 1–48/g, 'Months 1–84');
content = content.replace(/Months 49–119/g, 'Months 85–249');
content = content.replace(/Months 120–189/g, 'Months 250–305');
content = content.replace(/Months 190–300/g, 'Months 306–600');

for (const [id, month] of Object.entries(eventReplacements)) {
  const regex = new RegExp(`(id: "${id}",[\\s\\S]*?trigger: { type: "month_reached", value: )\\d+`, 'g');
  content = content.replace(regex, `$1${month}`);
}

fs.writeFileSync(file, content);
console.log('Timeline updated.');
