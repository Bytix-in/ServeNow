/*
  # Update RLS Policies for Admin Operations

  1. Security Updates
    - Remove authentication requirement for admin operations
    - Allow public access for restaurant management
    - Enable proper permissions for all tables

  2. Policy Changes
    - Update restaurants table policies
    - Update dishes table policies  
    - Update tables table policies
    - Update orders table policies
    - Update activity_logs table policies
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users to insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow authenticated users to manage dishes" ON dishes;
DROP POLICY IF EXISTS "Allow authenticated users to manage tables" ON tables;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to read activity logs" ON activity_logs;

-- Create new permissive policies for restaurants table
CREATE POLICY "Enable all operations for restaurants"
  ON restaurants
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for dishes table  
CREATE POLICY "Enable all operations for dishes"
  ON dishes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for tables table
CREATE POLICY "Enable all operations for tables"
  ON tables
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Keep existing order policies but ensure they're permissive
CREATE POLICY "Enable insert for orders" ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable read for orders" ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable update for orders" ON orders
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create permissive policy for activity logs
CREATE POLICY "Enable all operations for activity logs"
  ON activity_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);