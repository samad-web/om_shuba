import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    console.log('Checking status of test products...');

    const names = [
        'Verification Product',
        'Persistent Test Product',
        'Test Product RLS'
    ];

    const { data, error } = await supabase
        .from('products')
        .select('id, name, active, branch_id')
        .in('name', names);

    if (error) {
        console.error('Error fetching:', error);
    } else {
        console.log('Found products:', data);
    }
}

checkStatus();
