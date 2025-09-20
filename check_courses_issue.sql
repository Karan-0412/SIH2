-- Quick diagnostic for courses foreign key issue

-- Check if courses table exists
SELECT 
    'Courses table exists' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') 
         THEN 'YES' ELSE 'NO' END as result;

-- Check if faculty table exists
SELECT 
    'Faculty table exists' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faculty') 
         THEN 'YES' ELSE 'NO' END as result;

-- Check courses table structure
SELECT 
    'Courses columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Check faculty table structure
SELECT 
    'Faculty columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'faculty' 
ORDER BY ordinal_position;

-- Check foreign key constraints on courses
SELECT 
    'Foreign key constraints' as check_type,
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

-- Check if there are any faculty records
SELECT 
    'Faculty records count' as check_type,
    COUNT(*) as count
FROM faculty;

-- Check if there are any courses
SELECT 
    'Courses count' as check_type,
    COUNT(*) as count
FROM courses;

-- Show sample faculty records
SELECT 
    'Sample faculty records' as check_type,
    id,
    name,
    email,
    user_id
FROM faculty 
LIMIT 3;

