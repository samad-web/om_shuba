import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDU5ODMsImV4cCI6MjA4NTMyMTk4M30.qv45cwD4ftRta2Ptvd-aQCSBDrEBXxCsOSho_sAWhOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLS() {
    console.log('Applying RLS policy for anonymous login access...');

    // This SQL creates a policy that allows anonymous users to SELECT from the users table
    // This is necessary for login to work since we're not using Supabase Auth
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE tablename = 'users' 
                    AND policyname = 'Allow anonymous read on users'
                ) THEN
                    CREATE POLICY "Allow anonymous read on users" ON users
                    FOR SELECT
                    TO anon
                    USING (true);
                END IF;
            END $$;
        `
    });

    if (error) {
        console.error('Error applying RLS policy:', error);
        console.log('\nYou need to run this SQL manually in Supabase SQL Editor:');
        console.log(`
CREATE POLICY "Allow anonymous read on users" ON users
FOR SELECT
TO anon
USING (true);
        `);
    } else {
        console.log('RLS policy applied successfully!');
    }

    // Test login again
    console.log('\nTesting login...');
    const { data, error: loginError } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'hosur-admin')
        .eq('password', 'hosurpass')
        .single();

    if (loginError) {
        console.error('Login still failing:', loginError);
    } else {
        console.log('✅ Login successful! User:', data.name);
    }
}

fixRLS();
