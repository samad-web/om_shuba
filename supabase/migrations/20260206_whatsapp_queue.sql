-- Create WhatsApp Queue Table for Automated Sales Messages
-- Phase 2: Sales Completion Flow

CREATE TABLE IF NOT EXISTS whatsapp_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id TEXT REFERENCES enquiries(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_text TEXT NOT NULL,
    media_url TEXT,
    status TEXT CHECK (status IN ('draft', 'queued', 'sent', 'failed')) DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for n8n/System lookup
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_enquiry ON whatsapp_queue(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_status ON whatsapp_queue(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_scheduled ON whatsapp_queue(scheduled_at);

-- Enable RLS
ALTER TABLE whatsapp_queue ENABLE ROW LEVEL SECURITY;

-- Admins can manage all queue items
CREATE POLICY "Admins can manage whatsapp queue"
    ON whatsapp_queue FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- Telecallers can view their own enquiries' queue items
CREATE POLICY "Telecallers can view their enquiry queues"
    ON whatsapp_queue FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM enquiries
            WHERE enquiries.id = whatsapp_queue.enquiry_id
            AND enquiries.created_by = auth.uid()::text
        )
    );
