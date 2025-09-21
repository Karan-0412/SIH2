-- Get Your Verification Tokens
-- This script gets all verification tokens for credentials you've issued

-- Step 1: Get all credentials with their verification tokens
SELECT 
    'YOUR_VERIFICATION_TOKENS' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name,
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty'->>'name' as issued_by_faculty
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC;

-- Step 2: Get tokens for a specific student
-- Replace 'John Doe' with the actual student name
SELECT 
    'TOKENS_FOR_STUDENT' as info,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name,
    vc.credential_json->'credentialSubject'->>'title' as activity_title
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE p.full_name ILIKE '%John Doe%'
ORDER BY vc.issued_at DESC;

-- Step 3: Get the most recent token
SELECT 
    'MOST_RECENT_TOKEN' as info,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name,
    vc.credential_json->'credentialSubject'->>'title' as activity_title
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 1;
