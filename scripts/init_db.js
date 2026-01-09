const { pool } = require('../db');
const fs = require('fs').promises;
const path = require('path');

async function initDb() {
    try {
        console.log('🔄 Initializing Database...');

        const schemaPath = path.join(__dirname, '../schema.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');

        console.log('📄 Reading schema.sql...');

        // Execute the schema SQL
        await pool.query(schemaSql);

        console.log('✅ Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

initDb();
