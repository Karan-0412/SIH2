-- Verify ANSH's assigned courses
-- This will check if ANSH can see their assigned courses

-- 1. First, find ANSH's profile
SELECT '=== ANSH PROFILE ===' as section;
SELECT id, full_name, email, role, user_id 
FROM profiles 
WHERE full_name ILIKE '%ansh%' OR email ILIKE '%ansh%';

-- 2. Check all courses and their assigned students
SELECT '=== ALL COURSES WITH ASSIGNMENTS ===' as section;
SELECT 
  id, 
  name, 
  course_code, 
  assigned_student_ids
FROM courses 
WHERE assigned_student_ids IS NOT NULL AND array_length(assigned_student_ids, 1) > 0;

-- 3. Test the exact query that StudentCourses.tsx uses
SELECT '=== ANSH ASSIGNED COURSES (StudentCourses Query) ===' as section;
SELECT 
  c.id,
  c.name,
  c.course_code,
  c.assigned_student_ids,
  p.id as student_id,
  p.full_name as student_name
FROM courses c
CROSS JOIN profiles p
WHERE p.full_name ILIKE '%ansh%'
AND c.assigned_student_ids @> ARRAY[p.id::text];

-- 4. Alternative query using unnest
SELECT '=== ANSH ASSIGNED COURSES (Unnest Query) ===' as section;
SELECT 
  c.id,
  c.name,
  c.course_code,
  p.id as student_id,
  p.full_name as student_name
FROM courses c
CROSS JOIN LATERAL unnest(c.assigned_student_ids) as assigned_id
JOIN profiles p ON p.id::text = assigned_id
WHERE p.full_name ILIKE '%ansh%';

-- 5. Check if there are any type mismatches
SELECT '=== TYPE CHECK ===' as section;
SELECT 
  c.id as course_id,
  c.name as course_name,
  c.assigned_student_ids,
  p.id as profile_id,
  p.id::text as profile_id_text,
  p.full_name
FROM courses c
CROSS JOIN profiles p
WHERE p.full_name ILIKE '%ansh%'
AND c.assigned_student_ids IS NOT NULL;

