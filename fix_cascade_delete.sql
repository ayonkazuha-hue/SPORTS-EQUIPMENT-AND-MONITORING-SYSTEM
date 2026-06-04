-- =====================================================
-- SPORTS EQUIPMENT SYSTEM — Required Supabase Migrations
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Drop the foreign key that blocks storing borrower names
ALTER TABLE borrow_records DROP CONSTRAINT IF EXISTS borrow_records_borrowed_by_fkey;
ALTER TABLE borrow_records DROP CONSTRAINT IF EXISTS fk_borrow_user;

-- 2. Make borrowed_by nullable (stores plain name, not a user ID)
ALTER TABLE borrow_records ALTER COLUMN borrowed_by DROP NOT NULL;

-- 3. Fix audit_log → users FK (set null on delete, not restrict)
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;
ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS fk_audit_user;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 4. Seed categories (required for equipment inserts)
INSERT INTO categories (category_id, category_name, description) VALUES
  ('CAT-001', 'Balls',               'Basketball, Soccer Ball, Tennis Ball, etc.'),
  ('CAT-002', 'Rackets & Paddles',   'Tennis Racket, Badminton Racket, etc.'),
  ('CAT-003', 'Protective Gear',     'Helmet, Knee Pads, Gloves, etc.'),
  ('CAT-004', 'Nets & Poles',        'Badminton Net, Volleyball Net, etc.'),
  ('CAT-005', 'Mats & Floors',       'Yoga Mat, Gym Mat, etc.'),
  ('CAT-006', 'Weights & Resistance','Dumbbells, Kettlebells, etc.'),
  ('CAT-007', 'Accessories',         'Cones, Markers, Bags, Whistles, etc.'),
  ('CAT-008', 'General',             'General sports equipment')
ON CONFLICT (category_id) DO NOTHING;

-- =====================================================
-- 5. Row Level Security — allow public access
--    (The app uses the anon key from the browser;
--     these policies let it read and write freely)
-- =====================================================

-- equipment
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_equipment" ON equipment;
CREATE POLICY "allow_all_equipment" ON equipment FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- borrow_records
ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_borrow_records" ON borrow_records;
CREATE POLICY "allow_all_borrow_records" ON borrow_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_categories" ON categories;
CREATE POLICY "allow_all_categories" ON categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- audit_log (read-only for anon is fine)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_audit_log" ON audit_log;
CREATE POLICY "allow_all_audit_log" ON audit_log FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- Done. Verify:
-- =====================================================
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('equipment','borrow_records','categories','audit_log');
