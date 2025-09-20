-- Complete Schema Update to Match Code Expectations
-- This migration ensures all tables match what the code expects

-- 1. Create/Update Enums
CREATE TYPE public.user_role AS ENUM ('student', 'faculty');
CREATE TYPE public.faculty_level AS ENUM ('basic', 'senior', 'admin');
CREATE TYPE public.certificate_category AS ENUM ('academic', 'co_curricular');
CREATE TYPE public.certificate_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.achievement_type AS ENUM ('certificate', 'course_completion', 'streak', 'milestone', 'participation', 'excellence');
CREATE TYPE public.activity_type AS ENUM ('certificate_upload', 'course_enroll', 'course_complete', 'profile_update', 'achievement_earned', 'goal_set', 'goal_achieved', 'social_connection', 'portfolio_update');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE public.goal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE public.portfolio_visibility AS ENUM ('public', 'private', 'connections_only');
CREATE TYPE public.learning_path_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');

-- 2. Update Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  faculty_level public.faculty_level,
  student_id TEXT,
  faculty_id TEXT,
  assigned_faculty_id UUID REFERENCES public.profiles(id),
  department TEXT,
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  location TEXT,
  graduation_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Update Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.certificate_category NOT NULL,
  subcategory TEXT,
  issuing_company TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status public.certificate_status NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  remark TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Student Progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_certificates INTEGER DEFAULT 0,
  approved_certificates INTEGER DEFAULT 0,
  pending_certificates INTEGER DEFAULT 0,
  rejected_certificates INTEGER DEFAULT 0,
  courses_enrolled INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- 5. Create Student Achievements table
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type public.achievement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create Student Activities table
CREATE TABLE IF NOT EXISTS public.student_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create Student Goals table
CREATE TABLE IF NOT EXISTS public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  status public.goal_status NOT NULL DEFAULT 'active',
  priority public.goal_priority NOT NULL DEFAULT 'medium',
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 8. Create Student Connections table
CREATE TABLE IF NOT EXISTS public.student_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

-- 9. Create Student Portfolio table (FIXED SCHEMA)
CREATE TABLE IF NOT EXISTS public.student_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'project', 'certificate', 'achievement', 'experience', 'creative', 'academic'
  image_url TEXT,
  external_url TEXT,
  visibility public.portfolio_visibility NOT NULL DEFAULT 'public',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Create Learning Recommendations table
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_duration INTEGER,
  external_url TEXT,
  priority INTEGER DEFAULT 1,
  status public.learning_path_status NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 11. Create Student Milestones table
CREATE TABLE IF NOT EXISTS public.student_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER DEFAULT 0,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_student_id ON public.student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_student_id ON public.student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_student_connections_requester ON public.student_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_student_connections_receiver ON public.student_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_student_id ON public.student_portfolio(student_id);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_category ON public.student_portfolio(category);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_visibility ON public.student_portfolio(visibility);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_student_id ON public.learning_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_milestones_student_id ON public.student_milestones(student_id);

-- 13. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS Policies for student_portfolio
CREATE POLICY "Students can view their own portfolio items" ON public.student_portfolio
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own portfolio items" ON public.student_portfolio
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own portfolio items" ON public.student_portfolio
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own portfolio items" ON public.student_portfolio
  FOR DELETE USING (auth.uid() = student_id);

-- Allow public viewing of public portfolio items
CREATE POLICY "Anyone can view public portfolio items" ON public.student_portfolio
  FOR SELECT USING (visibility = 'public');

-- 15. Create RLS Policies for other tables
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can view their own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own certificates" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own progress" ON public.student_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" ON public.student_progress
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can view their own achievements" ON public.student_achievements
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own achievements" ON public.student_achievements
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own activities" ON public.student_activities
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own activities" ON public.student_activities
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own goals" ON public.student_goals
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can manage their own goals" ON public.student_goals
  FOR ALL USING (auth.uid() = student_id);

-- 16. Grant Permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.certificates TO authenticated;
GRANT ALL ON public.student_progress TO authenticated;
GRANT ALL ON public.student_achievements TO authenticated;
GRANT ALL ON public.student_activities TO authenticated;
GRANT ALL ON public.student_goals TO authenticated;
GRANT ALL ON public.student_connections TO authenticated;
GRANT ALL ON public.student_portfolio TO authenticated;
GRANT ALL ON public.learning_recommendations TO authenticated;
GRANT ALL ON public.student_milestones TO authenticated;

-- Grant read permissions to anonymous users for public data
GRANT SELECT ON public.student_portfolio TO anon;
GRANT SELECT ON public.profiles TO anon;
