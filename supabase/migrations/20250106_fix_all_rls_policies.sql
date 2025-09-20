-- Comprehensive RLS Policy Fix
-- This migration fixes all RLS policies to work with the profile system

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Students can view their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can insert their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can update their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can delete their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Anyone can view public portfolio items" ON public.student_portfolio;

DROP POLICY IF EXISTS "Students can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Students can insert their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Students can update their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Students can delete their own certificates" ON public.certificates;

DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can insert their own progress" ON public.student_progress;

DROP POLICY IF EXISTS "Students can view their own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Students can insert their own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Students can update their own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Students can delete their own achievements" ON public.student_achievements;

DROP POLICY IF EXISTS "Students can view their own activities" ON public.student_activities;
DROP POLICY IF EXISTS "Students can insert their own activities" ON public.student_activities;

DROP POLICY IF EXISTS "Students can view their own goals" ON public.student_goals;
DROP POLICY IF EXISTS "Students can manage their own goals" ON public.student_goals;

-- 2. Create corrected RLS policies

-- Student Portfolio Policies
CREATE POLICY "Students can view their own portfolio items" ON public.student_portfolio
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own portfolio items" ON public.student_portfolio
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own portfolio items" ON public.student_portfolio
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete their own portfolio items" ON public.student_portfolio
  FOR DELETE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow public viewing of public portfolio items
CREATE POLICY "Anyone can view public portfolio items" ON public.student_portfolio
  FOR SELECT USING (visibility = 'public');

-- Student Progress Policies
CREATE POLICY "Students can view their own progress" ON public.student_progress
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own progress" ON public.student_progress
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own progress" ON public.student_progress
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Student Achievements Policies
CREATE POLICY "Students can view their own achievements" ON public.student_achievements
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own achievements" ON public.student_achievements
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own achievements" ON public.student_achievements
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete their own achievements" ON public.student_achievements
  FOR DELETE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Student Activities Policies
CREATE POLICY "Students can view their own activities" ON public.student_activities
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own activities" ON public.student_activities
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Student Goals Policies
CREATE POLICY "Students can view their own goals" ON public.student_goals
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can manage their own goals" ON public.student_goals
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Certificates Policies
CREATE POLICY "Students can view their own certificates" ON public.certificates
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own certificates" ON public.certificates
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own certificates" ON public.certificates
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete their own certificates" ON public.certificates
  FOR DELETE USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- 3. Grant necessary permissions
GRANT ALL ON public.student_portfolio TO authenticated;
GRANT ALL ON public.student_progress TO authenticated;
GRANT ALL ON public.student_achievements TO authenticated;
GRANT ALL ON public.student_activities TO authenticated;
GRANT ALL ON public.student_goals TO authenticated;
GRANT ALL ON public.certificates TO authenticated;

-- Grant read permissions to anonymous users for public data
GRANT SELECT ON public.student_portfolio TO anon;
GRANT SELECT ON public.profiles TO anon;
