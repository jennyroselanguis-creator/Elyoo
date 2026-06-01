-- Run this if you already created the database and need order tracking only

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
