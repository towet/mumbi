-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('Task', 'Reminder', 'Warning', 'Emergency')),
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    due_date DATE NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- First drop any existing policy to avoid errors
DROP POLICY IF EXISTS "Allow public access to alerts" ON public.alerts;

-- Allow public access for now (you might want to restrict this in production)
CREATE POLICY "Allow public access to alerts" ON public.alerts
  USING (true)
  WITH CHECK (true);

-- Create a trigger function to automatically update the updated_at column if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $BODY$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS set_alerts_updated_at ON public.alerts;
CREATE TRIGGER set_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS alerts_animal_id_idx ON public.alerts(animal_id);
CREATE INDEX IF NOT EXISTS alerts_status_idx ON public.alerts(status);
CREATE INDEX IF NOT EXISTS alerts_due_date_idx ON public.alerts(due_date);

-- Create animals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.animals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tag_number TEXT NOT NULL UNIQUE,
    breed TEXT,
    sex TEXT CHECK (sex IN ('Male', 'Female')),
    status TEXT DEFAULT 'Active',
    age TEXT,
    birth_date DATE,
    weight_kg NUMERIC(6,2),
    health_status TEXT DEFAULT 'Healthy',
    notes TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- First drop any existing policy to avoid errors
DROP POLICY IF EXISTS "Allow public access to animals" ON public.animals;

-- Allow public access for now
CREATE POLICY "Allow public access to animals" ON public.animals
  USING (true)
  WITH CHECK (true);

-- Create a trigger to automatically update the updated_at column for animals
-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS set_animals_updated_at ON public.animals;
CREATE TRIGGER set_animals_updated_at
BEFORE UPDATE ON public.animals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS animals_tag_number_idx ON public.animals(tag_number);

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    related_to TEXT NOT NULL CHECK (related_to IN ('Animal', 'Farm', 'Other')),
    payment_method TEXT NOT NULL,
    reference TEXT,
    animal_id UUID REFERENCES public.animals(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- First drop any existing policy to avoid errors
DROP POLICY IF EXISTS "Allow public access to financial_transactions" ON public.financial_transactions;

-- Allow public access for now (you might want to restrict this in production)
CREATE POLICY "Allow public access to financial_transactions" ON public.financial_transactions
  USING (true)
  WITH CHECK (true);

-- Create a trigger to automatically update the updated_at column for financial_transactions
-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS set_financial_transactions_updated_at ON public.financial_transactions;
CREATE TRIGGER set_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS financial_transactions_date_idx ON public.financial_transactions(date);
CREATE INDEX IF NOT EXISTS financial_transactions_type_idx ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS financial_transactions_category_idx ON public.financial_transactions(category);
CREATE INDEX IF NOT EXISTS financial_transactions_animal_id_idx ON public.financial_transactions(animal_id);
