import { KelolaEntitas } from '@/components/admin/kelola-entitas';
import { hapusPengiriman, simpanPengiriman } from '@/lib/actions/admin-operasional';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Metode Pengiriman' };

export default async function HalamanAdminPengiriman() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('shipping_methods').select('*').order('sort_order');

  return (
    <KelolaEntitas
      judul="Metode Pengiriman"
      keterangan="Pilihan pengiriman beserta ongkosnya yang muncul di halaman checkout."
      labelTambah="Tambah Metode"
      daftar={data ?? []}
      aksiSimpan={simpanPengiriman}
      aksiHapus={hapusPengiriman}
      kolom={[
        { kunci: 'name', judul: 'Layanan', utama: true },
        { kunci: 'cost', judul: 'Ongkos', format: 'rupiah' },
        { kunci: 'estimated_days', judul: 'Estimasi' },
        { kunci: 'is_active', judul: 'Status', format: 'boolean' },
      ]}
      bidang={[
        { nama: 'name', label: 'Nama layanan', tipe: 'teks', wajib: true, placeholder: 'Kurir Toko (Cibeber)' },
        { nama: 'cost', label: 'Ongkos kirim (Rp)', tipe: 'angka', wajib: true, bawaan: 0 },
        { nama: 'estimated_days', label: 'Estimasi waktu', tipe: 'teks', placeholder: '1 - 2 hari' },
        { nama: 'description', label: 'Keterangan', tipe: 'area', lebar: 'penuh' },
        { nama: 'sort_order', label: 'Urutan tampil', tipe: 'angka', bawaan: 0 },
        { nama: 'is_active', label: 'Tawarkan metode ini saat checkout', tipe: 'centang', bawaan: true, lebar: 'penuh' },
      ]}
    />
  );
}
