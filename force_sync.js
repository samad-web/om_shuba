import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function masterSync() {
    console.log('--- MASTER STAFF SYNCHRONIZER ---')

    // 1. Get all users from your DATABASE
    console.log('Fetching database users...')
    const { data: dbUsers, error: dbError } = await supabase.from('users').select('*')
    if (dbError) throw dbError

    // 2. Get all users from AUTH
    console.log('Fetching auth accounts...')
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    console.log(`Status: ${dbUsers.length} in DB, ${authUsers.length} in Auth.`)

    for (const dbUser of dbUsers) {
        const email = `${dbUser.username}@omshuba.internal`
        const authAccount = authUsers.find(u => u.email === email)

        if (!authAccount) {
            console.log(`Creating missing account for: ${dbUser.username}...`)
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: 'password', // Default password
                email_confirm: true,
                user_metadata: { source: 'master_sync' }
            })

            if (createError) {
                console.error(`❌ Failed to create ${dbUser.username}:`, createError.message)
                continue
            }

            // Update the DATABASE record with our NEW Auth ID
            console.log(`Linking DB record ${dbUser.id} to new Auth ID...`)
            await supabase.from('users').update({ id: newUser.user.id }).eq('username', dbUser.username)
            console.log(`✅ Success: ${dbUser.username} is now ready for login.`)
        } else {
            // Even if they exist, make sure the IDs match
            if (dbUser.id !== authAccount.id) {
                console.log(`Fixing ID mismatch for: ${dbUser.username}...`)
                await supabase.from('users').update({ id: authAccount.id }).eq('username', dbUser.username)
                console.log(`✅ Success: ${dbUser.username} ID corrected.`)
            } else {
                console.log(`- ${dbUser.username} already perfectly synced.`)
            }
        }
    }
    console.log('\n--- MASTER SYNC COMPLETE! ---')
    console.log('All staff can now log in with their username and "password".')
}

masterSync()
