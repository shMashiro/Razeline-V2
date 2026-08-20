import Link from 'next/link';

import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { RatingBintang } from '@/components/rating-bintang';
import { TombolTambahKeranjang } from '@/components/tombol-tambah-keranjang';
import { angka, persentaseDiskon, rupiah } from '@/lib/format';
import type { ProdukRingkas } from '@/lib/types';

interface Props {
  produk: ProdukRingkas;
  prioritasGambar?: boolean;
}

export function KartuProduk({ produk, prioritasGambar = false }: Props) {
  const diskon = persentaseDiskon(Number(produk.price), Number(produk.compare_at_price));
  const habis = produk.stock <= 0;
  const menipis = !habis && produk.stock <= 3;
  const gambar = produk.product_images?.[0];

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_2px_16px_rgb(16_24_40_/_0.08)]">
      <Link
        href={`/produk/${produk.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-2"
        tabIndex={-1}
        aria-hidden="true"
      >
        <GambarProduk
          url={gambar?.url}
          alt={gambar?.alt}
          nama={produk.name}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
          priority={prioritasGambar}
        />

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {diskon > 0 && (
            <span className="rounded-md bg-promo px-1.5 py-0.5 text-[11px] font-bold text-white">
              -{diskon}%
            </span>
          )}
          {produk.condition === 'bekas' && (
            <span className="rounded-md bg-slate-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              Bekas
            </span>
          )}
        </div>

        {habis && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white">
              Stok Habis
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {produk.brand && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">
            {produk.brand.name}
          </p>
        )}

        <h3 className="text-sm leading-snug font-medium">
          <Link
            href={`/produk/${produk.slug}`}
            className="line-clamp-2 text-ink-900 transition-colors hover:text-brand-600"
          >
            {produk.name}
          </Link>
        </h3>

        <div className="mt-auto space-y-2 pt-1">
          <div>
            <p className="price text-base font-bold text-ink-900">{rupiah(produk.price)}</p>
            {diskon > 0 && (
              <p className="price text-xs text-ink-300 line-through">
                {rupiah(produk.compare_at_price)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-500">
            {produk.rating_count > 0 ? (
              <span className="inline-flex items-center gap-1">
                <RatingBintang nilai={Number(produk.rating_avg)} size={12} />
                <span className="font-medium text-ink-700">
                  {Number(produk.rating_avg).toFixed(1)}
                </span>
              </span>
            ) : null}
            {produk.sold_count > 0 && <span>{angka(produk.sold_count)} terjual</span>}
            {menipis && <span className="font-semibold text-warn">Sisa {produk.stock}</span>}
          </div>

          {produk.warranty_months > 0 && (
            <p className="inline-flex items-center gap-1 text-[11px] text-ok">
              <Icon name="perisai" size={12} />
              Garansi {produk.warranty_months} bulan
            </p>
          )}

          <TombolTambahKeranjang
            penuh
            item={{
              id: produk.id,
              slug: produk.slug,
              name: produk.name,
              price: Number(produk.price),
              image: gambar?.url ?? null,
              stock: produk.stock,
            }}
          />
        </div>
      </div>
    </article>
  );
}
