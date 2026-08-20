import { KelolaEntitas } from '@/components/admin/kelola-entitas';
import { hapusVoucher, simpanVoucher } from '@/lib/actions/admin-operasional';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Voucher' };

export default async function HalamanAdminVoucher() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('vouchers').select('*').order('created_at', { ascending: false });

  return (
    <KelolaEntitas
      judul="Voucher"
      keterangan="Kode promo yang bisa dipakai pelanggan saat checkout."
      labelTambah="Tambah Voucher"
      daftar={data ?? []}
      aksiSimpan={simpanVoucher}
      aksiHapus={hapusVoucher}
      kolom={[
        { kunci: 'code', judul: 'Kode', utama: true },
        { kunci: 'discount_value', judul: 'Nilai', format: 'angka' },
        { kunci: 'min_spend', judul: 'Min. Belanja', format: 'rupiah' },
        { kunci: 'used_count', judul: 'Terpakai', format: 'angka' },
        { kunci: 'ends_at', judul: 'Berakhir', format: 'tanggal' },
        { kunci: 'is_active', judul: 'Status', format: 'boolean' },
      ]}
      bidang={[
        {
          nama: 'code',
          label: 'Kode voucher',
          tipe: 'teks',
          wajib: true,
          placeholder: 'RAZELINE10',
          bantuan: 'Huruf kapital dan angka saja.',
        },
        {
          nama: 'discount_type',
          label: 'Jenis potongan',
          tipe: 'pilih',
          wajib: true,
          bawaan: 'percent',
          pilihan: [
            { nilai: 'percent', label: 'Persen (%)' },
            { nilai: 'fixed', label: 'Nominal tetap (Rp)' },
          ],
        },
        {
          nama: 'discount_value',
          label: 'Besar potongan',
          tipe: 'angka',
          wajib: true,
          bantuan: 'Isi 10 untuk 10%, atau 50000 untuk potongan Rp50.000.',
        },
        { nama: 'min_spend', label: 'Minimal belanja (Rp)', tipe: 'angka', bawaan: 0 },
        {
          nama: 'max_discount',
          label: 'Batas maksimal potongan (Rp)',
          tipe: 'angka',
          bantuan: 'Berguna untuk voucher persen agar potongan tidak terlalu besar.',
        },
        { nama: 'quota', label: 'Kuota pemakaian', tipe: 'angka', bantuan: 'Kosongkan bila tidak dibatasi.' },
        { nama: 'starts_at', label: 'Mulai berlaku', tipe: 'tanggal' },
        { nama: 'ends_at', label: 'Berakhir', tipe: 'tanggal' },
        { nama: 'description', label: 'Keterangan', tipe: 'area', lebar: 'penuh' },
        { nama: 'is_active', label: 'Voucher aktif', tipe: 'centang', bawaan: true, lebar: 'penuh' },
      ]}
    />
  );
}
