-- Debug Course Fetching Issue
-- This script tests the exact query logic used in StudentCourses.tsx

-- Step 1: Check what's in the database
SELECT '=== DATABASE STATE ===' as section;

-- Check courses table
SELECT 'Courses in database:' as info;
SELECT 
    id, 
    name, 
    course_code, 
    assigned_student_ids,
    pg_typeof(assigned_student_ids) as field_type,
    array_length(assigned_student_ids, 1) as array_length
FROM courses 
ORDER BY created_at DESC;

-- Check student profiles
SELECT 'Student profiles:' as info;
SELECT 
    id, 
    full_name, 
    email, 
    role,
    pg_typeof(id) as id_type
FROM profiles 
WHERE role = 'student' 
ORDER BY created_at DESC;

-- Step 2: Test the exact query from StudentCourses.tsx
SELECT '=== TESTING STUDENT COURSES QUERY ===' as section;

-- This is the exact query from the component
SELECT 
    'All courses query result:' as info,
    c.id,
    c.name,
    c.course_code,
    c.assigned_student_ids
FROM courses c
ORDER BY c.name;

-- Step 3: Test the filtering logic
SELECT '=== TESTING FILTERING LOGIC ===' as section;

-- Get a student ID to test with
WITH student_data AS (
    SELECT id, full_name FROM profiles WHERE role = 'student' LIMIT 1
)
SELECT 
    'Student for testing:' as info,
    id as student_id,
    full_name as student_name
FROM student_data;

-- Test the filtering with a specific student
WITH student_data AS (
    SELECT id FROM profiles WHERE role = 'student' LIMIT 1
),
filtered_courses AS (
    SELECT 
        c.id,
        c.name,
        c.course_code,
        c.assigned_student_ids,
        c.assigned_student_ids @> ARRAY[sd.id::text] as is_assigned
    FROM courses c
    CROSS JOIN student_data sd
    WHERE c.assigned_student_ids IS NOT NULL
)
SELECT 
    'Filtered courses result:' as info,
    id,
    name,
    course_code,
    assigned_student_ids,
    is_assigned
FROM filtered_courses;

-- Step 4: Test the array contains logic
SELECT '=== TESTING ARRAY CONTAINS LOGIC ===' as section;

-- Test with actual student ID
WITH student_data AS (
    SELECT id::text as student_id_str FROM profiles WHERE role = 'student' LIMIT 1
)
SELECT 
    'Array contains test:' as info,
    c.name as course_name,
    c.assigned_student_ids,
    sd.student_id_str,
    c.assigned_student_ids @> ARRAY[sd.student_id_str] as contains_student
FROM courses c
CROSS JOIN student_data sd
WHERE c.assigned_student_ids IS NOT NULL;

-- Step 5: Test the exact logic from the component
SELECT '=== COMPONENT LOGIC TEST ===' as section;

-- This mimics the exact logic from StudentCourses.tsx
WITH student_data AS (
    SELECT id, full_name FROM profiles WHERE role = 'student' LIMIT 1
),
all_courses AS (
    SELECT * FROM courses ORDER BY name
),
filtered_courses AS (
    SELECT 
        ac.*,
        sd.id as student_id,
        sd.full_name as student_name,
        CASE 
            WHEN ac.assigned_student_ids IS NOT NULL 
            AND array_length(ac.assigned_student_ids, 1) > 0
            AND ac.assigned_student_ids @> ARRAY[sd.id::text]
            THEN true
            ELSE false
        END as should_be_assigned
    FROM all_courses ac
    CROSS JOIN student_data sd
)
SELECT 
    'Component logic result:' as info,
    id,
    name,
    course_code,
    assigned_student_ids,
    student_id,
    student_name,
    should_be_assigned
FROM filtered_courses
WHERE should_be_assigned = true;

-- Step 6: Check for data type issues
SELECT '=== DATA TYPE ANALYSIS ===' as section;

SELECT 
    'Course assigned_student_ids sample:' as info,
    assigned_student_ids[1] as first_element,
    pg_typeof(assigned_student_ids[1]) as element_type
FROM courses 
WHERE assigned_student_ids IS NOT NULL 
AND array_length(assigned_student_ids, 1) > 0
LIMIT 1;

SELECT 
    'Student ID sample:' as info,
    id as student_id,
    pg_typeof(id) as id_type,
    id::text as id_as_text
FROM profiles 
WHERE role = 'student'
LIMIT 1;
