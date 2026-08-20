'use client';

import { useActionState, useState, useTransition } from 'react';

import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import {
  hapusAlamat,
  jadikanAlamatUtama,
  simpanAlamat,
  type StatusAkun,
} from '@/lib/actions/akun';
import { PROVINSI } from '@/lib/constants';
import type { Alamat } from '@/lib/types';

export function KelolaAlamat({ alamat }: { alamat: Alamat[] }) {
  const [sedangDiubah, setSedangDiubah] = useState<Alamat | 'baru' | null>(null);
  const [pesanAksi, setPesanAksi] = useState<StatusAkun>({});
  const [menungguAksi, mulaiAksi] = useTransition();

  // Formulir ditutup langsung setelah alamat berhasil disimpan.
  const [status, aksi, menunggu] = useActionState<StatusAkun, FormData>(
    async (sebelumnya, formData) => {
      const hasil = await simpanAlamat(sebelumnya, formData);
      if (hasil.info) setSedangDiubah(null);
      return hasil;
    },
    {},
  );

  const diubah = sedangDiubah === 'baru' ? null : sedangDiubah;

  return (
    <div className="space-y-4">
      <PesanForm galat={status.galat ?? pesanAksi.galat} info={status.info ?? pesanAksi.info} />

      {alamat.length === 0 && !sedangDiubah && (
        <p className="rounded-lg bg-surface-2 px-4 py-6 text-center text-sm text-ink-500">
          Belum ada alamat tersimpan. Tambahkan alamat agar checkout berikutnya lebih cepat.
        </p>
      )}

      <ul className="space-y-3">
        {alamat.map((item) => (
          <li key={item.id} className="rounded-xl2 border border-line p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  {item.label}
                  {item.is_default && (
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">
                      Utama
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-700">
                  {item.recipient_name} — {item.phone}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-500">
                  {[item.address_line, item.district, item.city, item.province, item.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setSedangDiubah(item)}
                  className="btn btn-ghost btn-sm"
                >
                  <Icon name="pensil" size={14} />
                  Ubah
                </button>
                <button
                  type="button"
                  disabled={menungguAksi}
                  onClick={() =>
                    mulaiAksi(async () => setPesanAksi(await hapusAlamat(item.id)))
                  }
                  className="btn btn-ghost btn-sm text-promo hover:bg-rose-50"
                >
                  <Icon name="hapus" size={14} />
                  Hapus
                </button>
              </div>
            </div>

            {!item.is_default && (
              <button
                type="button"
                disabled={menungguAksi}
                onClick={() =>
                  mulaiAksi(async () => setPesanAksi(await jadikanAlamatUtama(item.id)))
                }
                className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
              >
                Jadikan alamat utama
              </button>
            )}
          </li>
        ))}
      </ul>

      {sedangDiubah ? (
        <form action={aksi} className="space-y-4 rounded-xl2 border border-brand-200 bg-brand-50/40 p-4">
          <h3 className="text-sm font-bold">
            {diubah ? 'Ubah Alamat' : 'Tambah Alamat Baru'}
          </h3>
          {diubah && <input type="hidden" name="id" value={diubah.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Label alamat</span>
              <input
                name="label"
                maxLength={30}
                defaultValue={diubah?.label ?? 'Rumah'}
                className="field"
                placeholder="Rumah / Kantor / Toko"
              />
            </label>
            <label>
              <span className="label">Nama penerima</span>
              <input
                name="recipient_name"
                required
                maxLength={80}
                defaultValue={diubah?.recipient_name ?? ''}
                className="field"
              />
            </label>
            <label>
              <span className="label">Nomor HP</span>
              <input
                name="phone"
                type="tel"
                required
                maxLength={20}
                defaultValue={diubah?.phone ?? ''}
                className="field"
              />
            </label>
            <label>
              <span className="label">Provinsi</span>
              <select
                name="province"
                required
                defaultValue={diubah?.province ?? ''}
                className="field"
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
                name="city"
                required
                maxLength={60}
                defaultValue={diubah?.city ?? ''}
                className="field"
              />
            </label>
            <label>
              <span className="label">Kecamatan</span>
              <input
                name="district"
                maxLength={60}
                defaultValue={diubah?.district ?? ''}
                className="field"
              />
            </label>
            <label>
              <span className="label">Kode pos</span>
              <input
                name="postal_code"
                inputMode="numeric"
                maxLength={5}
                defaultValue={diubah?.postal_code ?? ''}
                className="field"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Alamat lengkap</span>
              <textarea
                name="address_line"
                required
                minLength={10}
                maxLength={300}
                rows={2}
                defaultValue={diubah?.address_line ?? ''}
                className="field"
              />
            </label>
          </div>

          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" name="is_default" defaultChecked={diubah?.is_default ?? false} />
            Jadikan alamat utama
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={menunggu} className="btn btn-primary">
              {menunggu ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
            <button
              type="button"
              onClick={() => setSedangDiubah(null)}
              className="btn btn-outline"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setSedangDiubah('baru')}
          className="btn btn-outline w-full"
        >
          <Icon name="tambah" size={16} />
          Tambah Alamat Baru
        </button>
      )}
    </div>
  );
}
