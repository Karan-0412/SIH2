-- Check if Verifiable Credentials tables exist
-- Run this in your Supabase SQL Editor to verify the tables are created

-- Check if issuers table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issuers') 
    THEN 'issuers table exists' 
    ELSE 'issuers table does NOT exist' 
  END as issuers_status;

-- Check if verifiable_credentials table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verifiable_credentials') 
    THEN 'verifiable_credentials table exists' 
    ELSE 'verifiable_credentials table does NOT exist' 
  END as verifiable_credentials_status;

-- Check if evidence_files table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evidence_files') 
    THEN 'evidence_files table exists' 
    ELSE 'evidence_files table does NOT exist' 
  END as evidence_files_status;

-- Check if audit_logs table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') 
    THEN 'audit_logs table exists' 
    ELSE 'audit_logs table does NOT exist' 
  END as audit_logs_status;

-- Check if RPC functions exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_active_issuer') 
    THEN 'RPC functions exist' 
    ELSE 'RPC functions do NOT exist' 
  END as rpc_functions_status;

-- Check if there are any students in the profiles table
SELECT 
  COUNT(*) as student_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Students found' 
    ELSE 'No students found - need to create student profiles' 
  END as student_status
FROM profiles 
WHERE role = 'student';

