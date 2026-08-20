import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/icon';
import { RemahRoti } from '@/components/remah-roti';
import { rupiah } from '@/lib/format';
import { ambilMetodePembayaran, ambilMetodePengiriman, ambilPengaturanToko } from '@/lib/queries';
import { tautanWhatsApp } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Cara Belanja & Bantuan',
  description:
    'Panduan belanja di Razeline Komputer: cara memesan, metode pembayaran, pengiriman, garansi, dan cara melacak pesanan.',
};

const LANGKAH = [
  {
    judul: 'Pilih barang',
    isi: 'Telusuri katalog atau kategori. Gunakan filter harga dan merek untuk mempersempit pilihan.',
  },
  {
    judul: 'Masukkan keranjang',
    isi: 'Tekan tombol keranjang pada produk yang diinginkan. Jumlah bisa diubah kapan saja.',
  },
  {
    judul: 'Isi data pengiriman',
    isi: 'Di halaman checkout, isi nama, nomor WhatsApp, dan alamat lengkap. Tidak wajib punya akun.',
  },
  {
    judul: 'Konfirmasi via WhatsApp',
    isi: 'Setelah pesanan dibuat, Anda diarahkan ke WhatsApp admin. Kirim pesannya untuk mempercepat proses.',
  },
  {
    judul: 'Bayar & tunggu barang',
    isi: 'Lakukan pembayaran sesuai metode yang dipilih, lalu pantau status lewat kode pesanan.',
  },
];

export default async function HalamanBantuan() {
  const [pengaturan, pengiriman, pembayaran] = await Promise.all([
    ambilPengaturanToko(),
    ambilMetodePengiriman(),
    ambilMetodePembayaran(),
  ]);

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Bantuan' }]} />

      <header className="mb-8 max-w-2xl">
        <h1 className="text-xl font-bold sm:text-2xl">Cara Belanja &amp; Bantuan</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
          Halaman ini menjelaskan seluruh alur belanja di Razeline Komputer dengan bahasa sederhana.
          Bila masih ada yang kurang jelas, jangan sungkan bertanya lewat WhatsApp.
        </p>
      </header>

      <div className="space-y-10">
        <section aria-labelledby="judul-langkah">
          <h2 id="judul-langkah" className="mb-4 text-lg font-bold">
            Lima langkah belanja
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LANGKAH.map((langkah, indeks) => (
              <li key={langkah.judul} className="card p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {indeks + 1}
                </span>
                <h3 className="mt-3 text-sm font-bold">{langkah.judul}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{langkah.isi}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pembayaran" aria-labelledby="judul-pembayaran" className="scroll-mt-32">
          <h2 id="judul-pembayaran" className="mb-4 text-lg font-bold">
            Metode pembayaran
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pembayaran.map((metode) => (
              <li key={metode.id} className="card p-4">
                <h3 className="text-sm font-bold">{metode.name}</h3>
                {metode.account_number && metode.account_number !== '-' && (
                  <p className="price mt-1 text-sm text-ink-700">
                    {metode.account_number} a.n. {metode.account_name}
                  </p>
                )}
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{metode.instructions}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="judul-pengiriman">
          <h2 id="judul-pengiriman" className="mb-4 text-lg font-bold">
            Pilihan pengiriman
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-surface-2 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Layanan</th>
                  <th className="px-4 py-3 font-semibold">Estimasi</th>
                  <th className="px-4 py-3 font-semibold">Ongkos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pengiriman.map((metode) => (
                  <tr key={metode.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{metode.name}</p>
                      <p className="text-xs text-ink-500">{metode.description}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{metode.estimated_days || '—'}</td>
                    <td className="price px-4 py-3 font-semibold">
                      {Number(metode.cost) === 0 ? 'Gratis' : rupiah(metode.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pengaturan.free_shipping_min > 0 && (
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
              <Icon name="truk" size={16} className="text-brand-600" />
              Gratis ongkir otomatis untuk belanja di atas{' '}
              <strong className="price text-ink-900">{rupiah(pengaturan.free_shipping_min)}</strong>
            </p>
          )}
        </section>

        <section id="garansi" aria-labelledby="judul-garansi" className="scroll-mt-32">
          <h2 id="judul-garansi" className="mb-4 text-lg font-bold">
            Garansi &amp; penukaran
          </h2>
          <div className="card space-y-3 p-5 text-sm leading-relaxed text-ink-700">
            <p>
              Masa garansi setiap produk tertulis jelas di halaman produk masing-masing. Klaim
              garansi dilakukan dengan membawa barang beserta bukti pembelian (kode pesanan sudah
              cukup) ke toko kami di Cibeber.
            </p>
            <p>
              Barang yang cacat produksi atau tidak berfungsi saat pertama diterima dapat ditukar
              dalam 3 hari sejak barang sampai, dengan syarat kelengkapan dan dus masih utuh.
            </p>
            <p>
              Kerusakan akibat kesalahan pemakaian, terkena air, atau segel garansi rusak berada di
              luar tanggungan garansi.
            </p>
          </div>
        </section>

        <section aria-labelledby="judul-lacak">
          <h2 id="judul-lacak" className="mb-4 text-lg font-bold">
            Melacak pesanan
          </h2>
          <div className="card p-5">
            <p className="text-sm leading-relaxed text-ink-700">
              Setiap pesanan mendapat kode unik berformat <strong>RZL-2608-A1B2C3D4</strong>. Kode
              ini bisa dipakai untuk melihat status pesanan tanpa perlu masuk ke akun. Bila Anda
              punya akun, seluruh riwayat pesanan tersimpan otomatis.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/lacak" className="btn btn-primary btn-sm">
                Lacak Pesanan
              </Link>
              <Link href="/pesanan" className="btn btn-outline btn-sm">
                Pesanan Saya
              </Link>
            </div>
          </div>
        </section>

        {pengaturan.whatsapp && (
          <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h2 className="text-sm font-bold">Masih ada pertanyaan?</h2>
              <p className="mt-0.5 text-sm text-ink-500">
                Tim kami siap membantu pada {pengaturan.operational_hours || 'jam kerja toko'}.
              </p>
            </div>
            <a
              href={tautanWhatsApp(pengaturan.whatsapp, 'Halo Razeline Komputer, saya mau bertanya.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Icon name="whatsapp" size={17} />
              Chat WhatsApp
            </a>
          </section>
        )}
      </div>
    </div>
  );
}
