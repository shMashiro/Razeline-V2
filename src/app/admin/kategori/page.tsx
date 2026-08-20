import { KelolaEntitas } from '@/components/admin/kelola-entitas';
import { hapusKategori, simpanKategori } from '@/lib/actions/admin-katalog';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Kategori' };

const PILIHAN_IKON = [
  { nilai: 'laptop', label: 'Laptop' },
  { nilai: 'desktop', label: 'Komputer' },
  { nilai: 'cpu', label: 'Prosesor' },
  { nilai: 'board', label: 'Motherboard' },
  { nilai: 'gpu', label: 'Kartu Grafis' },
  { nilai: 'memory', label: 'RAM / Penyimpanan' },
  { nilai: 'monitor', label: 'Monitor' },
  { nilai: 'keyboard', label: 'Keyboard & Mouse' },
  { nilai: 'printer', label: 'Printer' },
  { nilai: 'network', label: 'Jaringan' },
  { nilai: 'audio', label: 'Audio' },
  { nilai: 'plug', label: 'Aksesoris & Daya' },
  { nilai: 'box', label: 'Umum' },
];

export default async function HalamanAdminKategori() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('categories').select('*').order('sort_order');

  return (
    <KelolaEntitas
      judul="Kategori"
      keterangan="Kelompok besar produk yang tampil di beranda dan menu navigasi."
      labelTambah="Tambah Kategori"
      daftar={data ?? []}
      aksiSimpan={simpanKategori}
      aksiHapus={hapusKategori}
      kolom={[
        { kunci: 'name', judul: 'Nama', utama: true },
        { kunci: 'slug', judul: 'Slug' },
        { kunci: 'image_url', judul: 'Foto', format: 'gambar' },
        { kunci: 'sort_order', judul: 'Urutan', format: 'angka' },
        { kunci: 'is_active', judul: 'Status', format: 'boolean' },
      ]}
      bidang={[
        { nama: 'name', label: 'Nama kategori', tipe: 'teks', wajib: true },
        {
          nama: 'slug',
          label: 'Slug URL',
          tipe: 'teks',
          wajib: true,
          bantuan: 'Huruf kecil dan tanda hubung. Contoh: kartu-grafis',
          placeholder: 'kartu-grafis',
        },
        {
          nama: 'description',
          label: 'Keterangan singkat',
          tipe: 'area',
          lebar: 'penuh',
          placeholder: 'Dijelaskan singkat agar pengunjung awam paham isi kategori ini.',
        },
        {
          nama: 'image_url',
          label: 'Foto kategori',
          tipe: 'gambar',
          folder: 'kategori',
          lebar: 'penuh',
          bantuan:
            'Tampil di halaman Kategori dan pintasan beranda. Sebaiknya foto mendatar, misalnya 800 x 600 piksel.',
        },
        {
          nama: 'icon',
          label: 'Ikon menu',
          tipe: 'pilih',
          wajib: true,
          pilihan: PILIHAN_IKON,
          bawaan: 'box',
          bantuan: 'Hanya dipakai pada daftar menu di layar ponsel.',
        },
        { nama: 'sort_order', label: 'Urutan tampil', tipe: 'angka', bawaan: 0 },
        { nama: 'is_active', label: 'Tampilkan kategori ini di toko', tipe: 'centang', bawaan: true, lebar: 'penuh' },
      ]}
    />
  );
}
