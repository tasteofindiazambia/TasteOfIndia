-- Fix RLS policies for admin menu operations
-- Run this in Supabase SQL editor

-- Menu items admin policies
CREATE POLICY IF NOT EXISTS "Allow admin insert menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow admin update menu_items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow admin delete menu_items" ON menu_items FOR DELETE USING (true);

-- Categories admin policies  
CREATE POLICY IF NOT EXISTS "Allow admin insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow admin update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "Allow admin delete categories" ON categories FOR DELETE USING (true);
