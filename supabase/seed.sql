-- =============================================================
-- Data awal Razeline Komputer.
-- Aman dijalankan ulang (idempoten lewat ON CONFLICT).
-- =============================================================

-- Informasi toko -----------------------------------------------
insert into public.store_settings (
  id, store_name, tagline, address, whatsapp, email, phone,
  operational_hours, free_shipping_min, announcement
) values (
  1,
  'Razeline Komputer',
  'Toko komputer & elektronik terpercaya di Cibeber, Lebak',
  'Kp. Nagrak, Jl. Raya Cikotok - Paris Kuray, Kec. Cibeber, Kab. Lebak, Prov. Banten',
  '6281234567890',
  'halo@razelinekomputer.id',
  '081234567890',
  'Senin - Sabtu, 08.00 - 17.00 WIB',
  5000000,
  'Gratis ongkir untuk pembelian di atas Rp5.000.000 — berlaku se-Kabupaten Lebak.'
)
on conflict (id) do update set
  store_name = excluded.store_name,
  tagline = excluded.tagline,
  address = excluded.address,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  phone = excluded.phone,
  operational_hours = excluded.operational_hours,
  free_shipping_min = excluded.free_shipping_min,
  announcement = excluded.announcement;

-- Kategori ------------------------------------------------------
insert into public.categories (name, slug, description, icon, sort_order) values
  ('Laptop',              'laptop',              'Laptop kerja, kuliah, desain, dan gaming.',                'laptop',   1),
  ('Komputer Rakitan',    'komputer-rakitan',    'PC rakitan siap pakai untuk kantor sampai editing berat.',  'desktop',  2),
  ('Processor',           'processor',           'Prosesor Intel dan AMD generasi terbaru.',                  'cpu',      3),
  ('Motherboard',         'motherboard',         'Mainboard untuk semua soket populer.',                      'board',    4),
  ('Kartu Grafis',        'kartu-grafis',        'VGA card untuk gaming, rendering, dan AI.',                 'gpu',      5),
  ('RAM & Penyimpanan',   'ram-penyimpanan',     'Memori RAM, SSD NVMe, SSD SATA, dan hard disk.',            'memory',   6),
  ('Monitor',             'monitor',             'Monitor kantor sampai monitor gaming refresh rate tinggi.', 'monitor',  7),
  ('Keyboard & Mouse',    'keyboard-mouse',      'Perangkat input kabel maupun nirkabel.',                    'keyboard', 8),
  ('Printer & Scanner',   'printer-scanner',     'Printer tinta, laser, dan mesin scan dokumen.',             'printer',  9),
  ('Jaringan & Router',   'jaringan-router',     'Router, access point, switch, dan kabel LAN.',              'network',  10),
  ('Audio & Speaker',     'audio-speaker',       'Speaker, headset, dan perangkat audio komputer.',           'audio',    11),
  ('Aksesoris & Power',   'aksesoris-power',     'UPS, stabilizer, kabel, cooling pad, dan pendukung lain.',  'plug',     12)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  icon = excluded.icon, sort_order = excluded.sort_order;

-- Merek ---------------------------------------------------------
insert into public.brands (name, slug) values
  ('ASUS', 'asus'), ('Acer', 'acer'), ('Lenovo', 'lenovo'), ('HP', 'hp'),
  ('Dell', 'dell'), ('MSI', 'msi'), ('Intel', 'intel'), ('AMD', 'amd'),
  ('Logitech', 'logitech'), ('Samsung', 'samsung'), ('Seagate', 'seagate'),
  ('Kingston', 'kingston'), ('Epson', 'epson'), ('Canon', 'canon'),
  ('TP-Link', 'tp-link'), ('Rexus', 'rexus'), ('V-GeN', 'v-gen'), ('ICA', 'ica')
on conflict (slug) do update set name = excluded.name;

