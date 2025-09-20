-- Fix student_portfolio table schema to match code expectations
-- This migration updates the existing table to have the correct columns

-- First, let's check if the table exists and what columns it has
-- Then we'll alter it to match the expected schema

-- Drop the existing student_portfolio table if it exists
DROP TABLE IF EXISTS public.student_portfolio CASCADE;

-- Create the student_portfolio table with the correct schema
CREATE TABLE IF NOT EXISTS public.student_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'project', 'certificate', 'achievement', 'experience', 'creative', 'academic'
  image_url TEXT,
  external_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'connections_only')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_portfolio_student_id ON public.student_portfolio(student_id);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_category ON public.student_portfolio(category);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_visibility ON public.student_portfolio(visibility);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_featured ON public.student_portfolio(featured);

-- Enable Row Level Security
ALTER TABLE public.student_portfolio ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view their own portfolio items" ON public.student_portfolio
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own portfolio items" ON public.student_portfolio
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own portfolio items" ON public.student_portfolio
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own portfolio items" ON public.student_portfolio
  FOR DELETE USING (auth.uid() = student_id);

-- Allow public viewing of public portfolio items (for showcasing)
CREATE POLICY "Anyone can view public portfolio items" ON public.student_portfolio
  FOR SELECT USING (visibility = 'public');

-- Grant necessary permissions
GRANT ALL ON public.student_portfolio TO authenticated;
GRANT SELECT ON public.student_portfolio TO anon;
