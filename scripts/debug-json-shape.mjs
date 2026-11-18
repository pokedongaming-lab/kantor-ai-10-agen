import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/laporan.json', 'utf-8'));
['cs', 'konten', 'desain', 'manajer'].forEach(k => {
  console.log(`=== ${k} ===`);
  console.log(JSON.stringify(data[k], null, 2));
});
