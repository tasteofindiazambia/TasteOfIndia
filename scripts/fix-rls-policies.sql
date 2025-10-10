-- Fix RLS policies for admin menu operations
-- Run this in Supabase SQL editor

-- Drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS "Allow admin insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin update menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin delete menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin insert categories" ON categories;
DROP POLICY IF EXISTS "Allow admin update categories" ON categories;
DROP POLICY IF EXISTS "Allow admin delete categories" ON categories;

-- Menu items admin policies
CREATE POLICY "Allow admin insert menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update menu_items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete menu_items" ON menu_items FOR DELETE USING (true);

-- Categories admin policies  
CREATE POLICY "Allow admin insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete categories" ON categories FOR DELETE USING (true);
