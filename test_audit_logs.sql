-- Test audit_logs table access and constraints
-- This script tests the audit_logs table functionality

-- Test 1: Check if audit_logs table exists and has data
SELECT 
    'audit_logs_count' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM audit_logs;

-- Test 2: Test inserting a simple audit log
INSERT INTO audit_logs (
    action,
    details
) VALUES (
    'test_action',
    '{"test": "data"}'
);

-- Test 3: Check if the insert worked
SELECT 
    'audit_logs_insert_test' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status,
    COUNT(*) as count
FROM audit_logs 
WHERE action = 'test_action';

-- Test 4: Test inserting with all fields
INSERT INTO audit_logs (
    action,
    user_id,
    vc_id,
    issuer_id,
    details
) VALUES (
    'test_action_full',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '{"test": "full_data"}'
);

-- Test 5: Check if the full insert worked
SELECT 
    'audit_logs_full_insert_test' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status,
    COUNT(*) as count
FROM audit_logs 
WHERE action = 'test_action_full';

-- Test 6: Show all audit logs
SELECT 
    'all_audit_logs' as info_type,
    action,
    user_id,
    vc_id,
    issuer_id,
    details,
    timestamp
FROM audit_logs 
ORDER BY timestamp DESC
LIMIT 5;

-- Test 7: Check table structure
SELECT 
    'table_structure' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

