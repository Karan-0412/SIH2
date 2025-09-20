-- Check for students in profiles table for VC testing
-- This script helps identify available student IDs for testing

-- Check if there are any students in the profiles table
SELECT 
    'student_count' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS - Students found' 
        ELSE 'FAIL - No students found' 
    END as status
FROM profiles 
WHERE role = 'student';

-- Show all students with their IDs
SELECT 
    'available_students' as info_type,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC;

-- If no students exist, create a test student with unique email
INSERT INTO profiles (
    id,
    user_id,
    full_name,
    email,
    role
) 
SELECT 
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'Test Student VC',
    'test.student.vc.' || extract(epoch from now())::text || '@example.com',
    'student'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE role = 'student'
);

-- Verify the test student was created
SELECT 
    'test_student_created' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS - Test student created' 
        ELSE 'FAIL - Test student not created' 
    END as status
FROM profiles 
WHERE id = '00000000-0000-0000-0000-000000000002';

-- Show the test student details
SELECT 
    'test_student_details' as info_type,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles 
WHERE id = '00000000-0000-0000-0000-000000000002';
