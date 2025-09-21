-- Comprehensive Credential Verification Script
-- This script helps you verify credentials in multiple ways

-- 1. Check all credentials and their basic info
SELECT 
    'All Credentials Overview' as verification_type,
    vc.id,
    vc.vc_id,
    vc.short_token,
    vc.issuer_id,
    vc.student_id,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC;

-- 2. Check credential details and metadata
SELECT 
    'Credential Details' as verification_type,
    vc.vc_id,
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->>'organizer' as organizer,
    vc.credential_json->'credentialSubject'->>'role' as role,
    vc.credential_json->'credentialSubject'->>'date' as activity_date,
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty'->>'name' as issued_by_faculty,
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty'->>'department' as faculty_department,
    vc.credential_json->'issuer'->>'name' as issuer_name,
    vc.credential_json->'issuer'->>'id' as issuer_did
FROM verifiable_credentials vc
ORDER BY vc.issued_at DESC
LIMIT 5;

-- 3. Verify a specific credential by short token
-- Replace 'YOUR_SHORT_TOKEN_HERE' with an actual short token
SELECT 
    'Specific Credential Verification' as verification_type,
    vc.vc_id,
    vc.short_token,
    vc.credential_json,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status
FROM verifiable_credentials vc
WHERE vc.short_token = 'YOUR_SHORT_TOKEN_HERE';

-- 4. Check for any issues with credentials
SELECT 
    'Credential Issues Check' as verification_type,
    COUNT(*) as total_credentials,
    COUNT(CASE WHEN revoked_at IS NOT NULL THEN 1 END) as revoked_count,
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_count,
    COUNT(CASE WHEN revoked_at IS NULL AND expires_at >= NOW() THEN 1 END) as active_count
FROM verifiable_credentials;

-- 5. Verify issuer information
SELECT 
    'Issuer Verification' as verification_type,
    i.id,
    i.name,
    i.did,
    i.status,
    COUNT(vc.id) as credentials_issued
FROM issuers i
LEFT JOIN verifiable_credentials vc ON i.id = vc.issuer_id
GROUP BY i.id, i.name, i.did, i.status;
