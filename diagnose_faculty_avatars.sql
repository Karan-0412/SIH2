-- Diagnose Faculty Avatar Issue
-- This script checks the current state of faculty avatars

-- Step 1: Check if database script was run
SELECT '=== DATABASE SCRIPT STATUS ===' as section;

-- Check if the function exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_avatar_url') 
        THEN '✅ Function exists' 
        ELSE '❌ Function missing - run fix_profile_pictures.sql'
    END as function_status;

-- Check if trigger exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_generate_avatar_trigger') 
        THEN '✅ Trigger exists' 
        ELSE '❌ Trigger missing - run fix_profile_pictures.sql'
    END as trigger_status;

-- Step 2: Check faculty avatar status
SELECT '=== FACULTY AVATAR STATUS ===' as section;

SELECT 
    'Total faculty count:' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty';

SELECT 
    'Faculty with avatar_url:' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty' 
AND avatar_url IS NOT NULL 
AND avatar_url != '';

SELECT 
    'Faculty without avatar_url:' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty' 
AND (avatar_url IS NULL OR avatar_url = '');

-- Step 3: Show faculty details
SELECT '=== FACULTY DETAILS ===' as section;

SELECT 
    full_name,
    role,
    avatar_url,
    CASE 
        WHEN avatar_url IS NULL THEN '❌ NULL'
        WHEN avatar_url = '' THEN '❌ EMPTY'
        WHEN avatar_url LIKE 'https://api.dicebear.com%' THEN '✅ GENERATED'
        ELSE '📷 CUSTOM'
    END as status
FROM profiles 
WHERE role = 'faculty'
ORDER BY full_name;

-- Step 4: Test avatar generation
SELECT '=== TEST AVATAR GENERATION ===' as section;

-- Test the function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_avatar_url') THEN
        RAISE NOTICE 'Testing avatar generation:';
        RAISE NOTICE 'Student: %', generate_avatar_url('John Doe', 'student');
        RAISE NOTICE 'Faculty: %', generate_avatar_url('Dr. Smith', 'faculty');
    ELSE
        RAISE NOTICE 'Function not found - run fix_profile_pictures.sql first';
    END IF;
END $$;

-- Step 5: Manual fix for faculty (if needed)
SELECT '=== MANUAL FIX OPTION ===' as section;

-- This will update faculty avatars if they're missing
UPDATE profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/personas/svg?seed=' || full_name
WHERE role = 'faculty' 
AND (avatar_url IS NULL OR avatar_url = '');

-- Show results
SELECT 
    'Updated faculty count:' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty' 
AND avatar_url LIKE 'https://api.dicebear.com%';

-- Step 6: Final verification
SELECT '=== FINAL VERIFICATION ===' as section;

SELECT 
    full_name,
    avatar_url
FROM profiles 
WHERE role = 'faculty'
LIMIT 3;
