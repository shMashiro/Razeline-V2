import Image from 'next/image';

/** Warna cadangan yang tetap sama untuk kategori yang sama. */
const LATAR = [
  'from-brand-600 to-brand-800',
  'from-slate-600 to-slate-800',
  'from-cyan-700 to-brand-800',
  'from-indigo-600 to-indigo-900',
  'from-teal-600 to-teal-900',
  'from-sky-700 to-slate-800',
];

function indeksWarna(teks: string): number {
  let jumlah = 0;
  for (let i = 0; i < teks.length; i += 1) jumlah = (jumlah + teks.charCodeAt(i) * (i + 1)) % 997;
  return jumlah % LATAR.length;
}

interface Props {
  url?: string | null;
  nama: string;
  sizes: string;
  priority?: boolean;
}

/**
 * Foto kategori. Selama foto asli belum diunggah admin, ditampilkan blok
 * warna bertekstur halus berisi nama kategori — bukan ikon.
 */
export function GambarKategori({ url, nama, sizes, priority }: Props) {
  if (url) {
    return (
      <Image
        src={url}
        alt={`Foto kategori ${nama}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br p-3 ${
        LATAR[indeksWarna(nama)]
      }`}
      role="img"
      aria-label={`Foto kategori ${nama} belum diunggah`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <span className="relative text-center text-sm font-bold leading-tight text-white/90">
        {nama}
      </span>
    </div>
  );
}
