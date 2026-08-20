import { PengaturanDuaLangkah } from '@/components/admin/pengaturan-dua-langkah';
import { Icon } from '@/components/icon';
import { statusDuaLangkah } from '@/lib/auth';
import { DUA_LANGKAH_ADMIN_AKTIF } from '@/lib/fitur';
import { bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata = { title: 'Keamanan' };

export default async function HalamanAdminKeamanan({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const wajib = bacaParam(params, 'wajib') === '1';
  const keamanan = await statusDuaLangkah();

  return (
    <div className="max-w-3xl space-y-5">
      <header>
        <h1 className="text-xl font-bold">Keamanan Akun</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Pengaturan perlindungan tambahan untuk akun admin Anda.
        </p>
      </header>

      {!DUA_LANGKAH_ADMIN_AKTIF ? (
        <>
          <div className="card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <Icon name="info" size={18} className="text-ink-500" />
              Verifikasi dua langkah sedang dimatikan
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              Saat ini masuk ke panel admin hanya memerlukan email dan kata sandi. Untuk
              menyalakannya kembali, isi variabel lingkungan berikut lalu jalankan ulang aplikasi:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-2 px-3.5 py-3 text-xs text-ink-700">
              FITUR_2FA_ADMIN=on
            </pre>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              Selama dimatikan, kekuatan kata sandi menjadi satu-satunya pelindung akun admin.
              Gunakan kata sandi yang panjang dan tidak dipakai di layanan lain.
            </p>
          </div>

          {keamanan.aktif && (
            <div className="card p-5">
              <p className="text-sm font-semibold">Perangkat autentikator yang masih terdaftar</p>
              <p className="mt-1 text-sm text-ink-500">
                Perangkat ini tidak lagi diminta saat masuk. Anda boleh menghapusnya, atau
                membiarkannya agar langsung berfungsi bila fiturnya dinyalakan lagi.
              </p>
              <div className="mt-4">
                <PengaturanDuaLangkah
                  aktif
                  faktor={keamanan.faktor.map((item) => ({
                    id: item.id,
                    friendly_name: item.friendly_name ?? null,
                  }))}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {wajib && !keamanan.aktif && (
            <div className="flex items-start gap-2.5 rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <Icon name="peringatan" size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Aktifkan dulu verifikasi dua langkah</p>
                <p className="mt-0.5 leading-relaxed">
                  Demi keamanan data toko dan pelanggan, seluruh halaman admin lain baru bisa
                  dibuka setelah verifikasi dua langkah aktif.
                </p>
              </div>
            </div>
          )}

          <PengaturanDuaLangkah
            aktif={keamanan.aktif}
            faktor={keamanan.faktor.map((item) => ({
              id: item.id,
              friendly_name: item.friendly_name ?? null,
            }))}
          />
        </>
      )}

      <section className="card p-5">
        <h2 className="text-sm font-bold">Kebiasaan aman yang disarankan</h2>
        <ul className="mt-3 space-y-2.5 text-sm text-ink-700">
          {[
            'Gunakan kata sandi khusus untuk akun admin, jangan sama dengan akun lain.',
            'Jangan membuka panel admin di komputer umum atau warnet.',
            'Cabut peran admin bagi karyawan yang sudah tidak bekerja di toko.',
            'Periksa daftar pesanan secara berkala untuk mendeteksi pesanan mencurigakan.',
          ].map((saran) => (
            <li key={saran} className="flex gap-2.5">
              <Icon name="centang" size={16} className="mt-0.5 shrink-0 text-brand-600" />
              {saran}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
