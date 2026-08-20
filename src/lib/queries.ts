import 'server-only';

import { cache } from 'react';

import { PRODUK_PER_HALAMAN, URUTAN_PRODUK, type KunciUrutan } from '@/lib/constants';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  Banner,
  Kategori,
  KondisiProduk,
  Merek,
  MetodePembayaran,
  MetodePengiriman,
  PengaturanToko,
  ProdukLengkap,
  ProdukRingkas,
  Ulasan,
} from '@/lib/types';

/** Kolom yang dipakai kartu produk — sengaja ringkas agar transfer data kecil. */
const KOLOM_KARTU = `
  id, name, slug, short_description, price, compare_at_price, stock, condition,
  warranty_months, rating_avg, rating_count, sold_count,
  category:categories(name, slug),
  brand:brands(name, slug),
  product_images(url, alt)
`;

/**
 * Mencatat galat kueri ke log server. Tanpa ini kegagalan kueri akan
 * tampil sebagai halaman kosong tanpa petunjuk apa pun.
 */
function catatGalat(asal: string, error: { message: string; code?: string } | null): void {
  if (error) {
    console.error(`[kueri:${asal}] ${error.code ?? ''} ${error.message}`.trim());
  }
}

const PENGATURAN_BAWAAN: PengaturanToko = {
  store_name: 'Razeline Komputer',
  logo_url: null,
  tagline: '',
  address: '',
  whatsapp: '',
  email: '',
  phone: '',
  maps_url: '',
  instagram: '',
  facebook: '',
  operational_hours: '',
  free_shipping_min: 0,
  announcement: '',
};

export const ambilPengaturanToko = cache(async (): Promise<PengaturanToko> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
catatGalat('store_settings', error);
  return { ...PENGATURAN_BAWAAN, ...(data ?? {}) };
});

export const ambilKategori = cache(async (): Promise<Kategori[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, image_url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order');
catatGalat('categories', error);
  return data ?? [];
});

export const ambilKategoriPerSlug = cache(async (slug: string): Promise<Kategori | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, image_url, sort_order, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
catatGalat('categories', error);
  return data;
});

export const ambilMerek = cache(async (): Promise<Merek[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url, is_active')
    .eq('is_active', true)
    .order('name');
catatGalat('brands', error);
  return data ?? [];
});

/** Merek yang benar-benar punya produk aktif pada sebuah kategori. */
export const ambilMerekBerdasarKategori = cache(async (categoryId: string): Promise<Merek[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('brand:brands(id, name, slug, logo_url, is_active)')
    .eq('category_id', categoryId)
    .eq('is_active', true);
catatGalat('products', error);

  const unik = new Map<string, Merek>();
  for (const baris of data ?? []) {
    const merek = baris.brand as unknown as Merek | null;
    if (merek) unik.set(merek.id, merek);
  }
  return [...unik.values()].sort((a, b) => a.name.localeCompare(b.name, 'id'));
});

export const ambilBanner = cache(async (): Promise<Banner[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
catatGalat('banners', error);
  return data ?? [];
});

/** Daftar produk singkat untuk baris geser di beranda. */
export async function ambilProdukUrut(urutan: KunciUrutan, batas = 10): Promise<ProdukRingkas[]> {
  const supabase = await createSupabaseServerClient();
  const { column, ascending } = URUTAN_PRODUK[urutan];

  const { data, error } = await supabase
    .from('products')
    .select(KOLOM_KARTU)
    .eq('is_active', true)
    .order(column, { ascending })
    .order('sort_order', { referencedTable: 'product_images', ascending: true })
    .limit(1, { referencedTable: 'product_images' })
    .limit(batas);
catatGalat('products', error);

  return (data ?? []) as unknown as ProdukRingkas[];
}

export async function ambilProdukUnggulan(batas = 8): Promise<ProdukRingkas[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(KOLOM_KARTU)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sold_count', { ascending: false })
    .order('sort_order', { referencedTable: 'product_images', ascending: true })
    .limit(1, { referencedTable: 'product_images' })
    .limit(batas);
catatGalat('products', error);

  return (data ?? []) as unknown as ProdukRingkas[];
}

