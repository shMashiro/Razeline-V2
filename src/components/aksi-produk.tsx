'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Icon } from '@/components/icon';
import { useKeranjang } from '@/components/keranjang-provider';
import { TombolTambahKeranjang } from '@/components/tombol-tambah-keranjang';
import { rupiah } from '@/lib/format';
import type { ItemKeranjang } from '@/lib/types';

interface Props {
  item: Omit<ItemKeranjang, 'quantity'>;
}

/** Pengatur jumlah beli, tombol keranjang, dan tombol beli langsung. */
export function AksiProduk({ item }: Props) {
  const [jumlah, setJumlah] = useState(1);
  const { tambah } = useKeranjang();
  const router = useRouter();

  const habis = item.stock <= 0;
  const maks = Math.max(1, item.stock);

  const beliSekarang = () => {
    tambah(item, jumlah);
    router.push('/checkout');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-ink-700">Jumlah</span>
          <div className="inline-flex items-center rounded-lg border border-line">
            <button
              type="button"
              onClick={() => setJumlah((n) => Math.max(1, n - 1))}
              disabled={habis || jumlah <= 1}
              className="grid h-10 w-10 place-items-center rounded-l-lg text-ink-700 transition-colors hover:bg-surface-2 disabled:text-ink-300"
              aria-label="Kurangi jumlah"
            >
              <Icon name="kurang" size={16} />
            </button>
            <input
              type="number"
              min={1}
              max={maks}
              value={jumlah}
              disabled={habis}
              onChange={(event) => {
                const nilai = Number(event.target.value);
                if (!Number.isFinite(nilai)) return;
                setJumlah(Math.min(Math.max(1, Math.trunc(nilai)), maks));
              }}
              aria-label="Jumlah pembelian"
              className="h-10 w-14 border-x border-line text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setJumlah((n) => Math.min(maks, n + 1))}
              disabled={habis || jumlah >= maks}
              className="grid h-10 w-10 place-items-center rounded-r-lg text-ink-700 transition-colors hover:bg-surface-2 disabled:text-ink-300"
              aria-label="Tambah jumlah"
            >
              <Icon name="tambah" size={16} />
            </button>
          </div>
        </div>

        {!habis && (
          <p className="text-sm text-ink-500">
            Subtotal{' '}
            <strong className="price text-base text-ink-900">{rupiah(item.price * jumlah)}</strong>
          </p>
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <TombolTambahKeranjang item={item} jumlah={jumlah} ukuran="lg" penuh label="Masukkan Keranjang" />
        <button
          type="button"
          onClick={beliSekarang}
          disabled={habis}
          className="btn btn-lg w-full border border-brand-600 bg-white text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
