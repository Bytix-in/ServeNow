# Restaurant Management System - Database Setup

## 🚀 Quick Setup Instructions

### Step 1: Run the Database Migration

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the entire contents of `supabase/migrations/create_database_schema.sql`**
5. **Click "Run" to execute the migration**

This will create:
- All necessary database tables
- Proper indexes for performance
- Row Level Security (RLS) policies
- The admin user with your specified credentials

### Step 2: Verify Admin User Creation

After running the migration:

1. **Go to Authentication > Users in your Supabase dashboard**
2. **You should see the admin user**: `shriyanshdash12@gmail.com`
3. **If the user wasn't created automatically, add it manually:**
   - Click "Add user"
   - Email: `shriyanshdash12@gmail.com`
   - Password: `Shri@1727`
   - Check "Email Confirm" and "Auto Confirm User"
   - Click "Create user"

### Step 3: Test the Setup

1. **Start your application**: `npm run dev`
2. **Navigate to**: `/admin/login`
3. **Login with**:
   - Email: `shriyanshdash12@gmail.com`
   - Password: `Shri@1727`

## 📊 Database Schema

### Tables Created:
- **restaurants** - Store restaurant information and manager credentials
- **dishes** - Store menu items for each restaurant  
- **tables** - Store table configurations for each restaurant
- **orders** - Store customer orders
- **activity_logs** - Store system activity logs

### Security Features:
- Row Level Security (RLS) enabled on all tables
- Proper authentication policies
- Public access for menu viewing
- Authenticated access for management functions

## 🔧 Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard under Settings > API.

## 🎯 Admin Credentials

- **Email**: shriyanshdash12@gmail.com
- **Password**: Shri@1727

## 📝 Adding More Admin Users

To add more admin users later:
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Fill in email and password
4. Check "Email Confirm" and "Auto Confirm User"
5. Click "Create user"

## 🔍 Troubleshooting

If you encounter issues:

1. **Tables not created**: Make sure you ran the entire SQL migration
2. **Admin login fails**: Verify the user exists in Authentication > Users
3. **Environment variables**: Check your `.env` file has correct Supabase credentials
4. **RLS errors**: The migration includes all necessary policies

## 🛡️ Security Notes

- All tables have Row Level Security enabled
- Admin users authenticate through Supabase Auth
- Public users can view menus and place orders
- Authenticated users can manage restaurants
- Activity logging tracks all system actions