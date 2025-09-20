-- Test faculty dashboard data flow

-- Step 1: Check if there are any certificates at all
SELECT '=== ALL CERTIFICATES ===' as info;

SELECT 
    c.id,
    c.title,
    c.status,
    c.uploaded_at,
    p.full_name as student_name,
    p.email as student_email,
    p.role as student_role
FROM certificates c
LEFT JOIN profiles p ON c.student_id = p.id
ORDER BY c.uploaded_at DESC;

-- Step 2: Check faculty records
SELECT '=== FACULTY RECORDS ===' as info;

SELECT 
    f.id,
    f.name,
    f.email,
    f.user_id,
    p.full_name as profile_name,
    p.role as profile_role
FROM faculty f
LEFT JOIN profiles p ON f.user_id = p.user_id
ORDER BY f.created_at DESC;

-- Step 3: Check student mentor assignments
SELECT '=== STUDENT MENTOR ASSIGNMENTS ===' as info;

SELECT 
    sma.id,
    sma.student_id,
    sma.mentor_id,
    s.full_name as student_name,
    s.email as student_email,
    f.name as faculty_name,
    f.email as faculty_email
FROM student_mentor_assignments sma
LEFT JOIN profiles s ON sma.student_id = s.id
LEFT JOIN faculty f ON sma.mentor_id = f.id
ORDER BY sma.created_at DESC;

-- Step 4: Test the exact query that faculty dashboard uses
SELECT '=== FACULTY DASHBOARD QUERY TEST ===' as info;

-- This simulates the faculty dashboard fetchCertificates logic
WITH faculty_lookup AS (
    SELECT id 
    FROM faculty 
    LIMIT 1
),
student_assignments AS (
    SELECT student_id 
    FROM student_mentor_assignments sma
    JOIN faculty_lookup f ON sma.mentor_id = f.id
)
SELECT 
    'Certificates accessible to faculty' as info,
    c.id,
    c.title,
    c.status,
    c.uploaded_at,
    p.full_name as student_name,
    p.email as student_email
FROM certificates c
JOIN student_assignments sa ON c.student_id = sa.student_id
JOIN profiles p ON c.student_id = p.id
ORDER BY c.uploaded_at DESC;

-- Step 5: Check if there are any pending certificates
SELECT '=== PENDING CERTIFICATES ===' as info;

SELECT 
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

-- Step 6: Check profiles with student role
SELECT '=== STUDENT PROFILES ===' as info;

SELECT 
    id,
    full_name,
    email,
    role,
    student_id,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC;

-- Step 7: Check if certificates table has the right structure
SELECT '=== CERTIFICATES TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== FACULTY DASHBOARD DATA TEST COMPLETED ===' as status;

