-- SAFE LOGIN FIX (Non-destructive)
-- This script enables login and data access WITHOUT removing any existing data or policies.
-- It only adds permissions if they are missing.

-- 1. Unblock Login (Users Table)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON users FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 2. Unblock Products (Read Only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON products FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 3. Unblock Enquiries (Read & Write)
DO $$
BEGIN
    -- Read Access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enquiries' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON enquiries FOR SELECT TO anon USING (true);
    END IF;

    -- Write Access (for new leads)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enquiries' 
        AND policyname = 'Allow public write access'
    ) THEN
        CREATE POLICY "Allow public write access" ON enquiries FOR INSERT TO anon WITH CHECK (true);
    END IF;

    -- Update Access (for changing status)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'enquiries' 
        AND policyname = 'Allow public update access'
    ) THEN
        CREATE POLICY "Allow public update access" ON enquiries FOR UPDATE TO anon USING (true);
    END IF;
END $$;

-- 4. Unblock Branches (Read Only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'branches' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON branches FOR SELECT TO anon USING (true);
    END IF;
END $$;
