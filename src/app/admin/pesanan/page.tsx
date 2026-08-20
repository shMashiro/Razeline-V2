import Link from 'next/link';

import { Icon } from '@/components/icon';
import { LencanaBayar, LencanaStatus } from '@/components/lencana-status';
import { Paginasi } from '@/components/paginasi';
import { LABEL_STATUS_PESANAN } from '@/lib/constants';
import { angka, rupiah, tanggalJam } from '@/lib/format';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Pesanan } from '@/lib/types';
import { bacaAngka, bacaParam, buatUrl, type ParamPencarian } from '@/lib/url';

export const metadata = { title: 'Pesanan' };

const PER_HALAMAN = 20;

export default async function HalamanAdminPesanan({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const status = bacaParam(params, 'status');
  const q = bacaParam(params, 'q');
  const halaman = bacaAngka(params, 'hal', { min: 1, max: 500 }) ?? 1;

  const admin = createSupabaseAdminClient();
  let query = admin.from('orders').select('*', { count: 'exact' });

  if (status && status in LABEL_STATUS_PESANAN) {
    query = query.eq('status', status);
  }
  if (q) {
    const aman = q.replace(/[%,()]/g, ' ').trim();
    query = query.or(
      `order_code.ilike.%${aman}%,customer_name.ilike.%${aman}%,customer_phone.ilike.%${aman}%`,
    );
  }

  const dari = (halaman - 1) * PER_HALAMAN;
  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(dari, dari + PER_HALAMAN - 1);

  const pesanan = (data ?? []) as Pesanan[];
  const totalHalaman = Math.max(1, Math.ceil((count ?? 0) / PER_HALAMAN));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Pesanan</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          {angka(count ?? 0)} pesanan tercatat. Klik kode pesanan untuk memperbarui statusnya.
        </p>
      </header>

      <div className="card space-y-3 p-4">
        <form action="/admin/pesanan" method="get" role="search" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
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
              placeholder="Cari kode pesanan, nama, atau nomor HP"
              className="field pl-10"
              maxLength={60}
            />
          </div>
          <button type="submit" className="btn btn-primary shrink-0">
            Cari
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buatUrl('/admin/pesanan', params, { status: null })}
            className={`chip ${!status ? 'chip-active' : ''}`}
          >
            Semua
          </Link>
          {Object.entries(LABEL_STATUS_PESANAN).map(([kunci, info]) => (
            <Link
              key={kunci}
              href={buatUrl('/admin/pesanan', params, { status: kunci })}
              className={`chip ${status === kunci ? 'chip-active' : ''}`}
            >
              {info.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {pesanan.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-ink-500">
            Tidak ada pesanan yang cocok dengan filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="border-b bg-surface-2 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink-700">Kode &amp; Waktu</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Pelanggan</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Pengiriman</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Total</th>
                  <th className="px-4 py-3 font-semibold text-ink-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pesanan.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-2/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pesanan/${item.id}`}
                        className="price font-semibold text-brand-700 hover:underline"
                      >
                        {item.order_code}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-300">{tanggalJam(item.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.customer_name}</p>
                      <p className="text-xs text-ink-500">{item.customer_phone}</p>
                      {!item.user_id && (
                        <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                          Tanpa akun
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-700">
                      <p>{item.shipping_method_name}</p>
                      <p className="text-xs text-ink-500">{item.shipping_city}</p>
                    </td>
                    <td className="price px-4 py-3 font-semibold">{rupiah(item.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <LencanaStatus status={item.status} />
                        <LencanaBayar status={item.payment_status} />
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
        basePath="/admin/pesanan"
        params={params}
        halaman={halaman}
        totalHalaman={totalHalaman}
      />
    </div>
  );
}
