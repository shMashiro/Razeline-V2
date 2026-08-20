import { AksiPengguna } from '@/components/admin/aksi-pengguna';
import { Icon } from '@/components/icon';
import { Paginasi } from '@/components/paginasi';
import { ambilPengguna } from '@/lib/auth';
import { angka, tanggal } from '@/lib/format';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Profil } from '@/lib/types';
import { bacaAngka, bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata = { title: 'Pengguna' };

const PER_HALAMAN = 25;

export default async function HalamanAdminPengguna({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const q = bacaParam(params, 'q');
  const halaman = bacaAngka(params, 'hal', { min: 1, max: 500 }) ?? 1;

  const admin = createSupabaseAdminClient();
  let query = admin.from('profiles').select('*', { count: 'exact' });

  if (q) {
    const aman = q.replace(/[%,()]/g, ' ').trim();
    query = query.or(`full_name.ilike.%${aman}%,email.ilike.%${aman}%,phone.ilike.%${aman}%`);
  }

  const dari = (halaman - 1) * PER_HALAMAN;
  const [{ data, count }, penggunaSaatIni] = await Promise.all([
    query
      .order('role', { ascending: true })
      .order('created_at', { ascending: false })
      .range(dari, dari + PER_HALAMAN - 1),
    ambilPengguna(),
  ]);

  const daftar = (data ?? []) as Profil[];
  const totalHalaman = Math.max(1, Math.ceil((count ?? 0) / PER_HALAMAN));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Pengguna</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          {angka(count ?? 0)} akun terdaftar. Peran admin memberi akses penuh ke seluruh panel ini.
        </p>
      </header>

      <form action="/admin/pengguna" method="get" role="search" className="card flex gap-2 p-4">
        <div className="relative flex-1">
          <Icon
            name="cari"
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
          />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Cari nama, email, atau nomor HP"
            className="field pl-10"
            maxLength={60}
          />
        </div>
        <button type="submit" className="btn btn-primary shrink-0">
          Cari
        </button>
      </form>

      <div className="card overflow-hidden">
        {daftar.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-ink-500">
            Tidak ada pengguna yang cocok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="border-b bg-surface-2 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink-700">Nama</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Kontak</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Bergabung</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Peran</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-700">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {daftar.map((profil) => (
                  <tr key={profil.id} className="hover:bg-surface-2/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                          {(profil.full_name || profil.email || 'P').charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium">{profil.full_name || 'Tanpa nama'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      <p>{profil.email ?? '—'}</p>
                      <p className="text-xs text-ink-500">{profil.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{tanggal(profil.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          profil.role === 'admin'
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-slate-100 text-ink-500'
                        }`}
                      >
                        {profil.role === 'admin' ? 'Admin' : 'Pelanggan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <AksiPengguna
                          id={profil.id}
                          nama={profil.full_name || profil.email || 'pengguna'}
                          peran={profil.role}
                          diriSendiri={penggunaSaatIni?.id === profil.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Paginasi
        basePath="/admin/pengguna"
        params={params}
        halaman={halaman}
        totalHalaman={totalHalaman}
      />
    </div>
  );
}
