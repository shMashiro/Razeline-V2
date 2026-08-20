'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { centang, pastikanAdmin, teks } from '@/lib/actions/admin-dasar';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ambilPengguna } from '@/lib/auth';
import type { StatusForm as StatusAdmin } from '@/lib/types';
import {
  pesanGalat,
  skemaBannerAdmin,
  skemaPembayaranAdmin,
  skemaPengaturanToko,
  skemaPengirimanAdmin,
  skemaStatusPesanan,
  skemaVoucherAdmin,
} from '@/lib/validation';

/* ------------------------------- Pesanan --------------------------------- */

export async function perbaruiStatusPesanan(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaStatusPesanan.safeParse({
    order_id: teks(formData, 'order_id'),
    status: teks(formData, 'status'),
    payment_status: teks(formData, 'payment_status'),
    tracking_number: teks(formData, 'tracking_number'),
    admin_note: teks(formData, 'admin_note'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('orders')
    .update({
      status: hasil.data.status,
      payment_status: hasil.data.payment_status,
      tracking_number: hasil.data.tracking_number || null,
      admin_note: hasil.data.admin_note || null,
    })
    .eq('id', hasil.data.order_id);

  if (error) return { galat: 'Status pesanan gagal diperbarui.' };

  revalidatePath('/admin/pesanan');
  revalidatePath(`/admin/pesanan/${hasil.data.order_id}`);
  return { info: 'Status pesanan berhasil diperbarui.' };
}

/* ------------------------------- Voucher --------------------------------- */

export async function simpanVoucher(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const kuota = teks(formData, 'quota');
  const maksimal = teks(formData, 'max_discount');

  const hasil = skemaVoucherAdmin.safeParse({
    code: teks(formData, 'code'),
    description: teks(formData, 'description'),
    discount_type: teks(formData, 'discount_type'),
    discount_value: teks(formData, 'discount_value'),
    min_spend: teks(formData, 'min_spend') || 0,
    max_discount: maksimal === '' ? undefined : maksimal,
    quota: kuota === '' ? undefined : kuota,
    starts_at: teks(formData, 'starts_at'),
    ends_at: teks(formData, 'ends_at'),
    is_active: centang(formData, 'is_active'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const baris = {
    ...hasil.data,
    max_discount: hasil.data.max_discount ?? null,
    quota: hasil.data.quota ?? null,
    starts_at: hasil.data.starts_at ? new Date(hasil.data.starts_at).toISOString() : null,
    ends_at: hasil.data.ends_at ? new Date(hasil.data.ends_at).toISOString() : null,
  };

  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();
  const { error } = id
    ? await admin.from('vouchers').update(baris).eq('id', id)
    : await admin.from('vouchers').insert(baris);

  if (error) {
    return {
      galat: error.code === '23505' ? 'Kode voucher sudah dipakai.' : 'Voucher gagal disimpan.',
    };
  }

  revalidatePath('/admin/voucher');
  return { info: 'Voucher berhasil disimpan.' };
}

export async function hapusVoucher(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Voucher tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('vouchers').delete().eq('id', idValid.data);
  if (error) return { galat: 'Voucher gagal dihapus.' };

  revalidatePath('/admin/voucher');
  return { info: 'Voucher dihapus.' };
}

/* -------------------------------- Banner --------------------------------- */

export async function simpanBanner(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaBannerAdmin.safeParse({
    title: teks(formData, 'title'),
    subtitle: teks(formData, 'subtitle'),
    image_url: teks(formData, 'image_url'),
    link_url: teks(formData, 'link_url'),
    cta_label: teks(formData, 'cta_label') || 'Lihat Produk',
    sort_order: teks(formData, 'sort_order') || 0,
    is_active: centang(formData, 'is_active'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const baris = {
    ...hasil.data,
    image_url: hasil.data.image_url || null,
    link_url: hasil.data.link_url || null,
  };

  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();
  const { error } = id
    ? await admin.from('banners').update(baris).eq('id', id)
    : await admin.from('banners').insert(baris);

  if (error) return { galat: 'Banner gagal disimpan.' };

  revalidatePath('/', 'layout');
  return { info: 'Banner berhasil disimpan.' };
}

export async function hapusBanner(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Banner tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('banners').delete().eq('id', idValid.data);
  if (error) return { galat: 'Banner gagal dihapus.' };

  revalidatePath('/', 'layout');
  return { info: 'Banner dihapus.' };
}

/* ------------------------------ Pengiriman -------------------------------- */

export async function simpanPengiriman(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaPengirimanAdmin.safeParse({
    name: teks(formData, 'name'),
    description: teks(formData, 'description'),
    cost: teks(formData, 'cost') || 0,
    estimated_days: teks(formData, 'estimated_days'),
    sort_order: teks(formData, 'sort_order') || 0,
    is_active: centang(formData, 'is_active'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();
  const { error } = id
    ? await admin.from('shipping_methods').update(hasil.data).eq('id', id)
    : await admin.from('shipping_methods').insert(hasil.data);

  if (error) return { galat: 'Metode pengiriman gagal disimpan.' };

  revalidatePath('/', 'layout');
  return { info: 'Metode pengiriman berhasil disimpan.' };
}

export async function hapusPengiriman(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Metode tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('shipping_methods').delete().eq('id', idValid.data);
  if (error) {
    return { galat: 'Metode ini sudah dipakai pesanan lama. Nonaktifkan saja agar riwayat aman.' };
  }

  revalidatePath('/', 'layout');
  return { info: 'Metode pengiriman dihapus.' };
}

/* ------------------------------ Pembayaran -------------------------------- */

export async function simpanPembayaran(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaPembayaranAdmin.safeParse({
    name: teks(formData, 'name'),
    type: teks(formData, 'type') || 'transfer',
    account_name: teks(formData, 'account_name'),
    account_number: teks(formData, 'account_number'),
    instructions: teks(formData, 'instructions'),
    sort_order: teks(formData, 'sort_order') || 0,
    is_active: centang(formData, 'is_active'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const id = teks(formData, 'id');
  const admin = createSupabaseAdminClient();
  const { error } = id
    ? await admin.from('payment_methods').update(hasil.data).eq('id', id)
    : await admin.from('payment_methods').insert(hasil.data);

  if (error) return { galat: 'Metode pembayaran gagal disimpan.' };

  revalidatePath('/', 'layout');
  return { info: 'Metode pembayaran berhasil disimpan.' };
}

export async function hapusPembayaran(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Metode tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('payment_methods').delete().eq('id', idValid.data);
  if (error) {
    return { galat: 'Metode ini sudah dipakai pesanan lama. Nonaktifkan saja agar riwayat aman.' };
  }

  revalidatePath('/', 'layout');
  return { info: 'Metode pembayaran dihapus.' };
}

/* ------------------------------ Pengaturan -------------------------------- */

export async function simpanPengaturan(
  _sebelumnya: StatusAdmin,
  formData: FormData,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const hasil = skemaPengaturanToko.safeParse({
    store_name: teks(formData, 'store_name'),
    logo_url: teks(formData, 'logo_url'),
    tagline: teks(formData, 'tagline'),
    address: teks(formData, 'address'),
    whatsapp: teks(formData, 'whatsapp'),
    email: teks(formData, 'email'),
    phone: teks(formData, 'phone'),
    maps_url: teks(formData, 'maps_url'),
    instagram: teks(formData, 'instagram'),
    facebook: teks(formData, 'facebook'),
    operational_hours: teks(formData, 'operational_hours'),
    free_shipping_min: teks(formData, 'free_shipping_min') || 0,
    announcement: teks(formData, 'announcement'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('store_settings').upsert({
    id: 1,
    ...hasil.data,
    logo_url: hasil.data.logo_url || null,
    updated_at: new Date().toISOString(),
  });

  if (error) return { galat: 'Pengaturan gagal disimpan.' };

  revalidatePath('/', 'layout');
  return { info: 'Pengaturan toko berhasil disimpan.' };
}

/* -------------------------------- Ulasan ---------------------------------- */

export async function alihkanPersetujuanUlasan(
  id: string,
  disetujui: boolean,
): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Ulasan tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from('reviews')
    .update({ is_approved: disetujui })
    .eq('id', idValid.data);

  if (error) return { galat: 'Status ulasan gagal diubah.' };

  revalidatePath('/admin/ulasan');
  return { info: disetujui ? 'Ulasan ditampilkan.' : 'Ulasan disembunyikan.' };
}

export async function hapusUlasan(id: string): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Ulasan tidak dikenali.' };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('reviews').delete().eq('id', idValid.data);
  if (error) return { galat: 'Ulasan gagal dihapus.' };

  revalidatePath('/admin/ulasan');
  return { info: 'Ulasan dihapus.' };
}

/* ------------------------------- Pengguna --------------------------------- */

export async function ubahPeranPengguna(id: string, peran: 'customer' | 'admin'): Promise<StatusAdmin> {
  const ditolak = await pastikanAdmin();
  if (ditolak) return ditolak;

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Pengguna tidak dikenali.' };

  const pengguna = await ambilPengguna();
  if (pengguna?.id === idValid.data && peran === 'customer') {
    return { galat: 'Anda tidak bisa mencabut peran admin dari akun Anda sendiri.' };
  }

  const admin = createSupabaseAdminClient();

  // Selalu sisakan minimal satu admin aktif.
  if (peran === 'customer') {
    const { count } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin');
    if ((count ?? 0) <= 1) {
      return { galat: 'Minimal harus ada satu admin. Angkat admin lain terlebih dahulu.' };
    }
  }

  const { error } = await admin.from('profiles').update({ role: peran }).eq('id', idValid.data);
  if (error) return { galat: 'Peran pengguna gagal diubah.' };

  revalidatePath('/admin/pengguna');
  return {
    info: peran === 'admin' ? 'Pengguna diangkat menjadi admin.' : 'Peran admin dicabut.',
  };
}
