const knex = require('knex');
const config = require('../../config/default');

const db = knex({
    client: config.DATABASE.client,
    connection: config.DATABASE.connection,
    pool: config.DATABASE.pool
});

// Add error handling
db.raw('SELECT 1')
    .then(() => {
        console.log('Database connection successful');
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

module.exports = db;
