-- Diagnose courses table issues

-- Step 1: Check courses table structure
SELECT 
    'Courses Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Step 2: Check if faculty_id column exists and its constraints
SELECT 
    'Foreign Key Constraints' as info,
    tc.constraint_name,
    tc.table_name,
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

-- Step 3: Check current courses data
SELECT 
    'Current Courses' as info,
    id,
    name,
    course_code,
    faculty_id,
    created_at
FROM courses 
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check faculty table
SELECT 
    'Faculty Records' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
ORDER BY created_at DESC
LIMIT 5;

-- Step 5: Check profiles table for faculty
SELECT 
    'Faculty Profiles' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    user_id
FROM profiles 
WHERE role = 'faculty'
ORDER BY created_at DESC
LIMIT 5;

-- Step 6: Check RLS policies
SELECT 
    'RLS Policies' as info,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'courses';

-- Step 7: Check if RLS is enabled
SELECT 
    'RLS Status' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'courses';

