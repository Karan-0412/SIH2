-- Check what student IDs exist in the profiles table
-- Run this to see available student IDs before running the migration

SELECT 'Available Students:' as info;
SELECT 
    id, 
    full_name, 
    email, 
    role,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC;

SELECT 'ANSH Profile Check:' as info;
SELECT 
    id, 
    full_name, 
    email, 
    role
FROM profiles 
WHERE full_name ILIKE '%ansh%' 
   OR email ILIKE '%ansh%';

-- If you want to use a specific student ID, replace the UUID below
SELECT 'Sample data will be inserted for this student:' as info;
SELECT 
    id as student_id,
    full_name,
    email
FROM profiles 
WHERE role = 'student' 
LIMIT 1;

