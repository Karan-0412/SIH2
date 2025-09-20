# Faculty-Student Assignment System

## Overview
A complete faculty-student assignment system where admins can manage faculty with codes and assign students to them, with CSV import functionality for bulk operations.

## Features

### 1. Admin Faculty Management
- **Add Faculty**: Create faculty with unique codes, contact info, and specialization
- **Faculty Codes**: Each faculty gets a unique code (e.g., CS001, IT002)
- **CSV Import**: Bulk import student assignments using CSV files
- **Faculty Verification**: Mark faculty as verified/unverified

### 2. Student Assignment System
- **Code-based Assignment**: Students are assigned to faculty using faculty codes
- **Bulk Import**: Upload CSV with student details and faculty codes
- **Auto-creation**: Students are created automatically if they don't exist
- **Roll Number Support**: Each student gets a unique roll number

### 3. Faculty View
- **My Students**: Faculty can only see students assigned to them
- **Search & Filter**: Find students by name, email, or roll number
- **Student Details**: View complete student information

## Database Schema

### Faculty Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- department (TEXT)
- designation (TEXT)
- faculty_code (VARCHAR(10), Unique) -- NEW
- phone (VARCHAR(15)) -- NEW
- specialization (TEXT) -- NEW
- is_verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Profiles Table (Students)
```sql
- id (UUID, Primary Key)
- full_name (TEXT)
- email (TEXT)
- role (ENUM: 'student', 'faculty')
- assigned_faculty_code (VARCHAR(10)) -- NEW
- student_roll_number (VARCHAR(20)) -- NEW
- department (TEXT)
- phone (TEXT)
- graduation_year (INTEGER)
- ... other existing fields
```

## Setup Instructions

### 1. Apply Database Migration
Run the SQL migration in your Supabase dashboard:
```sql
-- See: supabase/update_faculty_system.sql
```

### 2. Faculty Management (Admin)
1. Go to `/admin/faculty`
2. Click "Add New Faculty"
3. Fill in:
   - Full Name
   - Email
   - Department
   - Designation
   - **Faculty Code** (e.g., CS001)
   - Phone Number
   - Specialization
4. Save and verify faculty

### 3. Student Assignment (Admin)
1. Go to `/admin/faculty`
2. Click "Import Assignments"
3. Download the CSV template
4. Fill in student data:
   ```
   student_roll_number,student_name,student_email,faculty_code
   2024001,John Doe,john.doe@university.edu,CS001
   2024002,Jane Smith,jane.smith@university.edu,IT001
   ```
5. Upload the CSV file

### 4. Faculty View
1. Faculty login and go to `/faculty/students`
2. View all assigned students
3. Search by name, email, or roll number

## CSV Import Format

### Required Columns
- `student_roll_number`: Unique student identifier
- `student_name`: Full name of the student
- `student_email`: Student's email address
- `faculty_code`: Faculty code to assign student to

### Example CSV
```csv
student_roll_number,student_name,student_email,faculty_code
2024001,John Doe,john.doe@university.edu,CS001
2024002,Jane Smith,jane.smith@university.edu,IT001
2024003,Bob Johnson,bob.johnson@university.edu,CS002
```

## Security & Permissions

### Admin Access
- Full access to faculty management
- Can create/update/delete faculty
- Can import student assignments
- Can view all data

### Faculty Access
- Can only view students assigned to them
- Cannot see other faculty's students
- Cannot modify student assignments

### Student Access
- Regular student dashboard access
- Cannot see assignment details

## File Structure

```
src/
├── components/admin/
│   ├── FacultyForm.tsx          # Faculty creation/editing form
│   ├── FacultyTable.tsx         # Faculty listing table
│   └── CSVImportModal.tsx       # CSV import functionality
├── pages/
│   ├── AdminFaculty.tsx         # Admin faculty management
│   └── FacultyStudents.tsx      # Faculty view of assigned students
└── supabase/
    └── update_faculty_system.sql # Database migration
```

## Usage Workflow

1. **Admin adds faculty** with unique codes
2. **Admin imports student assignments** via CSV
3. **Students are automatically created** if they don't exist
4. **Faculty can view their assigned students** in their dashboard
5. **System maintains data integrity** with proper relationships

## Benefits

- ✅ **Code-based assignment** for easy management
- ✅ **Bulk import** for efficient operations
- ✅ **Automatic student creation** reduces manual work
- ✅ **Secure access** - faculty only see their students
- ✅ **Scalable system** for large institutions
- ✅ **Data integrity** with proper database relationships

## Next Steps

1. Apply the database migration
2. Test faculty creation with codes
3. Test CSV import functionality
4. Verify faculty can only see their assigned students
5. Train admins on the new system
