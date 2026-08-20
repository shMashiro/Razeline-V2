import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/icon';
import { KartuProduk } from '@/components/kartu-produk';
import { RemahRoti } from '@/components/remah-roti';
import { ambilPengguna } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProdukRingkas } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Daftar produk yang Anda simpan untuk dibeli nanti.',
  robots: { index: false, follow: false },
};

export default async function HalamanWishlist() {
  const pengguna = await ambilPengguna();

  if (!pengguna) {
    return (
      <div className="container-page py-6">
        <RemahRoti jejak={[{ label: 'Wishlist' }]} />
        <div className="card mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-ink-300">
            <Icon name="hati" size={30} />
          </span>
          <h1 className="text-base font-bold">Masuk untuk melihat wishlist</h1>
          <p className="text-sm text-ink-500">
            Wishlist disimpan di akun Anda, jadi tetap ada meskipun berganti perangkat.
          </p>
          <div className="mt-1 flex gap-2">
            <Link href="/masuk?lanjut=%2Fwishlist" className="btn btn-primary">
              Masuk
            </Link>
            <Link href="/daftar" className="btn btn-outline">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('wishlist_items')
    .select(
      `created_at,
       products(
         id, name, slug, short_description, price, compare_at_price, stock, condition,
         warranty_months, rating_avg, rating_count, sold_count,
         category:categories(name, slug),
         brand:brands(name, slug),
         product_images(url, alt)
       )`,
    )
    .eq('user_id', pengguna.id)
    .order('created_at', { ascending: false });

  const produk = (data ?? [])
    .map((baris) => baris.products as unknown as ProdukRingkas | null)
    .filter((item): item is ProdukRingkas => Boolean(item));

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Wishlist' }]} />

      <header className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Wishlist Saya</h1>
        <p className="mt-1 text-sm text-ink-500">
          {produk.length > 0
            ? `${produk.length} produk tersimpan untuk dibeli nanti.`
            : 'Simpan produk favorit Anda supaya mudah dicari lagi.'}
        </p>
      </header>

      {produk.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-ink-300">
            <Icon name="hati" size={30} />
          </span>
          <h2 className="text-base font-bold">Belum ada produk tersimpan</h2>
          <p className="max-w-sm text-sm text-ink-500">
            Tekan tombol hati pada halaman produk untuk menyimpannya ke wishlist.
          </p>
          <Link href="/katalog" className="btn btn-primary mt-1">
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {produk.map((item, indeks) => (
            <KartuProduk key={item.id} produk={item} prioritasGambar={indeks < 5} />
          ))}
        </div>
      )}
    </div>
  );
}
