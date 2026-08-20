'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/icon';

/** Tombol salin dengan umpan balik singkat. */
export function SalinTeks({ teks, label = 'Salin' }: { teks: string; label?: string }) {
  const [tersalin, setTersalin] = useState(false);

  useEffect(() => {
    if (!tersalin) return;
    const jeda = setTimeout(() => setTersalin(false), 1800);
    return () => clearTimeout(jeda);
  }, [tersalin]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(teks);
          setTersalin(true);
        } catch {
          // Peramban tanpa izin clipboard — pengguna bisa menyalin manual.
        }
      }}
      className="btn btn-outline btn-sm"
      aria-live="polite"
    >
      <Icon name={tersalin ? 'centang' : 'kotak'} size={14} />
      {tersalin ? 'Tersalin' : label}
    </button>
  );
}
