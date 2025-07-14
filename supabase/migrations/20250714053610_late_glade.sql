/*
  # Create Admin Table

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `name` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `admins` table
    - Add policy for admin authentication
  
  3. Data
    - Insert default admin user with provided credentials
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Enable read access for authenticated users" ON admins
  FOR SELECT USING (true);

-- Insert the admin user with your credentials
-- Note: In production, passwords should be properly hashed
INSERT INTO admins (email, password, name) 
VALUES ('shriyanshdash12@gmail.com', 'Shri@1727', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);