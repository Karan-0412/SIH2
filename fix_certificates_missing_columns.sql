-- Fix certificates table missing columns

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

-- Step 2: Add missing columns to certificates table
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 3: Update existing records to have proper timestamps
UPDATE certificates 
SET 
    created_at = COALESCE(uploaded_at, now()),
    updated_at = COALESCE(verified_at, uploaded_at, now())
WHERE created_at IS NULL OR updated_at IS NULL;

-- Step 4: Make columns NOT NULL
ALTER TABLE certificates 
ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE certificates 
ALTER COLUMN updated_at SET NOT NULL;

-- Step 5: Fix the trigger
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify the table structure
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

-- Step 7: Test the table by creating a test certificate
DO $$
DECLARE
    student_id UUID;
    cert_id UUID;
BEGIN
    -- Get first student
    SELECT id INTO student_id 
    FROM profiles 
    WHERE role = 'student' 
    LIMIT 1;
    
    IF student_id IS NOT NULL THEN
        -- Insert test certificate
        INSERT INTO certificates (
            student_id,
            title,
            description,
            category,
            status,
            file_url,
            file_name,
            uploaded_at,
            created_at,
            updated_at
        ) VALUES (
            student_id,
            'Test Certificate - Column Fix',
            'Testing certificate with proper columns',
            'academic',
            'pending',
            'https://example.com/test-cert.pdf',
            'test-cert.pdf',
            now(),
            now(),
            now()
        ) RETURNING id INTO cert_id;
        
        RAISE NOTICE 'SUCCESS: Test certificate created with ID %', cert_id;
    ELSE
        RAISE NOTICE 'No students found for testing';
    END IF;
END $$;

-- Step 8: Show the test certificate
SELECT 
    'Test certificate created' as info,
    c.id,
    c.title,
    c.status,
    c.uploaded_at,
    c.created_at,
    c.updated_at,
    p.full_name as student_name
FROM certificates c
JOIN profiles p ON c.student_id = p.id
WHERE c.title = 'Test Certificate - Column Fix'
ORDER BY c.created_at DESC
LIMIT 1;

-- Step 9: Test updating the certificate
DO $$
DECLARE
    cert_id UUID;
    faculty_id UUID;
BEGIN
    -- Get the test certificate
    SELECT id INTO cert_id 
    FROM certificates 
    WHERE title = 'Test Certificate - Column Fix'
    LIMIT 1;
    
    -- Get first faculty member
    SELECT id INTO faculty_id 
    FROM faculty 
    LIMIT 1;
    
    IF cert_id IS NOT NULL AND faculty_id IS NOT NULL THEN
        -- Test the update with trigger
        UPDATE certificates 
        SET 
            status = 'approved',
            verified_by = faculty_id,
            verified_at = now(),
            remark = 'Test approval - columns fixed'
        WHERE id = cert_id;
        
        RAISE NOTICE 'SUCCESS: Certificate % updated - trigger worked!', cert_id;
    ELSE
        RAISE NOTICE 'No test certificate or faculty found for testing';
    END IF;
END $$;

-- Step 10: Show the updated certificate
SELECT 
    'Certificate update test result' as info,
    c.id,
    c.title,
    c.status,
    c.verified_at,
    c.updated_at,
    c.remark,
    p.full_name as student_name
FROM certificates c
JOIN profiles p ON c.student_id = p.id
WHERE c.title = 'Test Certificate - Column Fix'
ORDER BY c.updated_at DESC
LIMIT 1;

SELECT '=== CERTIFICATES MISSING COLUMNS FIXED ===' as status;

