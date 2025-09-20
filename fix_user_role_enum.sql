-- Fix user_role enum to include 'senior' value

-- First, let's check the current enum values
SELECT unnest(enum_range(NULL::user_role)) as current_values;

-- Check if the enum exists and what values it has
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Add 'senior' to the user_role enum if it doesn't exist
DO $$
BEGIN
    -- Check if 'senior' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'senior' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        -- Add 'senior' to the enum
        ALTER TYPE user_role ADD VALUE 'senior';
        RAISE NOTICE 'Added "senior" to user_role enum';
    ELSE
        RAISE NOTICE '"senior" already exists in user_role enum';
    END IF;
END $$;

-- Verify the enum values after the change
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Also check if there are any profiles with invalid role values
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles 
WHERE role::text NOT IN (
    SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
)
ORDER BY created_at DESC;

-- If there are any profiles with invalid roles, we can update them
-- (This is just for reference - uncomment if needed)
-- UPDATE profiles 
-- SET role = 'student'::user_role
-- WHERE role::text NOT IN (
--     SELECT enumlabel 
--     FROM pg_enum 
--     WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
-- );

