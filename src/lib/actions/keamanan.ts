'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ambilProfil } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type HasilDaftar2FA =
  | { ok: true; factorId: string; qr: string; secret: string }
  | { ok: false; galat: string };

export type HasilAksi2FA = { ok: true; info: string } | { ok: false; galat: string };

/** Mulai pendaftaran perangkat autentikator dan hasilkan kode QR. */
export async function mulaiPendaftaran2FA(): Promise<HasilDaftar2FA> {
  const profil = await ambilProfil();
  if (!profil) return { ok: false, galat: 'Sesi Anda sudah berakhir.' };

  const supabase = await createSupabaseServerClient();

  // Bersihkan pendaftaran yang belum selesai agar tidak menumpuk.
  const { data: faktorLama } = await supabase.auth.mfa.listFactors();
  for (const faktor of faktorLama?.totp ?? []) {
    if (faktor.status !== 'verified') {
      await supabase.auth.mfa.unenroll({ factorId: faktor.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `Razeline ${new Date().toISOString().slice(0, 10)}`,
  });

  if (error || !data) {
    return { ok: false, galat: 'Gagal memulai pendaftaran dua langkah. Silakan coba lagi.' };
  }

  return {
    ok: true,
    factorId: data.id,
    qr: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

const skemaKonfirmasi = z.object({
  factorId: z.uuid(),
  kode: z.string().trim().regex(/^\d{6}$/, 'Kode terdiri dari 6 angka.'),
});

export async function konfirmasiPendaftaran2FA(
  factorId: string,
  kode: string,
): Promise<HasilAksi2FA> {
  const hasil = skemaKonfirmasi.safeParse({ factorId, kode });
  if (!hasil.success) {
    return { ok: false, galat: hasil.error.issues[0]?.message ?? 'Data tidak valid.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: tantangan, error: galatTantangan } = await supabase.auth.mfa.challenge({
    factorId: hasil.data.factorId,
  });

  if (galatTantangan || !tantangan) {
    return { ok: false, galat: 'Gagal memulai verifikasi. Silakan ulangi pendaftaran.' };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId: hasil.data.factorId,
    challengeId: tantangan.id,
    code: hasil.data.kode,
  });

  if (error) {
    return { ok: false, galat: 'Kode salah atau sudah berganti. Coba dengan kode terbaru.' };
  }

  revalidatePath('/admin/keamanan');
  return { ok: true, info: 'Autentikasi dua langkah berhasil diaktifkan.' };
}

export async function nonaktifkan2FA(factorId: string): Promise<HasilAksi2FA> {
  const profil = await ambilProfil();
  if (!profil) return { ok: false, galat: 'Sesi Anda sudah berakhir.' };

  const idValid = z.uuid().safeParse(factorId);
  if (!idValid.success) return { ok: false, galat: 'Perangkat tidak dikenali.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId: idValid.data });

  if (error) return { ok: false, galat: 'Gagal menonaktifkan autentikasi dua langkah.' };

  revalidatePath('/admin/keamanan');
  return { ok: true, info: 'Autentikasi dua langkah dinonaktifkan.' };
}
