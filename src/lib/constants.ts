import type { StatusPembayaran, StatusPesanan } from '@/lib/types';

export const PRODUK_PER_HALAMAN = 24;

export const URUTAN_PRODUK = {
  populer: { label: 'Paling Populer', column: 'view_count', ascending: false },
  terbaru: { label: 'Terbaru', column: 'created_at', ascending: false },
  terlaris: { label: 'Terlaris', column: 'sold_count', ascending: false },
  termurah: { label: 'Harga Terendah', column: 'price', ascending: true },
  termahal: { label: 'Harga Tertinggi', column: 'price', ascending: false },
  rating: { label: 'Rating Tertinggi', column: 'rating_avg', ascending: false },
} as const;

export type KunciUrutan = keyof typeof URUTAN_PRODUK;

export const RENTANG_HARGA_CEPAT = [
  { label: 'Di bawah Rp500rb', min: 0, max: 500_000 },
  { label: 'Rp500rb - Rp1jt', min: 500_000, max: 1_000_000 },
  { label: 'Rp1jt - Rp3jt', min: 1_000_000, max: 3_000_000 },
  { label: 'Rp3jt - Rp7jt', min: 3_000_000, max: 7_000_000 },
  { label: 'Rp7jt - Rp15jt', min: 7_000_000, max: 15_000_000 },
  { label: 'Di atas Rp15jt', min: 15_000_000, max: null },
] as const;

export const LABEL_STATUS_PESANAN: Record<
  StatusPesanan,
  { label: string; keterangan: string; warna: string }
> = {
  menunggu_konfirmasi: {
    label: 'Menunggu Konfirmasi',
    keterangan: 'Pesanan sudah masuk dan sedang menunggu dicek oleh admin toko.',
    warna: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  dikonfirmasi: {
    label: 'Dikonfirmasi',
    keterangan: 'Pesanan sudah dikonfirmasi. Silakan lanjutkan pembayaran bila belum.',
    warna: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  diproses: {
    label: 'Sedang Disiapkan',
    keterangan: 'Barang sedang disiapkan dan dikemas oleh tim toko.',
    warna: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  dikirim: {
    label: 'Dikirim',
    keterangan: 'Pesanan sudah diserahkan ke kurir atau sedang diantar.',
    warna: 'bg-violet-50 text-violet-800 border-violet-200',
  },
  selesai: {
    label: 'Selesai',
    keterangan: 'Pesanan sudah diterima. Terima kasih sudah berbelanja.',
    warna: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    keterangan: 'Pesanan dibatalkan dan stok sudah dikembalikan.',
    warna: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

export const ALUR_STATUS: StatusPesanan[] = [
  'menunggu_konfirmasi',
  'dikonfirmasi',
  'diproses',
  'dikirim',
  'selesai',
];

export const LABEL_STATUS_BAYAR: Record<StatusPembayaran, { label: string; warna: string }> = {
  belum_bayar: { label: 'Belum Dibayar', warna: 'bg-rose-50 text-rose-700 border-rose-200' },
  menunggu_verifikasi: {
    label: 'Menunggu Verifikasi',
    warna: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  lunas: { label: 'Lunas', warna: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refund: { label: 'Dana Dikembalikan', warna: 'bg-slate-100 text-slate-700 border-slate-200' },
};

/** Kunci penyimpanan keranjang di localStorage. */
export const KUNCI_KERANJANG = 'razeline.keranjang.v1';
export const KUNCI_WISHLIST_TAMU = 'razeline.wishlist.v1';

/** Daftar provinsi Indonesia untuk isian alamat pengiriman. */
export const PROVINSI = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi',
  'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung',
  'DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan',
] as const;
