-- Debug faculty issue - check why faculty_id doesn't exist

-- Step 1: Check if the specific faculty_id exists
SELECT 
    'Checking specific faculty_id' as info,
    CASE WHEN EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') 
         THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

-- Step 2: Check all faculty records
SELECT 
    'All faculty records' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
ORDER BY created_at DESC;

-- Step 3: Check profiles with faculty role
SELECT 
    'Faculty profiles' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    user_id,
    created_at
FROM profiles 
WHERE role = 'faculty'
ORDER BY created_at DESC;

-- Step 4: Check if there's a mismatch between profiles and faculty
SELECT 
    'Profiles without faculty records' as info,
    p.id as profile_id,
    p.full_name,
    p.email,
    p.user_id
FROM profiles p
WHERE p.role = 'faculty'
AND NOT EXISTS (
    SELECT 1 FROM faculty f 
    WHERE f.email = p.email OR f.user_id = p.user_id
);

-- Step 5: Check courses table structure
SELECT 
    'Courses table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Step 6: Check foreign key constraints
SELECT 
    'Foreign key constraints' as info,
    tc.constraint_name,
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

