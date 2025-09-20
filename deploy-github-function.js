// Script to deploy GitHub OAuth Edge Function to Supabase
// Run this with: node deploy-github-function.js

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying GitHub OAuth Edge Function to Supabase...');

try {
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Supabase CLI is not installed. Please install it first:');
    console.error('npm install -g supabase');
    process.exit(1);
  }

  // Deploy the function
  console.log('📦 Deploying function...');
  execSync('supabase functions deploy github-oauth', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, 'supabase')
  });

  console.log('✅ GitHub OAuth Edge Function deployed successfully!');
  console.log('🔗 Function URL: https://your-project.supabase.co/functions/v1/github-oauth');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Update your .env file with the correct Supabase URL');
  console.log('2. Test the GitHub OAuth flow');
  console.log('3. Remove the debug component from MyProjectsPage');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Make sure you are logged in: supabase login');
  console.log('2. Make sure your project is linked: supabase link');
  console.log('3. Check your Supabase project settings');
  process.exit(1);
}
