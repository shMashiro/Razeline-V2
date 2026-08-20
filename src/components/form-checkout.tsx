'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { GambarProduk } from '@/components/gambar-produk';
import { Icon } from '@/components/icon';
import { useKeranjang } from '@/components/keranjang-provider';
import { buatPesanan, cekVoucher } from '@/lib/actions/checkout';
import { PROVINSI } from '@/lib/constants';
import { rupiah } from '@/lib/format';
import type { Alamat, MetodePembayaran, MetodePengiriman, Profil } from '@/lib/types';

interface Props {
  metodePengiriman: MetodePengiriman[];
  metodePembayaran: MetodePembayaran[];
  profil: Profil | null;
  alamatTersimpan: Alamat[];
  minimalGratisOngkir: number;
}

interface IsianForm {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_recipient: string;
  shipping_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string;
  shipping_address: string;
  shipping_notes: string;
}

const ISIAN_KOSONG: IsianForm = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  shipping_recipient: '',
  shipping_phone: '',
  shipping_province: '',
  shipping_city: '',
  shipping_district: '',
  shipping_postal_code: '',
  shipping_address: '',
  shipping_notes: '',
};

function Bagian({
  nomor,
  judul,
  keterangan,
  children,
}: {
  nomor: number;
  judul: string;
  keterangan?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {nomor}
        </span>
        <div>
          <h2 className="text-sm font-bold">{judul}</h2>
          {keterangan && <p className="mt-0.5 text-xs text-ink-500">{keterangan}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export function FormCheckout({
  metodePengiriman,
  metodePembayaran,
  profil,
  alamatTersimpan,
  minimalGratisOngkir,
}: Props) {
  const { items, siap, subtotal, kosongkan } = useKeranjang();
  const router = useRouter();
  const [menunggu, mulai] = useTransition();

  const alamatUtama = alamatTersimpan.find((item) => item.is_default) ?? alamatTersimpan[0];

  const [isian, setIsian] = useState<IsianForm>({
    ...ISIAN_KOSONG,
    customer_name: profil?.full_name ?? '',
    customer_phone: profil?.phone ?? '',
    customer_email: profil?.email ?? '',
    shipping_recipient: alamatUtama?.recipient_name ?? profil?.full_name ?? '',
    shipping_phone: alamatUtama?.phone ?? profil?.phone ?? '',
    shipping_province: alamatUtama?.province ?? '',
    shipping_city: alamatUtama?.city ?? '',
    shipping_district: alamatUtama?.district ?? '',
    shipping_postal_code: alamatUtama?.postal_code ?? '',
    shipping_address: alamatUtama?.address_line ?? '',
  });

  const [alamatDipilih, setAlamatDipilih] = useState<string>(alamatUtama?.id ?? 'baru');
  const [idPengiriman, setIdPengiriman] = useState(metodePengiriman[0]?.id ?? '');
  const [idPembayaran, setIdPembayaran] = useState(metodePembayaran[0]?.id ?? '');
  const [simpanAlamat, setSimpanAlamat] = useState(false);

  const [kodeVoucher, setKodeVoucher] = useState('');
  const [voucherAktif, setVoucherAktif] = useState<{ kode: string; potongan: number } | null>(null);
  const [pesanVoucher, setPesanVoucher] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memeriksaVoucher, mulaiPeriksaVoucher] = useTransition();

  const [galat, setGalat] = useState<string | null>(null);

  const pengirimanTerpilih = metodePengiriman.find((item) => item.id === idPengiriman);
  const pembayaranTerpilih = metodePembayaran.find((item) => item.id === idPembayaran);

  const ringkasan = useMemo(() => {
    const potongan = voucherAktif?.potongan ?? 0;
    const setelahDiskon = Math.max(0, subtotal - potongan);
    const gratisOngkir = minimalGratisOngkir > 0 && setelahDiskon >= minimalGratisOngkir;
    const ongkir = gratisOngkir ? 0 : Number(pengirimanTerpilih?.cost ?? 0);
    return { potongan, ongkir, gratisOngkir, total: setelahDiskon + ongkir };
  }, [subtotal, voucherAktif, pengirimanTerpilih, minimalGratisOngkir]);

  const ubah = (kunci: keyof IsianForm) => (nilai: string) =>
    setIsian((sebelumnya) => ({ ...sebelumnya, [kunci]: nilai }));

  const pilihAlamat = (id: string) => {
    setAlamatDipilih(id);
    if (id === 'baru') {
      setIsian((s) => ({
        ...s,
        shipping_recipient: s.customer_name,
        shipping_phone: s.customer_phone,
        shipping_province: '',
        shipping_city: '',
        shipping_district: '',
        shipping_postal_code: '',
        shipping_address: '',
      }));
      return;
    }
    const alamat = alamatTersimpan.find((item) => item.id === id);
    if (!alamat) return;
    setIsian((s) => ({
      ...s,
      shipping_recipient: alamat.recipient_name,
      shipping_phone: alamat.phone,
      shipping_province: alamat.province,
      shipping_city: alamat.city,
      shipping_district: alamat.district,
      shipping_postal_code: alamat.postal_code,
      shipping_address: alamat.address_line,
    }));
  };

  const periksaVoucher = () => {
    setPesanVoucher(null);
    mulaiPeriksaVoucher(async () => {
      const hasil = await cekVoucher(kodeVoucher, subtotal);
      if (hasil.ok) {
        setVoucherAktif({ kode: kodeVoucher.trim().toUpperCase(), potongan: hasil.potongan });
        setPesanVoucher({
          ok: true,
          teks: `Voucher dipakai. Potongan ${rupiah(hasil.potongan)}.`,
        });
      } else {
        setVoucherAktif(null);
        setPesanVoucher({ ok: false, teks: hasil.pesan });
      }
    });
  };

  const kirim = (event: React.FormEvent) => {
    event.preventDefault();
    setGalat(null);

    mulai(async () => {
      const hasil = await buatPesanan({
        ...isian,
        shipping_method_id: idPengiriman,
        payment_method_id: idPembayaran,
        voucher_code: voucherAktif?.kode ?? '',
        simpan_alamat: simpanAlamat && alamatDipilih === 'baru',
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });

      if (!hasil.ok) {
        setGalat(hasil.pesan);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      kosongkan();
      router.push(`/checkout/berhasil/${hasil.kode}`);
    });
  };

  if (!siap) {
    return <div className="skeleton h-96 rounded-xl2" />;
  }

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-2 text-ink-300">
          <Icon name="keranjang" size={30} />
        </span>
        <h2 className="text-base font-bold">Tidak ada barang untuk di-checkout</h2>
        <p className="max-w-sm text-sm text-ink-500">
          Masukkan produk ke keranjang terlebih dahulu sebelum melakukan pemesanan.
        </p>
        <Link href="/katalog" className="btn btn-primary mt-1">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={kirim} className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-5">
        {galat && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl2 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <Icon name="peringatan" size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Pesanan belum bisa diproses</p>
              <p className="mt-0.5">{galat}</p>
            </div>
          </div>
        )}

        {!profil && (
          <div className="flex items-start gap-2.5 rounded-xl2 border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
            <Icon name="info" size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Anda memesan tanpa akun</p>
              <p className="mt-0.5 leading-relaxed">
                Tidak masalah — setelah pesanan dibuat Anda akan menerima kode pesanan yang bisa
                dipakai untuk mengecek status kapan saja tanpa login.{' '}
                <Link href="/masuk?lanjut=%2Fcheckout" className="font-semibold underline">
                  Masuk dulu
                </Link>{' '}
                bila ingin riwayat pesanan tersimpan otomatis.
              </p>
            </div>
          </div>
        )}

        <Bagian nomor={1} judul="Informasi Pelanggan" keterangan="Dipakai admin untuk menghubungi Anda.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Nama lengkap</span>
              <input
                required
                maxLength={80}
                className="field"
                name="customer_name"
                value={isian.customer_name}
                onChange={(e) => ubah('customer_name')(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                autoComplete="name"
              />
            </label>
            <label>
              <span className="label">Nomor WhatsApp / HP</span>
              <input
                required
                type="tel"
                maxLength={20}
                className="field"
                name="customer_phone"
                value={isian.customer_phone}
                onChange={(e) => ubah('customer_phone')(e.target.value)}
                placeholder="081234567890"
                autoComplete="tel"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="label">
                Email <span className="font-normal text-ink-300">(opsional)</span>
              </span>
              <input
                type="email"
                maxLength={120}
                className="field"
                name="customer_email"
                value={isian.customer_email}
                onChange={(e) => ubah('customer_email')(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
              />
            </label>
          </div>
        </Bagian>

        <Bagian nomor={2} judul="Alamat Pengiriman" keterangan="Tulis selengkap mungkin agar kurir mudah menemukan.">
          {alamatTersimpan.length > 0 && (
            <div className="mb-4 space-y-2">
              {alamatTersimpan.map((alamat) => (
                <label
                  key={alamat.id}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                    alamatDipilih === alamat.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-line hover:border-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="alamat"
                    className="mt-1"
                    checked={alamatDipilih === alamat.id}
                    onChange={() => pilihAlamat(alamat.id)}
                  />
                  <span className="text-sm">
                    <span className="font-semibold">
                      {alamat.label} — {alamat.recipient_name}
                    </span>
                    <span className="mt-0.5 block text-ink-500">
                      {alamat.address_line}, {alamat.city}, {alamat.province}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                  alamatDipilih === 'baru'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-line hover:border-brand-300'
                }`}
              >
                <input
                  type="radio"
                  name="alamat"
                  className="mt-1"
                  checked={alamatDipilih === 'baru'}
                  onChange={() => pilihAlamat('baru')}
                />
                <span className="text-sm font-semibold">Pakai alamat lain</span>
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Nama penerima</span>
              <input
                required
                maxLength={80}
                className="field"
                name="shipping_recipient"
                autoComplete="shipping name"
                value={isian.shipping_recipient}
                onChange={(e) => ubah('shipping_recipient')(e.target.value)}
              />
            </label>
            <label>
              <span className="label">Nomor HP penerima</span>
              <input
                required
                type="tel"
                maxLength={20}
                className="field"
                name="shipping_phone"
                autoComplete="shipping tel"
                value={isian.shipping_phone}
                onChange={(e) => ubah('shipping_phone')(e.target.value)}
              />
            </label>
            <label>
              <span className="label">Provinsi</span>
              <select
                required
                className="field"
                name="shipping_province"
                autoComplete="shipping address-level1"
                value={isian.shipping_province}
                onChange={(e) => ubah('shipping_province')(e.target.value)}
              >
                <option value="">Pilih provinsi</option>
                {PROVINSI.map((provinsi) => (
                  <option key={provinsi} value={provinsi}>
                    {provinsi}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Kota / Kabupaten</span>
              <input
                required
                maxLength={60}
                className="field"
                name="shipping_city"
                autoComplete="shipping address-level2"
                value={isian.shipping_city}
                onChange={(e) => ubah('shipping_city')(e.target.value)}
                placeholder="Contoh: Kabupaten Lebak"
              />
            </label>
            <label>
              <span className="label">
                Kecamatan <span className="font-normal text-ink-300">(opsional)</span>
              </span>
              <input
                maxLength={60}
                className="field"
                name="shipping_district"
                value={isian.shipping_district}
                onChange={(e) => ubah('shipping_district')(e.target.value)}
                placeholder="Contoh: Cibeber"
              />
            </label>
            <label>
              <span className="label">
                Kode pos <span className="font-normal text-ink-300">(opsional)</span>
              </span>
              <input
                inputMode="numeric"
                maxLength={5}
                pattern="\d{5}"
                className="field"
                name="shipping_postal_code"
                autoComplete="shipping postal-code"
                value={isian.shipping_postal_code}
                onChange={(e) =>
                  ubah('shipping_postal_code')(e.target.value.replace(/\D/g, '').slice(0, 5))
                }
                placeholder="42394"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Alamat lengkap</span>
              <textarea
                required
                minLength={10}
                maxLength={300}
                rows={3}
                className="field"
                name="shipping_address"
                autoComplete="shipping street-address"
                value={isian.shipping_address}
                onChange={(e) => ubah('shipping_address')(e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW, kampung, patokan terdekat"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="label">
                Catatan untuk kurir <span className="font-normal text-ink-300">(opsional)</span>
              </span>
              <input
                maxLength={300}
                className="field"
                name="shipping_notes"
                value={isian.shipping_notes}
                onChange={(e) => ubah('shipping_notes')(e.target.value)}
                placeholder="Contoh: titip ke warung depan bila rumah kosong"
              />
            </label>
          </div>

          {profil && alamatDipilih === 'baru' && (
            <label className="mt-4 flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={simpanAlamat}
                onChange={(e) => setSimpanAlamat(e.target.checked)}
              />
              Simpan alamat ini untuk pemesanan berikutnya
            </label>
          )}
        </Bagian>

        <Bagian nomor={3} judul="Produk yang Dipesan" keterangan={`${items.length} jenis barang.`}>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  <GambarProduk
                    url={item.image}
                    nama={item.name}
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {item.quantity} x {rupiah(item.price)}
                  </p>
                </div>
                <p className="price shrink-0 text-sm font-semibold">
                  {rupiah(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/keranjang" className="btn btn-ghost btn-sm mt-3">
            <Icon name="pensil" size={15} />
            Ubah keranjang
          </Link>
        </Bagian>

        <Bagian nomor={4} judul="Opsi Pengiriman">
          <div className="space-y-2">
            {metodePengiriman.map((metode) => (
              <label
                key={metode.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  idPengiriman === metode.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-line hover:border-brand-300'
                }`}
              >
                <input
                  type="radio"
                  name="pengiriman"
                  className="mt-1"
                  checked={idPengiriman === metode.id}
                  onChange={() => setIdPengiriman(metode.id)}
                />
                <span className="flex-1 text-sm">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{metode.name}</span>
                    <span className="price font-semibold">
                      {Number(metode.cost) === 0 ? 'Gratis' : rupiah(metode.cost)}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-ink-500">{metode.description}</span>
                  {metode.estimated_days && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                      <Icon name="jam" size={12} />
                      Estimasi {metode.estimated_days}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </Bagian>

        <Bagian nomor={5} judul="Metode Pembayaran">
          <div className="space-y-2">
            {metodePembayaran.map((metode) => (
              <label
                key={metode.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                  idPembayaran === metode.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-line hover:border-brand-300'
                }`}
              >
                <input
                  type="radio"
                  name="pembayaran"
                  className="mt-1"
                  checked={idPembayaran === metode.id}
                  onChange={() => setIdPembayaran(metode.id)}
                />
                <span className="flex-1 text-sm">
                  <span className="font-semibold">{metode.name}</span>
                  {metode.account_number && metode.account_number !== '-' && (
                    <span className="mt-0.5 block text-ink-500">
                      {metode.account_number} a.n. {metode.account_name}
                    </span>
                  )}
                  {metode.instructions && (
                    <span className="mt-1 block text-xs text-ink-500">{metode.instructions}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </Bagian>

        <Bagian nomor={6} judul="Kode Voucher" keterangan="Isi bila Anda punya kode promo dari toko.">
          <div className="flex gap-2">
            <input
              className="field uppercase"
              maxLength={30}
              value={kodeVoucher}
              onChange={(e) => setKodeVoucher(e.target.value.toUpperCase())}
              placeholder="RAZELINE10"
              aria-label="Kode voucher"
            />
            <button
              type="button"
              onClick={periksaVoucher}
              disabled={memeriksaVoucher || kodeVoucher.trim().length < 3}
              className="btn btn-outline shrink-0"
            >
              {memeriksaVoucher ? 'Mengecek...' : 'Pakai'}
            </button>
          </div>
          {pesanVoucher && (
            <p
              role="status"
              className={`mt-2 flex items-center gap-1.5 text-sm ${
                pesanVoucher.ok ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              <Icon name={pesanVoucher.ok ? 'centang' : 'peringatan'} size={15} />
              {pesanVoucher.teks}
            </p>
          )}
        </Bagian>
      </div>

      {/* Rincian pembayaran */}
      <aside className="card sticky top-32 p-5">
        <h2 className="text-sm font-bold">Rincian Pembayaran</h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Total harga barang</dt>
            <dd className="price font-medium">{rupiah(subtotal)}</dd>
          </div>

          {ringkasan.potongan > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Potongan voucher</dt>
              <dd className="price font-medium">-{rupiah(ringkasan.potongan)}</dd>
            </div>
          )}

          <div className="flex justify-between">
            <dt className="text-ink-500">
              Ongkos kirim
              {pengirimanTerpilih && (
                <span className="block text-xs text-ink-300">{pengirimanTerpilih.name}</span>
              )}
            </dt>
            <dd className="price font-medium">
              {ringkasan.ongkir === 0 ? (
                <span className="text-emerald-700">Gratis</span>
              ) : (
                rupiah(ringkasan.ongkir)
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold">Total Tagihan</span>
          <span className="price text-xl font-bold text-brand-700">{rupiah(ringkasan.total)}</span>
        </div>

        {pembayaranTerpilih && (
          <p className="mt-2 text-xs text-ink-500">
            Dibayar dengan <strong>{pembayaranTerpilih.name}</strong>
          </p>
        )}

        <button type="submit" disabled={menunggu} className="btn btn-primary btn-lg mt-5 w-full">
          {menunggu ? 'Memproses pesanan...' : 'Buat Pesanan'}
        </button>

        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
          <Icon name="whatsapp" size={14} className="mt-0.5 shrink-0 text-emerald-600" />
          Setelah pesanan dibuat, Anda akan diarahkan ke WhatsApp admin untuk konfirmasi. Stok
          barang dikunci begitu pesanan tercatat.
        </p>
      </aside>
    </form>
  );
}
