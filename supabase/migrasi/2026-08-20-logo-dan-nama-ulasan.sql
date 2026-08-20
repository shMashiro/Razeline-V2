-- =============================================================
-- Migrasi 2026-08-20
--   1. Logo toko yang bisa diganti lewat panel admin.
--   2. Nama penulis disimpan langsung pada baris ulasan.
--
-- Aman dijalankan berulang kali.
-- =============================================================

-- 1. Logo toko ------------------------------------------------
alter table public.store_settings
  add column if not exists logo_url text;

-- 2. Nama penulis ulasan --------------------------------------
--
-- Sebelumnya nama penulis diambil lewat join ke tabel profiles.
-- Tabel itu sengaja tertutup untuk pengunjung (berisi email dan
-- nomor telepon), sehingga kueri publik selalu ditolak. Menyimpan
-- namanya langsung di baris ulasan membuat halaman produk tidak
-- perlu menyentuh profiles sama sekali, sekaligus menjaga ulasan
-- tetap utuh bila akun penulisnya dihapus.
alter table public.reviews
  add column if not exists author_name text not null default '';

-- Isi nama untuk ulasan yang sudah terlanjur ada.
update public.reviews r
set author_name = coalesce(nullif(p.full_name, ''), 'Pelanggan')
from public.profiles p
where p.id = r.user_id and r.author_name = '';

notify pgrst, 'reload schema';
