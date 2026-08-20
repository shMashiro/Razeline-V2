'use client';

import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/env';

let cached: ReturnType<typeof createBrowserClient> | null = null;

/** Klien Supabase untuk browser (dipakai hanya untuk alur autentikasi). */
export function createSupabaseBrowserClient() {
  cached ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
