'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { SITE_URL } from '@/lib/env';
import { DUA_LANGKAH_ADMIN_AKTIF, OTP_PELANGGAN_AKTIF } from '@/lib/fitur';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { skemaTelepon } from '@/lib/validation';

const BATAS_PENDAFTARAN_PER_JAM = 20;

/**
 * Membatasi jumlah akun baru per jam. Dipakai saat verifikasi email
 * dimatikan, karena akun dibuat lewat kunci layanan yang tidak punya
 * pembatas bawaan seperti pendaftaran biasa.
 */
async function pendaftaranMelebihiBatas(): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const sejam = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sejam);

  return (count ?? 0) >= BATAS_PENDAFTARAN_PER_JAM;
}

export interface StatusForm {
  galat?: string;
  info?: string;
}

/** Hanya izinkan pengalihan ke jalur internal, mencegah open redirect. */
function jalurAman(nilai: FormDataEntryValue | null, bawaan = '/'): string {
  const teks = typeof nilai === 'string' ? nilai : '';
  return /^\/(?!\/)[\w\-/?=&%.#]*$/.test(teks) ? teks : bawaan;
}

const skemaDaftar = z.object({
  full_name: z.string().trim().min(3, 'Nama minimal 3 karakter.').max(80),
  email: z.email('Format email tidak valid.'),
  phone: z.union([skemaTelepon, z.literal('')]),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter.')
    .max(72, 'Kata sandi maksimal 72 karakter.')
    .regex(/[a-zA-Z]/, 'Kata sandi harus memuat huruf.')
    .regex(/[0-9]/, 'Kata sandi harus memuat angka.'),
});

export async function daftar(_sebelumnya: StatusForm, formData: FormData): Promise<StatusForm> {
  const hasil = skemaDaftar.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    password: formData.get('password'),
  });

  if (!hasil.success) {
    return { galat: hasil.error.issues[0]?.message ?? 'Data pendaftaran tidak valid.' };
  }

  const supabase = await createSupabaseServerClient();

  // Verifikasi email dimatikan: akun langsung dibuat aktif lalu pengguna
  // dimasukkan ke sesinya. Pembuatan akun tetap dibatasi lajunya supaya
  // jalur ini tidak dipakai membuat akun secara massal.
  if (!OTP_PELANGGAN_AKTIF) {
    if (await pendaftaranMelebihiBatas()) {
      return {
        galat:
          'Pendaftaran sedang dibatasi sementara. Silakan coba lagi beberapa saat lagi atau hubungi admin toko.',
      };
    }

    const admin = createSupabaseAdminClient();
    const { error: galatBuat } = await admin.auth.admin.createUser({
      email: hasil.data.email,
      password: hasil.data.password,
      email_confirm: true,
      user_metadata: { full_name: hasil.data.full_name, phone: hasil.data.phone },
    });

    if (galatBuat) {
      return {
        galat:
          galatBuat.code === 'email_exists' || galatBuat.status === 422
            ? 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.'
            : 'Pendaftaran gagal. Silakan coba lagi.',
      };
    }

    const { error: galatMasuk } = await supabase.auth.signInWithPassword({
      email: hasil.data.email,
      password: hasil.data.password,
    });
    if (galatMasuk) {
      return { galat: 'Akun berhasil dibuat, tetapi gagal masuk. Silakan masuk secara manual.' };
    }

    redirect('/akun');
  }

  const { error } = await supabase.auth.signUp({
    email: hasil.data.email,
    password: hasil.data.password,
    options: {
      data: { full_name: hasil.data.full_name, phone: hasil.data.phone },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      galat:
        error.code === 'user_already_exists'
          ? 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.'
          : error.message,
    };
  }

  redirect(`/verifikasi?email=${encodeURIComponent(hasil.data.email)}`);
}

const skemaMasuk = z.object({
  email: z.email('Format email tidak valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.').max(72),
});

