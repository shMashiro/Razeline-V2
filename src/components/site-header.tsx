import Link from 'next/link';

import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import { MenuMobile } from '@/components/menu-mobile';
import { PintasanKeranjang } from '@/components/pintasan-keranjang';
import { ambilProfil } from '@/lib/auth';
import { ambilKategori, ambilPengaturanToko } from '@/lib/queries';

export async function SiteHeader() {
  const [kategori, pengaturan, profil] = await Promise.all([
    ambilKategori(),
    ambilPengaturanToko(),
    ambilProfil(),
  ]);

  const kategoriUtama = kategori.slice(0, 7);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* Baris informasi toko */}
      <div className="hidden bg-brand-700 text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="inline-flex items-center gap-1.5">
            <Icon name="lokasi" size={13} />
            {pengaturan.address}
          </p>
          <div className="flex items-center gap-5">
            {pengaturan.operational_hours && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="jam" size={13} />
                {pengaturan.operational_hours}
              </span>
            )}
            {pengaturan.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="telepon" size={13} />
                {pengaturan.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Baris utama */}
      <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
        <MenuMobile kategori={kategori} profil={profil} />
        <Logo />

        <form action="/katalog" method="get" role="search" className="ml-auto hidden flex-1 md:block">
          <div className="relative mx-auto max-w-xl">
            <Icon
              name="cari"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              type="search"
              name="q"
              placeholder="Cari laptop, SSD, printer..."
              aria-label="Cari produk"
              maxLength={80}
              className="field pl-10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Link
            href="/wishlist"
            className="hidden rounded-lg p-2 text-ink-700 transition-colors hover:bg-surface-2 hover:text-brand-600 sm:block"
            aria-label="Wishlist"
          >
            <Icon name="hati" size={22} />
          </Link>

          <PintasanKeranjang />

          {profil ? (
            <Link
              href={profil.role === 'admin' ? '/admin' : '/akun'}
              className="ml-1 hidden items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600 lg:inline-flex"
            >
              <Icon name="pengguna" size={17} />
              <span className="max-w-[9rem] truncate">
                {profil.role === 'admin' ? 'Dasbor Admin' : profil.full_name.split(' ')[0] || 'Akun'}
              </span>
            </Link>
          ) : (
            <div className="ml-1 hidden items-center gap-2 lg:flex">
              <Link href="/masuk" className="btn btn-outline btn-sm">
                Masuk
              </Link>
              <Link href="/daftar" className="btn btn-primary btn-sm">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pencarian versi ponsel */}
      <div className="container-page pb-3 md:hidden">
        <form action="/katalog" method="get" role="search">
          <div className="relative">
            <Icon
              name="cari"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              type="search"
              name="q"
              placeholder="Cari produk..."
              aria-label="Cari produk"
              maxLength={80}
              className="field pl-10"
            />
          </div>
        </form>
      </div>

      {/* Navigasi kategori */}
      <nav aria-label="Kategori utama" className="hidden border-t lg:block">
        <div className="container-page flex h-11 items-center gap-1 overflow-x-auto">
          <Link
            href="/kategori"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            <Icon name="kisi" size={16} />
            Semua Kategori
          </Link>
          <span className="mx-1 h-4 w-px bg-line" />
          {kategoriUtama.map((item) => (
            <Link
              key={item.id}
              href={`/kategori/${item.slug}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-ink-700 transition-colors hover:bg-surface-2 hover:text-brand-600"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/lacak"
            className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-2 hover:text-brand-600"
          >
            Lacak Pesanan
          </Link>
        </div>
      </nav>

      {pengaturan.announcement && (
        <div className="border-t bg-amber-50">
          <p className="container-page flex items-center justify-center gap-2 py-2 text-center text-xs font-medium text-amber-900">
            <Icon name="label" size={14} className="shrink-0" />
            {pengaturan.announcement}
          </p>
        </div>
      )}
    </header>
  );
}
