import Link from 'next/link';

import { Icon } from '@/components/icon';
import { KartuProduk } from '@/components/kartu-produk';
import { Penggeser } from '@/components/penggeser';
import type { ProdukRingkas } from '@/lib/types';

interface Props {
  judul: string;
  keterangan?: string;
  tautanSemua?: string;
  produk: ProdukRingkas[];
  prioritasGambar?: boolean;
}

/** Satu baris produk yang digeser ke samping, dipakai di beranda. */
export function BarisProduk({
  judul,
  keterangan,
  tautanSemua,
  produk,
  prioritasGambar = false,
}: Props) {
  if (produk.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold sm:text-xl">{judul}</h2>
          {keterangan && <p className="mt-0.5 text-sm text-ink-500">{keterangan}</p>}
        </div>
        {tautanSemua && (
          <Link
            href={tautanSemua}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Lihat semua
            <Icon name="kanan" size={15} />
          </Link>
        )}
      </div>

      <Penggeser>
        {produk.map((item, indeks) => (
          <div key={item.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[19rem] xl:w-56">
            <KartuProduk produk={item} prioritasGambar={prioritasGambar && indeks < 3} />
          </div>
        ))}
      </Penggeser>
    </section>
  );
}
