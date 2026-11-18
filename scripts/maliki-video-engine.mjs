import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import path from 'path';
import { query } from './db.mjs';

const BASE_DIR = 'C:/Users/admin/kantor-ai-10-agen';
const MALIKI_DIR = 'C:/Users/admin/Downloads/studio-maliki-main';
const MALIKI_MOTION_DIR = path.join(MALIKI_DIR, 'motion');
const OUTPUT_VIDEOS_DIR = path.join(BASE_DIR, 'output', 'videos');
const PUBLIC_VIDEOS_DIR = path.join(BASE_DIR, 'public', 'videos');

// Pastikan direktori tujuan tersedia
mkdirSync(OUTPUT_VIDEOS_DIR, { recursive: true });
mkdirSync(PUBLIC_VIDEOS_DIR, { recursive: true });

export const MALIKI_STYLES = [
  { key: 'tekno', name: 'Tekno Gelap Oranye', desc: 'Dark tech #0C0F1A, font Inter & DM Mono, aksen oranye neon. Rekomendasi utama indostill.id' },
  { key: 'neon', name: 'Neon Cyberpunk', desc: 'High energy, glowing text, background ungu/magenta' },
  { key: 'garis', name: 'Garis Wireframe', desc: 'Monospace font, blueprint garis teknis' },
  { key: 'kertas', name: 'Kolase Kertas Editorial', desc: 'Tekstur kertas organik dengan ilustrasi SVG' },
  { key: 'kaca', name: 'UI Aplikasi Kaca', desc: 'Glassmorphism modern ala SaaS & mobile app' },
  { key: 'sinematik', name: 'Panggung Sinematik', desc: 'Zoom kinetik tipografi tebal' },
  { key: 'minimal', name: 'Kata Kunci Minimal', desc: 'Tipografi bersih dengan efek typewriter' },
  { key: 'retro', name: 'Dokumenter Retro', desc: 'Gaya panel warna kontras ala arsip tech' }
];

/**
 * 1. LITA & SEKAR: Ekstrak script database menjadi format Naskah Studio Maliki
 */
