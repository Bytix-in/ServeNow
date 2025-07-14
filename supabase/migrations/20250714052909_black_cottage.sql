/*
  # Create Admin User

  This migration creates the admin user with the specified credentials.
  
  1. Creates the admin user in auth.users table
  2. Sets up the user profile with admin role
  
  Note: Run this in your Supabase SQL Editor after setting up the initial schema.
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
  '',
  '',
  '',
  ''
);

-- Insert corresponding identity record
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'shriyanshdash12@gmail.com'),
  format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'shriyanshdash12@gmail.com'), 'shriyanshdash12@gmail.com')::jsonb,
  'email',
  NOW(),
  NOW()
);