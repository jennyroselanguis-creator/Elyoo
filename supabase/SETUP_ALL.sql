-- =============================================================================
-- ELYOO — RUN THIS ONE FILE IN SUPABASE (creates the full database)
-- =============================================================================
-- 1. Go to https://supabase.com/dashboard
-- 2. Open your project → SQL Editor → New query
-- 3. Paste ALL of this file → Run
-- 4. Table Editor should show: brands, products, orders, profiles, newsletter_subscribers
-- =============================================================================

-- ---------- TABLES ----------
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- ORDER LOOKUP (My Orders page) ----------
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
  ORDER BY created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_orders_by_email(TEXT) TO anon, authenticated;

-- ---------- INDEXES ----------
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ---------- AUTH: auto profile on signup ----------
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

-- ---------- RLS helpers (avoid infinite recursion on profiles) ----------
CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'staff'),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_store_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_staff() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_product(
  p_brand_id BIGINT,
  p_name TEXT,
  p_model TEXT,
  p_description TEXT,
  p_price DECIMAL,
  p_stock INT,
  p_image TEXT,
  p_featured BOOLEAN
)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r TEXT;
  row products;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in to Supabase';
  END IF;
  SELECT role INTO r FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF COALESCE(r, 'customer') <> 'admin' THEN
    RAISE EXCEPTION 'Only administrators can add products';
  END IF;
  INSERT INTO products (brand_id, name, model, description, price, stock, image, featured)
  VALUES (
    p_brand_id, p_name, COALESCE(p_model, ''), COALESCE(p_description, ''),
    p_price, COALESCE(p_stock, 0), COALESCE(p_image, '/images/iphone/iphone15.jpg'),
    COALESCE(p_featured, false)
  )
  RETURNING * INTO row;
  RETURN NEXT row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_product TO authenticated;

-- ---------- ROW LEVEL SECURITY ----------
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brands_public_read" ON brands;
CREATE POLICY "brands_public_read" ON brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "orders_public_insert" ON orders;
DROP POLICY IF EXISTS "newsletter_public_insert" ON newsletter_subscribers;
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read_team" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_store_admin());

DROP POLICY IF EXISTS "profiles_admin_update_staff" ON profiles;
CREATE POLICY "profiles_admin_update_staff" ON profiles FOR UPDATE
  USING (public.is_store_admin());

DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "brands_admin_all" ON brands;
CREATE POLICY "brands_admin_all" ON brands FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

DROP POLICY IF EXISTS "orders_admin_read" ON orders;
CREATE POLICY "orders_admin_read" ON orders FOR SELECT
  USING (public.is_store_staff());

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING (public.is_store_staff());

DROP POLICY IF EXISTS "products_staff_all" ON products;
CREATE POLICY "products_staff_all" ON products FOR ALL
  USING (public.is_store_staff())
  WITH CHECK (public.is_store_staff());

DROP POLICY IF EXISTS "brands_staff_all" ON brands;
CREATE POLICY "brands_staff_all" ON brands FOR ALL
  USING (public.is_store_staff())
  WITH CHECK (public.is_store_staff());

-- ---------- SECURE CHECKOUT ----------
CREATE OR REPLACE FUNCTION public.place_secure_order(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_customer_address TEXT,
  p_items JSONB
)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product_id BIGINT;
  v_qty INT;
  v_product RECORD;
  v_subtotal DECIMAL(12, 2) := 0;
  v_tax DECIMAL(12, 2);
  v_total DECIMAL(12, 2);
  v_lines JSONB := '[]'::JSONB;
  v_line JSONB;
  v_order_number TEXT;
  v_order orders;
  v_name TEXT;
  v_email TEXT;
