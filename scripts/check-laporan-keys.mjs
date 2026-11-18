import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/laporan.json', 'utf-8'));
const keys = ['kasir', 'pesanan', 'cs', 'stok', 'keuangan', 'riset', 'konten', 'desain', 'laporan', 'manajer'];
keys.forEach(k => {
  const item = data[k];
  console.log(`${k.padEnd(10)}: ringkasan=${Boolean(item?.ringkasan)} (${item?.ringkasan?.substring(0, 30)}...)`);
});
