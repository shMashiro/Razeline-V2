'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { ambilPengguna } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { pesanGalat, skemaCheckout } from '@/lib/validation';

const KUKI_PESANAN_TAMU = 'razeline_pesanan';
const BATAS_PESANAN_PER_JAM = 5;

export type HasilPesanan =
  | { ok: true; kode: string }
  | { ok: false; pesan: string };

/** Simpan kode pesanan tamu di cookie agar bisa dibuka lagi tanpa akun. */
async function catatPesananTamu(kode: string) {
  const kuki = await cookies();
  const sebelumnya = (kuki.get(KUKI_PESANAN_TAMU)?.value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const daftar = [kode, ...sebelumnya.filter((item) => item !== kode)].slice(0, 12);

  kuki.set(KUKI_PESANAN_TAMU, daftar.join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 120,
  });
}

export async function ambilPesananTamu(): Promise<string[]> {
  const kuki = await cookies();
  return (kuki.get(KUKI_PESANAN_TAMU)?.value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Membatasi jumlah pesanan dari satu nomor telepon dalam satu jam. */
async function melebihiBatas(telepon: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const sejam = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_phone', telepon)
    .gte('created_at', sejam);

  return (count ?? 0) >= BATAS_PESANAN_PER_JAM;
}

export async function buatPesanan(masukan: unknown): Promise<HasilPesanan> {
  const hasilValidasi = skemaCheckout.safeParse(masukan);
  if (!hasilValidasi.success) {
    return { ok: false, pesan: pesanGalat(hasilValidasi.error) };
  }
  const data = hasilValidasi.data;

  if (await melebihiBatas(data.customer_phone)) {
    return {
      ok: false,
      pesan:
        'Terlalu banyak pesanan dari nomor ini dalam satu jam terakhir. Silakan hubungi admin lewat WhatsApp.',
    };
  }

  const pengguna = await ambilPengguna();
  const admin = createSupabaseAdminClient();

  // Seluruh harga, diskon, dan stok dihitung ulang di dalam database
  // sehingga nilai dari browser tidak bisa dimanipulasi.
  const { data: hasil, error } = await admin.rpc('create_order', {
    payload: {
      user_id: pengguna?.id ?? null,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      shipping_recipient: data.shipping_recipient,
      shipping_phone: data.shipping_phone,
      shipping_address: data.shipping_address,
      shipping_district: data.shipping_district,
      shipping_city: data.shipping_city,
      shipping_province: data.shipping_province,
      shipping_postal_code: data.shipping_postal_code,
      shipping_notes: data.shipping_notes,
      shipping_method_id: data.shipping_method_id,
      payment_method_id: data.payment_method_id,
      voucher_code: data.voucher_code,
      items: data.items,
    },
  });

  if (error) {
    return { ok: false, pesan: error.message.replace(/^.*?:\s*/, '') };
  }

  const kode = (hasil as { order_code?: string } | null)?.order_code;
  if (!kode) {
    return { ok: false, pesan: 'Pesanan gagal dibuat. Silakan coba lagi.' };
  }

  if (pengguna && data.simpan_alamat) {
    const supabase = await createSupabaseServerClient();
    await supabase.from('addresses').insert({
      user_id: pengguna.id,
      label: 'Alamat Pengiriman',
      recipient_name: data.shipping_recipient,
      phone: data.shipping_phone,
      province: data.shipping_province,
      city: data.shipping_city,
      district: data.shipping_district,
      postal_code: data.shipping_postal_code,
      address_line: data.shipping_address,
      is_default: false,
    });
  }

  if (!pengguna) {
    await catatPesananTamu(kode);
  }

  return { ok: true, kode };
}

export type HasilVoucher =
  | { ok: true; potongan: number; keterangan: string }
  | { ok: false; pesan: string };

/**
 * Memeriksa kode voucher tanpa membocorkan daftar voucher yang ada.
 * Perhitungan final tetap diulang saat pesanan dibuat.
 */
export async function cekVoucher(kode: string, subtotal: number): Promise<HasilVoucher> {
  const kodeValid = z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,30}$/)
    .safeParse(kode);

  if (!kodeValid.success) {
    return { ok: false, pesan: 'Format kode voucher tidak sesuai.' };
  }

  const nilaiSubtotal = z.number().min(0).max(9_999_999_999).safeParse(subtotal);
  if (!nilaiSubtotal.success) {
    return { ok: false, pesan: 'Nilai belanja tidak valid.' };
  }

  const admin = createSupabaseAdminClient();
  const { data: voucher } = await admin
    .from('vouchers')
    .select('*')
    .eq('code', kodeValid.data)
    .eq('is_active', true)
    .maybeSingle();

  if (!voucher) {
    return { ok: false, pesan: 'Kode voucher tidak ditemukan.' };
  }

  const sekarang = Date.now();
  if (voucher.starts_at && new Date(voucher.starts_at).getTime() > sekarang) {
    return { ok: false, pesan: 'Voucher ini belum berlaku.' };
  }
  if (voucher.ends_at && new Date(voucher.ends_at).getTime() < sekarang) {
    return { ok: false, pesan: 'Voucher ini sudah kedaluwarsa.' };
  }
  if (voucher.quota !== null && voucher.used_count >= voucher.quota) {
    return { ok: false, pesan: 'Kuota voucher sudah habis.' };
  }
  if (nilaiSubtotal.data < Number(voucher.min_spend)) {
    return {
      ok: false,
      pesan: `Voucher ini butuh minimal belanja Rp${Number(voucher.min_spend).toLocaleString('id-ID')}.`,
    };
  }

  let potongan =
    voucher.discount_type === 'percent'
      ? (nilaiSubtotal.data * Number(voucher.discount_value)) / 100
      : Number(voucher.discount_value);

  if (voucher.max_discount !== null) {
    potongan = Math.min(potongan, Number(voucher.max_discount));
  }
  potongan = Math.round(Math.min(potongan, nilaiSubtotal.data));

  return { ok: true, potongan, keterangan: voucher.description };
}
