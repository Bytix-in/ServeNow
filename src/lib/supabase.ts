import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Restaurant {
  id: string;
  manager_id: string;
  access_key: string;
  restaurant_name: string;
  owner_name: string;
  phone_number: string;
  email: string;
  address: string;
  cuisine_tags: string;
  seating_capacity: number;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  type: string;
  price: number;
  ingredients?: string;
  prep_time: number;
  tags: string[];
  created_at: string;
  image_url?: string; // Added for dish image support
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  created_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone?: string;
  table_number: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  order_time: string;
  notes?: string;
}

export interface OrderItem {
  dish_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ActivityLog {
  id: string;
  restaurant_id?: string;
  user_id?: string;
  manager_id?: string;
  activity_type: string;
  details?: any;
  timestamp: string;
}

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Staff {
  id: string;
  restaurant_id: string;
  full_name: string;
  phone_number: string;
  role: 'waiter' | 'cook';
  staff_id: string;
  password: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

// Utility functions
export const logActivity = async (
  activityType: string,
  details?: any,
  restaurantId?: string,
  managerId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('activity_logs').insert({
      restaurant_id: restaurantId,
      user_id: user?.id,
      manager_id: managerId,
      activity_type: activityType,
      details: details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const generateManagerCredentials = () => {
  const generateRandomId = (prefix: string, length: number = 6): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix + '_';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateAccessKey = (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return {
    managerId: generateRandomId('MGR'),
    accessKey: generateAccessKey()
  };
};