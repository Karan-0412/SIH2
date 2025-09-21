-- Fix Profile Pictures Issue
-- This script addresses the profile picture display problem

-- Step 1: Check current avatar_url status
SELECT '=== CURRENT AVATAR STATUS ===' as section;

SELECT 
    'Profiles with avatar_url:' as info,
    COUNT(*) as count
FROM profiles 
WHERE avatar_url IS NOT NULL AND avatar_url != '';

SELECT 
    'Profiles without avatar_url:' as info,
    COUNT(*) as count
FROM profiles 
WHERE avatar_url IS NULL OR avatar_url = '';

-- Step 2: Add default avatar URLs for users without profile pictures
SELECT '=== ADDING DEFAULT AVATARS ===' as section;

-- Update profiles to have default avatar URLs
UPDATE profiles 
SET avatar_url = CASE 
    WHEN role = 'student' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || full_name
    WHEN role = 'faculty' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=' || full_name
    ELSE 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || full_name
END
WHERE avatar_url IS NULL OR avatar_url = '';

-- Step 3: Verify the update
SELECT '=== VERIFICATION ===' as section;

SELECT 
    'Updated profiles count:' as info,
    COUNT(*) as count
FROM profiles 
WHERE avatar_url IS NOT NULL AND avatar_url != '';

-- Show sample updated profiles
SELECT 
    'Sample updated profiles:' as info,
    full_name,
    role,
    avatar_url
FROM profiles 
WHERE avatar_url IS NOT NULL AND avatar_url != ''
LIMIT 5;

-- Step 4: Create a function to generate consistent avatars
CREATE OR REPLACE FUNCTION generate_avatar_url(user_name TEXT, user_role TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN user_role = 'student' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || user_name
        WHEN user_role = 'faculty' THEN 'https://api.dicebear.com/7.x/personas/svg?seed=' || user_name
        ELSE 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || user_name
    END;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create a trigger to auto-generate avatars for new users
CREATE OR REPLACE FUNCTION auto_generate_avatar()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.avatar_url IS NULL OR NEW.avatar_url = '' THEN
        NEW.avatar_url = generate_avatar_url(NEW.full_name, NEW.role::TEXT);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS auto_generate_avatar_trigger ON profiles;
CREATE TRIGGER auto_generate_avatar_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_avatar();

SELECT '=== SETUP COMPLETE ===' as section;
SELECT 'Profile pictures should now work correctly!' as message;
