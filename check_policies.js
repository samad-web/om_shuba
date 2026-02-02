import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
    console.log('--- Database Policy Check ---')

    // Check RLS policies
    const { data: policies, error: polError } = await supabase.rpc('get_policies') // This might not exist, using fallback

    if (polError) {
        console.log('Fetching policies via direct sql check...')
        const { data, error } = await supabase.from('users').select('*').limit(1)
        if (error) console.error('Users table access error (as service role):', error.message)
        else console.log('✅ Service role can access users table.')
    }

    // Check specific admin user role
    const { data: admin, error: adminError } = await supabase.from('users').select('username, role, id').eq('username', 'admin').single()
    if (adminError) console.error('Admin Fetch Error:', adminError.message)
    else console.log('Admin Record:', JSON.stringify(admin, null, 2))
}

checkPolicies()
