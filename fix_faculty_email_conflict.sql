-- Fix faculty email conflict issue

-- Step 1: Check current state
SELECT '=== CHECKING FACULTY EMAIL CONFLICT ===' as info;

-- Check if the email exists in faculty table
SELECT 
    'Faculty with email g40479087@gmail.com' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE email = 'g40479087@gmail.com';

-- Check if the specific ID exists in faculty table
SELECT 
    'Faculty with ID 0a130696-16c9-4c96-b3c2-7f0eb4175679' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Check the profile that should match
SELECT 
    'Profile with ID 0a130696-16c9-4c96-b3c2-7f0eb4175679' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    user_id
FROM profiles 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 2: Fix the conflict by updating the existing faculty record
SELECT '=== FIXING EMAIL CONFLICT ===' as info;

-- Update the existing faculty record to use the correct ID
UPDATE faculty 
SET 
    id = '0a130696-16c9-4c96-b3c2-7f0eb4175679',
    name = p.full_name,
    user_id = p.user_id,
    updated_at = now()
FROM profiles p
WHERE faculty.email = 'g40479087@gmail.com'
AND p.id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
AND p.role = 'faculty';

-- Step 3: If the update didn't work, delete the conflicting record and create the correct one
DO $$
BEGIN
    -- Check if the update worked
    IF NOT EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') THEN
        -- Delete the conflicting record
        DELETE FROM faculty WHERE email = 'g40479087@gmail.com' AND id != '0a130696-16c9-4c96-b3c2-7f0eb4175679';
        
        -- Create the correct faculty record
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
        AND p.role = 'faculty';
        
        RAISE NOTICE 'Created faculty record with correct ID after deleting conflicting record';
    ELSE
        RAISE NOTICE 'Faculty record already exists with correct ID';
    END IF;
END $$;

-- Step 4: Verify the fix
SELECT 
    'Faculty record after fix' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 5: Test course insertion
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
        'Test Course After Fix', 
        'TEST_AFTER_FIX_001', 
        '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
        ARRAY['Mandatory'], 
        'Test course after fixing faculty conflict', 
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

-- Step 6: Show final status
SELECT 
    'Final faculty records count' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty records with correct IDs' as info,
    COUNT(*) as count
FROM faculty f
JOIN profiles p ON f.id = p.id
WHERE p.role = 'faculty';

SELECT '=== FACULTY EMAIL CONFLICT FIXED ===' as status;

