import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DetailPesanan } from '@/components/detail-pesanan';
import { RemahRoti } from '@/components/remah-roti';
import { SITE_URL } from '@/lib/env';
import { ambilPesananPerKode } from '@/lib/pesanan';
import { ambilPengaturanToko } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Status Pesanan',
  description: 'Lihat status pesanan Anda di Razeline Komputer.',
  robots: { index: false, follow: false },
};

export default async function HalamanDetailPesanan({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const [pesanan, pengaturan] = await Promise.all([
    ambilPesananPerKode(kode),
    ambilPengaturanToko(),
  ]);

  if (!pesanan) notFound();

  return (
    <div className="container-page py-6">
      <RemahRoti
        jejak={[{ label: 'Pesanan', href: '/pesanan' }, { label: pesanan.order_code }]}
      />

      <header className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Status Pesanan</h1>
        <p className="mt-1 text-sm text-ink-500">
          Halaman ini bisa dibuka kapan saja memakai kode pesanan, termasuk tanpa akun.
        </p>
      </header>

      <DetailPesanan
        pesanan={pesanan}
        nomorWhatsAppToko={pengaturan.whatsapp}
        urlLacak={`${SITE_URL}/pesanan/${pesanan.order_code}`}
      />
    </div>
  );
}
