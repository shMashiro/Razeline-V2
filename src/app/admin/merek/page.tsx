import { KelolaEntitas } from '@/components/admin/kelola-entitas';
import { hapusMerek, simpanMerek } from '@/lib/actions/admin-katalog';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Merek' };

export default async function HalamanAdminMerek() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('brands').select('*').order('name');

  return (
    <KelolaEntitas
      judul="Merek"
      keterangan="Merek dipakai sebagai filter di halaman kategori dan katalog."
      labelTambah="Tambah Merek"
      daftar={data ?? []}
      aksiSimpan={simpanMerek}
      aksiHapus={hapusMerek}
      kolom={[
        { kunci: 'name', judul: 'Nama', utama: true },
        { kunci: 'slug', judul: 'Slug' },
        { kunci: 'is_active', judul: 'Status', format: 'boolean' },
      ]}
      bidang={[
        { nama: 'name', label: 'Nama merek', tipe: 'teks', wajib: true, placeholder: 'ASUS' },
        {
          nama: 'slug',
          label: 'Slug URL',
          tipe: 'teks',
          wajib: true,
          placeholder: 'asus',
          bantuan: 'Huruf kecil dan tanda hubung.',
        },
        { nama: 'is_active', label: 'Tampilkan merek ini pada filter', tipe: 'centang', bawaan: true, lebar: 'penuh' },
      ]}
    />
  );
}
