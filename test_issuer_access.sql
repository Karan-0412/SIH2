-- Test issuer access and data
-- This script verifies that the issuer can be accessed properly

-- Test 1: Check if issuers table has data
SELECT 
    'issuers_count' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM issuers;

-- Test 2: Check if active issuer exists
SELECT 
    'active_issuer_count' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM issuers 
WHERE status = 'active';

-- Test 3: Show all issuers with their details
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

-- Test 4: Test direct query that the service will use
SELECT 
    'service_query_test' as test_name,
    id,
    name,
    did,
    public_key_jwk,
    sign_key_id,
    status,
    created_at,
    updated_at
FROM issuers 
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 1;

-- Test 5: Check if the default issuer exists with correct ID
SELECT 
    'default_issuer_check' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status,
    COUNT(*) as count
FROM issuers 
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND status = 'active';

