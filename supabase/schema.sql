/**
 * Bahawalnagar District Bar Council 
 * Digital Wakalat Nama Management System
 * Database Schema
 * Run this in your Supabase SQL Editor
 */

-- Create enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'viewer');
CREATE TYPE w_status AS ENUM ('active', 'reported_fake', 'void');

-- Create Users table (extends Supabase auth built-in users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  role user_role DEFAULT 'viewer'::user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Batches table
CREATE TABLE public.batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_code TEXT NOT NULL,
  distributor_name TEXT NOT NULL,
  amount_paid INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  serial_start INTEGER NOT NULL,
  serial_end INTEGER NOT NULL,
  printed_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);

-- Create Wakalat Namas table
CREATE TABLE public.wakalat_namas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT UNIQUE NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  printed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status w_status DEFAULT 'active'::w_status NOT NULL,
  amount INTEGER NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wakalat_namas ENABLE ROW LEVEL SECURITY;

-- Base Policies allowing authenticated users to read records
CREATE POLICY "Allow authenticated read users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read batches" ON public.batches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read wakalat_namas" ON public.wakalat_namas FOR SELECT USING (auth.role() = 'authenticated');

-- The policies for inserting/updating will be handle via service_role key 
-- to ensure regular users and viewers can't forge requests from the client side.
-- For super_admins, we can add policies later if needed, but for now we'll 
-- rely on the Next.js backend with `supabaseService` client to enforce auth checks.
