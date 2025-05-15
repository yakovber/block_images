const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../models/db');

router.get('/tables', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const tables = await db.raw(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `);
        
        res.json(tables.map(t => t.name));
    } catch (err) {
        console.error('Error getting tables:', err);
        res.status(500).send('שגיאת שרת');
    }
});

router.get('/table/:tableName', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName } = req.params;
        const data = await db(tableName).select('*');
        const columns = await db.raw(`PRAGMA table_info(${tableName})`);
        
        res.json({
            columns: columns.map(col => ({
                name: col.name,
                type: col.type,
                isPrimary: col.pk === 1
            })),
            data
        });
    } catch (err) {
        console.error('Error getting table data:', err);
        res.status(500).send('שגיאת שרת');
    }
});

router.delete('/table/:tableName/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName, id } = req.params;
        await db(tableName).where({ id }).del();
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting record:', err);
        res.status(500).send('שגיאת שרת');
    }
});

router.post('/table/:tableName', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName } = req.params;
        const result = await db(tableName).insert(req.body);
        res.json({ success: true, id: result[0] });
    } catch (err) {
        console.error(`Error inserting into ${tableName}:`, err);
        res.status(500).send('שגיאת שרת');
    }
});

module.exports = router;