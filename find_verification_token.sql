-- Find Verification Token for a Credential
-- This script shows you how to find the verification token

-- Method 1: Get token by VC ID (from the JSON file)
-- Replace 'urn:uuid:YOUR_VC_ID_HERE' with the VC ID from your JSON file
SELECT 
    'VERIFICATION_TOKEN_BY_VC_ID' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE vc.vc_id = 'urn:uuid:YOUR_VC_ID_HERE';

-- Method 2: Get token by database ID
-- Replace 'YOUR_DATABASE_ID_HERE' with the database ID
SELECT 
    'VERIFICATION_TOKEN_BY_DATABASE_ID' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE vc.id = 'YOUR_DATABASE_ID_HERE';

-- Method 3: List all recent credentials with their tokens
SELECT 
    'ALL_RECENT_CREDENTIALS' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name,
    vc.credential_json->'credentialSubject'->>'title' as activity_title
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 10;

-- Method 4: Search by student name
-- Replace 'John Doe' with the actual student name
SELECT 
    'VERIFICATION_TOKEN_BY_STUDENT' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name,
    vc.credential_json->'credentialSubject'->>'title' as activity_title
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE p.full_name ILIKE '%John Doe%'
ORDER BY vc.issued_at DESC;
