-- Recruiter Portal Database Schema
-- Add this to your existing Supabase schema

-- Create recruiters table
CREATE TABLE IF NOT EXISTS public.recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id TEXT UNIQUE NOT NULL, -- The ID provided by admin
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) -- Admin who created this recruiter
);

-- Create recruiter access logs
CREATE TABLE IF NOT EXISTS public.recruiter_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- 'view_profile', 'download_cv', 'contact_student'
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create recruiter favorites
CREATE TABLE IF NOT EXISTS public.recruiter_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recruiter_id, student_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recruiters_recruiter_id ON public.recruiters(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_is_active ON public.recruiters(is_active);
CREATE INDEX IF NOT EXISTS idx_recruiter_access_logs_recruiter_id ON public.recruiter_access_logs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_access_logs_student_id ON public.recruiter_access_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_favorites_recruiter_id ON public.recruiter_favorites(recruiter_id);

-- Enable RLS
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruiters
CREATE POLICY "recruiters_select_by_id" ON public.recruiters
  FOR SELECT USING (recruiter_id = current_setting('app.recruiter_id', true));

-- RLS Policies for access logs
CREATE POLICY "recruiter_access_logs_insert_own" ON public.recruiter_access_logs
  FOR INSERT WITH CHECK (
    recruiter_id IN (
      SELECT id FROM public.recruiters 
      WHERE recruiter_id = current_setting('app.recruiter_id', true)
    )
  );

-- RLS Policies for favorites
CREATE POLICY "recruiter_favorites_select_own" ON public.recruiter_favorites
  FOR SELECT USING (
    recruiter_id IN (
      SELECT id FROM public.recruiters 
      WHERE recruiter_id = current_setting('app.recruiter_id', true)
    )
  );

CREATE POLICY "recruiter_favorites_insert_own" ON public.recruiter_favorites
  FOR INSERT WITH CHECK (
    recruiter_id IN (
      SELECT id FROM public.recruiters 
      WHERE recruiter_id = current_setting('app.recruiter_id', true)
    )
  );

-- Insert sample recruiter data for testing
INSERT INTO public.recruiters (recruiter_id, company_name, contact_person, email, phone, created_by)
VALUES 
  ('REC001', 'TechCorp Solutions', 'John Smith', 'john.smith@techcorp.com', '+91 98765 43210', (SELECT id FROM public.profiles WHERE role = 'faculty' LIMIT 1)),
  ('REC002', 'InnovateLabs', 'Sarah Johnson', 'sarah.johnson@innovatelabs.com', '+91 98765 43211', (SELECT id FROM public.profiles WHERE role = 'faculty' LIMIT 1)),
  ('REC003', 'StartupXYZ', 'Mike Chen', 'mike.chen@startupxyz.com', '+91 98765 43212', (SELECT id FROM public.profiles WHERE role = 'faculty' LIMIT 1))
ON CONFLICT (recruiter_id) DO NOTHING;
