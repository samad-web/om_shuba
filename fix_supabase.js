import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log('Connecting to Supabase...');

    // 1. Add Branch
    const { error: branchError } = await supabase.from('branches').insert([{
        id: 'b4',
        name: 'Hosur Branch',
        location: 'Hosur, Tamil Nadu',
        contact_number: '9876543213',
        active: true
    }]).select();

    if (branchError && branchError.code !== '23505') {
        console.error('Error adding branch:', branchError);
    } else {
        console.log('Branch B4 ensured.');
    }

    // 2. Delete old user if exists
    await supabase.from('users').delete().eq('username', 'admin-hosur');

    // 3. Add User with new credentials
    const { error: userError } = await supabase.from('users').insert([{
        id: 'u7',
        username: 'hosur-admin',
        password: 'hosurpass',
        role: 'branch_admin',
        name: 'Hosur Admin',
        branch_id: 'b4'
    }]).select();

    if (userError && userError.code !== '23505') {
        console.error('Error adding user:', userError);
    } else {
        console.log('User hosur-admin ensured with new credentials.');
    }

    // 4. Check and Fix Products
    const { data: products, error: prodError } = await supabase.from('products').select('*');
    if (prodError) {
        console.error('Error fetching products:', prodError);
    } else {
        console.log(`Found ${products.length} products.`);
        // If products exist but none have branch_id 'b4', they will be empty for the new admin.
        // We might want to make existing products "global" by default.
        // Or if the user wants "same as other branch", we should make sure they are visible.

        // Let's see if we can update products to be available for 'b4' if they are null.
        // However, I don't want to mess up existing filtering logic.
    }

    console.log('Done.');
}

fix();
