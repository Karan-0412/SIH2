-- Resolve faculty email conflict by updating existing record

-- Step 1: Check current state
SELECT '=== CHECKING EMAIL CONFLICT ===' as info;

-- Check existing faculty record with the email
SELECT 
    'Existing faculty record' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE email = 'g40479087@gmail.com';

-- Check if target ID exists
SELECT 
    'Target faculty ID' as info,
    CASE WHEN EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') 
         THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

-- Step 2: Update the existing faculty record to use the correct ID
UPDATE faculty 
SET 
    id = '0a130696-16c9-4c96-b3c2-7f0eb4175679',
    name = 'Faculty Member',
    user_id = (SELECT user_id FROM profiles WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679' LIMIT 1),
    updated_at = now()
WHERE email = 'g40479087@gmail.com';

-- Step 3: If the update didn't work, delete and recreate
DO $$
BEGIN
    -- Check if the update worked
    IF NOT EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') THEN
        -- Delete the conflicting record
        DELETE FROM faculty WHERE email = 'g40479087@gmail.com';
        
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
        VALUES (
            '0a130696-16c9-4c96-b3c2-7f0eb4175679',
            'Faculty Member',
            'g40479087@gmail.com',
            'General',
            'Faculty',
            true,
            (SELECT user_id FROM profiles WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679' LIMIT 1)
        );
        
        RAISE NOTICE 'Created faculty record with correct ID after deleting conflicting record';
    ELSE
        RAISE NOTICE 'Faculty record already exists with correct ID';
    END IF;
END $$;

-- Step 4: Verify the faculty record exists with correct ID
SELECT 
    'Faculty record after fix' as info,
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
    'Test Course Email Conflict Fix', 
    'TEST_EMAIL_FIX_001', 
    '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
    ARRAY['Mandatory'], 
    'Test course after email conflict fix', 
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
WHERE course_code = 'TEST_EMAIL_FIX_001';

-- Clean up test course
DELETE FROM courses WHERE course_code = 'TEST_EMAIL_FIX_001';

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

SELECT '=== EMAIL CONFLICT RESOLVED ===' as status;

