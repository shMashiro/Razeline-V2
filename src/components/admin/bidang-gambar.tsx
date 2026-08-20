'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { unggahGambar } from '@/lib/actions/admin-katalog';

export type FolderUnggah = 'produk' | 'kategori' | 'banner' | 'toko';

interface Props {
  nama: string;
  label: string;
  bantuan?: string;
  /** Perbandingan sisi kotak pratinjau. */
  rasio?: 'persegi' | 'lebar';
  urlAwal: string;
  folder?: FolderUnggah;
  /** Latar terang membantu melihat logo berlatar transparan. */
  latarTerang?: boolean;
}

/**
 * Bidang unggah gambar. URL hasil unggahan disimpan pada input tersembunyi
 * sehingga formulir induk cukup membacanya seperti isian biasa.
 */
export function BidangGambar({
  nama,
  label,
  bantuan,
  rasio = 'lebar',
  urlAwal,
  folder,
  latarTerang = false,
}: Props) {
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
          className={`relative shrink-0 overflow-hidden rounded-lg border border-line ${
            latarTerang ? 'bg-white' : 'bg-surface-2'
          } ${rasio === 'persegi' ? 'h-24 w-24' : 'h-24 w-40'}`}
        >
          {url ? (
            <Image
              src={url}
              alt={label}
              fill
              sizes="160px"
              className={latarTerang ? 'object-contain p-2' : 'object-cover'}
            />
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
              {mengunggah ? 'Mengunggah...' : url ? 'Ganti Gambar' : 'Unggah Gambar'}
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
          {bantuan && <span className="max-w-sm text-xs text-ink-500">{bantuan}</span>}
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
