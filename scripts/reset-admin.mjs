/**
 * Memulihkan akses akun admin.
 *
 * Berguna ketika ponsel yang menyimpan aplikasi autentikator hilang, atau
 * ketika kata sandi admin perlu diganti dari sisi server.
 *
 * Pemakaian:
 *   node scripts/reset-admin.mjs <email>                  → hapus pendaftaran 2FA saja
 *   node scripts/reset-admin.mjs <email> <kata-sandi>     → hapus 2FA + ganti kata sandi
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

const [email, sandiBaru] = process.argv.slice(2);

if (!email) {
  console.error('Pemakaian: node scripts/reset-admin.mjs <email> [kata-sandi-baru]');
  process.exit(1);
}
if (sandiBaru && sandiBaru.length < 8) {
  console.error('Kata sandi minimal 8 karakter.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function cariPengguna(alamat) {
  let halaman = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: halaman, perPage: 200 });
    if (error) throw error;
    const cocok = data.users.find((user) => user.email?.toLowerCase() === alamat.toLowerCase());
    if (cocok) return cocok;
    if (data.users.length < 200) return null;
    halaman += 1;
  }
}

const pengguna = await cariPengguna(email);
if (!pengguna) {
  console.error(`[gagal] Akun ${email} tidak ditemukan.`);
  process.exit(1);
}

// Hapus seluruh perangkat autentikator yang terdaftar.
// listUsers tidak menyertakan daftar faktor, jadi diambil terpisah.
const { data: daftarFaktor, error: galatFaktor } = await supabase.auth.admin.mfa.listFactors({
  userId: pengguna.id,
});
if (galatFaktor) {
  console.error(`[gagal] Daftar perangkat 2FA tidak terbaca: ${galatFaktor.message}`);
  process.exit(1);
}

const faktor = daftarFaktor?.factors ?? [];
for (const item of faktor) {
  const { error } = await supabase.auth.admin.mfa.deleteFactor({
    userId: pengguna.id,
    id: item.id,
  });
  if (error) {
    console.error(`[gagal] Perangkat 2FA tidak terhapus: ${error.message}`);
    process.exit(1);
  }
}
console.log(
  faktor.length > 0
    ? `[ok] ${faktor.length} perangkat autentikator dihapus.`
    : '[info] Tidak ada perangkat autentikator terdaftar.',
);

if (sandiBaru) {
  const { error } = await supabase.auth.admin.updateUserById(pengguna.id, { password: sandiBaru });
  if (error) {
    console.error(`[gagal] Kata sandi tidak tersimpan: ${error.message}`);
    process.exit(1);
  }
  console.log('[ok] Kata sandi diperbarui.');
}

console.log('');
console.log(`Silakan masuk kembali di /masuk sebagai ${email},`);
console.log('lalu daftarkan ulang autentikator di /admin/keamanan.');
