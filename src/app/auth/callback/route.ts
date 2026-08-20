import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Menangani tautan verifikasi dari email Supabase.
 * Mendukung dua bentuk tautan: `?code=` (PKCE) dan `?token_hash=&type=`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const tujuanMentah = searchParams.get('lanjut') ?? '/akun';
  const tujuan = /^\/(?!\/)[\w\-/?=&%.#]*$/.test(tujuanMentah) ? tujuanMentah : '/akun';

  const kode = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const tipe = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();

  if (kode) {
    const { error } = await supabase.auth.exchangeCodeForSession(kode);
    if (!error) return NextResponse.redirect(new URL(tujuan, origin));
  } else if (tokenHash && tipe) {
    const { error } = await supabase.auth.verifyOtp({ type: tipe, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(tujuan, origin));
  }

  return NextResponse.redirect(new URL('/masuk?galat=tautan-tidak-valid', origin));
}
