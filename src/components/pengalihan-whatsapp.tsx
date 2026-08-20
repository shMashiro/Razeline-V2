'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/icon';

interface Props {
  tautan: string;
  detik?: number;
}

/**
 * Mengarahkan pelanggan ke WhatsApp admin untuk konfirmasi pesanan.
 * Pengalihan otomatis bisa dibatalkan bila pelanggan ingin membaca dulu.
 */
export function PengalihanWhatsApp({ tautan, detik = 8 }: Props) {
  const [sisa, setSisa] = useState(detik);
  const [dibatalkan, setDibatalkan] = useState(false);

  useEffect(() => {
    if (dibatalkan) return;
    if (sisa <= 0) {
      window.location.href = tautan;
      return;
    }
    const timer = setTimeout(() => setSisa((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [sisa, dibatalkan, tautan]);

  return (
    <div className="rounded-xl2 border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon name="whatsapp" size={22} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Langkah terakhir: konfirmasi ke admin
            </p>
            <p className="mt-0.5 text-sm text-emerald-800">
              {dibatalkan
                ? 'Tekan tombol di samping bila sudah siap mengirim konfirmasi.'
                : `Anda akan diarahkan ke WhatsApp admin dalam ${sisa} detik.`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!dibatalkan && (
            <button
              type="button"
              onClick={() => setDibatalkan(true)}
              className="btn btn-outline btn-sm"
            >
              Nanti saja
            </button>
          )}
          <a
            href={tautan}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Buka WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
