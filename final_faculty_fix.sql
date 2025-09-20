-- Final comprehensive fix for faculty records with proper foreign key handling

-- Step 1: Check current state
SELECT '=== CHECKING CURRENT STATE ===' as info;

-- Check the conflicting faculty record
SELECT 
    'Conflicting faculty record' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE email = 'g40479087@gmail.com';

-- Check the target faculty record
SELECT 
    'Target faculty record' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Check student mentor assignments that reference the conflicting record
SELECT 
    'Student mentor assignments' as info,
    id,
    student_id,
    mentor_id,
    created_at
FROM student_mentor_assignments 
WHERE mentor_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Step 2: Handle foreign key constraints properly
SELECT '=== HANDLING FOREIGN KEY CONSTRAINTS ===' as info;

-- Update student_mentor_assignments to reference the correct faculty ID
UPDATE student_mentor_assignments 
SET mentor_id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
WHERE mentor_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Update any other tables that might reference the conflicting faculty ID
-- Check if there are any courses that reference the conflicting ID
UPDATE courses 
SET faculty_id = '0a130696-16c9-4c96-b3c2-7f0eb4175679'
WHERE faculty_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Update any other references (check for other tables that might reference faculty)
-- This is a general approach - update any foreign key references
DO $$
DECLARE
    constraint_record RECORD;
    update_sql TEXT;
BEGIN
    -- Find all foreign key constraints that reference the faculty table
    FOR constraint_record IN
        SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.column_name as foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'faculty'
            AND ccu.column_name = 'id'
    LOOP
        -- Update the foreign key references
        update_sql := format('UPDATE %I SET %I = %L WHERE %I = %L',
            constraint_record.table_name,
            constraint_record.column_name,
            '0a130696-16c9-4c96-b3c2-7f0eb4175679',
            constraint_record.column_name,
            '432df2fc-fc76-475d-8d7e-32ed880b48e9'
        );
        
        EXECUTE update_sql;
        RAISE NOTICE 'Updated % in table %', constraint_record.column_name, constraint_record.table_name;
    END LOOP;
END $$;

-- Step 3: Now safely delete the conflicting faculty record
DELETE FROM faculty 
WHERE email = 'g40479087@gmail.com' 
AND id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

-- Step 4: Ensure the target faculty record exists
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
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id,
    updated_at = now();

-- Step 5: Verify the fix
SELECT 
    'Faculty record after fix' as info,
    id,
    name,
    email,
    user_id,
    created_at
FROM faculty 
WHERE id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Check that student mentor assignments now reference the correct faculty
SELECT 
    'Updated student mentor assignments' as info,
    id,
    student_id,
    mentor_id,
    created_at
FROM student_mentor_assignments 
WHERE mentor_id = '0a130696-16c9-4c96-b3c2-7f0eb4175679';

-- Step 6: Test course insertion
DO $$
DECLARE
    test_course_id UUID;
BEGIN
    -- Try to insert a test course with the specific faculty ID
    INSERT INTO courses (
        name, 
        course_code, 
        faculty_id, 
        tags, 
        description, 
        deadline, 
        credit_hours
    ) VALUES (
        'Test Course Final Fix', 
        'TEST_FINAL_001', 
        '0a130696-16c9-4c96-b3c2-7f0eb4175679', 
        ARRAY['Mandatory'], 
        'Test course after final fix', 
        CURRENT_DATE + INTERVAL '30 days', 
        3
    ) RETURNING id INTO test_course_id;
    
    RAISE NOTICE 'Test course inserted successfully with ID: %', test_course_id;
    
    -- Clean up the test course
    DELETE FROM courses WHERE id = test_course_id;
    RAISE NOTICE 'Test course cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting test course: %', SQLERRM;
END $$;

-- Step 7: Final verification
SELECT 
    'Final faculty records count' as info,
    COUNT(*) as count
FROM faculty;

SELECT 
    'Faculty records with correct IDs' as info,
    COUNT(*) as count
FROM faculty f
JOIN profiles p ON f.id = p.id
WHERE p.role = 'faculty';

-- Check for any remaining references to the old faculty ID
SELECT 
    'Remaining references to old faculty ID' as info,
    'student_mentor_assignments' as table_name,
    COUNT(*) as count
FROM student_mentor_assignments 
WHERE mentor_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9'
UNION ALL
SELECT 
    'courses' as table_name,
    COUNT(*) as count
FROM courses 
WHERE faculty_id = '432df2fc-fc76-475d-8d7e-32ed880b48e9';

SELECT '=== FINAL FACULTY FIX COMPLETED ===' as status;

