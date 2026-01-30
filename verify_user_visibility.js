import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Attempting to list all users...');

    const { data, error } = await supabase
        .from('users')
        .select('username, role');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data.length} users.`);
        console.log('Users:', data);
    }
}

verify();
