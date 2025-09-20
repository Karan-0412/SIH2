-- Check current enum values in the database

-- Check user_role enum
SELECT 
    'user_role' as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Check if faculty_level enum exists
SELECT 
    'faculty_level' as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'faculty_level'
ORDER BY e.enumsortorder;

-- Check the profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('role', 'faculty_level')
ORDER BY ordinal_position;

-- Check if there are any profiles with faculty_level
SELECT 
    id,
    full_name,
    email,
    role,
    faculty_level,
    created_at
FROM profiles 
WHERE faculty_level IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

