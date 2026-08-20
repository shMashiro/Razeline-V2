import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { RemahRoti } from '@/components/remah-roti';
import { TampilanKatalog } from '@/components/tampilan-katalog';
import { ambilKategoriPerSlug } from '@/lib/queries';
import type { ParamPencarian } from '@/lib/url';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ParamPencarian>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kategori = await ambilKategoriPerSlug(slug);
  if (!kategori) return { title: 'Kategori tidak ditemukan' };

  return {
    title: kategori.name,
    description: `${kategori.description} Beli ${kategori.name.toLowerCase()} bergaransi di Razeline Komputer, Cibeber, Kabupaten Lebak.`,
    alternates: { canonical: `/kategori/${kategori.slug}` },
  };
}

export default async function HalamanListKategori({ params, searchParams }: Props) {
  const [{ slug }, paramPencarian] = await Promise.all([params, searchParams]);
  const kategori = await ambilKategoriPerSlug(slug);

  if (!kategori) notFound();

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Kategori', href: '/kategori' }, { label: kategori.name }]} />

      <header className="mb-6 max-w-2xl">
        <h1 className="text-xl font-bold sm:text-2xl">{kategori.name}</h1>
        <p className="mt-1 text-sm text-ink-500">{kategori.description}</p>
      </header>

      <Suspense fallback={<div className="skeleton h-96 rounded-xl2" />}>
        <TampilanKatalog
          basePath={`/kategori/${kategori.slug}`}
          params={paramPencarian}
          kategoriTetapId={kategori.id}
        />
      </Suspense>
    </div>
  );
}
