import Link from 'next/link';

import { Icon } from '@/components/icon';
import { buatUrl, type ParamPencarian } from '@/lib/url';

interface Props {
  basePath: string;
  params: ParamPencarian;
  halaman: number;
  totalHalaman: number;
}

/** Menyusun deretan nomor halaman dengan titik-titik bila terlalu panjang. */
function nomorHalaman(saatIni: number, total: number): (number | 'jeda')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const hasil = new Set<number>([1, total, saatIni, saatIni - 1, saatIni + 1]);
  const terurut = [...hasil].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const dengan: (number | 'jeda')[] = [];
  let sebelumnya = 0;
  for (const nomor of terurut) {
    if (sebelumnya && nomor - sebelumnya > 1) dengan.push('jeda');
    dengan.push(nomor);
    sebelumnya = nomor;
  }
  return dengan;
}

export function Paginasi({ basePath, params, halaman, totalHalaman }: Props) {
  if (totalHalaman <= 1) return null;

  const kelasDasar =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors';

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-1.5">
      {halaman > 1 ? (
        <Link
          href={buatUrl(basePath, params, { hal: halaman - 1 })}
          className={`${kelasDasar} border-line bg-white text-ink-700 hover:bg-surface-2`}
          rel="prev"
          aria-label="Halaman sebelumnya"
        >
          <Icon name="kiri" size={16} />
        </Link>
      ) : (
        <span className={`${kelasDasar} border-line bg-surface-2 text-ink-300`} aria-hidden="true">
          <Icon name="kiri" size={16} />
        </span>
      )}

      {nomorHalaman(halaman, totalHalaman).map((nomor, indeks) =>
        nomor === 'jeda' ? (
          <span key={`jeda-${indeks}`} className="px-1 text-sm text-ink-300">
            &hellip;
          </span>
        ) : (
          <Link
            key={nomor}
            href={buatUrl(basePath, params, { hal: nomor })}
            aria-current={nomor === halaman ? 'page' : undefined}
            className={`${kelasDasar} ${
              nomor === halaman
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-ink-700 hover:bg-surface-2'
            }`}
          >
            {nomor}
          </Link>
        ),
      )}

      {halaman < totalHalaman ? (
        <Link
          href={buatUrl(basePath, params, { hal: halaman + 1 })}
          className={`${kelasDasar} border-line bg-white text-ink-700 hover:bg-surface-2`}
          rel="next"
          aria-label="Halaman berikutnya"
        >
          <Icon name="kanan" size={16} />
        </Link>
      ) : (
        <span className={`${kelasDasar} border-line bg-surface-2 text-ink-300`} aria-hidden="true">
          <Icon name="kanan" size={16} />
        </span>
      )}
    </nav>
  );
}
