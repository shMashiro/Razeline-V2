/**
 * Menjalankan berkas .sql ke database Supabase.
 * Contoh: node scripts/run-sql.mjs supabase/schema.sql
 */
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const full = path.resolve(process.cwd(), file);
    if (!existsSync(full)) continue;
    for (const line of readFileSync(full, 'utf8').split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      // Sengaja menimpa: konfigurasi repositori harus menang atas
      // variabel lingkungan bawaan sistem operasi.
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}

loadEnv();

const file = process.argv[2];
if (!file) {
  console.error('Pemakaian: node scripts/run-sql.mjs <berkas.sql>');
  process.exit(1);
}

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error('SUPABASE_DB_URL belum diisi di .env.local');
  process.exit(1);
}

const sql = await readFile(path.resolve(process.cwd(), file), 'utf8');
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 120_000,
});

try {
  await client.connect();
  await client.query(sql);
  console.log(`[ok] ${file} berhasil dijalankan.`);
} catch (error) {
  console.error(`[gagal] ${file}`);
  console.error(`  ${error.message}`);
  if (error.position) console.error(`  posisi karakter: ${error.position}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
