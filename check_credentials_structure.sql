-- Check the structure of created credentials
-- This will help verify that credentials are being created correctly

-- Check all credentials with their metadata
SELECT 
    vc.id,
    vc.vc_id,
    vc.issuer_id,
    vc.student_id,
    vc.issued_at,
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty' as faculty_info,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 10;

-- Check if any credentials have faculty info in metadata
SELECT 
    'credentials_with_faculty_info' as check_type,
    COUNT(*) as count
FROM verifiable_credentials 
WHERE credential_json->'credentialSubject'->'metadata'->'issuedByFaculty' IS NOT NULL;

-- Check the issuer being used
SELECT 
    'issuer_info' as check_type,
    id,
    name,
    status
FROM issuers 
WHERE status = 'active';
