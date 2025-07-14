/*
  # Create Admin User in Supabase Auth

  1. Creates admin user in auth.users table
  2. Creates corresponding entry in public.admins table
  3. Sets up proper authentication for admin login

  This migration creates the admin user directly in Supabase's authentication system
  to resolve RLS policy violations and login credential errors.
*/

-- Insert admin user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'shriyanshdash12@gmail.com',
  crypt('Shri@1727', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Insert admin user into auth.identities table
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'shriyanshdash12@gmail.com'),
  format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'shriyanshdash12@gmail.com'), 'shriyanshdash12@gmail.com')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, user_id) DO NOTHING;

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admins table
CREATE POLICY "Enable read access for authenticated users"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert admin record into admins table
INSERT INTO admins (email, password, name)
VALUES ('shriyanshdash12@gmail.com', 'Shri@1727', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);