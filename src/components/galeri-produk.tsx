'use client';

import { useState } from 'react';

import { GambarProduk } from '@/components/gambar-produk';
import type { GambarProduk as TipeGambar } from '@/lib/types';

interface Props {
  gambar: TipeGambar[];
  nama: string;
}

export function GaleriProduk({ gambar, nama }: Props) {
  const [aktif, setAktif] = useState(0);
  const terpilih = gambar[aktif];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl2 border border-line bg-surface-2">
        <GambarProduk
          url={terpilih?.url}
          alt={terpilih?.alt}
          nama={nama}
          sizes="(max-width: 1024px) 100vw, 560px"
          priority
          className="object-contain p-6"
        />
      </div>

      {gambar.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {gambar.map((item, indeks) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setAktif(indeks)}
                aria-label={`Lihat foto ${indeks + 1}`}
                aria-current={indeks === aktif}
                className={`relative block aspect-square w-full overflow-hidden rounded-lg border bg-surface-2 transition-colors ${
                  indeks === aktif ? 'border-brand-600 ring-1 ring-brand-600' : 'border-line hover:border-brand-300'
                }`}
              >
                <GambarProduk
                  url={item.url}
                  alt={item.alt}
                  nama={nama}
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
