'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Icon, type NamaIkon } from '@/components/icon';

interface Tautan {
  href: string;
  label: string;
  ikon: NamaIkon;
}

interface Kelompok {
  judul: string;
  tautan: Tautan[];
}

export const MENU_ADMIN: Kelompok[] = [
  {
    judul: 'Ringkasan',
    tautan: [{ href: '/admin', label: 'Dasbor', ikon: 'grafik' }],
  },
  {
    judul: 'Penjualan',
    tautan: [
      { href: '/admin/pesanan', label: 'Pesanan', ikon: 'paket' },
      { href: '/admin/ulasan', label: 'Ulasan', ikon: 'bintang' },
    ],
  },
  {
    judul: 'Katalog',
    tautan: [
      { href: '/admin/produk', label: 'Produk', ikon: 'kotak' },
      { href: '/admin/kategori', label: 'Kategori', ikon: 'kisi' },
      { href: '/admin/merek', label: 'Merek', ikon: 'label' },
    ],
  },
  {
    judul: 'Pemasaran',
    tautan: [
      { href: '/admin/banner', label: 'Banner', ikon: 'gambar' },
      { href: '/admin/voucher', label: 'Voucher', ikon: 'tiket' },
    ],
  },
  {
    judul: 'Operasional',
    tautan: [
      { href: '/admin/pengiriman', label: 'Pengiriman', ikon: 'truk' },
      { href: '/admin/pembayaran', label: 'Pembayaran', ikon: 'kartu' },
    ],
  },
  {
    judul: 'Sistem',
    tautan: [
      { href: '/admin/pengguna', label: 'Pengguna', ikon: 'orang' },
      { href: '/admin/pengaturan', label: 'Pengaturan Toko', ikon: 'geser' },
      { href: '/admin/keamanan', label: 'Keamanan', ikon: 'perisai' },
    ],
  },
];

function aktifkan(jalur: string, href: string): boolean {
  return href === '/admin' ? jalur === '/admin' : jalur.startsWith(href);
}

function DaftarMenu({ jalur, onKlik }: { jalur: string; onKlik?: () => void }) {
  return (
    <nav className="space-y-5">
      {MENU_ADMIN.map((kelompok) => (
        <div key={kelompok.judul}>
          <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wider text-ink-300">
            {kelompok.judul}
          </p>
          <ul className="space-y-0.5">
            {kelompok.tautan.map((tautan) => {
              const aktif = aktifkan(jalur, tautan.href);
              return (
                <li key={tautan.href}>
                  <Link
                    href={tautan.href}
                    onClick={onKlik}
                    aria-current={aktif ? 'page' : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      aktif
                        ? 'bg-brand-600 font-semibold text-white'
                        : 'text-ink-700 hover:bg-surface-2'
                    }`}
                  >
                    <Icon name={tautan.ikon} size={17} />
                    {tautan.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SidebarAdmin() {
  const jalur = usePathname();
  return (
    <div className="sticky top-4 hidden lg:block">
      <DaftarMenu jalur={jalur} />
    </div>
  );
}

export function MenuAdminMobile() {
  const [buka, setBuka] = useState(false);
  const jalur = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="rounded-lg p-2 text-ink-700 hover:bg-surface-2 lg:hidden"
        aria-label="Buka menu admin"
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
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs overflow-y-auto bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Menu Admin</span>
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="rounded-lg p-2 hover:bg-surface-2"
                aria-label="Tutup menu"
              >
                <Icon name="tutup" size={20} />
              </button>
            </div>
            <DaftarMenu jalur={jalur} onKlik={() => setBuka(false)} />
          </div>
        </div>
      )}
    </>
  );
}
