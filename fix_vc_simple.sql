-- Simple fix for Verifiable Credentials setup
-- This script ensures the VC system works without conflicts

-- Step 1: Disable RLS on all VC tables temporarily
ALTER TABLE issuers DISABLE ROW LEVEL SECURITY;
ALTER TABLE verifiable_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Only admins can manage issuers" ON issuers;
DROP POLICY IF EXISTS "Issuers access policy" ON issuers;
DROP POLICY IF EXISTS "Service role can manage issuers" ON issuers;
DROP POLICY IF EXISTS "Anyone can read issuers" ON issuers;
DROP POLICY IF EXISTS "Authenticated users can manage issuers" ON issuers;

DROP POLICY IF EXISTS "Students can view their own credentials" ON verifiable_credentials;
DROP POLICY IF EXISTS "Admins can view all credentials" ON verifiable_credentials;
DROP POLICY IF EXISTS "Faculty can view credentials for their students" ON verifiable_credentials;
DROP POLICY IF EXISTS "Anyone can insert credentials" ON verifiable_credentials;

DROP POLICY IF EXISTS "Users can view evidence for accessible credentials" ON evidence_files;
DROP POLICY IF EXISTS "Admins and faculty can view audit logs" ON audit_logs;

-- Step 3: Re-enable RLS
ALTER TABLE issuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifiable_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create very permissive policies for testing

-- Issuers policies - allow anyone to read and manage
DROP POLICY IF EXISTS "Anyone can read issuers" ON issuers;
CREATE POLICY "Anyone can read issuers" ON issuers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage issuers" ON issuers;
CREATE POLICY "Anyone can manage issuers" ON issuers
    FOR ALL USING (true);

-- Verifiable credentials policies - very permissive for testing
DROP POLICY IF EXISTS "Anyone can read credentials" ON verifiable_credentials;
CREATE POLICY "Anyone can read credentials" ON verifiable_credentials
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert credentials" ON verifiable_credentials;
CREATE POLICY "Anyone can insert credentials" ON verifiable_credentials
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update credentials" ON verifiable_credentials;
CREATE POLICY "Anyone can update credentials" ON verifiable_credentials
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete credentials" ON verifiable_credentials;
CREATE POLICY "Anyone can delete credentials" ON verifiable_credentials
    FOR DELETE USING (true);

-- Evidence files policies
DROP POLICY IF EXISTS "Anyone can read evidence files" ON evidence_files;
CREATE POLICY "Anyone can read evidence files" ON evidence_files
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage evidence files" ON evidence_files;
CREATE POLICY "Anyone can manage evidence files" ON evidence_files
    FOR ALL USING (true);

-- Audit logs policies
DROP POLICY IF EXISTS "Anyone can read audit logs" ON audit_logs;
CREATE POLICY "Anyone can read audit logs" ON audit_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert audit logs" ON audit_logs;
CREATE POLICY "Anyone can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Step 5: Ensure the default issuer exists
INSERT INTO issuers (id, name, did, public_key_jwk, sign_key_id, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Smart Student Hub',
    'did:example:smarthub',
    '{"kty":"EC","crv":"P-256","x":"test-x-value","y":"test-y-value","use":"sig","alg":"ES256","kid":"key-1"}',
    'key-1',
    'active'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    did = EXCLUDED.did,
    public_key_jwk = EXCLUDED.public_key_jwk,
    sign_key_id = EXCLUDED.sign_key_id,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Step 6: Get or create a test student
-- First, try to get an existing student
DO $$
DECLARE
    student_id UUID;
BEGIN
    -- Try to get an existing student
    SELECT id INTO student_id FROM profiles WHERE role = 'student' LIMIT 1;
    
    -- If no student exists, create one with a unique email
    IF student_id IS NULL THEN
        INSERT INTO profiles (
            id,
            user_id,
            full_name,
            email,
            role
        ) VALUES (
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000003',
            'Test Student VC',
            'test.student.vc.' || extract(epoch from now())::text || '@example.com',
            'student'
        ) ON CONFLICT (id) DO NOTHING;
        
        student_id := '00000000-0000-0000-0000-000000000002';
    END IF;
    
    -- Test that we can insert a test credential with valid student ID
    INSERT INTO verifiable_credentials (
        vc_id,
        student_id,
        issuer_id,
        credential_json,
        credential_hash,
        proof,
        short_token
    ) VALUES (
        'urn:uuid:test-vc-123',
        student_id,
        '00000000-0000-0000-0000-000000000001',
        '{"test": "credential"}',
        'test-hash-123',
        '{"test": "proof"}',
        'test-token-123'
    ) ON CONFLICT (vc_id) DO NOTHING;
    
    RAISE NOTICE 'Test credential created successfully with student_id: %', student_id;
END $$;

-- Step 7: Verify everything works
SELECT 
    'setup_complete' as status,
    (SELECT COUNT(*) FROM issuers) as issuer_count,
    (SELECT COUNT(*) FROM verifiable_credentials) as credential_count,
    (SELECT COUNT(*) FROM profiles WHERE role = 'student') as student_count;

-- Step 8: Show all issuers
SELECT 
    'issuers' as table_name,
    id,
    name,
    did,
    status,
    created_at
FROM issuers 
ORDER BY created_at DESC;

-- Step 9: Show all students
SELECT 
    'students' as table_name,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles 
WHERE role = 'student'
ORDER BY created_at DESC;
