-- Fix specific faculty ID issue

-- Step 1: Check if the specific faculty ID exists
SELECT 
    'Checking specific faculty_id' as info,
    CASE WHEN EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') 
         THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

-- Step 2: Check if this ID exists in profiles table
SELECT 
    'Checking in profiles table' as info,
    id,
    full_name,
    email,
    role,
    faculty_level
FROM profiles 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 3: Create faculty record for this specific ID
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
    COALESCE(p.department, 'General') as department,
    CASE 
        WHEN p.faculty_level = 'admin' THEN 'Administrator'
        WHEN p.faculty_level = 'senior' THEN 'Senior Faculty'
        ELSE 'Faculty'
    END as designation,
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

-- Step 4: Verify the faculty record was created
SELECT 
    'Faculty record after creation' as info,
    id,
    name,
    email,
    department,
    designation,
    is_verified
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 5: Create faculty records for ALL faculty profiles to prevent future issues
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
    COALESCE(p.department, 'General') as department,
    CASE 
        WHEN p.faculty_level = 'admin' THEN 'Administrator'
        WHEN p.faculty_level = 'senior' THEN 'Senior Faculty'
        ELSE 'Faculty'
    END as designation,
    true as is_verified,
    p.user_id
FROM profiles p
WHERE p.role = 'faculty'
AND NOT EXISTS (
    SELECT 1 FROM faculty f WHERE f.id = p.id
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id,
    updated_at = now();

-- Step 6: Test course insertion with the specific faculty ID
DO $$
DECLARE
    test_course_id UUID;
BEGIN
    -- Try to insert a test course with the specific faculty ID
    INSERT INTO courses (
        name, 
        course_code, 
        faculty_id, 
        tags, 
        description, 
        deadline, 
        credit_hours
    ) VALUES (
        'Test Course Specific Faculty', 
        'TEST_SPECIFIC_001', 
        '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
        ARRAY['Mandatory'], 
        'Test course with specific faculty ID', 
        CURRENT_DATE + INTERVAL '30 days', 
        3
    ) RETURNING id INTO test_course_id;
    
    RAISE NOTICE 'Test course inserted successfully with ID: %', test_course_id;
    
    -- Clean up the test course
    DELETE FROM courses WHERE id = test_course_id;
    RAISE NOTICE 'Test course cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting test course: %', SQLERRM;
END $$;

-- Step 7: Show final status
SELECT 
    'Final faculty records count' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty records for faculty profiles' as info,
    COUNT(*) as count
FROM faculty f
JOIN profiles p ON f.id = p.id
WHERE p.role = 'faculty';

SELECT '=== SPECIFIC FACULTY ISSUE FIXED ===' as status;

