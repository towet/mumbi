-- Mumbi Shepherd Connect Database Schema
-- This SQL script creates all the tables needed for the farm management system.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create animals table
CREATE TABLE IF NOT EXISTS public.animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tag_number TEXT NOT NULL,
  breed TEXT NOT NULL,
  sex TEXT NOT NULL,
  status TEXT NOT NULL,
  age TEXT,
  birth_date TEXT,
  weight_kg NUMERIC,
  health_status TEXT NOT NULL,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  performed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create farm_settings table
CREATE TABLE IF NOT EXISTS public.farm_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_name TEXT NOT NULL,
  location TEXT,
  currency TEXT,
  language TEXT,
  date_format TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  related_to TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  reference TEXT,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create health_records table
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_type TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  outcome TEXT,
  follow_up TEXT,
  notes TEXT,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  administered_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  due_date TEXT NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create basic policies that allow all operations for now
-- You should refine these policies based on your access control requirements
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on animals" ON public.animals FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow all operations on farm_settings" ON public.farm_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on financial_transactions" ON public.financial_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on health_records" ON public.health_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on alerts" ON public.alerts FOR ALL USING (true);

-- Add sample data for testing (optional)
INSERT INTO public.animals (name, tag_number, breed, sex, status, age, health_status, weight_kg)
VALUES 
('Fluffy', 'MB001', 'Merino', 'Female', 'Active', '2 years', 'Healthy', 65),
('Thunder', 'MB056', 'Suffolk', 'Male', 'Active', '3 years', 'Healthy', 78),
('Daisy', 'MB102', 'Dorper', 'Female', 'Pregnant', '1.5 years', 'Pregnant', 60)
ON CONFLICT DO NOTHING;
