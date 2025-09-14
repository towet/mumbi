-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Only create profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Create profiles table to store user details
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
    ELSE
        -- If table exists, ensure all necessary columns exist
        -- You may need to adjust this if your existing table has different columns
        BEGIN
            ALTER TABLE public.profiles 
                ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Ignore errors
        END;
    END IF;
END $$;

-- Row level security policies for profiles
-- First drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Enable row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles - Only allow users to see their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profiles
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup - replace if exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING; -- Skip if profile already exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create user_role_permissions table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_role_permissions') THEN
        CREATE TABLE public.user_role_permissions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            role TEXT NOT NULL,
            resource TEXT NOT NULL,
            permission TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            UNIQUE(role, resource, permission)
        );
        
        -- Insert default roles and permissions
        INSERT INTO public.user_role_permissions (role, resource, permission) VALUES
        ('admin', 'all', 'all'),
        ('manager', 'animals', 'read'),
        ('manager', 'animals', 'write'),
        ('manager', 'animals', 'delete'),
        ('manager', 'health_records', 'read'),
        ('manager', 'health_records', 'write'),
        ('manager', 'financial_transactions', 'read'),
        ('manager', 'financial_transactions', 'write'),
        ('manager', 'events', 'read'),
        ('manager', 'events', 'write'),
        ('manager', 'alerts', 'read'),
        ('manager', 'alerts', 'write'),
        ('user', 'animals', 'read'),
        ('user', 'health_records', 'read'),
        ('user', 'events', 'read'),
        ('user', 'alerts', 'read');
    END IF;
END $$;

-- Create function to check user permissions - replace if exists
CREATE OR REPLACE FUNCTION public.check_user_permission(
    p_resource TEXT,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_role TEXT;
    v_has_permission BOOLEAN;
BEGIN
    -- Get the user's role
    SELECT role INTO v_user_role FROM public.profiles WHERE id = auth.uid();
    
    -- Check if user has the required permission
    SELECT EXISTS (
        SELECT 1 FROM public.user_role_permissions
        WHERE (role = v_user_role OR role = 'admin')
          AND (resource = p_resource OR resource = 'all')
          AND (permission = p_permission OR permission = 'all')
    ) INTO v_has_permission;
    
    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Setup RLS policies for Financial Transactions
-- First check if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'financial_transactions') THEN
        -- Drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Users can view transactions" ON public.financial_transactions;
        DROP POLICY IF EXISTS "Users can insert transactions" ON public.financial_transactions;
        DROP POLICY IF EXISTS "Users can update transactions" ON public.financial_transactions;
        DROP POLICY IF EXISTS "Users can delete transactions" ON public.financial_transactions;
        
        -- Enable row level security
        ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view transactions" ON public.financial_transactions
            FOR SELECT USING (public.check_user_permission('financial_transactions', 'read'));
        
        CREATE POLICY "Users can insert transactions" ON public.financial_transactions
            FOR INSERT WITH CHECK (public.check_user_permission('financial_transactions', 'write'));
        
        CREATE POLICY "Users can update transactions" ON public.financial_transactions
            FOR UPDATE USING (public.check_user_permission('financial_transactions', 'write'));
        
        CREATE POLICY "Users can delete transactions" ON public.financial_transactions
            FOR DELETE USING (public.check_user_permission('financial_transactions', 'delete'));
    END IF;
END $$;

-- Setup RLS policies for Animals table
-- First check if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'animals') THEN
        -- Drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Users can view animals" ON public.animals;
        DROP POLICY IF EXISTS "Users can insert animals" ON public.animals;
        DROP POLICY IF EXISTS "Users can update animals" ON public.animals;
        DROP POLICY IF EXISTS "Users can delete animals" ON public.animals;
        
        -- Enable row level security
        ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view animals" ON public.animals
            FOR SELECT USING (public.check_user_permission('animals', 'read'));
        
        CREATE POLICY "Users can insert animals" ON public.animals
            FOR INSERT WITH CHECK (public.check_user_permission('animals', 'write'));
        
        CREATE POLICY "Users can update animals" ON public.animals
            FOR UPDATE USING (public.check_user_permission('animals', 'write'));
        
        CREATE POLICY "Users can delete animals" ON public.animals
            FOR DELETE USING (public.check_user_permission('animals', 'delete'));
    END IF;
END $$;
