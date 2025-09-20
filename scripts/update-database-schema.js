#!/usr/bin/env node

/**
 * Database Schema Update Script
 * This script updates the Supabase database schema to match the code expectations
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Database Schema Update Script');
console.log('================================');

// Read the migration files
const migrationFiles = [
  'supabase/migrations/20250106_fix_portfolio_schema.sql',
  'supabase/migrations/20250106_complete_schema_update.sql'
];

console.log('\n📋 Migration files to run:');
migrationFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ${index + 1}. ✅ ${file}`);
  } else {
    console.log(`  ${index + 1}. ❌ ${file} (not found)`);
  }
});

console.log('\n📝 Instructions:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of each migration file');
console.log('4. Run them in order:');
console.log('   - First: 20250106_fix_portfolio_schema.sql');
console.log('   - Second: 20250106_complete_schema_update.sql');

console.log('\n⚠️  Important Notes:');
console.log('- This will recreate the student_portfolio table');
console.log('- Any existing portfolio data will be lost');
console.log('- Make sure to backup your data if needed');
console.log('- The new schema matches what the code expects');

console.log('\n🔧 After running the migrations:');
console.log('1. Test the GitHub import functionality');
console.log('2. Try adding/editing portfolio items');
console.log('3. Verify that all CRUD operations work');

console.log('\n✨ Schema Changes:');
console.log('- student_portfolio table now has correct columns');
console.log('- Added proper indexes for performance');
console.log('- Set up Row Level Security policies');
console.log('- Added all missing tables and relationships');

console.log('\n🎯 Next Steps:');
console.log('1. Run the migrations in Supabase');
console.log('2. Test the application');
console.log('3. Report any issues');

console.log('\n✅ Script completed successfully!');
