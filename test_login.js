import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Testing login with hosur-admin...');

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'hosur-admin')
        .eq('password', 'hosurpass')
        .single();

    if (error) {
        console.error('Login query error:', error);
        console.log('\nThis is likely an RLS (Row Level Security) issue.');
        console.log('The users table needs to allow anonymous SELECT access for login.');
    } else {
        console.log('Login successful! User data:', data);
    }
}

testLogin();
