'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ProdukKeranjangTerbaru {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string | null;
  aktif: boolean;
}

const skemaDaftarId = z.array(z.uuid()).max(50);

/**
 * Mengambil harga, stok, dan status terbaru untuk isi keranjang.
 * Dipakai supaya pelanggan tidak kaget harga berubah saat checkout.
 */
export async function segarkanKeranjang(ids: string[]): Promise<ProdukKeranjangTerbaru[]> {
  const hasilValidasi = skemaDaftarId.safeParse(ids);
  if (!hasilValidasi.success || hasilValidasi.data.length === 0) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, stock, is_active, product_images(url)')
    .in('id', hasilValidasi.data)
    .order('sort_order', { referencedTable: 'product_images', ascending: true })
    .limit(1, { referencedTable: 'product_images' });

  return (data ?? []).map((produk) => ({
    id: produk.id,
    name: produk.name,
    slug: produk.slug,
    price: Number(produk.price),
    stock: produk.is_active ? produk.stock : 0,
    image: produk.product_images?.[0]?.url ?? null,
    aktif: produk.is_active,
  }));
}
