import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { after } from 'next/server';

import { AksiProduk } from '@/components/aksi-produk';
import { BarisProduk } from '@/components/baris-produk';
import { FormUlasan } from '@/components/form-ulasan';
import { GaleriProduk } from '@/components/galeri-produk';
import { Icon } from '@/components/icon';
import { RatingBintang } from '@/components/rating-bintang';
import { RemahRoti } from '@/components/remah-roti';
import { TombolWishlist } from '@/components/tombol-wishlist';
import { ambilPengguna } from '@/lib/auth';
import { angka, persentaseDiskon, rupiah, tanggal } from '@/lib/format';
import {
  ambilPengaturanToko,
  ambilProdukPerSlug,
  ambilProdukTerkait,
  ambilUlasanProduk,
} from '@/lib/queries';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { tautanWhatsApp } from '@/lib/whatsapp';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produk = await ambilProdukPerSlug(slug);
  if (!produk) return { title: 'Produk tidak ditemukan' };

  return {
    title: produk.name,
    description:
      produk.short_description ||
      `${produk.name} tersedia di Razeline Komputer dengan harga ${rupiah(produk.price)}.`,
    alternates: { canonical: `/produk/${produk.slug}` },
    openGraph: {
      title: produk.name,
      description: produk.short_description,
      images: produk.product_images[0]?.url ? [produk.product_images[0].url] : undefined,
    },
  };
}

