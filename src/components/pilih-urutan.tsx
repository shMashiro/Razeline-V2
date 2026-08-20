'use client';

import { useRouter } from 'next/navigation';

import { URUTAN_PRODUK, type KunciUrutan } from '@/lib/constants';
import { buatUrl, type ParamPencarian } from '@/lib/url';

interface Props {
  basePath: string;
  params: ParamPencarian;
  terpilih: KunciUrutan;
}

/** Pemilih urutan yang langsung berpindah halaman saat nilainya diubah. */
export function PilihUrutan({ basePath, params, terpilih }: Props) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 text-ink-500">Urutkan</span>
      <select
        className="field w-auto py-2 pr-8 text-sm font-medium"
        value={terpilih}
        onChange={(event) => router.push(buatUrl(basePath, params, { urutan: event.target.value }))}
      >
        {Object.entries(URUTAN_PRODUK).map(([kunci, nilai]) => (
          <option key={kunci} value={kunci}>
            {nilai.label}
          </option>
        ))}
      </select>
    </label>
  );
}
