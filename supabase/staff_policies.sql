-- Run after schema.sql — staff access + admin staff management

-- Staff can manage products and brands (same as admin)
CREATE POLICY "products_staff_all" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "brands_staff_all" ON brands FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- Admins can list and update team profiles
CREATE POLICY "profiles_admin_read_team" ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR auth.uid() = id
  );

CREATE POLICY "profiles_admin_update_staff" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
