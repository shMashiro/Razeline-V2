'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Icon } from '@/components/icon';
import { hapusProduk } from '@/lib/actions/admin-katalog';

export function TombolHapusProduk({ id, nama }: { id: string; nama: string }) {
  const [menunggu, mulai] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={menunggu}
      onClick={() => {
        if (!window.confirm(`Hapus produk "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        mulai(async () => {
          const hasil = await hapusProduk(id);
          if (hasil.galat) window.alert(hasil.galat);
          else router.refresh();
        });
      }}
      className="btn btn-ghost btn-sm text-promo hover:bg-rose-50"
      aria-label={`Hapus ${nama}`}
    >
      <Icon name="hapus" size={14} />
    </button>
  );
}
