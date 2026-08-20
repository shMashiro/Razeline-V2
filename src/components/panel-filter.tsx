import Link from 'next/link';

import { Icon } from '@/components/icon';
import { RENTANG_HARGA_CEPAT } from '@/lib/constants';
import { rupiah } from '@/lib/format';
import { alihkanNilai, buatUrl, type ParamPencarian } from '@/lib/url';
import type { Kategori, Merek } from '@/lib/types';

interface Props {
  basePath: string;
  params: ParamPencarian;
  daftarMerek: Merek[];
  merekTerpilih: string[];
  daftarKategori?: Kategori[];
  kategoriTerpilih?: string;
  hargaMin: number | null;
  hargaMax: number | null;
  kondisi?: string;
  hanyaTersedia: boolean;
}

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-4 first:pt-0 last:border-b-0">
      <h3 className="mb-3 text-sm font-bold">{judul}</h3>
      {children}
    </section>
  );
}

/** Kotak centang berbentuk tautan agar filter tetap jalan tanpa JavaScript. */
function PilihanTautan({
  href,
  aktif,
  children,
}: {
  href: string;
  aktif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink-700 transition-colors hover:bg-surface-2"
      aria-pressed={aktif}
    >
      <span
        aria-hidden="true"
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition-colors ${
          aktif ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white'
        }`}
      >
        {aktif && <Icon name="centang" size={12} strokeWidth={3} />}
      </span>
      <span className={aktif ? 'font-semibold text-ink-900' : ''}>{children}</span>
    </Link>
  );
}

export function PanelFilter({
  basePath,
  params,
  daftarMerek,
  merekTerpilih,
  daftarKategori,
  kategoriTerpilih,
  hargaMin,
  hargaMax,
  kondisi,
  hanyaTersedia,
}: Props) {
  // Parameter yang ikut dibawa ulang oleh formulir harga khusus.
  const paramLain = Object.entries(params).filter(
    ([kunci]) => !['min', 'max', 'hal'].includes(kunci),
  );

  return (
    <div className="divide-y divide-line">
      {daftarKategori && daftarKategori.length > 0 && (
        <Bagian judul="Kategori">
          <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
            <PilihanTautan
              href={buatUrl(basePath, params, { kategori: null })}
              aktif={!kategoriTerpilih}
            >
              Semua kategori
            </PilihanTautan>
            {daftarKategori.map((item) => (
              <PilihanTautan
                key={item.id}
                href={buatUrl(basePath, params, {
                  kategori: kategoriTerpilih === item.slug ? null : item.slug,
                })}
                aktif={kategoriTerpilih === item.slug}
              >
                {item.name}
              </PilihanTautan>
            ))}
          </div>
        </Bagian>
      )}

      <Bagian judul="Rentang Harga">
        <div className="flex flex-wrap gap-2">
          {RENTANG_HARGA_CEPAT.map((rentang) => {
            const aktif = hargaMin === rentang.min && hargaMax === rentang.max;
            return (
              <Link
                key={rentang.label}
                scroll={false}
                href={buatUrl(basePath, params, {
                  min: aktif ? null : rentang.min,
                  max: aktif ? null : rentang.max,
                })}
                className={`chip ${aktif ? 'chip-active' : ''}`}
              >
                {rentang.label}
              </Link>
            );
          })}
        </div>

        <form action={basePath} method="get" className="mt-3 flex items-end gap-2">
          {paramLain.map(([kunci, nilai]) => (
            <input
              key={kunci}
              type="hidden"
              name={kunci}
              value={Array.isArray(nilai) ? (nilai[0] ?? '') : (nilai ?? '')}
            />
          ))}
          <label className="flex-1">
            <span className="mb-1 block text-xs text-ink-500">Harga terendah</span>
            <input
              type="number"
              name="min"
              min={0}
              step={50000}
              inputMode="numeric"
              defaultValue={hargaMin ?? ''}
              placeholder="0"
              className="field py-2 text-sm"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-ink-500">Harga tertinggi</span>
            <input
              type="number"
              name="max"
              min={0}
              step={50000}
              inputMode="numeric"
              defaultValue={hargaMax ?? ''}
              placeholder="Bebas"
              className="field py-2 text-sm"
            />
          </label>
          <button type="submit" className="btn btn-outline btn-sm h-[38px]" aria-label="Terapkan rentang harga">
            <Icon name="kanan" size={16} />
          </button>
        </form>

        {(hargaMin !== null || hargaMax !== null) && (
          <p className="mt-2 text-xs text-ink-500">
            Menampilkan {hargaMin !== null ? rupiah(hargaMin) : 'semua'} —{' '}
            {hargaMax !== null ? rupiah(hargaMax) : 'ke atas'}
          </p>
        )}
      </Bagian>

      {daftarMerek.length > 0 && (
        <Bagian judul="Merek">
          <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
            {daftarMerek.map((merek) => {
              const aktif = merekTerpilih.includes(merek.slug);
              return (
                <PilihanTautan
                  key={merek.id}
                  href={buatUrl(basePath, params, {
                    merek: alihkanNilai(merekTerpilih, merek.slug),
                  })}
                  aktif={aktif}
                >
                  {merek.name}
                </PilihanTautan>
              );
            })}
          </div>
        </Bagian>
      )}

      <Bagian judul="Kondisi Barang">
        <div className="space-y-0.5">
          {[
            { nilai: 'baru', label: 'Baru' },
            { nilai: 'bekas', label: 'Bekas (second)' },
          ].map((pilihan) => (
            <PilihanTautan
              key={pilihan.nilai}
              href={buatUrl(basePath, params, {
                kondisi: kondisi === pilihan.nilai ? null : pilihan.nilai,
              })}
              aktif={kondisi === pilihan.nilai}
            >
              {pilihan.label}
            </PilihanTautan>
          ))}
        </div>
      </Bagian>

      <Bagian judul="Ketersediaan">
        <PilihanTautan
          href={buatUrl(basePath, params, { stok: hanyaTersedia ? null : 'ada' })}
          aktif={hanyaTersedia}
        >
          Hanya yang stoknya ada
        </PilihanTautan>
      </Bagian>
    </div>
  );
}