export async function masuk(_sebelumnya: StatusForm, formData: FormData): Promise<StatusForm> {
  const hasil = skemaMasuk.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!hasil.success) {
    return { galat: hasil.error.issues[0]?.message ?? 'Data masuk tidak valid.' };
  }

  const lanjut = jalurAman(formData.get('lanjut'));
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: hasil.data.email,
    password: hasil.data.password,
  });

  if (error) {
    if (error.code === 'email_not_confirmed') {
      if (!OTP_PELANGGAN_AKTIF) {
        return {
          galat:
            'Akun ini dibuat saat verifikasi email masih menyala dan belum diverifikasi. Hubungi admin toko untuk mengaktifkannya.',
        };
      }
      redirect(`/verifikasi?email=${encodeURIComponent(hasil.data.email)}&alasan=belum-verifikasi`);
    }
    return { galat: 'Email atau kata sandi salah. Silakan periksa kembali.' };
  }

  // Bila akun mewajibkan autentikasi dua langkah, selesaikan dulu langkah kedua.
  if (DUA_LANGKAH_ADMIN_AKTIF) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
      redirect(`/masuk/dua-langkah?lanjut=${encodeURIComponent(lanjut)}`);
    }
  }

  const { data: profil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  redirect(profil?.role === 'admin' && lanjut === '/' ? '/admin' : lanjut);
}

const skemaVerifikasi = z.object({
  email: z.email(),
  token: z.string().trim().regex(/^\d{6}$/, 'Kode verifikasi terdiri dari 6 angka.'),
});

export async function verifikasiKode(
  _sebelumnya: StatusForm,
  formData: FormData,
): Promise<StatusForm> {
  const hasil = skemaVerifikasi.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
  });

  if (!hasil.success) {
    return { galat: hasil.error.issues[0]?.message ?? 'Kode verifikasi tidak valid.' };
  }

  const supabase = await createSupabaseServerClient();

  // Tipe token pendaftaran berbeda antar versi Supabase, jadi dicoba keduanya.
  let { error } = await supabase.auth.verifyOtp({
    email: hasil.data.email,
    token: hasil.data.token,
    type: 'signup',
  });

  if (error) {
    ({ error } = await supabase.auth.verifyOtp({
      email: hasil.data.email,
      token: hasil.data.token,
      type: 'email',
    }));
  }

  if (error) {
    return { galat: 'Kode salah atau sudah kedaluwarsa. Minta kode baru lalu coba lagi.' };
  }

  redirect('/akun');
}

export async function kirimUlangKode(
  _sebelumnya: StatusForm,
  formData: FormData,
): Promise<StatusForm> {
  const email = z.email().safeParse(formData.get('email'));
  if (!email.success) return { galat: 'Alamat email tidak valid.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.data,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });

  if (error) {
    return {
      galat:
        'Kode gagal dikirim ulang. Tunggu beberapa menit sebelum mencoba lagi, atau hubungi admin toko.',
    };
  }

  return { info: 'Kode verifikasi baru sudah dikirim ke email Anda.' };
}

const skemaTotp = z.string().trim().regex(/^\d{6}$/, 'Kode aplikasi autentikator terdiri dari 6 angka.');

export async function verifikasiDuaLangkah(
  _sebelumnya: StatusForm,
  formData: FormData,
): Promise<StatusForm> {
  const kode = skemaTotp.safeParse(formData.get('kode'));
  if (!kode.success) {
    return { galat: kode.error.issues[0]?.message ?? 'Kode tidak valid.' };
  }

  const lanjut = jalurAman(formData.get('lanjut'), '/admin');
  const supabase = await createSupabaseServerClient();

  const { data: faktor, error: galatFaktor } = await supabase.auth.mfa.listFactors();
  const totp = faktor?.totp?.find((item) => item.status === 'verified');

  if (galatFaktor || !totp) {
    return { galat: 'Perangkat autentikator belum terdaftar untuk akun ini.' };
  }

  const { data: tantangan, error: galatTantangan } = await supabase.auth.mfa.challenge({
    factorId: totp.id,
  });
  if (galatTantangan || !tantangan) {
    return { galat: 'Gagal memulai verifikasi. Silakan coba lagi.' };
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: tantangan.id,
    code: kode.data,
  });

  if (error) {
    return { galat: 'Kode salah atau sudah berganti. Lihat kode terbaru di aplikasi autentikator.' };
  }

  redirect(lanjut);
}

export async function keluar() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
