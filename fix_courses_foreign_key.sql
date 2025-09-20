-- Fix courses table foreign key constraint issue

-- Step 1: Check current foreign key constraints
SELECT '=== CURRENT FOREIGN KEY CONSTRAINTS ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses';

-- Step 2: Check courses table structure
SELECT '=== COURSES TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Step 3: Check faculty table structure
SELECT '=== FACULTY TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'faculty' 
ORDER BY ordinal_position;

-- Step 4: Check if faculty_id column exists in courses
SELECT '=== CHECKING FACULTY_ID COLUMN ===' as info;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'faculty_id'
    ) THEN 'EXISTS' ELSE 'MISSING' END as faculty_id_column_status;

-- Step 5: Fix the foreign key constraint
SELECT '=== FIXING FOREIGN KEY CONSTRAINT ===' as info;

-- Drop the existing foreign key constraint if it exists
DO $$
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'courses_faculty_id_fkey' 
        AND table_name = 'courses'
    ) THEN
        ALTER TABLE courses DROP CONSTRAINT courses_faculty_id_fkey;
        RAISE NOTICE 'Dropped existing courses_faculty_id_fkey constraint';
    END IF;
END $$;

-- Add the correct foreign key constraint to reference faculty table
ALTER TABLE courses 
ADD CONSTRAINT courses_faculty_id_fkey 
FOREIGN KEY (faculty_id) REFERENCES faculty(id);

-- Step 6: Verify the fix
SELECT '=== VERIFYING THE FIX ===' as info;

-- Check the new foreign key constraint
SELECT 
    'New Foreign Key Constraint' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'courses';

-- Step 7: Test inserting a course with a valid faculty_id
SELECT '=== TESTING COURSE INSERTION ===' as info;

-- Get a valid faculty ID
SELECT 
    'Valid Faculty ID for Testing' as info,
    id,
    name,
    email
FROM faculty 
LIMIT 1;

-- Test insert (this will be rolled back)
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
            'Test Course FK Fix', 
            'TEST_FK_001', 
            test_faculty_id, 
            ARRAY['Mandatory'], 
            'Test course to verify FK fix', 
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

SELECT '=== FOREIGN KEY FIX COMPLETED ===' as status;

