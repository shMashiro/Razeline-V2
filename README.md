# Razeline Komputer

Toko daring untuk **Razeline Komputer** — Kp. Nagrak, Jl. Raya Cikotok – Paris Kuray,
Kec. Cibeber, Kab. Lebak, Prov. Banten.

Dibangun dengan Next.js 16 (App Router), Supabase (PostgreSQL + Auth + Storage),
dan Tailwind CSS v4. Ditujukan untuk dijalankan di Vercel.

---

## Daftar isi

- [Fitur](#fitur)
- [Menjalankan di komputer sendiri](#menjalankan-di-komputer-sendiri)
- [Membuat akun admin](#membuat-akun-admin)
- [Struktur proyek](#struktur-proyek)
- [Keamanan](#keamanan)
- [Menyiapkan email verifikasi](#menyiapkan-email-verifikasi)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Perintah yang tersedia](#perintah-yang-tersedia)
- [Catatan perawatan](#catatan-perawatan)

---

## Fitur

### Untuk pembeli

| Halaman | Isi |
| --- | --- |
| Beranda | Carousel promo, pintasan kategori, alasan memilih toko, baris produk unggulan / terlaris / terbaru / terpopuler |
| Kategori | Seluruh kategori elektronik dalam bentuk kartu berfoto beserta jumlah produknya |
| Daftar kategori | Pencarian, filter merek, rentang harga (termasuk filter cepat), kondisi barang, ketersediaan stok, dan enam pilihan urutan |
| Katalog | Sama seperti daftar kategori, tetapi mencakup seluruh kategori sekaligus |
| Detail produk | Galeri foto, rating, stok, garansi, spesifikasi, deskripsi, ulasan pembeli, wishlist, keranjang, tanya via WhatsApp |
| Keranjang | Penyesuaian jumlah, pengecekan ulang harga & stok terbaru, indikator gratis ongkir |
| Checkout | Data pelanggan, alamat pengiriman, daftar barang, opsi pengiriman, metode pembayaran, kode voucher, rincian pembayaran |
| Pesanan | Daftar pesanan (akun maupun tanpa akun) dan detail status lengkap dengan lini masa |
| Lacak pesanan | Cek status hanya dengan kode pesanan, tanpa perlu login |
| Akun | Ubah data diri dan kelola beberapa alamat pengiriman |
| Bantuan | Panduan belanja, pembayaran, pengiriman, garansi |

Pemesanan bisa dilakukan **tanpa membuat akun**. Setelah pesanan tercatat,
pembeli mendapat tombol konfirmasi WhatsApp berisi rincian pesanan yang sudah
terisi lengkap. Tautannya dibuka di tab baru supaya halaman status pesanan —
tempat kode pesanan dan nomor rekening tertera — tetap terbuka.

### Untuk admin

Dasbor ringkasan, pengelolaan pesanan (status, status bayar, resi, catatan),
produk, kategori, merek, banner, voucher, metode pengiriman, metode pembayaran,
ulasan, pengguna, pengaturan toko, dan pengaturan keamanan akun.

Beberapa hal yang sering dipakai:

- **Identitas toko.** Logo, nama, alamat, jam buka, nomor WhatsApp, dan
  pengumuman header semuanya diatur di **Admin → Pengaturan Toko**. Logo yang
  diunggah langsung menggantikan lambang bawaan di header, footer, halaman
  masuk, dan panel admin.
- **Tindakan massal produk.** Di **Admin → Produk**, centang beberapa produk
  (atau pakai kotak "pilih semua" di kepala tabel) untuk menandai stok habis,
  menyembunyikan, menampilkan kembali, atau menghapusnya sekaligus.
- **Foto kategori dan banner** diunggah langsung dari panelnya masing-masing,
  tanpa perlu menempel URL.

---

## Menjalankan di komputer sendiri

### 1. Prasyarat

- Node.js 20 atau lebih baru
- Sebuah proyek Supabase

### 2. Pasang dependensi

```bash
npm install
```

### 3. Siapkan variabel lingkungan

```bash
cp .env.example .env.local
```

Lalu isi `.env.local` dengan nilai dari dasbor Supabase
(**Project Settings → API** dan **Project Settings → Database**):

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Alamat proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci publik (publishable / anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci rahasia — **hanya dipakai di server** |
| `SUPABASE_DB_URL` | String koneksi PostgreSQL, hanya untuk skrip migrasi |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` saat pengembangan |
| `FITUR_OTP_PELANGGAN` | `on` untuk mewajibkan verifikasi email saat mendaftar. Bawaan: mati |
| `FITUR_2FA_ADMIN` | `on` untuk mewajibkan autentikator pada akun admin. Bawaan: mati |

> **Penting.** Bila komputer Anda menyimpan variabel `NEXT_PUBLIC_SUPABASE_URL`
> atau `SUPABASE_SERVICE_ROLE_KEY` di level sistem operasi (misalnya sisa dari
> proyek lain), Next.js biasanya memprioritaskan nilai sistem tersebut dan
> aplikasi akan diam-diam terhubung ke database yang salah. Proyek ini
> menghindarinya lewat `src/lib/muat-env-lokal.ts` yang dipanggil dari
> `next.config.ts`, sehingga isi `.env.local` selalu menang saat pengembangan
> lokal. Meski begitu, sebaiknya variabel sisa tersebut tetap dihapus dari
> sistem agar tidak membingungkan.

### 4. Siapkan database

```bash
npm run db:setup
```

Perintah ini menjalankan dua berkas:

- `supabase/schema.sql` — **menghapus lalu membuat ulang seluruh schema `public`**,
  termasuk tabel, indeks, trigger, fungsi, kebijakan Row Level Security, dan
  bucket penyimpanan gambar.
- `supabase/seed.sql` — mengisi data awal: informasi toko, 12 kategori, 18 merek,
  31 produk contoh, metode pengiriman, metode pembayaran, voucher, dan banner.

> `schema.sql` bersifat merusak. Jalankan hanya pada proyek Supabase yang memang
> disiapkan untuk toko ini. Untuk mengisi ulang data contoh saja, gunakan
> `npm run db:seed`.

Bila database sudah berisi pesanan sungguhan, jangan jalankan `db:reset`.
Pakai berkas di `supabase/migrasi/` yang aman dijalankan berulang:

```bash
node scripts/run-sql.mjs supabase/migrasi/2026-08-20-logo-dan-nama-ulasan.sql
```

Bila setelah migrasi API Supabase sempat menjawab
`Could not find the table ... in the schema cache`, tunggu sekitar satu menit —
PostgREST perlu memuat ulang skemanya setelah schema dibuat ulang.

### 5. Jalankan

```bash
npm run dev
```

Buka <http://localhost:3000>.

---

## Membuat akun admin

```bash
npm run admin:buat -- admin@razelinekomputer.id "KataSandiYangKuat123"
```

Skrip akan membuat akun (email langsung terverifikasi) dan memberinya peran admin.
Bila emailnya sudah terdaftar, skrip hanya mengubah perannya.

Setelah itu masuk lewat `/masuk` menggunakan email dan kata sandi tersebut.

Bila `FITUR_2FA_ADMIN=on`, Anda akan lebih dulu diarahkan ke `/admin/keamanan`
untuk memindai kode QR dengan Google Authenticator, Authy, atau aplikasi
sejenis. Selama sakelar itu mati, masuk cukup dengan email dan kata sandi.

### Kehilangan akses admin

Bila ponsel yang menyimpan aplikasi autentikator hilang, atau kata sandi lupa:

```bash
npm run admin:reset -- admin@razelinekomputer.id                       # hapus 2FA saja
npm run admin:reset -- admin@razelinekomputer.id "KataSandiBaru123"    # sekaligus ganti sandi
```

Setelah itu masuk kembali dan daftarkan autentikator baru di `/admin/keamanan`.

---

## Struktur proyek

```
src/
  app/
    (toko)/          Halaman yang dilihat pembeli
    (auth)/          Masuk, daftar, verifikasi OTP, verifikasi dua langkah
    admin/           Panel pengelolaan toko
    auth/callback/   Penerima tautan verifikasi dari email Supabase
  components/        Komponen antarmuka (admin/ untuk komponen khusus admin)
  lib/
    actions/         Server action: checkout, wishlist, ulasan, akun, admin
    supabase/        Dua jenis klien: server (kunci publik) dan service role
    queries.ts       Seluruh pembacaan data katalog
    validation.ts    Skema Zod untuk semua masukan pengguna
supabase/
  schema.sql         Struktur database + kebijakan keamanan
  seed.sql           Data awal toko
  migrasi/           Perubahan struktur untuk database yang sudah berjalan
scripts/
  run-sql.mjs        Penjalan berkas SQL
  buat-admin.mjs     Pembuat akun admin
  reset-admin.mjs    Pemulih akses admin (hapus 2FA / ganti sandi)
  uji-keamanan.mjs   Uji cepat kebijakan Row Level Security
```

Seluruh nama berkas, fungsi, dan variabel ditulis dalam bahasa Indonesia agar
mudah dilanjutkan oleh pengembang lokal.

---

## Keamanan

Beberapa hal yang sudah diterapkan:

- **Row Level Security aktif di semua tabel.** Kunci publik hanya bisa membaca
  katalog yang aktif. Voucher, pesanan, dan profil tertutup rapat.
- **Kunci publik tidak punya izin menulis apa pun.** Seluruh perubahan data
  berjalan lewat server action yang memverifikasi hak akses lebih dulu.
- **Harga dan stok dihitung ulang di dalam database.** Fungsi `create_order`
  mengunci baris produk, mengambil harga dari database (bukan dari browser),
  memvalidasi voucher, memotong stok, dan membuat pesanan dalam satu transaksi.
- **Pembatalan pesanan mengembalikan stok dan kuota voucher** lewat trigger.
- **Pembatasan laju pemesanan:** maksimal 5 pesanan per nomor telepon per jam.
- **Autentikasi dua langkah (TOTP) untuk admin**, dapat dinyalakan lewat
  `FITUR_2FA_ADMIN=on`.
- **Content-Security-Policy berbasis nonce** beserta HSTS, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, dan `Permissions-Policy`.
- **Seluruh masukan pengguna divalidasi dengan Zod** sebelum menyentuh database.
- Kode pesanan memakai 32 bit keacakan sehingga tidak bisa ditebak berurutan.

Jalankan pemeriksaan mandiri kapan saja:

```bash
npm run uji:keamanan
```

> `SUPABASE_SERVICE_ROLE_KEY` memberi akses penuh ke database dan melewati semua
> kebijakan keamanan. Simpan hanya sebagai variabel lingkungan di server, jangan
> pernah memberinya awalan `NEXT_PUBLIC_`, dan jangan pernah mencommitnya.

### Sakelar verifikasi tambahan

Dua lapis pengamanan berikut **dimatikan secara bawaan** dan diatur lewat
`src/lib/fitur.ts`:

| Sakelar | Bila `on` | Bila mati (bawaan) |
| --- | --- | --- |
| `FITUR_OTP_PELANGGAN` | Pendaftaran mengirim kode 6 angka ke email, akun aktif setelah diverifikasi | Akun langsung aktif dan pengguna langsung masuk |
| `FITUR_2FA_ADMIN` | Admin wajib mendaftarkan aplikasi autentikator dan memasukkan kodenya tiap kali masuk | Admin cukup memakai email dan kata sandi |

Perlu diperhatikan selama keduanya mati:

- Alamat email pendaftar **tidak diverifikasi**, jadi email pelanggan belum tentu
  benar-benar miliknya. Nomor WhatsApp tetap jadi jalur konfirmasi utama.
- Kata sandi menjadi satu-satunya pelindung akun admin. Pakai kata sandi panjang
  yang tidak dipakai di layanan lain.
- Karena akun dibuat memakai kunci layanan, pendaftaran dibatasi
  **20 akun baru per jam** agar tidak bisa dipakai membuat akun massal.

Menyalakan kembali cukup mengubah nilainya menjadi `on` lalu menjalankan ulang
aplikasi — tidak ada kode yang perlu diubah. Perangkat autentikator yang sudah
terdaftar tetap tersimpan dan langsung berlaku lagi.

---

## Menyiapkan email verifikasi

> Bagian ini hanya berlaku bila `FITUR_OTP_PELANGGAN=on`. Secara bawaan
> verifikasi email dimatikan dan langkah di bawah tidak diperlukan.

Pendaftaran pelanggan memakai kode OTP enam angka yang dikirim lewat email.
Agar kodenya ikut terkirim, ubah templat email di Supabase
(**Authentication → Emails → Confirm signup**) menjadi:

```html
<h2>Verifikasi email Anda</h2>
<p>Kode verifikasi Razeline Komputer:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Kode berlaku selama 1 jam. Abaikan email ini bila Anda tidak mendaftar.</p>
<p>Atau klik tautan berikut: <a href="{{ .ConfirmationURL }}">verifikasi sekarang</a></p>
```

Tautan `{{ .ConfirmationURL }}` tetap berfungsi lewat `/auth/callback`, jadi
pelanggan bisa memakai kode maupun tautan.

Bawaan Supabase membatasi pengiriman email pada beberapa pesan per jam. Untuk
toko yang sudah berjalan, pasang SMTP sendiri di
**Project Settings → Authentication → SMTP Settings**.

---

## Deploy ke Vercel

1. Push repositori ini ke GitHub.
2. Di Vercel, pilih **Add New → Project**, lalu impor repositorinya.
   Framework akan terdeteksi otomatis sebagai Next.js.
3. Isi **Environment Variables** berikut untuk lingkungan Production
   (dan Preview bila perlu):

   | Nama | Nilai |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Alamat proyek Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci publik |
   | `SUPABASE_SERVICE_ROLE_KEY` | Kunci rahasia |
   | `NEXT_PUBLIC_SITE_URL` | Domain produksi, contoh `https://razelinekomputer.id` |

   `SUPABASE_DB_URL` tidak perlu diisi di Vercel karena hanya dipakai skrip
   migrasi lokal.

4. Tekan **Deploy**.
5. Setelah domain aktif, buka dasbor Supabase → **Authentication → URL
   Configuration**, lalu isi:
   - **Site URL**: domain produksi Anda
   - **Redirect URLs**: tambahkan `https://domain-anda/auth/callback`

6. Jalankan `npm run admin:buat` (dari komputer lokal, dengan `.env.local` yang
   menunjuk ke proyek Supabase produksi) untuk membuat akun admin pertama.

---

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membangun versi produksi |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | Memeriksa gaya penulisan kode |
| `npm run typecheck` | Memeriksa tipe TypeScript |
| `npm run db:setup` | Reset struktur database lalu isi data awal |
| `npm run db:reset` | Reset struktur database saja |
| `npm run db:seed` | Isi ulang data contoh saja |
| `npm run admin:buat` | Membuat atau mengangkat akun admin |
| `npm run admin:reset` | Menghapus pendaftaran 2FA dan/atau mengganti kata sandi admin |
| `npm run uji:keamanan` | Menguji kebijakan Row Level Security |

---

## Catatan perawatan

- **Foto produk & kategori.** Data contoh sengaja dibiarkan tanpa foto; yang
  tampil adalah blok warna rapi berisi nama, bukan gambar rusak. Unggah foto
  asli lewat **Admin → Produk → Ubah** dan **Admin → Kategori → Ubah**. Berkas
  disimpan di bucket Supabase Storage bernama `media` (folder `produk/`,
  `kategori/`, dan `banner/`), maksimal 5 MB per gambar.
- **Ukuran foto yang disarankan.** Kategori dan banner memakai foto mendatar
  (kategori sekitar 800 x 600 piksel, banner 1600 x 600 piksel). Foto produk
  paling rapi bila berbentuk persegi dengan latar polos.
- **Pengaturan toko.** Alamat, nomor WhatsApp, jam buka, minimum gratis ongkir,
  dan pengumuman di header semuanya diatur lewat **Admin → Pengaturan Toko**.
  Nomor WhatsApp di sanalah yang dipakai tombol konfirmasi pesanan.
- **Menghapus data contoh.** Setelah produk asli dimasukkan, produk contoh bisa
  dihapus lewat panel admin, atau dinonaktifkan agar riwayat pesanan tetap utuh.
- **Ulasan.** Hanya bisa ditulis pembeli yang pesanannya sudah berstatus
  *Selesai*. Admin dapat menyembunyikan atau menghapusnya lewat **Admin → Ulasan**.
