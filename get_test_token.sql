-- Get a Test Verification Token
-- This gets the most recent credential for testing

SELECT 
    'TEST_VERIFICATION' as info,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    vc.issued_at,
    p.full_name as student_name,
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    'Copy this URL and paste it in your browser to test verification' as instructions
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 1;
