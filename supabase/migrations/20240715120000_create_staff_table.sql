-- Create staff table for staff management system
CREATE TABLE staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    role text NOT NULL CHECK (role IN ('waiter', 'cook')),
    staff_id text UNIQUE NOT NULL,
    password text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    last_login timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookup by restaurant
CREATE INDEX idx_staff_restaurant_id ON staff(restaurant_id);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Remove permissive public policies and add authenticated-only policies
DROP POLICY IF EXISTS "Allow insert for staff" ON staff;
DROP POLICY IF EXISTS "Allow read for staff" ON staff;

-- Allow only authenticated users to insert staff
CREATE POLICY "Allow authenticated insert for staff" ON staff
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow only authenticated users to read staff
CREATE POLICY "Allow authenticated read for staff" ON staff
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow only authenticated users to update staff (e.g., is_active)
CREATE POLICY "Allow authenticated update for staff" ON staff
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); 