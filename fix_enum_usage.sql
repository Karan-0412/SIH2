-- Fix enum usage issues

-- First, let's check the current state
SELECT 
    'Current user_role values' as info,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

SELECT 
    'Current faculty_level values' as info,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'faculty_level'
ORDER BY e.enumsortorder;

-- Check if there are any profiles with invalid role values
SELECT 
    'Profiles with invalid roles' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    created_at
FROM profiles 
WHERE role::text NOT IN ('student', 'faculty', 'admin')
ORDER BY created_at DESC;

-- Check if there are any profiles with invalid faculty_level values
SELECT 
    'Profiles with invalid faculty_level' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    created_at
FROM profiles 
WHERE faculty_level::text NOT IN ('basic', 'senior', 'admin')
AND faculty_level IS NOT NULL
ORDER BY created_at DESC;

-- Fix any profiles that have 'senior' in the role field (should be in faculty_level)
UPDATE profiles 
SET 
    role = 'faculty'::user_role,
    faculty_level = 'senior'::faculty_level
WHERE role::text = 'senior';

-- Fix any profiles that have 'admin' in the role field but should be faculty with admin level
UPDATE profiles 
SET 
    role = 'faculty'::user_role,
    faculty_level = 'admin'::faculty_level
WHERE role::text = 'admin' 
AND faculty_level IS NULL;

-- Ensure all faculty have a faculty_level
UPDATE profiles 
SET faculty_level = 'basic'::faculty_level
WHERE role = 'faculty'::user_role 
AND faculty_level IS NULL;

-- Show the final state
SELECT 
    'Final user_role values' as info,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

SELECT 
    'Final faculty_level values' as info,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'faculty_level'
ORDER BY e.enumsortorder;

-- Show sample profiles after fix
SELECT 
    'Sample profiles after fix' as info,
    id,
    full_name,
    email,
    role,
    faculty_level,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

