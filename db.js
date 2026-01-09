const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error acquiring client', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
