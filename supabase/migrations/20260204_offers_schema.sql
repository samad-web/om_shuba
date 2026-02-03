-- Migration: Create Offers Table
-- Description: Stores special offers and discounts that can be linked to enquiries

CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_amount NUMERIC,
    discount_percentage NUMERIC,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_to TIMESTAMP WITH TIME ZONE,
    product_id TEXT REFERENCES products(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON offers
    FOR SELECT USING (TRUE);

CREATE POLICY "Enable write access for admins only" ON offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Comment on table
COMMENT ON TABLE offers IS 'Promotional offers and discounts';
