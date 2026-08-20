'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Icon } from '@/components/icon';

export default function GalatGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Terjadi galat pada halaman:', error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-2 px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-promo">
        <Icon name="peringatan" size={30} />
      </span>

      <h1 className="mt-5 text-xl font-bold sm:text-2xl">Ada gangguan sesaat</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
        Maaf, halaman ini gagal dimuat. Silakan coba muat ulang. Bila masalah berlanjut, hubungi
        admin toko lewat WhatsApp dan sebutkan halaman yang sedang Anda buka.
      </p>

      {error.digest && (
        <p className="mt-3 text-xs text-ink-300">Kode galat: {error.digest}</p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          <Icon name="segarkan" size={16} />
          Coba Lagi
        </button>
        <Link href="/" className="btn btn-outline">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
