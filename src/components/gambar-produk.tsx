import Image from 'next/image';

/** Warna latar cadangan yang tetap konsisten untuk produk yang sama. */
const LATAR = [
  'from-slate-100 to-slate-200 text-slate-500',
  'from-blue-50 to-blue-100 text-blue-600',
  'from-cyan-50 to-cyan-100 text-cyan-700',
  'from-indigo-50 to-indigo-100 text-indigo-600',
  'from-emerald-50 to-emerald-100 text-emerald-700',
  'from-amber-50 to-amber-100 text-amber-700',
];

function inisial(nama: string): string {
  return nama
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]!.toUpperCase())
    .join('');
}

function indeksWarna(nama: string): number {
  let jumlah = 0;
  for (let i = 0; i < nama.length; i += 1) jumlah = (jumlah + nama.charCodeAt(i)) % 997;
  return jumlah % LATAR.length;
}

interface Props {
  url?: string | null;
  alt?: string;
  nama: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Menampilkan foto produk. Bila toko belum mengunggah foto, tampil
 * kotak inisial yang rapi alih-alih ikon rusak.
 */
export function GambarProduk({ url, alt, nama, sizes, priority, className }: Props) {
  if (url) {
    return (
      <Image
        src={url}
        alt={alt || nama}
        fill
        sizes={sizes}
        priority={priority}
        className={className ?? 'object-contain p-3'}
      />
    );
  }

  const warna = LATAR[indeksWarna(nama)];
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${warna}`}
      role="img"
      aria-label={`Foto ${nama} belum tersedia`}
    >
      <span className="text-2xl font-bold tracking-tight opacity-70">{inisial(nama)}</span>
    </div>
  );
}
