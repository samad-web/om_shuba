import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAuth() {
    console.log('--- Checking Admin Auth Record ---')
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error listing users:', error.message)
    } else {
        const admin = users.find(u => u.email === 'admin@omshuba.internal')
        if (admin) {
            console.log(JSON.stringify({
                id: admin.id,
                email: admin.email,
                role: admin.role,
                aud: admin.aud
            }, null, 2))
        } else {
            console.log('Admin not found by email in Auth.')
        }
    }
}

checkAuth()
