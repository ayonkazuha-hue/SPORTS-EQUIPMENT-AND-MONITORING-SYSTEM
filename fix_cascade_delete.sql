-- =====================================================
-- FIX: Enable CASCADE DELETE for users -> borrow_records
-- Run this in the Supabase SQL Editor
-- =====================================================
-- This migration drops the existing foreign key constraints on borrow_records
-- that reference users(user_id) and audit_log(user_id), then re-adds them
-- with ON DELETE CASCADE so that deleting a user automatically removes
-- their associated records.

-- Step 1: Drop the existing foreign key on borrow_records -> users
ALTER TABLE borrow_records
    DROP CONSTRAINT IF EXISTS borrow_records_borrowed_by_fkey;

-- Also drop the named constraint from supabase_migrations_postgres.sql if it exists
ALTER TABLE borrow_records
    DROP CONSTRAINT IF EXISTS fk_borrow_user;

-- Step 2: Re-add with ON DELETE CASCADE
--   When a user is deleted, their borrow records are automatically deleted too.
ALTER TABLE borrow_records
    ADD CONSTRAINT borrow_records_borrowed_by_fkey
    FOREIGN KEY (borrowed_by)
    REFERENCES users(user_id)
    ON DELETE CASCADE;

-- Step 3: Fix audit_log -> users as well (same issue would occur there)
ALTER TABLE audit_log
    DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey;

ALTER TABLE audit_log
    DROP CONSTRAINT IF EXISTS fk_audit_user;

ALTER TABLE audit_log
    ADD CONSTRAINT audit_log_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL;

-- Verify the constraints were applied
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name;
