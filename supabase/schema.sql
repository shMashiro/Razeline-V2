-- =============================================================
-- Razeline Komputer — skema database (PostgreSQL / Supabase)
-- Menjalankan file ini akan MERESET seluruh schema `public`.
-- =============================================================

drop schema if exists public cascade;
create schema public;
alter schema public owner to postgres;

grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- -------------------------------------------------------------
-- Utilitas
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

create or replace function public.generate_order_code()
returns text language sql volatile as $fn$
  select 'RZL-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMM') || '-'
      || upper(encode(extensions.gen_random_bytes(4), 'hex'));
$fn$;

-- -------------------------------------------------------------
-- Profil pengguna
-- -------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cek peran admin tanpa memicu rekursi RLS pada tabel profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $fn$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$fn$;

-- Profil dibuat otomatis saat user baru mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- Alamat pengiriman tersimpan
-- -------------------------------------------------------------
create table public.addresses (
  id             uuid primary key default extensions.gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  label          text not null default 'Rumah',
  recipient_name text not null,
  phone          text not null,
  province       text not null,
  city           text not null,
  district       text not null default '',
  postal_code    text not null default '',
  address_line   text not null,
  notes          text,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);

-- Hanya boleh ada satu alamat utama per pengguna.
create or replace function public.ensure_single_default_address()
returns trigger language plpgsql as $fn$
begin
  update public.addresses set is_default = false
  where user_id = new.user_id and id <> new.id and is_default;
  return null;
end;
$fn$;
create trigger addresses_single_default after insert or update of is_default on public.addresses
  for each row when (new.is_default) execute function public.ensure_single_default_address();

