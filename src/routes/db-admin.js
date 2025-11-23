const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../models/db');

// שליפת שמות טבלאות (מותאם ל-PostgreSQL)
router.get('/tables', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.raw(`
            SELECT table_name AS name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);

        res.json(result.rows.map(t => t.name));
    } catch (err) {
        console.error('Error getting tables:', err);
        res.status(500).send('שגיאת שרת');
    }
});

// שליפת תוכן + מבנה של טבלה
router.get('/table/:tableName', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName } = req.params;

        // שליפת תוכן הטבלה
        const data = await db.select('*').from(tableName);

        // שליפת מידע על עמודות
        const columnsResult = await db.raw(`
            SELECT column_name AS name, data_type AS type,
                   column_default LIKE 'nextval%' AS isIdentity,
                   EXISTS (
                       SELECT 1
                       FROM information_schema.table_constraints tc
                       JOIN information_schema.key_column_usage kcu
                       ON tc.constraint_name = kcu.constraint_name
                       WHERE tc.table_name = ? AND kcu.column_name = c.column_name
                       AND tc.constraint_type = 'PRIMARY KEY'
                   ) AS isPrimary
            FROM information_schema.columns c
            WHERE table_name = ?
        `, [tableName, tableName]);

        res.json({
            columns: columnsResult.rows.map(col => ({
                name: col.name,
                type: col.type,
                isPrimary: col.isprimary
            })),
            data
        });
    } catch (err) {
        console.error('Error getting table data:', err);
        res.status(500).send('שגיאת שרת');
    }
});

// מחיקת רשומה לפי מזהה
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

// הוספת רשומה חדשה
router.post('/table/:tableName', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { tableName } = req.params;
        const result = await db(tableName).insert(req.body).returning('id');
        res.json({ success: true, id: result[0] });
    } catch (err) {
        console.error(`Error inserting into ${tableName}:`, err);
        res.status(500).send('שגיאת שרת');
    }
});

module.exports = router;