export interface FilterProduk {
  q?: string;
  kategoriId?: string | null;
  merekIds?: string[];
  hargaMin?: number | null;
  hargaMax?: number | null;
  kondisi?: KondisiProduk | null;
  hanyaTersedia?: boolean;
  urutan?: KunciUrutan;
  halaman?: number;
  perHalaman?: number;
}

export interface HasilPencarian {
  items: ProdukRingkas[];
  total: number;
  halaman: number;
  totalHalaman: number;
}

export async function cariProduk(filter: FilterProduk): Promise<HasilPencarian> {
  const supabase = await createSupabaseServerClient();

  const perHalaman = filter.perHalaman ?? PRODUK_PER_HALAMAN;
  const halaman = Math.max(1, filter.halaman ?? 1);
  const { column, ascending } = URUTAN_PRODUK[filter.urutan ?? 'populer'];

  let query = supabase
    .from('products')
    .select(KOLOM_KARTU, { count: 'exact' })
    .eq('is_active', true);

  if (filter.q) {
    // search_text adalah kolom generated (nama + sku + deskripsi singkat).
    query = query.ilike('search_text', `%${filter.q.toLowerCase()}%`);
  }
  if (filter.kategoriId) {
    query = query.eq('category_id', filter.kategoriId);
  }
  if (filter.merekIds?.length) {
    query = query.in('brand_id', filter.merekIds);
  }
  if (typeof filter.hargaMin === 'number') {
    query = query.gte('price', filter.hargaMin);
  }
  if (typeof filter.hargaMax === 'number') {
    query = query.lte('price', filter.hargaMax);
  }
  if (filter.kondisi) {
    query = query.eq('condition', filter.kondisi);
  }
  if (filter.hanyaTersedia) {
    query = query.gt('stock', 0);
  }

  const dari = (halaman - 1) * perHalaman;
  const { data, count, error } = await query
    .order(column, { ascending })
    .order('id', { ascending: true })
    .order('sort_order', { referencedTable: 'product_images', ascending: true })
    .limit(1, { referencedTable: 'product_images' })
    .range(dari, dari + perHalaman - 1);
catatGalat('products:cari', error);

  const total = count ?? 0;
  return {
    items: (data ?? []) as unknown as ProdukRingkas[],
    total,
    halaman,
    totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
  };
}

export const ambilProdukPerSlug = cache(async (slug: string): Promise<ProdukLengkap | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `*,
       category:categories(id, name, slug),
       brand:brands(id, name, slug),
       product_images(id, url, alt, sort_order)`,
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
catatGalat('products', error);

  if (!data) return null;

  const produk = data as unknown as ProdukLengkap;
  produk.product_images = [...(produk.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return produk;
});

export async function ambilProdukTerkait(
  produk: Pick<ProdukLengkap, 'id' | 'category_id'>,
  batas = 6,
): Promise<ProdukRingkas[]> {
  if (!produk.category_id) return [];
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('products')
    .select(KOLOM_KARTU)
    .eq('is_active', true)
    .eq('category_id', produk.category_id)
    .neq('id', produk.id)
    .order('sold_count', { ascending: false })
    .order('sort_order', { referencedTable: 'product_images', ascending: true })
    .limit(1, { referencedTable: 'product_images' })
    .limit(batas);
catatGalat('products', error);

  return (data ?? []) as unknown as ProdukRingkas[];
}

export async function ambilUlasanProduk(productId: string, batas = 20): Promise<Ulasan[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, user_id, author_name, rating, comment, created_at')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(batas);
catatGalat('reviews', error);

  return (data ?? []) as unknown as Ulasan[];
}

export const ambilMetodePengiriman = cache(async (): Promise<MetodePengiriman[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
catatGalat('shipping_methods', error);
  return data ?? [];
});

export const ambilMetodePembayaran = cache(async (): Promise<MetodePembayaran[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
catatGalat('payment_methods', error);
  return data ?? [];
});
