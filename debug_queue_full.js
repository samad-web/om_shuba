
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugQueue() {
    console.log('--- Checking all records in whatsapp_queue ---');
    const { data: queue, error: qError } = await supabase.from('whatsapp_queue').select('*');
    if (qError) console.error('Queue error:', qError);
    else console.log('Queue contents:', JSON.stringify(queue, null, 2));

    console.log('\n--- Checking all users and roles ---');
    const { data: users, error: uError } = await supabase.from('users').select('*');
    if (uError) console.error('Users error:', uError);
    else console.log('Users:', JSON.stringify(users, null, 2));
}

debugQueue();
