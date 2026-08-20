import Image from 'next/image';
import Link from 'next/link';

interface Props {
  /** Logo unggahan admin. Bila kosong, dipakai lambang bawaan. */
  logoUrl?: string | null;
  namaToko?: string;
  ringkas?: boolean;
}

/** Lambang bawaan berupa SVG kecil, dipakai sebelum admin mengunggah logo. */
function LambangBawaan() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="shrink-0">
      <rect width="34" height="34" rx="9" className="fill-brand-600" />
      <path
        d="M11 24V10h6.4a4.3 4.3 0 0 1 1.4 8.36L22.2 24h-3.5l-3-5.2H14V24h-3Zm3-7.9h3.2a1.9 1.9 0 0 0 0-3.8H14v3.8Z"
        fill="white"
      />
      <circle cx="25.5" cy="11.5" r="2" className="fill-cyan-300" />
    </svg>
  );
}

export function Logo({ logoUrl, namaToko = 'Razeline Komputer', ringkas = false }: Props) {
  const [kataPertama, ...sisaKata] = namaToko.trim().split(/\s+/);

  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={namaToko}>
      {logoUrl ? (
        <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-lg">
          <Image src={logoUrl} alt="" fill sizes="36px" className="object-contain" />
        </span>
      ) : (
        <LambangBawaan />
      )}

      {!ringkas && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-ink-900">
            {kataPertama}
          </span>
          {sisaKata.length > 0 && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
              {sisaKata.join(' ')}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
