import { LABEL_STATUS_BAYAR, LABEL_STATUS_PESANAN } from '@/lib/constants';
import type { StatusPembayaran, StatusPesanan } from '@/lib/types';

export function LencanaStatus({ status }: { status: StatusPesanan }) {
  const info = LABEL_STATUS_PESANAN[status];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${info.warna}`}
    >
      {info.label}
    </span>
  );
}

export function LencanaBayar({ status }: { status: StatusPembayaran }) {
  const info = LABEL_STATUS_BAYAR[status];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${info.warna}`}
    >
      {info.label}
    </span>
  );
}
