'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { ubahPeranPengguna } from '@/lib/actions/admin-operasional';
import type { PeranPengguna } from '@/lib/types';

interface Props {
  id: string;
  nama: string;
  peran: PeranPengguna;
  diriSendiri: boolean;
}

export function AksiPengguna({ id, nama, peran, diriSendiri }: Props) {
  const [menunggu, mulai] = useTransition();
  const [galat, setGalat] = useState<string | null>(null);
  const router = useRouter();

  if (diriSendiri) {
    return <span className="text-xs text-ink-300">Akun Anda</span>;
  }

  const jadikanAdmin = peran === 'customer';

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={menunggu}
        onClick={() => {
          const pesan = jadikanAdmin
            ? `Jadikan "${nama}" sebagai admin? Admin dapat mengelola seluruh isi toko.`
            : `Cabut peran admin dari "${nama}"?`;
          if (!window.confirm(pesan)) return;

          setGalat(null);
          mulai(async () => {
            const hasil = await ubahPeranPengguna(id, jadikanAdmin ? 'admin' : 'customer');
            if (hasil.galat) setGalat(hasil.galat);
            else router.refresh();
          });
        }}
        className={`btn btn-sm ${jadikanAdmin ? 'btn-outline' : 'btn-ghost text-promo hover:bg-rose-50'}`}
      >
        <Icon name="perisai" size={14} />
        {jadikanAdmin ? 'Jadikan Admin' : 'Cabut Admin'}
      </button>
      {galat && <span className="max-w-56 text-right text-xs text-promo">{galat}</span>}
    </div>
  );
}
