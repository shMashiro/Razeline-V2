import { nomorWhatsApp, rupiah, tanggalJam } from '@/lib/format';
import type { ItemPesanan, Pesanan } from '@/lib/types';

interface PesananUntukWhatsApp extends Pick<
  Pesanan,
  | 'order_code'
  | 'customer_name'
  | 'customer_phone'
  | 'shipping_recipient'
  | 'shipping_phone'
  | 'shipping_address'
  | 'shipping_district'
  | 'shipping_city'
  | 'shipping_province'
  | 'shipping_postal_code'
  | 'shipping_method_name'
  | 'shipping_cost'
  | 'payment_method_name'
  | 'subtotal'
  | 'discount_amount'
  | 'voucher_code'
  | 'total'
  | 'created_at'
> {
  order_items: Pick<ItemPesanan, 'product_name' | 'quantity' | 'unit_price' | 'subtotal'>[];
}

/**
 * Menyusun tautan wa.me berisi ringkasan pesanan untuk dikonfirmasi
 * pelanggan ke admin toko.
 */
export function tautanKonfirmasiWhatsApp(
  nomorToko: string,
  pesanan: PesananUntukWhatsApp,
  urlLacak: string,
): string {
  const daftarBarang = pesanan.order_items
    .map(
      (item, index) =>
        `${index + 1}. ${item.product_name}\n   ${item.quantity} x ${rupiah(item.unit_price)} = ${rupiah(item.subtotal)}`,
    )
    .join('\n');

  const alamat = [
    pesanan.shipping_address,
    pesanan.shipping_district,
    pesanan.shipping_city,
    pesanan.shipping_province,
    pesanan.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  const baris = [
    'Halo Razeline Komputer, saya ingin mengonfirmasi pesanan berikut.',
    '',
    `Kode Pesanan: ${pesanan.order_code}`,
    `Tanggal: ${tanggalJam(pesanan.created_at)}`,
    '',
    'DATA PEMESAN',
    `Nama: ${pesanan.customer_name}`,
    `No. HP: ${pesanan.customer_phone}`,
    '',
    'ALAMAT PENGIRIMAN',
    `Penerima: ${pesanan.shipping_recipient} (${pesanan.shipping_phone})`,
    alamat,
    '',
    'RINCIAN BARANG',
    daftarBarang,
    '',
    `Subtotal: ${rupiah(pesanan.subtotal)}`,
    pesanan.discount_amount > 0
      ? `Diskon${pesanan.voucher_code ? ` (${pesanan.voucher_code})` : ''}: -${rupiah(pesanan.discount_amount)}`
      : null,
    `Pengiriman (${pesanan.shipping_method_name}): ${pesanan.shipping_cost > 0 ? rupiah(pesanan.shipping_cost) : 'Gratis'}`,
    `TOTAL: ${rupiah(pesanan.total)}`,
    '',
    `Metode Pembayaran: ${pesanan.payment_method_name}`,
    '',
    `Cek status: ${urlLacak}`,
  ]
    .filter((item) => item !== null)
    .join('\n');

  return `https://wa.me/${nomorWhatsApp(nomorToko)}?text=${encodeURIComponent(baris)}`;
}

/** Tautan WhatsApp umum, misalnya tombol "tanya stok" pada halaman produk. */
export function tautanWhatsApp(nomorToko: string, pesan: string): string {
  return `https://wa.me/${nomorWhatsApp(nomorToko)}?text=${encodeURIComponent(pesan)}`;
}
