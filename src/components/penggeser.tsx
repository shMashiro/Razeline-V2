'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { Icon } from '@/components/icon';

/**
 * Wadah yang bisa digeser ke samping. Di layar sentuh cukup digeser jari,
 * di layar besar muncul tombol panah.
 */
export function Penggeser({ children }: { children: ReactNode }) {
  const wadah = useRef<HTMLDivElement>(null);
  const [bisaKiri, setBisaKiri] = useState(false);
  const [bisaKanan, setBisaKanan] = useState(false);

  const periksa = useCallback(() => {
    const el = wadah.current;
    if (!el) return;
    setBisaKiri(el.scrollLeft > 8);
    setBisaKanan(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    periksa();
    const el = wadah.current;
    if (!el) return;
    const pengamat = new ResizeObserver(periksa);
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, [periksa]);

  const geser = (arah: 1 | -1) => {
    const el = wadah.current;
    if (!el) return;
    el.scrollBy({ left: arah * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={wadah}
        onScroll={periksa}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-1"
      >
        {children}
      </div>

      {bisaKiri && (
        <button
          type="button"
          onClick={() => geser(-1)}
          aria-label="Geser ke kiri"
          className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-white p-2 text-ink-700 shadow-sm transition-colors hover:bg-surface-2 lg:block"
        >
          <Icon name="kiri" size={18} />
        </button>
      )}
      {bisaKanan && (
        <button
          type="button"
          onClick={() => geser(1)}
          aria-label="Geser ke kanan"
          className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-white p-2 text-ink-700 shadow-sm transition-colors hover:bg-surface-2 lg:block"
        >
          <Icon name="kanan" size={18} />
        </button>
      )}
    </div>
  );
}
