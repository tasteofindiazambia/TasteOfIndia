-- Temporarily disable RLS for hero_slides table to fix admin operations
-- This allows the service role to perform all operations without RLS restrictions

-- Disable RLS on hero_slides table
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'hero_slides';

-- Test query to ensure it works
SELECT 'RLS disabled successfully' as status, COUNT(*) as slide_count FROM hero_slides;
