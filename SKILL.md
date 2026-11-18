---
name: kantor-ai-10-agen
description: Sesuaikan paket 10 AI agent UMKM + Kantor AI 3D 2 lantai (contoh "Roti Senja") untuk usaha pengguna, lalu jalankan agentnya dan buka kantornya. Pakai saat diminta "kantor AI 10 agen", "10 agent UMKM", "kantor 2 lantai", atau menyesuaikan paket 10 agent untuk bisnis sendiri.
---

# Kantor AI 10 Agen (2 lantai)

Tujuan: dalam satu sesi, pengguna punya 10 agent yang nama, tugas, dan datanya sesuai usahanya sendiri, dan kantor 3D
2 lantai yang menampilkan laporan mereka di browser.

## 0. Tanya dulu (maksimal 4 pertanyaan, sekaligus)
1. Nama usaha.
2. Bidang usaha dan produk utamanya (mis. katering, toko baju, laundry).
3. Nama untuk 10 agent (boleh "terserah", pakai nama bawaan).
4. Data apa yang dia punya (penjualan, stok, pesanan, chat WA). Yang tidak ada, pakai data contoh dulu.

Kalau pengguna bilang "terserah", pakai struktur bawaan di bawah dan lanjut.

## 1. Siapkan proyek
Unduh paket "10 AI Agent UMKM + Kantor 3D 2 Lantai" dari malikisaputra.biz.id (Source Code), ekstrak, buka foldernya.
Isi paket: `AGENTS.md`, `.agents/agents/` (10 agent), `data/`, `src/` (kantor 3D), `BACA-DULU.txt`.
Folder `.agents` tersembunyi di Mac: Cmd + Shift + titik di Finder.

## 2. Struktur bawaan (jangan tambah/kurangi agent tanpa diminta)
| Lantai | Ruangan | Agent (key · nama) | Tugas |
|---|---|---|---|
| 1 Operasional | Toko & kasir | `kasir` Dina | rekap penjualan dari `data/penjualan.csv` |
| 1 | Toko & kasir | `pesanan` Rina | susun daftar pesanan yang harus dikirim |
| 1 | Toko & kasir | `cs` Fajar | draf balasan WA ke `balasan-wa.md` (tidak mengirim apa pun) |
| 1 | Dapur & kas | `stok` Bayu | cek stok bahan, tandai yang hampir habis |
| 1 | Dapur & kas | `keuangan` Sari | jumlah transaksi, tanpa nominal uang |
| 2 Tim ide | Ruang ide | `riset` Raka | ide produk & tren |
| 2 | Ruang ide | `konten` Sekar | caption IG dari hasil riset |
| 2 | Ruang ide | `desain` Lita | brief desain poster promo |
| 2 | Ruang rapat | `laporan` Doni | rangkum laporan lantai 1 |
| 2 | Ruang rapat | `manajer` Bu Ratna | putuskan prioritas hari ini |

## 3. Ubah ke usaha pengguna
- `AGENTS.md`: ganti baris bisnis contoh (Roti Senja) dengan usaha pengguna. Aturan lain biarkan.
- `.agents/agents/*.md`: ganti nama dan konteks produk di tiap agent. `name:` dan `subagent: true` jangan diubah.
- **Kunci laporan harus sama dengan `key` agent di `src/config.ts`** (`kasir`, `pesanan`, `cs`, `stok`, `keuangan`,
  `riset`, `konten`, `desain`, `laporan`, `manajer`). Kalau file agent menulis ke kunci nama orang (mis. `"dina"`),
  ganti ke key-nya, supaya laporannya tampil di kantor.
- `src/config.ts`: isi `KANTOR.nama` dan `KANTOR.subjudul`, label `RUANGAN` boleh disesuaikan (key jangan diubah),
  `nama` dan `tugas` di `AGEN` diganti. Posisi meja (`x`, `z`, `lantai`) biarkan.
- Papan nama 3D di gedung **tidak** ikut `KANTOR.nama`: ganti teks di `src/OfficeScene.tsx`
  (`g2.fillText('Roti Senja', …)`). Untuk nama 12 huruf atau lebih, kecilkan font `800 150px` jadi sekitar `110px`
  supaya tidak terpotong; cek di browser.
- `.agents/agents/admin.md` dan `penulis.md` adalah agent cadangan (tidak tampil di kantor). Biarkan, atau hapus kalau
  pengguna hanya mau 10 agent.
- `data/`: ganti dengan data pengguna, format kolom sama. Jangan tulis nominal uang.
- `src/laporan.json`: **jangan dikosongkan**. Biarkan contoh sampai agent menimpanya per kunci. `npm test` memakai isi
  file ini (tiap meja harus punya gelembung, Mission Board minimal 4 butir "menunggu"); kalau dikosongkan, tes gagal.

## 4. Jalankan agent (Antigravity CLI, gratis)
Pasang: Mac `curl -fsSL https://antigravity.google/cli/install.sh | bash`, Windows
`irm https://antigravity.google/cli/install.ps1 | iex`. Login Gmail (18+). Di folder paket ketik `agy`, lalu:
> minta agent kasir, stok, pesanan, cs, keuangan, riset, konten, desain mengerjakan tugasnya, lalu agent laporan dan
> manajer merangkum. Semua tulis ke src/laporan.json

Baca setiap izin sebelum setuju (izin anggota tim di kotak kuning: ctrl+k). Kuota gratis mingguan, cek `/usage`.
Claude Code atau Codex juga bisa menjalankan perintah yang sama dengan membaca `AGENTS.md` dan file agent.

## 5. Cek & buka kantor
```bash
npm install
npm test && npm run build
npm run dev   # buka alamat yang muncul; ?timelapse=1 untuk satu hari dipercepat
```
Pastikan 10 agent muncul di 2 lantai, tiap agent punya gelembung laporan, dan tidak ada meja bertumpuk.
Jalankan `npm test` sebelum agent mengisi laporan (tes memakai data contoh). Kalau setelah laporan asli masuk tes
Mission Board gagal karena butir "menunggu" kurang dari 4, itu wajar; cek tampilannya di browser saja.
Rekam video (opsional): `npm run rekam -- kantor.mp4`.

## Aturan
- Jangan mengarang angka di luar folder `data/`. Jangan tulis nominal uang, nomor rekening, atau data pribadi.
- Agent CS hanya membuat draf; tidak mengirim pesan apa pun.
- Jangan menambah teks, klaim, atau janji ke pelanggan yang tidak diminta pengguna.
- Kredit "Template oleh Maliki Saputra (@malikisaputra)" wajib dipertahankan. Tidak untuk diperjualbelikan.
- Selesai = 10 agent sudah menulis laporan, `npm test` lulus, build sukses, dan kantor sudah dilihat di browser.

---
<!-- kredit-maliki -->
**Kredit:** Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id.
**Lisensi Nonkomersial Maliki Studio:** gratis untuk belajar & usaha/organisasi sendiri. Dilarang dijual, dijual ulang, atau dipakai untuk jasa berbayar. Kredit wajib dipertahankan. Lihat `LICENSE`.
