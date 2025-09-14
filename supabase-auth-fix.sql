-- Run this SQL in your Supabase SQL Editor to fix authentication issues
-- First, enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check and create profiles table if needed with extensive error handling
DO $$ 
DECLARE
    profile_count INTEGER;
    column_exists BOOLEAN;
BEGIN
    -- Check if the profiles table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Create a new profiles table with all necessary columns
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            username TEXT,
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        RAISE NOTICE 'Created profiles table with all standard columns';
    ELSE
        -- If table exists, ensure it has the necessary columns
        BEGIN
            -- Check if each column exists before attempting to add it
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'role'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
                RAISE NOTICE 'Added role column';
            END IF;
            
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'full_name'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
                RAISE NOTICE 'Added full_name column';
            END IF;
            
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'avatar_url'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
                RAISE NOTICE 'Added avatar_url column';
            END IF;
            
                        -- Check if username column exists
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'username'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                -- Add username column
                ALTER TABLE public.profiles ADD COLUMN username TEXT;
                RAISE NOTICE 'Added username column';
            END IF;
            
            -- Check if email column exists
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'email'
            ) INTO column_exists;
            
            IF NOT column_exists THEN
                -- Add email column
                ALTER TABLE public.profiles ADD COLUMN email TEXT;
                RAISE NOTICE 'Added email column';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error modifying profiles table: %', SQLERRM;
        END;
        
        -- Count existing profiles to see if we need to populate test data
        SELECT COUNT(*) INTO profile_count FROM public.profiles;
        RAISE NOTICE 'Found % existing profiles', profile_count;
    END IF;
END $$;

-- Enable RLS with better policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be created by anyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON public.profiles;

-- Users can read their own profile and admins can read any profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.role() = 'service_role' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Allow profile creation for new users
CREATE POLICY "Profiles can be created by anyone" ON public.profiles
    FOR INSERT WITH CHECK (true);
    
-- Allow reading own profile via email if id doesn't match
CREATE POLICY "Users can view profiles with matching email" ON public.profiles
    FOR SELECT USING (
        auth.email() = email OR 
        auth.role() = 'service_role'
    );
    
-- Grant service role full access for admin operations
CREATE POLICY "Allow service role full access" ON public.profiles
    USING (auth.role() = 'service_role');

