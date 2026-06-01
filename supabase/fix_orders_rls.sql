-- =============================================================================
-- ELYOO — Fix orders not showing for admin/staff
-- Run in Supabase SQL Editor → Run All
-- =============================================================================

-- SECURITY DEFINER function: bypasses RLS to fetch all orders
-- Admin/staff can call this even without a Supabase auth session
CREATE OR REPLACE FUNCTION public.get_all_orders()
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM orders ORDER BY created_at DESC;
END;
$$;

-- Grant to anon and authenticated so admin panel can always call it
GRANT EXECUTE ON FUNCTION public.get_all_orders() TO anon, authenticated;

SELECT 'get_all_orders() function created — orders will now load in admin panel' AS status;
