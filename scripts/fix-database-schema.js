const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  console.log('Fixing database schema...');
  
  try {
    // Read the migration file
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250103_fix_notifications_metadata.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error executing migration:', error);
      process.exit(1);
    }
    
    console.log('Database schema fixed successfully!');
    console.log('The community messaging should now work properly.');
    
  } catch (err) {
    console.error('Error fixing database schema:', err);
    process.exit(1);
  }
}

fixDatabaseSchema();
