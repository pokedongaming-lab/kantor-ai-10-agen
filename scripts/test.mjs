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
console.log(`${n} tes lulus`);
