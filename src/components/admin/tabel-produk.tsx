'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { aksiMassalProduk, type AksiMassal } from '@/lib/actions/admin-katalog';
import { angka, rupiah } from '@/lib/format';
import type { StatusForm } from '@/lib/types';

export interface BarisProdukAdmin {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  category: { name: string } | null;
  product_images: { url: string }[];
}

/** Konfirmasi yang ditampilkan sebelum tindakan massal dijalankan. */
const KONFIRMASI: Record<AksiMassal, (jumlah: number) => string | null> = {
  hapus: (n) =>
    `Hapus ${n} produk secara permanen?\n\nRiwayat pesanan lama tetap aman karena menyimpan salinan nama dan harga barang.`,
  'stok-habis': (n) => `Ubah stok ${n} produk menjadi 0?`,
  nonaktifkan: (n) => `Sembunyikan ${n} produk dari katalog?`,
  aktifkan: () => null,
};

export function TabelProdukAdmin({ produk }: { produk: BarisProdukAdmin[] }) {
  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [pesan, setPesan] = useState<StatusForm>({});
  const [menunggu, mulai] = useTransition();
  const kotakSemua = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const semuaId = produk.map((item) => item.id);
  const jumlahTerpilih = terpilih.size;
  const semuaTercentang = produk.length > 0 && jumlahTerpilih === produk.length;
  const sebagian = jumlahTerpilih > 0 && !semuaTercentang;

  // Kotak "pilih semua" ditampilkan setengah tercentang bila hanya sebagian.
  useEffect(() => {
    if (kotakSemua.current) kotakSemua.current.indeterminate = sebagian;
  }, [sebagian]);

  const alihkan = (id: string) => {
    setTerpilih((sebelumnya) => {
      const baru = new Set(sebelumnya);
      if (baru.has(id)) baru.delete(id);
      else baru.add(id);
      return baru;
    });
  };

  const alihkanSemua = () => {
    setTerpilih((sebelumnya) => (sebelumnya.size === produk.length ? new Set() : new Set(semuaId)));
  };

  const jalankan = (aksi: AksiMassal) => {
    const daftar = [...terpilih];
    const konfirmasi = KONFIRMASI[aksi](daftar.length);
    if (konfirmasi && !window.confirm(konfirmasi)) return;

    setPesan({});
    mulai(async () => {
      const hasil = await aksiMassalProduk(daftar, aksi);
      setPesan(hasil);
      if (hasil.info) {
        setTerpilih(new Set());
        router.refresh();
      }
    });
  };

  if (produk.length === 0) {
    return (
      <div className="card px-5 py-14 text-center text-sm text-ink-500">
        Tidak ada produk yang cocok dengan pencarian ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PesanForm galat={pesan.galat} info={pesan.info} />

      {/* Bilah tindakan, muncul begitu ada yang dipilih */}
      {jumlahTerpilih > 0 && (
        <div
          role="region"
          aria-label="Tindakan untuk produk terpilih"
          className="sticky top-20 z-20 flex flex-wrap items-center gap-2 rounded-xl2 border border-brand-200 bg-brand-50 px-4 py-3"
        >
          <p className="mr-auto text-sm font-semibold text-brand-800">
            {angka(jumlahTerpilih)} produk dipilih
          </p>

          <button
            type="button"
            disabled={menunggu}
            onClick={() => jalankan('stok-habis')}
            className="btn btn-outline btn-sm"
          >
            <Icon name="gudang" size={14} />
            Tandai Stok Habis
          </button>
          <button
            type="button"
            disabled={menunggu}
            onClick={() => jalankan('nonaktifkan')}
            className="btn btn-outline btn-sm"
          >
            <Icon name="mata" size={14} />
            Sembunyikan
          </button>
          <button
            type="button"
            disabled={menunggu}
            onClick={() => jalankan('aktifkan')}
            className="btn btn-outline btn-sm"
          >
            <Icon name="centang" size={14} />
            Tampilkan
          </button>
          <button
            type="button"
            disabled={menunggu}
            onClick={() => jalankan('hapus')}
            className="btn btn-sm border border-promo bg-white text-promo hover:bg-rose-50"
          >
            <Icon name="hapus" size={14} />
            Hapus
          </button>
          <button
            type="button"
            onClick={() => setTerpilih(new Set())}
            className="btn btn-ghost btn-sm"
          >
            Batal pilih
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="border-b bg-surface-2 text-left">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    ref={kotakSemua}
                    type="checkbox"
                    checked={semuaTercentang}
                    onChange={alihkanSemua}
                    aria-label="Pilih semua produk di halaman ini"
                  />
                </th>
                <th className="px-4 py-3 font-semibold text-ink-700">Produk</th>
                <th className="px-4 py-3 font-semibold text-ink-700">Kategori</th>
                <th className="px-4 py-3 font-semibold text-ink-700">Harga</th>
                <th className="px-4 py-3 font-semibold text-ink-700">Stok</th>
                <th className="px-4 py-3 font-semibold text-ink-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-ink-700">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {produk.map((item) => {
                const dipilih = terpilih.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className={dipilih ? 'bg-brand-50/60' : 'hover:bg-surface-2/60'}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={dipilih}
                        onChange={() => alihkan(item.id)}
                        aria-label={`Pilih ${item.name}`}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                          <GambarProduk
                            url={item.product_images?.[0]?.url}
                            nama={item.name}
                            sizes="44px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produk/${item.id}`}
                            className="line-clamp-1 font-medium hover:text-brand-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-ink-300">{item.sku ?? 'tanpa SKU'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-ink-700">{item.category?.name ?? '—'}</td>
                    <td className="price px-4 py-3 font-semibold">{rupiah(item.price)}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`price font-semibold ${
                          item.stock === 0
                            ? 'text-promo'
                            : item.stock <= item.low_stock_threshold
                              ? 'text-warn'
                              : 'text-ink-700'
                        }`}
                      >
                        {angka(item.stock)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-ink-500'
                          }`}
                        >
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {item.is_featured && (
                          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                            Unggulan
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/produk/${item.slug}`}
                          target="_blank"
                          className="btn btn-ghost btn-sm"
                          aria-label={`Lihat ${item.name} di toko`}
                        >
                          <Icon name="mata" size={14} />
                        </Link>
                        <Link href={`/admin/produk/${item.id}`} className="btn btn-ghost btn-sm">
                          <Icon name="pensil" size={14} />
                          Ubah
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
