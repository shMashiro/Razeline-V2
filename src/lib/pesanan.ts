import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Pesanan, PesananLengkap } from '@/lib/types';
import { skemaKodePesanan } from '@/lib/validation';

const KOLOM_LENGKAP = `
  *,
  order_items(*),
  order_status_events(id, status, note, created_at)
`;

/**
 * Mengambil pesanan berdasarkan kode. Sengaja memakai service role agar
 * pelanggan tanpa akun tetap bisa mengecek pesanannya. Kode pesanan sendiri
 * berperan sebagai kunci akses, sehingga formatnya divalidasi ketat.
 */
export async function ambilPesananPerKode(kode: string): Promise<PesananLengkap | null> {
  const kodeValid = skemaKodePesanan.safeParse(kode);
  if (!kodeValid.success) return null;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('orders')
    .select(KOLOM_LENGKAP)
    .eq('order_code', kodeValid.data)
    .maybeSingle();

  if (!data) return null;

  const pesanan = data as unknown as PesananLengkap;
  pesanan.order_status_events = [...(pesanan.order_status_events ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return pesanan;
}

/** Riwayat pesanan milik pengguna yang sedang masuk (dibatasi RLS). */
export async function ambilPesananSaya(): Promise<Pesanan[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (data ?? []) as Pesanan[];
}
