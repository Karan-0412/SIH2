-- Test script to assign a course to a student
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what we have
SELECT '=== CURRENT DATA ===' as section;
SELECT 'Courses:' as info;
SELECT id, name, course_code FROM courses LIMIT 3;

SELECT 'Students:' as info;
SELECT id, full_name, email FROM profiles WHERE role = 'student' LIMIT 3;

-- 2. Assign the first course to the first student
UPDATE courses 
SET assigned_student_ids = ARRAY[(SELECT id::text FROM profiles WHERE role = 'student' LIMIT 1)]
WHERE id = (SELECT id FROM courses LIMIT 1);

-- 3. Verify the assignment
SELECT '=== AFTER ASSIGNMENT ===' as section;
SELECT 
  c.name as course_name,
  c.assigned_student_ids,
  p.full_name as student_name,
  p.id as student_id
FROM courses c
CROSS JOIN LATERAL unnest(c.assigned_student_ids) as assigned_id
JOIN profiles p ON p.id::text = assigned_id
WHERE c.id = (SELECT id FROM courses LIMIT 1);

-- 4. Test the exact query that should work
SELECT '=== STUDENT COURSES QUERY ===' as section;
SELECT 
  c.id,
  c.name,
  c.course_code
FROM courses c
WHERE c.assigned_student_ids @> ARRAY[(SELECT id::text FROM profiles WHERE role = 'student' LIMIT 1)];
