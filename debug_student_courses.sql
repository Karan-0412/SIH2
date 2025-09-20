-- Debug script to check why students can't see assigned courses
-- Run this in your Supabase SQL Editor

-- 1. Check if courses table exists and has data
SELECT '=== COURSES TABLE ===' as section;
SELECT 
  id, 
  name, 
  course_code, 
  assigned_student_ids,
  pg_typeof(assigned_student_ids) as field_type,
  array_length(assigned_student_ids, 1) as array_length
FROM courses 
LIMIT 5;

-- 2. Check student profiles
SELECT '=== STUDENT PROFILES ===' as section;
SELECT 
  id, 
  full_name, 
  email, 
  role,
  pg_typeof(id) as id_type
FROM profiles 
WHERE role = 'student' 
LIMIT 5;

-- 3. Check if any courses have assigned students
SELECT '=== COURSES WITH ASSIGNED STUDENTS ===' as section;
SELECT 
  c.name as course_name,
  c.assigned_student_ids,
  array_length(c.assigned_student_ids, 1) as student_count
FROM courses c
WHERE c.assigned_student_ids IS NOT NULL 
AND array_length(c.assigned_student_ids, 1) > 0;

-- 4. Test the exact query that StudentCourses uses
SELECT '=== STUDENT COURSES QUERY TEST ===' as section;
SELECT 
  c.id,
  c.name,
  c.course_code,
  c.assigned_student_ids,
  p.id as student_id,
  p.full_name as student_name
FROM courses c
CROSS JOIN profiles p
WHERE p.role = 'student'
AND c.assigned_student_ids @> ARRAY[p.id::text];

-- 5. Check data types and sample values
SELECT '=== DATA TYPE ANALYSIS ===' as section;
SELECT 
  'courses.assigned_student_ids' as field_name,
  pg_typeof(assigned_student_ids) as data_type,
  assigned_student_ids[1] as sample_value,
  pg_typeof(assigned_student_ids[1]) as element_type
FROM courses 
WHERE assigned_student_ids IS NOT NULL 
AND array_length(assigned_student_ids, 1) > 0
LIMIT 1;

SELECT 
  'profiles.id' as field_name,
  pg_typeof(id) as data_type,
  id as sample_value
FROM profiles 
WHERE role = 'student'
LIMIT 1;
