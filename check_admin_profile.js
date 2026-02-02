import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
    console.log('--- Checking for "admin" in users table ---')
    const { data, error } = await supabase.from('users').select('username').eq('username', 'admin')

    if (error) console.error(error.message)
    else if (data.length === 0) console.log('❌ "admin" NOT found in users table!')
    else console.log('✅ "admin" found in users table.')
}

checkUser()
