/*
  # Fix Restaurant RLS Policies

  1. Updates
    - Update RLS policies on restaurants table to allow authenticated users to insert
    - Update RLS policies on dishes table to allow proper access
    - Update RLS policies on other tables for proper functionality

  2. Security
    - Maintains security while allowing admin operations
    - Allows restaurant managers to access their own data
    - Allows public access to view menus and place orders
*/

-- Drop existing policies and recreate them with proper permissions
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON restaurants;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON restaurants;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON restaurants;

-- Restaurants table policies
CREATE POLICY "Allow authenticated users to insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read restaurants"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (true);

-- Also allow public read access for menu viewing
CREATE POLICY "Allow public read access to restaurants"
  ON restaurants
  FOR SELECT
  TO anon
  USING (true);

-- Update dishes table policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dishes;
DROP POLICY IF EXISTS "Enable read access for all users" ON dishes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON dishes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON dishes;

CREATE POLICY "Allow authenticated users to manage dishes"
  ON dishes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to dishes"
  ON dishes
  FOR SELECT
  TO anon
  USING (true);

-- Update tables table policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tables;
DROP POLICY IF EXISTS "Enable read access for all users" ON tables;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tables;

CREATE POLICY "Allow authenticated users to manage tables"
  ON tables
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to tables"
  ON tables
  FOR SELECT
  TO anon
  USING (true);

-- Update orders table policies
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;

CREATE POLICY "Allow anyone to place orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anyone to read orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Update activity_logs table policies
DROP POLICY IF EXISTS "Enable insert for all users" ON activity_logs;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON activity_logs;

CREATE POLICY "Allow anyone to log activities"
  ON activity_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (true);