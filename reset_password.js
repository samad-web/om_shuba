import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function reset() {
    console.log('--- Resetting Password for admin_tirupathur ---')

    const userId = 'd1f3a578-dbda-4842-bbe6-5159d6d8cbd6'
    const newPassword = 'password'

    const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
    )

    if (error) {
        console.error('Error resetting password:', error.message)
    } else {
        console.log('Successfully reset password for:', data.user.email)
    }
}

reset()
