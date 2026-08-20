import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FormDaftar } from '@/components/form-daftar';
import { ambilPengguna } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Daftar Akun',
  description:
    'Buat akun Razeline Komputer untuk menyimpan alamat, wishlist, dan riwayat pesanan Anda.',
  robots: { index: false, follow: false },
};

export default async function HalamanDaftar() {
  if (await ambilPengguna()) redirect('/akun');

  return (
    <div className="card p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Buat Akun Baru</h1>
        <p className="mt-1 text-sm text-ink-500">
          Akun memudahkan Anda melacak pesanan, menyimpan alamat, dan mengumpulkan wishlist.
          Belanja tanpa akun tetap bisa dilakukan.
        </p>
      </header>

      <FormDaftar />
    </div>
  );
}