-- Metode pengiriman ---------------------------------------------
insert into public.shipping_methods (name, description, cost, estimated_days, sort_order) values
  ('Ambil di Toko',        'Bayar di tempat, barang diambil langsung di toko Nagrak.', 0,      'Hari ini',  1),
  ('Kurir Toko (Cibeber)', 'Diantar kurir toko untuk area Kecamatan Cibeber.',         15000,  '1 hari',    2),
  ('Kurir Toko (Lebak)',   'Diantar kurir toko untuk area Kabupaten Lebak.',           35000,  '1 - 2 hari', 3),
  ('JNE Reguler',          'Pengiriman ke seluruh Indonesia via JNE REG.',             45000,  '2 - 5 hari', 4),
  ('J&T Express',          'Pengiriman ke seluruh Indonesia via J&T.',                 42000,  '2 - 4 hari', 5)
on conflict do nothing;

-- Metode pembayaran ---------------------------------------------
insert into public.payment_methods (name, type, account_name, account_number, instructions, sort_order) values
  ('Transfer Bank BCA',  'transfer', 'Razeline Komputer', '1234567890',
   'Transfer sesuai total tagihan, lalu kirim bukti transfer lewat WhatsApp.', 1),
  ('Transfer Bank BRI',  'transfer', 'Razeline Komputer', '098765432100',
   'Transfer sesuai total tagihan, lalu kirim bukti transfer lewat WhatsApp.', 2),
  ('QRIS',               'qris',     'Razeline Komputer', '-',
   'Scan QRIS yang dikirim admin lewat WhatsApp setelah pesanan dibuat.', 3),
  ('COD / Bayar di Toko','cod',      '-', '-',
   'Bayar tunai saat barang diterima atau saat pengambilan di toko.', 4)
on conflict do nothing;

-- Voucher contoh ------------------------------------------------
insert into public.vouchers (code, description, discount_type, discount_value, min_spend, max_discount, quota, is_active) values
  ('RAZELINE10', 'Diskon 10% untuk semua produk, maksimal Rp250.000.', 'percent', 10, 1000000, 250000, 100, true),
  ('HEMAT50K',   'Potongan langsung Rp50.000 tanpa minimum tinggi.',   'fixed',   50000, 500000, null,  200, true),
  ('PELAJAR',    'Diskon 5% khusus pelajar dan mahasiswa.',            'percent', 5,   0,       100000, null, true)
on conflict (code) do update set
  description = excluded.description, discount_type = excluded.discount_type,
  discount_value = excluded.discount_value, min_spend = excluded.min_spend,
  max_discount = excluded.max_discount, quota = excluded.quota;

-- Banner beranda ------------------------------------------------
insert into public.banners (title, subtitle, link_url, cta_label, sort_order) values
  ('Rakit PC Impian, Harga Kampung', 'Konsultasi gratis dengan teknisi kami sebelum membeli. Garansi resmi setiap komponen.', '/kategori/komputer-rakitan', 'Lihat PC Rakitan', 1),
  ('Laptop Kuliah & Kerja Mulai 3 Jutaan', 'Stok ready, bisa dicoba langsung di toko Nagrak, Cibeber.', '/kategori/laptop', 'Lihat Laptop', 2),
  ('Upgrade SSD, Komputer Lama Jadi Ngebut', 'Gratis jasa pasang untuk pembelian SSD di toko.', '/kategori/ram-penyimpanan', 'Lihat SSD & RAM', 3)
on conflict do nothing;

-- Produk --------------------------------------------------------
insert into public.products (
  sku, name, slug, short_description, description,
  category_id, brand_id, price, compare_at_price, stock,
  condition, warranty_months, weight_grams, specs, is_featured, view_count, sold_count
)
select
  d.sku, d.name, d.slug, d.short_description, d.description,
  c.id, b.id, d.price, d.compare_at_price, d.stock,
  d.condition, d.warranty_months, d.weight_grams, d.specs::jsonb,
  d.is_featured, d.view_count, d.sold_count
