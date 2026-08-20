'use client';

import { useActionState } from 'react';

import { PesanForm } from '@/components/pesan-form';
import { simpanPengaturan } from '@/lib/actions/admin-operasional';
import type { PengaturanToko, StatusForm } from '@/lib/types';

function Bagian({ judul, keterangan, children }: { judul: string; keterangan: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-sm font-bold">{judul}</h2>
      <p className="mt-0.5 mb-4 text-xs text-ink-500">{keterangan}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormPengaturan({ pengaturan }: { pengaturan: PengaturanToko }) {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(simpanPengaturan, {});

  return (
    <form action={aksi} className="space-y-5">
      <PesanForm galat={status.galat} info={status.info} />

      <Bagian judul="Identitas Toko" keterangan="Muncul di header, footer, dan judul halaman.">
        <label>
          <span className="label">Nama toko</span>
          <input name="store_name" required maxLength={80} className="field" defaultValue={pengaturan.store_name} />
        </label>
        <label>
          <span className="label">Slogan singkat</span>
          <input name="tagline" maxLength={160} className="field" defaultValue={pengaturan.tagline} />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Alamat toko</span>
          <textarea
            name="address"
            required
            rows={2}
            maxLength={300}
            className="field"
            defaultValue={pengaturan.address}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Jam operasional</span>
          <input
            name="operational_hours"
            maxLength={120}
            className="field"
            defaultValue={pengaturan.operational_hours}
            placeholder="Senin - Sabtu, 08.00 - 17.00 WIB"
          />
        </label>
      </Bagian>

      <Bagian judul="Kontak" keterangan="Nomor WhatsApp dipakai untuk konfirmasi pesanan pelanggan.">
        <label>
          <span className="label">Nomor WhatsApp</span>
          <input
            name="whatsapp"
            maxLength={20}
            className="field"
            defaultValue={pengaturan.whatsapp}
            placeholder="6281234567890"
          />
          <span className="mt-1 block text-xs text-ink-500">
            Tulis dengan awalan 62 atau 08, keduanya diterima.
          </span>
        </label>
        <label>
          <span className="label">Nomor telepon</span>
          <input name="phone" maxLength={20} className="field" defaultValue={pengaturan.phone} />
        </label>
        <label>
          <span className="label">Email toko</span>
          <input name="email" type="email" maxLength={120} className="field" defaultValue={pengaturan.email} />
        </label>
        <label>
          <span className="label">Tautan Google Maps</span>
          <input name="maps_url" maxLength={300} className="field" defaultValue={pengaturan.maps_url} />
        </label>
        <label>
          <span className="label">Tautan Instagram</span>
          <input name="instagram" maxLength={200} className="field" defaultValue={pengaturan.instagram} />
        </label>
        <label>
          <span className="label">Tautan Facebook</span>
          <input name="facebook" maxLength={200} className="field" defaultValue={pengaturan.facebook} />
        </label>
      </Bagian>

      <Bagian judul="Kebijakan Belanja" keterangan="Aturan yang langsung memengaruhi perhitungan di checkout.">
        <label>
          <span className="label">Minimal belanja gratis ongkir (Rp)</span>
          <input
            name="free_shipping_min"
            type="number"
            min={0}
            step={100000}
            className="field"
            defaultValue={pengaturan.free_shipping_min}
          />
          <span className="mt-1 block text-xs text-ink-500">
            Isi 0 untuk menonaktifkan promo gratis ongkir.
          </span>
        </label>
        <label>
          <span className="label">Pengumuman di header</span>
          <input
            name="announcement"
            maxLength={200}
            className="field"
            defaultValue={pengaturan.announcement}
            placeholder="Kosongkan bila tidak ada pengumuman."
          />
        </label>
      </Bagian>

      <button type="submit" disabled={menunggu} className="btn btn-primary btn-lg">
        {menunggu ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>
    </form>
  );
}
