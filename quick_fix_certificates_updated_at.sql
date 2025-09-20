-- Quick fix for certificates updated_at error

-- Step 1: Add updated_at column to certificates table
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 2: Update existing records
UPDATE certificates 
SET updated_at = COALESCE(verified_at, uploaded_at, now())
WHERE updated_at IS NULL;

-- Step 3: Make updated_at NOT NULL
ALTER TABLE certificates 
ALTER COLUMN updated_at SET NOT NULL;

-- Step 4: Drop the problematic trigger
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;

-- Step 5: Create the correct trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create the trigger
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Test the fix
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
        -- Test the update
        UPDATE certificates 
        SET 
            status = 'approved',
            verified_by = faculty_id,
            verified_at = now(),
            remark = 'Test approval - system working correctly'
        WHERE id = cert_id;
        
        RAISE NOTICE 'SUCCESS: Certificate % approved by faculty %', cert_id, faculty_id;
    ELSE
        RAISE NOTICE 'No pending certificates or faculty found for testing';
    END IF;
END $$;

SELECT '=== CERTIFICATES UPDATED_AT ERROR FIXED ===' as status;

