-- Create test data for course assignment system
-- This will create a student, course, and assign them together

-- 1. Create a test student
INSERT INTO profiles (id, user_id, full_name, email, role, created_at, updated_at)
VALUES (
  'bf79ba5d-54b9-4569-b833-8eec4cc8c5ac',
  'bf79ba5d-54b9-4569-b833-8eec4cc8c5ac',
  'Test Student',
  'test@student.com',
  'student',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create a test course
INSERT INTO courses (id, name, course_code, description, created_at, updated_at)
VALUES (
  '5a50e7b6-3502-4c65-a91f-4e061fc9760f',
  'Introduction to Programming',
  'CS101',
  'Basic programming concepts',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Assign the course to the student
UPDATE courses 
SET assigned_student_ids = ARRAY['bf79ba5d-54b9-4569-b833-8eec4cc8c5ac']
WHERE id = '5a50e7b6-3502-4c65-a91f-4e061fc9760f';

-- 4. Verify the data exists
SELECT '=== STUDENTS ===' as section;
SELECT id, full_name, email, role FROM profiles WHERE role = 'student';

SELECT '=== COURSES ===' as section;
SELECT id, name, course_code, assigned_student_ids FROM courses;

SELECT '=== ASSIGNED COURSES FOR STUDENT ===' as section;
SELECT 
  c.id,
  c.name,
  c.course_code
FROM courses c
WHERE c.assigned_student_ids @> ARRAY['bf79ba5d-54b9-4569-b833-8eec4cc8c5ac'];
