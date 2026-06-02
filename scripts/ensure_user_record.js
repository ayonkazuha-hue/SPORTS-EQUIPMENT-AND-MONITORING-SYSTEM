// scripts/ensure_user_record.js
// Ensure a users table record exists for a Supabase auth user

const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node scripts/ensure_user_record.js <email> [full_name]');
        process.exit(1);
    }
    const email = args[0];
    const fullName = args[1] || '';

    try {
        // Try to find auth user by email
        let userId = null;
        try {
            const res = await supabaseAdmin.auth.admin.getUserByEmail(email);
            if (res.error) {
                console.warn('Warning fetching auth user:', res.error.message || res.error);
            } else if (res.user) {
                userId = res.user.id;
            }
        } catch (e) {
            console.warn('getUserByEmail not available or failed:', e.message || e);
        }

        // If we didn't get userId, try to query users table by email
        if (!userId) {
            const { data: existing, error } = await supabaseAdmin
                .from('users')
                .select('user_id')
                .eq('email', email)
                .limit(1);
            if (error) {
                console.error('Error checking users table:', error.message || error);
                process.exit(1);
            }
            if (existing && existing.length > 0) {
                console.log('User record already exists with user_id:', existing[0].user_id);
                process.exit(0);
            }
            // No auth id and no users table entry, generate a new user id
            userId = `USR-${uuidv4().slice(0,8)}`;
        }

        // Insert into users table if not exists
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert([{ user_id: userId, username: email.split('@')[0], email, full_name: fullName, role: 'User', is_active: true }])
            .select();

        if (error) {
            console.error('Failed to insert/upsert into users table:', error.message || error);
            process.exit(1);
        }

        console.log('User record ensured. user_id:', userId);
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err.message || err);
        process.exit(1);
    }
}

main();
