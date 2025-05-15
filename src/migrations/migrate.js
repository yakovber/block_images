const fs = require('fs').promises;
const path = require('path');
const db = require('../models/db');

async function runMigrations() {
    try {
        // Read schema.sql first
        const schemaPath = path.join(__dirname, 'schema', 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await db.raw(schema);
        console.log('Schema created successfully');

        // Read and execute all migration files in order
        const migrationsPath = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsPath);
        
        for (const file of files.sort()) {
            if (file.endsWith('.sql')) {
                const migration = await fs.readFile(path.join(migrationsPath, file), 'utf8');
                await db.raw(migration);
                console.log(`Migration ${file} executed successfully`);
            }
        }

        console.log('All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();