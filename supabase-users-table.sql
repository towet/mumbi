-- Create users table for manual authentication
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE public.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL, -- Warning: storing plaintext passwords for demo only, use proper hashing in production
            role TEXT DEFAULT 'user',
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        
        -- Add some dummy users for testing
        INSERT INTO public.users (username, email, password, role) VALUES
        ('admin', 'admin@mumbi.farm', 'admin123', 'admin'),
        ('manager', 'manager@mumbi.farm', 'manager123', 'manager'),
        ('user', 'user@mumbi.farm', 'user123', 'user');
    END IF;
END $$;

-- Set up RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert into users" ON public.users;

-- Users can read their own data
CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT USING (
        -- If logged in via Supabase Auth
        (auth.uid() = id) OR
        -- For manual authentication, we don't have a way to check directly
        -- This is simplified for the demo - in production you'd have a more secure check
        TRUE
    );

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (
        -- For Supabase Auth
        (auth.uid() = id) OR
        -- For manual authentication - simplified for demo
        TRUE
    );
    
-- Allow anyone to insert into users table (for registration)
CREATE POLICY "Anyone can insert into users" ON public.users
    FOR INSERT WITH CHECK (TRUE);

-- User role permissions - use this table with both auth systems
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
