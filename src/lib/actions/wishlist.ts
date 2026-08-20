'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ambilPengguna } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface HasilAksi {
  ok: boolean;
  pesan?: string;
  aktif?: boolean;
}

/** Menambah atau menghapus produk dari wishlist pengguna yang sedang masuk. */
export async function alihkanWishlist(productId: string): Promise<HasilAksi> {
  const idValid = z.uuid().safeParse(productId);
  if (!idValid.success) {
    return { ok: false, pesan: 'Produk tidak dikenali.' };
  }

  const pengguna = await ambilPengguna();
  if (!pengguna) {
    return { ok: false, pesan: 'Silakan masuk dulu untuk menyimpan wishlist.' };
  }

  const supabase = await createSupabaseServerClient();

  const { data: adaSebelumnya } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', pengguna.id)
    .eq('product_id', idValid.data)
    .maybeSingle();

  if (adaSebelumnya) {
    const { error } = await supabase.from('wishlist_items').delete().eq('id', adaSebelumnya.id);
    if (error) return { ok: false, pesan: 'Gagal menghapus dari wishlist.' };
    revalidatePath('/wishlist');
    return { ok: true, aktif: false, pesan: 'Dihapus dari wishlist.' };
  }

  const { error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: pengguna.id, product_id: idValid.data });

  if (error) return { ok: false, pesan: 'Gagal menyimpan ke wishlist.' };

  revalidatePath('/wishlist');
  return { ok: true, aktif: true, pesan: 'Disimpan ke wishlist.' };
}