-- -------------------------------------------------------------
-- Katalog
-- -------------------------------------------------------------
create table public.categories (
  id          uuid primary key default extensions.gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  icon        text not null default 'box',
  image_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index categories_active_idx on public.categories (is_active, sort_order);

create table public.brands (
  id         uuid primary key default extensions.gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id                  uuid primary key default extensions.gen_random_uuid(),
  sku                 text unique,
  name                text not null,
  slug                text not null unique,
  short_description   text not null default '',
  description         text not null default '',
  category_id         uuid references public.categories(id) on delete set null,
  brand_id            uuid references public.brands(id) on delete set null,
  price               numeric(12,2) not null check (price >= 0),
  compare_at_price    numeric(12,2) check (compare_at_price >= 0),
  stock               int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 3,
  condition           text not null default 'baru' check (condition in ('baru', 'bekas')),
  warranty_months     int not null default 0,
  weight_grams        int not null default 1000,
  specs               jsonb not null default '{}'::jsonb,
  is_active           boolean not null default true,
  is_featured         boolean not null default false,
  view_count          int not null default 0,
  sold_count          int not null default 0,
  rating_avg          numeric(3,2) not null default 0,
  rating_count        int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  search_text         text generated always as (
    lower(coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(short_description, ''))
  ) stored
);
create index products_category_idx on public.products (category_id) where is_active;
create index products_brand_idx    on public.products (brand_id) where is_active;
create index products_price_idx    on public.products (price) where is_active;
create index products_popular_idx  on public.products (view_count desc) where is_active;
create index products_newest_idx   on public.products (created_at desc) where is_active;
create index products_search_idx   on public.products using gin (search_text extensions.gin_trgm_ops);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id         uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

-- -------------------------------------------------------------
-- Ulasan
-- -------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default extensions.gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  -- Nama penulis disimpan langsung agar halaman produk tidak perlu
  -- membaca tabel profiles yang tertutup untuk pengunjung.
  author_name text not null default '',
  order_id    uuid,
  rating      int not null check (rating between 1 and 5),
  comment     text not null default '',
  is_approved boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews (product_id) where is_approved;

create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  target uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_avg = coalesce(agg.avg_rating, 0),
      rating_count = coalesce(agg.total, 0)
  from (
    select round(avg(rating)::numeric, 2) as avg_rating, count(*) as total
    from public.reviews where product_id = target and is_approved
  ) agg
  where p.id = target;
  return null;
end;
$fn$;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- -------------------------------------------------------------
-- Wishlist
-- -------------------------------------------------------------
create table public.wishlist_items (
  id         uuid primary key default extensions.gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index wishlist_user_idx on public.wishlist_items (user_id);

-- -------------------------------------------------------------
-- Pengiriman, pembayaran, voucher, banner
-- -------------------------------------------------------------
create table public.shipping_methods (
  id             uuid primary key default extensions.gen_random_uuid(),
  name           text not null,
  description    text not null default '',
  cost           numeric(12,2) not null default 0 check (cost >= 0),
  estimated_days text not null default '',
  is_active      boolean not null default true,
  sort_order     int not null default 0
);

create table public.payment_methods (
  id             uuid primary key default extensions.gen_random_uuid(),
  name           text not null,
  type           text not null default 'transfer' check (type in ('transfer', 'cod', 'qris', 'ewallet')),
  account_name   text not null default '',
  account_number text not null default '',
  instructions   text not null default '',
  is_active      boolean not null default true,
  sort_order     int not null default 0
);

create table public.vouchers (
  id             uuid primary key default extensions.gen_random_uuid(),
  code           text not null unique,
  description    text not null default '',
  discount_type  text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_spend      numeric(12,2) not null default 0,
  max_discount   numeric(12,2),
  quota          int,
  used_count     int not null default 0,
  starts_at      timestamptz,
  ends_at        timestamptz,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table public.banners (
  id         uuid primary key default extensions.gen_random_uuid(),
  title      text not null,
  subtitle   text not null default '',
  image_url  text,
  link_url   text,
  cta_label  text not null default 'Lihat Produk',
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.store_settings (
  id                int primary key default 1 check (id = 1),
  store_name        text not null default 'Razeline Komputer',
  logo_url          text,
  tagline           text not null default '',
  address           text not null default '',
  whatsapp          text not null default '',
  email             text not null default '',
  phone             text not null default '',
  maps_url          text not null default '',
  instagram         text not null default '',
  facebook          text not null default '',
  operational_hours text not null default '',
  free_shipping_min numeric(12,2) not null default 0,
  announcement      text not null default '',
  updated_at        timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Pesanan
-- -------------------------------------------------------------
create table public.orders (
  id                    uuid primary key default extensions.gen_random_uuid(),
  order_code            text not null unique,
  user_id               uuid references public.profiles(id) on delete set null,
  customer_name         text not null,
  customer_phone        text not null,
  customer_email        text,
  shipping_recipient    text not null,
  shipping_phone        text not null,
  shipping_address      text not null,
  shipping_district     text not null default '',
  shipping_city         text not null,
  shipping_province     text not null,
  shipping_postal_code  text not null default '',
  shipping_notes        text,
  shipping_method_id    uuid references public.shipping_methods(id) on delete set null,
  shipping_method_name  text not null,
  shipping_cost         numeric(12,2) not null default 0,
  payment_method_id     uuid references public.payment_methods(id) on delete set null,
  payment_method_name   text not null,
  subtotal              numeric(12,2) not null default 0,
  discount_amount       numeric(12,2) not null default 0,
  voucher_code          text,
  total                 numeric(12,2) not null default 0,
  status                text not null default 'menunggu_konfirmasi'
                        check (status in ('menunggu_konfirmasi','dikonfirmasi','diproses','dikirim','selesai','dibatalkan')),
  payment_status        text not null default 'belum_bayar'
                        check (payment_status in ('belum_bayar','menunggu_verifikasi','lunas','refund')),
  tracking_number       text,
  admin_note            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index orders_user_idx    on public.orders (user_id, created_at desc);
create index orders_status_idx  on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id            uuid primary key default extensions.gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  product_slug  text not null default '',
  product_image text,
  unit_price    numeric(12,2) not null,
  quantity      int not null check (quantity > 0),
  subtotal      numeric(12,2) not null
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_status_events (
  id         uuid primary key default extensions.gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  note       text not null default '',
  created_at timestamptz not null default now()
);
create index order_status_events_order_idx on public.order_status_events (order_id, created_at);

-- Kembalikan stok bila pesanan dibatalkan.
create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  update public.products p
  set stock = p.stock + oi.quantity,
      sold_count = greatest(p.sold_count - oi.quantity, 0)
  from public.order_items oi
  where oi.order_id = new.id and oi.product_id = p.id;

  if new.voucher_code is not null then
    update public.vouchers set used_count = greatest(used_count - 1, 0)
    where code = new.voucher_code;
  end if;
  return null;
end;
$fn$;
create trigger orders_restock after update of status on public.orders
  for each row when (new.status = 'dibatalkan' and old.status <> 'dibatalkan')
  execute function public.restock_on_cancel();

-- Catat setiap perubahan status ke riwayat.
create or replace function public.log_order_status()
returns trigger language plpgsql as $fn$
begin
  insert into public.order_status_events (order_id, status, note)
  values (new.id, new.status, coalesce(new.admin_note, ''));
  return null;
end;
$fn$;
create trigger orders_log_status after insert on public.orders
  for each row execute function public.log_order_status();
create trigger orders_log_status_change after update of status on public.orders
  for each row when (new.status is distinct from old.status)
  execute function public.log_order_status();

-- -------------------------------------------------------------
-- Transaksi pembuatan pesanan (atomik, harga dihitung di server)
-- -------------------------------------------------------------
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_items      jsonb := coalesce(payload->'items', '[]'::jsonb);
  v_item       jsonb;
  v_product    public.products%rowtype;
  v_image      text;
  v_qty        int;
  v_subtotal   numeric(12,2) := 0;
  v_discount   numeric(12,2) := 0;
  v_ship_cost  numeric(12,2) := 0;
  v_shipping   public.shipping_methods%rowtype;
  v_payment    public.payment_methods%rowtype;
  v_voucher    public.vouchers%rowtype;
  v_code       text := upper(trim(coalesce(payload->>'voucher_code', '')));
  v_free_min   numeric(12,2) := 0;
  v_order_id   uuid;
  v_order_code text;
  v_lines      jsonb := '[]'::jsonb;
begin
  if jsonb_array_length(v_items) = 0 then
    raise exception 'Keranjang belanja kosong.';
  end if;
  if jsonb_array_length(v_items) > 50 then
    raise exception 'Maksimal 50 jenis produk per pesanan.';
  end if;

  select * into v_shipping from public.shipping_methods
  where id = (payload->>'shipping_method_id')::uuid and is_active;
  if not found then
    raise exception 'Metode pengiriman tidak tersedia.';
  end if;

  select * into v_payment from public.payment_methods
  where id = (payload->>'payment_method_id')::uuid and is_active;
  if not found then
    raise exception 'Metode pembayaran tidak tersedia.';
  end if;

  -- Validasi + kunci stok. Harga selalu diambil dari database, bukan dari klien.
  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := greatest(coalesce((v_item->>'quantity')::int, 0), 0);
    if v_qty = 0 then
      continue;
    end if;
    if v_qty > 99 then
      raise exception 'Jumlah pembelian per produk maksimal 99.';
    end if;

    select * into v_product from public.products
    where id = (v_item->>'product_id')::uuid and is_active
    for update;

    if not found then
      raise exception 'Produk tidak ditemukan atau sudah tidak dijual.';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Stok % tersisa %.', v_product.name, v_product.stock;
    end if;

    select url into v_image from public.product_images
    where product_id = v_product.id order by sort_order limit 1;

    update public.products
    set stock = stock - v_qty, sold_count = sold_count + v_qty
    where id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'product_slug', v_product.slug,
      'product_image', v_image,
      'unit_price', v_product.price,
      'quantity', v_qty,
      'subtotal', v_product.price * v_qty
    );
  end loop;

  if jsonb_array_length(v_lines) = 0 then
    raise exception 'Keranjang belanja kosong.';
  end if;

  if v_code <> '' then
    select * into v_voucher from public.vouchers
    where code = v_code and is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    for update;

    if not found then
      raise exception 'Kode voucher tidak valid atau sudah kedaluwarsa.';
    end if;
    if v_voucher.quota is not null and v_voucher.used_count >= v_voucher.quota then
      raise exception 'Kuota voucher sudah habis.';
    end if;
    if v_subtotal < v_voucher.min_spend then
      raise exception 'Belanja belum memenuhi minimum voucher.';
    end if;

    v_discount := case
      when v_voucher.discount_type = 'percent' then v_subtotal * v_voucher.discount_value / 100
      else v_voucher.discount_value
    end;
    if v_voucher.max_discount is not null then
      v_discount := least(v_discount, v_voucher.max_discount);
    end if;
    v_discount := round(least(v_discount, v_subtotal), 2);

    update public.vouchers set used_count = used_count + 1 where id = v_voucher.id;
  end if;

  -- Gratis ongkir bila memenuhi minimum belanja toko.
  select free_shipping_min into v_free_min from public.store_settings where id = 1;
  v_ship_cost := v_shipping.cost;
  if coalesce(v_free_min, 0) > 0 and (v_subtotal - v_discount) >= v_free_min then
    v_ship_cost := 0;
  end if;

  v_order_code := public.generate_order_code();

  insert into public.orders (
    order_code, user_id, customer_name, customer_phone, customer_email,
    shipping_recipient, shipping_phone, shipping_address, shipping_district,
    shipping_city, shipping_province, shipping_postal_code, shipping_notes,
    shipping_method_id, shipping_method_name, shipping_cost,
    payment_method_id, payment_method_name,
    subtotal, discount_amount, voucher_code, total
  ) values (
    v_order_code,
    nullif(payload->>'user_id', '')::uuid,
    payload->>'customer_name',
    payload->>'customer_phone',
    nullif(payload->>'customer_email', ''),
    payload->>'shipping_recipient',
    payload->>'shipping_phone',
    payload->>'shipping_address',
    coalesce(payload->>'shipping_district', ''),
    payload->>'shipping_city',
    payload->>'shipping_province',
    coalesce(payload->>'shipping_postal_code', ''),
    nullif(payload->>'shipping_notes', ''),
    v_shipping.id, v_shipping.name, v_ship_cost,
    v_payment.id, v_payment.name,
    v_subtotal, v_discount, nullif(v_code, ''),
    v_subtotal - v_discount + v_ship_cost
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, product_id, product_name, product_slug, product_image, unit_price, quantity, subtotal
  )
  select v_order_id,
         (l->>'product_id')::uuid,
         l->>'product_name',
         l->>'product_slug',
         l->>'product_image',
         (l->>'unit_price')::numeric,
         (l->>'quantity')::int,
         (l->>'subtotal')::numeric
  from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('id', v_order_id, 'order_code', v_order_code);
end;
$fn$;

revoke all on function public.create_order(jsonb) from public, anon, authenticated;

-- Penambah jumlah kunjungan produk (dipakai untuk urutan "terpopuler").
create or replace function public.increment_product_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  update public.products set view_count = view_count + 1 where slug = p_slug and is_active;
end;
$fn$;

revoke all on function public.increment_product_view(text) from public, anon, authenticated;

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.addresses           enable row level security;
alter table public.categories          enable row level security;
alter table public.brands              enable row level security;
alter table public.products            enable row level security;
alter table public.product_images      enable row level security;
alter table public.reviews             enable row level security;
alter table public.wishlist_items      enable row level security;
alter table public.shipping_methods    enable row level security;
alter table public.payment_methods     enable row level security;
alter table public.vouchers            enable row level security;
alter table public.banners             enable row level security;
alter table public.store_settings      enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.order_status_events enable row level security;

-- Katalog: publik hanya boleh membaca data yang aktif.
create policy "katalog kategori" on public.categories       for select using (is_active or public.is_admin());
create policy "katalog brand"    on public.brands           for select using (is_active or public.is_admin());
create policy "katalog produk"   on public.products         for select using (is_active or public.is_admin());
create policy "katalog gambar"   on public.product_images   for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin()))
);
create policy "katalog banner"   on public.banners          for select using (is_active or public.is_admin());
create policy "katalog ongkir"   on public.shipping_methods for select using (is_active or public.is_admin());
create policy "katalog bayar"    on public.payment_methods  for select using (is_active or public.is_admin());
create policy "info toko"        on public.store_settings   for select using (true);
create policy "ulasan publik"    on public.reviews          for select using (is_approved or public.is_admin());

-- Profil: hanya milik sendiri (atau admin).
create policy "profil sendiri"      on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "ubah profil sendiri" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Alamat & wishlist: milik pengguna.
create policy "alamat sendiri"   on public.addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlist sendiri" on public.wishlist_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Pesanan: pemilik atau admin. Pesanan tamu diakses lewat server (service role).
create policy "pesanan sendiri" on public.orders for select
  using ((user_id is not null and user_id = auth.uid()) or public.is_admin());
create policy "item pesanan sendiri" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id
          and ((o.user_id is not null and o.user_id = auth.uid()) or public.is_admin()))
);
create policy "riwayat pesanan sendiri" on public.order_status_events for select using (
  exists (select 1 from public.orders o where o.id = order_id
          and ((o.user_id is not null and o.user_id = auth.uid()) or public.is_admin()))
);

-- Voucher tidak boleh dibaca publik; validasi dilakukan di server.
create policy "voucher admin" on public.vouchers for select using (public.is_admin());

-- -------------------------------------------------------------
-- Hak akses tabel: kunci publik hanya bisa membaca.
-- Seluruh penulisan berjalan lewat server action (service role).
-- -------------------------------------------------------------
grant select on
  public.categories, public.brands, public.products, public.product_images,
  public.banners, public.shipping_methods, public.payment_methods,
  public.store_settings, public.reviews
to anon, authenticated;

grant select on public.profiles, public.orders, public.order_items, public.order_status_events to authenticated;
grant update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses, public.wishlist_items to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- -------------------------------------------------------------
-- Penyimpanan gambar produk
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media dibaca publik" on storage.objects;
create policy "media dibaca publik" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media dikelola admin" on storage.objects;
create policy "media dikelola admin" on storage.objects
  for all using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

notify pgrst, 'reload schema';
