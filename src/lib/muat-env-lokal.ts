import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Memuat .env.local dan MENIMPA variabel lingkungan bawaan sistem.
 *
 * Next.js secara bawaan memprioritaskan variabel lingkungan milik sistem
 * operasi di atas isi .env.local. Bila komputer pengembang kebetulan masih
 * menyimpan variabel Supabase dari proyek lain, aplikasi akan diam-diam
 * terhubung ke database yang salah. Fungsi ini dipanggil dari next.config.ts
 * agar konfigurasi milik repositori inilah yang selalu menang saat
 * pengembangan lokal.
 *
 * Di Vercel berkas .env.local tidak pernah ada, sehingga fungsi ini tidak
 * berpengaruh apa pun terhadap variabel lingkungan produksi.
 */
export function muatEnvLokal(): void {
  const berkas = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(berkas)) return;

  for (const baris of readFileSync(berkas, 'utf8').split(/\r?\n/)) {
    if (!baris.trim() || baris.trim().startsWith('#')) continue;

    const cocok = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(baris);
    if (!cocok) continue;

    const [, nama, nilaiMentah] = cocok;
    process.env[nama] = nilaiMentah.replace(/^["']|["']$/g, '');
  }
}
