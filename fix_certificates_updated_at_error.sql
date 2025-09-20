-- Fix certificates table updated_at error

-- Step 1: Check current certificates table structure
SELECT '=== CURRENT CERTIFICATES TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add updated_at column if it doesn't exist
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 3: Update existing records to have updated_at
UPDATE certificates 
SET updated_at = COALESCE(verified_at, uploaded_at, now())
WHERE updated_at IS NULL;

-- Step 4: Make updated_at NOT NULL
ALTER TABLE certificates 
ALTER COLUMN updated_at SET NOT NULL;

-- Step 5: Check if the trigger exists and drop it if it does
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;

-- Step 6: Create the correct trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create the trigger
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Test the trigger by updating a certificate
DO $$
DECLARE
    cert_id UUID;
    faculty_id UUID;
BEGIN
    -- Get first pending certificate
    SELECT id INTO cert_id 
    FROM certificates 
    WHERE status = 'pending' 
    LIMIT 1;
    
    -- Get first faculty member
    SELECT id INTO faculty_id 
    FROM faculty 
    LIMIT 1;
    
    IF cert_id IS NOT NULL AND faculty_id IS NOT NULL THEN
        -- Test the update with the trigger
        UPDATE certificates 
        SET 
            status = 'approved',
            verified_by = faculty_id,
            verified_at = now(),
            remark = 'Test approval - system working correctly'
        WHERE id = cert_id;
        
        RAISE NOTICE 'Certificate % approved by faculty % - trigger worked!', cert_id, faculty_id;
    ELSE
        RAISE NOTICE 'No pending certificates or faculty found for testing';
    END IF;
END $$;

-- Step 9: Verify the update worked
SELECT 
    'Certificate update test result' as info,
    c.id,
    c.title,
    c.status,
    c.verified_at,
    c.updated_at,
    c.remark
FROM certificates c
WHERE c.status = 'approved'
ORDER BY c.updated_at DESC
LIMIT 1;

-- Step 10: Check table structure after fix
SELECT '=== UPDATED CERTIFICATES TABLE STRUCTURE ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'certificates' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== CERTIFICATES UPDATED_AT ERROR FIXED ===' as status;

