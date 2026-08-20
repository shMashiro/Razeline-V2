'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { useKeranjang } from '@/components/keranjang-provider';
import { segarkanKeranjang } from '@/lib/actions/keranjang';
import { rupiah } from '@/lib/format';

export function IsiKeranjang({ minimalGratisOngkir }: { minimalGratisOngkir: number }) {
  const { items, siap, subtotal, ubahJumlah, hapus, tambah } = useKeranjang();
  const [catatan, setCatatan] = useState<string[]>([]);
  const sudahDisegarkan = useRef(false);

  // Sekali saat halaman dibuka: samakan harga dan stok dengan data terbaru.
  useEffect(() => {
    if (!siap || sudahDisegarkan.current || items.length === 0) return;
    sudahDisegarkan.current = true;

    let dibatalkan = false;
    void (async () => {
      const terbaru = await segarkanKeranjang(items.map((item) => item.id));
      if (dibatalkan) return;

      const pesan: string[] = [];
      for (const baris of items) {
        const data = terbaru.find((produk) => produk.id === baris.id);

        if (!data || !data.aktif) {
          pesan.push(`"${baris.name}" sudah tidak dijual dan dikeluarkan dari keranjang.`);
          hapus(baris.id);
          continue;
        }
        if (data.stock === 0) {
          pesan.push(`"${data.name}" stoknya habis dan dikeluarkan dari keranjang.`);
          hapus(baris.id);
          continue;
        }
        if (data.price !== baris.price) {
          pesan.push(
            `Harga "${data.name}" berubah dari ${rupiah(baris.price)} menjadi ${rupiah(data.price)}.`,
          );
        }
        if (data.stock < baris.quantity) {
          pesan.push(`Stok "${data.name}" tinggal ${data.stock}, jumlah pesanan disesuaikan.`);
        }

        tambah(
          {
            id: data.id,
            slug: data.slug,
            name: data.name,
            price: data.price,
            image: data.image,
            stock: data.stock,
          },
          0,
        );
        ubahJumlah(data.id, Math.min(baris.quantity, data.stock));
      }
      setCatatan(pesan);
    })();

    return () => {
      dibatalkan = true;
    };
  }, [siap, items, hapus, tambah, ubahJumlah]);

  if (!siap) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl2" />
          ))}
        </div>
        <div className="skeleton h-56 rounded-xl2" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-ink-300">
          <Icon name="keranjang" size={30} />
        </span>
        <h2 className="text-base font-bold">Keranjang Anda masih kosong</h2>
        <p className="max-w-sm text-sm text-ink-500">
          Silakan pilih produk terlebih dahulu. Semua barang di toko kami bergaransi dan bisa
          dikonsultasikan lebih dulu dengan teknisi.
        </p>
        <Link href="/katalog" className="btn btn-primary mt-1">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  const kurangGratisOngkir = minimalGratisOngkir > 0 ? minimalGratisOngkir - subtotal : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="space-y-3">
        {catatan.length > 0 && (
          <div className="rounded-xl2 border border-amber-200 bg-amber-50 p-4" role="status">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <Icon name="info" size={16} />
              Ada pembaruan pada keranjang Anda
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800">
              {catatan.map((baris) => (
                <li key={baris}>{baris}</li>
              ))}
            </ul>
          </div>
        )}

        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="card flex gap-4 p-3 sm:p-4">
              <Link
                href={`/produk/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2"
              >
                <GambarProduk
                  url={item.image}
                  nama={item.name}
                  sizes="96px"
                  className="object-contain p-2"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/produk/${item.slug}`}
                    className="line-clamp-2 text-sm font-medium hover:text-brand-600"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => hapus(item.id)}
                    className="shrink-0 rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-rose-50 hover:text-promo"
                    aria-label={`Hapus ${item.name} dari keranjang`}
                  >
                    <Icon name="hapus" size={17} />
                  </button>
                </div>

                <p className="price text-sm font-bold">{rupiah(item.price)}</p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-lg border border-line">
                    <button
                      type="button"
                      onClick={() => ubahJumlah(item.id, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center text-ink-700 transition-colors hover:bg-surface-2"
                      aria-label="Kurangi jumlah"
                    >
                      <Icon name="kurang" size={14} />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => ubahJumlah(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="grid h-8 w-8 place-items-center text-ink-700 transition-colors hover:bg-surface-2 disabled:text-ink-300"
                      aria-label="Tambah jumlah"
                    >
                      <Icon name="tambah" size={14} />
                    </button>
                  </div>

                  <p className="price text-sm font-bold text-ink-900">
                    {rupiah(item.price * item.quantity)}
                  </p>
                </div>

                {item.quantity >= item.stock && (
                  <p className="text-xs text-warn">Jumlah maksimal sesuai stok tersedia.</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Link href="/katalog" className="btn btn-ghost btn-sm">
          <Icon name="kiri" size={15} />
          Lanjut belanja
        </Link>
      </div>

      <aside className="card sticky top-32 p-5">
        <h2 className="text-sm font-bold">Ringkasan Belanja</h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Total harga barang</dt>
            <dd className="price font-semibold">{rupiah(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-500">
            <dt>Ongkos kirim</dt>
            <dd>Dihitung saat checkout</dd>
          </div>
        </dl>

        {minimalGratisOngkir > 0 && (
          <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2.5 text-xs leading-relaxed text-brand-800">
            {kurangGratisOngkir > 0 ? (
              <>
                Belanja <strong className="price">{rupiah(kurangGratisOngkir)}</strong> lagi untuk
                dapat gratis ongkir.
              </>
            ) : (
              <>Selamat, belanja Anda sudah memenuhi syarat gratis ongkir.</>
            )}
          </p>
        )}

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold">Subtotal</span>
          <span className="price text-lg font-bold">{rupiah(subtotal)}</span>
        </div>

        <Link href="/checkout" className="btn btn-primary btn-lg mt-4 w-full">
          Lanjut ke Checkout
        </Link>
        <p className="mt-3 text-center text-xs text-ink-500">
          Bisa checkout tanpa membuat akun. Konfirmasi akhir dilakukan lewat WhatsApp.
        </p>
      </aside>
    </div>
  );
}
