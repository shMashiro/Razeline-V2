'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/icon';
import { useKeranjang } from '@/components/keranjang-provider';
import type { ItemKeranjang } from '@/lib/types';

interface Props {
  item: Omit<ItemKeranjang, 'quantity'>;
  jumlah?: number;
  penuh?: boolean;
  ukuran?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function TombolTambahKeranjang({
  item,
  jumlah = 1,
  penuh = false,
  ukuran = 'sm',
  label = 'Keranjang',
}: Props) {
  const { tambah } = useKeranjang();
  const [barusan, setBarusan] = useState(false);

  useEffect(() => {
    if (!barusan) return;
    const jeda = setTimeout(() => setBarusan(false), 1600);
    return () => clearTimeout(jeda);
  }, [barusan]);

  const habis = item.stock <= 0;
  const kelasUkuran = ukuran === 'lg' ? 'btn-lg' : ukuran === 'md' ? '' : 'btn-sm';

  return (
    <button
      type="button"
      disabled={habis}
      onClick={() => {
        tambah(item, jumlah);
        setBarusan(true);
      }}
      className={`btn ${kelasUkuran} ${barusan ? 'btn-secondary' : 'btn-primary'} ${penuh ? 'w-full' : ''}`}
      aria-label={habis ? `${item.name} sedang kosong` : `Tambahkan ${item.name} ke keranjang`}
    >
      <Icon name={barusan ? 'centang' : 'keranjang'} size={ukuran === 'lg' ? 18 : 16} />
      {habis ? 'Stok Habis' : barusan ? 'Ditambahkan' : label}
    </button>
  );
}
