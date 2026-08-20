'use server';

import { revalidatePath } from 'next/cache';

import { ambilPengguna } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { pesanGalat, skemaUlasan } from '@/lib/validation';

export type HasilUlasan = { ok: true; pesan: string } | { ok: false; pesan: string };

/** Hanya pembeli yang pesanannya sudah selesai yang boleh memberi ulasan. */
async function pernahMembeli(userId: string, productId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from('order_items')
    .select('id, orders!inner(user_id, status)', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('orders.user_id', userId)
    .eq('orders.status', 'selesai');

  return (count ?? 0) > 0;
}

export async function kirimUlasan(masukan: unknown): Promise<HasilUlasan> {
  const hasil = skemaUlasan.safeParse(masukan);
  if (!hasil.success) {
    return { ok: false, pesan: pesanGalat(hasil.error) };
  }

  const pengguna = await ambilPengguna();
  if (!pengguna) {
    return { ok: false, pesan: 'Silakan masuk untuk memberi ulasan.' };
  }

  if (!(await pernahMembeli(pengguna.id, hasil.data.product_id))) {
    return {
      ok: false,
      pesan: 'Ulasan hanya bisa diberikan setelah pesanan Anda untuk produk ini selesai.',
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: profil } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', pengguna.id)
    .maybeSingle();

  const { error } = await admin.from('reviews').upsert(
    {
      product_id: hasil.data.product_id,
      user_id: pengguna.id,
      author_name: profil?.full_name?.trim() || 'Pelanggan',
      rating: hasil.data.rating,
      comment: hasil.data.comment,
    },
    { onConflict: 'product_id,user_id' },
  );

  if (error) {
    return { ok: false, pesan: 'Ulasan gagal disimpan. Silakan coba lagi.' };
  }

  const { data: produk } = await admin
    .from('products')
    .select('slug')
    .eq('id', hasil.data.product_id)
    .maybeSingle();

  if (produk?.slug) revalidatePath(`/produk/${produk.slug}`);

  return { ok: true, pesan: 'Terima kasih, ulasan Anda sudah tersimpan.' };
}
