-- Emergency fix for specific faculty ID issue

-- Step 1: Check current state
SELECT '=== EMERGENCY FIX FOR FACULTY ID ===' as info;

-- Check if the specific faculty ID exists in faculty table
SELECT 
    'Faculty table check' as info,
    CASE WHEN EXISTS (SELECT 1 FROM faculty WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679') 
         THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

-- Check if it exists in profiles table
SELECT 
    'Profiles table check' as info,
    id,
    full_name,
    email,
    role,
    faculty_level
FROM profiles 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 2: Create the missing faculty record
INSERT INTO faculty (
    id,
    name,
    email,
    department,
    designation,
    is_verified,
    user_id
)
SELECT 
    p.id,
    p.full_name,
    p.email,
    'General' as department,
    'Faculty' as designation,
    true as is_verified,
    p.user_id
FROM profiles p
WHERE p.id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
AND p.role = 'faculty'
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify the record was created
SELECT 
    'Faculty record created' as info,
    id,
    name,
    email,
    department,
    designation
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 4: Create ALL missing faculty records to prevent future issues
INSERT INTO faculty (
    id,
    name,
    email,
    department,
    designation,
    is_verified,
    user_id
)
SELECT 
    p.id,
    p.full_name,
    p.email,
    'General' as department,
    'Faculty' as designation,
    true as is_verified,
    p.user_id
FROM profiles p
WHERE p.role = 'faculty'
AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.id = p.id)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Show final count
SELECT 
    'Total faculty records' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty profiles without faculty records' as info,
    COUNT(*) as count
FROM profiles p
WHERE p.role = 'faculty'
AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.id = p.id);

SELECT '=== EMERGENCY FIX COMPLETED ===' as status;

