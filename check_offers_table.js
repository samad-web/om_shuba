
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    const { data, error } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true });

    if (error) {
        if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('does not exist')) {
            console.log('TABLE_MISSING');
        } else {
            console.error('Error checking table:', JSON.stringify(error));
        }
    } else {
        console.log('TABLE_EXISTS');
    }
}

checkTable();
