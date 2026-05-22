-- Elyoo Mobile Devices — Supabase schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard → SQL → New query

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  stock INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (links to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure order tracking (guest lookup by order # + email)
CREATE OR REPLACE FUNCTION public.track_order(p_order_number TEXT, p_email TEXT)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM orders
  WHERE order_number = TRIM(p_order_number)
    AND LOWER(customer_email) = LOWER(TRIM(p_email));
$$;

CREATE OR REPLACE FUNCTION public.get_orders_by_email(p_email TEXT)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM orders
  WHERE LOWER(customer_email) = LOWER(TRIM(p_email))
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_orders_by_email(TEXT) TO anon, authenticated;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read for catalog
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (true);
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

-- Orders: use secure_checkout.sql (place_secure_order RPC) — do NOT allow open INSERT
-- CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);

-- Newsletter signup
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Profiles: users read own profile
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);

-- Admin policies (users with admin role in profiles)
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "brands_admin_all" ON brands FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "orders_admin_read" ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- Seed brands
INSERT INTO brands (name, description) VALUES
  ('Apple', 'Premium smartphones and devices'),
  ('Samsung', 'Innovative mobile technology'),
  ('Xiaomi', 'Value for money smartphones'),
  ('OnePlus', 'Flagship killer devices'),
  ('Realme', 'Affordable smartphones'),
  ('OPPO', 'Photography-focused phones')
ON CONFLICT (name) DO NOTHING;

-- Seed products (run after brands exist)
-- Prices in PHP (₱10,000+)
INSERT INTO products (brand_id, name, model, description, price, stock, image, featured) VALUES
  (1, 'iPhone 15 Pro Max', 'A17 Pro', 'Premium flagship with 6.7" display and advanced cameras', 89990, 12, '/images/iphone/iphone15promax.jpg', true),
  (1, 'iPhone 15 Pro', 'A17 Pro', 'Latest Apple flagship with ProMotion display', 74990, 15, '/images/iphone/iphone15pro.jpg', true),
  (1, 'iPhone 15', 'A16 Bionic', 'Powerful iPhone with dual camera system', 54990, 20, '/images/iphone/iphone15.jpg', false),
  (1, 'iPhone 14', 'A15 Bionic', 'Previous generation reliable flagship', 42990, 22, '/images/iphone/iphone14.jpg', false),
  (2, 'Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate flagship with S Pen and advanced AI', 79990, 12, '/images/samsung/samsungs24ultra.jpg', true),
  (2, 'Samsung Galaxy S24', 'Snapdragon 8 Gen 3', 'Core flagship with great performance', 54990, 16, '/images/samsung/samsung24.webp', true),
  (2, 'Samsung Galaxy A54', 'Exynos 1280', 'Popular mid-range with clean OS', 19990, 25, '/images/samsung/samsungA54.jpg', false),
  (3, 'Xiaomi 14 Ultra', 'Snapdragon 8 Gen 3', 'Photography focused flagship with Leica lenses', 49990, 18, '/images/xiaomi/xiaomi14ultra.png', true),
  (3, 'Xiaomi Redmi Note 13 Pro', 'Snapdragon 7s Gen 2', 'Mid-range with 120W charging', 12990, 24, '/images/xiaomi/xiaomieredme13 pro.jpg', false),
  (4, 'OnePlus 12', 'Snapdragon 8 Gen 3', 'Flagship killer with fast performance', 44990, 14, '/images/oneplus/oneplus12.png', true),
  (4, 'OnePlus Nord 3', 'MediaTek Dimensity 7050', 'Mid-range with fast charging', 11990, 20, '/images/oneplus/oneplusnord3.jpg', false),
  (5, 'Realme GT 5 Pro', 'Snapdragon 8 Gen 2', 'Gaming flagship killer', 32990, 16, '/images/realme/realme-gt5-pro.jpg', false),
  (6, 'OPPO Find X7 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate photography phone', 64990, 8, '/images/oppo/oppofindx7ultra.jpg', true),
  (6, 'OPPO Reno 11 Pro', 'Snapdragon 8 Gen 1', 'Stylish flagship phone', 29990, 14, '/images/oppo/opporeno11pro.png', false);

-- To promote a user to admin after signup:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
