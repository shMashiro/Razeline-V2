import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { SITE_URL } from '@/lib/env';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Razeline Komputer — Toko Komputer & Elektronik Cibeber, Lebak',
    template: '%s | Razeline Komputer',
  },
  description:
    'Jual laptop, PC rakitan, komponen komputer, printer, dan aksesoris elektronik dengan harga terjangkau dan bergaransi. Melayani Cibeber, Lebak, Banten, dan pengiriman seluruh Indonesia.',
  keywords: [
    'toko komputer Lebak',
    'laptop Cibeber',
    'PC rakitan Banten',
    'servis komputer Lebak',
    'Razeline Komputer',
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Razeline Komputer',
    title: 'Razeline Komputer — Toko Komputer & Elektronik Cibeber, Lebak',
    description:
      'Laptop, PC rakitan, dan komponen komputer bergaransi dengan harga terjangkau di Cibeber, Kabupaten Lebak.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0f4c81',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
