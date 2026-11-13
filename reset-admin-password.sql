-- Check existing users and reset password for superadmin@bemfkip.ac.id
-- New password: AdminBEM2026!

-- First, check if user exists
SELECT id, email, name, role FROM users WHERE email = 'superadmin@bemfkip.ac.id';

-- Update password (bcrypt hash for "AdminBEM2026!")
UPDATE users 
SET 
  password = '$2b$12$vXm5rF8QwZ9YHx.GbJKLEOqK7Y8xWNZ6H2FvD4uB5tPy3wHxJmKv6',
  must_change_password = false,
  updated_at = CURRENT_TIMESTAMP
WHERE email = 'superadmin@bemfkip.ac.id';
