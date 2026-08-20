import Link from 'next/link';

import { TombolHapusProduk } from '@/components/admin/tombol-hapus-produk';
import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { Paginasi } from '@/components/paginasi';
import { angka, rupiah } from '@/lib/format';
import { ambilKategori } from '@/lib/queries';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { bacaAngka, bacaParam, buatUrl, type ParamPencarian } from '@/lib/url';

export const metadata = { title: 'Produk' };

const PER_HALAMAN = 20;

interface BarisProduk {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  category: { name: string } | null;
  product_images: { url: string }[];
}

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

  const produk = (data ?? []) as unknown as BarisProduk[];
  const totalHalaman = Math.max(1, Math.ceil((count ?? 0) / PER_HALAMAN));

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Produk</h1>
          <p className="mt-0.5 text-sm text-ink-500">{angka(count ?? 0)} produk di katalog.</p>
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

      <div className="card overflow-hidden">
        {produk.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-ink-500">
            Tidak ada produk yang cocok dengan pencarian ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="border-b bg-surface-2 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink-700">Produk</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Kategori</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Harga</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Stok</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-700">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {produk.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-2/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                          <GambarProduk
                            url={item.product_images?.[0]?.url}
                            nama={item.name}
                            sizes="44px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produk/${item.id}`}
                            className="line-clamp-1 font-medium hover:text-brand-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-ink-300">{item.sku ?? 'tanpa SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{item.category?.name ?? '—'}</td>
                    <td className="price px-4 py-3 font-semibold">{rupiah(item.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`price font-semibold ${
                          item.stock === 0
                            ? 'text-promo'
                            : item.stock <= item.low_stock_threshold
                              ? 'text-warn'
                              : 'text-ink-700'
                        }`}
                      >
                        {angka(item.stock)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-ink-500'
                          }`}
                        >
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {item.is_featured && (
                          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                            Unggulan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/produk/${item.slug}`}
                          target="_blank"
                          className="btn btn-ghost btn-sm"
                          aria-label={`Lihat ${item.name} di toko`}
                        >
                          <Icon name="mata" size={14} />
                        </Link>
                        <Link href={`/admin/produk/${item.id}`} className="btn btn-ghost btn-sm">
                          <Icon name="pensil" size={14} />
                          Ubah
                        </Link>
                        <TombolHapusProduk id={item.id} nama={item.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Paginasi
        basePath="/admin/produk"
        params={params}
        halaman={halaman}
        totalHalaman={totalHalaman}
      />
    </div>
  );
}
