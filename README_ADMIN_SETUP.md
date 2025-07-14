# Admin User Setup Instructions

## Creating the Admin User in Supabase

Since we cannot directly create authenticated users through the application code, you need to create the admin user manually in your Supabase project.

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to Authentication > Users**
3. **Click "Add user" button**
4. **Fill in the details:**
   - Email: `shriyanshdash12@gmail.com`
   - Password: `Shri@1727`
   - Email Confirm: ✅ (checked)
   - Auto Confirm User: ✅ (checked)
5. **Click "Create user"**

### Method 2: Using SQL Editor (Alternative)

If you prefer to use SQL, you can run the migration file:

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the contents of `supabase/migrations/create_admin_user.sql`**
5. **Run the query**

## Verification

After creating the admin user, you can verify it works by:

1. **Going to your application**
2. **Navigate to `/admin/login`**
3. **Login with:**
   - Email: `shriyanshdash12@gmail.com`
   - Password: `Shri@1727`

## Security Notes

- This admin user will have full access to the admin dashboard
- You can add more admin users later through the Supabase dashboard
- Make sure to use strong passwords for production environments
- Consider enabling 2FA for admin accounts in production

## Adding More Admin Users Later

To add more admin users in the future:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user"
3. Fill in the email and password
4. Make sure "Email Confirm" and "Auto Confirm User" are checked
5. Click "Create user"

The user will automatically have admin access to the system.