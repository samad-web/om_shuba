import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { userId, email, password } = await req.json()

        console.log(`Syncing Auth for: ${email}`);

        // 1. Check if user already exists in Auth by their email
        const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers()
        if (listError) throw listError

        const existingUser = users.find(u => u.email === email)

        if (existingUser) {
            // 2. Update existing user
            console.log(`Updating existing Auth user: ${existingUser.id}`);
            const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
                existingUser.id,
                { password: password, email_confirm: true }
            )
            if (updateError) throw updateError
        } else {
            // 3. Create new user if they don't exist
            console.log("Creating new Auth user...");
            const { error: createError } = await supabaseClient.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: { source: 'staff_management', db_id: userId }
            })
            if (createError) throw createError
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Function error:", error.message);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || "Unknown error occurred in Edge Function"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
