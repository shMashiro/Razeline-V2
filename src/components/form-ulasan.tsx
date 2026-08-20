'use client';

import { useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { kirimUlasan } from '@/lib/actions/ulasan';

const JALUR_BINTANG = 'm12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z';

interface Props {
  productId: string;
  ratingAwal?: number;
  komentarAwal?: string;
}

export function FormUlasan({ productId, ratingAwal = 0, komentarAwal = '' }: Props) {
  const [rating, setRating] = useState(ratingAwal);
  const [sorot, setSorot] = useState(0);
  const [komentar, setKomentar] = useState(komentarAwal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [menunggu, mulai] = useTransition();

  const kirim = () => {
    setPesan(null);
    mulai(async () => {
      const hasil = await kirimUlasan({ product_id: productId, rating, comment: komentar });
      setPesan({ ok: hasil.ok, teks: hasil.pesan });
    });
  };

  const tampil = sorot || rating;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold">Tulis Ulasan Anda</h3>
      <p className="mt-1 text-sm text-ink-500">
        Ulasan Anda membantu pembeli lain memilih barang yang tepat.
      </p>

      <div className="mt-4 flex items-center gap-1" onMouseLeave={() => setSorot(0)}>
        {[1, 2, 3, 4, 5].map((nilai) => (
          <button
            key={nilai}
            type="button"
            onClick={() => setRating(nilai)}
            onMouseEnter={() => setSorot(nilai)}
            aria-label={`Beri ${nilai} bintang`}
            aria-pressed={rating === nilai}
            className="p-0.5"
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="currentColor"
              className={nilai <= tampil ? 'text-amber-400' : 'text-slate-200'}
            >
              <path d={JALUR_BINTANG} />
            </svg>
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm font-semibold text-ink-700">{rating}/5</span>}
      </div>

      <label className="mt-4 block">
        <span className="label">Komentar (opsional)</span>
        <textarea
          className="field"
          rows={3}
          maxLength={600}
          value={komentar}
          onChange={(event) => setKomentar(event.target.value)}
          placeholder="Bagaimana pengalaman Anda memakai produk ini?"
        />
      </label>

      {pesan && (
        <p
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
            pesan.ok
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-rose-50 text-rose-800'
          }`}
        >
          <Icon name={pesan.ok ? 'centang' : 'peringatan'} size={16} className="mt-0.5 shrink-0" />
          {pesan.teks}
        </p>
      )}

      <button
        type="button"
        onClick={kirim}
        disabled={menunggu || rating === 0}
        className="btn btn-primary mt-4"
      >
        {menunggu ? 'Menyimpan...' : 'Kirim Ulasan'}
      </button>
    </div>
  );
}
