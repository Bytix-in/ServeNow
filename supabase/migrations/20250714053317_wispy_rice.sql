/*
  # Create Restaurant Management Database Schema

  1. New Tables
    - `restaurants` - Store restaurant information and manager credentials
    - `dishes` - Store menu items for each restaurant
    - `tables` - Store table configurations for each restaurant
    - `orders` - Store customer orders
    - `activity_logs` - Store system activity logs

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users and public access

  3. Admin User
    - Create admin user with email: shriyanshdash12@gmail.com
    - Password: Shri@1727
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id text UNIQUE NOT NULL,
  access_key text NOT NULL,
  restaurant_name text NOT NULL,
  owner_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  cuisine_tags text NOT NULL,
  seating_capacity integer NOT NULL,
  is_active boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  price numeric(10,2) NOT NULL,
  ingredients text,
  prep_time integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text,
  table_number integer NOT NULL,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  order_time timestamptz DEFAULT now(),
  notes text
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_id text,
  activity_type text NOT NULL,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_manager_id ON restaurants(manager_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_restaurant_id ON activity_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for restaurants
CREATE POLICY "Enable insert for authenticated users" ON restaurants
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON restaurants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable update for authenticated users" ON restaurants
  FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for dishes
CREATE POLICY "Enable insert for authenticated users" ON dishes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON dishes
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable update for authenticated users" ON dishes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON dishes
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for tables
CREATE POLICY "Enable insert for authenticated users" ON tables
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON tables
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable delete for authenticated users" ON tables
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for orders
CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON orders
  FOR SELECT TO public USING (true);

CREATE POLICY "Enable update for authenticated users" ON orders
  FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for activity_logs
CREATE POLICY "Enable insert for all users" ON activity_logs
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON activity_logs
  FOR SELECT TO authenticated USING (true);

-- Create admin user
-- Note: This creates the user in auth.users table
-- Password will be hashed automatically by Supabase
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'shriyanshdash12@gmail.com',
  crypt('Shri@1727', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  null,
  '',
  '',
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null
) ON CONFLICT (email) DO NOTHING;

-- Create identity for the admin user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM auth.users WHERE email = 'shriyanshdash12@gmail.com'),
  format('{"sub": "%s", "email": "%s"}', (SELECT id FROM auth.users WHERE email = 'shriyanshdash12@gmail.com'), 'shriyanshdash12@gmail.com')::jsonb,
  'email',
  now(),
  now(),
  now()
) ON CONFLICT (provider, id) DO NOTHING;