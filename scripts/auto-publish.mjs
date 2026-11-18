// Skrip Auto-Publish Konten Media Sosial Andre D'Andreas
// Menghubungkan antrean konten ke Webhook n8n / Make / API Media Sosial
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const isDryRun = process.argv.includes('--dry-run') || !process.env.PUBLISH_WEBHOOK_URL;
const webhookUrl = process.env.PUBLISH_WEBHOOK_URL;

console.log('='.repeat(60));
console.log("🚀 SISTEM AUTO-PUBLISH MEDIA SOSIAL — ANDRE D'ANDREAS");
console.log('='.repeat(60));

// 1. Baca antrean postingan dari data/pesanan.csv
const csvPath = path.join(root, 'data/pesanan.csv');
if (!fs.existsSync(csvPath)) {
  console.error('❌ Berkas antrean data/pesanan.csv tidak ditemukan!');
  process.exit(1);
}

const rawCsv = fs.readFileSync(csvPath, 'utf8').trim();
const lines = rawCsv.split('\n').filter(Boolean);
const headers = lines[0].split(',').map((h) => h.trim());

const antrean = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map((p) => p.trim());
  const item = {};
  headers.forEach((h, idx) => {
    item[h] = parts[idx] || '';
  });
  antrean.push(item);
}

console.log(`📋 Total antrean ditemukan: ${antrean.length} postingan\n`);

// 2. Filter yang siap auto_publish
const siapPublish = antrean.filter((item) => item.bayar === 'auto_publish');

if (siapPublish.length === 0) {
  console.log('ℹ️ Tidak ada konten dengan status auto_publish.');
  process.exit(0);
}

for (const post of siapPublish) {
  console.log(`📌 Memproses [${post.id}] untuk ${post.pelanggan}: "${post.produk}"`);
  console.log(`   ⏰ Jadwal Tayang : ${post.jam_kirim} WIB`);
  console.log(`   📦 Format        : ${post.jumlah}`);

  const payload = {
    creator: "Andre D'Andreas",
    niche: 'Teknologi & AI',
    post_id: post.id,
    target_platform: post.pelanggan,
    target_handle: post.target_handle || (post.pelanggan.includes('TikTok') ? '@indostill.id' : '@andre.don2'),
    topic: post.produk,
    format: post.jumlah,
    schedule_time: post.jam_kirim,
    status: 'dispatched',
    created_at: new Date().toISOString(),
  };

  if (isDryRun) {
    console.log('   🧪 [DRY RUN / SIMULASI]: Konten tervalidasi dan siap dikirim ke Webhook.');
    console.log('   Payload:', JSON.stringify(payload, null, 2));
    console.log('   ✅ Simulasi pengiriman ke platform berhasil!\n');
  } else {
    try {
      console.log(`   🌐 Mengirim ke Webhook: ${webhookUrl}...`);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log(`   ✅ Berhasil dikirim ke Webhook (HTTP ${res.status})!\n`);
      } else {
        console.error(`   ⚠️ Webhook merespons dengan status: ${res.status}\n`);
      }
    } catch (err) {
      console.error(`   ❌ Gagal mengirim ke webhook: ${err.message}\n`);
    }
  }
}

console.log('='.repeat(60));
if (isDryRun && !webhookUrl) {
  console.log('💡 TIP KONEKSI NYATA:');
  console.log('   Untuk menghubungkan ke akun Instagram, TikTok, dan YouTube Shorts:');
  console.log('   1. Buat Webhook di n8n atau Make.com yang terhubung ke akun medsos Anda.');
  console.log('   2. Set environment variable: PUBLISH_WEBHOOK_URL="https://webhook-kamu"');
  console.log('   3. Jalankan: npm run publish');
} else {
  console.log('🎉 Semua antrean auto-publish selesai diproses!');
}
console.log('='.repeat(60));
