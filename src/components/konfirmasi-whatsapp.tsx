import { Icon } from '@/components/icon';

/**
 * Ajakan mengonfirmasi pesanan ke admin lewat WhatsApp.
 *
 * Tautan sengaja dibuka di tab baru supaya halaman status pesanan tetap
 * terbuka — pelanggan masih perlu melihat kode pesanan dan nomor rekening
 * setelah mengirim pesan.
 */
export function KonfirmasiWhatsApp({ tautan }: { tautan: string }) {
  return (
    <div className="rounded-xl2 border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <Icon name="whatsapp" size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Langkah terakhir: konfirmasi ke admin
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-emerald-800">
              Pesan berisi rincian pesanan Anda sudah kami siapkan. Tekan tombol di samping —
              WhatsApp terbuka di tab baru, halaman ini tetap bisa Anda lihat.
            </p>
          </div>
        </div>

        <a
          href={tautan}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-lg shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Icon name="whatsapp" size={18} />
          Buka WhatsApp
        </a>
      </div>
    </div>
  );
}