export async function buildMalikiScriptFromDb(contentId, style = 'tekno') {
  console.log(`🎬 [LITA - VISUAL DIRECTOR] Merancang storyboard Studio Maliki untuk "${contentId}" (Gaya: ${style})...`);

  // Ambil data konten & script dari database
  const contentRes = await query('SELECT * FROM contents WHERE content_id = $1', [contentId]);
  if (contentRes.rows.length === 0) {
    throw new Error(`Konten dengan ID ${contentId} tidak ditemukan di database.`);
  }
  const content = contentRes.rows[0];

  const scriptRes = await query('SELECT * FROM content_scripts WHERE content_id = $1', [contentId]);
  const script = scriptRes.rows[0] || {};

  // Ekstrak 5 adegan berdasarkan struktur 5-Act Sekar
  const act1_hook = script.hook || `Pernahkah kamu penasaran bagaimana ${content.title} bekerja?`;
  const act2_curiosity = script.curiosity_gap || `Banyak orang belum tahu rahasia di balik teknologi ini.`;
  const act3_main = script.main_content || `Solusi ini memungkinkan implementasi otomatis tanpa biaya langganan yang mahal.`;
  const act4_payoff = script.payoff || `Hasilnya adalah efisiensi 10x lipat dan kendali penuh di tanganmu.`;
  const act5_cta = script.cta || `Simpan video ini dan follow @indostill.id untuk eksperimen AI berikutnya!`;

  // Filter teks agar ringkas untuk narasi TTS
  const clean = (txt) => txt.replace(/['"]/g, '').trim();

  // Helper pemotong kata kunci
  const extractKeywords = (text, defaultKeys) => {
    const words = text.split(/\s+/).filter(w => w.length > 4 && !/^(dan|atau|yang|untuk|dengan|karena|pada|dalam|bisa|kamu|kita)$/i.test(w));
    if (words.length >= 2) return [words[0], words[Math.floor(words.length / 2)], words[words.length - 1]];
    return defaultKeys;
  };

  const adegan = [
    {
      judul: 'Peluang Terbesar',
      teks: clean(act1_hook),
      kunci: extractKeywords(act1_hook, ['laptop', 'offline', 'gratis']),
      ikon: '⚡'
    },
    {
      judul: 'Masalah Yang Sering Terjadi',
      teks: clean(act2_curiosity),
      kunci: extractKeywords(act2_curiosity, ['server', 'privasi', 'lokal']),
      ikon: '🛡️'
    },
    {
      judul: 'Solusi & Arsitektur',
      teks: clean(act3_main),
      kunci: extractKeywords(act3_main, ['terminal', 'otomatis', 'cepat']),
      ikon: '💻'
    },
    {
      judul: 'Hasil & Efisiensi',
      teks: clean(act4_payoff),
      kunci: extractKeywords(act4_payoff, ['hemat', 'latensi', 'performa']),
      ikon: '🚀'
    },
    {
      judul: 'Langkah Berikutnya',
      teks: clean(act5_cta),
      kunci: extractKeywords(act5_cta, ['bookmark', 'komentar', 'indostill']),
      ikon: '📌'
    }
  ];

  const malikiNaskah = {
    judul: content.title,
    gaya: style,
    handle: '@indostill.id',
    aksen: style === 'tekno' ? '#ffb36b' : style === 'neon' ? '#FF3EA5' : '#3B82F6',
    adegan
  };

  // Simpan berkas JSON ke folder naskah Studio Maliki
  const naskahDir = path.join(MALIKI_MOTION_DIR, 'naskah');
  mkdirSync(naskahDir, { recursive: true });
  const naskahFile = path.join(naskahDir, `${contentId}.json`);
  writeFileSync(naskahFile, JSON.stringify(malikiNaskah, null, 2), 'utf8');

  console.log(`✅ [LITA] Naskah JSON Studio Maliki berhasil disimpan: ${naskahFile}`);
  return { malikiNaskah, naskahFile };
}

/**
 * 2. BAYU & LITA: Render Video Motion 9:16 menggunakan Studio Maliki Remotion Engine
 */
export async function renderMalikiVideo(contentId, style = 'tekno') {
  console.log(`🚀 [BAYU - MEDIA & ASSETS] Memulai proses render Studio Maliki untuk "${contentId}"...`);

  // 1. Siapkan naskah
  const { malikiNaskah, naskahFile } = await buildMalikiScriptFromDb(contentId, style);

  // 2. Jalankan engine render buat.mjs
  console.log(`⏳ [STUDIO MALIKI] Menjalankan: node buat.mjs naskah/${contentId}.json --gaya=${style}`);
  const cmd = `node buat.mjs "naskah/${contentId}.json" --gaya=${style}`;

  try {
    execSync(cmd, {
      cwd: MALIKI_MOTION_DIR,
      stdio: 'inherit',
      timeout: 180000 // 3 menit batas render
    });
  } catch (err) {
    console.error(`❌ Gagal render Studio Maliki:`, err.message);
    throw new Error(`Render video gagal: ${err.message}`);
  }

  // 3. Salin hasil video ke folder output CMS & public web
  const sourceVideo = path.join(MALIKI_MOTION_DIR, 'hasil', `${contentId}-${style}.mp4`);
  if (!existsSync(sourceVideo)) {
    throw new Error(`File video hasil tidak ditemukan: ${sourceVideo}`);
  }

  const targetFileName = `${contentId}_${style}.mp4`;
  const targetOutputPath = path.join(OUTPUT_VIDEOS_DIR, targetFileName);
  const targetPublicPath = path.join(PUBLIC_VIDEOS_DIR, targetFileName);

  copyFileSync(sourceVideo, targetOutputPath);
  copyFileSync(sourceVideo, targetPublicPath);
  console.log(`✅ [BAYU & RINA] Video tersimpan di: ${targetPublicPath}`);

  const webUrl = `/videos/${targetFileName}`;

  // 4. Update Storyboard & Publication URL di Database
  await updateStoryboardAndContent(contentId, malikiNaskah, webUrl);

  return {
    success: true,
    contentId,
    style,
    videoUrl: webUrl,
    localPath: targetPublicPath,
    scenes: malikiNaskah.adegan
  };
}

/**
 * 3. Update Database content_storyboards & contents.publication_url
 */
async function updateStoryboardAndContent(contentId, malikiNaskah, videoUrl) {
  // Hapus storyboard lama jika ada
  await query('DELETE FROM content_storyboards WHERE content_id = $1', [contentId]);

  // Masukkan adegan baru
  const acts = ['Hook', 'Curiosity Gap', 'Solusi Teknis', 'Payoff & Value', 'Call to Action'];
  for (let i = 0; i < malikiNaskah.adegan.length; i++) {
    const sc = malikiNaskah.adegan[i];
    await query(
      `INSERT INTO content_storyboards (content_id, scene_idx, act, scene_title, on_screen_text, visual_prompt, image_path, start_ms, end_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        contentId,
        i + 1,
        acts[i] || `Scene ${i + 1}`,
        sc.judul,
        sc.teks,
        `Gaya: ${malikiNaskah.gaya} | Ikon: ${sc.ikon} | Keyword: ${sc.kunci.join(', ')}`,
        videoUrl,
        i * 6000,
        (i + 1) * 6000
      ]
    );
  }

  // Update URL video di tabel contents
  await query(
    `UPDATE contents SET publication_url = $1, status = CASE WHEN status = 'RESEARCHED' THEN 'SCRIPT_READY' ELSE status END WHERE content_id = $2`,
    [videoUrl, contentId]
  );

  console.log(`📊 [DONI & RINA] Database content_storyboards & URL video ${contentId} berhasil diperbarui.`);
}

// Eksekusi langsung jika dipanggil via CLI
if (process.argv[1] && process.argv[1].endsWith('maliki-video-engine.mjs')) {
  const targetId = process.argv[2] || 'CNT-2026-003';
  const targetStyle = process.argv[3] || 'tekno';
  console.log(`Menguji Video Engine Studio Maliki untuk ${targetId} (${targetStyle})...`);
  renderMalikiVideo(targetId, targetStyle)
    .then((res) => {
      console.log('HASIL:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('ERROR:', err);
      process.exit(1);
    });
}
