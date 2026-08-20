import Link from 'next/link';

import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { LencanaBayar, LencanaStatus } from '@/components/lencana-status';
import { SalinTeks } from '@/components/salin-teks';
import { ALUR_STATUS, LABEL_STATUS_PESANAN } from '@/lib/constants';
import { rupiah, tanggalJam } from '@/lib/format';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { PesananLengkap } from '@/lib/types';
import { tautanKonfirmasiWhatsApp } from '@/lib/whatsapp';

interface Props {
  pesanan: PesananLengkap;
  nomorWhatsAppToko: string;
  urlLacak: string;
}

export async function DetailPesanan({ pesanan, nomorWhatsAppToko, urlLacak }: Props) {
  const admin = createSupabaseAdminClient();
  const { data: metodeBayar } = pesanan.payment_method_id
    ? await admin
        .from('payment_methods')
        .select('name, type, account_name, account_number, instructions')
        .eq('id', pesanan.payment_method_id)
        .maybeSingle()
    : { data: null };

  const dibatalkan = pesanan.status === 'dibatalkan';
  const indeksAktif = ALUR_STATUS.indexOf(pesanan.status);

  const tautanWa = tautanKonfirmasiWhatsApp(nomorWhatsAppToko, pesanan, urlLacak);

  const alamatLengkap = [
    pesanan.shipping_address,
    pesanan.shipping_district,
    pesanan.shipping_city,
    pesanan.shipping_province,
    pesanan.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-start">
      <div className="space-y-5">
        {/* Ringkasan status */}
        <section className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-ink-500">Kode Pesanan</p>
              <p className="price text-lg font-bold tracking-wide">{pesanan.order_code}</p>
              <p className="mt-1 text-xs text-ink-500">
                Dibuat {tanggalJam(pesanan.created_at)} WIB
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LencanaStatus status={pesanan.status} />
              <LencanaBayar status={pesanan.payment_status} />
              <SalinTeks teks={pesanan.order_code} label="Salin kode" />
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-surface-2 px-3.5 py-3 text-sm text-ink-700">
            {LABEL_STATUS_PESANAN[pesanan.status].keterangan}
          </p>

          {pesanan.tracking_number && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Icon name="truk" size={16} className="text-brand-600" />
              <span className="text-ink-500">Nomor resi:</span>
              <strong className="price">{pesanan.tracking_number}</strong>
              <SalinTeks teks={pesanan.tracking_number} label="Salin resi" />
            </p>
          )}

          {pesanan.admin_note && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
              <strong>Catatan admin:</strong> {pesanan.admin_note}
            </p>
          )}
        </section>

        {/* Lini masa */}
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold">Perjalanan Pesanan</h2>

          {dibatalkan ? (
            <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
              <Icon name="peringatan" size={17} />
              Pesanan ini dibatalkan. Stok barang sudah dikembalikan ke toko.
            </p>
          ) : (
            <ol className="relative space-y-5 border-l-2 border-line pl-6">
              {ALUR_STATUS.map((status, indeks) => {
                const tercapai = indeks <= indeksAktif;
                const peristiwa = pesanan.order_status_events.find(
                  (item) => item.status === status,
                );
                return (
                  <li key={status} className="relative">
                    <span
                      className={`absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full border-2 ${
                        tercapai
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-line bg-white text-transparent'
                      }`}
                    >
                      <Icon name="centang" size={11} strokeWidth={3} />
                    </span>
                    <p
                      className={`text-sm font-semibold ${
                        tercapai ? 'text-ink-900' : 'text-ink-300'
                      }`}
                    >
                      {LABEL_STATUS_PESANAN[status].label}
                    </p>
                    {peristiwa ? (
                      <p className="mt-0.5 text-xs text-ink-500">
                        {tanggalJam(peristiwa.created_at)} WIB
                        {peristiwa.note ? ` — ${peristiwa.note}` : ''}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-ink-300">Belum berjalan</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Barang */}
        <section className="card p-5">
          <h2 className="mb-3 text-sm font-bold">Barang yang Dipesan</h2>
          <ul className="divide-y divide-line">
            {pesanan.order_items.map((item) => (
              <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  <GambarProduk
                    url={item.product_image}
                    nama={item.product_name}
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {item.product_slug ? (
                    <Link
                      href={`/produk/${item.product_slug}`}
                      className="line-clamp-2 text-sm font-medium hover:text-brand-600"
                    >
                      {item.product_name}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 text-sm font-medium">{item.product_name}</p>
                  )}
                  <p className="mt-0.5 text-xs text-ink-500">
                    {item.quantity} x {rupiah(item.unit_price)}
                  </p>
                </div>
                <p className="price shrink-0 text-sm font-semibold">{rupiah(item.subtotal)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Pengiriman */}
        <section className="card p-5">
          <h2 className="mb-3 text-sm font-bold">Alamat & Pengiriman</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-500">Penerima</dt>
              <dd className="mt-0.5 font-medium">
                {pesanan.shipping_recipient} — {pesanan.shipping_phone}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Layanan pengiriman</dt>
              <dd className="mt-0.5 font-medium">{pesanan.shipping_method_name}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-ink-500">Alamat lengkap</dt>
              <dd className="mt-0.5 leading-relaxed">{alamatLengkap}</dd>
            </div>
            {pesanan.shipping_notes && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-500">Catatan</dt>
                <dd className="mt-0.5">{pesanan.shipping_notes}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Pembayaran */}
        {metodeBayar && (
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold">Cara Pembayaran</h2>
            <p className="text-sm font-semibold">{metodeBayar.name}</p>
            {metodeBayar.account_number && metodeBayar.account_number !== '-' && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="price rounded-lg bg-surface-2 px-3 py-1.5 font-bold tracking-wide">
                  {metodeBayar.account_number}
                </span>
                <span className="text-ink-500">a.n. {metodeBayar.account_name}</span>
                <SalinTeks teks={metodeBayar.account_number} label="Salin nomor" />
              </p>
            )}
            {metodeBayar.instructions && (
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                {metodeBayar.instructions}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Rincian pembayaran */}
      <aside className="space-y-4 lg:sticky lg:top-32">
        <section className="card p-5">
          <h2 className="text-sm font-bold">Rincian Pembayaran</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Total harga barang</dt>
              <dd className="price font-medium">{rupiah(pesanan.subtotal)}</dd>
            </div>
            {Number(pesanan.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Potongan {pesanan.voucher_code ? `(${pesanan.voucher_code})` : ''}</dt>
                <dd className="price font-medium">-{rupiah(pesanan.discount_amount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-500">Ongkos kirim</dt>
              <dd className="price font-medium">
                {Number(pesanan.shipping_cost) === 0 ? (
                  <span className="text-emerald-700">Gratis</span>
                ) : (
                  rupiah(pesanan.shipping_cost)
                )}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm font-semibold">Total Tagihan</span>
            <span className="price text-xl font-bold text-brand-700">{rupiah(pesanan.total)}</span>
          </div>
          <p className="mt-2 text-xs text-ink-500">Dibayar via {pesanan.payment_method_name}</p>
        </section>

        {!dibatalkan && nomorWhatsAppToko && (
          <a
            href={tautanWa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg w-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Icon name="whatsapp" size={18} />
            Konfirmasi via WhatsApp
          </a>
        )}

        <div className="card p-5 text-sm">
          <h2 className="text-sm font-bold">Butuh bantuan?</h2>
          <p className="mt-1.5 leading-relaxed text-ink-500">
            Simpan kode pesanan Anda. Kode ini bisa dipakai kapan saja untuk mengecek status tanpa
            perlu login.
          </p>
          <Link href="/lacak" className="btn btn-outline btn-sm mt-3 w-full">
            Halaman Lacak Pesanan
          </Link>
        </div>
      </aside>
    </div>
  );
}
