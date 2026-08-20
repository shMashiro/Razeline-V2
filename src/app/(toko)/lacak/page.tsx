import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Icon } from '@/components/icon';
import { RemahRoti } from '@/components/remah-roti';
import { ambilPesananPerKode } from '@/lib/pesanan';
import { bacaParam, type ParamPencarian } from '@/lib/url';
import { skemaKodePesanan } from '@/lib/validation';

export const metadata: Metadata = {
  title: 'Lacak Pesanan',
  description:
    'Cek status pesanan Razeline Komputer memakai kode pesanan, tanpa perlu membuat akun.',
};

const PESAN_GALAT: Record<string, string> = {
  format: 'Format kode pesanan belum sesuai. Contoh yang benar: RZL-2608-A1B2C3D4.',
  'tidak-ada': 'Pesanan dengan kode tersebut tidak ditemukan. Periksa kembali penulisannya.',
};

async function lacakPesanan(formData: FormData) {
  'use server';

  const hasil = skemaKodePesanan.safeParse(String(formData.get('kode') ?? ''));
  if (!hasil.success) redirect('/lacak?galat=format');

  const pesanan = await ambilPesananPerKode(hasil.data);
  if (!pesanan) redirect('/lacak?galat=tidak-ada');

  redirect(`/pesanan/${hasil.data}`);
}

export default async function HalamanLacak({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const galat = bacaParam(params, 'galat');

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Lacak Pesanan' }]} />

      <div className="mx-auto max-w-xl">
        <header className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Icon name="truk" size={26} />
          </span>
          <h1 className="text-xl font-bold sm:text-2xl">Lacak Pesanan</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Masukkan kode pesanan yang Anda terima setelah checkout. Tidak perlu login untuk
            melihat status pesanan.
          </p>
        </header>

        <form action={lacakPesanan} className="card space-y-4 p-5">
          {galat && PESAN_GALAT[galat] && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
            >
              <Icon name="peringatan" size={17} className="mt-0.5 shrink-0" />
              {PESAN_GALAT[galat]}
            </p>
          )}

          <label>
            <span className="label">Kode Pesanan</span>
            <input
              name="kode"
              required
              maxLength={20}
              className="field text-center text-base font-semibold uppercase tracking-widest"
              placeholder="RZL-2608-A1B2C3D4"
              aria-describedby="petunjuk-kode"
              autoComplete="off"
            />
            <span id="petunjuk-kode" className="mt-1.5 block text-xs text-ink-500">
              Kode terdiri dari awalan RZL, empat angka tahun-bulan, dan delapan karakter unik.
            </span>
          </label>

          <button type="submit" className="btn btn-primary btn-lg w-full">
            Cek Status Pesanan
          </button>
        </form>

        <div className="card mt-5 p-5">
          <h2 className="text-sm font-bold">Kode pesanan hilang?</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Hubungi admin toko lewat WhatsApp dengan menyebutkan nama dan nomor HP yang dipakai saat
            memesan. Bila Anda punya akun, seluruh riwayat pesanan bisa dilihat di halaman{' '}
            <Link href="/pesanan" className="font-semibold text-brand-600 hover:underline">
              Pesanan Saya
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
