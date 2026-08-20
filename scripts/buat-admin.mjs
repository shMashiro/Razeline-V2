/**
 * Membuat (atau mengangkat) akun admin Razeline Komputer.
 *
 * Pemakaian:
 *   node scripts/buat-admin.mjs email@toko.id "KataSandiKuat123"
 *
 * Bila email sudah terdaftar, skrip hanya mengubah perannya menjadi admin.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

for (const berkas of ['.env.local', '.env']) {
  const penuh = path.resolve(process.cwd(), berkas);
  if (!existsSync(penuh)) continue;
  for (const baris of readFileSync(penuh, 'utf8').split(/\r?\n/)) {
    const cocok = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(baris);
    // Sengaja menimpa agar tidak salah proyek bila komputer masih menyimpan
    // variabel Supabase dari proyek lain.
    if (cocok) process.env[cocok[1]] = cocok[2].replace(/^["']|["']$/g, '');
  }
}

const [email, sandi] = process.argv.slice(2);

if (!email || !sandi) {
  console.error('Pemakaian: node scripts/buat-admin.mjs <email> <kata-sandi>');
  process.exit(1);
}
if (sandi.length < 8) {
  console.error('Kata sandi minimal 8 karakter.');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const kunci = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !kunci) {
  console.error('NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi.');
  process.exit(1);
}

const supabase = createClient(url, kunci, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function cariPenggunaLewatEmail(alamat) {
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

const adaSebelumnya = await cariPenggunaLewatEmail(email);
let idPengguna = adaSebelumnya?.id;

if (adaSebelumnya) {
  console.log(`[info] Akun ${email} sudah ada, perannya akan diubah menjadi admin.`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: sandi,
    email_confirm: true,
    user_metadata: { full_name: 'Admin Razeline' },
  });
  if (error) {
    console.error(`[gagal] ${error.message}`);
    process.exit(1);
  }
  idPengguna = data.user.id;
  console.log(`[ok] Akun ${email} dibuat dan emailnya langsung diverifikasi.`);
}

const { error: galatProfil } = await supabase
  .from('profiles')
  .upsert({ id: idPengguna, email, role: 'admin' }, { onConflict: 'id' });

if (galatProfil) {
  console.error(`[gagal] Peran admin tidak tersimpan: ${galatProfil.message}`);
  process.exit(1);
}

console.log(`[ok] ${email} sekarang berperan sebagai admin.`);
console.log('');
console.log('Langkah berikutnya:');
console.log('  1. Buka /masuk lalu masuk dengan email dan kata sandi di atas.');
console.log('  2. Anda akan diarahkan ke /admin/keamanan untuk mengaktifkan verifikasi 2 langkah.');
console.log('  3. Pindai kode QR dengan Google Authenticator atau Authy, lalu masukkan 6 angka.');
