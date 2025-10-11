-- Run this in Supabase SQL Editor to remove reservations table
-- This will permanently delete all reservation data

-- Drop the reservations table and all related data
DROP TABLE IF EXISTS reservations CASCADE;

-- Note: This will permanently delete all reservation data
-- Make sure to backup any important data before running this script
