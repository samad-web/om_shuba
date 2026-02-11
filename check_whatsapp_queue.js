
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQueue() {
    console.log("Checking whatsapp_queue table...");
    const { data, error } = await supabase
        .from('whatsapp_queue')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching queue:", error);
    } else {
        console.log(`Found ${data.length} messages in queue.`);
        data.forEach(item => {
            console.log(`- ID: ${item.id}, Phone: ${item.phone_number}, Status: ${item.status}, Created: ${item.created_at}`);
        });
    }
}

checkQueue();
