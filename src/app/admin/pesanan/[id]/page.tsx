import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FormStatusPesanan } from '@/components/admin/form-status-pesanan';
import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { LencanaBayar, LencanaStatus } from '@/components/lencana-status';
import { SalinTeks } from '@/components/salin-teks';
import { rupiah, tanggalJam } from '@/lib/format';
import { ambilPengaturanToko } from '@/lib/queries';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { PesananLengkap } from '@/lib/types';
import { tautanWhatsApp } from '@/lib/whatsapp';

export const metadata = { title: 'Detail Pesanan' };

export default async function HalamanAdminDetailPesanan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = createSupabaseAdminClient();
  const [{ data }, pengaturan] = await Promise.all([
    admin
      .from('orders')
      .select('*, order_items(*), order_status_events(id, status, note, created_at)')
      .eq('id', id)
      .maybeSingle(),
    ambilPengaturanToko(),
  ]);

  if (!data) notFound();
  const pesanan = data as unknown as PesananLengkap;

  const riwayat = [...(pesanan.order_status_events ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const alamat = [
    pesanan.shipping_address,
    pesanan.shipping_district,
    pesanan.shipping_city,
    pesanan.shipping_province,
    pesanan.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/pesanan"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600"
        >
          <Icon name="kiri" size={15} />
          Kembali ke daftar pesanan
        </Link>
      </div>

      <header className="card flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs text-ink-500">Kode Pesanan</p>
          <h1 className="price text-xl font-bold tracking-wide">{pesanan.order_code}</h1>
          <p className="mt-1 text-xs text-ink-500">
            Dibuat {tanggalJam(pesanan.created_at)} WIB · Diperbarui{' '}
            {tanggalJam(pesanan.updated_at)} WIB
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LencanaStatus status={pesanan.status} />
          <LencanaBayar status={pesanan.payment_status} />
          <Link href={`/pesanan/${pesanan.order_code}`} className="btn btn-outline btn-sm">
            <Icon name="mata" size={14} />
            Tampilan pelanggan
          </Link>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold">Barang Dipesan</h2>
            <ul className="divide-y divide-line">
              {pesanan.order_items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    <GambarProduk
                      url={item.product_image}
                      nama={item.product_name}
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.product_name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {item.quantity} x {rupiah(item.unit_price)}
                    </p>
                  </div>
                  <p className="price shrink-0 text-sm font-semibold">{rupiah(item.subtotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="price">{rupiah(pesanan.subtotal)}</dd>
              </div>
              {Number(pesanan.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Potongan {pesanan.voucher_code ? `(${pesanan.voucher_code})` : ''}</dt>
                  <dd className="price">-{rupiah(pesanan.discount_amount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-500">Ongkos kirim</dt>
                <dd className="price">{rupiah(pesanan.shipping_cost)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="price text-brand-700">{rupiah(pesanan.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold">Data Pelanggan &amp; Pengiriman</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-500">Pemesan</dt>
                <dd className="mt-0.5 font-medium">{pesanan.customer_name}</dd>
                <dd className="text-ink-500">{pesanan.customer_phone}</dd>
                {pesanan.customer_email && (
                  <dd className="text-ink-500">{pesanan.customer_email}</dd>
                )}
              </div>
              <div>
                <dt className="text-xs text-ink-500">Penerima</dt>
                <dd className="mt-0.5 font-medium">{pesanan.shipping_recipient}</dd>
                <dd className="text-ink-500">{pesanan.shipping_phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-500">Alamat</dt>
                <dd className="mt-0.5 leading-relaxed">{alamat}</dd>
              </div>
              {pesanan.shipping_notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-ink-500">Catatan pelanggan</dt>
                  <dd className="mt-0.5">{pesanan.shipping_notes}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-ink-500">Pengiriman</dt>
                <dd className="mt-0.5">{pesanan.shipping_method_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500">Pembayaran</dt>
                <dd className="mt-0.5">{pesanan.payment_method_name}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={tautanWhatsApp(
                  pesanan.customer_phone,
                  `Halo ${pesanan.customer_name}, ini admin ${pengaturan.store_name}. Kami ingin mengonfirmasi pesanan ${pesanan.order_code}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Icon name="whatsapp" size={15} />
                Hubungi Pelanggan
              </a>
              <SalinTeks teks={alamat} label="Salin alamat" />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold">Riwayat Perubahan</h2>
            <ul className="space-y-2.5 text-sm">
              {riwayat.map((peristiwa) => (
                <li key={peristiwa.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                  <div>
                    <LencanaStatus status={peristiwa.status} />
                    <p className="mt-1 text-xs text-ink-500">
                      {tanggalJam(peristiwa.created_at)} WIB
                      {peristiwa.note ? ` — ${peristiwa.note}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="card sticky top-24 p-5">
          <h2 className="mb-4 text-sm font-bold">Perbarui Status</h2>
          <FormStatusPesanan pesanan={pesanan} />
        </aside>
      </div>
    </div>
  );
}
