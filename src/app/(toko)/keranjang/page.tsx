import type { Metadata } from 'next';

import { IsiKeranjang } from '@/components/isi-keranjang';
import { RemahRoti } from '@/components/remah-roti';
import { ambilPengaturanToko } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Keranjang Belanja',
  description: 'Periksa kembali barang yang akan Anda beli sebelum melanjutkan ke checkout.',
  robots: { index: false, follow: false },
};

export default async function HalamanKeranjang() {
  const pengaturan = await ambilPengaturanToko();

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Keranjang' }]} />

      <header className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Keranjang Belanja</h1>
        <p className="mt-1 text-sm text-ink-500">
          Periksa jumlah dan harga barang sebelum melanjutkan ke pengisian data pengiriman.
        </p>
      </header>

      <IsiKeranjang minimalGratisOngkir={Number(pengaturan.free_shipping_min)} />
    </div>
  );
}
