-- Test the verification process
-- This script tests the queries used in credential verification

-- Test 1: Check if we have verifiable credentials
SELECT 
    'credentials_count' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM verifiable_credentials;

-- Test 2: Check if we can query credentials with short tokens
SELECT 
    'credentials_with_tokens' as test_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM verifiable_credentials 
WHERE short_token IS NOT NULL;

-- Test 3: Test the exact query used in verification
SELECT 
    'verification_query_test' as test_name,
    vc_id,
    issued_at,
    revoked_at,
    revocation_reason,
    issuer_id,
    CASE 
        WHEN vc_id IS NOT NULL THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM verifiable_credentials 
WHERE short_token IS NOT NULL
LIMIT 1;

-- Test 4: Test issuer lookup by ID
SELECT 
    'issuer_lookup_test' as test_name,
    i.name,
    i.did,
    CASE 
        WHEN i.name IS NOT NULL THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
FROM verifiable_credentials vc
JOIN issuers i ON i.id = vc.issuer_id
WHERE vc.short_token IS NOT NULL
LIMIT 1;

-- Test 5: Show all credentials with their details
SELECT 
    'all_credentials' as info_type,
    vc_id,
    short_token,
    issued_at,
    revoked_at,
    issuer_id
FROM verifiable_credentials 
ORDER BY issued_at DESC
LIMIT 5;

