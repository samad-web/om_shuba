import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRole() {
    console.log('--- Checking Role for admin_tirupathur ---')

    // Check public.users table
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'admin_tirupathur')
        .single()

    if (error) {
        console.error('Error fetching user:', error.message)
    } else {
        console.log('User Record:', JSON.stringify(user, null, 2))
    }
}

checkRole()
