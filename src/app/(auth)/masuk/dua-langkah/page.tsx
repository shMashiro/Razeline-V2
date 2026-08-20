import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FormDuaLangkah } from '@/components/form-dua-langkah';
import { Icon } from '@/components/icon';
import { ambilPengguna } from '@/lib/auth';
import { DUA_LANGKAH_ADMIN_AKTIF } from '@/lib/fitur';
import { bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata: Metadata = {
  title: 'Verifikasi Dua Langkah',
  robots: { index: false, follow: false },
};

export default async function HalamanDuaLangkah({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  if (!DUA_LANGKAH_ADMIN_AKTIF) redirect('/admin');
  if (!(await ambilPengguna())) redirect('/masuk');

  const params = await searchParams;
  const lanjutMentah = bacaParam(params, 'lanjut') ?? '/admin';
  const lanjut = /^\/(?!\/)/.test(lanjutMentah) ? lanjutMentah : '/admin';

  return (
    <div className="card p-6 sm:p-8">
      <header className="mb-6">
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Icon name="perisai" size={24} />
        </span>
        <h1 className="text-xl font-bold">Verifikasi Dua Langkah</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          Buka aplikasi autentikator Anda (Google Authenticator, Authy, atau sejenisnya) lalu
          masukkan kode 6 angka yang sedang ditampilkan.
        </p>
      </header>

      <FormDuaLangkah lanjut={lanjut} />
    </div>
  );
}
