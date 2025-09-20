-- Debug certificate approval system

-- Step 1: Check certificates table
SELECT '=== CERTIFICATES TABLE ===' as info;

SELECT 
    'Certificates count' as info,
    COUNT(*) as count
FROM certificates;

SELECT 
    'Certificates by status' as info,
    status,
    COUNT(*) as count
FROM certificates 
GROUP BY status;

-- Step 2: Check faculty table
SELECT '=== FACULTY TABLE ===' as info;

SELECT 
    'Faculty records count' as info,
    COUNT(*) as count
FROM faculty;

-- Show sample faculty records
SELECT 
    'Sample faculty records' as info,
    id,
    name,
    email,
    user_id
FROM faculty 
LIMIT 5;

-- Step 3: Check student mentor assignments
SELECT '=== STUDENT MENTOR ASSIGNMENTS ===' as info;

SELECT 
    'Student mentor assignments count' as info,
    COUNT(*) as count
FROM student_mentor_assignments;

-- Show sample assignments
SELECT 
    'Sample assignments' as info,
    id,
    student_id,
    mentor_id,
    created_at
FROM student_mentor_assignments 
LIMIT 5;

-- Step 4: Check profiles with faculty role
SELECT '=== FACULTY PROFILES ===' as info;

SELECT 
    'Faculty profiles count' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty';

-- Show sample faculty profiles
SELECT 
    'Sample faculty profiles' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    user_id
FROM profiles 
WHERE role = 'faculty'
LIMIT 5;

-- Step 5: Check if certificates are linked to students
SELECT '=== CERTIFICATE-STUDENT LINKS ===' as info;

SELECT 
    'Certificates with valid student links' as info,
    COUNT(*) as count
FROM certificates c
JOIN profiles p ON c.student_id = p.id
WHERE p.role = 'student';

-- Show sample certificate-student links
SELECT 
    'Sample certificate-student links' as info,
    c.id as certificate_id,
    c.title,
    c.status,
    c.uploaded_at,
    p.full_name as student_name,
    p.email as student_email
FROM certificates c
JOIN profiles p ON c.student_id = p.id
WHERE p.role = 'student'
ORDER BY c.uploaded_at DESC
LIMIT 5;

-- Step 6: Check if faculty can see certificates (test the query)
SELECT '=== FACULTY CERTIFICATE ACCESS TEST ===' as info;

-- Test with first faculty member
WITH faculty_test AS (
    SELECT id, email, name 
    FROM faculty 
    LIMIT 1
),
assignments_test AS (
    SELECT student_id 
    FROM student_mentor_assignments sma
    JOIN faculty_test f ON sma.mentor_id = f.id
)
SELECT 
    'Certificates accessible to first faculty' as info,
    COUNT(*) as count
FROM certificates c
JOIN assignments_test a ON c.student_id = a.student_id;

-- Step 7: Check RLS policies on certificates
SELECT '=== CERTIFICATES RLS POLICIES ===' as info;

SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'certificates';

SELECT 
    'RLS Policies' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'certificates';

-- Step 8: Check if there are any pending certificates
SELECT '=== PENDING CERTIFICATES ===' as info;

SELECT 
    'Pending certificates' as info,
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

SELECT '=== CERTIFICATE APPROVAL DEBUG COMPLETED ===' as status;

