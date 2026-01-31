-- RUN THIS IN SUPABASE SQL EDITOR

ALTER TABLE public.branch_messages
ADD COLUMN IF NOT EXISTS sender_branch_id TEXT;

-- Optional: Update existing records to have a default if needed, 
-- but since we can't easily know who sent old messages without logs, we leave it NULL.
