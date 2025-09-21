-- Targeted fix for faculty foreign key constraint issue

-- Step 1: Update student_mentor_assignments to reference the correct faculty ID
UPDATE student_mentor_assignments 
SET mentor_id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
WHERE mentor_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Step 2: Update courses to reference the correct faculty ID
UPDATE courses 
SET faculty_id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
WHERE faculty_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Step 3: Now delete the conflicting faculty record
DELETE FROM faculty 
WHERE id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Step 4: Ensure the target faculty record exists
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

-- Step 5: Verify the fix
SELECT 
    'Faculty record exists' as info,
    id,
    name,
    email
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 6: Test course insertion
INSERT INTO courses (
    name, 
    course_code, 
    faculty_id, 
    tags, 
    description, 
    deadline, 
    credit_hours
) VALUES (
    'Test Course Targeted Fix', 
    'TEST_TARGETED_001', 
    '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
    ARRAY['Mandatory'], 
    'Test course after targeted fix', 
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
WHERE course_code = 'TEST_TARGETED_001';

-- Clean up test course
DELETE FROM courses WHERE course_code = 'TEST_TARGETED_001';

SELECT '=== TARGETED FACULTY FIX COMPLETED ===' as status;

