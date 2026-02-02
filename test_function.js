import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFunc() {
    console.log('--- Testing Edge Function: update-staff-auth ---')

    const { data, error } = await supabase.functions.invoke('update-staff-auth', {
        body: {
            userId: 'u6', // Tirupathur Admin
            email: 'admin_tirupathur@omshuba.internal',
            password: 'password123'
        }
    })

    if (error) {
        console.error('Function Call Failed!')
        console.error('Error:', error)
        // If it's a function error, we might get more info from the response
        if (error.context) {
            const body = await error.context.text()
            console.log('Error Body:', body)
        }
    } else {
        console.log('Function Succeeded!')
        console.log('Data:', data)
    }
}

testFunc()
