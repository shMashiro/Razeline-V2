import Link from 'next/link';

import { Icon } from '@/components/icon';

export interface Remah {
  label: string;
  href?: string;
}

/** Jejak navigasi agar pengunjung tahu posisinya di dalam situs. */
export function RemahRoti({ jejak }: { jejak: Remah[] }) {
  return (
    <nav aria-label="Jejak navigasi" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
        <li>
          <Link href="/" className="hover:text-brand-600">
            Beranda
          </Link>
        </li>
        {jejak.map((remah, indeks) => (
          <li key={remah.label} className="flex items-center gap-1">
            <Icon name="kanan" size={13} className="text-ink-300" />
            {remah.href && indeks < jejak.length - 1 ? (
              <Link href={remah.href} className="hover:text-brand-600">
                {remah.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-900" aria-current="page">
                {remah.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
