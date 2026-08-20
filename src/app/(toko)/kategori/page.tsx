import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon, IKON_KATEGORI } from '@/components/icon';
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

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kategori.map((item) => (
          <li key={item.id}>
            <Link
              href={`/kategori/${item.slug}`}
              className="group card flex h-full items-start gap-4 p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl2 bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon name={IKON_KATEGORI[item.icon] ?? 'kotak'} size={24} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink-900">{item.name}</span>
                  <Icon
                    name="kanan"
                    size={16}
                    className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-500">
                  {item.description}
                </span>
                <span className="mt-2 inline-block rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-500">
                  {angka(jumlahProduk.get(item.id) ?? 0)} produk
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
