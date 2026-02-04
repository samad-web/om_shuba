
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupOffers() {
    console.log('Starting Offers table setup...');

    // Check if table exists first
    const { error: checkError } = await supabase.from('offers').select('id').limit(1);

    if (checkError && (checkError.message.includes('not found') || checkError.message.includes('does not exist'))) {
        console.log('Table missing. Note: You must run the SQL in create_offers_table.sql manually in the Supabase Dashboard SQL Editor.');
        console.log('The Supabase JS client cannot run CREATE TABLE commands directly.');
        console.log('Please copy content of create_offers_table.sql to https://supabase.com dashboard.');
    } else if (!checkError) {
        console.log('Table already exists.');
    } else {
        console.error('Unexpected error checking table:', checkError.message);
    }
}

setupOffers();
