-- Debug script to check faculty credentials issue

-- 1. Check if there are any credentials in the database
SELECT 
    vc.id,
    vc.vc_id,
    vc.student_id,
    vc.issuer_id,
    vc.issued_at,
    vc.short_token,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON p.id = vc.student_id
ORDER BY vc.issued_at DESC
LIMIT 10;

-- 2. Check if there are any issuers
SELECT 
    id,
    name,
    status,
    created_at
FROM issuers
ORDER BY created_at DESC;

-- 3. Check faculty records
SELECT 
    f.id,
    f.email,
    f.name,
    f.department,
    p.full_name,
    p.email as profile_email
FROM faculty f
LEFT JOIN profiles p ON p.email = f.email
ORDER BY f.created_at DESC;

-- 4. Check if there are any student-mentor assignments
SELECT 
    sma.id,
    sma.mentor_id,
    sma.student_id,
    f.email as faculty_email,
    p.full_name as student_name,
    p.email as student_email
FROM student_mentor_assignments sma
LEFT JOIN faculty f ON f.id = sma.mentor_id
LEFT JOIN profiles p ON p.id = sma.student_id
ORDER BY sma.created_at DESC
LIMIT 10;

-- 5. Check the specific query that FacultyCredentials uses
-- This simulates the exact query from the component
SELECT 
    vc.*,
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email
FROM verifiable_credentials vc
LEFT JOIN profiles p ON p.id = vc.student_id
WHERE vc.issuer_id IN (
    SELECT f.id 
    FROM faculty f 
    WHERE f.email = 'your-email@example.com'  -- Replace with actual faculty email
)
ORDER BY vc.issued_at DESC;

