import Link from 'next/link';

/** Wordmark toko. Dibuat dari SVG kecil agar tidak perlu memuat berkas gambar. */
export function Logo({ ringkas = false }: { ringkas?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Razeline Komputer">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="shrink-0">
        <rect width="34" height="34" rx="9" className="fill-brand-600" />
        <path
          d="M11 24V10h6.4a4.3 4.3 0 0 1 1.4 8.36L22.2 24h-3.5l-3-5.2H14V24h-3Zm3-7.9h3.2a1.9 1.9 0 0 0 0-3.8H14v3.8Z"
          fill="white"
        />
        <circle cx="25.5" cy="11.5" r="2" className="fill-cyan-300" />
      </svg>
      {!ringkas && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-ink-900">Razeline</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
            Komputer
          </span>
        </span>
      )}
    </Link>
  );
}
