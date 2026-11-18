import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/laporan.json', 'utf-8'));
Object.keys(data).forEach(k => {
  console.log(k, 'angka isArray:', Array.isArray(data[k].angka), 'type:', typeof data[k].angka, data[k].angka);
});
