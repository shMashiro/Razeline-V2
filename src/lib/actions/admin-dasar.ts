import 'server-only';

import { ambilProfil } from '@/lib/auth';
import { DUA_LANGKAH_ADMIN_AKTIF } from '@/lib/fitur';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { StatusForm } from '@/lib/types';

export type StatusAdmin = StatusForm;

/**
 * Penjaga untuk seluruh aksi admin. Selain peran, sesi juga wajib
 * sudah melewati autentikasi dua langkah bila akun mengaktifkannya.
 */
export async function pastikanAdmin(): Promise<StatusAdmin | null> {
  const profil = await ambilProfil();
  if (!profil || profil.role !== 'admin') {
    return { galat: 'Anda tidak memiliki akses ke tindakan ini.' };
  }

  if (DUA_LANGKAH_ADMIN_AKTIF) {
    const supabase = await createSupabaseServerClient();
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
      return { galat: 'Selesaikan verifikasi dua langkah terlebih dahulu.' };
    }
  }

  return null;
}

/** Ambil nilai kotak centang dari FormData. */
export function centang(formData: FormData, nama: string): boolean {
  const nilai = formData.get(nama);
  return nilai === 'on' || nilai === 'true';
}

/** Ambil teks dari FormData sebagai string biasa. */
export function teks(formData: FormData, nama: string): string {
  const nilai = formData.get(nama);
  return typeof nilai === 'string' ? nilai : '';
}
