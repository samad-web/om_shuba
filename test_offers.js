// Test Offers Functionality
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOffers() {
    console.log('🧪 Testing Offers Functionality...\n');

    // Test 1: Check if offers table exists
    console.log('1️⃣ Checking offers table...');
    const { data: offers, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .limit(5);

    if (fetchError) {
        console.error('❌ Error fetching offers:', fetchError.message);
        return;
    }

    console.log(`✅ Offers table accessible! Found ${offers.length} offers\n`);

    if (offers.length > 0) {
        console.log('📋 Sample offers:');
        offers.forEach((offer, i) => {
            console.log(`\n${i + 1}. ${offer.title}`);
            console.log(`   Description: ${offer.description}`);
            console.log(`   Discount: ${offer.discount_amount ? '₹' + offer.discount_amount : offer.discount_percentage + '%'}`);
            console.log(`   Valid: ${new Date(offer.valid_from).toLocaleDateString()} - ${offer.valid_to ? new Date(offer.valid_to).toLocaleDateString() : 'No end date'}`);
            console.log(`   Status: ${offer.active ? '🟢 Active' : '🔴 Inactive'}`);
        });
    } else {
        console.log('ℹ️  No offers found. You can create offers from the admin dashboard.');
    }

    // Test 2: Check active offers
    console.log('\n\n2️⃣ Checking active offers...');
    const { data: activeOffers, error: activeError } = await supabase
        .from('offers')
        .select('*')
        .eq('active', true);

    if (activeError) {
        console.error('❌ Error:', activeError.message);
        return;
    }

    console.log(`✅ Found ${activeOffers.length} active offers\n`);

    // Test 3: Check product-specific offers
    console.log('3️⃣ Checking product-specific offers...');
    const { data: productOffers, error: productError } = await supabase
        .from('offers')
        .select('*, products(name, sku)')
        .not('product_id', 'is', null);

    if (productError) {
        console.error('❌ Error:', productError.message);
    } else {
        console.log(`✅ Found ${productOffers.length} product-specific offers\n`);
    }

    console.log('\n✨ Offers functionality test complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to http://localhost:5173/owner');
    console.log('   2. Navigate to "Offers" in the sidebar');
    console.log('   3. Click "+ Add Offer" to create a new offer');
    console.log('   4. Test creating, editing, and activating/deactivating offers');
}

testOffers().catch(console.error);
