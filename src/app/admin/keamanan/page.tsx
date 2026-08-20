import { PengaturanDuaLangkah } from '@/components/admin/pengaturan-dua-langkah';
import { Icon } from '@/components/icon';
import { statusDuaLangkah } from '@/lib/auth';
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

      {wajib && !keamanan.aktif && (
        <div className="flex items-start gap-2.5 rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Icon name="peringatan" size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Aktifkan dulu verifikasi dua langkah</p>
            <p className="mt-0.5 leading-relaxed">
              Demi keamanan data toko dan pelanggan, seluruh halaman admin lain baru bisa dibuka
              setelah verifikasi dua langkah aktif.
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
