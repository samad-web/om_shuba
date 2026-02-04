
-- Create Offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    discount_amount NUMERIC,
    discount_percentage NUMERIC,
    valid_from DATE NOT NULL,
    valid_to DATE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public read access (for telecallers and initial checks)
CREATE POLICY "Allow public read access" ON public.offers
    FOR SELECT USING (true);

-- Allow authenticated users (Admins) to manage offers
-- Assuming 'admin' and 'branch_admin' roles exist in your users table/metadata
CREATE POLICY "Allow admin manage access" ON public.offers
    FOR ALL USING (true); -- For testing simplicity, we can tighten this later if user roles are strictly in jwt
