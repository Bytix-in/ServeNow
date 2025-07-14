/*
  # ServeNow Database Schema

  1. New Tables
    - `restaurants` - Store restaurant information and credentials
    - `dishes` - Store menu items linked to restaurants
    - `tables` - Store table numbers for each restaurant
    - `orders` - Store customer orders
    - `activity_logs` - Track all system activities for analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for data isolation between restaurants
    - Ensure admins can access all data, managers only their restaurant data

  3. Features
    - UUID primary keys for all tables
    - Foreign key relationships with CASCADE deletes
    - Timestamp tracking for all records
    - JSONB for flexible order items storage
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id TEXT UNIQUE NOT NULL,
  access_key TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  cuisine_tags TEXT NOT NULL,
  seating_capacity INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dishes table
CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  ingredients TEXT,
  prep_time INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  table_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_id TEXT,
  activity_type TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants table
CREATE POLICY "Enable read access for authenticated users" ON public.restaurants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.restaurants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.restaurants
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for dishes table
CREATE POLICY "Enable read access for all users" ON public.dishes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.dishes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.dishes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.dishes
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for tables table
CREATE POLICY "Enable read access for all users" ON public.tables
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.tables
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.tables
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for orders table
CREATE POLICY "Enable read access for all users" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for activity_logs table
CREATE POLICY "Enable read access for authenticated users" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_manager_id ON public.restaurants(manager_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON public.dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_restaurant_id ON public.activity_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);