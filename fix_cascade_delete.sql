-- =====================================================
-- FIX: Enable CASCADE DELETE for users -> borrow_records
-- AND make borrowed_by store plain text (not a FK to users)
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the existing foreign key on borrow_records -> users
ALTER TABLE borrow_records
    DROP CONSTRAINT IF EXISTS borrow_records_borrowed_by_fkey;

ALTER TABLE borrow_records
    DROP CONSTRAINT IF EXISTS fk_borrow_user;

-- Step 2: Make borrowed_by nullable so non-system borrowers can be stored
ALTER TABLE borrow_records
    ALTER COLUMN borrowed_by DROP NOT NULL;

-- Step 3: Fix audit_log -> users (set null on delete, not cascade)
ALTER TABLE audit_log
    DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;

ALTER TABLE audit_log
    DROP CONSTRAINT IF EXISTS fk_audit_user;

ALTER TABLE audit_log
    ADD CONSTRAINT audit_log_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL;

-- Step 4: equipment -> categories cascade
ALTER TABLE equipment
    DROP CONSTRAINT IF EXISTS fk_equipment_category;

-- Verify
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('borrow_records','audit_log')
ORDER BY tc.table_name;
