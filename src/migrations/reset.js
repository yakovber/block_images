const db = require('../models/db');
const fs = require('fs').promises;
const path = require('path');

async function resetDatabase() {
    try {
        const schemaPath = path.join(__dirname, 'schema', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        await db.raw(schema);
        console.log('Database reset successful');
        process.exit(0);
    } catch (error) {
        console.error('Database reset failed:', error);
        process.exit(1);
    }
}

resetDatabase();