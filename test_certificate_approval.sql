-- Test certificate approval system

-- Step 1: Check if there are any pending certificates
SELECT 
    'Pending certificates for approval' as info,
    c.id,
    c.title,
    c.status,
    c.uploaded_at,
    p.full_name as student_name,
    p.email as student_email
FROM certificates c
JOIN profiles p ON c.student_id = p.id
WHERE c.status = 'pending'
ORDER BY c.uploaded_at DESC;

-- Step 2: Check faculty access to certificates
SELECT 
    'Faculty access test' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    COUNT(sma.student_id) as assigned_students,
    COUNT(c.id) as accessible_certificates
FROM faculty f
LEFT JOIN student_mentor_assignments sma ON f.id = sma.mentor_id
LEFT JOIN certificates c ON sma.student_id = c.student_id
GROUP BY f.id, f.name, f.email;

-- Step 3: Test certificate approval (approve first pending certificate)
DO $$
DECLARE
    cert_id UUID;
    faculty_id UUID;
BEGIN
    -- Get first pending certificate
    SELECT id INTO cert_id 
    FROM certificates 
    WHERE status = 'pending' 
    LIMIT 1;
    
    -- Get first faculty member
    SELECT id INTO faculty_id 
    FROM faculty 
    LIMIT 1;
    
    IF cert_id IS NOT NULL AND faculty_id IS NOT NULL THEN
        -- Approve the certificate
        UPDATE certificates 
        SET 
            status = 'approved',
            verified_by = faculty_id,
            verified_at = now(),
            remark = 'Test approval - system working correctly'
        WHERE id = cert_id;
        
        RAISE NOTICE 'Certificate % approved by faculty %', cert_id, faculty_id;
    ELSE
        RAISE NOTICE 'No pending certificates or faculty found for testing';
    END IF;
END $$;

-- Step 4: Check the result
SELECT 
    'Certificate approval test result' as info,
    c.id,
    c.title,
    c.status,
    c.verified_at,
    c.remark,
    p.full_name as student_name
FROM certificates c
JOIN profiles p ON c.student_id = p.id
WHERE c.status = 'approved'
ORDER BY c.verified_at DESC
LIMIT 1;

-- Step 5: Check notifications were created
SELECT 
    'Notifications created' as info,
    COUNT(*) as count
FROM notifications
WHERE type LIKE '%certificate%';

SELECT '=== CERTIFICATE APPROVAL TEST COMPLETED ===' as status;

