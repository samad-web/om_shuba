-- Add sender_branch_id and sender_name columns to branch_messages table
ALTER TABLE public.branch_messages 
ADD COLUMN IF NOT EXISTS sender_branch_id TEXT,
ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Update existing records if possible (best effort, maybe set to 'unknown' or 'admin' if sender_role is admin)
UPDATE public.branch_messages 
SET sender_branch_id = 'admin', sender_name = 'Head Office' 
WHERE sender_role = 'admin';

-- Make them useful but nullable for backward compatibility or general messages
