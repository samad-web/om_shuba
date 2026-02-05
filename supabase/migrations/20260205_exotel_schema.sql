-- Exotel Integration Schema
-- Phase 2: Call Management System

-- Step 1: Add phone number to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Step 2: Create Call Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exotel_call_sid TEXT UNIQUE NOT NULL,
    enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    caller_id TEXT NOT NULL REFERENCES users(id),
    customer_phone TEXT NOT NULL,
    telecaller_phone TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    status TEXT NOT NULL CHECK (status IN ('initiated', 'ringing', 'in-progress', 'completed', 'missed', 'busy', 'failed', 'no-answer')),
    duration INTEGER DEFAULT 0,
    recording_url TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    cost DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_enquiry ON call_logs(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_branch ON call_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller ON call_logs(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_exotel_sid ON call_logs(exotel_call_sid);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);

-- Enable RLS
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin can see all calls
CREATE POLICY "Admins can view all call logs"
    ON call_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- Branch admins can see their branch calls
CREATE POLICY "Branch admins can view their branch call logs"
    ON call_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.branch_id = call_logs.branch_id
        )
    );

-- Telecallers can see their own calls
CREATE POLICY "Telecallers can view their own call logs"
    ON call_logs FOR SELECT
    TO authenticated
    USING (caller_id = auth.uid()::text);

-- Staff can insert calls they make
CREATE POLICY "Staff can create call logs"
    ON call_logs FOR INSERT
    TO authenticated
    WITH CHECK (caller_id = auth.uid()::text);

-- System/webhook can update calls
CREATE POLICY "System can update call logs"
    ON call_logs FOR UPDATE
    TO authenticated
    USING (true);

-- Step 3: Add call statistics to enquiries
ALTER TABLE enquiries
ADD COLUMN IF NOT EXISTS total_calls INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_call_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_call_duration INTEGER DEFAULT 0;

-- Step 4: Create trigger to update enquiry call stats
CREATE OR REPLACE FUNCTION update_enquiry_call_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enquiry_id IS NOT NULL AND NEW.status = 'completed' THEN
        UPDATE enquiries
        SET 
            total_calls = COALESCE(total_calls, 0) + 1,
            last_call_date = NEW.end_time,
            last_call_duration = NEW.duration
        WHERE id = NEW.enquiry_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_enquiry_call_stats
AFTER UPDATE ON call_logs
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
EXECUTE FUNCTION update_enquiry_call_stats();

-- Step 5: Create function to get call history for an enquiry
CREATE OR REPLACE FUNCTION get_enquiry_call_history(enquiry_uuid UUID)
RETURNS TABLE (
    call_id UUID,
    call_sid TEXT,
    caller_name TEXT,
    customer_phone TEXT,
    status TEXT,
    duration INTEGER,
    recording_url TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.exotel_call_sid,
        u.name,
        cl.customer_phone,
        cl.status,
        cl.duration,
        cl.recording_url,
        cl.start_time,
        cl.end_time
    FROM call_logs cl
    JOIN users u ON cl.caller_id = u.id
    WHERE cl.enquiry_id = enquiry_uuid
    ORDER BY cl.created_at DESC;
END;
$$ LANGUAGE plpgsql;
