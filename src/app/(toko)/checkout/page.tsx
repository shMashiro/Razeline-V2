import type { Metadata } from 'next';

import { FormCheckout } from '@/components/form-checkout';
import { RemahRoti } from '@/components/remah-roti';
import { ambilProfil } from '@/lib/auth';
import {
  ambilMetodePembayaran,
  ambilMetodePengiriman,
  ambilPengaturanToko,
} from '@/lib/queries';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Alamat } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Lengkapi data pengiriman dan pembayaran untuk menyelesaikan pesanan Anda.',
  robots: { index: false, follow: false },
};

export default async function HalamanCheckout() {
  const [metodePengiriman, metodePembayaran, profil, pengaturan] = await Promise.all([
    ambilMetodePengiriman(),
    ambilMetodePembayaran(),
    ambilProfil(),
    ambilPengaturanToko(),
  ]);

  let alamatTersimpan: Alamat[] = [];
  if (profil) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', profil.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    alamatTersimpan = (data ?? []) as Alamat[];
  }

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Keranjang', href: '/keranjang' }, { label: 'Checkout' }]} />

      <header className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">Checkout</h1>
        <p className="mt-1 text-sm text-ink-500">
          Isi data di bawah ini. Pesanan akan dikunci stoknya begitu tombol buat pesanan ditekan.
        </p>
      </header>

      <FormCheckout
        metodePengiriman={metodePengiriman}
        metodePembayaran={metodePembayaran}
        profil={profil}
        alamatTersimpan={alamatTersimpan}
        minimalGratisOngkir={Number(pengaturan.free_shipping_min)}
      />
    </div>
  );
}
