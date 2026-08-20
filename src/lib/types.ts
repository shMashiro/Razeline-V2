export type KondisiProduk = 'baru' | 'bekas';

export type StatusPesanan =
  | 'menunggu_konfirmasi'
  | 'dikonfirmasi'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export type StatusPembayaran = 'belum_bayar' | 'menunggu_verifikasi' | 'lunas' | 'refund';

export type PeranPengguna = 'customer' | 'admin';

export interface Kategori {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Merek {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface GambarProduk {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface Produk {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  low_stock_threshold: number;
  condition: KondisiProduk;
  warranty_months: number;
  weight_grams: number;
  specs: Record<string, string>;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  sold_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProdukRingkas
  extends Pick<
    Produk,
    | 'id'
    | 'name'
    | 'slug'
    | 'short_description'
    | 'price'
    | 'compare_at_price'
    | 'stock'
    | 'condition'
    | 'warranty_months'
    | 'rating_avg'
    | 'rating_count'
    | 'sold_count'
  > {
  category: Pick<Kategori, 'name' | 'slug'> | null;
  brand: Pick<Merek, 'name' | 'slug'> | null;
  product_images: Pick<GambarProduk, 'url' | 'alt'>[];
}

export interface ProdukLengkap extends Produk {
  category: Pick<Kategori, 'id' | 'name' | 'slug'> | null;
  brand: Pick<Merek, 'id' | 'name' | 'slug'> | null;
  product_images: GambarProduk[];
}

export interface Ulasan {
  id: string;
  product_id: string;
  user_id: string;
  /** Nama penulis disimpan langsung supaya halaman produk tidak perlu membaca tabel profiles. */
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface MetodePengiriman {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimated_days: string;
  is_active: boolean;
  sort_order: number;
}

export interface MetodePembayaran {
  id: string;
  name: string;
  type: 'transfer' | 'cod' | 'qris' | 'ewallet';
  account_name: string;
  account_number: string;
  instructions: string;
  is_active: boolean;
  sort_order: number;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_spend: number;
  max_discount: number | null;
  quota: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  link_url: string | null;
  cta_label: string;
  sort_order: number;
  is_active: boolean;
}

export interface PengaturanToko {
  store_name: string;
  logo_url: string | null;
  tagline: string;
  address: string;
  whatsapp: string;
  email: string;
  phone: string;
  maps_url: string;
  instagram: string;
  facebook: string;
  operational_hours: string;
  free_shipping_min: number;
  announcement: string;
}

export interface Alamat {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  address_line: string;
  notes: string | null;
  is_default: boolean;
}

export interface ItemPesanan {
  id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface RiwayatStatus {
  id: string;
  status: StatusPesanan;
  note: string;
  created_at: string;
}

export interface Pesanan {
  id: string;
  order_code: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_recipient: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_district: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  shipping_notes: string | null;
  shipping_method_name: string;
  shipping_cost: number;
  payment_method_name: string;
  payment_method_id: string | null;
  subtotal: number;
  discount_amount: number;
  voucher_code: string | null;
  total: number;
  status: StatusPesanan;
  payment_status: StatusPembayaran;
  tracking_number: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface PesananLengkap extends Pesanan {
  order_items: ItemPesanan[];
  order_status_events: RiwayatStatus[];
}

export interface Profil {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: PeranPengguna;
  created_at: string;
}

/** Baris keranjang yang disimpan di localStorage. */
export interface ItemKeranjang {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

/** Status seragam untuk hasil server action pada formulir. */
export interface StatusForm {
  galat?: string;
  info?: string;
}
