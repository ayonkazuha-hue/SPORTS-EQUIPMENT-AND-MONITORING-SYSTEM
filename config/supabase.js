// config/supabase.js
// Supabase Client Configuration

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration');
    console.error('   Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

// Create Supabase client (Anon key for user operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// Create Supabase admin client (Service role key for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test connection
async function testConnection() {
    try {
        const { data, error } = await supabase.from('equipment').select('count', { count: 'exact' });
        if (error && error.code !== 'PGRST116') {
            console.error('❌ Supabase connection error:', error.message);
            return false;
        }
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Supabase connection failed:', err.message);
        return false;
    }
}

// Run test on module load
testConnection();

module.exports = {
    supabase,
    supabaseAdmin,
    testConnection
};
