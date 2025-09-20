-- Proper fix for faculty system - no specific email targeting

-- Step 1: Check current state
SELECT '=== CHECKING CURRENT STATE ===' as info;

-- Check faculty table structure
SELECT 
    'Faculty table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'faculty' 
ORDER BY ordinal_position;

-- Check if faculty table exists
SELECT 
    'Faculty table exists' as info,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faculty') 
         THEN 'YES' ELSE 'NO' END as result;

-- Check faculty profiles
SELECT 
    'Faculty profiles count' as info,
    COUNT(*) as count
FROM profiles 
WHERE role = 'faculty';

-- Check existing faculty records
SELECT 
    'Existing faculty records' as info,
    COUNT(*) as count
FROM faculty;

-- Step 2: Create faculty table if it doesn't exist
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    designation TEXT,
    is_verified BOOLEAN DEFAULT false,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Clear existing faculty records to start fresh
DELETE FROM faculty;

-- Step 4: Create faculty records for ALL faculty profiles
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
    p.id,  -- Use profile ID as faculty ID
    p.full_name,
    p.email,
    COALESCE(p.department, 'General') as department,
    CASE 
        WHEN p.faculty_level = 'admin' THEN 'Administrator'
        WHEN p.faculty_level = 'senior' THEN 'Senior Faculty'
        ELSE 'Faculty'
    END as designation,
    true as is_verified,
    p.user_id
FROM profiles p
WHERE p.role = 'faculty';

-- Step 5: Verify the creation
SELECT 
    'Faculty records created' as info,
    COUNT(*) as count
FROM faculty;

-- Show sample faculty records
SELECT 
    'Sample faculty records' as info,
    id,
    name,
    email,
    department,
    designation
FROM faculty 
LIMIT 5;

-- Step 6: Test course insertion with any faculty ID
DO $$
DECLARE
    test_faculty_id UUID;
    test_course_id UUID;
BEGIN
    -- Get any faculty ID for testing
    SELECT id INTO test_faculty_id FROM faculty LIMIT 1;
    
    IF test_faculty_id IS NOT NULL THEN
        -- Try to insert a test course
        INSERT INTO courses (
            name, 
            course_code, 
            faculty_id, 
            tags, 
            description, 
            deadline, 
            credit_hours
        ) VALUES (
            'Test Course System Fix', 
            'TEST_SYSTEM_001', 
            test_faculty_id, 
            ARRAY['Mandatory'], 
            'Test course after system fix', 
            CURRENT_DATE + INTERVAL '30 days', 
            3
        ) RETURNING id INTO test_course_id;
        
        RAISE NOTICE 'Test course inserted successfully with faculty ID: %', test_faculty_id;
        
        -- Clean up the test course
        DELETE FROM courses WHERE id = test_course_id;
        RAISE NOTICE 'Test course cleaned up';
    ELSE
        RAISE NOTICE 'No faculty records found for testing';
    END IF;
END $$;

-- Step 7: Final verification
SELECT 
    'Final faculty records count' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty profiles with faculty records' as info,
    COUNT(*) as count
FROM profiles p
JOIN faculty f ON p.id = f.id
WHERE p.role = 'faculty';

SELECT '=== FACULTY SYSTEM FIXED PROPERLY ===' as status;

