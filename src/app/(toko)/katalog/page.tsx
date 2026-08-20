import type { Metadata } from 'next';
import { Suspense } from 'react';

import { RemahRoti } from '@/components/remah-roti';
import { TampilanKatalog } from '@/components/tampilan-katalog';
import { bacaParam, type ParamPencarian } from '@/lib/url';

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description:
    'Jelajahi seluruh produk Razeline Komputer: laptop, PC rakitan, komponen, printer, jaringan, dan aksesoris. Lengkap dengan filter harga, merek, dan kondisi barang.',
};

export default async function HalamanKatalog({
  searchParams,
}: {
  searchParams: Promise<ParamPencarian>;
}) {
  const params = await searchParams;
  const q = bacaParam(params, 'q');

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Katalog' }]} />

      <header className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">
          {q ? `Hasil pencarian "${q}"` : 'Katalog Produk'}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {q
            ? 'Gunakan filter di samping untuk mempersempit hasil pencarian.'
            : 'Semua barang yang tersedia di Razeline Komputer, dari komponen kecil sampai satu set komputer.'}
        </p>
      </header>

      <Suspense fallback={<KerangkaKatalog />}>
        <TampilanKatalog basePath="/katalog" params={params} filterKategori />
      </Suspense>
    </div>
  );
}

function KerangkaKatalog() {
  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:gap-8">
      <div className="skeleton hidden h-96 rounded-xl2 lg:block" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, indeks) => (
          <div key={indeks} className="skeleton h-72 rounded-xl2" />
        ))}
      </div>
    </div>
  );
}
