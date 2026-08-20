import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profil } from '@/lib/types';

/** Pengguna yang sedang masuk, sudah diverifikasi ke server Supabase. */
export const ambilPengguna = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const ambilProfil = cache(async (): Promise<Profil | null> => {
  const pengguna = await ambilPengguna();
  if (!pengguna) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')
    .eq('id', pengguna.id)
    .maybeSingle();

  return data;
});

/** Wajib login; bila belum, arahkan ke halaman masuk sambil mengingat tujuan. */
export async function wajibMasuk(tujuan: string): Promise<Profil> {
  const profil = await ambilProfil();
  if (!profil) {
    redirect(`/masuk?lanjut=${encodeURIComponent(tujuan)}`);
  }
  return profil;
}

/**
 * Penjaga halaman admin. Selain memeriksa peran, admin diwajibkan
 * memakai autentikasi dua langkah (TOTP) sebelum bisa masuk dasbor.
 */
export async function wajibAdmin(): Promise<Profil> {
  const profil = await ambilProfil();
  if (!profil) {
    redirect('/masuk?lanjut=%2Fadmin');
  }
  if (profil.role !== 'admin') {
    redirect('/');
  }

  const supabase = await createSupabaseServerClient();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    redirect('/masuk/dua-langkah');
  }

  return profil;
}

/** Apakah admin ini sudah mengaktifkan 2FA? Dipakai halaman keamanan. */
export async function statusDuaLangkah() {
  const supabase = await createSupabaseServerClient();
  const [{ data: factors }, { data: aal }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  const totpTerverifikasi = (factors?.totp ?? []).filter((f) => f.status === 'verified');
  return {
    aktif: totpTerverifikasi.length > 0,
    faktor: totpTerverifikasi,
    levelSaatIni: aal?.currentLevel ?? 'aal1',
  };
}
