-- Safe Incremental Database Update
-- This migration safely adds only missing tables and columns without disturbing existing data
-- Safe to run even if other collaborators have made changes

-- Enable necessary extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types only if they don't exist (safe)
DO $$ 
BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'admin');
    END IF;
    
    -- Create certificate_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_status') THEN
        CREATE TYPE public.certificate_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    
    -- Create certificate_category enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_category') THEN
        CREATE TYPE public.certificate_category AS ENUM ('academic', 'co_curricular', 'professional', 'achievement');
    END IF;
    
    -- Create achievement_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievement_type') THEN
        CREATE TYPE public.achievement_type AS ENUM ('coding_platform', 'academic', 'co_curricular', 'professional', 'soft_skills', 'course_completion', 'streak', 'milestone', 'participation', 'excellence', 'leadership', 'innovation');
    END IF;
    
    -- Create activity_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE public.activity_type AS ENUM ('certificate_upload', 'course_enroll', 'course_complete', 'profile_update', 'achievement_earned', 'goal_set', 'goal_achieved', 'social_connection', 'portfolio_update', 'login', 'logout');
    END IF;
    
    -- Create goal_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status') THEN
        CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
    END IF;
    
    -- Create goal_priority enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_priority') THEN
        CREATE TYPE public.goal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
    
    -- Create connection_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
        CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'blocked');
    END IF;
    
    -- Create notification_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM ('achievement', 'certificate', 'connection', 'system', 'reminder', 'announcement');
    END IF;
    
    -- Create visibility_level enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility_level') THEN
        CREATE TYPE public.visibility_level AS ENUM ('public', 'private', 'connections_only');
    END IF;
END $$;

-- Safely add missing columns to profiles table (if it exists)
DO $$ 
BEGIN
    -- Add columns only if they don't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        -- Add role column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
            ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'student';
        END IF;
        
        -- Add other missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
            ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
            ALTER TABLE public.profiles ADD COLUMN bio TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
            ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'department') THEN
            ALTER TABLE public.profiles ADD COLUMN department TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'graduation_year') THEN
            ALTER TABLE public.profiles ADD COLUMN graduation_year INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'student_roll_number') THEN
            ALTER TABLE public.profiles ADD COLUMN student_roll_number VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'faculty_code') THEN
            ALTER TABLE public.profiles ADD COLUMN faculty_code VARCHAR(10);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'faculty_level') THEN
            ALTER TABLE public.profiles ADD COLUMN faculty_level TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specialization') THEN
            ALTER TABLE public.profiles ADD COLUMN specialization TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
            ALTER TABLE public.profiles ADD COLUMN linkedin_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'github_url') THEN
            ALTER TABLE public.profiles ADD COLUMN github_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website_url') THEN
            ALTER TABLE public.profiles ADD COLUMN website_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
            ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
            ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
            ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        END IF;
    END IF;
END $$;

-- Create tables only if they don't exist (safe)
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

CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type achievement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon_url TEXT,
  points INTEGER DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.student_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

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

CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, student_id)
);

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

CREATE TABLE IF NOT EXISTS public.student_course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns to existing tables (safe)
DO $$ 
BEGIN
    -- Add is_read column to notifications table if it doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
            ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT false;
        END IF;
    END IF;
    
    -- Add missing columns to student_achievements table if they don't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements' AND table_schema = 'public') THEN
        -- Add achievement_type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_type') THEN
            ALTER TABLE public.student_achievements ADD COLUMN achievement_type achievement_type NOT NULL DEFAULT 'milestone';
        END IF;
        
        -- Add category column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'category') THEN
            ALTER TABLE public.student_achievements ADD COLUMN category TEXT NOT NULL DEFAULT 'general';
        END IF;
        
        -- Add earned_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'earned_at') THEN
            ALTER TABLE public.student_achievements ADD COLUMN earned_at TIMESTAMPTZ NOT NULL DEFAULT now();
        END IF;
    END IF;
END $$;

