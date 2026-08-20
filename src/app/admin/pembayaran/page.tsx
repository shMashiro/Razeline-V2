import { KelolaEntitas } from '@/components/admin/kelola-entitas';
import { hapusPembayaran, simpanPembayaran } from '@/lib/actions/admin-operasional';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Metode Pembayaran' };

export default async function HalamanAdminPembayaran() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('payment_methods').select('*').order('sort_order');

  return (
    <KelolaEntitas
      judul="Metode Pembayaran"
      keterangan="Cara pembayaran yang bisa dipilih pelanggan beserta petunjuk pembayarannya."
      labelTambah="Tambah Metode"
      daftar={data ?? []}
      aksiSimpan={simpanPembayaran}
      aksiHapus={hapusPembayaran}
      kolom={[
        { kunci: 'name', judul: 'Metode', utama: true },
        { kunci: 'type', judul: 'Jenis' },
        { kunci: 'account_number', judul: 'Nomor Akun' },
        { kunci: 'is_active', judul: 'Status', format: 'boolean' },
      ]}
      bidang={[
        { nama: 'name', label: 'Nama metode', tipe: 'teks', wajib: true, placeholder: 'Transfer Bank BCA' },
        {
          nama: 'type',
          label: 'Jenis pembayaran',
          tipe: 'pilih',
          wajib: true,
          bawaan: 'transfer',
          pilihan: [
            { nilai: 'transfer', label: 'Transfer Bank' },
            { nilai: 'qris', label: 'QRIS' },
            { nilai: 'ewallet', label: 'Dompet Digital' },
            { nilai: 'cod', label: 'Bayar di Tempat (COD)' },
          ],
        },
        { nama: 'account_name', label: 'Nama pemilik rekening', tipe: 'teks', placeholder: 'Razeline Komputer' },
        { nama: 'account_number', label: 'Nomor rekening / akun', tipe: 'teks', placeholder: '1234567890' },
        {
          nama: 'instructions',
          label: 'Petunjuk untuk pelanggan',
          tipe: 'area',
          lebar: 'penuh',
          placeholder: 'Transfer sesuai total tagihan, lalu kirim bukti transfer lewat WhatsApp.',
        },
        { nama: 'sort_order', label: 'Urutan tampil', tipe: 'angka', bawaan: 0 },
        { nama: 'is_active', label: 'Tawarkan metode ini saat checkout', tipe: 'centang', bawaan: true, lebar: 'penuh' },
      ]}
    />
  );
}
