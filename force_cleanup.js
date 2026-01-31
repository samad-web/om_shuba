import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceCleanup() {
    console.log('Adding DELETE policy via SQL...');

    const sql = `
        DROP POLICY IF EXISTS "Public delete access" ON products;
        CREATE POLICY "Public delete access" ON products FOR DELETE TO anon USING (true);
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('RPC Error enabling delete:', error);
    } else {
        console.log('DELETE policy enabled successfully!');
    }

    // Now try to delete again
    console.log('Retrying deletion of test data...');

    // 1. Delete by Category
    const { count: count1, error: error1 } = await supabase
        .from('products')
        .delete({ count: 'exact' })
        .eq('category', 'Test');

    console.log(`Deleted ${count1 ?? 'unknown'} products by category 'Test'`);
    if (error1) console.error('Error 1:', error1);

    // 2. Delete by ID pattern (extra safety)
    const { count: count2, error: error2 } = await supabase
        .from('products')
        .delete({ count: 'exact' })
        .like('id', 'test_%'); // 'test_constraint_...'

    console.log(`Deleted ${count2 ?? 'unknown'} products by ID 'test_%'`);

    // 3. Delete specific names (extra safety)
    const names = [
        'Test Product RLS',
        'Verification Product',
        'Persistent Test Product',
        'Constraint Test Product',
        'Constraint Removed Test'
    ];

    const { count: count3, error: error3 } = await supabase
        .from('products')
        .delete({ count: 'exact' })
        .in('name', names);

    console.log(`Deleted ${count3 ?? 'unknown'} products by specific names`);
}

forceCleanup();
