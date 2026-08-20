import Link from 'next/link';

import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import { ambilKategori, ambilPengaturanToko } from '@/lib/queries';
import { tautanWhatsApp } from '@/lib/whatsapp';

export async function SiteFooter() {
  const [pengaturan, kategori] = await Promise.all([ambilPengaturanToko(), ambilKategori()]);

  const tautanBantuan = [
    { href: '/lacak', label: 'Lacak Pesanan' },
    { href: '/pesanan', label: 'Pesanan Saya' },
    { href: '/bantuan', label: 'Cara Belanja' },
    { href: '/bantuan#pembayaran', label: 'Metode Pembayaran' },
    { href: '/bantuan#garansi', label: 'Garansi & Retur' },
  ];

  return (
    <footer className="mt-16 border-t bg-surface-2">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-ink-500">
            {pengaturan.tagline ||
              'Toko komputer dan elektronik dengan harga terjangkau serta garansi resmi.'}
          </p>
          <div className="flex gap-2">
            {pengaturan.whatsapp && (
              <a
                href={tautanWhatsApp(pengaturan.whatsapp, 'Halo Razeline Komputer, saya mau tanya.')}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-700 transition-colors hover:border-emerald-300 hover:text-emerald-600"
                aria-label="Hubungi via WhatsApp"
              >
                <Icon name="whatsapp" size={18} />
              </a>
            )}
            {pengaturan.instagram && (
              <a
                href={pengaturan.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-700 transition-colors hover:border-pink-300 hover:text-pink-600"
                aria-label="Instagram Razeline Komputer"
              >
                <Icon name="instagram" size={18} />
              </a>
            )}
            {pengaturan.facebook && (
              <a
                href={pengaturan.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink-700 transition-colors hover:border-blue-300 hover:text-blue-600"
                aria-label="Facebook Razeline Komputer"
              >
                <Icon name="facebook" size={18} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold">Kategori Populer</h2>
          <ul className="space-y-2 text-sm text-ink-500">
            {kategori.slice(0, 6).map((item) => (
              <li key={item.id}>
                <Link href={`/kategori/${item.slug}`} className="hover:text-brand-600">
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/kategori" className="font-medium text-brand-600 hover:text-brand-700">
                Lihat semua kategori
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold">Bantuan</h2>
          <ul className="space-y-2 text-sm text-ink-500">
            {tautanBantuan.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold">Kunjungi Toko</h2>
          <ul className="space-y-3 text-sm text-ink-500">
            <li className="flex gap-2.5">
              <Icon name="lokasi" size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <span>{pengaturan.address}</span>
            </li>
            {pengaturan.operational_hours && (
              <li className="flex gap-2.5">
                <Icon name="jam" size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>{pengaturan.operational_hours}</span>
              </li>
            )}
            {pengaturan.phone && (
              <li className="flex gap-2.5">
                <Icon name="telepon" size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <a href={`tel:${pengaturan.phone}`} className="hover:text-brand-600">
                  {pengaturan.phone}
                </a>
              </li>
            )}
            {pengaturan.email && (
              <li className="flex gap-2.5">
                <Icon name="surel" size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <a href={`mailto:${pengaturan.email}`} className="hover:text-brand-600">
                  {pengaturan.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {pengaturan.store_name}. Seluruh hak cipta dilindungi.
          </p>
          <p>Harga dapat berubah sewaktu-waktu mengikuti harga distributor.</p>
        </div>
      </div>
    </footer>
  );
}
