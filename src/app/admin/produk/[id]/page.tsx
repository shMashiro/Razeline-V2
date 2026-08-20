import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FormProduk } from '@/components/admin/form-produk';
import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { angka } from '@/lib/format';
import { ambilKategori, ambilMerek } from '@/lib/queries';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ProdukLengkap } from '@/lib/types';
import { bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata = { title: 'Ubah Produk' };

export default async function HalamanUbahProduk({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ParamPencarian>;
}) {
  const [{ id }, paramPencarian] = await Promise.all([params, searchParams]);

  const admin = createSupabaseAdminClient();
  const [{ data }, kategori, merek] = await Promise.all([
    admin
      .from('products')
      .select('*, product_images(id, url, alt, sort_order)')
      .eq('id', id)
      .maybeSingle(),
    ambilKategori(),
    ambilMerek(),
  ]);

  if (!data) notFound();

  const produk = data as unknown as ProdukLengkap;
  produk.product_images = [...(produk.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600"
        >
          <Icon name="kiri" size={15} />
          Kembali ke daftar produk
        </Link>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Ubah Produk</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {angka(produk.view_count)} kunjungan · {angka(produk.sold_count)} terjual ·{' '}
            {produk.rating_count > 0
              ? `rating ${Number(produk.rating_avg).toFixed(1)} dari ${angka(produk.rating_count)} ulasan`
              : 'belum ada ulasan'}
          </p>
        </div>
        <Link href={`/produk/${produk.slug}`} target="_blank" className="btn btn-outline btn-sm">
          <Icon name="mata" size={15} />
          Lihat di toko
        </Link>
      </header>

      {bacaParam(paramPencarian, 'info') === 'dibuat' && (
        <PesanForm info="Produk baru berhasil dibuat. Anda bisa langsung melengkapi foto dan spesifikasinya." />
      )}

      <FormProduk produk={produk} kategori={kategori} merek={merek} />
    </div>
  );
}
