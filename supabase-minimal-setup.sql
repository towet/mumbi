-- Minimal setup for Supabase Auth with proper profiles
-- This script doesn't assume any existing table structure
-- Run this in the Supabase SQL editor

-- First, enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the existing profiles table if it's causing problems (OPTIONAL - UNCOMMENT IF NEEDED)
-- DROP TABLE IF EXISTS public.profiles;

-- Create a fresh profiles table with minimal but required fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add basic columns safely
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Enable row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be created by anyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles with matching email" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON public.profiles;

-- Create minimal but functional policies
CREATE POLICY "Allow service role full access" ON public.profiles 
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles can be created by anyone" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create simple trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with minimal data
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail
  RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove any existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new sign-ups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- IMPORTANT: In your Supabase dashboard:
-- 1. Go to Authentication > Settings
-- 2. Ensure "Enable email signup" is ON
-- 3. Set "Confirm email" to OFF for testing (easier)
