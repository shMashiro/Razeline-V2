'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useRef, useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { simpanProduk, unggahGambar } from '@/lib/actions/admin-katalog';
import { rupiah, slugify } from '@/lib/format';
import type { Kategori, Merek, ProdukLengkap, StatusForm } from '@/lib/types';

interface Props {
  produk?: ProdukLengkap;
  kategori: Kategori[];
  merek: Merek[];
}

interface BarisSpek {
  id: number;
  nama: string;
  nilai: string;
}

let penghitungSpek = 0;
const spekBaru = (nama = '', nilai = ''): BarisSpek => ({ id: penghitungSpek++, nama, nilai });

export function FormProduk({ produk, kategori, merek }: Props) {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(simpanProduk, {});

  const [nama, setNama] = useState(produk?.name ?? '');
  const [slug, setSlug] = useState(produk?.slug ?? '');
  const [slugManual, setSlugManual] = useState(Boolean(produk));
  const [harga, setHarga] = useState(String(produk?.price ?? ''));

  const [spesifikasi, setSpesifikasi] = useState<BarisSpek[]>(() => {
    const isi = Object.entries(produk?.specs ?? {});
    return isi.length > 0 ? isi.map(([k, v]) => spekBaru(k, String(v))) : [spekBaru()];
  });

  const [gambar, setGambar] = useState<string[]>(
    () => produk?.product_images.map((item) => item.url) ?? [],
  );
  const [galatUnggah, setGalatUnggah] = useState<string | null>(null);
  const [mengunggah, mulaiUnggah] = useTransition();
  const inputBerkas = useRef<HTMLInputElement>(null);

  const ubahNama = (nilai: string) => {
    setNama(nilai);
    if (!slugManual) setSlug(slugify(nilai));
  };

  const unggah = (berkas: File) => {
    setGalatUnggah(null);
    mulaiUnggah(async () => {
      const data = new FormData();
      data.set('file', berkas);
      const hasil = await unggahGambar(data);
      if (hasil.ok) {
        setGambar((sebelumnya) => [...sebelumnya, hasil.url].slice(0, 8));
      } else {
        setGalatUnggah(hasil.galat);
      }
    });
  };

  const geserGambar = (indeks: number, arah: -1 | 1) => {
    setGambar((sebelumnya) => {
      const tujuan = indeks + arah;
      if (tujuan < 0 || tujuan >= sebelumnya.length) return sebelumnya;
      const salinan = [...sebelumnya];
      [salinan[indeks], salinan[tujuan]] = [salinan[tujuan]!, salinan[indeks]!];
      return salinan;
    });
  };

  return (
    <form action={aksi} className="space-y-5">
      {produk && <input type="hidden" name="id" value={produk.id} />}
      {gambar.map((url) => (
        <input key={url} type="hidden" name="image_url" value={url} />
      ))}

      <PesanForm galat={status.galat} info={status.info} />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          {/* Informasi utama */}
          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-bold">Informasi Produk</h2>

            <label>
              <span className="label">Nama produk</span>
              <input
                name="name"
                required
                maxLength={160}
                className="field"
                value={nama}
                onChange={(event) => ubahNama(event.target.value)}
                placeholder="ASUS Vivobook 14 Core i5-1335U"
              />
            </label>

            <label>
              <span className="label">Slug URL</span>
              <input
                name="slug"
                required
                maxLength={120}
                pattern="[a-z0-9-]+"
                className="field"
                value={slug}
                onChange={(event) => {
                  setSlugManual(true);
                  setSlug(event.target.value);
                }}
              />
              <span className="mt-1 block text-xs text-ink-500">
                Alamat halaman produk: /produk/{slug || 'nama-produk'}
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">
                  Kode SKU <span className="font-normal text-ink-300">(opsional)</span>
                </span>
                <input
                  name="sku"
                  maxLength={40}
                  className="field"
                  defaultValue={produk?.sku ?? ''}
                  placeholder="LP-001"
                />
              </label>
              <label>
                <span className="label">Kondisi barang</span>
                <select name="condition" className="field" defaultValue={produk?.condition ?? 'baru'}>
                  <option value="baru">Baru</option>
                  <option value="bekas">Bekas (second)</option>
                </select>
              </label>
            </div>

            <label>
              <span className="label">Deskripsi singkat</span>
              <input
                name="short_description"
                maxLength={200}
                className="field"
                defaultValue={produk?.short_description ?? ''}
                placeholder="Satu kalimat yang menjelaskan keunggulan utama produk."
              />
            </label>

            <label>
              <span className="label">Deskripsi lengkap</span>
              <textarea
                name="description"
                rows={7}
                maxLength={6000}
                className="field"
                defaultValue={produk?.description ?? ''}
                placeholder="Jelaskan produk dengan bahasa sederhana. Pisahkan paragraf dengan baris baru."
              />
            </label>
          </section>

          {/* Spesifikasi */}
          <section className="card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Spesifikasi</h2>
              <button
                type="button"
                onClick={() => setSpesifikasi((s) => [...s, spekBaru()])}
                className="btn btn-outline btn-sm"
              >
                <Icon name="tambah" size={14} />
                Tambah baris
              </button>
            </div>

            <ul className="space-y-2">
              {spesifikasi.map((baris, indeks) => (
                <li key={baris.id} className="flex gap-2">
                  <input
                    name="spec_key"
                    maxLength={40}
                    className="field w-2/5"
                    placeholder="Prosesor"
                    value={baris.nama}
                    onChange={(event) =>
                      setSpesifikasi((s) =>
                        s.map((item, i) =>
                          i === indeks ? { ...item, nama: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <input
                    name="spec_value"
                    maxLength={200}
                    className="field flex-1"
                    placeholder="Intel Core i5-1335U"
                    value={baris.nilai}
                    onChange={(event) =>
                      setSpesifikasi((s) =>
                        s.map((item, i) =>
                          i === indeks ? { ...item, nilai: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setSpesifikasi((s) => s.filter((_, i) => i !== indeks))}
                    className="shrink-0 rounded-lg px-2 text-ink-300 transition-colors hover:bg-rose-50 hover:text-promo"
                    aria-label="Hapus baris spesifikasi"
                  >
                    <Icon name="hapus" size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-500">
              Baris yang nama atau nilainya kosong akan diabaikan saat disimpan.
            </p>
          </section>

          {/* Foto */}
          <section className="card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Foto Produk</h2>
              <button
                type="button"
                onClick={() => inputBerkas.current?.click()}
                disabled={mengunggah || gambar.length >= 8}
                className="btn btn-outline btn-sm"
              >
                <Icon name="unggah" size={14} />
                {mengunggah ? 'Mengunggah...' : 'Unggah Foto'}
              </button>
              <input
                ref={inputBerkas}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(event) => {
                  const berkas = event.target.files?.[0];
                  if (berkas) unggah(berkas);
                  event.target.value = '';
                }}
              />
            </div>

            {galatUnggah && <PesanForm galat={galatUnggah} />}

            {gambar.length === 0 ? (
              <p className="rounded-lg bg-surface-2 px-4 py-8 text-center text-sm text-ink-500">
                Belum ada foto. Produk tanpa foto tetap tampil rapi dengan kotak inisial, tetapi
                foto asli jauh lebih meyakinkan pembeli.
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {gambar.map((url, indeks) => (
                  <li key={url} className="group relative">
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2">
                      <Image
                        src={url}
                        alt={`Foto ${indeks + 1}`}
                        fill
                        sizes="120px"
                        className="object-contain p-1.5"
                      />
                      {indeks === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Utama
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex justify-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => geserGambar(indeks, -1)}
                        disabled={indeks === 0}
                        className="rounded p-1 text-ink-500 hover:bg-surface-2 disabled:opacity-30"
                        aria-label="Geser ke kiri"
                      >
                        <Icon name="kiri" size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGambar((s) => s.filter((_, i) => i !== indeks))}
                        className="rounded p-1 text-promo hover:bg-rose-50"
                        aria-label="Hapus foto"
                      >
                        <Icon name="hapus" size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => geserGambar(indeks, 1)}
                        disabled={indeks === gambar.length - 1}
                        className="rounded p-1 text-ink-500 hover:bg-surface-2 disabled:opacity-30"
                        aria-label="Geser ke kanan"
                      >
                        <Icon name="kanan" size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Panel samping */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-bold">Harga &amp; Stok</h2>

            <label>
              <span className="label">Harga jual (Rp)</span>
              <input
                name="price"
                type="number"
                required
                min={0}
                step={1000}
                className="field"
                value={harga}
                onChange={(event) => setHarga(event.target.value)}
              />
              {Number(harga) > 0 && (
                <span className="mt-1 block text-xs text-ink-500">{rupiah(Number(harga))}</span>
              )}
            </label>

            <label>
              <span className="label">
                Harga coret <span className="font-normal text-ink-300">(opsional)</span>
              </span>
              <input
                name="compare_at_price"
                type="number"
                min={0}
                step={1000}
                className="field"
                defaultValue={produk?.compare_at_price ?? ''}
              />
              <span className="mt-1 block text-xs text-ink-500">
                Isi bila ingin menampilkan potongan harga.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="label">Stok</span>
                <input
                  name="stock"
                  type="number"
                  required
                  min={0}
                  className="field"
                  defaultValue={produk?.stock ?? 0}
                />
              </label>
              <label>
                <span className="label">Batas menipis</span>
                <input
                  name="low_stock_threshold"
                  type="number"
                  min={0}
                  className="field"
                  defaultValue={produk?.low_stock_threshold ?? 3}
                />
              </label>
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-bold">Penggolongan</h2>

            <label>
              <span className="label">Kategori</span>
              <select name="category_id" className="field" defaultValue={produk?.category_id ?? ''}>
                <option value="">— tanpa kategori —</option>
                {kategori.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Merek</span>
              <select name="brand_id" className="field" defaultValue={produk?.brand_id ?? ''}>
                <option value="">— tanpa merek —</option>
                {merek.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="label">Garansi (bulan)</span>
                <input
                  name="warranty_months"
                  type="number"
                  min={0}
                  max={120}
                  className="field"
                  defaultValue={produk?.warranty_months ?? 0}
                />
              </label>
              <label>
                <span className="label">Berat (gram)</span>
                <input
                  name="weight_grams"
                  type="number"
                  min={0}
                  className="field"
                  defaultValue={produk?.weight_grams ?? 1000}
                />
              </label>
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="text-sm font-bold">Tampilan di Toko</h2>

            <label className="flex items-center gap-2.5 text-sm">
              <input name="is_active" type="checkbox" defaultChecked={produk?.is_active ?? true} />
              Tampilkan produk di katalog
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                name="is_featured"
                type="checkbox"
                defaultChecked={produk?.is_featured ?? false}
              />
              Tandai sebagai produk unggulan
            </label>
            <p className="text-xs leading-relaxed text-ink-500">
              Produk unggulan muncul di baris teratas beranda.
            </p>
          </section>

          <div className="flex gap-2">
            <button type="submit" disabled={menunggu} className="btn btn-primary flex-1">
              {menunggu ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
            <Link href="/admin/produk" className="btn btn-outline">
              Batal
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
