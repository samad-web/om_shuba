import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debug() {
    console.log('--- Auth Debugger ---')

    // 1. Check Public Users Table
    const { data: dbUsers, error: dbError } = await supabase.from('users').select('*')
    console.log('\n--- Database Users (public.users) ---')
    if (dbError) console.error(dbError.message)
    else console.log(JSON.stringify(dbUsers, null, 2))

    // 2. Check Auth Users
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    console.log('\n--- Auth Records (auth.users) ---')
    if (authError) console.error(authError.message)
    else {
        const list = authUsers.map(u => ({ email: u.email, id: u.id }))
        console.log(JSON.stringify(list, null, 2))
    }
}

debug()
