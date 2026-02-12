import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to:', supabaseUrl);
    try {
        const { data, error } = await supabase
            .from('whatsapp_queue')
            .select('*')
            .limit(5);

        if (error) {
            console.error('Error fetching whatsapp_queue:', error);
        } else {
            console.log('Success! Found', data.length, 'items in whatsapp_queue.');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
