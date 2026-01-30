-- Add missing columns for Enquiry management

-- Add closed_amount to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS closed_amount NUMERIC;

-- Add notes to enquiry_history table
ALTER TABLE enquiry_history ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create promotions table (if not already created specific to previous instructions, ensuring it exists)
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Policy for promotions
CREATE POLICY "Promotions visible to all authenticated users" ON promotions FOR SELECT TO authenticated USING (true);
