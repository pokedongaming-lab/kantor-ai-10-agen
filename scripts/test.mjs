// Tes logika kantor: node scripts/test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const O = (await runnerImport(path.join(root, 'src/office.ts'), { root, configFile: false, cacheDir: path.join(os.tmpdir(), 'kantor-vite'), logLevel: 'error' })).module;

let n = 0;
const t = (name, fn) => {
  fn();
  n++;
};
t('jadwal pagi, laporan, belajar, libur', () => {
  assert.equal(O.agentDoing('kasir', 1, '07:40').label, 'rekap penjualan…');
  assert.equal(O.agentDoing('manajer', 1, '08:20').activity, 'kerja');
  assert.equal(O.agentDoing('desain', 1, '15:50').activity, 'laporan');
  assert.equal(O.agentDoing('stok', 6, '21:00').activity, 'belajar');
  assert.equal(O.agentDoing('kasir', 1, '10:00').activity, 'siaga');
  assert.equal(O.agentDoing('kasir', 1, '23:00').activity, 'pulang');
  assert.equal(O.agentDoing('kasir', 6, '07:40').activity, 'pulang');
  assert.equal(O.agentDoing('kasir', 6, '07:40', true).activity, 'kerja');
});
t('10 agent bekerja di babak pagi dan menulis laporan sore', () => {
  assert.ok(O.officeDesks(1, '08:40').every((d) => d.doing.activity === 'kerja'));
  assert.ok(O.officeDesks(1, '15:50').every((d) => d.doing.activity === 'laporan'));
});
t('dua lantai, lima agent per lantai', () => {
  const desks = O.officeDesks(1, '10:00');
  assert.equal(desks.filter((d) => d.desk.lantai === 1).length, 5);
  assert.equal(desks.filter((d) => d.desk.lantai === 2).length, 5);
});
t('timelapse tiga babak, berulang', () => {
  assert.equal(O.LAPSE_SECONDS, 30);
  assert.equal(O.lapseAt(0).time, '07:28');
  assert.equal(O.lapseAt(16).act, 1);
  assert.equal(O.lapseAt(30).time, '07:28');
});
t('agen santai pergi dan kembali', () => {
  const seen = new Set();
  for (let x = 0; x < 48; x += 0.5) seen.add(O.idleAt('kasir', x).spot);
  assert.ok(seen.has('meja') && seen.size >= 3);
});
t('meja dan Mission Board', () => {
  const desks = O.officeDesks(1, '10:00');
  assert.equal(desks.length, 10);
  assert.ok(desks.every((d) => d.bubble));
  assert.ok(O.missionBoard(desks).items.length >= 4);
});
t('parameter URL', () => {
  assert.deepEqual(O.params(new URLSearchParams('timelapse=1&rekam=1&jam=08.10')), { lapse: true, rec: true, time: '08:10', alwaysWork: true });
});

t('laporan.json skema ketat 10 agen sesuai AGENTS.md', async () => {
  const fs = await import('node:fs');
  const laporan = JSON.parse(fs.readFileSync(path.join(root, 'src/laporan.json'), 'utf-8'));
  const wajibKeys = ['kasir', 'pesanan', 'cs', 'stok', 'keuangan', 'riset', 'konten', 'desain', 'laporan', 'manajer'];
  for (const k of wajibKeys) {
    assert.ok(laporan[k], `Kunci agen ${k} harus ada di laporan.json`);
    assert.ok(typeof laporan[k].ringkasan === 'string' && laporan[k].ringkasan.length > 0, `Ringkasan ${k} tidak boleh kosong`);
    assert.ok(Array.isArray(laporan[k].menunggu), `Menunggu ${k} harus berupa array`);
    assert.ok(Array.isArray(laporan[k].mendesak), `Mendesak ${k} harus berupa array`);
    assert.ok(Array.isArray(laporan[k].angka) && laporan[k].angka.length > 0, `Angka ${k} harus memiliki minimal 1 metrik`);
  }
});

t('integritas berkas data/ CSV & TXT', async () => {
  const fs = await import('node:fs');
  assert.ok(fs.existsSync(path.join(root, 'data/penjualan.csv')), 'penjualan.csv harus ada');
  assert.ok(fs.existsSync(path.join(root, 'data/pesanan.csv')), 'pesanan.csv harus ada');
  assert.ok(fs.existsSync(path.join(root, 'data/stok.csv')), 'stok.csv harus ada');
  assert.ok(fs.existsSync(path.join(root, 'data/pesan-wa.txt')), 'pesan-wa.txt harus ada');
});

t('db.mjs query fallback standalone', async () => {
  const { query } = await import('./db.mjs');
  const res = await query('SELECT * FROM agents');
  assert.equal(res.rows.length, 10, 'Harus mereturn 10 agen terdaftar');
  const contentsRes = await query('SELECT * FROM contents');
  assert.ok(contentsRes.rows.length >= 4, 'Harus mereturn konten pipeline');
});

t('token-tracker.mjs pelacakan pemakaian token per agen', async () => {
  const { recordTokenUsage, getTokenMetrics, AGENT_INFO } = await import('./token-tracker.mjs');
  
  // Pastikan info 10 agen terdaftar lengkap
  assert.equal(Object.keys(AGENT_INFO).length, 10, 'Harus ada tepat 10 agen');
  
  // Simulasi pencatatan pemakaian token untuk agen riset
  const rec = recordTokenUsage('riset', 'combo03', { prompt_tokens: 150, completion_tokens: 80, total_tokens: 230 });
  assert.equal(rec.totalTokens, 230, 'Total token yang tercatat harus 230');

  // Ambil metrik agregat
  const metrics = getTokenMetrics();
  assert.ok(metrics.total_tokens_used > 0, 'Total tokens used harus bertambah');
  assert.ok(metrics.daily_budget >= 100000, 'Daily budget default harus 100k');
  assert.ok(['HEALTHY', 'WARNING', 'CRITICAL'].includes(metrics.status), 'Status harus valid');
  assert.equal(metrics.by_agent.length, 10, 'Metrik per-agen harus berisi 10 agen');
  
  const risetRow = metrics.by_agent.find(a => a.agent_key === 'riset');
  assert.ok(risetRow, 'Baris agen riset harus ditemukan');
  assert.equal(risetRow.name, 'Raka');
  assert.equal(risetRow.lantai, 2);
  assert.ok(risetRow.calls >= 1);
});

console.log(`${n} tes lulus`);
