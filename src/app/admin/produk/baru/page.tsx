import Link from 'next/link';

import { FormProduk } from '@/components/admin/form-produk';
import { Icon } from '@/components/icon';
import { ambilKategori, ambilMerek } from '@/lib/queries';

export const metadata = { title: 'Tambah Produk' };

export default async function HalamanTambahProduk() {
  const [kategori, merek] = await Promise.all([ambilKategori(), ambilMerek()]);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600"
        >
          <Icon name="kiri" size={15} />
          Kembali ke daftar produk
        </Link>
      </div>

      <header>
        <h1 className="text-xl font-bold">Tambah Produk</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          Isi data produk selengkap mungkin agar pembeli tidak perlu bertanya lagi.
        </p>
      </header>

      <FormProduk kategori={kategori} merek={merek} />
    </div>
  );
}
