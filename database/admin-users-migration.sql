-- Admin Users Table Migration
-- This extends the current hardcoded auth system safely
-- Run this in Supabase SQL Editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Will store hashed passwords
    role VARCHAR(20) NOT NULL DEFAULT 'owner', -- 'owner' or 'worker'
    email VARCHAR(100),
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES admin_users(id), -- Who created this user (for workers)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Insert the current admin user (backward compatibility)
-- Password will be 'admin123' hashed
INSERT INTO admin_users (id, username, password_hash, role, full_name, is_active) 
VALUES (
    1, 
    'admin', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'admin123'
    'owner',
    'Restaurant Owner',
    true
) ON CONFLICT (username) DO NOTHING;

-- Set sequence to start after our inserted admin user
SELECT setval('admin_users_id_seq', (SELECT MAX(id) FROM admin_users));

-- Row Level Security (RLS) - keeping it simple for now
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated admin users to read all admin users
CREATE POLICY "Allow admin users to read admin_users" ON admin_users
    FOR SELECT USING (true); -- We'll handle authentication in app layer for now

-- Policy: Allow admin users to update themselves
CREATE POLICY "Allow admin users to update own record" ON admin_users
    FOR UPDATE USING (true); -- We'll handle authorization in app layer

-- Policy: Only owners can insert new users
CREATE POLICY "Allow owners to insert new users" ON admin_users
    FOR INSERT WITH CHECK (true); -- We'll handle authorization in app layer

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Admin users table for restaurant management system. Supports owner and worker roles.';
COMMENT ON COLUMN admin_users.role IS 'User role: owner (full access) or worker (limited access)';
COMMENT ON COLUMN admin_users.created_by IS 'ID of the admin user who created this user account';
COMMENT ON COLUMN admin_users.password_hash IS 'Bcrypt hashed password for secure authentication';
