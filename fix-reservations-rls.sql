-- Fix reservations RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON reservations;
DROP POLICY IF EXISTS "Allow public read access" ON reservations;

-- Create new policies for reservations
CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow public update reservations" ON reservations FOR UPDATE USING (true);

-- Also ensure the table structure is correct
-- Check if the table exists and has the right columns
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;
