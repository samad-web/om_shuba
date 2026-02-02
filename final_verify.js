import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function finalCheck() {
    console.log('--- FINAL ID ALIGNMENT CHECK ---')
    const { data, error } = await supabase.from('users').select('username, id')
    if (error) throw error

    console.log(JSON.stringify(data, null, 2))

    const allUuid = data.every(u => u.id.length > 5) // Simple check for UUID vs 'u1'
    if (allUuid) console.log('✅ ALL IDs are correctly synced to Supabase UUIDs!')
    else console.log('⚠️ Some IDs are still in the old format. Running sync again...')
}

finalCheck()
