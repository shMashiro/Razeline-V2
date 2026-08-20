'use client';

import Image from 'next/image';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { unggahGambar } from '@/lib/actions/admin-katalog';
import { rupiah, tanggal } from '@/lib/format';
import type { StatusForm } from '@/lib/types';

export interface KolomTabel {
  kunci: string;
  judul: string;
  format?: 'teks' | 'rupiah' | 'boolean' | 'tanggal' | 'angka' | 'gambar';
  utama?: boolean;
}

export interface BidangForm {
  nama: string;
  label: string;
  tipe: 'teks' | 'angka' | 'area' | 'pilih' | 'centang' | 'tanggal' | 'url' | 'gambar';
  wajib?: boolean;
  pilihan?: { nilai: string; label: string }[];
  bantuan?: string;
  lebar?: 'penuh' | 'separuh';
  bawaan?: string | number | boolean;
  placeholder?: string;
  /** Khusus tipe gambar: perbandingan sisi kotak pratinjau. */
  rasio?: 'persegi' | 'lebar';
  /** Khusus tipe gambar: folder tujuan di penyimpanan. */
  folder?: 'produk' | 'kategori' | 'banner';
}

type Baris = Record<string, unknown>;

interface Props {
  judul: string;
  keterangan?: string;
  labelTambah: string;
  daftar: Baris[];
  kolom: KolomTabel[];
  bidang: BidangForm[];
  aksiSimpan: (sebelumnya: StatusForm, formData: FormData) => Promise<StatusForm>;
  aksiHapus?: (id: string) => Promise<StatusForm>;
}

function tampilkan(nilai: unknown, format: KolomTabel['format']): React.ReactNode {
  if (nilai === null || nilai === undefined || nilai === '') {
    return format === 'gambar' ? (
      <span className="grid h-10 w-14 place-items-center rounded border border-line bg-surface-2 text-ink-300">
        <Icon name="gambar" size={15} />
      </span>
    ) : (
      '—'
    );
  }

  switch (format) {
    case 'gambar':
      return (
        <span className="relative block h-10 w-14 overflow-hidden rounded border border-line bg-surface-2">
          <Image src={String(nilai)} alt="" fill sizes="56px" className="object-cover" />
        </span>
      );
    case 'rupiah':
      return <span className="price">{rupiah(Number(nilai))}</span>;
    case 'angka':
      return <span className="price">{Number(nilai).toLocaleString('id-ID')}</span>;
    case 'tanggal':
      return tanggal(String(nilai));
    case 'boolean':
      return nilai ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
          <Icon name="centang" size={12} />
          Aktif
        </span>
      ) : (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-ink-500">
          Nonaktif
        </span>
      );
    default:
      return String(nilai);
  }
}

/** Bidang unggah gambar: menyimpan URL hasil unggahan pada input tersembunyi. */
function BidangGambar({
  nama,
  label,
  bantuan,
  rasio = 'lebar',
  urlAwal,
  folder,
}: {
  nama: string;
  label: string;
  bantuan?: string;
  rasio?: 'persegi' | 'lebar';
  urlAwal: string;
  folder?: string;
}) {
  const [url, setUrl] = useState(urlAwal);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengunggah, mulaiUnggah] = useTransition();
  const inputBerkas = useRef<HTMLInputElement>(null);

  const unggah = (berkas: File) => {
    setGalat(null);
    mulaiUnggah(async () => {
      const data = new FormData();
      data.set('file', berkas);
      if (folder) data.set('folder', folder);
      const hasil = await unggahGambar(data);
      if (hasil.ok) setUrl(hasil.url);
      else setGalat(hasil.galat);
    });
  };

  return (
    <div>
      <span className="label">
        {label} <span className="font-normal text-ink-300">(opsional)</span>
      </span>
      <input type="hidden" name={nama} value={url} />

      <div className="flex flex-wrap items-start gap-3">
        <div
          className={`relative shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2 ${
            rasio === 'persegi' ? 'h-24 w-24' : 'h-24 w-40'
          }`}
        >
          {url ? (
            <Image src={url} alt={label} fill sizes="160px" className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-ink-300">
              <Icon name="gambar" size={24} />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputBerkas.current?.click()}
              disabled={mengunggah}
              className="btn btn-outline btn-sm"
            >
              <Icon name="unggah" size={14} />
              {mengunggah ? 'Mengunggah...' : url ? 'Ganti Foto' : 'Unggah Foto'}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="btn btn-ghost btn-sm text-promo hover:bg-rose-50"
              >
                <Icon name="hapus" size={14} />
                Hapus
              </button>
            )}
          </div>
          {bantuan && <span className="text-xs text-ink-500">{bantuan}</span>}
          {galat && <span className="text-xs text-promo">{galat}</span>}
        </div>
      </div>

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
  );
}

/** Nilai awal untuk sebuah bidang, diambil dari baris yang sedang diubah. */
function nilaiAwal(bidang: BidangForm, baris: Baris | null): string | number | boolean {
  const isi = baris?.[bidang.nama];
  if (isi === null || isi === undefined) return bidang.bawaan ?? (bidang.tipe === 'centang' ? false : '');
  if (bidang.tipe === 'tanggal' && typeof isi === 'string') return isi.slice(0, 10);
  if (bidang.tipe === 'centang') return Boolean(isi);
  return String(isi);
}

/**
 * Pengelola data sederhana: daftar + formulir tambah/ubah dalam satu halaman.
 * Dipakai ulang untuk kategori, merek, voucher, banner, pengiriman, dan pembayaran.
 */