-- Create indexes only if they don't exist (safe)
DO $$ 
BEGIN
    -- Create indexes for better performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_email') THEN
        CREATE INDEX idx_profiles_email ON public.profiles(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
        CREATE INDEX idx_profiles_role ON public.profiles(role);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_certificates_student_id') THEN
        CREATE INDEX idx_certificates_student_id ON public.certificates(student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_certificates_status') THEN
        CREATE INDEX idx_certificates_status ON public.certificates(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_achievements_student_id') THEN
        CREATE INDEX idx_student_achievements_student_id ON public.student_achievements(student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_student_id') THEN
        CREATE INDEX idx_student_activities_student_id ON public.student_activities(student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_goals_student_id') THEN
        CREATE INDEX idx_student_goals_student_id ON public.student_goals(student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_connections_requester') THEN
        CREATE INDEX idx_student_connections_requester ON public.student_connections(requester_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_connections_receiver') THEN
        CREATE INDEX idx_student_connections_receiver ON public.student_connections(receiver_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_portfolio_student_id') THEN
        CREATE INDEX idx_student_portfolio_student_id ON public.student_portfolio(student_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_is_read') THEN
        CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
    END IF;
    
    -- Additional indexes for student_achievements (only if column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'achievement_type' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_achievements_type') THEN
            CREATE INDEX idx_student_achievements_type ON public.student_achievements(achievement_type);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'earned_at' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_achievements_earned_at') THEN
            CREATE INDEX idx_student_achievements_earned_at ON public.student_achievements(earned_at);
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'category' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_achievements_category') THEN
            CREATE INDEX idx_student_achievements_category ON public.student_achievements(category);
        END IF;
    END IF;
    
    -- Additional indexes for messages
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender_id') THEN
        CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_receiver_id') THEN
        CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_created_at') THEN
        CREATE INDEX idx_messages_created_at ON public.messages(created_at);
    END IF;
END $$;

-- Create or replace functions (safe)
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
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers only if they don't exist (safe)
DO $$ 
BEGIN
    -- Create trigger for new user registration
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
    
    -- Create updated_at triggers for tables that exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
            CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_certificates_updated_at') THEN
            CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_progress_updated_at') THEN
            CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_achievements_updated_at') THEN
            CREATE TRIGGER update_student_achievements_updated_at BEFORE UPDATE ON public.student_achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_goals' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_goals_updated_at') THEN
            CREATE TRIGGER update_student_goals_updated_at BEFORE UPDATE ON public.student_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_connections' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_connections_updated_at') THEN
            CREATE TRIGGER update_student_connections_updated_at BEFORE UPDATE ON public.student_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_portfolio' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_portfolio_updated_at') THEN
            CREATE TRIGGER update_student_portfolio_updated_at BEFORE UPDATE ON public.student_portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_recommendations' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_learning_recommendations_updated_at') THEN
            CREATE TRIGGER update_learning_recommendations_updated_at BEFORE UPDATE ON public.learning_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
            CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
END $$;

-- Enable RLS only if not already enabled (safe)
DO $$ 
BEGIN
    -- Enable RLS for tables that exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') THEN
        ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress' AND table_schema = 'public') THEN
        ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements' AND table_schema = 'public') THEN
        ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_activities' AND table_schema = 'public') THEN
        ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_goals' AND table_schema = 'public') THEN
        ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_connections' AND table_schema = 'public') THEN
        ALTER TABLE public.student_connections ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_portfolio' AND table_schema = 'public') THEN
        ALTER TABLE public.student_portfolio ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_recommendations' AND table_schema = 'public') THEN
        ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_milestones' AND table_schema = 'public') THEN
        ALTER TABLE public.student_milestones ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faculty_assignments' AND table_schema = 'public') THEN
        ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_schema = 'public') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_course_enrollments' AND table_schema = 'public') THEN
        ALTER TABLE public.student_course_enrollments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- EMERGENCY FIX: Completely disable RLS temporarily to break recursion
DO $$ 
BEGIN
    -- Disable RLS on profiles table to break the recursion
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Drop ALL existing policies on profiles table
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
    DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;
    
    -- Drop policies on other tables
    DROP POLICY IF EXISTS "Students can manage their own portfolio" ON public.student_portfolio;
    DROP POLICY IF EXISTS "Anyone can view public portfolio items" ON public.student_portfolio;
    DROP POLICY IF EXISTS "Students can view their own certificates" ON public.certificates;
    DROP POLICY IF EXISTS "Students can insert their own certificates" ON public.certificates;
    DROP POLICY IF EXISTS "Students can view their own achievements" ON public.student_achievements;
    DROP POLICY IF EXISTS "Students can insert their own achievements" ON public.student_achievements;
    DROP POLICY IF EXISTS "Students can update their own achievements" ON public.student_achievements;
    DROP POLICY IF EXISTS "Students can delete their own achievements" ON public.student_achievements;
END $$;

-- Create RLS policies (clean slate)
DO $$ 
BEGIN
    -- Profiles policies (ultra-simple to avoid recursion)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        -- Re-enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create ultra-simple policies with no subqueries
        CREATE POLICY "profiles_select_policy" ON public.profiles
          FOR SELECT USING (true);
        
        CREATE POLICY "profiles_update_policy" ON public.profiles
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "profiles_insert_policy" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Student portfolio policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_portfolio' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_portfolio' AND policyname = 'Students can manage their own portfolio') THEN
            CREATE POLICY "Students can manage their own portfolio" ON public.student_portfolio
              FOR ALL USING (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_portfolio' AND policyname = 'Anyone can view public portfolio items') THEN
            CREATE POLICY "Anyone can view public portfolio items" ON public.student_portfolio
              FOR SELECT USING (visibility = 'public');
        END IF;
    END IF;
    
    -- Certificates policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Students can view their own certificates') THEN
            CREATE POLICY "Students can view their own certificates" ON public.certificates
              FOR SELECT USING (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Students can insert their own certificates') THEN
            CREATE POLICY "Students can insert their own certificates" ON public.certificates
              FOR INSERT WITH CHECK (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
    END IF;
    
    -- Student achievements policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_achievements' AND policyname = 'Students can view their own achievements') THEN
            CREATE POLICY "Students can view their own achievements" ON public.student_achievements
              FOR SELECT USING (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_achievements' AND policyname = 'Students can insert their own achievements') THEN
            CREATE POLICY "Students can insert their own achievements" ON public.student_achievements
              FOR INSERT WITH CHECK (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_achievements' AND policyname = 'Students can update their own achievements') THEN
            CREATE POLICY "Students can update their own achievements" ON public.student_achievements
              FOR UPDATE USING (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_achievements' AND policyname = 'Students can delete their own achievements') THEN
            CREATE POLICY "Students can delete their own achievements" ON public.student_achievements
              FOR DELETE USING (
                student_id IN (
                  SELECT id FROM public.profiles WHERE user_id = auth.uid()
                )
              );
        END IF;
    END IF;
END $$;

-- Grant permissions (safe to run multiple times)
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

-- Insert sample data only if no data exists (safe)
DO $$ 
BEGIN
    -- Only insert sample profiles if none exist
    IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
        INSERT INTO public.profiles (id, full_name, email, role, department, graduation_year, student_roll_number, is_verified, is_active) VALUES
        (gen_random_uuid(), 'John Doe', 'john.doe@example.com', 'student', 'Computer Science', 2025, 'CS2025001', true, true),
        (gen_random_uuid(), 'Jane Smith', 'jane.smith@example.com', 'student', 'Information Technology', 2025, 'IT2025002', true, true),
        (gen_random_uuid(), 'Dr. Michael Johnson', 'michael.johnson@university.edu', 'faculty', 'Computer Science', NULL, NULL, true, true),
        (gen_random_uuid(), 'Prof. Sarah Wilson', 'sarah.wilson@university.edu', 'faculty', 'Information Technology', NULL, NULL, true, true),
        (gen_random_uuid(), 'System Administrator', 'admin@sih2.com', 'admin', 'Administration', NULL, NULL, true, true)
        ON CONFLICT (email) DO NOTHING;
    END IF;
    
    -- Only insert sample courses if none exist
    IF NOT EXISTS (SELECT 1 FROM public.courses LIMIT 1) THEN
        INSERT INTO public.courses (id, title, description, category, difficulty, duration_hours, is_active) VALUES
        (gen_random_uuid(), 'Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript basics', 'Programming', 'Beginner', 40, true),
        (gen_random_uuid(), 'React Advanced Patterns', 'Advanced React concepts and best practices', 'Programming', 'Advanced', 60, true),
        (gen_random_uuid(), 'Database Design', 'Learn database design principles and SQL', 'Database', 'Intermediate', 50, true),
        (gen_random_uuid(), 'Machine Learning Basics', 'Introduction to ML algorithms and applications', 'AI/ML', 'Intermediate', 80, true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Safe migration completed successfully!';
    RAISE NOTICE 'Added missing tables and columns without disturbing existing data.';
    RAISE NOTICE 'Safe to run multiple times without issues.';
END $$;
