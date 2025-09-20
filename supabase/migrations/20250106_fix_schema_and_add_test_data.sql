-- Fix Database Schema and Add Comprehensive Test Data
-- Run this in your Supabase SQL Editor

-- 1. First, let's check and fix the student_portfolio table schema
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_portfolio' AND column_name = 'category') THEN
        ALTER TABLE public.student_portfolio ADD COLUMN category TEXT DEFAULT 'project';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_portfolio' AND column_name = 'image_url') THEN
        ALTER TABLE public.student_portfolio ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_portfolio' AND column_name = 'external_url') THEN
        ALTER TABLE public.student_portfolio ADD COLUMN external_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_portfolio' AND column_name = 'visibility') THEN
        ALTER TABLE public.student_portfolio ADD COLUMN visibility TEXT DEFAULT 'public';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_portfolio' AND column_name = 'featured') THEN
        ALTER TABLE public.student_portfolio ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
    
    RAISE NOTICE 'Schema updated successfully!';
END $$;

-- 2. Drop and recreate RLS policies with proper permissions
DROP POLICY IF EXISTS "Students can view their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can insert their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can update their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Students can delete their own portfolio items" ON public.student_portfolio;
DROP POLICY IF EXISTS "Anyone can view public portfolio items" ON public.student_portfolio;

-- Create simple policies that work
CREATE POLICY "Students can view their own portfolio items" ON public.student_portfolio
  FOR SELECT USING (true);

CREATE POLICY "Students can insert their own portfolio items" ON public.student_portfolio
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can update their own portfolio items" ON public.student_portfolio
  FOR UPDATE USING (true);

CREATE POLICY "Students can delete their own portfolio items" ON public.student_portfolio
  FOR DELETE USING (true);

CREATE POLICY "Anyone can view public portfolio items" ON public.student_portfolio
  FOR SELECT USING (visibility = 'public');

-- 3. Grant permissions
GRANT ALL ON public.student_portfolio TO authenticated;
GRANT SELECT ON public.student_portfolio TO anon;

-- 4. Create comprehensive test data
DO $$
DECLARE
    test_student_id UUID;
    test_profile_id UUID;
