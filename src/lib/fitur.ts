/**
 * Sakelar fitur keamanan tambahan.
 *
 * Keduanya dimatikan secara bawaan. Untuk menyalakan, isi variabel
 * lingkungan berikut dengan nilai `on`, lalu jalankan ulang aplikasi:
 *
 *   FITUR_OTP_PELANGGAN=on   → pendaftaran pelanggan wajib verifikasi email
 *   FITUR_2FA_ADMIN=on       → admin wajib memakai aplikasi autentikator
 *
 * Ditulis sebagai sakelar, bukan dihapus, supaya bisa dinyalakan kembali
 * tanpa perlu mengubah kode.
 */

function menyala(nilai: string | undefined): boolean {
  return nilai?.trim().toLowerCase() === 'on';
}

/** Verifikasi email lewat kode OTP saat pelanggan mendaftar. */
export const OTP_PELANGGAN_AKTIF = menyala(process.env.FITUR_OTP_PELANGGAN);

/** Autentikasi dua langkah (TOTP) wajib untuk akun admin. */
export const DUA_LANGKAH_ADMIN_AKTIF = menyala(process.env.FITUR_2FA_ADMIN);
