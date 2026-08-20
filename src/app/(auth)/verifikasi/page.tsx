import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FormVerifikasi } from '@/components/form-verifikasi';
import { Icon } from '@/components/icon';
import { bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata: Metadata = {
  title: 'Verifikasi Email',
  robots: { index: false, follow: false },
};

export default async function HalamanVerifikasi({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const email = bacaParam(params, 'email');
  const alasan = bacaParam(params, 'alasan');

  if (!email) redirect('/daftar');

  return (
    <div className="card p-6 sm:p-8">
      <header className="mb-6">
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Icon name="surel" size={24} />
        </span>
        <h1 className="text-xl font-bold">Verifikasi Email Anda</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          {alasan === 'belum-verifikasi'
            ? 'Akun ini belum diverifikasi. '
            : 'Satu langkah lagi. '}
          Kami mengirim kode verifikasi ke <strong className="text-ink-900">{email}</strong>.
          Periksa juga folder spam bila belum masuk.
        </p>
      </header>

      <FormVerifikasi email={email} />

      <p className="mt-6 text-center text-sm text-ink-500">
        Salah alamat email?{' '}
        <Link href="/daftar" className="font-semibold text-brand-600 hover:underline">
          Daftar ulang
        </Link>
      </p>
    </div>
  );
}
