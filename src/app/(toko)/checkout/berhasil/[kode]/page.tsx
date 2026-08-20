import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DetailPesanan } from '@/components/detail-pesanan';
import { Icon } from '@/components/icon';
import { KonfirmasiWhatsApp } from '@/components/konfirmasi-whatsapp';
import { SITE_URL } from '@/lib/env';
import { ambilPesananPerKode } from '@/lib/pesanan';
import { ambilPengaturanToko } from '@/lib/queries';
import { tautanKonfirmasiWhatsApp } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Pesanan Berhasil Dibuat',
  robots: { index: false, follow: false },
};

export default async function HalamanPesananBerhasil({
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

  const urlLacak = `${SITE_URL}/pesanan/${pesanan.order_code}`;
  const tautanWa = pengaturan.whatsapp
    ? tautanKonfirmasiWhatsApp(pengaturan.whatsapp, pesanan, urlLacak)
    : null;

  return (
    <div className="container-page py-8">
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="centang" size={32} strokeWidth={2.5} />
        </span>
        <h1 className="text-xl font-bold sm:text-2xl">Pesanan Anda sudah kami terima</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Simpan kode pesanan{' '}
          <strong className="price text-ink-900">{pesanan.order_code}</strong> untuk mengecek status
          kapan saja — tanpa perlu login. Admin akan segera memverifikasi pesanan Anda.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href={`/pesanan/${pesanan.order_code}`} className="btn btn-outline btn-sm">
            Halaman status pesanan
          </Link>
          <Link href="/katalog" className="btn btn-ghost btn-sm">
            Belanja lagi
          </Link>
        </div>
      </div>

      {tautanWa && (
        <div className="mb-6">
          <KonfirmasiWhatsApp tautan={tautanWa} />
        </div>
      )}

      <DetailPesanan
        pesanan={pesanan}
        nomorWhatsAppToko={pengaturan.whatsapp}
        urlLacak={urlLacak}
      />
    </div>
  );
}
