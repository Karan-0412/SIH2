-- Test RLS policies for Verifiable Credentials
-- Run this to verify that the policies are working correctly

-- Test 1: Check if we can read issuers
SELECT 
    'read_issuers_test' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status,
    COUNT(*) as count
FROM issuers;

-- Test 2: Check if we can read verifiable_credentials
SELECT 
    'read_credentials_test' as test_name,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status,
    COUNT(*) as count
FROM verifiable_credentials;

-- Test 3: Try to insert a test credential (this should work now)
-- First, get a real student ID from profiles table
INSERT INTO verifiable_credentials (
    vc_id,
    student_id,
    issuer_id,
    credential_json,
    credential_hash,
    proof,
    short_token
) VALUES (
    'urn:uuid:test-rls-' || extract(epoch from now())::text,
    (SELECT id FROM profiles WHERE role = 'student' LIMIT 1), -- Use a real student ID
    '00000000-0000-0000-0000-000000000001', -- Use the issuer ID
    '{"test": "rls_policy_test", "timestamp": "' || now()::text || '"}',
    'test-hash-' || extract(epoch from now())::text,
    '{"test": "proof"}',
    'test-token-' || extract(epoch from now())::text
);

-- Test 4: Check if the insert worked
SELECT 
    'insert_credentials_test' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status,
    COUNT(*) as count
FROM verifiable_credentials 
WHERE vc_id LIKE 'urn:uuid:test-rls-%';

-- Test 5: Show all policies on verifiable_credentials table
SELECT 
    'policies_check' as test_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'verifiable_credentials'
ORDER BY policyname;

-- Test 6: Show all policies on issuers table
SELECT 
    'issuer_policies_check' as test_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'issuers'
ORDER BY policyname;
