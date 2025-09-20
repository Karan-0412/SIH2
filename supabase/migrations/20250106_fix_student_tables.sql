-- Fix student tables migration
-- This removes any sample data that might have been inserted with invalid UUIDs

-- Delete any sample data with invalid student_id
DELETE FROM public.student_activities WHERE student_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM public.student_achievements WHERE student_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM public.student_goals WHERE student_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM public.student_milestones WHERE student_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM public.student_connections WHERE student_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM public.student_portfolio WHERE student_id = '00000000-0000-0000-0000-000000000000';

-- Also clean up any connections with invalid connection_id
DELETE FROM public.student_connections WHERE connection_id = '00000000-0000-0000-0000-000000000000';
