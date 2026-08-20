'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { SalinTeks } from '@/components/salin-teks';
import {
  konfirmasiPendaftaran2FA,
  mulaiPendaftaran2FA,
  nonaktifkan2FA,
} from '@/lib/actions/keamanan';

interface Props {
  aktif: boolean;
  faktor: { id: string; friendly_name?: string | null }[];
}

interface Pendaftaran {
  factorId: string;
  qr: string;
  secret: string;
}

export function PengaturanDuaLangkah({ aktif, faktor }: Props) {
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null);
  const [kode, setKode] = useState('');
  const [pesan, setPesan] = useState<{ galat?: string; info?: string }>({});
  const [menunggu, mulai] = useTransition();
  const router = useRouter();

  const mulaiDaftar = () => {
    setPesan({});
    mulai(async () => {
      const hasil = await mulaiPendaftaran2FA();
      if (hasil.ok) {
        setPendaftaran({ factorId: hasil.factorId, qr: hasil.qr, secret: hasil.secret });
      } else {
        setPesan({ galat: hasil.galat });
      }
    });
  };

  const konfirmasi = () => {
    if (!pendaftaran) return;
    setPesan({});
    mulai(async () => {
      const hasil = await konfirmasiPendaftaran2FA(pendaftaran.factorId, kode);
      if (hasil.ok) {
        setPendaftaran(null);
        setKode('');
        setPesan({ info: hasil.info });
        router.refresh();
      } else {
        setPesan({ galat: hasil.galat });
      }
    });
  };

  const matikan = (factorId: string) => {
    if (
      !window.confirm(
        'Nonaktifkan autentikasi dua langkah? Akun admin Anda akan lebih rentan disalahgunakan.',
      )
    ) {
      return;
    }
    setPesan({});
    mulai(async () => {
      const hasil = await nonaktifkan2FA(factorId);
      if (hasil.ok) {
        setPesan({ info: hasil.info });
        router.refresh();
      } else {
        setPesan({ galat: hasil.galat });
      }
    });
  };

  return (
    <div className="space-y-4">
      <PesanForm galat={pesan.galat} info={pesan.info} />

      {aktif ? (
        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Icon name="perisai" size={18} />
            Autentikasi dua langkah aktif
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Setiap kali masuk, Anda akan diminta memasukkan kode 6 angka dari aplikasi autentikator.
          </p>

          <ul className="mt-4 space-y-2">
            {faktor.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line p-3"
              >
                <span className="text-sm">
                  <span className="font-medium">
                    {item.friendly_name || 'Aplikasi autentikator'}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">Terverifikasi</span>
                </span>
                <button
                  type="button"
                  disabled={menunggu}
                  onClick={() => matikan(item.id)}
                  className="btn btn-outline btn-sm text-promo"
                >
                  Nonaktifkan
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : pendaftaran ? (
        <div className="card p-5">
          <h2 className="text-sm font-bold">Pindai kode QR ini</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Buka Google Authenticator, Authy, atau aplikasi sejenis di ponsel Anda, lalu pindai kode
            di bawah ini.
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-44 shrink-0 rounded-xl2 border border-line bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendaftaran.qr} alt="Kode QR autentikasi dua langkah" className="w-full" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-ink-500">
                  Tidak bisa memindai? Masukkan kode ini secara manual:
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <code className="price rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-bold tracking-wider">
                    {pendaftaran.secret}
                  </code>
                  <SalinTeks teks={pendaftaran.secret} label="Salin" />
                </div>
              </div>

              <label>
                <span className="label">Masukkan kode 6 angka dari aplikasi</span>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={kode}
                  onChange={(event) => setKode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="field text-center text-xl font-bold tracking-[0.4em]"
                  placeholder="000000"
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={konfirmasi}
                  disabled={menunggu || kode.length !== 6}
                  className="btn btn-primary"
                >
                  {menunggu ? 'Memeriksa...' : 'Aktifkan'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendaftaran(null)}
                  className="btn btn-outline"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-warn">
            <Icon name="peringatan" size={18} />
            Autentikasi dua langkah belum aktif
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Panel admin memegang kendali penuh atas produk, harga, dan pesanan toko. Aktifkan
            verifikasi dua langkah agar akun tetap aman meskipun kata sandi bocor.
          </p>
          <button
            type="button"
            onClick={mulaiDaftar}
            disabled={menunggu}
            className="btn btn-primary mt-4"
          >
            <Icon name="perisai" size={16} />
            {menunggu ? 'Menyiapkan...' : 'Aktifkan Sekarang'}
          </button>
        </div>
      )}
    </div>
  );
}
