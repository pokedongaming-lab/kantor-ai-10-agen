# Kantor AI 10-Agent Studio — Andre D'Andreas (indostill.id)

> Template awal 3D oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Lisensi Nonkomersial Maliki Studio 1.0 (lihat `LICENSE`).

Sistem otomatisasi studio kreator & kantor virtual 3D isometrik untuk **Andre D'Andreas** (Niche: Teknologi & Kecerdasan Buatan / AI). Dilengkapi dengan **AI CMS Dashboard**, **orkestrasi 10 Agen Otonom (9Router LLM)**, **pipeline verifikasi anti-slop**, **auto-publish webhook medsos**, dan **video rendering Remotion**.

---

## 🏢 Struktur Kantor 2 Lantai (10 Agen AI)

### Lantai 1 · Distribusi & Analitik
- **Kasir (Dina):** Analis metrik performa konten, retention rate, watch time, dan engagement platform.
- **Pesanan (Rina):** Pengatur antrean postingan media sosial dan webhook auto-publishing ke TikTok, IG Reels, dan YT Shorts.
- **CS (Fajar):** Community Growth Manager, menyusun draf balasan teknis dan edukatif untuk komentar audiens dan DM.
- **Stok (Bayu):** Kurator bank aset media (b-roll laptop, audio trending, screen recording tutorial, thumbnail template).
- **Keuangan (Sari):** Tracker monetisasi, performa link bio, CTR affiliate tools AI, dan tawaran sponsorship.

### Lantai 2 · Kreatif & Produksi
- **Riset (Raka):** AI Trend Intelligence Researcher, memantau tren model LLM baru, GitHub trending, dan prompt tricks.
- **Konten (Sekar):** Lead Scriptwriter anti-slop, menulis 3 naskah video pendek 5-Act dengan hook tajam berenergi tinggi.
- **Desain (Lita):** Visual Content Director, merancang brief thumbnail cover neon tech mode dengan kontras tinggi.
- **Laporan (Doni):** Quality Assurance & Fact Checker, memverifikasi akurasi teknis perintah terminal, klaim RAM, dan bebas klise AI.
- **Manajer (Bu Ratna):** Chief Content Strategist & General Manager, penentu strategi mingguan dan approval publikasi.

---

## 🚀 Memulai

### Prasyarat
- [Node.js](https://nodejs.org) 20+

### Instalasi & Menjalankan Frontend
```bash
npm install
npm run dev
```
Buka **http://localhost:5173**:
- Tombol **"📊 BUKA AI CMS DASHBOARD"** di pojok kanan atas memungkinkan perpindahan instan antara visualisasi Kantor 3D dan Dashboard CMS Studio.
- Berjalan otomatis dalam mode **Standalone** tersinkronisasi dengan `src/laporan.json` bahkan tanpa koneksi database.

---

## ⚡ Perintah Operasional CLI

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Vite Dev Server (Kantor 3D & AI CMS Dashboard di port 5173) |
| `npm run server` | Menjalankan Express API Backend (`localhost:3001`) dengan query fallback mandiri |
| `npm run agents:run` | Menjalankan siklus otonom 10 agen AI secara berurutan via 9Router LLM |
| `npm run publish:dry` | Simulasi pengujian payload antrean postingan ke TikTok, Instagram, dan YouTube |
| `npm run publish` | Mengirim antrean konten siap tayang ke `PUBLISH_WEBHOOK_URL` (n8n / Make.com) |
| `npm run video:remotion` | Merender video vertikal 9:16 otomatis menggunakan Remotion engine |
| `npm test` | Menjalankan 10 unit test otomatis (logika kantor, skema ketat 10 agen, integritas CSV) |
| `npm run build` | Kompilasi TypeScript dan bundler Vite produksi ke folder `dist/` |

---

## 🔒 Privasi Data & Aturan Komitmen

1. **Bebas Data Finansial Rahasia:** Sesuai aturan di [AGENTS.md](AGENTS.md), tidak ada nominal rupiah atau data rahasia yang di-commit.
2. **Proteksi Kredensial:** `.env` dan token rahasia dikecualikan secara ketat di [.gitignore](.gitignore). Kredensial dinamis dibaca via `process.env`.
3. **Standar Anti-Slop:** Naskah konten bebas dari kalimat pembuka klise AI bot ("Stop scroll", "Tahukah kamu", "Game changer").

---

## 📜 Lisensi & Kredit

Template dasar kantor 3D oleh **Maliki Saputra** (@malikisaputra) — https://malikisaputra.biz.id.  
Lisensi Nonkomersial Maliki Studio 1.0: boleh dipakai untuk belajar, pribadi, atau usaha/organisasimu sendiri; wajib cantumkan kredit; **dilarang dijual, dijual ulang, atau dipakai untuk jasa berbayar ke pihak lain**. Lihat [LICENSE](LICENSE).
