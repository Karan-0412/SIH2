-- Sample Verification Test Data
-- This script creates sample credentials for testing verification

-- First, let's see what credentials exist
SELECT 
    'EXISTING_CREDENTIALS' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    p.full_name as student_name,
    vc.issued_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 10;

-- Sample verification by short token (replace with actual token)
-- Example: Verify credential with short token 'abc123def456'
SELECT 
    'VERIFY_BY_TOKEN' as verification_type,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->>'organizer' as organizer,
    vc.credential_json->'credentialSubject'->>'role' as role,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE vc.short_token = 'REPLACE_WITH_ACTUAL_TOKEN';

-- Sample verification by VC ID (replace with actual VC ID)
-- Example: Verify credential with VC ID 'urn:uuid:...'
SELECT 
    'VERIFY_BY_VC_ID' as verification_type,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->>'organizer' as organizer,
    vc.credential_json->'credentialSubject'->>'role' as role,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE vc.vc_id = 'REPLACE_WITH_ACTUAL_VC_ID';

-- Sample verification by database ID (replace with actual database ID)
-- Example: Verify credential with database ID '12345678-1234-1234-1234-123456789abc'
SELECT 
    'VERIFY_BY_DATABASE_ID' as verification_type,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->>'organizer' as organizer,
    vc.credential_json->'credentialSubject'->>'role' as role,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE vc.id = 'REPLACE_WITH_ACTUAL_DATABASE_ID';

-- Get QR code URLs for existing credentials
SELECT 
    'QR_CODE_URLS' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    'http://localhost:8080/verify?t=' || vc.short_token as qr_url,
    'http://localhost:8080/api/v1/credentials/' || vc.vc_id as api_url,
    p.full_name as student_name,
    vc.issued_at
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 5;

-- Check issuer information
SELECT 
    'ISSUER_INFO' as info,
    i.id as issuer_id,
    i.name as issuer_name,
    i.did as issuer_did,
    i.status as issuer_status,
    COUNT(vc.id) as credentials_issued
FROM issuers i
LEFT JOIN verifiable_credentials vc ON i.id = vc.issuer_id
GROUP BY i.id, i.name, i.did, i.status;

-- Sample verification result format
SELECT 
    'SAMPLE_VERIFICATION_RESULT' as info,
    vc.vc_id,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'revoked'
        WHEN vc.expires_at < NOW() THEN 'invalid'
        ELSE 'valid'
    END as status,
    CASE 
        WHEN vc.credential_json->'proof'->>'jws' IS NOT NULL THEN true
        ELSE false
    END as signatureValid,
    json_build_object(
        'id', i.did,
        'name', i.name
    ) as issuer,
    vc.issued_at as issuedAt,
    CASE WHEN vc.revoked_at IS NOT NULL THEN true ELSE false END as revoked,
    vc.revoked_at as revokedAt,
    vc.revocation_reason as revocationReason,
    true as evidenceValidated
FROM verifiable_credentials vc
LEFT JOIN issuers i ON vc.issuer_id = i.id
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 1;
