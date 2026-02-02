import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
    console.log('--- Checking "users" table columns ---')
    // We can't easily list columns via JS without RPC or information_schema
    // But we can try to fetch a record and see the keys
    const { data, error } = await supabase.from('users').select('*').limit(1)

    if (error) {
        console.error('Error fetching user:', error.message)
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).join(', '))
    } else {
        console.log('No data found in users table.')
    }
}

checkSchema()