from (values
  ('LP-001', 'ASUS Vivobook 14 A1404VA Core i5-1335U', 'asus-vivobook-14-a1404va-core-i5',
   'Laptop tipis 14 inci untuk kuliah dan kerja kantoran, sudah SSD 512GB.',
   'ASUS Vivobook 14 dengan prosesor Intel Core i5-1335U, RAM 16GB, dan SSD NVMe 512GB. Bodi ringan 1,4 kg, layar 14 inci FHD anti-silau, serta engsel 180 derajat. Cocok untuk mahasiswa, guru, dan pekerja kantoran yang butuh laptop awet dan cepat.',
   'laptop', 'asus', 8750000, 9450000, 6, 'baru', 24, 1800,
   '{"Prosesor":"Intel Core i5-1335U","RAM":"16GB DDR4","Penyimpanan":"SSD NVMe 512GB","Layar":"14\" FHD IPS 60Hz","Grafis":"Intel Iris Xe","Sistem Operasi":"Windows 11 Home","Berat":"1,4 kg"}',
   true, 412, 23),

  ('LP-002', 'Lenovo IdeaPad Slim 3 Ryzen 5 7520U', 'lenovo-ideapad-slim-3-ryzen-5-7520u',
   'Laptop harian hemat daya dengan baterai tahan lama.',
   'Lenovo IdeaPad Slim 3 memakai AMD Ryzen 5 7520U, RAM 16GB LPDDR5, dan SSD 512GB. Baterai mampu bertahan seharian untuk pemakaian dokumen dan browsing. Sudah termasuk Windows 11 original.',
   'laptop', 'lenovo', 7250000, 7900000, 4, 'baru', 24, 1750,
   '{"Prosesor":"AMD Ryzen 5 7520U","RAM":"16GB LPDDR5","Penyimpanan":"SSD NVMe 512GB","Layar":"14\" FHD TN","Grafis":"AMD Radeon 610M","Sistem Operasi":"Windows 11 Home","Berat":"1,37 kg"}',
   true, 356, 18),

  ('LP-003', 'Acer Nitro V 15 RTX 3050 Core i5-13420H', 'acer-nitro-v-15-rtx-3050',
   'Laptop gaming entry level dengan RTX 3050 dan layar 144Hz.',
   'Acer Nitro V 15 hadir dengan Intel Core i5-13420H, GPU NVIDIA RTX 3050 6GB, RAM 16GB, dan SSD 512GB. Layar 15,6 inci FHD 144Hz membuat game terasa mulus. Sistem pendingin ganda menjaga suhu tetap aman saat sesi panjang.',
   'laptop', 'acer', 12900000, 13750000, 3, 'baru', 24, 2400,
   '{"Prosesor":"Intel Core i5-13420H","RAM":"16GB DDR5","Penyimpanan":"SSD NVMe 512GB","Layar":"15,6\" FHD 144Hz","Grafis":"NVIDIA RTX 3050 6GB","Sistem Operasi":"Windows 11 Home","Berat":"2,1 kg"}',
   true, 688, 11),

  ('LP-004', 'HP 245 G9 Ryzen 3 5425U', 'hp-245-g9-ryzen-3-5425u',
   'Laptop kantor terjangkau, cocok untuk administrasi dan sekolah.',
   'HP 245 G9 dengan Ryzen 3 5425U, RAM 8GB, dan SSD 256GB. Ringan, hemat daya, dan mudah diupgrade. Pilihan ekonomis untuk kebutuhan mengetik, Excel, dan presentasi.',
   'laptop', 'hp', 5450000, null, 8, 'baru', 12, 1700,
   '{"Prosesor":"AMD Ryzen 3 5425U","RAM":"8GB DDR4","Penyimpanan":"SSD NVMe 256GB","Layar":"14\" HD","Grafis":"AMD Radeon Graphics","Sistem Operasi":"Windows 11 Home","Berat":"1,47 kg"}',
   false, 221, 27),

  ('PC-001', 'PC Rakitan Kantor Ryzen 5 5600G', 'pc-rakitan-kantor-ryzen-5-5600g',
   'PC siap pakai untuk kantor, warnet, dan tugas sekolah.',
   'Paket PC rakitan lengkap dengan Ryzen 5 5600G, RAM 16GB, SSD 512GB, dan casing berpendingin baik. Sudah dirakit, dites, dan dipasang sistem operasi oleh teknisi kami. Tinggal colok monitor dan langsung dipakai.',
   'komputer-rakitan', 'amd', 6350000, 6900000, 5, 'baru', 12, 8500,
   '{"Prosesor":"AMD Ryzen 5 5600G","RAM":"16GB DDR4 3200MHz","Penyimpanan":"SSD NVMe 512GB","Motherboard":"A520M","PSU":"500W 80+ Bronze","Grafis":"Radeon Vega 7 (onboard)"}',
   true, 534, 14),

  ('PC-002', 'PC Rakitan Gaming Core i5-12400F + RTX 4060', 'pc-rakitan-gaming-i5-12400f-rtx-4060',
   'PC gaming 1080p high setting, siap main game berat.',
   'PC rakitan gaming dengan Core i5-12400F, RTX 4060 8GB, RAM 16GB DDR4, dan SSD NVMe 1TB. Dirakit rapi dengan manajemen kabel dan diuji stabil sebelum dikirim. Bergaransi toko satu tahun.',
   'komputer-rakitan', 'intel', 14750000, 15900000, 2, 'baru', 12, 12000,
   '{"Prosesor":"Intel Core i5-12400F","RAM":"16GB DDR4 3200MHz","Penyimpanan":"SSD NVMe 1TB","Grafis":"NVIDIA RTX 4060 8GB","PSU":"650W 80+ Bronze","Casing":"Mid Tower + 4 fan ARGB"}',
   true, 903, 7),

  ('PC-003', 'PC Rakitan Editing Ryzen 7 5700X', 'pc-rakitan-editing-ryzen-7-5700x',
   'Delapan inti untuk editing video dan desain grafis.',
   'Konfigurasi 8 inti 16 thread dengan RAM 32GB dan SSD 1TB. Cocok untuk Adobe Premiere, Photoshop, AutoCAD, dan rendering ringan. Bisa dikustom sesuai kebutuhan, konsultasikan dulu dengan teknisi kami.',
   'komputer-rakitan', 'amd', 13250000, null, 2, 'baru', 12, 11000,
   '{"Prosesor":"AMD Ryzen 7 5700X","RAM":"32GB DDR4 3200MHz","Penyimpanan":"SSD NVMe 1TB","Grafis":"NVIDIA RTX 3060 12GB","PSU":"650W 80+ Bronze","Pendingin":"Air cooler tower"}',
   false, 287, 4),

  ('CPU-001', 'Intel Core i5-12400F', 'intel-core-i5-12400f',
   'Prosesor 6 inti favorit untuk PC gaming hemat biaya.',
   'Intel Core i5-12400F, 6 core 12 thread, boost hingga 4,4GHz. Performa gaming tinggi dengan konsumsi daya wajar. Tanpa grafis terintegrasi, wajib dipasangkan dengan kartu grafis.',
   'processor', 'intel', 2150000, 2350000, 12, 'baru', 36, 300,
   '{"Soket":"LGA 1700","Inti / Thread":"6 / 12","Base Clock":"2,5 GHz","Turbo":"4,4 GHz","TDP":"65W","Grafis Terintegrasi":"Tidak ada"}',
   false, 445, 31),

  ('CPU-002', 'AMD Ryzen 5 5600G', 'amd-ryzen-5-5600g',
   'Prosesor dengan grafis bawaan, bisa main game ringan tanpa VGA.',
   'Ryzen 5 5600G punya 6 core 12 thread dan grafis Radeon Vega 7 bawaan. Solusi hemat untuk PC kantor atau gaming ringan tanpa perlu membeli kartu grafis terpisah.',
   'processor', 'amd', 1875000, 2050000, 15, 'baru', 36, 300,
   '{"Soket":"AM4","Inti / Thread":"6 / 12","Base Clock":"3,9 GHz","Turbo":"4,4 GHz","TDP":"65W","Grafis Terintegrasi":"Radeon Vega 7"}',
   true, 512, 44),

  ('MB-001', 'ASUS PRIME B550M-K DDR4', 'asus-prime-b550m-k-ddr4',
   'Motherboard AM4 mATX stabil dengan slot NVMe.',
   'ASUS PRIME B550M-K mendukung prosesor Ryzen seri 3000 hingga 5000, dua slot M.2, dan empat slot RAM DDR4. Pilihan aman untuk rakitan harian maupun gaming.',
   'motherboard', 'asus', 1450000, null, 9, 'baru', 24, 900,
   '{"Soket":"AM4","Form Factor":"Micro ATX","Slot RAM":"4x DDR4 (maks 128GB)","Slot M.2":"2","LAN":"Realtek 1Gb","Audio":"Realtek 7.1"}',
   false, 198, 16),

  ('MB-002', 'MSI PRO H610M-E DDR4', 'msi-pro-h610m-e-ddr4',
   'Motherboard LGA 1700 hemat untuk PC kantor.',
   'MSI PRO H610M-E mendukung Intel generasi ke-12 dan ke-13 dengan memori DDR4. Desain sederhana, dingin, dan mudah dipasang untuk rakitan pertama.',
   'motherboard', 'msi', 1250000, 1390000, 7, 'baru', 24, 850,
   '{"Soket":"LGA 1700","Form Factor":"Micro ATX","Slot RAM":"2x DDR4 (maks 64GB)","Slot M.2":"1","LAN":"Realtek 1Gb","Audio":"Realtek 7.1"}',
   false, 143, 9),

  ('VGA-001', 'ASUS Dual RTX 4060 OC 8GB', 'asus-dual-rtx-4060-oc-8gb',
   'Kartu grafis 1080p kencang dengan DLSS 3.',
   'ASUS Dual RTX 4060 OC 8GB GDDR6 mendukung ray tracing dan DLSS 3. Dua kipas Axial-tech menjaga suhu tetap rendah dan suara tetap tenang. Ideal untuk gaming 1080p high hingga ultra.',
   'kartu-grafis', 'asus', 5250000, 5650000, 4, 'baru', 36, 1200,
   '{"GPU":"NVIDIA RTX 4060","Memori":"8GB GDDR6","Bus":"128-bit","Port":"3x DisplayPort, 1x HDMI","Daya Disarankan":"550W","Panjang":"227 mm"}',
   true, 741, 12),

  ('VGA-002', 'MSI GeForce GTX 1650 Ventus XS 4GB', 'msi-gtx-1650-ventus-xs-4gb',
   'VGA hemat daya tanpa kabel PCIe tambahan.',
   'GTX 1650 4GB cocok untuk upgrade PC kantor menjadi mampu bermain game populer di setting menengah. Tidak butuh konektor daya tambahan sehingga aman untuk PSU standar.',
   'kartu-grafis', 'msi', 2350000, null, 6, 'baru', 24, 800,
   '{"GPU":"NVIDIA GTX 1650","Memori":"4GB GDDR6","Bus":"128-bit","Port":"1x DisplayPort, 1x HDMI, 1x DVI","Daya Disarankan":"300W","Panjang":"172 mm"}',
   false, 389, 22),

  ('RAM-001', 'Kingston FURY Beast 16GB DDR4 3200MHz', 'kingston-fury-beast-16gb-ddr4-3200',
   'RAM single 16GB untuk upgrade cepat dan murah.',
   'Kingston FURY Beast 16GB DDR4 3200MHz dengan heatsink rendah sehingga muat di casing sempit. Plug and play lewat profil XMP, garansi seumur hidup dari distributor resmi.',
   'ram-penyimpanan', 'kingston', 685000, 750000, 20, 'baru', 24, 120,
   '{"Kapasitas":"16GB (1x16GB)","Tipe":"DDR4","Kecepatan":"3200 MHz","Latensi":"CL16","Tegangan":"1,35V","Garansi":"Seumur hidup"}',
   true, 623, 58),

  ('SSD-001', 'Samsung 980 NVMe 1TB', 'samsung-980-nvme-1tb',
   'SSD NVMe 1TB, baca hingga 3.500 MB/s.',
   'Samsung 980 NVMe M.2 1TB memberi lonjakan kecepatan besar dibanding hard disk biasa. Booting Windows di bawah 10 detik dan transfer file jauh lebih ringkas. Gratis jasa pemasangan di toko.',
   'ram-penyimpanan', 'samsung', 1195000, 1350000, 14, 'baru', 60, 100,
   '{"Kapasitas":"1TB","Antarmuka":"PCIe 3.0 x4 NVMe","Form Factor":"M.2 2280","Baca":"3.500 MB/s","Tulis":"3.000 MB/s","Garansi":"5 tahun"}',
   true, 812, 63),

  ('SSD-002', 'V-GeN SSD SATA 512GB', 'v-gen-ssd-sata-512gb',
   'SSD SATA murah untuk menghidupkan kembali laptop lama.',
   'SSD SATA 2,5 inci 512GB, pengganti langsung hard disk laptop maupun PC. Pilihan paling ekonomis untuk mempercepat komputer lama tanpa ganti perangkat.',
   'ram-penyimpanan', 'v-gen', 445000, 520000, 25, 'baru', 36, 90,
   '{"Kapasitas":"512GB","Antarmuka":"SATA III 6Gb/s","Form Factor":"2,5 inci","Baca":"550 MB/s","Tulis":"500 MB/s","Garansi":"3 tahun"}',
   false, 507, 71),

  ('HDD-001', 'Seagate Barracuda 2TB 3.5"', 'seagate-barracuda-2tb',
   'Hard disk 2TB untuk simpan file, foto, dan video.',
   'Seagate Barracuda 2TB 7200 RPM, andalan untuk penyimpanan data besar dengan harga per gigabyte paling murah. Cocok dipasangkan dengan SSD sebagai drive sistem.',
   'ram-penyimpanan', 'seagate', 875000, null, 10, 'baru', 24, 500,
   '{"Kapasitas":"2TB","Kecepatan Putar":"7200 RPM","Antarmuka":"SATA III","Form Factor":"3,5 inci","Cache":"256MB","Garansi":"2 tahun"}',
   false, 264, 19),

  ('MON-001', 'Samsung LS24C310 24" IPS 75Hz', 'samsung-ls24c310-24-ips-75hz',
   'Monitor 24 inci IPS, warna akurat dan mata lebih nyaman.',
   'Monitor 24 inci Full HD panel IPS dengan refresh 75Hz dan mode Eye Saver. Bezel tipis membuat meja terlihat lebih rapi. Sudah termasuk kabel HDMI.',
   'monitor', 'samsung', 1425000, 1550000, 8, 'baru', 36, 3800,
   '{"Ukuran":"24 inci","Resolusi":"1920 x 1080","Panel":"IPS","Refresh Rate":"75 Hz","Port":"HDMI, D-Sub","Garansi":"3 tahun"}',
   true, 471, 26),

  ('MON-002', 'MSI G244F 24" 180Hz Gaming', 'msi-g244f-24-180hz',
   'Monitor gaming 180Hz respons 1ms.',
   'MSI G244F menawarkan refresh rate 180Hz dan respons 1ms untuk permainan kompetitif. Mendukung Adaptive Sync sehingga gambar bebas sobek.',
   'monitor', 'msi', 2150000, 2400000, 5, 'baru', 36, 4200,
   '{"Ukuran":"23,8 inci","Resolusi":"1920 x 1080","Panel":"Rapid IPS","Refresh Rate":"180 Hz","Respons":"1 ms","Port":"2x HDMI, 1x DisplayPort"}',
   false, 356, 8),

  ('KM-001', 'Logitech MK240 Nano Wireless Combo', 'logitech-mk240-nano-wireless',
   'Paket keyboard dan mouse nirkabel ringkas.',
   'Kombinasi keyboard mungil dan mouse nirkabel dengan satu receiver USB. Baterai awet hingga 24 bulan untuk keyboard. Praktis untuk meja kerja yang sempit.',
   'keyboard-mouse', 'logitech', 315000, 359000, 30, 'baru', 12, 600,
   '{"Koneksi":"Wireless 2,4GHz","Receiver":"USB Nano","Baterai Keyboard":"Hingga 24 bulan","Baterai Mouse":"Hingga 6 bulan","Tahan Cipratan":"Ya"}',
   false, 388, 52),

  ('KM-002', 'Rexus Legionare MX9 Mechanical RGB', 'rexus-legionare-mx9-mechanical-rgb',
   'Keyboard mekanik RGB dengan harga bersahabat.',
   'Keyboard mekanik TKL dengan switch biru yang terasa mantap saat diketik, lampu RGB, dan bodi logam. Cocok untuk gaming maupun mengetik lama.',
   'keyboard-mouse', 'rexus', 425000, 499000, 12, 'baru', 12, 900,
   '{"Tipe":"Mekanik TKL","Switch":"Blue","Lampu":"RGB","Koneksi":"USB kabel","Anti-Ghosting":"Full N-Key"}',
   true, 596, 37),

  ('KM-003', 'Logitech G102 Lightsync Gaming Mouse', 'logitech-g102-lightsync',
   'Mouse gaming 8000 DPI, ringan dan presisi.',
   'Logitech G102 Lightsync dengan sensor hingga 8000 DPI dan bobot ringan. Enam tombol bisa diatur lewat software G HUB. Pilihan populer untuk gamer pemula.',
   'keyboard-mouse', 'logitech', 275000, 320000, 22, 'baru', 24, 250,
   '{"Sensor":"Mercury 8000 DPI","Tombol":"6 dapat diprogram","Lampu":"RGB Lightsync","Koneksi":"USB kabel","Bobot":"85 gram"}',
   false, 634, 68),

  ('PRN-001', 'Epson L3210 Print Scan Copy', 'epson-l3210-print-scan-copy',
   'Printer tinta infus resmi, hemat untuk cetak harian.',
   'Epson EcoTank L3210 dengan sistem tangki tinta asli pabrik. Bisa cetak, scan, dan fotokopi. Biaya per lembar sangat murah, cocok untuk usaha fotokopi kecil, sekolah, dan rumahan.',
   'printer-scanner', 'epson', 2295000, 2450000, 9, 'baru', 24, 4000,
   '{"Fungsi":"Print, Scan, Copy","Teknologi":"Tinta infus pabrik","Kecepatan Cetak":"10 ipm hitam","Resolusi":"5760 x 1440 dpi","Koneksi":"USB","Garansi":"2 tahun / 30.000 lembar"}',
   true, 702, 41),

  ('PRN-002', 'Canon PIXMA G2010 Multifungsi', 'canon-pixma-g2010',
   'Printer multifungsi hemat tinta untuk rumah dan kantor.',
   'Canon PIXMA G2010 mendukung cetak, pindai, dan salin dengan tangki tinta terintegrasi. Hasil cetak dokumen tajam dan foto tetap rapi.',
   'printer-scanner', 'canon', 2150000, null, 6, 'baru', 24, 3900,
   '{"Fungsi":"Print, Scan, Copy","Teknologi":"Tinta infus pabrik","Kecepatan Cetak":"8,8 ipm hitam","Resolusi":"4800 x 1200 dpi","Koneksi":"USB","Garansi":"2 tahun"}',
   false, 298, 17),

  ('NET-001', 'TP-Link Archer C6 AC1200 Router', 'tp-link-archer-c6-ac1200',
   'Router dual band untuk rumah dua lantai.',
   'TP-Link Archer C6 AC1200 dengan empat antena eksternal dan teknologi MU-MIMO. Jangkauan luas dan stabil untuk banyak perangkat sekaligus.',
   'jaringan-router', 'tp-link', 465000, 525000, 15, 'baru', 36, 700,
   '{"Standar":"Wi-Fi 5 AC1200","Band":"2,4GHz + 5GHz","Antena":"4 eksternal","Port":"4x LAN, 1x WAN","Fitur":"MU-MIMO, Beamforming"}',
   false, 341, 33),

  ('NET-002', 'TP-Link LS1008G Switch 8 Port Gigabit', 'tp-link-ls1008g-switch-8-port',
   'Switch gigabit 8 port untuk kantor kecil.',
   'Switch tanpa konfigurasi dengan delapan port gigabit. Tinggal colok untuk memperbanyak titik jaringan kabel di kantor atau warnet.',
   'jaringan-router', 'tp-link', 285000, null, 11, 'baru', 24, 400,
   '{"Port":"8x Gigabit","Tipe":"Unmanaged","Kecepatan":"10/100/1000 Mbps","Bahan":"Plastik","Pemasangan":"Desktop"}',
   false, 176, 21),

  ('AUD-001', 'Logitech Z120 Stereo Speaker USB', 'logitech-z120-stereo-speaker',
   'Speaker USB ringkas, tidak perlu adaptor.',
   'Speaker stereo Logitech Z120 bertenaga USB dengan suara jernih untuk pemakaian komputer sehari-hari. Ukurannya kecil sehingga hemat tempat.',
   'audio-speaker', 'logitech', 195000, 225000, 18, 'baru', 12, 400,
   '{"Daya":"1,2 Watt RMS","Sumber Daya":"USB","Koneksi":"3,5 mm","Kontrol":"Volume di speaker","Warna":"Hitam"}',
   false, 229, 39),

  ('AUD-002', 'Rexus Vonix F55 Headset Gaming', 'rexus-vonix-f55-headset-gaming',
   'Headset gaming dengan mikrofon jernih dan bantalan empuk.',
   'Headset gaming Rexus Vonix F55 dengan driver 50mm, mikrofon fleksibel, dan bantalan telinga tebal untuk pemakaian lama. Kompatibel dengan PC dan laptop.',
   'audio-speaker', 'rexus', 245000, 289000, 16, 'baru', 12, 500,
   '{"Driver":"50 mm","Koneksi":"3,5 mm + USB (lampu)","Mikrofon":"Omnidirectional fleksibel","Panjang Kabel":"2,1 m","Lampu":"RGB"}',
   false, 312, 29),

  ('ACC-001', 'ICA UPS CE600 600VA', 'ica-ups-ce600-600va',
   'UPS pelindung komputer saat listrik padam.',
   'UPS ICA CE600 600VA memberi cadangan daya beberapa menit agar pekerjaan sempat disimpan saat listrik mati. Melindungi PSU dan hard disk dari kerusakan akibat mati mendadak.',
   'aksesoris-power', 'ica', 725000, 799000, 7, 'baru', 12, 6000,
   '{"Kapasitas":"600VA / 360W","Waktu Cadangan":"10 - 20 menit","Stop Kontak":"2 outlet","Proteksi":"Overload, korsleting","Garansi":"1 tahun (baterai 6 bulan)"}',
   false, 187, 13),

  ('ACC-002', 'Kabel HDMI 2.0 4K 3 Meter', 'kabel-hdmi-2-0-4k-3-meter',
   'Kabel HDMI berkualitas untuk monitor dan proyektor.',
   'Kabel HDMI 2.0 panjang 3 meter dengan dukungan resolusi 4K 60Hz. Konektor berlapis emas dan pelindung kabel tebal agar awet dipakai berulang.',
   'aksesoris-power', null, 65000, 85000, 40, 'baru', 6, 250,
   '{"Versi":"HDMI 2.0","Panjang":"3 meter","Resolusi Maks":"4K 60Hz","Konektor":"Gold plated","Bahan":"Nylon braided"}',
   false, 143, 87),

  ('LP-005', 'Laptop Bekas Dell Latitude 5400 Core i5-8365U', 'dell-latitude-5400-bekas',
   'Laptop bekas kelas bisnis, bodi kokoh dan sudah dites teknisi.',
   'Dell Latitude 5400 second dengan Core i5-8365U, RAM 8GB, dan SSD 256GB. Kondisi mulus, baterai masih sehat, sudah melalui pengecekan menyeluruh oleh teknisi kami. Bergaransi toko tiga bulan.',
   'laptop', 'dell', 4250000, 4750000, 3, 'bekas', 3, 1900,
   '{"Prosesor":"Intel Core i5-8365U","RAM":"8GB DDR4","Penyimpanan":"SSD 256GB","Layar":"14\" FHD","Kondisi":"Bekas, mulus 90%","Kelengkapan":"Unit + charger"}',
   false, 419, 9)
) as d(sku, name, slug, short_description, description, category_slug, brand_slug,
       price, compare_at_price, stock, condition, warranty_months, weight_grams,
       specs, is_featured, view_count, sold_count)
left join public.categories c on c.slug = d.category_slug
left join public.brands b on b.slug = d.brand_slug
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock = excluded.stock,
  specs = excluded.specs,
  is_featured = excluded.is_featured;

notify pgrst, 'reload schema';
