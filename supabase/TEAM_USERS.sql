-- Team accounts for Elyoo (run AFTER users exist in Authentication)
--
-- In Supabase Dashboard → Authentication → Users → Add user:
--
--   Admin:  Email jireh@elyoo.com   Password: faith
--
-- Then run this SQL:

UPDATE profiles SET role = 'admin', full_name = 'Jireh' WHERE email = 'jireh@elyoo.com';

-- Verify:
SELECT email, role, full_name FROM profiles WHERE email = 'jireh@elyoo.com';
