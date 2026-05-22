-- =============================================================================
-- ELYOO — FIX profiles RLS + admin product save (paste in Supabase SQL Editor → Run)
-- =============================================================================

-- Bypass RLS when checking roles (stops "infinite recursion on profiles")
CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r TEXT;
BEGIN
  SELECT role INTO r FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN COALESCE(r = 'admin', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_store_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r TEXT;
BEGIN
  SELECT role INTO r FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN COALESCE(r IN ('admin', 'staff'), false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_store_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_store_staff() TO authenticated, anon;

-- Admin product insert (bypasses product RLS if policies still broken)
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

-- Ensure team profile + role after Auth sign-in (avoids RLS blocking profile read)
CREATE OR REPLACE FUNCTION public.ensure_team_profile(
  p_role TEXT,
  p_full_name TEXT,
  p_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in to Supabase';
  END IF;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (auth.uid(), p_email, COALESCE(p_full_name, ''), COALESCE(p_role, 'customer'))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_team_profile TO authenticated;

-- Product images (public read for storefront)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_store_admin());

DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_store_admin());

-- Drop ALL old policies that cause recursion
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read_team" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update_staff" ON profiles;
DROP POLICY IF EXISTS "products_admin_all" ON products;
DROP POLICY IF EXISTS "products_staff_all" ON products;
DROP POLICY IF EXISTS "brands_admin_all" ON brands;
DROP POLICY IF EXISTS "brands_staff_all" ON brands;
DROP POLICY IF EXISTS "orders_admin_read" ON orders;
DROP POLICY IF EXISTS "orders_admin_update" ON orders;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_store_admin());

CREATE POLICY "profiles_admin_update_staff" ON profiles FOR UPDATE
  USING (public.is_store_admin());

-- Products & brands
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "products_staff_all" ON products FOR ALL
  USING (public.is_store_staff())
  WITH CHECK (public.is_store_staff());

CREATE POLICY "brands_admin_all" ON brands FOR ALL
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "brands_staff_all" ON brands FOR ALL
  USING (public.is_store_staff())
  WITH CHECK (public.is_store_staff());

-- Orders
CREATE POLICY "orders_admin_read" ON orders FOR SELECT
  USING (public.is_store_staff());

CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING (public.is_store_staff());

-- Team roles (after Auth users exist)
UPDATE profiles SET role = 'admin', full_name = 'Jireh' WHERE email = 'jireh@elyoo.com';
UPDATE profiles SET role = 'staff', full_name = 'Jai' WHERE email = 'jai@elyoo.com';

SELECT 'Fix applied — refresh admin page and save product again' AS status;