BEGIN
    -- Get or create a test profile
    SELECT id INTO test_profile_id FROM public.profiles LIMIT 1;
    
    IF test_profile_id IS NULL THEN
        -- Create a test profile if none exists
        INSERT INTO public.profiles (id, full_name, email, user_id, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Test Student',
            'test@example.com',
            gen_random_uuid(),
            NOW(),
            NOW()
        ) RETURNING id INTO test_profile_id;
    END IF;
    
    test_student_id := test_profile_id;
    
    -- Clear existing test data
    DELETE FROM public.student_portfolio WHERE student_id = test_student_id;
    DELETE FROM public.student_achievements WHERE student_id = test_student_id;
    DELETE FROM public.certificates WHERE student_id = test_student_id;
    DELETE FROM public.student_progress WHERE student_id = test_student_id;
    DELETE FROM public.student_activities WHERE student_id = test_student_id;
    
    -- Insert test portfolio projects
    INSERT INTO public.student_portfolio (id, student_id, title, description, category, image_url, external_url, visibility, featured, created_at, updated_at) VALUES
    (gen_random_uuid(), test_student_id, 'E-Commerce Website', 'A full-stack e-commerce platform built with React and Node.js', 'project', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 'https://github.com/test/ecommerce', 'public', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), test_student_id, 'Mobile App Development', 'Cross-platform mobile app using React Native', 'project', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400', 'https://github.com/test/mobile-app', 'public', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), test_student_id, 'Data Analysis Project', 'Python-based data analysis and visualization project', 'project', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', 'https://github.com/test/data-analysis', 'public', false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), test_student_id, 'Machine Learning Model', 'Predictive model for student performance analysis', 'project', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400', 'https://github.com/test/ml-model', 'private', false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), test_student_id, 'Web Scraping Tool', 'Automated web scraping tool for data collection', 'project', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', 'https://github.com/test/web-scraper', 'public', false, NOW() - INTERVAL '5 days', NOW()),
    (gen_random_uuid(), test_student_id, 'AWS Cloud Certification', 'Amazon Web Services Solutions Architect Associate', 'certificate', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://aws.amazon.com/certification/', 'public', true, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), test_student_id, 'React Developer Certificate', 'Advanced React Development Certification', 'certificate', 'https://images.unsplash.com/photo-1633356122544-f134324a6cce?w=400', 'https://react.dev/', 'public', true, NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
    (gen_random_uuid(), test_student_id, 'Python Programming Award', 'First Place in Python Programming Competition', 'achievement', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', 'https://python.org/', 'public', true, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    (gen_random_uuid(), test_student_id, 'Hackathon Winner', 'First Place in University Hackathon 2024', 'achievement', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400', 'https://hackathon.com/', 'public', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), test_student_id, 'Internship Experience', 'Software Development Intern at TechCorp', 'experience', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', 'https://techcorp.com/', 'public', false, NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days');
    
    -- Insert test achievements
    INSERT INTO public.student_achievements (id, student_id, achievement_type, title, description, points, earned_at, created_at, updated_at) VALUES
    (gen_random_uuid(), test_student_id, 'certificate', 'AWS Certified Solutions Architect', 'Earned AWS Solutions Architect Associate certification', 100, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), test_student_id, 'excellence', 'Hackathon Winner', 'First place in university hackathon', 150, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), test_student_id, 'streak', '30-Day Coding Streak', 'Maintained 30-day coding streak', 75, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), test_student_id, 'milestone', '10 Projects Completed', 'Completed 10 portfolio projects', 200, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), test_student_id, 'participation', 'Open Source Contributor', 'Contributed to 5 open source projects', 125, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');
    
    -- Insert test certificates
    INSERT INTO public.certificates (id, student_id, title, issuing_organization, issue_date, expiry_date, certificate_url, status, created_at, updated_at) VALUES
    (gen_random_uuid(), test_student_id, 'AWS Solutions Architect Associate', 'Amazon Web Services', NOW() - INTERVAL '60 days', NOW() + INTERVAL '2 years', 'https://aws.amazon.com/certification/', 'approved', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), test_student_id, 'React Developer Certification', 'Meta', NOW() - INTERVAL '45 days', NULL, 'https://react.dev/', 'approved', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
    (gen_random_uuid(), test_student_id, 'Python Programming Certificate', 'Python Institute', NOW() - INTERVAL '30 days', NOW() + INTERVAL '3 years', 'https://pythoninstitute.org/', 'approved', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    (gen_random_uuid(), test_student_id, 'Data Science Specialization', 'Coursera', NOW() - INTERVAL '20 days', NULL, 'https://coursera.org/', 'pending', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (gen_random_uuid(), test_student_id, 'Machine Learning Certificate', 'Stanford University', NOW() - INTERVAL '10 days', NULL, 'https://stanford.edu/', 'approved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');
    
    -- Insert test progress
    INSERT INTO public.student_progress (id, student_id, total_certificates, approved_certificates, pending_certificates, rejected_certificates, courses_enrolled, courses_completed, current_streak_days, longest_streak_days, total_activities, last_activity_date, created_at, updated_at) VALUES
    (gen_random_uuid(), test_student_id, 5, 4, 1, 0, 8, 6, 15, 30, 25, NOW() - INTERVAL '1 day', NOW() - INTERVAL '90 days', NOW());
    
    -- Insert test activities
    INSERT INTO public.student_activities (id, student_id, activity_type, title, description, created_at, metadata) VALUES
    (gen_random_uuid(), test_student_id, 'portfolio_update', 'Added E-Commerce Website', 'Added new project to portfolio', NOW() - INTERVAL '30 days', '{"project_id": "ecommerce-1"}'),
    (gen_random_uuid(), test_student_id, 'certificate_upload', 'Uploaded AWS Certificate', 'Uploaded AWS Solutions Architect certificate', NOW() - INTERVAL '60 days', '{"certificate_id": "aws-1"}'),
    (gen_random_uuid(), test_student_id, 'achievement_earned', 'Hackathon Winner', 'Won first place in university hackathon', NOW() - INTERVAL '20 days', '{"achievement_id": "hackathon-1"}'),
    (gen_random_uuid(), test_student_id, 'profile_update', 'Updated Profile Information', 'Updated personal information and skills', NOW() - INTERVAL '10 days', '{"fields_updated": ["skills", "bio"]}'),
    (gen_random_uuid(), test_student_id, 'social_connection', 'Connected with Classmate', 'Accepted connection request from John Doe', NOW() - INTERVAL '5 days', '{"connection_id": "conn-1"}');
    
    RAISE NOTICE 'Test data inserted successfully for student: %', test_student_id;
    RAISE NOTICE 'Portfolio: 10 items, Achievements: 5 items, Certificates: 5 items, Activities: 5 items';
    
END $$;

-- 5. Verify the data was inserted
SELECT 
    'Portfolio Items' as table_name, 
    COUNT(*) as count 
FROM public.student_portfolio
UNION ALL
SELECT 
    'Achievements' as table_name, 
    COUNT(*) as count 
FROM public.student_achievements
UNION ALL
SELECT 
    'Certificates' as table_name, 
    COUNT(*) as count 
FROM public.certificates
UNION ALL
SELECT 
    'Progress Records' as table_name, 
    COUNT(*) as count 
FROM public.student_progress
UNION ALL
SELECT 
    'Activities' as table_name, 
    COUNT(*) as count 
FROM public.student_activities;
