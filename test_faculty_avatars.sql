-- Test Faculty Avatar URLs
-- This script checks if faculty avatars are properly set up

-- Check faculty profiles and their avatar URLs
SELECT '=== FACULTY AVATAR STATUS ===' as section;

SELECT 
    full_name,
    role,
    avatar_url,
    CASE 
        WHEN avatar_url IS NULL THEN '❌ No Avatar'
        WHEN avatar_url = '' THEN '❌ Empty Avatar'
        WHEN avatar_url LIKE 'https://api.dicebear.com%' THEN '✅ Generated Avatar'
        ELSE '📷 Custom Avatar'
    END as avatar_status
FROM profiles 
WHERE role = 'faculty'
ORDER BY full_name;

-- Check if any faculty still have null avatars
SELECT '=== FACULTY WITHOUT AVATARS ===' as section;

SELECT 
    COUNT(*) as faculty_without_avatars
FROM profiles 
WHERE role = 'faculty' 
AND (avatar_url IS NULL OR avatar_url = '');

-- Show sample generated avatar URLs
SELECT '=== SAMPLE GENERATED AVATARS ===' as section;

SELECT 
    full_name,
    avatar_url
FROM profiles 
WHERE role = 'faculty' 
AND avatar_url LIKE 'https://api.dicebear.com%'
LIMIT 3;

-- Test the avatar generation function
SELECT '=== TEST AVATAR GENERATION ===' as section;

SELECT 
    'Test function:' as info,
    generate_avatar_url('Dr. Test Faculty', 'faculty') as generated_url;
