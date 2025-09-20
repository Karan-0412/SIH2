-- Create a test student for Verifiable Credentials testing
-- Run this in your Supabase SQL Editor if no students exist

-- Insert a test student profile with generated UUIDs
INSERT INTO profiles (
  id,
  user_id,
  full_name,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  uuid_generate_v4(),
  'Test Student VC',
  'test.student.vc@example.com',
  'student',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the student was created
SELECT 
  id,
  full_name,
  email,
  role,
  created_at
FROM profiles 
WHERE full_name = 'Test Student VC'
ORDER BY created_at DESC
LIMIT 1;
