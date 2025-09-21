-- Simple fix for faculty ID issue

-- Step 1: Delete any conflicting faculty records
DELETE FROM faculty WHERE email = 'g40479087@gmail.com' AND id != '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 2: Create the faculty record with the correct ID
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
    'General' as department,
    'Faculty' as designation,
    true as is_verified,
    p.user_id
FROM profiles p
WHERE p.id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
AND p.role = 'faculty'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id,
    updated_at = now();

-- Step 3: Verify the record exists
SELECT 
    'Faculty record created/updated' as info,
    id,
    name,
    email,
    user_id
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 4: Test course insertion
INSERT INTO courses (
    name, 
    course_code, 
    faculty_id, 
    tags, 
    description, 
    deadline, 
    credit_hours
) VALUES (
    'Test Course Simple Fix', 
    'TEST_SIMPLE_001', 
    '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
    ARRAY['Mandatory'], 
    'Test course after simple fix', 
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
WHERE course_code = 'TEST_SIMPLE_001';

-- Clean up test course
DELETE FROM courses WHERE course_code = 'TEST_SIMPLE_001';

SELECT '=== SIMPLE FACULTY FIX COMPLETED ===' as status;

