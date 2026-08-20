'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { alihkanPersetujuanUlasan, hapusUlasan } from '@/lib/actions/admin-operasional';

export function AksiUlasan({ id, disetujui }: { id: string; disetujui: boolean }) {
  const [menunggu, mulai] = useTransition();
  const [galat, setGalat] = useState<string | null>(null);
  const router = useRouter();

  const jalankan = (aksi: () => Promise<{ galat?: string }>) => {
    setGalat(null);
    mulai(async () => {
      const hasil = await aksi();
      if (hasil.galat) setGalat(hasil.galat);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <button
          type="button"
          disabled={menunggu}
          onClick={() => jalankan(() => alihkanPersetujuanUlasan(id, !disetujui))}
          className="btn btn-ghost btn-sm"
        >
          <Icon name={disetujui ? 'mata' : 'centang'} size={14} />
          {disetujui ? 'Sembunyikan' : 'Tampilkan'}
        </button>
        <button
          type="button"
          disabled={menunggu}
          onClick={() => {
            if (!window.confirm('Hapus ulasan ini secara permanen?')) return;
            jalankan(() => hapusUlasan(id));
          }}
          className="btn btn-ghost btn-sm text-promo hover:bg-rose-50"
          aria-label="Hapus ulasan"
        >
          <Icon name="hapus" size={14} />
        </button>
      </div>
      {galat && <span className="text-xs text-promo">{galat}</span>}
    </div>
  );
}
