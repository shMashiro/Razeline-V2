import Link from 'next/link';

import { Icon } from '@/components/icon';
import { KartuProduk } from '@/components/kartu-produk';
import { Paginasi } from '@/components/paginasi';
import { PanelFilter } from '@/components/panel-filter';
import { PanelFilterMobile } from '@/components/panel-filter-mobile';
import { PilihUrutan } from '@/components/pilih-urutan';
import { URUTAN_PRODUK, type KunciUrutan } from '@/lib/constants';
import { angka, rupiah } from '@/lib/format';
import {
  ambilKategori,
  ambilMerek,
  ambilMerekBerdasarKategori,
  cariProduk,
} from '@/lib/queries';
import { alihkanNilai, bacaAngka, bacaDaftar, bacaParam, buatUrl, type ParamPencarian } from '@/lib/url';
import type { KondisiProduk } from '@/lib/types';

interface Props {
  basePath: string;
  params: ParamPencarian;
  /** Kategori yang sudah dikunci (dipakai halaman /kategori/[slug]). */
  kategoriTetapId?: string;
  /** Tampilkan filter kategori — hanya untuk katalog universal. */
  filterKategori?: boolean;
}

export async function TampilanKatalog({
  basePath,
  params,
  kategoriTetapId,
  filterKategori = false,
}: Props) {
  const q = bacaParam(params, 'q');
  const merekTerpilih = bacaDaftar(params, 'merek');
  const kondisiParam = bacaParam(params, 'kondisi');
  const kondisi: KondisiProduk | null =
    kondisiParam === 'baru' || kondisiParam === 'bekas' ? kondisiParam : null;
  const hargaMin = bacaAngka(params, 'min');
  const hargaMax = bacaAngka(params, 'max');
  const hanyaTersedia = bacaParam(params, 'stok') === 'ada';
  const halaman = bacaAngka(params, 'hal', { min: 1, max: 500 }) ?? 1;
  const urutanParam = bacaParam(params, 'urutan');
  const urutan: KunciUrutan =
    urutanParam && urutanParam in URUTAN_PRODUK ? (urutanParam as KunciUrutan) : 'populer';

  const semuaKategori = await ambilKategori();
  const slugKategoriParam = filterKategori ? bacaParam(params, 'kategori') : undefined;
  const kategoriDariParam = slugKategoriParam
    ? semuaKategori.find((item) => item.slug === slugKategoriParam)
    : undefined;
  const kategoriId = kategoriTetapId ?? kategoriDariParam?.id ?? null;

  const daftarMerek = kategoriId
    ? await ambilMerekBerdasarKategori(kategoriId)
    : await ambilMerek();

  const merekIds = daftarMerek
    .filter((merek) => merekTerpilih.includes(merek.slug))
    .map((merek) => merek.id);

  const hasil = await cariProduk({
    q,
    kategoriId,
    merekIds,
    hargaMin,
    hargaMax,
    kondisi,
    hanyaTersedia,
    urutan,
    halaman,
  });

  const filterAktif: { label: string; href: string }[] = [];
  if (q) filterAktif.push({ label: `Kata kunci: "${q}"`, href: buatUrl(basePath, params, { q: null }) });
  if (kategoriDariParam) {
    filterAktif.push({
      label: kategoriDariParam.name,
      href: buatUrl(basePath, params, { kategori: null }),
    });
  }
  for (const slug of merekTerpilih) {
    const merek = daftarMerek.find((item) => item.slug === slug);
    if (!merek) continue;
    filterAktif.push({
      label: merek.name,
      href: buatUrl(basePath, params, { merek: alihkanNilai(merekTerpilih, slug) }),
    });
  }
  if (hargaMin !== null || hargaMax !== null) {
    filterAktif.push({
      label: `${hargaMin !== null ? rupiah(hargaMin) : 'Rp0'} - ${hargaMax !== null ? rupiah(hargaMax) : 'ke atas'}`,
      href: buatUrl(basePath, params, { min: null, max: null }),
    });
  }
  if (kondisi) {
    filterAktif.push({
      label: kondisi === 'baru' ? 'Kondisi baru' : 'Kondisi bekas',
      href: buatUrl(basePath, params, { kondisi: null }),
    });
  }
  if (hanyaTersedia) {
    filterAktif.push({ label: 'Stok tersedia', href: buatUrl(basePath, params, { stok: null }) });
  }

  const panel = (
    <PanelFilter
      basePath={basePath}
      params={params}
      daftarMerek={daftarMerek}
      merekTerpilih={merekTerpilih}
      daftarKategori={filterKategori ? semuaKategori : undefined}
      kategoriTerpilih={kategoriDariParam?.slug}
      hargaMin={hargaMin}
      hargaMax={hargaMax}
      kondisi={kondisi ?? undefined}
      hanyaTersedia={hanyaTersedia}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-32 card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Filter</h2>
            {filterAktif.length > 0 && (
              <Link
                href={basePath}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Hapus semua
              </Link>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-line bg-white px-4 py-3">
          <p className="text-sm text-ink-500">
            Menampilkan <strong className="text-ink-900">{angka(hasil.items.length)}</strong> dari{' '}
            <strong className="text-ink-900">{angka(hasil.total)}</strong> produk
          </p>
          <div className="flex items-center gap-2">
            <PanelFilterMobile jumlahAktif={filterAktif.length}>{panel}</PanelFilterMobile>
            <PilihUrutan basePath={basePath} params={params} terpilih={urutan} />
          </div>
        </div>

        {filterAktif.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filterAktif.map((filter) => (
              <Link key={filter.label} href={filter.href} scroll={false} className="chip">
                {filter.label}
                <Icon name="tutup" size={13} />
              </Link>
            ))}
            <Link href={basePath} className="text-xs font-semibold text-brand-600 hover:underline">
              Hapus semua
            </Link>
          </div>
        )}

        {hasil.items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-ink-300">
              <Icon name="cari" size={26} />
            </span>
            <h2 className="text-base font-bold">Produk tidak ditemukan</h2>
            <p className="max-w-sm text-sm text-ink-500">
              Coba kurangi filter yang dipakai, atau gunakan kata kunci yang lebih umum. Bisa juga
              tanya langsung ke admin toko lewat WhatsApp.
            </p>
            <Link href={basePath} className="btn btn-outline btn-sm mt-1">
              Atur ulang filter
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {hasil.items.map((produk, indeks) => (
                <KartuProduk key={produk.id} produk={produk} prioritasGambar={indeks < 4} />
              ))}
            </div>

            <div className="pt-4">
              <Paginasi
                basePath={basePath}
                params={params}
                halaman={hasil.halaman}
                totalHalaman={hasil.totalHalaman}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
