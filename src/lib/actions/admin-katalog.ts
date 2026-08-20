'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { centang, pastikanAdmin, teks } from '@/lib/actions/admin-dasar';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { StatusForm as StatusAdmin } from '@/lib/types';
import {
  pesanGalat,
  skemaKategoriAdmin,
  skemaMerekAdmin,
  skemaProdukAdmin,
} from '@/lib/validation';

function segarkanKatalog() {
  revalidatePath('/', 'layout');
}

/* ------------------------------- Produk ---------------------------------- */

/** Susun objek spesifikasi dari pasangan input nama/nilai. */
function bacaSpesifikasi(formData: FormData): Record<string, string> {
  const kunci = formData.getAll('spec_key').map(String);
  const nilai = formData.getAll('spec_value').map(String);

  const hasil: Record<string, string> = {};
  kunci.forEach((namaSpek, indeks) => {
    const isi = (nilai[indeks] ?? '').trim();
    const label = namaSpek.trim();
    if (label && isi) hasil[label.slice(0, 40)] = isi.slice(0, 200);
  });
  return hasil;
}

export async function simpanProduk(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hargaCoret = teks(formData, 'compare_at_price');
  const hasil = skemaProdukAdmin.safeParse({
    name: teks(formData, 'name'),
    slug: teks(formData, 'slug'),
    sku: teks(formData, 'sku'),
    short_description: teks(formData, 'short_description'),
    description: teks(formData, 'description'),
    category_id: teks(formData, 'category_id'),
    brand_id: teks(formData, 'brand_id'),
    price: teks(formData, 'price'),
    compare_at_price: hargaCoret === '' ? undefined : hargaCoret,
    stock: teks(formData, 'stock'),
    low_stock_threshold: teks(formData, 'low_stock_threshold') || 3,
    condition: teks(formData, 'condition') || 'baru',
    warranty_months: teks(formData, 'warranty_months') || 0,
    weight_grams: teks(formData, 'weight_grams') || 1000,
    is_active: centang(formData, 'is_active'),
    is_featured: centang(formData, 'is_featured'),
    specs: bacaSpesifikasi(formData),
    images: formData.getAll('image_url').map(String).filter(Boolean),
  });

  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const { images, ...produk } = hasil.data;
  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();

  const baris = {
    ...produk,
    sku: produk.sku || null,
    category_id: produk.category_id || null,
    brand_id: produk.brand_id || null,
    compare_at_price: produk.compare_at_price ?? null,
  };

  const { data, error } = id
    ? await admin.from('products').update(baris).eq('id', id).select('id').maybeSingle()
    : await admin.from('products').insert(baris).select('id').maybeSingle();

  if (error) {
    return {
      galat:
        error.code === '23505'
          ? 'Slug atau SKU sudah dipakai produk lain. Gunakan nilai yang berbeda.'
          : 'Produk gagal disimpan. Periksa kembali isian Anda.',
    };
  }

  const idProduk = data?.id ?? id;
  if (idProduk) {
    await admin.from('product_images').delete().eq('product_id', idProduk);
    if (images.length > 0) {
      await admin.from('product_images').insert(
        images.map((url, indeks) => ({
          product_id: idProduk,
          url,
          alt: produk.name,
          sort_order: indeks,
        })),
      );
    }
  }

  segarkanKatalog();
  if (!id) redirect(`/admin/produk/${idProduk}?info=dibuat`);
  return { info: 'Produk berhasil disimpan.' };
}

export async function hapusProduk(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Produk tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('products').delete().eq('id', idValid.data);

  if (error) {
    return {
      galat:
        'Produk tidak bisa dihapus karena sudah dipakai pada pesanan. Nonaktifkan saja produknya.',
    };
  }

  segarkanKatalog();
  return { info: 'Produk dihapus.' };
}

/* ------------------------------ Kategori --------------------------------- */

export async function simpanKategori(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaKategoriAdmin.safeParse({
    name: teks(formData, 'name'),
    slug: teks(formData, 'slug'),
    description: teks(formData, 'description'),
    icon: teks(formData, 'icon') || 'box',
    sort_order: teks(formData, 'sort_order') || 0,
    is_active: centang(formData, 'is_active'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();

  const { error } = id
    ? await admin.from('categories').update(hasil.data).eq('id', id)
    : await admin.from('categories').insert(hasil.data);

  if (error) {
    return {
      galat: error.code === '23505' ? 'Slug kategori sudah dipakai.' : 'Kategori gagal disimpan.',
    };
  }

  segarkanKatalog();
  return { info: 'Kategori berhasil disimpan.' };
}

export async function hapusKategori(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Kategori tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('categories').delete().eq('id', idValid.data);
  if (error) return { galat: 'Kategori gagal dihapus.' };

  segarkanKatalog();
  return { info: 'Kategori dihapus. Produk di dalamnya menjadi tanpa kategori.' };
}

/* -------------------------------- Merek ---------------------------------- */

export async function simpanMerek(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaMerekAdmin.safeParse({
    name: teks(formData, 'name'),
    slug: teks(formData, 'slug'),
    is_active: centang(formData, 'is_active'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();

  const { error } = id
    ? await admin.from('brands').update(hasil.data).eq('id', id)
    : await admin.from('brands').insert(hasil.data);

  if (error) {
    return { galat: error.code === '23505' ? 'Slug merek sudah dipakai.' : 'Merek gagal disimpan.' };
  }

  segarkanKatalog();
  return { info: 'Merek berhasil disimpan.' };
}

export async function hapusMerek(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Merek tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('brands').delete().eq('id', idValid.data);
  if (error) return { galat: 'Merek gagal dihapus.' };

  segarkanKatalog();
  return { info: 'Merek dihapus.' };
}

/* ------------------------- Unggah gambar produk --------------------------- */

const TIPE_GAMBAR = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const UKURAN_MAKS = 5 * 1024 * 1024;

export type HasilUnggah = { ok: true; url: string } | { ok: false; galat: string };

export async function unggahGambar(formData: FormData): Promise<HasilUnggah> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return { ok: false, galat: ditolak.galat ?? 'Akses ditolak.' };

  const berkas = formData.get('file');
  if (!(berkas instanceof File) || berkas.size === 0) {
    return { ok: false, galat: 'Berkas gambar tidak ditemukan.' };
  }
  if (!TIPE_GAMBAR.includes(berkas.type)) {
    return { ok: false, galat: 'Format gambar harus JPG, PNG, WebP, atau AVIF.' };
  }
  if (berkas.size > UKURAN_MAKS) {
    return { ok: false, galat: 'Ukuran gambar maksimal 5 MB.' };
  }

  const ekstensi = berkas.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const nama = `produk/${Date.now()}-${crypto.randomUUID()}.${ekstensi}`;

  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from('media').upload(nama, berkas, {
    contentType: berkas.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) return { ok: false, galat: 'Gambar gagal diunggah. Silakan coba lagi.' };

  const { data } = admin.storage.from('media').getPublicUrl(nama);
  return { ok: true, url: data.publicUrl };
}
