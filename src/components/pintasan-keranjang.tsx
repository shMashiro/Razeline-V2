'use client';

import Link from 'next/link';

import { Icon } from '@/components/icon';
import { useKeranjang } from '@/components/keranjang-provider';

/** Ikon keranjang di header lengkap dengan jumlah barang. */
export function PintasanKeranjang() {
  const { jumlahBarang, siap } = useKeranjang();

  return (
    <Link
      href="/keranjang"
      className="relative rounded-lg p-2 text-ink-700 transition-colors hover:bg-surface-2 hover:text-brand-600"
      aria-label={
        siap && jumlahBarang > 0 ? `Keranjang, ${jumlahBarang} barang` : 'Keranjang belanja'
      }
    >
      <Icon name="keranjang" size={22} />
      {siap && jumlahBarang > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-promo px-1 text-[10px] font-bold text-white">
          {jumlahBarang > 99 ? '99+' : jumlahBarang}
        </span>
      )}
    </Link>
  );
}
