-- Secure checkout — run in Supabase SQL Editor AFTER schema.sql
-- Prevents price tampering: totals and stock are computed server-side.

DROP POLICY IF EXISTS "orders_public_insert" ON orders;

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
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Cart exceeds maximum items';
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
    IF v_product.price <= 0 THEN
      RAISE EXCEPTION 'Invalid product price';
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

  IF v_total > 100000 THEN
    RAISE EXCEPTION 'Order exceeds maximum allowed total';
  END IF;

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
