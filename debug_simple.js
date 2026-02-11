
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debug() {
    console.log('--- QUEUE ITEMS ---');
    const { data: queue } = await supabase.from('whatsapp_queue').select('id, phone_number, status, enquiry_id');
    console.log(queue);

    console.log('\n--- ADMIN USERS ---');
    const { data: users } = await supabase.from('users').select('username, role, name').neq('role', 'telecaller');
    console.log(users);
}

debug();
