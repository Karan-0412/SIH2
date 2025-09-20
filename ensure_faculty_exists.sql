-- Ensure faculty record exists with the correct ID

-- Step 1: Check if the faculty record exists
SELECT 
    'Checking if faculty record exists' as info,
    CASE WHEN EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') 
         THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

-- Step 2: Check the profile that should match
SELECT 
    'Profile for faculty ID' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    user_id
FROM profiles 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 3: Force create the faculty record
INSERT INTO faculty (
    id,
    name,
    email,
    department,
    designation,
    is_verified,
    user_id
)
VALUES (
    '0a130696-16c9-4c96-b3c2-7f0eb4175679',
    'Faculty Member',
    'g40479087@gmail.com',
    'General',
    'Faculty',
    true,
    (SELECT user_id FROM profiles WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679' LIMIT 1)
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id,
    updated_at = now();

-- Step 4: Verify the faculty record was created
SELECT 
    'Faculty record after creation' as info,
    id,
    name,
    email,
    department,
    designation,
    is_verified,
    user_id
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 5: Test course insertion
INSERT INTO courses (
    name, 
    course_code, 
    faculty_id, 
    tags, 
    description, 
    deadline, 
    credit_hours
) VALUES (
    'Test Course Faculty Exists', 
    'TEST_FACULTY_EXISTS_001', 
    '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
    ARRAY['Mandatory'], 
    'Test course to verify faculty exists', 
    CURRENT_DATE + INTERVAL '30 days', 
    3
) ON CONFLICT (course_code) DO NOTHING;

-- Show the test course was created
SELECT 
    'Test course created' as info,
    id,
    name,
    course_code,
    faculty_id
FROM courses 
WHERE course_code = 'TEST_FACULTY_EXISTS_001';

-- Clean up test course
DELETE FROM courses WHERE course_code = 'TEST_FACULTY_EXISTS_001';

-- Step 6: Show final status
SELECT 
    'Final faculty records count' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty record with target ID' as info,
    id,
    name,
    email
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

SELECT '=== FACULTY RECORD ENSURED ===' as status;

