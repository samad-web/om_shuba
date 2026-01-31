-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.branch_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_role TEXT NOT NULL,
    target_branch_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- 2. Enable RLS
ALTER TABLE public.branch_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Permissive for specific roles ideally, but using ANON for now as per app pattern)
-- Allow anyone to read (filtering happens in app logic for now / or we add specific policies)
CREATE POLICY "Enable read access for all users" ON "public"."branch_messages"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Allow anyone to insert
CREATE POLICY "Enable insert for all users" ON "public"."branch_messages"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Allow updates (for marking read)
CREATE POLICY "Enable update for all users" ON "public"."branch_messages"
AS PERMISSIVE FOR UPDATE
TO public
USING (true);

-- 4. Realtime (Optional, if you want live updates)
-- ALTER PUBLICATION supabase_realtime ADD TABLE branch_messages;
