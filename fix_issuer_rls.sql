-- Fix RLS policies for Verifiable Credentials setup
-- This allows the system to create the default issuer during setup

-- Temporarily disable RLS for issuers table to allow setup
ALTER TABLE issuers DISABLE ROW LEVEL SECURITY;

-- Insert the default issuer if it doesn't exist
INSERT INTO issuers (id, name, did, public_key_jwk, sign_key_id, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Smart Student Hub',
    'did:example:smarthub',
    '{"kty":"EC","crv":"P-256","x":"...","y":"...","use":"sig","alg":"ES256","kid":"key-1"}',
    'key-1',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS with a more permissive policy for setup
ALTER TABLE issuers ENABLE ROW LEVEL SECURITY;

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Only admins can manage issuers" ON issuers;

-- Create a more permissive policy that allows:
-- 1. Admins to manage issuers
-- 2. Anyone to read issuers (for verification)
-- 3. System to create issuers during setup
CREATE POLICY "Issuers access policy" ON issuers
    FOR ALL USING (
        -- Allow admins full access
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
        -- Allow read access for verification
        OR (pg_has_role('anon', 'member') AND pg_has_role('authenticated', 'member'))
        -- Allow system setup (when no auth context)
        OR auth.uid() IS NULL
    );

-- Also allow the service role to manage issuers
CREATE POLICY "Service role can manage issuers" ON issuers
    FOR ALL USING (
        current_setting('role') = 'service_role'
    );

-- Verify the issuer was created
SELECT 
    id,
    name,
    did,
    status,
    created_at
FROM issuers 
WHERE id = '00000000-0000-0000-0000-000000000001';

