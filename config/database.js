// config/database.js
// Database Configuration - Supports MySQL and Supabase

require('dotenv').config();

const databaseType = process.env.DATABASE_TYPE || 'mysql';

let database;

if (databaseType === 'supabase') {
    // Supabase Configuration
    const { supabase, supabaseAdmin } = require('./supabase');
    database = {
        client: supabase,
        admin: supabaseAdmin,
        type: 'supabase',
        isSupabase: true
    };
    console.log('✅ Database: Supabase (PostgreSQL)');
} else {
    // MySQL Configuration
    const mysql = require('mysql2/promise');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sports_equipment_system',
        waitForConnections: true,
        connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
        queueLimit: 0
    });

    // Test MySQL connection
    pool.getConnection()
        .then(connection => {
            console.log('✅ Database: MySQL connected successfully');
            connection.release();
        })
        .catch(err => {
            console.error('❌ Database connection failed:', err.message);
        });

    database = {
        pool,
        type: 'mysql',
        isSupabase: false
    };
}

module.exports = database;
