-- Remove contact_messages table and all related data
-- Run this in Supabase SQL Editor to completely remove the contact form functionality

-- Drop the contact_messages table
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Note: This will permanently delete all contact form submissions
-- Make sure to backup any important data before running this script
