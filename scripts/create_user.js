// scripts/create_user.js
// Create a Supabase auth user (admin) and insert into users table

const { supabaseAdmin } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node scripts/create_user.js <email> <password> [full_name]');
        process.exit(1);
    }
    const email = args[0];
    const password = args[1];
    const fullName = args[2] || '';

    try {
        // Create auth user via Supabase admin
        const res = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (res.error) {
            // Supabase client sometimes wraps error differently
            console.error('Auth creation error:', res.error.message || res.error);
            process.exit(1);
        }

        const user = res.user || res.data;
        const userId = user?.id || `USR-${uuidv4().slice(0,8)}`;

        // Insert into users table
        const insertRes = await supabaseAdmin
            .from('users')
            .insert([{ user_id: userId, username: email.split('@')[0], email, full_name: fullName, role: 'User' }])
            .select();

        if (insertRes.error) {
            console.error('Failed to insert into users table:', insertRes.error.message || insertRes.error);
            process.exit(1);
        }

        console.log('User created successfully (auth + users table).');
        console.log('Email:', email);
        console.log('Username:', email.split('@')[0]);
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err.message || err);
        process.exit(1);
    }
}

main();
