/**
 * Uji cepat kebijakan keamanan database.
 *
 * Skrip ini memakai kunci publik (yang juga dipegang browser pengunjung)
 * lalu memastikan data sensitif tetap tertutup dan penulisan langsung ditolak.
 *
 * Pemakaian: node scripts/uji-keamanan.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

for (const berkas of ['.env.local', '.env']) {
  const penuh = path.resolve(process.cwd(), berkas);
  if (!existsSync(penuh)) continue;
  for (const baris of readFileSync(penuh, 'utf8').split(/\r?\n/)) {
    const cocok = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(baris);
    if (cocok) process.env[cocok[1]] = cocok[2].replace(/^["']|["']$/g, '');
  }
}

const publik = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let lulus = 0;
let gagal = 0;

function periksa(nama, aman, keterangan) {
  if (aman) {
    lulus += 1;
    console.log(`  [aman]  ${nama}`);
  } else {
    gagal += 1;
    console.log(`  [BOCOR] ${nama} — ${keterangan}`);
  }
}

console.log('\nMenguji akses dengan kunci publik (anon)\n');

// 1. Voucher tidak boleh bisa dikumpulkan pengunjung.
{
  const { data } = await publik.from('vouchers').select('code');
  periksa('Daftar voucher tertutup', (data?.length ?? 0) === 0, `${data?.length} voucher terbaca`);
}

// 2. Pesanan orang lain tidak boleh terbaca tanpa login.
{
  const { data } = await publik.from('orders').select('order_code, customer_phone');
  periksa('Data pesanan tertutup', (data?.length ?? 0) === 0, `${data?.length} pesanan terbaca`);
}

// 3. Profil pengguna lain tidak boleh terbaca.
{
  const { data } = await publik.from('profiles').select('id, email');
  periksa('Profil pengguna tertutup', (data?.length ?? 0) === 0, `${data?.length} profil terbaca`);
}

// 4. Katalog harus tetap bisa dibaca publik.
{
  const { data } = await publik.from('products').select('id').eq('is_active', true).limit(1);
  periksa('Katalog tetap bisa dibaca', (data?.length ?? 0) > 0, 'katalog ikut terkunci');
}

// 5. Produk nonaktif tidak boleh bocor.
{
  const { data: dibuat } = await admin
    .from('products')
    .insert({
      name: 'Produk Uji Nonaktif',
      slug: `uji-nonaktif-${Date.now()}`,
      price: 1000,
      is_active: false,
    })
    .select('id')
    .single();

  const { data } = await publik.from('products').select('id').eq('id', dibuat.id);
  periksa('Produk nonaktif tersembunyi', (data?.length ?? 0) === 0, 'produk nonaktif terlihat');

  await admin.from('products').delete().eq('id', dibuat.id);
}

// 6. Penulisan langsung ke katalog harus ditolak.
{
  const { error } = await publik
    .from('products')
    .insert({ name: 'Sisipan Nakal', slug: `nakal-${Date.now()}`, price: 1 });
  periksa('Tulis produk ditolak', Boolean(error), 'pengunjung bisa menambah produk');
}

// 7. Harga produk tidak boleh bisa diubah dari sisi klien.
{
  const { data: contoh } = await publik.from('products').select('id').limit(1).single();
  const { error } = await publik.from('products').update({ price: 1 }).eq('id', contoh.id);
  periksa('Ubah harga ditolak', Boolean(error), 'pengunjung bisa mengubah harga');
}

// 8. Fungsi pembuat pesanan tidak boleh dipanggil langsung dari browser.
{
  const { error } = await publik.rpc('create_order', { payload: { items: [] } });
  periksa('RPC create_order tertutup', Boolean(error), 'fungsi pesanan bisa dipanggil langsung');
}

// 9. Pengaturan toko boleh dibaca, tapi tidak boleh diubah.
{
  const { error } = await publik.from('store_settings').update({ whatsapp: '620000' }).eq('id', 1);
  periksa('Ubah pengaturan toko ditolak', Boolean(error), 'pengaturan toko bisa diubah publik');
}

console.log(`\nHasil: ${lulus} aman, ${gagal} bermasalah.\n`);
process.exit(gagal === 0 ? 0 : 1);