BEGIN
  v_name := trim(COALESCE(p_customer_name, ''));
  v_email := lower(trim(COALESCE(p_customer_email, '')));

  IF length(v_name) < 2 OR length(v_name) > 80 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF v_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF length(trim(COALESCE(p_customer_address, ''))) < 10 THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(trim(COALESCE(v_item->>'product_id', v_item->>'id', '')), '')::BIGINT;
    v_qty := COALESCE((v_item->>'quantity')::INT, 0);

    IF v_product_id IS NULL OR v_qty < 1 OR v_qty > 99 THEN
      RAISE EXCEPTION 'Invalid cart line';
    END IF;

    SELECT * INTO v_product FROM products WHERE id = v_product_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product no longer available';
    END IF;
    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_product.name;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_line := jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'model', v_product.model,
      'price', v_product.price,
      'quantity', v_qty,
      'image', v_product.image
    );
    v_lines := v_lines || jsonb_build_array(v_line);
  END LOOP;

  IF v_subtotal < 10000 THEN
    RAISE EXCEPTION 'Minimum order subtotal is ₱10,000';
  END IF;

  v_tax := round(v_subtotal * 0.10, 2);
  v_total := round(v_subtotal + v_tax, 2);

  v_order_number := 'ELY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  INSERT INTO orders (
    order_number, customer_name, customer_email, customer_phone,
    customer_address, total_amount, items, status
  )
  VALUES (
    v_order_number, v_name, v_email, trim(COALESCE(p_customer_phone, '')),
    trim(p_customer_address), v_total, v_lines, 'pending'
  )
  RETURNING * INTO v_order;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(trim(COALESCE(v_item->>'product_id', v_item->>'id', '')), '')::BIGINT;
    v_qty := (v_item->>'quantity')::INT;

    UPDATE products
    SET stock = stock - v_qty, updated_at = NOW()
    WHERE id = v_product_id AND stock >= v_qty;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Stock changed during checkout — please try again';
    END IF;
  END LOOP;

  RETURN NEXT v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.place_secure_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_secure_order TO anon, authenticated;

-- ---------- SAMPLE DATA (PHP prices ₱10,000+) ----------
INSERT INTO brands (name, description) VALUES
  ('Apple', 'Premium smartphones and devices'),
  ('Samsung', 'Innovative mobile technology'),
  ('Xiaomi', 'Value for money smartphones'),
  ('OnePlus', 'Flagship killer devices'),
  ('Realme', 'Affordable smartphones'),
  ('OPPO', 'Photography-focused phones')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (brand_id, name, model, description, price, stock, image, featured)
SELECT b.id, v.name, v.model, v.description, v.price, v.stock, v.image, v.featured
FROM (VALUES
  ('Apple', 'iPhone 15 Pro Max', 'A17 Pro', 'Premium flagship with 6.7" display', 89990, 12, '/images/iphone/iphone15promax.jpg', true),
  ('Apple', 'iPhone 15 Pro', 'A17 Pro', 'Latest Apple flagship', 74990, 15, '/images/iphone/iphone15pro.jpg', true),
  ('Apple', 'iPhone 15', 'A16 Bionic', 'Powerful iPhone', 54990, 20, '/images/iphone/iphone15.jpg', false),
  ('Samsung', 'Samsung Galaxy S24 Ultra', 'Snapdragon 8 Gen 3', 'Ultimate flagship', 79990, 12, '/images/samsung/samsungs24ultra.jpg', true),
  ('Samsung', 'Samsung Galaxy S24', 'Snapdragon 8 Gen 3', 'Core flagship', 54990, 16, '/images/samsung/samsung24.webp', true),
  ('Xiaomi', 'Xiaomi 14 Ultra', 'Snapdragon 8 Gen 3', 'Photography flagship', 49990, 18, '/images/xiaomi/xiaomi14ultra.png', true),
  ('OnePlus', 'OnePlus 12', 'Snapdragon 8 Gen 3', 'Flagship killer', 44990, 14, '/images/oneplus/oneplus12.png', true),
  ('OPPO', 'OPPO Find X7 Ultra', 'Snapdragon 8 Gen 3', 'Photography phone', 64990, 8, '/images/oppo/oppofindx7ultra.jpg', true)
) AS v(brand_name, name, model, description, price, stock, image, featured)
JOIN brands b ON b.name = v.brand_name
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- ---------- VERIFY ----------
SELECT 'Elyoo database ready' AS message,
  (SELECT count(*)::int FROM brands) AS brands,
  (SELECT count(*)::int FROM products) AS products,
  (SELECT count(*)::int FROM orders) AS orders;
