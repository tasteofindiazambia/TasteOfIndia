-- Fix reservations RLS policies
-- This script should be run in the Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON reservations;
DROP POLICY IF EXISTS "Allow public read access" ON reservations;
DROP POLICY IF EXISTS "Allow public insert reservations" ON reservations;
DROP POLICY IF EXISTS "Allow public read reservations" ON reservations;
DROP POLICY IF EXISTS "Allow public update reservations" ON reservations;

-- Temporarily disable RLS for reservations table to allow public inserts
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create new policies for reservations that allow public access
CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow public update reservations" ON reservations FOR UPDATE USING (true);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reservations';