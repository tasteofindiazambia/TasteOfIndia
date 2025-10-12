#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Supabase Configuration
SUPABASE_URL=https://qslfidheyalqdetiqdbs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbGZpZGhleWFscWRldGlxZGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjI5MjYsImV4cCI6MjA3MzkzODkyNn0.IRX5qpkcIenyECrTTuPwsRK-hBXsW57eF4TFjm2RhxE

# Supabase Service Role Key (for admin operations)
# Get this from your Supabase project settings > API
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Settings
NODE_ENV=development
USE_SUPABASE=true

# API Configuration
VITE_API_URL=/api
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Backing up to .env.backup');
    fs.copyFileSync(envPath, path.join(__dirname, '..', '.env.backup'));
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Get your Supabase Service Role Key from:');
  console.log('   https://supabase.com/dashboard/project/qslfidheyalqdetiqdbs/settings/api');
  console.log('2. Replace "your_service_role_key_here" in .env with your actual service role key');
  console.log('3. Run: npm run dev:full');
  console.log('');
  console.log('🔧 The .env file contains:');
  console.log('- Supabase URL and Anon Key (already configured)');
  console.log('- Service Role Key (needs to be updated)');
  console.log('- Development settings');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
