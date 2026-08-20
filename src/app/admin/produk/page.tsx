import Link from 'next/link';

import { TabelProdukAdmin, type BarisProdukAdmin } from '@/components/admin/tabel-produk';
import { Icon } from '@/components/icon';
import { Paginasi } from '@/components/paginasi';
import { angka } from '@/lib/format';
import { ambilKategori } from '@/lib/queries';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { bacaAngka, bacaParam, buatUrl, type ParamPencarian } from '@/lib/url';

export const metadata = { title: 'Produk' };

const PER_HALAMAN = 20;

export default async function HalamanAdminProduk({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const q = bacaParam(params, 'q');
  const kategoriId = bacaParam(params, 'kategori');
  const saring = bacaParam(params, 'saring');
  const halaman = bacaAngka(params, 'hal', { min: 1, max: 500 }) ?? 1;

  const admin = createSupabaseAdminClient();
  let query = admin
    .from('products')
    .select(
      'id, name, slug, sku, price, stock, low_stock_threshold, is_active, is_featured, category:categories(name), product_images(url)',
      { count: 'exact' },
    );

  if (q) query = query.ilike('search_text', `%${q.toLowerCase()}%`);
  if (kategoriId) query = query.eq('category_id', kategoriId);
  if (saring === 'nonaktif') query = query.eq('is_active', false);
  if (saring === 'habis') query = query.eq('stock', 0);
  if (saring === 'unggulan') query = query.eq('is_featured', true);

  const dari = (halaman - 1) * PER_HALAMAN;
  const [{ data, count }, kategori] = await Promise.all([
    query
      .order('created_at', { ascending: false })
      .order('sort_order', { referencedTable: 'product_images', ascending: true })
      .limit(1, { referencedTable: 'product_images' })
      .range(dari, dari + PER_HALAMAN - 1),
    ambilKategori(),
  ]);

  const produk = (data ?? []) as unknown as BarisProdukAdmin[];
  const totalHalaman = Math.max(1, Math.ceil((count ?? 0) / PER_HALAMAN));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Produk</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {angka(count ?? 0)} produk di katalog. Centang beberapa produk untuk mengubahnya
            sekaligus.
          </p>
        </div>
        <Link href="/admin/produk/baru" className="btn btn-primary btn-sm">
          <Icon name="tambah" size={16} />
          Tambah Produk
        </Link>
      </header>

      <div className="card space-y-3 p-4">
        <form action="/admin/produk" method="get" role="search" className="flex flex-wrap gap-2">
          <div className="relative min-w-52 flex-1">
            <Icon
              name="cari"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Cari nama produk atau SKU"
              className="field pl-10"
              maxLength={60}
            />
          </div>
          <select name="kategori" defaultValue={kategoriId ?? ''} className="field w-auto">
            <option value="">Semua kategori</option>
            {kategori.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary shrink-0">
            Terapkan
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {[
            { nilai: null, label: 'Semua' },
            { nilai: 'habis', label: 'Stok habis' },
            { nilai: 'nonaktif', label: 'Nonaktif' },
            { nilai: 'unggulan', label: 'Unggulan' },
          ].map((pilihan) => (
            <Link
              key={pilihan.label}
              href={buatUrl('/admin/produk', params, { saring: pilihan.nilai })}
              className={`chip ${saring === pilihan.nilai || (!saring && !pilihan.nilai) ? 'chip-active' : ''}`}
            >
              {pilihan.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Kunci halaman agar pilihan tidak terbawa saat pindah halaman atau filter. */}
      <TabelProdukAdmin key={`${halaman}-${q ?? ''}-${kategoriId ?? ''}-${saring ?? ''}`} produk={produk} />

      <Paginasi
        basePath="/admin/produk"
        params={params}
        halaman={halaman}
        totalHalaman={totalHalaman}
      />
    </div>
  );
}
