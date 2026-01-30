-- SAFE RLS Policy Setup
-- This script only ADDS policies, it does not remove any existing data or tables
-- It uses "IF NOT EXISTS" to avoid errors if policies already exist

-- Note: In production, you should implement proper role-based policies
-- These are permissive policies suitable for development/testing

-- Enquiries table - Allow all operations for authenticated users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enquiries' 
        AND policyname = 'Allow all operations on enquiries'
    ) THEN
        CREATE POLICY "Allow all operations on enquiries" ON enquiries
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Enquiry history table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enquiry_history' 
        AND policyname = 'Allow all operations on enquiry_history'
    ) THEN
        CREATE POLICY "Allow all operations on enquiry_history" ON enquiry_history
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Users table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow all operations on users'
    ) THEN
        CREATE POLICY "Allow all operations on users" ON users
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Products table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Allow all operations on products'
    ) THEN
        CREATE POLICY "Allow all operations on products" ON products
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Branches table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'branches' 
        AND policyname = 'Allow all operations on branches'
    ) THEN
        CREATE POLICY "Allow all operations on branches" ON branches
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Promotions table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'promotions' 
        AND policyname = 'Allow all operations on promotions'
    ) THEN
        CREATE POLICY "Allow all operations on promotions" ON promotions
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- User feedback table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_feedback' 
        AND policyname = 'Allow all operations on user_feedback'
    ) THEN
        CREATE POLICY "Allow all operations on user_feedback" ON user_feedback
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Allow anonymous access for login (since we're not using Supabase Auth)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow anonymous read on users'
    ) THEN
        CREATE POLICY "Allow anonymous read on users" ON users
        FOR SELECT
        TO anon
        USING (true);
    END IF;
END $$;
