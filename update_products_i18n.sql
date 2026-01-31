-- Add Tamil localization columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS name_ta TEXT,
ADD COLUMN IF NOT EXISTS category_ta TEXT,
ADD COLUMN IF NOT EXISTS short_description_ta TEXT;
