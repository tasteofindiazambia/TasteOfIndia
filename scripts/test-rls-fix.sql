-- Test script to check RLS policies on hero_slides table

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'hero_slides';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'hero_slides';

-- Test direct query with service role (should work)
-- This should return all slides if RLS is properly configured
SELECT id, title, is_active FROM hero_slides ORDER BY slide_order;
