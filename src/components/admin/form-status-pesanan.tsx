'use client';

import { useActionState } from 'react';

import { PesanForm } from '@/components/pesan-form';
import { perbaruiStatusPesanan } from '@/lib/actions/admin-operasional';
import { LABEL_STATUS_BAYAR, LABEL_STATUS_PESANAN } from '@/lib/constants';
import type { Pesanan, StatusForm } from '@/lib/types';

export function FormStatusPesanan({ pesanan }: { pesanan: Pesanan }) {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(
    perbaruiStatusPesanan,
    {},
  );

  return (
    <form action={aksi} className="space-y-4">
      <input type="hidden" name="order_id" value={pesanan.id} />
      <PesanForm galat={status.galat} info={status.info} />

      <label>
        <span className="label">Status pesanan</span>
        <select name="status" className="field" defaultValue={pesanan.status}>
          {Object.entries(LABEL_STATUS_PESANAN).map(([kunci, info]) => (
            <option key={kunci} value={kunci}>
              {info.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="label">Status pembayaran</span>
        <select name="payment_status" className="field" defaultValue={pesanan.payment_status}>
          {Object.entries(LABEL_STATUS_BAYAR).map(([kunci, info]) => (
            <option key={kunci} value={kunci}>
              {info.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="label">
          Nomor resi <span className="font-normal text-ink-300">(opsional)</span>
        </span>
        <input
          name="tracking_number"
          maxLength={60}
          className="field"
          defaultValue={pesanan.tracking_number ?? ''}
          placeholder="JNE123456789"
        />
      </label>

      <label>
        <span className="label">
          Catatan untuk pelanggan <span className="font-normal text-ink-300">(opsional)</span>
        </span>
        <textarea
          name="admin_note"
          rows={3}
          maxLength={400}
          className="field"
          defaultValue={pesanan.admin_note ?? ''}
          placeholder="Contoh: barang dikirim besok pagi lewat kurir toko."
        />
      </label>

      <button type="submit" disabled={menunggu} className="btn btn-primary w-full">
        {menunggu ? 'Menyimpan...' : 'Perbarui Pesanan'}
      </button>

      <p className="text-xs leading-relaxed text-ink-500">
        Mengubah status menjadi <strong>Dibatalkan</strong> otomatis mengembalikan stok barang dan
        kuota voucher yang terpakai.
      </p>
    </form>
  );
}
