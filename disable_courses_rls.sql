-- Disable RLS completely for courses table

-- Step 1: Check current RLS status
SELECT 
    'Current RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'courses';

-- Step 2: Disable RLS completely
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all policies
DROP POLICY IF EXISTS "Users can view courses" ON courses;
DROP POLICY IF EXISTS "Faculty can create courses" ON courses;
DROP POLICY IF EXISTS "Faculty can update their own courses" ON courses;
DROP POLICY IF EXISTS "Faculty can delete their own courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Allow all operations on courses" ON courses;
DROP POLICY IF EXISTS "courses_select_policy" ON courses;
DROP POLICY IF EXISTS "courses_insert_policy" ON courses;
DROP POLICY IF EXISTS "courses_update_policy" ON courses;
DROP POLICY IF EXISTS "courses_delete_policy" ON courses;

-- Step 4: Verify RLS is disabled
SELECT 
    'RLS Status After Disable' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'courses';

-- Step 5: Test course insertion
DO $$
DECLARE
    test_faculty_id UUID;
    test_course_id UUID;
BEGIN
    -- Get any faculty ID for testing
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
            'Test Course No RLS', 
            'TEST_NO_RLS_001', 
            test_faculty_id, 
            ARRAY['Mandatory'], 
            'Test course with RLS disabled', 
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

SELECT '=== COURSES RLS DISABLED ===' as status;

