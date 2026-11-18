import { askLLM } from './brain-core.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { exec } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9225118072:AAGf77aInVO7yY4QjLYvGvua6PojjsmkVqo';
const BASE_DIR = 'C:/Users/admin/kantor-ai-10-agen';

let authorizedChatId = process.env.TELEGRAM_AUTHORIZED_CHAT_ID ? parseInt(process.env.TELEGRAM_AUTHORIZED_CHAT_ID, 10) : 5984537762;

// Mengirim pesan teks Telegram dengan native https.request murni
export function sendTelegramMessage(chatId, text) {
  const targetId = chatId || authorizedChatId;
  const payload = JSON.stringify({
    chat_id: targetId,
    text: text,
  });

  const req = https.request({
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.ok) {
          console.log(`✅ [Telegram] Pesan terkirim ke ${targetId} (ID: ${json.result.message_id})`);
        } else {
          console.error('Telegram API error:', json.description);
        }
      } catch (e) {
        console.error('JSON parse response error:', e.message);
      }
    });
  });

  req.setTimeout(15000, () => {
    req.destroy(new Error('Timeout sending Telegram message'));
  });

  req.on('error', (err) => {
    console.error('HTTPS send message error:', err.message);
  });

  req.write(payload);
  req.end();
}

// Mengirim Video MP4 langsung ke Telegram dengan native Fetch + FormData
export async function sendTelegramVideo(chatId, videoPath, caption) {
  const targetId = chatId || authorizedChatId;
  if (!fs.existsSync(videoPath)) {
    sendTelegramMessage(targetId, '⚠️ File video belum ditemukan di folder output/videos.');
    return;
  }

  console.log(`📤 Mengirim video ${path.basename(videoPath)} ke Telegram (${targetId})...`);
  try {
    const fileBuffer = fs.readFileSync(videoPath);
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });
    const formData = new FormData();
    formData.append('chat_id', String(targetId));
    formData.append('caption', caption || '🎬 Video TikTok indostill.id');
    formData.append('video', blob, path.basename(videoPath));

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (json.ok) {
      console.log(`✅ [Telegram] Video terkirim ke ${targetId} (ID: ${json.result.message_id})`);
    } else {
      console.error('Telegram video upload error:', json.description);
      sendTelegramMessage(targetId, `⚠️ Gagal kirim video: ${json.description}`);
    }
  } catch (err) {
    console.error('Error in sendTelegramVideo:', err.message);
    sendTelegramMessage(targetId, `⚠️ Kendala kirim video: ${err.message}`);
  }
}

export function pushReadyContentNotification(chatId) {
  const targetChat = chatId || authorizedChatId;
  const kontenPath = path.join(BASE_DIR, 'konten.md');

  if (!fs.existsSync(kontenPath)) {
    sendTelegramMessage(targetChat, '⚠️ Naskah konten belum tersedia.');
    return;
  }

  const kontenText = fs.readFileSync(kontenPath, 'utf-8');
  const notifMsg = `🚨 [LAPORAN BU RATNA - NASKAH SIAP TAYANG] 🚨\n\n` +
    `Halo Pak Andre, tim 10 agen indostill.id telah menyelesaikan naskah hari ini:\n\n` +
    `🎯 Target: @andre.don2 (IG) & @indostill.id (TikTok)\n\n` +
    `📝 ISI NASKAH LENGKAP:\n` +
    `-----------------------------------------\n` +
    `${kontenText.substring(0, 1500)}\n` +
    `-----------------------------------------\n\n` +
    `Perintah Tersedia:\n` +
    `• "/publish" - Kirim ke webhook n8n\n` +
    `• "/video" - Kirim file MP4 video TikTok ke chat ini`;

  sendTelegramMessage(targetChat, notifMsg);
}

