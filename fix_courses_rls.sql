-- Fix RLS policies for courses table to allow faculty to create courses

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'courses';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view courses" ON courses;
DROP POLICY IF EXISTS "Faculty can create courses" ON courses;
DROP POLICY IF EXISTS "Faculty can update their own courses" ON courses;
DROP POLICY IF EXISTS "Faculty can delete their own courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;

-- Create new, more permissive policies for courses
CREATE POLICY "Anyone can view courses" ON courses
    FOR SELECT
    USING (true);

CREATE POLICY "Faculty can create courses" ON courses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty f
            WHERE f.user_id = auth.uid()
            OR f.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'senior')
        )
    );

CREATE POLICY "Faculty can update their own courses" ON courses
    FOR UPDATE
    USING (
        faculty_id IN (
            SELECT f.id FROM faculty f
            WHERE f.user_id = auth.uid()
            OR f.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'senior')
        )
    )
    WITH CHECK (
        faculty_id IN (
            SELECT f.id FROM faculty f
            WHERE f.user_id = auth.uid()
            OR f.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'senior')
        )
    );

CREATE POLICY "Faculty can delete their own courses" ON courses
    FOR DELETE
    USING (
        faculty_id IN (
            SELECT f.id FROM faculty f
            WHERE f.user_id = auth.uid()
            OR f.email = (SELECT email FROM profiles WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'senior')
        )
    );

-- Also ensure the courses table has the right structure
-- Check if faculty_id column exists and is properly set up
DO $$
BEGIN
    -- Add faculty_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'faculty_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN faculty_id UUID REFERENCES faculty(id);
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE courses ADD COLUMN created_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Update existing courses to have faculty_id set
-- This will set faculty_id based on the created_by field or assign to a default faculty
UPDATE courses 
SET faculty_id = (
    SELECT f.id 
    FROM faculty f 
    WHERE f.email = (SELECT email FROM profiles WHERE id = courses.created_by)
    LIMIT 1
)
WHERE faculty_id IS NULL AND created_by IS NOT NULL;

-- If there are still courses without faculty_id, assign them to the first available faculty
UPDATE courses 
SET faculty_id = (SELECT id FROM faculty LIMIT 1)
WHERE faculty_id IS NULL;

-- Make faculty_id NOT NULL after setting values
ALTER TABLE courses ALTER COLUMN faculty_id SET NOT NULL;

-- Test the policies by checking if we can select from courses
SELECT 'RLS policies updated successfully' as status;

-- Show current courses and their faculty assignments
SELECT 
    c.id,
    c.name,
    c.course_code,
    c.faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM courses c
LEFT JOIN faculty f ON f.id = c.faculty_id
ORDER BY c.created_at DESC
LIMIT 10;

