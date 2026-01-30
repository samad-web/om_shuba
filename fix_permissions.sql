-- CRITICAL FIX FOR LOGIN ISSUES
-- Run this in Supabase SQL Editor to allow the app to work

-- 1. Enable RLS on all tables (good practice, ensures we control access)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- 2. Create permissive policies for the "Mock Auth" architecture
-- Since the app handles auth internally but uses Supabase as a datastore via the ANON key,
-- we need to allow ANONYMOUS access to these tables.

-- USERS: Allow login checks
DROP POLICY IF EXISTS "Public read access" ON users;
CREATE POLICY "Public read access" ON users FOR SELECT TO anon USING (true);

-- PRODUCTS: Allow fetching products
DROP POLICY IF EXISTS "Public read access" ON products;
CREATE POLICY "Public read access" ON products FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Public write access" ON products;
CREATE POLICY "Public write access" ON products FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access" ON products;
CREATE POLICY "Public update access" ON products FOR UPDATE TO anon USING (true);

-- ENQUIRIES: Allow fetching/creating enquiries
DROP POLICY IF EXISTS "Public read access" ON enquiries;
CREATE POLICY "Public read access" ON enquiries FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Public write access" ON enquiries;
CREATE POLICY "Public write access" ON enquiries FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Public update access" ON enquiries;
CREATE POLICY "Public update access" ON enquiries FOR UPDATE TO anon USING (true);

-- BRANCHES: Allow fetching branches
DROP POLICY IF EXISTS "Public read access" ON branches;
CREATE POLICY "Public read access" ON branches FOR SELECT TO anon USING (true);

-- PROMOTIONS: Allow fetching promotions
DROP POLICY IF EXISTS "Public read access" ON promotions;
CREATE POLICY "Public read access" ON promotions FOR SELECT TO anon USING (true);
