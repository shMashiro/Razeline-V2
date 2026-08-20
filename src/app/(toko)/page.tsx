import Link from 'next/link';

import { BarisProduk } from '@/components/baris-produk';
import { CarouselBanner } from '@/components/carousel-banner';
import { Icon, IKON_KATEGORI } from '@/components/icon';
import {
  ambilBanner,
  ambilKategori,
  ambilPengaturanToko,
  ambilProdukUnggulan,
  ambilProdukUrut,
} from '@/lib/queries';
import { rupiah } from '@/lib/format';
import { tautanWhatsApp } from '@/lib/whatsapp';

const ALASAN = [
  {
    ikon: 'label' as const,
    judul: 'Harga Terjangkau',
    isi: 'Kami ambil untung wajar supaya harga tetap masuk akal untuk kantong warga sekitar. Bisa nego untuk pembelian banyak.',
  },
  {
    ikon: 'perisai' as const,
    judul: 'Barang Berkualitas',
    isi: 'Semua barang diambil dari distributor resmi dan diuji teknisi sebelum sampai ke tangan Anda.',
  },
  {
    ikon: 'centang' as const,
    judul: 'Bergaransi Resmi',
    isi: 'Setiap produk punya masa garansi yang jelas. Klaim bisa langsung di toko tanpa proses berbelit.',
  },
];

export default async function Beranda() {
  const [banners, kategori, unggulan, terlaris, terbaru, populer, pengaturan] = await Promise.all([
    ambilBanner(),
    ambilKategori(),
    ambilProdukUnggulan(10),
    ambilProdukUrut('terlaris', 10),
    ambilProdukUrut('terbaru', 10),
    ambilProdukUrut('populer', 10),
    ambilPengaturanToko(),
  ]);

  return (
    <div className="container-page space-y-12 py-6 sm:space-y-14 sm:py-8">
      {/* Sorotan promo */}
      <section aria-label="Promo pilihan">
        <CarouselBanner banners={banners} />
      </section>

      {/* Pintasan kategori */}
      <section aria-labelledby="judul-kategori" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="judul-kategori" className="text-lg font-bold sm:text-xl">
              Belanja per Kategori
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              Pilih jenis barang yang Anda cari untuk mempersempit pencarian.
            </p>
          </div>
          <Link
            href="/kategori"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Semua kategori
            <Icon name="kanan" size={15} />
          </Link>
        </div>

        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
          {kategori.slice(0, 12).map((item) => (
            <li key={item.id}>
              <Link
                href={`/kategori/${item.slug}`}
                className="flex h-full flex-col items-center gap-2 rounded-xl2 border border-line bg-white px-2 py-4 text-center transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Icon name={IKON_KATEGORI[item.icon] ?? 'kotak'} size={22} />
                </span>
                <span className="text-xs font-medium leading-tight text-ink-700">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Kenapa memilih kami */}
      <section aria-labelledby="judul-alasan" className="rounded-xl2 border border-line bg-surface-2 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 id="judul-alasan" className="text-lg font-bold sm:text-xl">
            Kenapa Memilih Kami?
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Tiga alasan pelanggan di Cibeber dan sekitarnya percaya belanja di Razeline Komputer.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {ALASAN.map((alasan) => (
            <li key={alasan.judul} className="rounded-xl2 border border-line bg-white p-5">
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl2 bg-brand-600 text-white">
                <Icon name={alasan.ikon} size={22} />
              </span>
              <h3 className="text-sm font-bold">{alasan.judul}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{alasan.isi}</p>
            </li>
          ))}
        </ul>

        {pengaturan.free_shipping_min > 0 && (
          <p className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-center text-sm text-ink-700">
            <Icon name="truk" size={18} className="shrink-0 text-brand-600" />
            Gratis ongkir untuk pembelian di atas{' '}
            <strong className="price">{rupiah(pengaturan.free_shipping_min)}</strong>
          </p>
        )}
      </section>

      <BarisProduk
        judul="Produk Unggulan"
        keterangan="Pilihan terbaik yang paling sering direkomendasikan teknisi kami."
        tautanSemua="/katalog?urutan=terlaris"
        produk={unggulan}
        prioritasGambar
      />

      <BarisProduk
        judul="Paling Laris"
        keterangan="Barang yang paling banyak dibeli pelanggan bulan ini."
        tautanSemua="/katalog?urutan=terlaris"
        produk={terlaris}
      />

      <BarisProduk
        judul="Baru Datang"
        keterangan="Stok terbaru yang baru masuk ke etalase toko."
        tautanSemua="/katalog?urutan=terbaru"
        produk={terbaru}
      />

      <BarisProduk
        judul="Paling Sering Dilihat"
        keterangan="Produk yang paling banyak dikunjungi pengunjung lain."
        tautanSemua="/katalog?urutan=populer"
        produk={populer}
      />

      {/* Ajakan konsultasi */}
      <section className="overflow-hidden rounded-xl2 border border-line bg-brand-700 text-white">
        <div className="grid gap-6 p-6 sm:p-9 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Bingung pilih spesifikasi?</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
              Ceritakan kebutuhan dan anggaran Anda, teknisi kami akan bantu susun rekomendasi yang
              paling pas — gratis, tanpa kewajiban membeli.
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <Icon name="lokasi" size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                <div>
                  <dt className="font-semibold">Alamat Toko</dt>
                  <dd className="text-white/75">{pengaturan.address}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="jam" size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                <div>
                  <dt className="font-semibold">Jam Buka</dt>
                  <dd className="text-white/75">{pengaturan.operational_hours || 'Setiap hari'}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-2.5">
            {pengaturan.whatsapp && (
              <a
                href={tautanWhatsApp(
                  pengaturan.whatsapp,
                  'Halo Razeline Komputer, saya mau konsultasi kebutuhan komputer.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50"
              >
                <Icon name="whatsapp" size={18} />
                Konsultasi via WhatsApp
              </a>
            )}
            <Link
              href="/katalog"
              className="btn btn-lg border border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
