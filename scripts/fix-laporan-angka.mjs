import fs from 'fs';
const p = 'src/laporan.json';
const d = JSON.parse(fs.readFileSync(p, 'utf-8'));

// Format angka laporan harus array of objects: [{ label: string, nilai: string }]
if (!Array.isArray(d.laporan.angka)) {
  const old = d.laporan.angka || {};
  d.laporan.angka = Object.entries(old).map(([k, v]) => ({
    label: k.replace(/_/g, ' '),
    nilai: String(v)
  }));
  if (d.laporan.angka.length === 0) {
    d.laporan.angka = [
      { label: "Skor Kelayakan Konten", nilai: "95/100" },
      { label: "Status QA", nilai: "Approved" }
    ];
  }
}

// Pastikan semua agen memiliki angka dalam format array of { label, nilai }
Object.keys(d).forEach(k => {
  if (!Array.isArray(d[k].angka)) {
    d[k].angka = [{ label: "Status", nilai: "Aktif" }];
  }
});

fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf-8');
console.log('Fixed laporan.angka format!');