-- Remove any existing triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create an improved trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  role_val TEXT;
  full_name_val TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Check if a profile already exists for this user
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
  
  -- Only create a profile if one doesn't exist
  IF NOT profile_exists THEN
    -- Extract user metadata with fallbacks
    -- Get username from metadata or email
  BEGIN
    username_val := COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    );
  EXCEPTION WHEN OTHERS THEN
    username_val := 'user_' || substr(NEW.id::text, 1, 8);
  END;
    
    role_val := COALESCE(
      NEW.raw_user_meta_data->>'role',
      'user' -- Default role
    );
    
    full_name_val := NEW.raw_user_meta_data->>'full_name';
    
    -- Insert with conflict handling in case profile already exists (extra safety)
    BEGIN
      -- Check which columns exist in the profiles table
      DECLARE
        has_username boolean;
        has_email boolean;
        has_role boolean;
        has_full_name boolean;
        insert_cols text := 'id';
        insert_vals text := 'NEW.id';
        update_stmt text := '';
      BEGIN
        -- Check each column
        SELECT EXISTS (SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username') INTO has_username;
        
        SELECT EXISTS (SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') INTO has_email;
          
        SELECT EXISTS (SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') INTO has_role;
          
        SELECT EXISTS (SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') INTO has_full_name;
        
        -- Build column list dynamically based on what exists
        IF has_email THEN
          insert_cols := insert_cols || ', email';
          insert_vals := insert_vals || ', NEW.email';
          update_stmt := update_stmt || 'email = NEW.email, ';
        END IF;
        
        IF has_username THEN
          insert_cols := insert_cols || ', username';
          insert_vals := insert_vals || ', username_val';
          update_stmt := update_stmt || 'username = EXCLUDED.username, ';
        END IF;
        
        IF has_role THEN
          insert_cols := insert_cols || ', role';
          insert_vals := insert_vals || ', role_val';
        END IF;
        
        IF has_full_name THEN
          insert_cols := insert_cols || ', full_name';
          insert_vals := insert_vals || ', full_name_val';
        END IF;
        
        insert_cols := insert_cols || ', created_at';
        insert_vals := insert_vals || ', NEW.created_at';
        update_stmt := update_stmt || 'updated_at = NOW()';
        
        -- Execute dynamic SQL
        EXECUTE 'INSERT INTO public.profiles (' || insert_cols || ') '
          'VALUES (' || insert_vals || ') '
          'ON CONFLICT (id) DO UPDATE SET ' || update_stmt;
          
        RAISE NOTICE 'Created/updated profile for user %', NEW.id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error in dynamic profile insertion: %', SQLERRM;
      END;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the auth signup
      RAISE NOTICE 'Error in handle_new_user insert: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth signup
  RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  
-- Also create a trigger for updates (optional)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in handle_user_update: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Add index to improve performance on frequently accessed columns
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Function to create/update test profiles
-- Function to check if columns exist in a table
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text) 
RETURNS boolean AS $$
DECLARE
  result boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = table_name
    AND column_name = column_name
  ) INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to create test profiles
CREATE OR REPLACE FUNCTION create_test_profiles()
RETURNS void AS $$
DECLARE
  profile_count INTEGER;
  has_username boolean;
  has_email boolean;
  has_full_name boolean;
  has_role boolean;
  has_id boolean;
BEGIN
  -- Check if we need test data
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  -- Check which columns exist
  SELECT column_exists('profiles', 'username') INTO has_username;
  SELECT column_exists('profiles', 'email') INTO has_email;
  SELECT column_exists('profiles', 'full_name') INTO has_full_name;
  SELECT column_exists('profiles', 'role') INTO has_role;
  SELECT column_exists('profiles', 'id') INTO has_id;
  
  IF profile_count = 0 THEN
    -- Only insert test profiles if we don't have any profiles
    -- This is just optional demo data to help testing
    BEGIN
      -- First check if the auth user exists
      IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@mumbi.farm') THEN
        -- Construct a dynamic insert based on existing columns
        IF has_id THEN
          -- Basic insert with just id (only absolutely required field)
          EXECUTE 'INSERT INTO public.profiles (id, created_at) '
            'SELECT id, NOW() '
            'FROM auth.users WHERE email = ''test@mumbi.farm'' '
            'ON CONFLICT (id) DO NOTHING';
            
          -- If email column exists, update it
          IF has_email THEN
            EXECUTE 'UPDATE public.profiles SET email = ''test@mumbi.farm'' '
              'WHERE id IN (SELECT id FROM auth.users WHERE email = ''test@mumbi.farm'')';
          END IF;
            
          -- Update other columns if they exist
          IF has_username THEN
            EXECUTE 'UPDATE public.profiles SET username = ''test_admin'' '
              'WHERE email = ''test@mumbi.farm'' AND username IS NULL';
          END IF;
          
          IF has_full_name THEN
            EXECUTE 'UPDATE public.profiles SET full_name = ''Test Admin'' '
              'WHERE email = ''test@mumbi.farm'' AND full_name IS NULL';
          END IF;
          
          IF has_role THEN
            EXECUTE 'UPDATE public.profiles SET role = ''admin'' '
              'WHERE email = ''test@mumbi.farm'' AND role IS NULL';
          END IF;
          
          RAISE NOTICE 'Created test profile';
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error creating test profiles: %', SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create test profiles if needed
SELECT create_test_profiles();

-- Important Supabase dashboard settings:
-- 1. Go to Authentication > Settings
-- 2. Ensure "Enable email signup" is ON
-- 3. Set "Confirm email" to OFF for testing (easier signup flow)
-- 4. Allow passwordless authentication method (if desired)

-- IMPORTANT MANUAL STEPS FOR NEW PROJECTS:
-- 1. Enable required auth providers in Supabase Dashboard
-- 2. Make sure RLS is properly configured for all tables
-- 3. Update the client-side code to match these settings
