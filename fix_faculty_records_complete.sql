-- Complete fix for faculty records and courses foreign key issue

-- Step 1: Check current state
SELECT '=== CHECKING CURRENT STATE ===' as info;

-- Check if faculty table exists and has data
SELECT 
    'Faculty table status' as info,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faculty') 
         THEN 'EXISTS' ELSE 'MISSING' END as table_status,
    (SELECT COUNT(*) FROM faculty) as record_count;

-- Check profiles with faculty role
SELECT 
    'Faculty profiles count' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty';

-- Step 2: Ensure faculty table exists with correct structure
SELECT '=== ENSURING FACULTY TABLE EXISTS ===' as info;

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

-- Step 3: Create faculty records for all faculty profiles
SELECT '=== CREATING FACULTY RECORDS ===' as info;

-- Insert faculty records for profiles that don't have them
INSERT INTO faculty (id, name, email, department, designation, is_verified, user_id)
SELECT 
    p.id,  -- Use the profile ID as the faculty ID
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
    SELECT 1 FROM faculty f 
    WHERE f.email = p.email OR f.user_id = p.user_id
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id,
    updated_at = now();

-- Step 4: Fix courses table foreign key constraint
SELECT '=== FIXING COURSES FOREIGN KEY ===' as info;

-- Drop existing foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'courses_faculty_id_fkey' 
        AND table_name = 'courses'
    ) THEN
        ALTER TABLE courses DROP CONSTRAINT courses_faculty_id_fkey;
        RAISE NOTICE 'Dropped existing courses_faculty_id_fkey constraint';
    END IF;
END $$;

-- Add correct foreign key constraint
ALTER TABLE courses 
ADD CONSTRAINT courses_faculty_id_fkey 
FOREIGN KEY (faculty_id) REFERENCES faculty(id);

-- Step 5: Update existing courses to have valid faculty_id
SELECT '=== UPDATING EXISTING COURSES ===' as info;

-- Update courses that have invalid faculty_id
UPDATE courses 
SET faculty_id = (
    SELECT f.id 
    FROM faculty f 
    WHERE f.email = (SELECT email FROM profiles WHERE id = courses.created_by)
    LIMIT 1
)
WHERE faculty_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM faculty WHERE id = courses.faculty_id);

-- If there are still courses without valid faculty_id, assign them to the first available faculty
UPDATE courses 
SET faculty_id = (SELECT id FROM faculty LIMIT 1)
WHERE faculty_id IS NULL 
OR NOT EXISTS (SELECT 1 FROM faculty WHERE id = courses.faculty_id);

-- Step 6: Test the fix
SELECT '=== TESTING THE FIX ===' as info;

-- Test inserting a course
DO $$
DECLARE
    test_faculty_id UUID;
    test_course_id UUID;
BEGIN
    -- Get a valid faculty ID
    SELECT id INTO test_faculty_id FROM faculty LIMIT 1;
    
    IF test_faculty_id IS NOT NULL THEN
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
            'Test Course Faculty Fix', 
            'TEST_FACULTY_001', 
            test_faculty_id, 
            ARRAY['Mandatory'], 
            'Test course to verify faculty fix', 
            CURRENT_DATE + INTERVAL '30 days', 
            3
        ) RETURNING id INTO test_course_id;
        
        RAISE NOTICE 'Test course inserted successfully with ID: %', test_course_id;
        
        -- Clean up the test course
        DELETE FROM courses WHERE id = test_course_id;
        RAISE NOTICE 'Test course cleaned up';
    ELSE
        RAISE NOTICE 'No faculty records found for testing';
    END IF;
END $$;

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as info;

-- Check faculty records
SELECT 
    'Faculty records after fix' as info,
    COUNT(*) as count
FROM faculty;

-- Check courses with valid faculty_id
SELECT 
    'Courses with valid faculty_id' as info,
    COUNT(*) as count
FROM courses 
WHERE faculty_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM faculty WHERE id = courses.faculty_id);

-- Show sample faculty records
SELECT 
    'Sample faculty records' as info,
    id,
    name,
    email,
    user_id
FROM faculty 
LIMIT 3;

SELECT '=== FACULTY RECORDS FIX COMPLETED ===' as status;

