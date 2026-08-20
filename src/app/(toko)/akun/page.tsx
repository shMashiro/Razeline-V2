import type { Metadata } from 'next';
import Link from 'next/link';

import { FormProfil } from '@/components/form-profil';
import { Icon } from '@/components/icon';
import { KelolaAlamat } from '@/components/kelola-alamat';
import { RemahRoti } from '@/components/remah-roti';
import { keluar } from '@/lib/actions/auth';
import { wajibMasuk } from '@/lib/auth';
import { tanggal } from '@/lib/format';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Alamat } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Akun Saya',
  robots: { index: false, follow: false },
};

export default async function HalamanAkun() {
  const profil = await wajibMasuk('/akun');

  const supabase = await createSupabaseServerClient();
  const [{ data: alamat }, { count: jumlahPesanan }, { count: jumlahWishlist }] = await Promise.all([
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', profil.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('wishlist_items').select('id', { count: 'exact', head: true }),
  ]);

  const pintasan = [
    {
      href: '/pesanan',
      ikon: 'paket' as const,
      judul: 'Pesanan Saya',
      nilai: `${jumlahPesanan ?? 0} pesanan`,
    },
    {
      href: '/wishlist',
      ikon: 'hati' as const,
      judul: 'Wishlist',
      nilai: `${jumlahWishlist ?? 0} produk`,
    },
    {
      href: '/lacak',
      ikon: 'truk' as const,
      judul: 'Lacak Pesanan',
      nilai: 'Cek dengan kode',
    },
  ];

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Akun Saya' }]} />

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-50 text-xl font-bold text-brand-600">
            {(profil.full_name || 'P').charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold">{profil.full_name || 'Pelanggan Razeline'}</h1>
            <p className="text-sm text-ink-500">{profil.email}</p>
            <p className="mt-0.5 text-xs text-ink-300">
              Bergabung sejak {tanggal(profil.created_at)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {profil.role === 'admin' && (
            <Link href="/admin" className="btn btn-secondary btn-sm">
              <Icon name="geser" size={15} />
              Dasbor Admin
            </Link>
          )}
          <form action={keluar}>
            <button type="submit" className="btn btn-outline btn-sm">
              <Icon name="keluar" size={15} />
              Keluar
            </button>
          </form>
        </div>
      </header>

      <ul className="mb-6 grid gap-3 sm:grid-cols-3">
        {pintasan.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="card flex items-center gap-3 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon name={item.ikon} size={19} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.judul}</span>
                <span className="block text-xs text-ink-500">{item.nilai}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold">Data Diri</h2>
          <FormProfil profil={profil} />
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold">Alamat Pengiriman</h2>
          <KelolaAlamat alamat={(alamat ?? []) as Alamat[]} />
        </section>
      </div>
    </div>
  );
}
