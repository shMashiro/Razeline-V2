import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/akun',
          '/checkout',
          '/keranjang',
          '/wishlist',
          '/pesanan',
          '/masuk',
          '/daftar',
          '/verifikasi',
          '/auth/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
