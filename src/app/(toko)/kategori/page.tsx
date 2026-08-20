import type { Metadata } from 'next';
import Link from 'next/link';

import { GambarKategori } from '@/components/gambar-kategori';
import { Icon } from '@/components/icon';
import { RemahRoti } from '@/components/remah-roti';
import { angka } from '@/lib/format';
import { ambilKategori } from '@/lib/queries';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Semua Kategori',
  description:
    'Daftar lengkap kategori elektronik di Razeline Komputer: laptop, PC rakitan, processor, motherboard, kartu grafis, monitor, printer, jaringan, dan lainnya.',
};

/** Menghitung jumlah produk aktif per kategori dalam satu kueri. */
async function hitungProdukPerKategori(): Promise<Map<string, number>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('products').select('category_id').eq('is_active', true);

  const jumlah = new Map<string, number>();
  for (const baris of data ?? []) {
    if (!baris.category_id) continue;
    jumlah.set(baris.category_id, (jumlah.get(baris.category_id) ?? 0) + 1);
  }
  return jumlah;
}

export default async function HalamanKategori() {
  const [kategori, jumlahProduk] = await Promise.all([ambilKategori(), hitungProdukPerKategori()]);

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Kategori' }]} />

      <header className="mb-6 max-w-2xl">
        <h1 className="text-xl font-bold sm:text-2xl">Semua Kategori</h1>
        <p className="mt-1 text-sm text-ink-500">
          Pilih kategori untuk melihat barang yang tersedia beserta filter harga dan mereknya.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kategori.map((item, indeks) => (
          <li key={item.id}>
            <Link
              href={`/kategori/${item.slug}`}
              className="group card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_2px_16px_rgb(16_24_40_/_0.1)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                <GambarKategori
                  url={item.image_url}
                  nama={item.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  priority={indeks < 3}
                />
                <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-ink-700 backdrop-blur-sm">
                  {angka(jumlahProduk.get(item.id) ?? 0)} produk
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-ink-900 transition-colors group-hover:text-brand-600">
                    {item.name}
                  </h2>
                  <Icon
                    name="kanan"
                    size={17}
                    className="mt-0.5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
