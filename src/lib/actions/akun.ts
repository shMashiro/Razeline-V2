'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ambilPengguna } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { pesanGalat, skemaAlamat, skemaProfil } from '@/lib/validation';

export interface StatusAkun {
  galat?: string;
  info?: string;
}

function bacaCentang(formData: FormData, nama: string): boolean {
  return formData.get(nama) === 'on' || formData.get(nama) === 'true';
}

export async function simpanProfil(
  _sebelumnya: StatusAkun,
  formData: FormData,
): Promise<StatusAkun> {
  const pengguna = await ambilPengguna();
  if (!pengguna) return { galat: 'Sesi Anda sudah berakhir. Silakan masuk kembali.' };

  const hasil = skemaProfil.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone') ?? '',
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: hasil.data.full_name, phone: hasil.data.phone || null })
    .eq('id', pengguna.id);

  if (error) return { galat: 'Profil gagal disimpan. Silakan coba lagi.' };

  revalidatePath('/akun');
  return { info: 'Profil berhasil diperbarui.' };
}

export async function simpanAlamat(
  _sebelumnya: StatusAkun,
  formData: FormData,
): Promise<StatusAkun> {
  const pengguna = await ambilPengguna();
  if (!pengguna) return { galat: 'Sesi Anda sudah berakhir. Silakan masuk kembali.' };

  const hasil = skemaAlamat.safeParse({
    label: formData.get('label') || 'Rumah',
    recipient_name: formData.get('recipient_name'),
    phone: formData.get('phone'),
    province: formData.get('province'),
    city: formData.get('city'),
    district: formData.get('district') ?? '',
    postal_code: formData.get('postal_code') ?? '',
    address_line: formData.get('address_line'),
    notes: formData.get('notes') ?? '',
    is_default: bacaCentang(formData, 'is_default'),
  });
  if (!hasil.success) return { galat: pesanGalat(hasil.error) };

  const id = formData.get('id');
  const supabase = await createSupabaseServerClient();

  const { error } =
    typeof id === 'string' && id
      ? await supabase.from('addresses').update(hasil.data).eq('id', id).eq('user_id', pengguna.id)
      : await supabase.from('addresses').insert({ ...hasil.data, user_id: pengguna.id });

  if (error) return { galat: 'Alamat gagal disimpan. Silakan coba lagi.' };

  revalidatePath('/akun');
  return { info: 'Alamat berhasil disimpan.' };
}

export async function hapusAlamat(id: string): Promise<StatusAkun> {
  const pengguna = await ambilPengguna();
  if (!pengguna) return { galat: 'Sesi Anda sudah berakhir.' };

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Alamat tidak dikenali.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', idValid.data)
    .eq('user_id', pengguna.id);

  if (error) return { galat: 'Alamat gagal dihapus.' };

  revalidatePath('/akun');
  return { info: 'Alamat dihapus.' };
}

export async function jadikanAlamatUtama(id: string): Promise<StatusAkun> {
  const pengguna = await ambilPengguna();
  if (!pengguna) return { galat: 'Sesi Anda sudah berakhir.' };

  const idValid = z.uuid().safeParse(id);
  if (!idValid.success) return { galat: 'Alamat tidak dikenali.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', idValid.data)
    .eq('user_id', pengguna.id);

  if (error) return { galat: 'Gagal menjadikan alamat utama.' };

  revalidatePath('/akun');
  return { info: 'Alamat utama diperbarui.' };
}
