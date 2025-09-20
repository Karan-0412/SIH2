-- Ensure Default Issuer Exists
-- This script ensures the default issuer is created for the VC system

-- Temporarily disable RLS for issuers table to allow setup
ALTER TABLE issuers DISABLE ROW LEVEL SECURITY;

-- Insert the default issuer if it doesn't exist
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

-- Re-enable RLS
ALTER TABLE issuers ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for issuers
DROP POLICY IF EXISTS "Anyone can read issuers" ON issuers;
CREATE POLICY "Anyone can read issuers" ON issuers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage issuers" ON issuers;
CREATE POLICY "Authenticated users can manage issuers" ON issuers
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- Verify the issuer was created
SELECT 
    'Default issuer status' as info,
    id,
    name,
    did,
    status,
    created_at
FROM issuers 
WHERE id = '00000000-0000-0000-0000-000000000001';
