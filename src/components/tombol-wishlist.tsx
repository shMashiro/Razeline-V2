'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { alihkanWishlist } from '@/lib/actions/wishlist';

interface Props {
  productId: string;
  awalAktif?: boolean;
  masuk: boolean;
  gaya?: 'tombol' | 'ikon';
}

export function TombolWishlist({ productId, awalAktif = false, masuk, gaya = 'tombol' }: Props) {
  const [aktif, setAktif] = useState(awalAktif);
  const [pesan, setPesan] = useState<string | null>(null);
  const [menunggu, mulai] = useTransition();
  const router = useRouter();

  const klik = () => {
    if (!masuk) {
      router.push(`/masuk?lanjut=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    mulai(async () => {
      const hasil = await alihkanWishlist(productId);
      if (hasil.ok) {
        setAktif(Boolean(hasil.aktif));
        setPesan(hasil.pesan ?? null);
      } else {
        setPesan(hasil.pesan ?? 'Gagal memperbarui wishlist.');
      }
      setTimeout(() => setPesan(null), 2500);
    });
  };

  if (gaya === 'ikon') {
    return (
      <button
        type="button"
        onClick={klik}
        disabled={menunggu}
        aria-pressed={aktif}
        aria-label={aktif ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
        className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors ${
          aktif
            ? 'border-promo bg-promo/5 text-promo'
            : 'border-line bg-white text-ink-500 hover:border-promo hover:text-promo'
        }`}
      >
        <Icon name="hati" size={19} fill={aktif ? 'currentColor' : 'none'} />
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={klik}
        disabled={menunggu}
        aria-pressed={aktif}
        className={`btn w-full ${aktif ? 'border border-promo bg-promo/5 text-promo' : 'btn-outline'}`}
      >
        <Icon name="hati" size={17} fill={aktif ? 'currentColor' : 'none'} />
        {aktif ? 'Tersimpan di Wishlist' : 'Simpan ke Wishlist'}
      </button>
      {pesan && (
        <p className="text-center text-xs text-ink-500" role="status">
          {pesan}
        </p>
      )}
    </div>
  );
}
