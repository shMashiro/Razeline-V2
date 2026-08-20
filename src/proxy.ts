import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const asalSupabase = (() => {
  try {
    return new URL(SUPABASE_URL).origin;
  } catch {
    return '';
  }
})();

/** Halaman yang hanya boleh dibuka setelah masuk. */
const JALUR_TERKUNCI = ['/akun', '/admin'];

function susunCSP(nonce: string): string {
  const pengembangan = process.env.NODE_ENV === 'development';

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${pengembangan ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${asalSupabase}`,
    "font-src 'self' data:",
    `connect-src 'self' ${asalSupabase}${pengembangan ? ' ws: wss:' : ''}`,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const csp = susunCSP(nonce);

  const headerPermintaan = new Headers(request.headers);
  headerPermintaan.set('x-nonce', nonce);
  headerPermintaan.set('x-pathname', request.nextUrl.pathname);
  headerPermintaan.set('content-security-policy', csp);

  let response = NextResponse.next({ request: { headers: headerPermintaan } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request: { headers: headerPermintaan } });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Menyegarkan token sesi bila sudah mendekati kedaluwarsa.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && JALUR_TERKUNCI.some((jalur) => request.nextUrl.pathname.startsWith(jalur))) {
    const tujuan = request.nextUrl.clone();
    tujuan.pathname = '/masuk';
    tujuan.search = `?lanjut=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(tujuan);
  }

  response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Lewati berkas statis dan optimasi gambar agar proxy tidak
     * menambah beban pada aset yang sudah di-cache.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
