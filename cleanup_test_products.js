import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ksauoylvxyjlhxxuoznp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYXVveWx2eHlqbGh4eHVvem5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc0NTk4MywiZXhwIjoyMDg1MzIxOTgzfQ.ALJgyKhyMGO5WHrc-KXf48L7hF7zAXokCTdPRMNg-nw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanup() {
    console.log('--- Cleaning Up Test Products ---')

    // Find products by name matching
    const testProductNames = ['Verification Product', 'Persistent Test Product', 'Test Product RLS'];

    for (const name of testProductNames) {
        const { data, error } = await supabase
            .from('products')
            .delete()
            .ilike('name', `%${name}%`)
            .select();

        if (error) {
            console.error(`Error deleting ${name}:`, error.message);
        } else {
            console.log(`Successfully deleted ${data?.length || 0} products matching "${name}"`);
            data?.forEach(p => console.log(` - Deleted: ${p.name} (ID: ${p.id})`));
        }
    }
}

cleanup()
