-- Verify Credential by ID
-- Replace 'YOUR_CREDENTIAL_ID_HERE' with the actual credential ID

-- 1. Get credential by ID with all details
SELECT 
    'Credential by ID' as verification_type,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issuer_id,
    vc.student_id,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    vc.revocation_reason,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    -- Student information
    p.full_name as student_name,
    p.email as student_email,
    -- Issuer information
    i.name as issuer_name,
    i.did as issuer_did,
    i.status as issuer_status,
    -- Credential details
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->>'organizer' as organizer,
    vc.credential_json->'credentialSubject'->>'role' as role,
    vc.credential_json->'credentialSubject'->>'date' as activity_date,
    vc.credential_json->'credentialSubject'->>'hours' as hours,
    vc.credential_json->'credentialSubject'->>'location' as location,
    -- Faculty information
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty'->>'name' as issued_by_faculty,
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty'->>'department' as faculty_department
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
LEFT JOIN issuers i ON vc.issuer_id = i.id
WHERE vc.id = 'YOUR_CREDENTIAL_ID_HERE';

-- 2. Get credential by VC ID (the URN identifier)
SELECT 
    'Credential by VC ID' as verification_type,
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
    vc.credential_json
FROM verifiable_credentials vc
WHERE vc.vc_id = 'urn:uuid:YOUR_VC_ID_HERE';

-- 3. List all credential IDs for reference
SELECT 
    'All Credential IDs' as info_type,
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
