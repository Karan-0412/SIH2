-- Fix audit_logs foreign key constraints
-- This script makes the foreign key constraints optional to prevent blocking

-- Step 1: Drop existing foreign key constraints
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_vc_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_issuer_id_fkey;

-- Step 2: Recreate constraints as DEFERRABLE INITIALLY DEFERRED
-- This allows the constraints to be checked at the end of the transaction
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_vc_id_fkey 
FOREIGN KEY (vc_id) REFERENCES verifiable_credentials(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_issuer_id_fkey 
FOREIGN KEY (issuer_id) REFERENCES issuers(id) ON DELETE SET NULL
DEFERRABLE INITIALLY DEFERRED;

-- Step 3: Test inserting audit logs with valid data
INSERT INTO audit_logs (
    action,
    user_id,
    vc_id,
    issuer_id,
    details
) VALUES (
    'test_action_valid',
    (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
    (SELECT id FROM verifiable_credentials LIMIT 1),
    (SELECT id FROM issuers LIMIT 1),
    '{"test": "valid_data"}'
);

-- Step 4: Test inserting audit logs with minimal data (no foreign keys)
INSERT INTO audit_logs (
    action,
    details
) VALUES (
    'test_action_minimal',
    '{"test": "minimal_data"}'
);

-- Step 5: Verify both inserts worked
SELECT 
    'audit_logs_test' as test_name,
    COUNT(*) as total_logs,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as logs_with_user,
    COUNT(CASE WHEN vc_id IS NOT NULL THEN 1 END) as logs_with_vc,
    COUNT(CASE WHEN issuer_id IS NOT NULL THEN 1 END) as logs_with_issuer
FROM audit_logs;

-- Step 6: Show recent audit logs
SELECT 
    'recent_audit_logs' as info_type,
    action,
    user_id,
    vc_id,
    issuer_id,
    details,
    timestamp
FROM audit_logs 
ORDER BY timestamp DESC
LIMIT 5;

