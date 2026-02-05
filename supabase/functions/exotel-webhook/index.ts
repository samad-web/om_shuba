import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
    // CORS headers
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'content-type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const formData = await req.formData();

        // Extract Exotel webhook data
        const callSid = formData.get('CallSid') as string;
        const status = formData.get('Status') as string;
        const duration = formData.get('Duration') as string;
        const recordingUrl = formData.get('RecordingUrl') as string;
        const startTime = formData.get('StartTime') as string;
        const endTime = formData.get('EndTime') as string;
        const dialCallDuration = formData.get('DialCallDuration') as string;
        const dialCallStatus = formData.get('DialCallStatus') as string;

        console.log('📞 Exotel webhook received:', {
            callSid,
            status,
            dialCallStatus,
            duration: dialCallDuration || duration
        });

        if (!callSid) {
            return new Response(JSON.stringify({ error: 'Missing CallSid' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Map Exotel status to our status
        const statusMap: Record<string, string> = {
            'in-progress': 'in-progress',
            'completed': 'completed',
            'busy': 'busy',
            'failed': 'failed',
            'no-answer': 'no-answer',
            'canceled': 'failed',
        };

        // Use DialCallStatus if available (more accurate for the actual call leg)
        const actualStatus = dialCallStatus || status;
        const mappedStatus = statusMap[actualStatus] || actualStatus;

        // Prepare update data
        const updateData: any = {
            status: mappedStatus,
            updated_at: new Date().toISOString(),
        };

        // Only update duration if call completed
        if (dialCallDuration || duration) {
            updateData.duration = parseInt(dialCallDuration || duration || '0');
        }

        // Add recording URL if available
        if (recordingUrl) {
            updateData.recording_url = recordingUrl;
        }

        // Add timestamps if available
        if (startTime) {
            updateData.start_time = new Date(startTime).toISOString();
        }
        if (endTime) {
            updateData.end_time = new Date(endTime).toISOString();
        }

        // Update call log in database
        const { data, error } = await supabase
            .from('call_logs')
            .update(updateData)
            .eq('exotel_call_sid', callSid)
            .select()
            .single();

        if (error) {
            console.error('❌ Database update error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        console.log('✅ Call log updated:', data?.id, mappedStatus);

        return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
