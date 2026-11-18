/**
 * ✏️ UBAH DI SINI: nama kantor, ruangan, agen, jadwal, dan data contoh.
 * Semua yang tampil di kantor diambil dari file ini.
 */

import laporanAgen from './laporan.json';

export const KANTOR = {
  nama: 'indostill.id',
  /** Baris kecil di bawah nama (mis. nama perusahaan / personal brand). */
  subjudul: 'Tech & AI Creator Studio · 2 lantai',
  logo: '/logo-indostill.png',
};

/** Nama tiap lantai (lantai 2 ditumpuk di atas lantai 1). */
export const LANTAI = [
  { no: 1, label: 'Distribusi & Analitik' },
  { no: 2, label: 'Kreatif & Strategi' },
] as const;

/** Ruangan per lantai, dari kiri ke kanan. Lebarnya ikut `x0`–`x1` (meter, −7…7), lantainya `warna`, karpetnya `karpet`. */
export const RUANGAN = [
  { key: 'toko', label: 'Distribusi & Analitik', lantai: 1, x0: -7, x1: 0.2, warna: '#2c3e50', karpet: '#34495e' },
  { key: 'dapur', label: 'Studio Aset & Komunitas', lantai: 1, x0: 0.2, x1: 7, warna: '#1e272e', karpet: '#0abde3' },
  { key: 'ide', label: 'Riset Tren & Naskah', lantai: 2, x0: -7, x1: 0.2, warna: '#2d3436', karpet: '#6c5ce7' },
  { key: 'rapat', label: 'Desain Visual & Approval', lantai: 2, x0: 0.2, x1: 7, warna: '#222f3e', karpet: '#ee5253' },
] as const;
export type RoomKey = (typeof RUANGAN)[number]['key'];

export interface Agen {
  key: string;
  nama: string;
  /** Tugasnya, satu baris. */
  tugas: string;
  ruang: RoomKey;
  /** 1 atau 2. */
  lantai: 1 | 2;
  /** Warna baju. */
  warna: string;
  /** Posisi meja di lantainya (x kiri–kanan −7…7, z belakang–depan −3…3). */
  x: number;
  z: number;
}

/** Sepuluh agen, lima per lantai (posisi meja jangan bertumpuk). */
export const AGEN: Agen[] = [
  { key: 'kasir', nama: 'Dina', tugas: 'Analisis metrik konten', ruang: 'toko', lantai: 1, warna: '#0984e3', x: -5.3, z: -1.3 },
  { key: 'pesanan', nama: 'Rina', tugas: 'Jadwal & auto-publish', ruang: 'toko', lantai: 1, warna: '#00cec9', x: -3.0, z: -1.3 },
  { key: 'cs', nama: 'Fajar', tugas: 'Interaksi audiens & DM', ruang: 'toko', lantai: 1, warna: '#00b894', x: -4.2, z: 1.3 },
  { key: 'stok', nama: 'Bayu', tugas: 'Bank aset video & audio', ruang: 'dapur', lantai: 1, warna: '#fdcb6e', x: 3.4, z: -1.3 },
  { key: 'keuangan', nama: 'Sari', tugas: 'Tracker kolaborasi & link', ruang: 'dapur', lantai: 1, warna: '#e84393', x: 5.3, z: 1.0 },
  { key: 'riset', nama: 'Raka', tugas: 'Riset tren AI & tech', ruang: 'ide', lantai: 2, warna: '#6c5ce7', x: -5.3, z: -1.3 },
  { key: 'konten', nama: 'Sekar', tugas: 'Skrip video & caption', ruang: 'ide', lantai: 2, warna: '#a29bfe', x: -3.0, z: -1.3 },
  { key: 'desain', nama: 'Lita', tugas: 'Thumbnail & cover visual', ruang: 'ide', lantai: 2, warna: '#fd79a8', x: -4.2, z: 1.3 },
  { key: 'laporan', nama: 'Doni', tugas: 'Reviewer kualitas konten', ruang: 'rapat', lantai: 2, warna: '#636e72', x: 3.4, z: -1.3 },
  { key: 'manajer', nama: 'Bu Ratna', tugas: 'Strategi brand & approval', ruang: 'rapat', lantai: 2, warna: '#d63031', x: 5.3, z: 1.0 },
];

