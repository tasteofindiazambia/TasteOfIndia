-- Fix RLS policies for hero_slides table
-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Public can view active hero slides" ON hero_slides;

-- Create simpler RLS policies that don't rely on auth.users table
-- Allow public read access to active slides
CREATE POLICY "Public can view active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);

-- Allow all operations for authenticated users (admin operations will use service role)
CREATE POLICY "Authenticated users can manage hero slides" ON hero_slides
  FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: Disable RLS temporarily for testing
-- ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
