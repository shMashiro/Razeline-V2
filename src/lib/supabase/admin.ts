import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL } from '@/lib/env';

/**
 * Klien dengan hak penuh (service role) — melewati Row Level Security.
 * HANYA boleh dipakai di server action / route handler yang sudah
 * memverifikasi sendiri hak akses penggunanya.
 */
export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diisi pada variabel lingkungan.');
  }

  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
