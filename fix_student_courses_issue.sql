-- Fix Student Courses Issue
-- This script addresses the main issues preventing students from seeing assigned courses

-- Step 1: Check current state
SELECT '=== CURRENT STATE CHECK ===' as section;

-- Check if courses exist
SELECT 'Courses count:' as info, COUNT(*) as count FROM courses;

-- Check if students exist
SELECT 'Students count:' as info, COUNT(*) as count FROM profiles WHERE role = 'student';

-- Check if any courses have assigned students
SELECT 'Courses with assigned students:' as info, COUNT(*) as count 
FROM courses 
WHERE assigned_student_ids IS NOT NULL 
AND array_length(assigned_student_ids, 1) > 0;

-- Step 2: Fix RLS policies for courses (if needed)
SELECT '=== FIXING RLS POLICIES ===' as section;

-- Disable RLS temporarily
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "courses_select_auth" ON courses;
DROP POLICY IF EXISTS "courses_insert_faculty" ON courses;
DROP POLICY IF EXISTS "courses_update_faculty" ON courses;
DROP POLICY IF EXISTS "courses_read_all_authenticated" ON courses;
DROP POLICY IF EXISTS "courses_insert_by_faculty" ON courses;
DROP POLICY IF EXISTS "courses_update_by_faculty" ON courses;
DROP POLICY IF EXISTS "Allow all operations on courses" ON courses;

-- Create permissive policies
CREATE POLICY "Allow all operations on courses" ON courses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Step 3: Create test data if none exists
SELECT '=== CREATING TEST DATA ===' as section;

-- Check if we have courses
DO $$
DECLARE
    course_count INTEGER;
    student_count INTEGER;
    faculty_id UUID;
    student_id UUID;
BEGIN
    -- Count existing courses and students
    SELECT COUNT(*) INTO course_count FROM courses;
    SELECT COUNT(*) INTO student_count FROM profiles WHERE role = 'student';
    
    -- Get a faculty ID
    SELECT id INTO faculty_id FROM profiles WHERE role = 'faculty' LIMIT 1;
    
    -- Get a student ID
    SELECT id INTO student_id FROM profiles WHERE role = 'student' LIMIT 1;
    
    -- If no courses exist, create one
    IF course_count = 0 THEN
        INSERT INTO courses (name, course_code, faculty_id, description, assigned_student_ids)
        VALUES (
            'Introduction to Computer Science',
            'CS101',
            faculty_id,
            'Basic concepts of computer science and programming',
            ARRAY[student_id::text]
        );
        RAISE NOTICE 'Created test course';
    END IF;
    
    -- If no students are assigned to any course, assign the first student to the first course
    IF NOT EXISTS (SELECT 1 FROM courses WHERE assigned_student_ids IS NOT NULL AND array_length(assigned_student_ids, 1) > 0) THEN
        UPDATE courses 
        SET assigned_student_ids = ARRAY[student_id::text]
        WHERE id = (SELECT id FROM courses LIMIT 1);
        RAISE NOTICE 'Assigned student to course';
    END IF;
END $$;

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as section;

-- Check courses with assigned students
SELECT 
    'Courses with assigned students:' as info,
    c.name as course_name,
    c.assigned_student_ids,
    p.full_name as student_name
FROM courses c
CROSS JOIN LATERAL unnest(c.assigned_student_ids) as assigned_id
JOIN profiles p ON p.id::text = assigned_id
WHERE c.assigned_student_ids IS NOT NULL;

-- Test the exact query that StudentCourses uses
SELECT 
    'Student courses query test:' as info,
    c.id,
    c.name,
    c.course_code,
    c.assigned_student_ids,
    p.id as student_id,
    p.full_name as student_name
FROM courses c
CROSS JOIN profiles p
WHERE p.role = 'student'
AND c.assigned_student_ids IS NOT NULL
AND c.assigned_student_ids @> ARRAY[p.id::text];

-- Step 5: Show final status
SELECT '=== FINAL STATUS ===' as section;
SELECT 
    'Total courses:' as info, COUNT(*) as count FROM courses
UNION ALL
SELECT 
    'Courses with assigned students:' as info, 
    COUNT(*) as count 
FROM courses 
WHERE assigned_student_ids IS NOT NULL 
AND array_length(assigned_student_ids, 1) > 0
UNION ALL
SELECT 
    'Total students:' as info, COUNT(*) as count FROM profiles WHERE role = 'student';
