import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUser() {
    console.log('--- Fixing User admin_tirupathur ---')

    const { data, error } = await supabase
        .from('users')
        .update({
            role: 'branch_admin',
            branch_id: 'b3',
            name: 'Tirupathur Admin'
        })
        .eq('username', 'admin_tirupathur')
        .select()

    if (error) {
        console.error('Error updating user:', error.message)
    } else {
        console.log('Successfully updated user:', JSON.stringify(data, null, 2))
    }
}

fixUser()
