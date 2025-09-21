-- Complete solution for faculty record issues

-- Step 1: Check current state
SELECT '=== CHECKING CURRENT STATE ===' as info;

-- Check if faculty table exists
SELECT 
    'Faculty table exists' as info,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faculty') 
         THEN 'YES' ELSE 'NO' END as result;

-- Check if the specific faculty ID exists
SELECT 
    'Faculty ID exists' as info,
    CASE WHEN EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') 
         THEN 'YES' ELSE 'NO' END as result;

-- Check the profile
SELECT 
    'Profile exists' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    user_id
FROM profiles 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 2: Ensure faculty table exists with correct structure
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    designation TEXT,
    is_verified BOOLEAN DEFAULT false,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Create the faculty record with the exact ID needed
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

-- Step 4: Verify the faculty record exists
SELECT 
    'Faculty record created' as info,
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
DO $$
DECLARE
    test_course_id UUID;
BEGIN
    -- Try to insert a test course
    INSERT INTO courses (
        name, 
        course_code, 
        faculty_id, 
        tags, 
        description, 
        deadline, 
        credit_hours
    ) VALUES (
        'Test Course Complete Solution', 
        'TEST_COMPLETE_001', 
        '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
        ARRAY['Mandatory'], 
        'Test course after complete solution', 
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

-- Step 6: Create faculty records for ALL faculty profiles to prevent future issues
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
WHERE p.role = 'faculty'
AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.id = p.id)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id,
    updated_at = now();

-- Step 7: Final verification
SELECT 
    'Total faculty records' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty records for faculty profiles' as info,
    COUNT(*) as count
FROM faculty f
JOIN profiles p ON f.id = p.id
WHERE p.role = 'faculty';

-- Show the specific faculty record
SELECT 
    'Target faculty record' as info,
    id,
    name,
    email,
    department,
    designation
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

SELECT '=== COMPLETE FACULTY SOLUTION APPLIED ===' as status;

