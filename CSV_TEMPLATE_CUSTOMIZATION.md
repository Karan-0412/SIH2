# CSV Template Customization Guide

## Overview
The CSV import system now supports multiple customizable templates for different types of data imports, making it flexible and user-friendly for various use cases.

## Available Templates

### 1. Student Assignments Template
**Purpose**: Assign students to faculty mentors
**File**: `student_assignments_template.csv`

#### Required Columns:
- `student_roll_number`: Unique student identifier
- `student_name`: Full name of the student
- `student_email`: Student's email address
- `faculty_code`: Faculty code to assign student to

#### Sample Data:
```csv
student_roll_number,student_name,student_email,faculty_code
2024001,John Doe,john.doe@university.edu,CS001
2024002,Jane Smith,jane.smith@university.edu,IT001
2024003,Bob Johnson,bob.johnson@university.edu,CS002
```

#### Features:
- ✅ Auto-creates students if they don't exist
- ✅ Updates existing student assignments
- ✅ Validates faculty codes exist

### 2. Bulk Faculty Import Template
**Purpose**: Import multiple faculty members at once
**File**: `faculty_bulk_template.csv`

#### Required Columns:
- `name`: Full name of faculty member
- `email`: Faculty email address
- `department`: Department name
- `designation`: Job title/position
- `faculty_code`: Unique faculty code

#### Optional Columns:
- `phone`: Phone number
- `specialization`: Areas of expertise

#### Sample Data:
```csv
name,email,department,designation,faculty_code,phone,specialization
Dr. Sarah Johnson,sarah.johnson@university.edu,Computer Science,Professor,CS001,+1234567890,Machine Learning, AI
Dr. Michael Chen,michael.chen@university.edu,Information Technology,Associate Professor,IT001,+1234567891,Web Development, Database Systems
```

#### Features:
- ✅ Creates multiple faculty members
- ✅ Validates unique faculty codes
- ✅ Sets default verification status

### 3. Bulk Student Import Template
**Purpose**: Import multiple students without assignments
**File**: `students_bulk_template.csv`

#### Required Columns:
- `full_name`: Student's full name
- `email`: Student email address
- `student_roll_number`: Unique roll number

#### Optional Columns:
- `department`: Student's department
- `phone`: Phone number
- `graduation_year`: Expected graduation year

#### Sample Data:
```csv
full_name,email,student_roll_number,department,phone,graduation_year
Alice Brown,alice.brown@university.edu,2024001,Computer Science,+1234567892,2024
Charlie Wilson,charlie.wilson@university.edu,2024002,Information Technology,+1234567893,2024
```

#### Features:
- ✅ Creates student profiles
- ✅ Validates unique roll numbers
- ✅ Sets default role as 'student'

### 4. Custom Template
**Purpose**: Define your own CSV format
**File**: `custom_template.csv`

#### Features:
- ✅ Define custom headers
- ✅ Flexible column structure
- ⚠️ Basic validation only (advanced processing not implemented)

## How to Use

### Step 1: Select Template Type
1. Open the CSV Import modal
2. Choose from the dropdown:
   - Student Assignments
   - Bulk Faculty Import
   - Bulk Student Import
   - Custom Template

### Step 2: Download Template
1. Click "Download Template" button
2. The system generates a CSV file with:
   - Correct headers
   - Sample data
   - Proper formatting

### Step 3: Fill Your Data
1. Open the downloaded template
2. Replace sample data with your actual data
3. Ensure all required columns are filled
4. Save as CSV file

### Step 4: Upload and Import
1. Select your filled CSV file
2. Click "Import" button
3. System validates and processes the data
4. View success/error report

## Template Customization

### Adding New Templates
To add a new template, modify the `templates` array in `CSVImportModal.tsx`:

```typescript
{
  id: 'new_template',
  name: 'New Template Name',
  description: 'Description of what this template does',
  icon: <YourIcon className="h-4 w-4" />,
  headers: ['column1', 'column2', 'column3'],
  sampleData: [
    ['sample1', 'sample2', 'sample3'],
    ['sample4', 'sample5', 'sample6']
  ],
  requiredFields: ['column1', 'column2']
}
```

### Custom Processing Logic
Add a new case in the `handleImport` function:

```typescript
case 'new_template':
  await processNewTemplate(lines, headers, successCount, errorCount);
  break;
```

Then implement the processing function:

```typescript
const processNewTemplate = async (lines: string[], headers: string[], successCount: number, errorCount: number) => {
  // Your custom processing logic here
};
```

## Validation Rules

### General Rules
- ✅ CSV files only (`.csv` extension)
- ✅ Headers must match required fields
- ✅ No empty required fields
- ✅ Unique identifiers must be unique

### Student Assignments
- ✅ Faculty codes must exist in faculty table
- ✅ Student emails must be valid format
- ✅ Roll numbers must be unique

### Faculty Import
- ✅ Faculty codes must be unique
- ✅ Email addresses must be unique
- ✅ Valid department names

### Student Import
- ✅ Roll numbers must be unique
- ✅ Email addresses must be unique
- ✅ Valid graduation years (if provided)

## Error Handling

### Common Errors
1. **Invalid Headers**: CSV doesn't contain required columns
2. **Duplicate Data**: Unique fields already exist
3. **Invalid Format**: Data doesn't match expected format
4. **Missing Required Fields**: Empty required columns

### Error Reporting
- ✅ Success count: Number of records processed successfully
- ✅ Error count: Number of records that failed
- ✅ Detailed error messages for troubleshooting

## Best Practices

### CSV Formatting
- ✅ Use comma separators
- ✅ Quote fields containing commas
- ✅ Use consistent date formats
- ✅ Avoid special characters in headers

### Data Preparation
- ✅ Validate data before import
- ✅ Check for duplicates
- ✅ Ensure required fields are filled
- ✅ Use consistent naming conventions

### Testing
- ✅ Test with small datasets first
- ✅ Verify template downloads correctly
- ✅ Check error handling with invalid data
- ✅ Validate all template types

## Troubleshooting

### Template Not Downloading
- Check browser popup blockers
- Ensure JavaScript is enabled
- Try different browser

### Import Fails
- Verify CSV format matches template
- Check required columns are present
- Ensure data is properly formatted
- Check for duplicate unique fields

### Partial Import Success
- Review error messages
- Fix data issues
- Re-import corrected data
- Check database constraints

## Future Enhancements

### Planned Features
- 🔄 Custom field mapping
- 🔄 Data transformation rules
- 🔄 Import scheduling
- 🔄 Advanced validation rules
- 🔄 Import history tracking
- 🔄 Rollback functionality

### Custom Template Processing
- 🔄 Full custom template support
- 🔄 Field mapping interface
- 🔄 Data transformation options
- 🔄 Custom validation rules
