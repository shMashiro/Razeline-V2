const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('id-ID');

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
});

/** Rp1.250.000 */
export function rupiah(value: number | string | null | undefined): string {
  const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);
  return rupiahFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

/** 1.250 */
export function angka(value: number | string | null | undefined): string {
  const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);
  return numberFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}

/** 20 Agustus 2026 */
export function tanggal(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date);
}

/** 20 Agu 2026, 14.30 */
export function tanggalJam(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormatter.format(date);
}

/** Persentase potongan harga, dibulatkan ke bawah. */
export function persentaseDiskon(price: number, compareAtPrice: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.floor(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** Ubah nomor telepon lokal menjadi format internasional untuk WhatsApp. */
export function nomorWhatsApp(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

/** Ubah teks bebas menjadi slug URL. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
