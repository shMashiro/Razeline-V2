import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FormMasuk } from '@/components/form-masuk';
import { Icon } from '@/components/icon';
import { ambilProfil } from '@/lib/auth';
import { bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Razeline Komputer untuk melihat riwayat pesanan dan wishlist.',
  robots: { index: false, follow: false },
};

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const lanjutMentah = bacaParam(params, 'lanjut') ?? '/';
  const lanjut = /^\/(?!\/)/.test(lanjutMentah) ? lanjutMentah : '/';

  const profil = await ambilProfil();
  if (profil) {
    redirect(profil.role === 'admin' ? '/admin' : lanjut);
  }

  return (
    <div className="card p-6 sm:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Masuk ke Akun</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gunakan email dan kata sandi yang Anda daftarkan.
        </p>
      </header>

      <FormMasuk lanjut={lanjut} />

      <p className="mt-6 flex items-start gap-2 rounded-lg bg-surface-2 px-3.5 py-3 text-xs leading-relaxed text-ink-500">
        <Icon name="perisai" size={15} className="mt-0.5 shrink-0 text-brand-600" />
        Akun admin wajib melewati verifikasi dua langkah dengan aplikasi autentikator setiap kali
        masuk.
      </p>
    </div>
  );
}
