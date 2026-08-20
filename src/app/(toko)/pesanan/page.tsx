import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/icon';
import { LencanaBayar, LencanaStatus } from '@/components/lencana-status';
import { RemahRoti } from '@/components/remah-roti';
import { ambilPesananTamu } from '@/lib/actions/checkout';
import { ambilPengguna } from '@/lib/auth';
import { angka, rupiah, tanggalJam } from '@/lib/format';
import { ambilPesananPerKode, ambilPesananSaya } from '@/lib/pesanan';
import type { Pesanan } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Pesanan Saya',
  description: 'Daftar pesanan Anda di Razeline Komputer.',
  robots: { index: false, follow: false },
};

function BarisPesanan({ pesanan, jumlahBarang }: { pesanan: Pesanan; jumlahBarang?: number }) {
  return (
    <li>
      <Link
        href={`/pesanan/${pesanan.order_code}`}
        className="card block p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="price text-sm font-bold tracking-wide">{pesanan.order_code}</p>
            <p className="mt-0.5 text-xs text-ink-500">
              {tanggalJam(pesanan.created_at)} WIB
              {typeof jumlahBarang === 'number' ? ` · ${angka(jumlahBarang)} barang` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LencanaStatus status={pesanan.status} />
            <LencanaBayar status={pesanan.payment_status} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-ink-500">
            {pesanan.shipping_method_name} · {pesanan.payment_method_name}
          </p>
          <p className="price text-sm font-bold text-brand-700">{rupiah(pesanan.total)}</p>
        </div>
      </Link>
    </li>
  );
}

export default async function HalamanDaftarPesanan() {
  const pengguna = await ambilPengguna();

  const [pesananAkun, kodeTamu] = await Promise.all([
    pengguna ? ambilPesananSaya() : Promise.resolve<Pesanan[]>([]),
    ambilPesananTamu(),
  ]);

  const kodeAkun = new Set(pesananAkun.map((item) => item.order_code));
  const pesananTamu = (
    await Promise.all(
      kodeTamu.filter((kode) => !kodeAkun.has(kode)).map((kode) => ambilPesananPerKode(kode)),
    )
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const kosong = pesananAkun.length === 0 && pesananTamu.length === 0;

  return (
    <div className="container-page py-6">
      <RemahRoti jejak={[{ label: 'Pesanan Saya' }]} />

      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Pesanan Saya</h1>
          <p className="mt-1 text-sm text-ink-500">
            Semua pesanan Anda beserta statusnya. Klik salah satu untuk melihat rinciannya.
          </p>
        </div>
        <Link href="/lacak" className="btn btn-outline btn-sm">
          <Icon name="cari" size={15} />
          Lacak dengan kode
        </Link>
      </header>

      {kosong ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-ink-300">
            <Icon name="paket" size={30} />
          </span>
          <h2 className="text-base font-bold">Belum ada pesanan</h2>
          <p className="max-w-md text-sm text-ink-500">
            {pengguna
              ? 'Pesanan yang Anda buat akan muncul di sini secara otomatis.'
              : 'Anda belum masuk. Bila sebelumnya memesan tanpa akun, gunakan kode pesanan untuk mengecek statusnya.'}
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Link href="/katalog" className="btn btn-primary">
              Mulai Belanja
            </Link>
            {!pengguna && (
              <Link href="/masuk?lanjut=%2Fpesanan" className="btn btn-outline">
                Masuk ke akun
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {pesananAkun.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-ink-700">Pesanan Akun Anda</h2>
              <ul className="space-y-3">
                {pesananAkun.map((pesanan) => (
                  <BarisPesanan key={pesanan.id} pesanan={pesanan} />
                ))}
              </ul>
            </section>
          )}

          {pesananTamu.length > 0 && (
            <section>
              <h2 className="mb-1 text-sm font-bold text-ink-700">Pesanan Tanpa Akun</h2>
              <p className="mb-3 text-xs text-ink-500">
                Dikenali dari perangkat ini. Simpan kode pesanannya bila Anda berganti perangkat.
              </p>
              <ul className="space-y-3">
                {pesananTamu.map((pesanan) => (
                  <BarisPesanan
                    key={pesanan.id}
                    pesanan={pesanan}
                    jumlahBarang={pesanan.order_items.length}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
