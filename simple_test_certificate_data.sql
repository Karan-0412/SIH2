-- Simple test certificate data creation

-- Step 1: Ensure we have students
SELECT '=== CREATING TEST STUDENTS ===' as info;

-- Create test students if none exist
INSERT INTO profiles (
    id,
    user_id,
    full_name,
    email,
    role,
    student_id,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'Test Student ' || ROW_NUMBER() OVER (ORDER BY 1),
    'teststudent' || ROW_NUMBER() OVER (ORDER BY 1) || '@example.com',
    'student',
    'STU' || LPAD(ROW_NUMBER() OVER (ORDER BY 1)::text, 3, '0'),
    now(),
    now()
FROM generate_series(1, 3)
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'student')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Ensure we have faculty
SELECT '=== CREATING TEST FACULTY ===' as info;

-- Create test faculty if none exist
INSERT INTO profiles (
    id,
    user_id,
    full_name,
    email,
    role,
    faculty_level,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'Test Faculty ' || ROW_NUMBER() OVER (ORDER BY 1),
    'testfaculty' || ROW_NUMBER() OVER (ORDER BY 1) || '@example.com',
    'faculty',
    'basic',
    now(),
    now()
FROM generate_series(1, 1)
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'faculty')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create faculty records
SELECT '=== CREATING FACULTY RECORDS ===' as info;

INSERT INTO faculty (
    id,
    name,
    email,
    department,
    designation,
    is_verified,
    user_id
)
SELECT 
    p.id,
    p.full_name,
    p.email,
    'Test Department',
    'Test Faculty',
    true,
    p.user_id
FROM profiles p
WHERE p.role = 'faculty'
AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.id = p.id)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = now();

-- Step 4: Create student mentor assignments
SELECT '=== CREATING STUDENT MENTOR ASSIGNMENTS ===' as info;

INSERT INTO student_mentor_assignments (student_id, mentor_id)
SELECT 
    s.id,
    f.id
FROM profiles s
CROSS JOIN faculty f
WHERE s.role = 'student'
AND f.id IS NOT NULL
ON CONFLICT (student_id, mentor_id) DO NOTHING;

-- Step 5: Create test certificates
SELECT '=== CREATING TEST CERTIFICATES ===' as info;

INSERT INTO certificates (
    student_id,
    title,
    description,
    category,
    status,
    file_url,
    file_name
)
SELECT 
    p.id,
    'Test Certificate ' || ROW_NUMBER() OVER (ORDER BY p.id),
    'This is a test certificate for ' || p.full_name,
    'academic',
    'pending',
    'https://example.com/test-cert-' || p.id || '.pdf',
    'test-cert-' || p.id || '.pdf'
FROM profiles p
WHERE p.role = 'student'
AND NOT EXISTS (SELECT 1 FROM certificates WHERE student_id = p.id)
LIMIT 5;

-- Step 6: Verify the data
SELECT '=== VERIFICATION ===' as info;

SELECT 
    'Students created' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'student';

SELECT 
    'Faculty created' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty';

SELECT 
    'Faculty records created' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Student mentor assignments created' as info,
    COUNT(*) as count
FROM student_mentor_assignments;

SELECT 
    'Certificates created' as info,
    COUNT(*) as count
FROM certificates;

-- Step 7: Show students separately
SELECT '=== STUDENTS CREATED ===' as info;

SELECT 
    full_name as name,
    email,
    student_id,
    role
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC;

-- Step 8: Show faculty separately
SELECT '=== FACULTY CREATED ===' as info;

SELECT 
    full_name as name,
    email,
    faculty_level,
    role
FROM profiles 
WHERE role = 'faculty'
ORDER BY created_at DESC;

-- Step 9: Show certificates
SELECT '=== CERTIFICATES ===' as info;

SELECT 
    c.id,
    c.title,
    c.status,
    c.uploaded_at,
    p.full_name as student_name,
    p.email as student_email
FROM certificates c
JOIN profiles p ON c.student_id = p.id
ORDER BY c.uploaded_at DESC;

SELECT '=== SIMPLE TEST CERTIFICATE DATA CREATED ===' as status;

