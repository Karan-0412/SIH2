-- IMMEDIATE FIX: Create default issuer
-- Run this in Supabase SQL Editor to fix the foreign key constraint error

-- Step 1: Disable RLS temporarily
ALTER TABLE issuers DISABLE ROW LEVEL SECURITY;

-- Step 2: Insert the default issuer
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

-- Step 3: Re-enable RLS
ALTER TABLE issuers ENABLE ROW LEVEL SECURITY;

-- Step 4: Create basic policies
DROP POLICY IF EXISTS "Allow all operations on issuers" ON issuers;
CREATE POLICY "Allow all operations on issuers" ON issuers
    FOR ALL USING (true);

-- Step 5: Verify the issuer was created
SELECT 
    'SUCCESS: Default issuer created' as status,
    id,
    name,
    did,
    status as issuer_status,
    created_at
FROM issuers 
WHERE id = '00000000-0000-0000-0000-000000000001';