export default async function HalamanDetailProduk({ params }: Props) {
  const { slug } = await params;
  const produk = await ambilProdukPerSlug(slug);

  if (!produk) notFound();

  const [terkait, ulasan, pengaturan, pengguna] = await Promise.all([
    ambilProdukTerkait(produk),
    ambilUlasanProduk(produk.id),
    ambilPengaturanToko(),
    ambilPengguna(),
  ]);

  // Jumlah kunjungan dinaikkan setelah respons dikirim agar tidak menahan render.
  after(async () => {
    await createSupabaseAdminClient().rpc('increment_product_view', { p_slug: slug });
  });

  let adaDiWishlist = false;
  let ulasanSaya: { rating: number; comment: string } | null = null;
  let bolehMengulas = false;

  if (pengguna) {
    const supabase = await createSupabaseServerClient();
    const [{ data: wishlist }, { data: milikSaya }, { count: pembelian }] = await Promise.all([
      supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', pengguna.id)
        .eq('product_id', produk.id)
        .maybeSingle(),
      supabase
        .from('reviews')
        .select('rating, comment')
        .eq('user_id', pengguna.id)
        .eq('product_id', produk.id)
        .maybeSingle(),
      supabase
        .from('order_items')
        .select('id, orders!inner(user_id, status)', { count: 'exact', head: true })
        .eq('product_id', produk.id)
        .eq('orders.user_id', pengguna.id)
        .eq('orders.status', 'selesai'),
    ]);

    adaDiWishlist = Boolean(wishlist);
    ulasanSaya = milikSaya;
    bolehMengulas = (pembelian ?? 0) > 0;
  }

  const diskon = persentaseDiskon(Number(produk.price), Number(produk.compare_at_price));
  const habis = produk.stock <= 0;
  const spesifikasi = Object.entries(produk.specs ?? {});

  const dataTerstruktur = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produk.name,
    description: produk.short_description || produk.description.slice(0, 300),
    sku: produk.sku ?? undefined,
    brand: produk.brand ? { '@type': 'Brand', name: produk.brand.name } : undefined,
    image: produk.product_images.map((gambar) => gambar.url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: Number(produk.price),
      availability: habis
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition:
        produk.condition === 'baru'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
    aggregateRating:
      produk.rating_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(produk.rating_avg),
            reviewCount: produk.rating_count,
          }
        : undefined,
  };

  return (
    <div className="container-page py-6">
      <script
        type="application/ld+json"
        nonce={(await headers()).get('x-nonce') ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dataTerstruktur) }}
      />

      <RemahRoti
        jejak={[
          { label: 'Kategori', href: '/kategori' },
          ...(produk.category
            ? [{ label: produk.category.name, href: `/kategori/${produk.category.slug}` }]
            : []),
          { label: produk.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <GaleriProduk gambar={produk.product_images} nama={produk.name} />

        <div className="space-y-5">
          <div>
            {produk.brand && (
              <Link
                href={`/katalog?merek=${produk.brand.slug}`}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                {produk.brand.name}
              </Link>
            )}
            <h1 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">{produk.name}</h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
              {produk.rating_count > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <RatingBintang nilai={Number(produk.rating_avg)} size={15} />
                  <strong className="text-ink-900">{Number(produk.rating_avg).toFixed(1)}</strong>
                  <span>({angka(produk.rating_count)} ulasan)</span>
                </span>
              ) : (
                <span>Belum ada ulasan</span>
              )}
              <span className="h-3.5 w-px bg-line" />
              <span>{angka(produk.sold_count)} terjual</span>
              {produk.sku && (
                <>
                  <span className="h-3.5 w-px bg-line" />
                  <span>SKU {produk.sku}</span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl2 bg-surface-2 p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="price text-2xl font-bold text-ink-900 sm:text-3xl">
                {rupiah(produk.price)}
              </p>
              {diskon > 0 && (
                <>
                  <p className="price text-base text-ink-300 line-through">
                    {rupiah(produk.compare_at_price)}
                  </p>
                  <span className="rounded-md bg-promo px-2 py-0.5 text-xs font-bold text-white">
                    Hemat {diskon}%
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium ${
                  habis
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : produk.stock <= produk.low_stock_threshold
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                <Icon name={habis ? 'peringatan' : 'centang'} size={13} />
                {habis
                  ? 'Stok habis'
                  : produk.stock <= produk.low_stock_threshold
                    ? `Stok menipis — sisa ${produk.stock}`
                    : `Stok tersedia (${angka(produk.stock)})`}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-1 font-medium text-ink-700">
                <Icon name="label" size={13} />
                Kondisi {produk.condition === 'baru' ? 'Baru' : 'Bekas'}
              </span>

              {produk.warranty_months > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2 py-1 font-medium text-ink-700">
                  <Icon name="perisai" size={13} />
                  Garansi {produk.warranty_months} bulan
                </span>
              )}
            </div>
          </div>

          {produk.short_description && (
            <p className="text-sm leading-relaxed text-ink-700">{produk.short_description}</p>
          )}

          <AksiProduk
            item={{
              id: produk.id,
              slug: produk.slug,
              name: produk.name,
              price: Number(produk.price),
              image: produk.product_images[0]?.url ?? null,
              stock: produk.stock,
            }}
          />

          <div className="grid gap-2.5 sm:grid-cols-2">
            <TombolWishlist
              productId={produk.id}
              awalAktif={adaDiWishlist}
              masuk={Boolean(pengguna)}
            />
            {pengaturan.whatsapp && (
              <a
                href={tautanWhatsApp(
                  pengaturan.whatsapp,
                  `Halo Razeline Komputer, saya mau tanya soal produk "${produk.name}".`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline w-full"
              >
                <Icon name="whatsapp" size={17} />
                Tanya via WhatsApp
              </a>
            )}
          </div>

          <ul className="space-y-2.5 rounded-xl2 border border-line p-4 text-sm">
            <li className="flex gap-2.5">
              <Icon name="truk" size={17} className="mt-0.5 shrink-0 text-brand-600" />
              <span className="text-ink-700">
                Dikirim dari toko di Cibeber, Lebak. Bisa juga diambil langsung di toko.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="perisai" size={17} className="mt-0.5 shrink-0 text-brand-600" />
              <span className="text-ink-700">
                {produk.warranty_months > 0
                  ? `Bergaransi ${produk.warranty_months} bulan, klaim langsung di toko.`
                  : 'Barang dicek bersama pembeli sebelum meninggalkan toko.'}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="kartu" size={17} className="mt-0.5 shrink-0 text-brand-600" />
              <span className="text-ink-700">
                Pembayaran transfer bank, QRIS, atau bayar di tempat (COD area tertentu).
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Deskripsi & spesifikasi */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="judul-deskripsi">
          <h2 id="judul-deskripsi" className="mb-3 text-lg font-bold">
            Deskripsi Produk
          </h2>
          <div className="card p-5">
            {produk.description ? (
              produk.description.split('\n').map((paragraf, indeks) =>
                paragraf.trim() ? (
                  <p key={indeks} className="mb-3 text-sm leading-relaxed text-ink-700 last:mb-0">
                    {paragraf}
                  </p>
                ) : null,
              )
            ) : (
              <p className="text-sm text-ink-500">
                Deskripsi belum tersedia. Hubungi admin toko untuk informasi lebih lengkap.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="judul-spesifikasi">
          <h2 id="judul-spesifikasi" className="mb-3 text-lg font-bold">
            Spesifikasi
          </h2>
          <div className="card overflow-hidden">
            {spesifikasi.length > 0 ? (
              <dl className="divide-y divide-line text-sm">
                {spesifikasi.map(([kunci, nilai]) => (
                  <div key={kunci} className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-2.5">
                    <dt className="text-ink-500">{kunci}</dt>
                    <dd className="font-medium text-ink-900">{String(nilai)}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-2.5">
                  <dt className="text-ink-500">Berat</dt>
                  <dd className="font-medium text-ink-900">
                    {angka(produk.weight_grams)} gram
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="p-5 text-sm text-ink-500">Spesifikasi detail belum diisi.</p>
            )}
          </div>
        </section>
      </div>

      {/* Ulasan */}
      <section aria-labelledby="judul-ulasan" className="mt-12">
        <h2 id="judul-ulasan" className="mb-3 text-lg font-bold">
          Ulasan Pembeli
        </h2>

        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-3">
            {ulasan.length === 0 ? (
              <div className="card px-5 py-10 text-center">
                <p className="text-sm text-ink-500">
                  Belum ada ulasan untuk produk ini. Jadilah yang pertama memberi penilaian.
                </p>
              </div>
            ) : (
              ulasan.map((item) => (
                <article key={item.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                        {(item.author_name || 'P').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {item.author_name || 'Pelanggan'}
                        </p>
                        <RatingBintang nilai={item.rating} size={13} />
                      </div>
                    </div>
                    <time className="shrink-0 text-xs text-ink-300" dateTime={item.created_at}>
                      {tanggal(item.created_at)}
                    </time>
                  </div>
                  {item.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-700">{item.comment}</p>
                  )}
                </article>
              ))
            )}
          </div>

          <div>
            {bolehMengulas ? (
              <FormUlasan
                productId={produk.id}
                ratingAwal={ulasanSaya?.rating ?? 0}
                komentarAwal={ulasanSaya?.comment ?? ''}
              />
            ) : (
              <div className="card p-5">
                <h3 className="text-sm font-bold">Ingin memberi ulasan?</h3>
                <p className="mt-1.5 text-sm text-ink-500">
                  Ulasan bisa ditulis setelah pesanan Anda untuk produk ini berstatus selesai.
                </p>
                {!pengguna && (
                  <Link href="/masuk" className="btn btn-outline btn-sm mt-3">
                    Masuk ke akun
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {terkait.length > 0 && (
        <div className="mt-12">
          <BarisProduk
            judul="Produk Serupa"
            keterangan={`Pilihan lain di kategori ${produk.category?.name ?? 'terkait'}.`}
            tautanSemua={produk.category ? `/kategori/${produk.category.slug}` : undefined}
            produk={terkait}
          />
        </div>
      )}
    </div>
  );
}
