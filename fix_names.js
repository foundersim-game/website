const fs = require('fs');
const file = 'src/lib/story/campaigns/pineapple.ts';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'Woz': 'Boz',
  'woz': 'boz',
  'Markkula': 'Makkala',
  'markkula': 'makkala',
  'Sculley': 'Sullivan',
  'sculley': 'sullivan',
  'Jony': 'Tony',
  'jony': 'tony',
  'IBM': 'IGM',
  'Microsoft': 'Macrohard',
  'Xerox': 'Zenith',
  'xerox': 'zenith',
  'PARC': 'Labs',
  'Pixar': 'Voxel',
  'pixar': 'voxel',
  'Toy Story': 'Block Story',
  'Disney': 'The Kingdom',
  'Macintosh': 'PineMac',
  'iPhone': 'PinePhone',
  'iphone': 'pinephone',
  'iPod': 'PinePod',
  'ipod': 'pinepod',
  'iPad': 'PinePad',
  'ipad': 'pinepad'
};

for (const [key, value] of Object.entries(replacements)) {
  const regex = new RegExp(`\\b${key}\\b`, 'g');
  content = content.replace(regex, value);
}

fs.writeFileSync(file, content);
console.log('Replaced names in pineapple.ts');
