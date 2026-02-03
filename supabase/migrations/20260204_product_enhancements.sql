-- Migration: Add enhanced product fields for Catalog
-- Description: Adds image_url and specifications (JSONB) to products table

-- Add image_url column
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add specifications column (JSONB for flexible key-value storage)
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;

-- Comment on columns
COMMENT ON COLUMN products.image_url IS 'URL to the product main image';
COMMENT ON COLUMN products.specifications IS 'Technical specifications as key-value pairs';
