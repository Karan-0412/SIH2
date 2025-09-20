-- Check if there are any students in the database
-- Run this in your Supabase SQL Editor

-- Count total students
SELECT 
  COUNT(*) as total_students,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Students found - VC system ready' 
    ELSE 'No students found - need to create student profiles' 
  END as status
FROM profiles 
WHERE role = 'student';

-- Show existing students (if any)
SELECT 
  id,
  full_name,
  email,
  created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC
LIMIT 5;

