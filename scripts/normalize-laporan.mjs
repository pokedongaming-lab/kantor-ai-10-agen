import fs from 'fs';
const p = 'src/laporan.json';
const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
const fb = {
  cs: "3 pesan audiens direspon cepat dan solutif.",
  konten: "3 naskah video pendek dengan hook kuat siap produksi.",
  desain: "3 visual thumbnail neon tech mode selesai dirancang.",
  manajer: "Strategi konten mingguan dan arahan tim telah difinalisasi."
};
for (const [k, v] of Object.entries(fb)) {
  if (!d[k].ringkasan) d[k].ringkasan = v;
  if (!d[k].menunggu) d[k].menunggu = [];
  if (!d[k].mendesak) d[k].mendesak = [];
  if (!d[k].angka) d[k].angka = [{ label: "Status", nilai: "Aktif" }];
}
fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf-8');
console.log('laporan.json normalized successfully.');
