'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { Icon } from '@/components/icon';

/** Membungkus panel filter menjadi laci geser pada layar kecil. */
export function PanelFilterMobile({
  children,
  jumlahAktif,
}: {
  children: ReactNode;
  jumlahAktif: number;
}) {
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    if (!buka) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [buka]);

  return (
    <>
      <button type="button" onClick={() => setBuka(true)} className="btn btn-outline btn-sm lg:hidden">
        <Icon name="saring" size={16} />
        Filter
        {jumlahAktif > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
            {jumlahAktif}
          </span>
        )}
      </button>

      {buka && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setBuka(false)}
            aria-label="Tutup filter"
          />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-bold">Filter Produk</span>
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="rounded-lg p-2 text-ink-700 hover:bg-surface-2"
                aria-label="Tutup filter"
              >
                <Icon name="tutup" size={20} />
              </button>
            </div>

            {/* Filter berupa tautan, jadi laci ditutup begitu salah satunya dipilih. */}
            <div
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a')) setBuka(false);
              }}
              className="flex-1 overflow-y-auto p-4"
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
