'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon, IKON_KATEGORI } from '@/components/icon';
import type { Kategori, Profil } from '@/lib/types';

interface Props {
  kategori: Kategori[];
  profil: Profil | null;
}

export function MenuMobile({ kategori, profil }: Props) {
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    if (!buka) return;
    const tutupDenganEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBuka(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', tutupDenganEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', tutupDenganEsc);
    };
  }, [buka]);

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-surface-2 lg:hidden"
        aria-label="Buka menu"
        aria-expanded={buka}
      >
        <Icon name="menu" size={22} />
      </button>

      {buka && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setBuka(false)}
            aria-label="Tutup menu"
          />

          {/* Menutup laci begitu salah satu tautan di dalamnya ditekan. */}
          <nav
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setBuka(false);
            }}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="rounded-lg p-2 text-ink-700 hover:bg-surface-2"
                aria-label="Tutup menu"
              >
                <Icon name="tutup" size={20} />
              </button>
            </div>

            <div className="border-b p-4">
              {profil ? (
                <Link href="/akun" className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name="pengguna" size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {profil.full_name || 'Akun Saya'}
                    </span>
                    <span className="block truncate text-xs text-ink-500">{profil.email}</span>
                  </span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/masuk" className="btn btn-primary">
                    Masuk
                  </Link>
                  <Link href="/daftar" className="btn btn-outline">
                    Daftar
                  </Link>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-300">
                Jelajahi
              </p>
              <ul className="space-y-0.5">
                {[
                  { href: '/katalog', label: 'Semua Produk', ikon: 'kisi' as const },
                  { href: '/kategori', label: 'Kategori', ikon: 'kotak' as const },
                  { href: '/wishlist', label: 'Wishlist', ikon: 'hati' as const },
                  { href: '/pesanan', label: 'Pesanan Saya', ikon: 'paket' as const },
                  { href: '/lacak', label: 'Lacak Pesanan', ikon: 'truk' as const },
                  { href: '/bantuan', label: 'Bantuan', ikon: 'info' as const },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-2"
                    >
                      <Icon name={item.ikon} size={18} className="text-ink-500" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-300">
                Kategori
              </p>
              <ul className="space-y-0.5">
                {kategori.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/kategori/${item.slug}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-ink-700 hover:bg-surface-2"
                    >
                      <Icon
                        name={IKON_KATEGORI[item.icon] ?? 'kotak'}
                        size={18}
                        className="text-brand-600"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {profil?.role === 'admin' && (
              <div className="border-t p-4">
                <Link href="/admin" className="btn btn-secondary w-full">
                  <Icon name="geser" size={16} />
                  Dasbor Admin
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
