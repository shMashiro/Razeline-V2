import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/env';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createSupabaseAdminClient();

  const [{ data: produk }, { data: kategori }] = await Promise.all([
    admin
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5000),
    admin.from('categories').select('slug').eq('is_active', true),
  ]);

  const halamanUtama: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/katalog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/kategori`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/bantuan`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/lacak`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [
    ...halamanUtama,
    ...(kategori ?? []).map((item) => ({
      url: `${SITE_URL}/kategori/${item.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(produk ?? []).map((item) => ({
      url: `${SITE_URL}/produk/${item.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
