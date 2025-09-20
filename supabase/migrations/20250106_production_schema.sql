-- Production-Ready Database Schema for Student Achievement Platform
-- This migration creates a complete, production-ready database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE public.certificate_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.certificate_category AS ENUM ('academic', 'co_curricular', 'professional', 'achievement');
CREATE TYPE public.achievement_type AS ENUM ('certificate', 'course_completion', 'streak', 'milestone', 'participation', 'excellence', 'leadership', 'innovation');
CREATE TYPE public.activity_type AS ENUM ('certificate_upload', 'course_enroll', 'course_complete', 'profile_update', 'achievement_earned', 'goal_set', 'goal_achieved', 'social_connection', 'portfolio_update', 'login', 'logout');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE public.goal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE public.notification_type AS ENUM ('achievement', 'certificate', 'connection', 'system', 'reminder', 'announcement');
CREATE TYPE public.visibility_level AS ENUM ('public', 'private', 'connections_only');

-- Create profiles table (main user table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  department TEXT,
  graduation_year INTEGER,
  student_roll_number VARCHAR(20) UNIQUE,
  faculty_code VARCHAR(10) UNIQUE,
  faculty_level TEXT,
  specialization TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category certificate_category NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  status certificate_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student progress table
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
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create student achievements table
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type achievement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student activities table
CREATE TABLE IF NOT EXISTS public.student_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student goals table
CREATE TABLE IF NOT EXISTS public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  status goal_status NOT NULL DEFAULT 'active',
  priority goal_priority NOT NULL DEFAULT 'medium',
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student connections table
CREATE TABLE IF NOT EXISTS public.student_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Create student portfolio table
CREATE TABLE IF NOT EXISTS public.student_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'project',
  image_url TEXT,
  external_url TEXT,
  visibility visibility_level NOT NULL DEFAULT 'public',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create learning recommendations table
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
  status TEXT NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student milestones table
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

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create faculty assignments table
CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, student_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration_hours INTEGER,
  instructor_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student course enrollments table
CREATE TABLE IF NOT EXISTS public.student_course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(student_id, course_id)
);

-- Create messages table for communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_student_id ON public.student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_goals_student_id ON public.student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.student_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.student_connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_student_id ON public.student_portfolio(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'faculty' THEN 'faculty'::user_role
      ELSE 'student'::user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_achievements_updated_at BEFORE UPDATE ON public.student_achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_goals_updated_at BEFORE UPDATE ON public.student_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_connections_updated_at BEFORE UPDATE ON public.student_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_portfolio_updated_at BEFORE UPDATE ON public.student_portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_recommendations_updated_at BEFORE UPDATE ON public.learning_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for certificates
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

CREATE POLICY "Faculty can view assigned student certificates" ON public.certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.faculty_assignments fa
      JOIN public.profiles p ON fa.faculty_id = p.id
      WHERE p.user_id = auth.uid() AND fa.student_id = student_id
    )
  );

CREATE POLICY "Faculty can update assigned student certificates" ON public.certificates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.faculty_assignments fa
      JOIN public.profiles p ON fa.faculty_id = p.id
      WHERE p.user_id = auth.uid() AND fa.student_id = student_id
    )
  );

-- Create RLS policies for student data tables
CREATE POLICY "Students can manage their own data" ON public.student_progress
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can manage their own achievements" ON public.student_achievements
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can manage their own activities" ON public.student_activities
  FOR ALL USING (
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

CREATE POLICY "Students can manage their own portfolio" ON public.student_portfolio
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Allow public viewing of public portfolio items
CREATE POLICY "Anyone can view public portfolio items" ON public.student_portfolio
  FOR SELECT USING (visibility = 'public');

-- Create RLS policies for connections
CREATE POLICY "Users can view their own connections" ON public.student_connections
  FOR SELECT USING (
    requester_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) OR receiver_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connection requests" ON public.student_connections
  FOR INSERT WITH CHECK (
    requester_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own connections" ON public.student_connections
  FOR UPDATE USING (
    requester_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) OR receiver_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Grant necessary permissions
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
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.faculty_assignments TO authenticated;
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.student_course_enrollments TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Grant read permissions to anonymous users for public data
GRANT SELECT ON public.student_portfolio TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Insert sample data for testing
INSERT INTO public.profiles (id, full_name, email, role, department, graduation_year, student_roll_number, is_verified, is_active) VALUES
(gen_random_uuid(), 'John Doe', 'john.doe@example.com', 'student', 'Computer Science', 2025, 'CS2025001', true, true),
(gen_random_uuid(), 'Jane Smith', 'jane.smith@example.com', 'student', 'Information Technology', 2025, 'IT2025002', true, true),
(gen_random_uuid(), 'Dr. Michael Johnson', 'michael.johnson@university.edu', 'faculty', 'Computer Science', NULL, NULL, true, true),
(gen_random_uuid(), 'Prof. Sarah Wilson', 'sarah.wilson@university.edu', 'faculty', 'Information Technology', NULL, NULL, true, true),
(gen_random_uuid(), 'System Administrator', 'admin@sih2.com', 'admin', 'Administration', NULL, NULL, true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (id, title, description, category, difficulty, duration_hours, is_active) VALUES
(gen_random_uuid(), 'Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript basics', 'Programming', 'Beginner', 40, true),
(gen_random_uuid(), 'React Advanced Patterns', 'Advanced React concepts and best practices', 'Programming', 'Advanced', 60, true),
(gen_random_uuid(), 'Database Design', 'Learn database design principles and SQL', 'Database', 'Intermediate', 50, true),
(gen_random_uuid(), 'Machine Learning Basics', 'Introduction to ML algorithms and applications', 'AI/ML', 'Intermediate', 80, true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.profiles IS 'User profiles with roles: student, faculty, admin';
COMMENT ON TABLE public.certificates IS 'Student certificates and achievements';
COMMENT ON TABLE public.student_progress IS 'Student progress tracking and statistics';
COMMENT ON TABLE public.student_achievements IS 'Student achievements and badges';
COMMENT ON TABLE public.student_activities IS 'Student activity log';
COMMENT ON TABLE public.student_goals IS 'Student personal and academic goals';
COMMENT ON TABLE public.student_connections IS 'Student social connections and networking';
COMMENT ON TABLE public.student_portfolio IS 'Student portfolio projects and work';
COMMENT ON TABLE public.notifications IS 'System notifications for users';
COMMENT ON TABLE public.faculty_assignments IS 'Faculty-student assignment relationships';
COMMENT ON TABLE public.courses IS 'Available courses and learning materials';
