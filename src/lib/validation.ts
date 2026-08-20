import { z } from 'zod';

const teks = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} minimal ${min} karakter.`)
    .max(max, `${label} maksimal ${max} karakter.`);

export const skemaTelepon = z
  .string()
  .trim()
  .regex(/^[0-9+][0-9\s()-]{7,19}$/, 'Nomor telepon tidak valid. Contoh: 081234567890.');

export const skemaAlamat = z.object({
  label: teks(2, 30, 'Label alamat').default('Rumah'),
  recipient_name: teks(3, 80, 'Nama penerima'),
  phone: skemaTelepon,
  province: teks(3, 60, 'Provinsi'),
  city: teks(3, 60, 'Kota/Kabupaten'),
  district: z.string().trim().max(60).default(''),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Kode pos harus 5 angka.')
    .or(z.literal(''))
    .default(''),
  address_line: teks(10, 300, 'Alamat lengkap'),
  notes: z.string().trim().max(200).optional().default(''),
  is_default: z.boolean().default(false),
});

export const skemaItemCheckout = z.object({
  product_id: z.uuid('Produk tidak dikenali.'),
  quantity: z.number().int().min(1).max(99),
});

export const skemaCheckout = z.object({
  customer_name: teks(3, 80, 'Nama pemesan'),
  customer_phone: skemaTelepon,
  customer_email: z.union([z.email('Format email tidak valid.'), z.literal('')]).default(''),

  shipping_recipient: teks(3, 80, 'Nama penerima'),
  shipping_phone: skemaTelepon,
  shipping_address: teks(10, 300, 'Alamat lengkap'),
  shipping_district: z.string().trim().max(60).default(''),
  shipping_city: teks(3, 60, 'Kota/Kabupaten'),
  shipping_province: teks(3, 60, 'Provinsi'),
  shipping_postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Kode pos harus 5 angka.')
    .or(z.literal(''))
    .default(''),
  shipping_notes: z.string().trim().max(300).optional().default(''),

  shipping_method_id: z.uuid('Pilih metode pengiriman.'),
  payment_method_id: z.uuid('Pilih metode pembayaran.'),
  voucher_code: z.string().trim().max(30).optional().default(''),

  items: z.array(skemaItemCheckout).min(1, 'Keranjang belanja kosong.').max(50),
  simpan_alamat: z.boolean().default(false),
});

export type DataCheckout = z.infer<typeof skemaCheckout>;

export const skemaProfil = z.object({
  full_name: teks(3, 80, 'Nama lengkap'),
  phone: z.union([skemaTelepon, z.literal('')]).default(''),
});

export const skemaUlasan = z.object({
  product_id: z.uuid(),
  rating: z.number().int().min(1, 'Beri rating 1 sampai 5.').max(5),
  comment: z.string().trim().max(600).default(''),
});

export const skemaKodePesanan = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^RZL-\d{4}-[A-F0-9]{8}$/, 'Format kode pesanan tidak sesuai. Contoh: RZL-2608-A1B2C3D4.');

/* --------------------------- Skema untuk admin --------------------------- */

export const skemaKategoriAdmin = z.object({
  name: teks(2, 60, 'Nama kategori'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .max(80),
  description: z.string().trim().max(300).default(''),
  image_url: z.union([z.url(), z.literal('')]).default(''),
  icon: z.string().trim().max(30).default('box'),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const skemaMerekAdmin = z.object({
  name: teks(1, 60, 'Nama merek'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .max(80),
  is_active: z.boolean().default(true),
});

export const skemaProdukAdmin = z.object({
  name: teks(3, 160, 'Nama produk'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .max(120),
  sku: z.string().trim().max(40).optional().default(''),
  short_description: z.string().trim().max(200).default(''),
  description: z.string().trim().max(6000).default(''),
  category_id: z.union([z.uuid(), z.literal('')]).default(''),
  brand_id: z.union([z.uuid(), z.literal('')]).default(''),
  price: z.coerce.number().min(0, 'Harga tidak boleh minus.').max(999_999_999),
  compare_at_price: z.coerce.number().min(0).max(999_999_999).optional(),
  stock: z.coerce.number().int().min(0).max(100_000),
  low_stock_threshold: z.coerce.number().int().min(0).max(1000).default(3),
  condition: z.enum(['baru', 'bekas']).default('baru'),
  warranty_months: z.coerce.number().int().min(0).max(120).default(0),
  weight_grams: z.coerce.number().int().min(0).max(500_000).default(1000),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  specs: z.record(z.string(), z.string()).default({}),
  images: z.array(z.url()).max(8).default([]),
});

export const skemaVoucherAdmin = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,30}$/, 'Kode hanya boleh huruf kapital dan angka (3-30 karakter).'),
  description: z.string().trim().max(200).default(''),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.coerce.number().positive('Nilai diskon harus lebih dari 0.'),
  min_spend: z.coerce.number().min(0).default(0),
  max_discount: z.coerce.number().min(0).optional(),
  quota: z.coerce.number().int().min(0).optional(),
  starts_at: z.string().optional().default(''),
  ends_at: z.string().optional().default(''),
  is_active: z.boolean().default(true),
});

export const skemaBannerAdmin = z.object({
  title: teks(3, 90, 'Judul banner'),
  subtitle: z.string().trim().max(200).default(''),
  image_url: z.union([z.url(), z.literal('')]).default(''),
  link_url: z.string().trim().max(200).default(''),
  cta_label: z.string().trim().max(40).default('Lihat Produk'),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const skemaPengirimanAdmin = z.object({
  name: teks(3, 60, 'Nama layanan'),
  description: z.string().trim().max(200).default(''),
  cost: z.coerce.number().min(0).max(99_999_999),
  estimated_days: z.string().trim().max(40).default(''),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const skemaPembayaranAdmin = z.object({
  name: teks(3, 60, 'Nama metode'),
  type: z.enum(['transfer', 'cod', 'qris', 'ewallet']),
  account_name: z.string().trim().max(80).default(''),
  account_number: z.string().trim().max(50).default(''),
  instructions: z.string().trim().max(500).default(''),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const skemaPengaturanToko = z.object({
  store_name: teks(2, 80, 'Nama toko'),
  tagline: z.string().trim().max(160).default(''),
  address: teks(10, 300, 'Alamat toko'),
  whatsapp: z.string().trim().max(20).default(''),
  email: z.union([z.email(), z.literal('')]).default(''),
  phone: z.string().trim().max(20).default(''),
  maps_url: z.string().trim().max(300).default(''),
  instagram: z.string().trim().max(200).default(''),
  facebook: z.string().trim().max(200).default(''),
  operational_hours: z.string().trim().max(120).default(''),
  free_shipping_min: z.coerce.number().min(0).max(999_999_999).default(0),
  announcement: z.string().trim().max(200).default(''),
});

export const skemaStatusPesanan = z.object({
  order_id: z.uuid(),
  status: z.enum([
    'menunggu_konfirmasi',
    'dikonfirmasi',
    'diproses',
    'dikirim',
    'selesai',
    'dibatalkan',
  ]),
  payment_status: z.enum(['belum_bayar', 'menunggu_verifikasi', 'lunas', 'refund']),
  tracking_number: z.string().trim().max(60).default(''),
  admin_note: z.string().trim().max(400).default(''),
});

/** Ubah galat zod menjadi pesan tunggal yang mudah dibaca pengguna. */
export function pesanGalat(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Data yang dikirim tidak valid.';
}
