import Link from 'next/link';

import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';

export const metadata = {
  title: 'Halaman Tidak Ditemukan',
  robots: { index: false, follow: false },
};

export default function TidakDitemukan() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-2 px-4 text-center">
      <Logo />

      <span className="mt-8 grid h-16 w-16 place-items-center rounded-full bg-white text-ink-300">
        <Icon name="cari" size={30} />
      </span>

      <h1 className="mt-5 text-xl font-bold sm:text-2xl">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
        Alamat yang Anda buka mungkin salah ketik, atau produknya sudah tidak lagi kami jual.
        Silakan kembali ke beranda atau telusuri katalog kami.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
        <Link href="/katalog" className="btn btn-outline">
          Lihat Katalog
        </Link>
        <Link href="/lacak" className="btn btn-ghost">
          Lacak Pesanan
        </Link>
      </div>
    </div>
  );
}
