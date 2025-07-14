/*
  # Create Admin User in Supabase Auth

  This migration creates the admin user in Supabase's authentication system
  and ensures the admins table has the corresponding record.

  1. Admin User Creation
    - Email: shriyanshdash12@gmail.com
    - Password: Shri@1727
    - This will be created through Supabase Auth

  2. Admin Table Record
    - Links the auth user to admin permissions
    - Stores admin name and metadata
*/

-- First, ensure the admins table exists (if not already created)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins table
CREATE POLICY "Enable read access for authenticated users"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert admin record (this will be used for verification after Supabase Auth)
INSERT INTO admins (email, password, name)
VALUES ('shriyanshdash12@gmail.com', 'Shri@1727', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);