import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUpdate() {
    console.log('--- Testing Update for admin_tirupathur (u6) ---')

    // We try to update as Service Role first to see if it works at all
    const { data, error } = await supabase
        .from('users')
        .update({
            name: 'Tirupathur Admin (Test Update)',
            branch_id: 'b3'
        })
        .eq('id', 'u6')
        .select()

    if (error) {
        console.error('Update Failed:', error.message)
    } else {
        console.log('Update Succeeded!')
        console.log(JSON.stringify(data, null, 2))
    }
}

testUpdate()
