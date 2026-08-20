import Link from 'next/link';

import { Icon, type NamaIkon } from '@/components/icon';
import { LencanaStatus } from '@/components/lencana-status';
import { angka, rupiah, tanggalJam } from '@/lib/format';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Pesanan, StatusPesanan } from '@/lib/types';

export const metadata = { title: 'Dasbor' };

interface Statistik {
  label: string;
  nilai: string;
  keterangan: string;
  ikon: NamaIkon;
  href: string;
}

export default async function DasborAdmin() {
  const admin = createSupabaseAdminClient();

  const awalBulan = new Date();
  awalBulan.setDate(1);
  awalBulan.setHours(0, 0, 0, 0);

  const [
    { count: perluDitangani },
    { count: produkAktif },
    { data: pesananBulanIni },
    { data: pesananTerbaru },
    { data: stokMenipis },
    { count: totalPelanggan },
  ] = await Promise.all([
    admin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['menunggu_konfirmasi', 'dikonfirmasi', 'diproses']),
    admin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    admin
      .from('orders')
      .select('total, status')
      .gte('created_at', awalBulan.toISOString())
      .neq('status', 'dibatalkan'),
    admin.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
    admin
      .from('products')
      .select('id, name, slug, stock, low_stock_threshold')
      .eq('is_active', true)
      .order('stock', { ascending: true })
      .limit(8),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const pendapatanBulanIni = (pesananBulanIni ?? []).reduce(
    (jumlah, baris) => jumlah + Number(baris.total),
    0,
  );

  const statistik: Statistik[] = [
    {
      label: 'Perlu Ditangani',
      nilai: angka(perluDitangani ?? 0),
      keterangan: 'Pesanan menunggu konfirmasi atau sedang diproses',
      ikon: 'paket',
      href: '/admin/pesanan?status=menunggu_konfirmasi',
    },
    {
      label: 'Pendapatan Bulan Ini',
      nilai: rupiah(pendapatanBulanIni),
      keterangan: `${angka((pesananBulanIni ?? []).length)} pesanan tercatat`,
      ikon: 'grafik',
      href: '/admin/pesanan',
    },
    {
      label: 'Produk Aktif',
      nilai: angka(produkAktif ?? 0),
      keterangan: 'Produk yang tampil di katalog',
      ikon: 'kotak',
      href: '/admin/produk',
    },
    {
      label: 'Pengguna Terdaftar',
      nilai: angka(totalPelanggan ?? 0),
      keterangan: 'Pelanggan dengan akun',
      ikon: 'orang',
      href: '/admin/pengguna',
    },
  ];

  const perluRestok = (stokMenipis ?? []).filter(
    (produk) => produk.stock <= produk.low_stock_threshold,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Dasbor</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Ringkasan kondisi toko hari ini beserta hal yang perlu segera ditindaklanjuti.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statistik.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="card block h-full p-4 transition-colors hover:border-brand-300"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {item.label}
                </p>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name={item.ikon} size={16} />
                </span>
              </div>
              <p className="price mt-2 text-xl font-bold">{item.nilai}</p>
              <p className="mt-1 text-xs text-ink-500">{item.keterangan}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h2 className="text-sm font-bold">Pesanan Terbaru</h2>
            <Link href="/admin/pesanan" className="text-xs font-semibold text-brand-600 hover:underline">
              Lihat semua
            </Link>
          </div>

          {(pesananTerbaru ?? []).length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-500">Belum ada pesanan masuk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead className="border-b bg-surface-2 text-left">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold text-ink-700">Kode</th>
                    <th className="px-4 py-2.5 font-semibold text-ink-700">Pelanggan</th>
                    <th className="px-4 py-2.5 font-semibold text-ink-700">Total</th>
                    <th className="px-4 py-2.5 font-semibold text-ink-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {((pesananTerbaru ?? []) as Pesanan[]).map((pesanan) => (
                    <tr key={pesanan.id} className="hover:bg-surface-2/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/pesanan/${pesanan.id}`}
                          className="price font-semibold text-brand-700 hover:underline"
                        >
                          {pesanan.order_code}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-300">
                          {tanggalJam(pesanan.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{pesanan.customer_name}</p>
                        <p className="text-xs text-ink-500">{pesanan.customer_phone}</p>
                      </td>
                      <td className="price px-4 py-3 font-semibold">{rupiah(pesanan.total)}</td>
                      <td className="px-4 py-3">
                        <LencanaStatus status={pesanan.status as StatusPesanan} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h2 className="text-sm font-bold">Stok Perlu Diisi</h2>
            <Link href="/admin/produk" className="text-xs font-semibold text-brand-600 hover:underline">
              Kelola produk
            </Link>
          </div>

          {perluRestok.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-500">
              Semua stok masih aman. Tidak ada yang perlu segera diisi.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {perluRestok.map((produk) => (
                <li key={produk.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link
                    href={`/admin/produk/${produk.id}`}
                    className="line-clamp-1 text-sm font-medium hover:text-brand-600"
                  >
                    {produk.name}
                  </Link>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                      produk.stock === 0
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {produk.stock === 0 ? 'Habis' : `Sisa ${produk.stock}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
