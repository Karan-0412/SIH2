-- Comprehensive fix for enum usage issues

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as info;

SELECT 
    'user_role enum values' as enum_type,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

SELECT 
    'faculty_level enum values' as enum_type,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'faculty_level'
ORDER BY e.enumsortorder;

-- Step 2: Check for any profiles with invalid data
SELECT '=== INVALID DATA CHECK ===' as info;

SELECT 
    'Profiles with invalid role values' as issue,
    id,
    full_name,
    email,
    role,
    faculty_level,
    created_at
FROM profiles 
WHERE role::text NOT IN ('student', 'faculty', 'admin')
ORDER BY created_at DESC;

SELECT 
    'Profiles with invalid faculty_level values' as issue,
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

-- Step 3: Fix any data issues
SELECT '=== FIXING DATA ISSUES ===' as info;

-- Fix profiles that have 'senior' in the role field (should be in faculty_level)
UPDATE profiles 
SET 
    role = 'faculty'::user_role,
    faculty_level = 'senior'::faculty_level
WHERE role::text = 'senior';

-- Fix profiles that have 'admin' in the role field but should be faculty with admin level
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

-- Step 4: Verify the fix
SELECT '=== AFTER FIX ===' as info;

SELECT 
    'user_role enum values' as enum_type,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

SELECT 
    'faculty_level enum values' as enum_type,
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

-- Step 5: Test data integrity
SELECT '=== DATA INTEGRITY TEST ===' as info;

-- Check that all profiles have valid role values
SELECT 
    'Profiles with valid roles' as status,
    COUNT(*) as count
FROM profiles 
WHERE role::text IN ('student', 'faculty', 'admin');

-- Check that all faculty have valid faculty_level values
SELECT 
    'Faculty with valid faculty_level' as status,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty'::user_role 
AND faculty_level::text IN ('basic', 'senior', 'admin');

-- Check that no profiles have invalid role values
SELECT 
    'Profiles with invalid roles' as status,
    COUNT(*) as count
FROM profiles 
WHERE role::text NOT IN ('student', 'faculty', 'admin');

-- Check that no faculty have invalid faculty_level values
SELECT 
    'Faculty with invalid faculty_level' as status,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty'::user_role 
AND faculty_level::text NOT IN ('basic', 'senior', 'admin')
AND faculty_level IS NOT NULL;

SELECT '=== FIX COMPLETED ===' as info;

