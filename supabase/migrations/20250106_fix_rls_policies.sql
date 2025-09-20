-- Fix RLS Policies for Student Data
-- This migration fixes the RLS policies to use the correct profile ID mapping

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can insert their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can update their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can delete their own portfolio items" ON public.student_portfolio;

DROP POLICY IF EXISTS "Students can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Students can insert their own certificates" ON public.certificates;

DROP POLICY IF EXISTS "Students can view their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.student_progress;

DROP POLICY IF EXISTS "Students can view their own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Students can insert their own achievements" ON public.student_achievements;

DROP POLICY IF EXISTS "Students can view their own activities" ON public.student_activities;
DROP POLICY IF EXISTS "Students can insert their own activities" ON public.student_activities;

DROP POLICY IF EXISTS "Students can view their own goals" ON public.student_goals;
DROP POLICY IF EXISTS "Students can manage their own goals" ON public.student_goals;

-- Create corrected policies for student_portfolio
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

-- Create corrected policies for certificates
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

-- Create corrected policies for student_progress
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

-- Create corrected policies for student_achievements
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

-- Create corrected policies for student_activities
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

-- Create corrected policies for student_goals
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