export type Aktivitas = 'kerja' | 'laporan' | 'belajar';

const HK = [1, 2, 3, 4, 5];
/** Jadwal kerja (WIB). `agen: '*'` = semua agen. `hari` 1 = Senin … 7 = Minggu. `menit` = lama tampil. */
export const JADWAL: { agen: string[] | '*'; mulai: string; menit: number; hari: number[]; aktivitas: Aktivitas; label: string }[] = [
  { agen: ['kasir'], mulai: '07:32', menit: 75, hari: HK, aktivitas: 'kerja', label: 'rekap penjualan…' },
  { agen: ['stok'], mulai: '07:36', menit: 75, hari: HK, aktivitas: 'kerja', label: 'cek stok bahan…' },
  { agen: ['pesanan'], mulai: '07:40', menit: 75, hari: HK, aktivitas: 'kerja', label: 'urutkan pesanan…' },
  { agen: ['cs'], mulai: '07:44', menit: 75, hari: HK, aktivitas: 'kerja', label: 'draf balasan WA…' },
  { agen: ['keuangan'], mulai: '07:48', menit: 75, hari: HK, aktivitas: 'kerja', label: 'hitung transaksi…' },
  { agen: ['riset'], mulai: '07:54', menit: 60, hari: HK, aktivitas: 'kerja', label: 'cari ide produk…' },
  { agen: ['konten'], mulai: '07:58', menit: 60, hari: HK, aktivitas: 'kerja', label: 'tulis caption IG…' },
  { agen: ['desain'], mulai: '08:02', menit: 60, hari: HK, aktivitas: 'kerja', label: 'susun brief poster…' },
  { agen: ['laporan'], mulai: '08:06', menit: 60, hari: HK, aktivitas: 'kerja', label: 'gabung laporan…' },
  { agen: ['manajer'], mulai: '08:10', menit: 60, hari: HK, aktivitas: 'kerja', label: 'atur prioritas…' },
  { agen: '*', mulai: '15:42', menit: 25, hari: HK, aktivitas: 'laporan', label: 'menulis laporan harian…' },
  { agen: '*', mulai: '20:00', menit: 120, hari: [1, 2, 3, 4, 5, 6, 7], aktivitas: 'belajar', label: 'belajar malam…' },
];

/** Jam kantor: di luar jadwal, agen "siap menerima perintah" (atau ngopi, lihat papan, ngobrol). */
export const JAM_KANTOR = { buka: '07:30', tutup: '18:00' };

export interface Laporan {
  /** Ringkasan hari ini (gelembung di atas kepala). */
  ringkasan?: string;
  /** Butir yang menunggu keputusanmu (tanda "!" dan Mission Board). */
  menunggu?: string[];
  /** Butir mendesak (mejanya berkedip). */
  mendesak?: string[];
  /** Angka hari ini (Mission Board). Jangan isi nominal uang kalau videonya mau dibagikan. */
  angka?: { label: string; nilai: string }[];
}

/**
 * Laporan hari ini per agen.
 */
export const LAPORAN: Record<string, Laporan> = laporanAgen;

/** Timelapse: satu hari dalam tiga babak (detik = lama tiap babak di video). */
export const BABAK = [
  { dari: '07:28', sampai: '08:44', detik: 12, judul: 'Pagi · 10 agent analisa & riset' },
  { dari: '15:36', sampai: '16:10', detik: 9, judul: 'Sore · review naskah & jadwal publish' },
  { dari: '19:52', sampai: '20:26', detik: 9, judul: 'Malam · auto-publish & belajar tren' },
];
