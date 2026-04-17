/**
 * Phase 2 - Auth Trigger Migration
 * Run this in your Supabase SQL Editor.
 * 
 * This script will automatically copy new users from the Auth system into our public.users table.
 * It will also explicitly "backfill" any users you already created so you don't get the Foreign Key error!
 */

-- 1. Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'super_admin'::user_role)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill script: Fix your currently existing user!
INSERT INTO public.users (id, email, role)
SELECT id, email, 'super_admin'::user_role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
