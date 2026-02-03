-- Phase 2 Schema Updates

-- 1. Create Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_amount NUMERIC,
    discount_percentage NUMERIC,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    product_id TEXT REFERENCES products(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Phase 2 columns to Enquiries
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS call_id TEXT,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS call_type TEXT CHECK (call_type IN ('Sales', 'Service')),
ADD COLUMN IF NOT EXISTS warranty_check BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS complaint_notes TEXT,
ADD COLUMN IF NOT EXISTS warranty_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warranty_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES offers(id);

-- 3. Create WhatsApp Content Table (for Community Updates)
CREATE TABLE IF NOT EXISTS whatsapp_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    scheduled_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES users(id)
);

-- 4. Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_content ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Offers: All authenticated users can view, only admins can manage
CREATE POLICY "Offers are viewable by all authenticated users" ON offers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage offers" ON offers
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
    );

-- WhatsApp Content: Only admins can manage
CREATE POLICY "Admins can manage whatsapp content" ON whatsapp_content
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
    );

-- Enquiries update policy (already exists probably, but ensure it handles new columns)
-- Supabase handles column-level permissions via RLS on the whole row generally.
