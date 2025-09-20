-- Test script to verify VC setup
-- Run this in Supabase SQL Editor to check if everything is working

-- 1. Check if issuers table exists and has data
SELECT 
    'issuers_table_check' as test_name,
    COUNT(*) as issuer_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM issuers;

-- 2. Check if default issuer exists
SELECT 
    'default_issuer_check' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM issuers 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 3. Check RLS policies on issuers table
SELECT 
    'rls_policies_check' as test_name,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM pg_policies 
WHERE tablename = 'issuers';

-- 4. Test if we can read issuers (simulates the app check)
SELECT 
    'read_access_check' as test_name,
    COUNT(*) as readable_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM issuers 
WHERE status = 'active';

-- 5. Check if verifiable_credentials table exists
SELECT 
    'vc_table_check' as test_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verifiable_credentials') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- 6. Show all issuers for debugging
SELECT 
    'all_issuers' as debug_info,
    id,
    name,
    did,
    status,
    created_at
FROM issuers 
ORDER BY created_at DESC;

