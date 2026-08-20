import { KelolaEntitas } from '@/components/admin/kelola-entitas';
import { hapusBanner, simpanBanner } from '@/lib/actions/admin-operasional';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Banner' };

export default async function HalamanAdminBanner() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('banners').select('*').order('sort_order');

  return (
    <KelolaEntitas
      judul="Banner Beranda"
      keterangan="Slide promosi yang muncul paling atas di halaman utama. Tanpa gambar pun tetap tampil rapi dengan warna latar."
      labelTambah="Tambah Banner"
      daftar={data ?? []}
      aksiSimpan={simpanBanner}
      aksiHapus={hapusBanner}
      kolom={[
        { kunci: 'title', judul: 'Judul', utama: true },
        { kunci: 'link_url', judul: 'Tautan' },
        { kunci: 'sort_order', judul: 'Urutan', format: 'angka' },
        { kunci: 'is_active', judul: 'Status', format: 'boolean' },
      ]}
      bidang={[
        { nama: 'title', label: 'Judul besar', tipe: 'teks', wajib: true, lebar: 'penuh' },
        { nama: 'subtitle', label: 'Kalimat pendukung', tipe: 'area', lebar: 'penuh' },
        {
          nama: 'image_url',
          label: 'URL gambar latar',
          tipe: 'url',
          lebar: 'penuh',
          bantuan: 'Kosongkan untuk memakai warna latar bawaan. Ukuran ideal 1600 x 600 piksel.',
        },
        {
          nama: 'link_url',
          label: 'Tautan tujuan',
          tipe: 'teks',
          placeholder: '/kategori/laptop',
          bantuan: 'Diawali garis miring, misalnya /katalog atau /kategori/laptop',
        },
        { nama: 'cta_label', label: 'Teks tombol', tipe: 'teks', bawaan: 'Lihat Produk' },
        { nama: 'sort_order', label: 'Urutan tampil', tipe: 'angka', bawaan: 0 },
        { nama: 'is_active', label: 'Tampilkan banner ini', tipe: 'centang', bawaan: true, lebar: 'penuh' },
      ]}
    />
  );
}
