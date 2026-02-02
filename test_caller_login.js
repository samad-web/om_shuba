import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
    console.log('Testing login for caller1@omshuba.internal...')
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'caller1@omshuba.internal',
        password: 'password'
    })

    if (error) {
        console.error('Login Failed:', error.message)
    } else {
        console.log('Login Succeeded!')
        console.log('User ID:', data.user.id)
    }
}

testLogin()
