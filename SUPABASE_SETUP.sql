-- ============================================================
-- GOAT SPORTWEAR - Supabase Setup
-- Ejecutá este SQL en: Supabase → SQL Editor → New query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PRODUCTS
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  category       TEXT NOT NULL,
  sizes          TEXT[] NOT NULL DEFAULT '{}',
  badge          TEXT,
  image_url      TEXT,
  image_path     TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  sort_order     INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT,
  customer_address TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  payment_method   TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid','paid','refunded')),
  notes            TEXT,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT,
  size          TEXT NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL
);

-- CAMPAIGNS
CREATE TABLE campaigns (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT,
  image_url         TEXT,
  image_path        TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  target_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  target_category   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- WAITLIST
CREATE TABLE waitlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  source     TEXT DEFAULT 'storefront',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN PROFILES (extends Supabase auth.users)
CREATE TABLE admin_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor')),
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at  BEFORE UPDATE ON products  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at  BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ROW LEVEL SECURITY
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Products: público puede leer los activos, admins pueden todo
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_admin_all"   ON products FOR ALL   USING (auth.role() = 'authenticated');

-- Orders: solo admins
CREATE POLICY "orders_admin"      ON orders      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "items_admin"       ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- Campaigns: público lee las activas y vigentes, admins todo
CREATE POLICY "campaigns_public"  ON campaigns FOR SELECT USING (is_active = TRUE AND NOW() BETWEEN starts_at AND ends_at);
CREATE POLICY "campaigns_admin"   ON campaigns FOR ALL   USING (auth.role() = 'authenticated');

-- Waitlist: cualquiera puede suscribirse, solo admins leen/borran
CREATE POLICY "waitlist_insert"   ON waitlist FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "waitlist_admin_read" ON waitlist FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "waitlist_admin_del"  ON waitlist FOR DELETE USING (auth.role() = 'authenticated');

-- Admin profiles: solo admins
CREATE POLICY "profiles_admin"    ON admin_profiles FOR ALL USING (auth.role() = 'authenticated');
