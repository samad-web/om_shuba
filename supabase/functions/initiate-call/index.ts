import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const exotelApiKey = Deno.env.get('EXOTEL_API_KEY')!;
const exotelApiToken = Deno.env.get('EXOTEL_API_TOKEN')!;
const exotelSid = Deno.env.get('EXOTEL_SID')!;
const exotelCallerId = Deno.env.get('EXOTEL_CALLER_ID')!;

interface CallRequest {
    enquiryId?: string;
    customerPhone: string;
    telecallerPhone: string;
    branchId: string;
    callerId: string;
}

serve(async (req) => {
    // CORS headers
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, content-type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { enquiryId, customerPhone, telecallerPhone, branchId, callerId }: CallRequest = await req.json();

        // Validate inputs
        if (!customerPhone || !telecallerPhone || !branchId || !callerId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        console.log('Initiating call:', { enquiryId, customerPhone, telecallerPhone, branchId, callerId });

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Call Exotel API to initiate the call
        const auth = btoa(`${exotelApiKey}:${exotelApiToken}`);
        const formData = new URLSearchParams({
            From: customerPhone,
            To: telecallerPhone,
            CallerId: exotelCallerId,
            CustomField: enquiryId || '',
        });

        const exotelResponse = await fetch(
            `https://api.exotel.com/v1/Accounts/${exotelSid}/Calls/connect.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            }
        );

        const exotelData = await exotelResponse.json();

        if (!exotelResponse.ok) {
            console.error('Exotel API error:', exotelData);
            throw new Error(exotelData.message || 'Exotel API error');
        }

        const callSid = exotelData.Call.Sid;
        console.log('Exotel call initiated:', callSid);

        // Create call log in database
        const { data: callLog, error } = await supabase
            .from('call_logs')
            .insert({
                exotel_call_sid: callSid,
                enquiry_id: enquiryId || null,
                branch_id: branchId,
                caller_id: callerId,
                customer_phone: customerPhone,
                telecaller_phone: telecallerPhone,
                direction: 'outbound',
                status: 'initiated',
                start_time: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            throw error;
        }

        console.log('Call log created:', callLog);

        return new Response(JSON.stringify({
            success: true,
            callLog,
            message: 'Call initiated! You will receive a call shortly.'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    } catch (error) {
        console.error('Call initiation error:', error);
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
});
