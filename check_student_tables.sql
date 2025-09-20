-- Check if student tables exist and their structure
-- Run this in Supabase SQL Editor

-- 1. Check if student tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'student_%'
ORDER BY table_name;

-- 2. Check structure of student_progress table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check structure of student_activities table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_activities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check structure of student_goals table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_goals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check structure of student_connections table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_connections' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check structure of student_milestones table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_milestones' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Check if sample data was inserted
SELECT 'student_progress' as table_name, COUNT(*) as record_count FROM student_progress
UNION ALL
SELECT 'student_activities' as table_name, COUNT(*) as record_count FROM student_activities
UNION ALL
SELECT 'student_goals' as table_name, COUNT(*) as record_count FROM student_goals
UNION ALL
SELECT 'student_connections' as table_name, COUNT(*) as record_count FROM student_connections
UNION ALL
SELECT 'student_milestones' as table_name, COUNT(*) as record_count FROM student_milestones;

-- 8. Check foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
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
AND tc.table_name LIKE 'student_%'
ORDER BY tc.table_name, tc.constraint_name;

