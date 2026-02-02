import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function totalReset() {
    console.log('--- ADMIN TOTAL RESET ---')
    
    // 1. Delete any old 'admin' in Auth
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const oldAuth = users.find(u => u.email === 'admin@omshuba.internal')
    if (oldAuth) {
        console.log('Cleaning up old Auth record...')
        await supabase.auth.admin.deleteUser(oldAuth.id)
    }

    // 2. Delete any old 'admin' in Database
    console.log('Cleaning up old Database record...')
    await supabase.from('users').delete().eq('username', 'admin')

    // 3. Create NEW perfectly synced Admin
    console.log('Creating fresh Admin account...')
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@omshuba.internal',
        password: 'password', // New Password
        email_confirm: true
    })

    if (authError) throw authError

    const { error: dbError } = await supabase.from('users').insert([{
        id: newUser.user.id, // THE MAGIC LINK: Uses the same ID for both
        username: 'admin',
        role: 'admin',
        name: 'System Admin'
    }])

    if (dbError) console.error('DB Error:', dbError.message)
    else console.log('✅ SUCCESS! You can now log in with "admin" and "password".')
}

totalReset()