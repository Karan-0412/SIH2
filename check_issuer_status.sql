-- Check if the default issuer exists and is active
-- Run this in Supabase SQL Editor to verify issuer status

-- Check if issuers table exists and has data
SELECT 
    'issuers_table_check' as test_name,
    COUNT(*) as total_issuers,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS - Table has data' 
        ELSE 'FAIL - Table is empty' 
    END as status
FROM issuers;

-- Check if active issuer exists
SELECT 
    'active_issuer_check' as test_name,
    COUNT(*) as active_issuers,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS - Active issuer found' 
        ELSE 'FAIL - No active issuer' 
    END as status
FROM issuers 
WHERE status = 'active';

-- Show all issuers with details
SELECT 
    'all_issuers' as info_type,
    id,
    name,
    did,
    status,
    sign_key_id,
    created_at
FROM issuers 
ORDER BY created_at DESC;

-- Check specifically for the default issuer
SELECT 
    'default_issuer_check' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS - Default issuer exists' 
        ELSE 'FAIL - Default issuer missing' 
    END as status,
    COUNT(*) as count
FROM issuers 
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND status = 'active';