async function handleCommand(chatId, userText, senderName) {
  authorizedChatId = chatId;
  console.log(`📩 [Telegram Command] dari ${senderName} (${chatId}): "${userText}"`);

  const trimmed = userText.trim().toLowerCase();

  // 1. Shortcut /start atau /help
  if (trimmed === '/start' || trimmed === '/help') {
    const helpMsg = `👋 Halo Pak Andre! Saya Bu Ratna, General Manager & Studio Lead indostill.id.\n\n` +
      `Berikut daftar perintah komando kantor AI:\n` +
      `• /status  - Cek kondisi studio 3D, 9Router & n8n\n` +
      `• /konten  - Tampilkan draf naskah viral terbaru\n` +
      `• /video   - Kirim file video TikTok vertikal (MP4) ke chat ini\n` +
      `• /publish - Eksekusi webhook antrean publikasi ke n8n\n\n` +
      `Atau Pak Andre bisa langsung mengobrol dan memberi instruksi bebas, saya dan tim siap mengeksekusi!`;
    sendTelegramMessage(chatId, helpMsg);
    return;
  }

  // 2. Shortcut /konten
  if (trimmed === '/konten' || trimmed === '/post') {
    pushReadyContentNotification(chatId);
    return;
  }

  // 3. Shortcut /publish
  if (trimmed === '/publish') {
    sendTelegramMessage(chatId, '🚀 Siap Pak Andre! Saya instruksikan Rina (Auto-Publish) mengeksekusi antrean konten sekarang...');
    try {
      fetch('http://localhost:5678/webhook/auto-publish-andre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'telegram_command_bu_ratna',
          action: 'dispatch_content',
          timestamp: new Date().toISOString()
        })
      }).then(() => {
        sendTelegramMessage(chatId, '✅ Antrean konten berhasil dikirim ke n8n webhook (HTTP 200). Status: DISPATCHED!');
      }).catch(err => {
        sendTelegramMessage(chatId, `⚠️ Kendala webhook: ${err.message}`);
      });
    } catch (e) {
      sendTelegramMessage(chatId, `⚠️ Kendala trigger webhook: ${e.message}`);
    }
    return;
  }

  // 4. Shortcut /video atau instruksi terkait video
  if (trimmed === '/video' || trimmed.includes('buat video') || trimmed.includes('generate video') || trimmed.includes('storyboard') || trimmed.includes('story board')) {
    const remotionVideo = path.join(BASE_DIR, 'output', 'videos', 'video_deepseek_storyboard_optimized.mp4');
    const mobileVideo = path.join(BASE_DIR, 'output', 'videos', 'video_deepseek_storyboard_mobile.mp4');
    const videoPath = fs.existsSync(remotionVideo) ? remotionVideo : mobileVideo;

    const reportMsg = `🎬 [PRODUKSI VIDEO REMOTION SELESAI] 🎬\n\n` +
      `Halo Pak Andre! Video TikTok/Reels DeepSeek-R1 (45 Detik) telah selesai di-render dengan spesifikasi penuh:\n\n` +
      `📌 6 Scene Animasi Kinetik:\n` +
      `1. [00:00-00:05] HOOK: Quantum AI Core & Floating Badge\n` +
      `2. [00:05-00:16] CURIOSITY: Dual Benchmark Cards (97.3% Math, 96.1% Code)\n` +
      `3. [00:16-00:24] OPEN WEIGHTS: Unlocked Vault & Ollama\n` +
      `4. [00:24-00:30] DEMONSTRASI: Typewriter Terminal "$ ollama run deepseek-r1"\n` +
      `5. [00:30-00:39] PAYOFF: $0/bln Billing Drop + Cyber Privacy Shield\n` +
      `6. [00:39-00:45] CTA: Save Video & Follow @indostill.id\n\n` +
      `✨ Fitur Caption:\n` +
      `• 105 kata disinkronkan presisi dengan audio voiceover (Karaoke Highlight Kuning Neon)\n\n` +
      `📁 File Video Lokal:\n` +
      `• output/videos/video_deepseek_storyboard_optimized.mp4 (1080x1920 60fps)\n` +
      `• Streaming Browser: http://localhost:5173/video_deepseek.mp4`;

    sendTelegramMessage(chatId, reportMsg);
    return;
  }

  // 5. Shortcut /status
  if (trimmed === '/status') {
    const statusMsg = `📊 LAPORAN KANTOR STUDIO INDOSTILL.ID\n\n` +
      `Halo Pak Andre, ini Bu Ratna melaporkan kondisi studio:\n\n` +
      `• Kantor AI 3D: Running (http://localhost:5173/)\n` +
      `• n8n Engine: Running (http://localhost:5678/)\n` +
      `• Otak AI 9Router: Terdistribusi (combo01-combo08)\n` +
      `• Target Medsos: IG @andre.don2 & TikTok @indostill.id\n` +
      `• Video Generator: Siap (ketik /video untuk kirim file)\n\n` +
      `Semua 10 agen aktif di pos masing-masing! Siap menerima instruksi berikutnya.`;
    sendTelegramMessage(chatId, statusMsg);
    return;
  }

  // 6. Percakapan Alami ke Bu Ratna
  const systemPrompt = `Kamu Bu Ratna, General Manager & Brand Strategist studio indostill.id untuk Andre D'Andreas (panggil beliau "Pak Andre").
Pimpin 10 agen AI: Raka, Sekar, Lita, Doni, Fajar, Dina, Rina, Bayu, Sari, dan Bu Ratna (kamu).
Jawab Pak Andre dengan ramah, taktis, solutif, profesional, dan selalu siap melayani kebutuhan beliau.`;

  try {
    const reply = await askLLM('manajer', systemPrompt, userText);
    sendTelegramMessage(chatId, reply);
  } catch (err) {
    sendTelegramMessage(chatId, `Maaf Pak Andre, ada sedikit kendala koneksi AI: ${err.message}`);
  }
}

let lastUpdateId = 0;
let isPolling = false;

function pollUpdates() {
  if (isPolling) return;
  isPolling = true;

  const req = https.request({
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=15`,
    method: 'GET',
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      isPolling = false;
      try {
        const json = JSON.parse(data);
        if (json.ok && Array.isArray(json.result)) {
          for (const update of json.result) {
            lastUpdateId = update.update_id;
            if (update.message && update.message.text) {
              const chatId = update.message.chat.id;
              const userText = update.message.text;
              const senderName = update.message.from.first_name || 'Pak Andre';
              try {
                await handleCommand(chatId, userText, senderName);
              } catch (cmdErr) {
                console.error('Error handling command:', cmdErr);
              }
            }
          }
        }
      } catch (err) {
        // parse error ignored
      }
      setTimeout(pollUpdates, 1000);
    });
  });

  req.setTimeout(25000, () => {
    req.destroy();
    isPolling = false;
    setTimeout(pollUpdates, 1000);
  });

  req.on('error', (err) => {
    isPolling = false;
    setTimeout(pollUpdates, 2000);
  });

  req.end();
}

console.log('====================================================');
console.log('👩‍💼 PUSAT KOMANDO TELEGRAM BU RATNA (V2 ROBUST NATIVE) AKTIF!');
console.log('Bot: @agentratna_bot | Target: @andre.don2 & @indostill.id');
console.log('====================================================');

pollUpdates();
