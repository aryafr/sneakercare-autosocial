import { client } from "./index";

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  try {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      password TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // 2. Services
  await client.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      base_price REAL NOT NULL,
      estimated_days INTEGER NOT NULL DEFAULT 3,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  // 3. Medusa-Inspired Commerce Tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      handle TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      thumbnail TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id),
      brand TEXT NOT NULL DEFAULT 'SO CLEAN Labs',
      rating REAL NOT NULL DEFAULT 5.0,
      review_count INTEGER NOT NULL DEFAULT 24,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      compare_at_price REAL,
      inventory_quantity INTEGER NOT NULL DEFAULT 50,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS discounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL DEFAULT 'PERCENTAGE',
      value REAL NOT NULL,
      min_subtotal REAL NOT NULL DEFAULT 0,
      max_uses INTEGER NOT NULL DEFAULT 100,
      used_count INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      valid_until INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      promo_code TEXT,
      discount_amount REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL DEFAULT 0,
      shipping_total REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL DEFAULT 'PRODUCT',
      product_id TEXT REFERENCES products(id),
      variant_id TEXT REFERENCES product_variants(id),
      service_id TEXT REFERENCES services(id),
      title TEXT NOT NULL,
      variant_title TEXT,
      thumbnail TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  // 4. Unified Orders & Fulfillments
  await client.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tracking_code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      service_type TEXT NOT NULL DEFAULT 'DROP_OFF',
      delivery_address TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      shipping_fee REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'QRIS',
      payment_status TEXT NOT NULL DEFAULT 'UNPAID',
      order_status TEXT NOT NULL DEFAULT 'RECEIVED',
      payment_reference TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL DEFAULT 'SERVICE',
      service_id TEXT REFERENCES services(id),
      product_id TEXT REFERENCES products(id),
      variant_id TEXT REFERENCES product_variants(id),
      title TEXT,
      shoe_brand TEXT,
      shoe_model TEXT,
      shoe_color TEXT,
      special_notes TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      before_image_url TEXT,
      after_image_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS order_fulfillments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      carrier TEXT NOT NULL DEFAULT 'SO CLEAN Express Courier',
      tracking_number TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      shipped_at INTEGER,
      delivered_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  // 5. Postiz Social Automation Tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL DEFAULT 'INSTAGRAM',
      platform_account_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      avatar_url TEXT,
      access_token TEXT NOT NULL,
      token_expires_at INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS social_media_assets (
      id TEXT PRIMARY KEY,
      order_item_id TEXT REFERENCES order_items(id) ON DELETE SET NULL,
      media_url TEXT NOT NULL,
      media_type TEXT NOT NULL DEFAULT 'STITCHED_1X1',
      title TEXT NOT NULL,
      shoe_brand TEXT,
      shoe_model TEXT,
      tags TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS social_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      prompt_hook TEXT NOT NULL,
      template_body TEXT NOT NULL,
      hashtags TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Restoration Report',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      order_item_id TEXT REFERENCES order_items(id) ON DELETE SET NULL,
      social_account_id TEXT NOT NULL REFERENCES social_accounts(id),
      channel_type TEXT NOT NULL DEFAULT 'INSTAGRAM',
      stitched_image_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      scheduled_at INTEGER NOT NULL,
      published_at INTEGER,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      qstash_message_id TEXT,
      platform_post_id TEXT,
      error_message TEXT,
      views_count INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Safe schema migrations for existing SQLite instances
  try { await client.execute(`ALTER TABLE social_accounts ADD COLUMN avatar_url TEXT;`); } catch {}
  try { await client.execute(`ALTER TABLE social_posts ADD COLUMN channel_type TEXT NOT NULL DEFAULT 'INSTAGRAM';`); } catch {}
  try { await client.execute(`ALTER TABLE social_posts ADD COLUMN views_count INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await client.execute(`ALTER TABLE social_posts ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;`); } catch {}
  try { await client.execute(`ALTER TABLE orders ADD COLUMN subtotal REAL NOT NULL DEFAULT 0;`); } catch {}
  try { await client.execute(`ALTER TABLE orders ADD COLUMN discount_amount REAL NOT NULL DEFAULT 0;`); } catch {}
  try { await client.execute(`ALTER TABLE orders ADD COLUMN shipping_fee REAL NOT NULL DEFAULT 0;`); } catch {}
  try { await client.execute(`ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'QRIS';`); } catch {}
  try { await client.execute(`ALTER TABLE order_items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'SERVICE';`); } catch {}
  try { await client.execute(`ALTER TABLE order_items ADD COLUMN product_id TEXT;`); } catch {}
  try { await client.execute(`ALTER TABLE order_items ADD COLUMN variant_id TEXT;`); } catch {}
  try { await client.execute(`ALTER TABLE order_items ADD COLUMN title TEXT;`); } catch {}
  try { await client.execute(`ALTER TABLE order_items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;`); } catch {}

  // Indexes
  await client.execute(`CREATE INDEX IF NOT EXISTS orders_tracking_code_idx ON orders(tracking_code);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS orders_order_status_idx ON orders(order_status);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS social_posts_status_idx ON social_posts(status);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS social_posts_scheduled_at_idx ON social_posts(scheduled_at);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS products_handle_idx ON products(handle);`);

  // Seed Default Services
  await client.execute(`
    INSERT OR IGNORE INTO services (id, name, slug, description, base_price, estimated_days, is_active)
    VALUES
      ('serv_deep_clean', 'Deep Clean', 'deep-clean', 'Pencucian menyeluruh luar & dalam termasuk insole, midsole, upper, dan outsole.', 50000, 3, 1),
      ('serv_fast_clean', 'Fast Clean', 'fast-clean', 'Pembersihan cepat bagian luar dan midsole untuk kotoran debu harian.', 35000, 1, 1),
      ('serv_unyellowing', 'Unyellowing Treatment', 'unyellowing', 'Penghilangan noda kuning teroksidasi pada midsole menggunakan formula UV & cream khusus.', 75000, 4, 1),
      ('serv_repaint', 'Repaint & Restoration', 'repaint-restoration', 'Pengecatan ulang presisi mengembalikan warna asli sepatu yang pudar atau lecet.', 100000, 5, 1),
      ('serv_leather', 'Leather Care & Conditioning', 'leather-care', 'Perawatan khusus bahan kulit dengan formula wax pelembab agar tidak pecah-pecah.', 60000, 3, 1),
      ('serv_suede', 'Suede & Nubuck Clean', 'suede-clean', 'Pembersihan lembut dan penyisiran serat halus tanpa merusak tekstur suede.', 55000, 3, 1),
      ('serv_product', 'Care Product Item', 'care-product-item', 'Produk fisik perawatan sepatu', 0, 0, 1);
  `);

  // Seed Medusa Categories
  await client.execute(`
    INSERT OR IGNORE INTO categories (id, name, slug, description, image_url)
    VALUES
      ('cat_kits', 'Cleaning Kits', 'cleaning-kits', 'Paket lengkap pembersih sepatu dengan sikat premium.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop'),
      ('cat_sprays', 'Shoe Care & Sprays', 'shoe-care-sprays', 'Nano repellent waterproof dan penghilang bau.', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop'),
      ('cat_accessories', 'Accessories & Laces', 'accessories-laces', 'Shoe trees, tali sepatu premium, dan sikat bulu kuda.', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop');
  `);

  // Seed Medusa Products
  await client.execute(`
    INSERT OR IGNORE INTO products (id, title, handle, description, thumbnail, category_id, brand, rating, review_count, is_active)
    VALUES
      ('prod_starter_kit', 'SO CLEAN Ultimate Sneaker Cleaning Kit', 'so-clean-ultimate-cleaning-kit', 'Kit pembersih sneaker profesional lengkap dengan sabun 250ml biodegradable, sikat bulu kuda lembut untuk upper, sikat kaku untuk outsole, dan lap microfiber premium.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop', 'cat_kits', 'SO CLEAN Labs', 4.9, 48, 1),
      ('prod_nano_repellent', 'SO CLEAN HydroShield Nano Waterproof Spray', 'so-clean-hydroshield-nano-spray', 'Semprotan pelindung anti air, lumpur, dan noda minyak berbasis nano-coating polimer. Tidak mengubah warna atau tekstur bahan sepatu sama sekali.', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop', 'cat_sprays', 'SO CLEAN Labs', 5.0, 32, 1),
      ('prod_deodorizer', 'SO CLEAN FreshKick Shoe Deodorizer & Disinfectant', 'so-clean-freshkick-deodorizer', 'Spray disinfektan anti-bakteri dan jamur dengan aroma segar woody citrus yang tahan hingga 72 jam.', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop', 'cat_sprays', 'SO CLEAN Labs', 4.8, 19, 1),
      ('prod_cedar_shoetree', 'SO CLEAN Premium Aromatic Cedar Shoe Tree', 'so-clean-aromatic-cedar-shoe-tree', 'Shoe tree kayu cedar asli menjaga bentuk sepatu agar tidak berkerut (creasing) dan menyerap kelembapan secara alami.', 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=800&auto=format&fit=crop', 'cat_accessories', 'SO CLEAN Labs', 5.0, 15, 1);
  `);

  // Seed Product Variants
  await client.execute(`
    INSERT OR IGNORE INTO product_variants (id, product_id, sku, title, price, compare_at_price, inventory_quantity)
    VALUES
      ('var_kit_std', 'prod_starter_kit', 'SC-KIT-STD', 'Standard Pack (250ml + 2 Brushes)', 125000, 150000, 45),
      ('var_kit_pro', 'prod_starter_kit', 'SC-KIT-PRO', 'Pro Refill Pack (500ml + 3 Brushes)', 185000, 220000, 30),
      ('var_spray_250', 'prod_nano_repellent', 'SC-NANO-250', 'Canister 250ml (Untuk 6-8 Pasang)', 95000, 120000, 60),
      ('var_deo_150', 'prod_deodorizer', 'SC-DEO-150', 'Spray 150ml Fresh Mint', 55000, 70000, 80),
      ('var_tree_m', 'prod_cedar_shoetree', 'SC-TREE-M', 'Size M (EU 39 - 42)', 140000, 175000, 25),
      ('var_tree_l', 'prod_cedar_shoetree', 'SC-TREE-L', 'Size L (EU 43 - 46)', 140000, 175000, 20);
  `);

  // Seed Discount Coupons
  await client.execute(`
    INSERT OR IGNORE INTO discounts (id, code, discount_type, value, min_subtotal, max_uses, used_count, is_active)
    VALUES
      ('disc_soclean15', 'SOCLEAN15', 'PERCENTAGE', 15, 100000, 500, 12, 1),
      ('disc_fresh20k', 'FRESH20K', 'FIXED', 20000, 75000, 200, 8, 1);
  `);

  // Seed Postiz Social Channels
  await client.execute(`
    INSERT OR IGNORE INTO social_accounts (id, platform, platform_account_id, account_name, avatar_url, access_token, is_active)
    VALUES
      ('soc_default_ig', 'INSTAGRAM', '17841400000000000', '@sneakercare.official', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=150', 'EAAB_INSTAGRAM_GRAPH_DEV_ACCESS_TOKEN', 1),
      ('soc_default_tt', 'TIKTOK', 'tt_sneakercare_id', '@sneakercare_id', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=150', 'TIKTOK_CREATOR_API_ACCESS_TOKEN', 1),
      ('soc_default_fb', 'FACEBOOK', 'fb_sneakercare_page', 'SneakerCare Workshop ID', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=150', 'EAAB_FACEBOOK_GRAPH_PAGE_TOKEN', 1),
      ('soc_default_x', 'TWITTER_X', 'x_sneakercare_id', '@SneakerCareID', 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=150', 'TWITTER_API_V2_BEARER_TOKEN', 1);
  `);

  // Seed Postiz Social Templates
  await client.execute(`
    INSERT OR IGNORE INTO social_templates (id, title, prompt_hook, template_body, hashtags, category)
    VALUES
      ('tpl_restoration', 'Restoration Executive Report', 'Kompilasi Before/After perubahan noda membandel', 'SNEAKERCARE RESTORATION REPORT\n\nSepatu {brand} {model} milik {customer} telah selesai menjalani treatment {treatment} di Workshop SO CLEAN.\n\nBerikut dokumentasi perbandingan Before/After hasil pengerjaan tim teknisi kami. Dari noda membandel hingga kembali bersih dan terawat optimal.', '#sneakercare #shoelaundry #beforeandafter #sneakerrestoration #cucisepatu #cucisepatujakarta', 'Restoration Report'),
      ('tpl_unyellowing', 'Unyellowing Midsole Magic', 'Midsole kuning kembali putih seperti baru', 'MIDSOLE DE-OXIDATION COMPLETE!\n\nMidsole kuning karena oksidasi pada {brand} {model} berhasil dikembalikan ke warna putih aslinya tanpa merusak karet sol.', '#unyellowing #shoecare #sneakercleaning #shoerefresh', 'Unyellowing'),
      ('tpl_weekend_promo', 'Weekend Drop-Off Promo', 'Ajak sneakers kesayangan perawatan akhir pekan', 'WEEKEND SNEAKER SPA IS CALLING!\n\nSiapkan sneaker kesayanganmu untuk tampil segar di awal minggu. Drop langsung ke workshop kami di Senopati atau booking pickup delivery online sekarang.', '#shoelaundryjakarta #cucisepatusenopati #weekendvibes', 'Promotion');
  `);
    isInitialized = true;
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

