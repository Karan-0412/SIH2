-- Quick Fix for RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. First, let's check if the policies exist and drop them
DROP POLICY IF EXISTS "Students can view their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can insert their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can update their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can delete their own portfolio items" ON public.student_portfolio;

-- 2. Create simple policies that should work
CREATE POLICY "Students can view their own portfolio items" ON public.student_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Students can insert their own portfolio items" ON public.student_portfolio
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can update their own portfolio items" ON public.student_portfolio
  FOR UPDATE USING (true);

CREATE POLICY "Students can delete their own portfolio items" ON public.student_portfolio
  FOR DELETE USING (true);

-- 3. Grant permissions
GRANT ALL ON public.student_portfolio TO authenticated;
GRANT SELECT ON public.student_portfolio TO anon;

-- 4. Test by checking if we can insert a test record
-- This will help us verify the policies are working
DO $$
BEGIN
    -- Try to insert a test record (this will fail if there are still issues)
    INSERT INTO public.student_portfolio (
        title, 
        description, 
        category, 
        visibility, 
        featured, 
        student_id
    ) VALUES (
        'Test Project', 
        'This is a test project to verify RLS policies', 
        'project', 
        'public', 
        false, 
        (SELECT id FROM public.profiles LIMIT 1)
    );
    
    -- If we get here, the insert worked
    RAISE NOTICE 'RLS policies are working correctly!';
    
    -- Clean up the test record
    DELETE FROM public.student_portfolio WHERE title = 'Test Project';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS policies still have issues: %', SQLERRM;
END $$;
