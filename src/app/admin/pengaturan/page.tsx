import { FormPengaturan } from '@/components/admin/form-pengaturan';
import { ambilPengaturanToko } from '@/lib/queries';

export const metadata = { title: 'Pengaturan Toko' };

export default async function HalamanAdminPengaturan() {
  const pengaturan = await ambilPengaturanToko();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Pengaturan Toko</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Data di halaman ini tampil di seluruh bagian situs, termasuk pesan konfirmasi WhatsApp.
        </p>
      </header>

      <FormPengaturan pengaturan={pengaturan} />
    </div>
  );
}