export function KelolaEntitas({
  judul,
  keterangan,
  labelTambah,
  daftar,
  kolom,
  bidang,
  aksiSimpan,
  aksiHapus,
}: Props) {
  const [sedangDiubah, setSedangDiubah] = useState<Baris | 'baru' | null>(null);
  const [pesanHapus, setPesanHapus] = useState<StatusForm>({});
  const [menungguHapus, mulaiHapus] = useTransition();
  const wadahForm = useRef<HTMLDivElement>(null);

  // Formulir ditutup langsung setelah aksi simpan berhasil.
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(
    async (sebelumnya, formData) => {
      const hasil = await aksiSimpan(sebelumnya, formData);
      if (hasil.info) setSedangDiubah(null);
      return hasil;
    },
    {},
  );

  useEffect(() => {
    if (sedangDiubah) wadahForm.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [sedangDiubah]);

  const baris = sedangDiubah === 'baru' ? null : sedangDiubah;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{judul}</h1>
          {keterangan && <p className="mt-0.5 text-sm text-ink-500">{keterangan}</p>}
        </div>
        {!sedangDiubah && (
          <button type="button" onClick={() => setSedangDiubah('baru')} className="btn btn-primary btn-sm">
            <Icon name="tambah" size={16} />
            {labelTambah}
          </button>
        )}
      </header>

      <PesanForm galat={status.galat ?? pesanHapus.galat} info={status.info ?? pesanHapus.info} />

      <div ref={wadahForm}>
        {sedangDiubah && (
          // Kunci baris memaksa formulir dibuat ulang saat berpindah data,
          // supaya seluruh nilai awal ikut tersegarkan.
          <form key={baris ? String(baris.id) : 'baru'} action={aksi} className="card space-y-4 p-5">
            <h2 className="text-sm font-bold">{baris ? `Ubah ${judul}` : labelTambah}</h2>
            {baris && <input type="hidden" name="id" value={String(baris.id)} />}

            <div className="grid gap-4 sm:grid-cols-2">
              {bidang.map((item) => {
                const awal = nilaiAwal(item, baris);
                const kelasLebar = item.lebar === 'penuh' ? 'sm:col-span-2' : '';

                if (item.tipe === 'gambar') {
                  return (
                    <div key={item.nama} className={kelasLebar}>
                      <BidangGambar
                        nama={item.nama}
                        label={item.label}
                        bantuan={item.bantuan}
                        rasio={item.rasio}
                        urlAwal={String(awal)}
                        folder={item.folder}
                      />
                    </div>
                  );
                }

                if (item.tipe === 'centang') {
                  return (
                    <label
                      key={item.nama}
                      className={`flex items-center gap-2.5 self-end pb-2 text-sm ${kelasLebar}`}
                    >
                      <input
                        type="checkbox"
                        name={item.nama}
                        defaultChecked={Boolean(awal)}
                      />
                      {item.label}
                    </label>
                  );
                }

                return (
                  <label key={item.nama} className={kelasLebar}>
                    <span className="label">
                      {item.label}
                      {!item.wajib && <span className="font-normal text-ink-300"> (opsional)</span>}
                    </span>

                    {item.tipe === 'area' ? (
                      <textarea
                        name={item.nama}
                        required={item.wajib}
                        rows={3}
                        className="field"
                        placeholder={item.placeholder}
                        defaultValue={String(awal)}
                      />
                    ) : item.tipe === 'pilih' ? (
                      <select
                        name={item.nama}
                        required={item.wajib}
                        className="field"
                        defaultValue={String(awal)}
                      >
                        {!item.wajib && <option value="">— tidak dipilih —</option>}
                        {item.pilihan?.map((pilihan) => (
                          <option key={pilihan.nilai} value={pilihan.nilai}>
                            {pilihan.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={item.nama}
                        type={
                          item.tipe === 'angka'
                            ? 'number'
                            : item.tipe === 'tanggal'
                              ? 'date'
                              : item.tipe === 'url'
                                ? 'url'
                                : 'text'
                        }
                        required={item.wajib}
                        min={item.tipe === 'angka' ? 0 : undefined}
                        className="field"
                        placeholder={item.placeholder}
                        defaultValue={String(awal)}
                      />
                    )}

                    {item.bantuan && (
                      <span className="mt-1 block text-xs text-ink-500">{item.bantuan}</span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={menunggu} className="btn btn-primary">
                {menunggu ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" onClick={() => setSedangDiubah(null)} className="btn btn-outline">
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card overflow-hidden">
        {daftar.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-500">
            Belum ada data. Tekan &ldquo;{labelTambah}&rdquo; untuk menambahkan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] text-sm">
              <thead className="border-b bg-surface-2 text-left">
                <tr>
                  {kolom.map((item) => (
                    <th key={item.kunci} className="px-4 py-3 font-semibold text-ink-700">
                      {item.judul}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-ink-700">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {daftar.map((item) => (
                  <tr key={String(item.id)} className="hover:bg-surface-2/60">
                    {kolom.map((kol) => (
                      <td
                        key={kol.kunci}
                        className={`px-4 py-3 ${kol.utama ? 'font-semibold text-ink-900' : 'text-ink-700'}`}
                      >
                        {tampilkan(item[kol.kunci], kol.format)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSedangDiubah(item)}
                          className="btn btn-ghost btn-sm"
                        >
                          <Icon name="pensil" size={14} />
                          Ubah
                        </button>
                        {aksiHapus && (
                          <button
                            type="button"
                            disabled={menungguHapus}
                            onClick={() => {
                              if (!window.confirm(`Hapus "${String(item[kolom[0].kunci])}"?`)) return;
                              mulaiHapus(async () =>
                                setPesanHapus(await aksiHapus(String(item.id))),
                              );
                            }}
                            className="btn btn-ghost btn-sm text-promo hover:bg-rose-50"
                          >
                            <Icon name="hapus" size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
