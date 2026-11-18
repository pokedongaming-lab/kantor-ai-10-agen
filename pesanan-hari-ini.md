# Jadwal & Antrean Auto-Publish Andre D'Andreas
*Disusun oleh Rina (Jadwal & Auto-Publisher) · Niche: Tech & AI*

| Jam Tayang | ID | Platform | Format | Topik Konten | Mode Eksekusi | Status |
|---|---|---|---|---|---|---|
| **09:00 WIB** | P04 | Instagram | Carousel (7 slide) | Prompt Engineering Cheatsheet untuk Coding & Kerja | Webhook Auto-Publish | ✅ Siap Tayang Pagi |
| **12:00 WIB** | P01 | TikTok & Shorts | Video Reels/Shorts | Tutorial Jalankan DeepSeek R1 di Laptop/HP Gratis | Webhook Auto-Publish | ⚡ Prime Time Siang |
| **17:30 WIB** | P02 | Instagram Reels | Video Pendek | 3 Tools AI Wajib untuk Mahasiswa & Freelancer | Webhook Auto-Publish | ⚡ Prime Time Pulang Kerja |
| **19:30 WIB** | P03 | YouTube Shorts | Video Tutorial | Cara Otomatisasi Medsos Pakai AI & n8n | Manual Approval | Menunggu Review Akhir |

### Alur Kerja Auto-Publish:
1. Skrip `scripts/auto-publish.mjs` mengecek antrean di `data/pesanan.csv`.
2. Konten dengan mode `auto_publish` dikirim ke endpoint webhook n8n / Make.
3. Webhook mendistribusikan video dan caption ke Instagram Graph API, TikTok Content API, dan YouTube Data API.
