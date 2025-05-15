const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../models/db');
const { logActivity } = require('../utils/activity_logs');
const wsService = require('../services/config/websocket');

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await db('users')
            .select('email', 'isadmin', 'created_at')
            .orderBy('created_at', 'desc');

        res.json(users);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ error: 'שגיאה בקבלת המשתמשים' });
    }
});

router.post('/toggle-admin', authenticateToken, requireAdmin, async (req, res) => {
    const { email } = req.body;


    try {
        await db.transaction(async trx => {
            const user = await trx('users').where({ email }).first();
            if (!user) {
                throw new Error('המשתמש לא נמצא');
            }

            const isAdmin = await trx('users')
                .where({ email })
                .select('isadmin')
                .first();

         await trx('users')
                .where({ email })
                .update({ isadmin: !isAdmin.isadmin });

            await logActivity(email, 'toggle_admin', { email }, trx);
        });

        res.json({ success: true, message: 'המשתמש עודכן בהצלחה' });
    } catch (err) {
        console.error('Error in toggle-admin:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/approve', authenticateToken, requireAdmin, async (req, res) => {
    const { url, imageId } = req.body;
    const email = req.user.email;
    
    try {
        await db.transaction(async trx => {
            const pendingRequest = await trx('pending_images')
                .where({ url })
                .first();
                
            if (!pendingRequest) {
                throw new Error('הבקשה לא נמצאה');
            }

            await trx('global_blocked').insert({
                url,
                image_id: imageId,
                email: pendingRequest.email,
                created_at: new Date(),
                status: 'approved'
            });

            await trx('pending_images')
                .where({ url })
                .del();

            await logActivity(email, 'approve', { url, imageId }, trx);
        });
        
        res.json({ success: true, message: 'הבקשה אושרה בהצלחה' });
    } catch (err) {
        console.error('Error in approve:', err);
        res.status(500).json({ success: false, message: err.message });
    }
            wsService.broadcastRefresh();
});

router.post('/reject', authenticateToken, requireAdmin, async (req, res) => {
    const { url, removePersonal } = req.body;
    const email = req.user.email;
    
    try {
        await db.transaction(async trx => {
            const pendingRequest = await trx('pending_images')
                .where({ url })
                .first();
                
            if (!pendingRequest) {
                throw new Error('הבקשה לא נמצאה');
            }

            await trx('pending_images')
                .where({ url })
                .del();
            
            if (removePersonal) {
                await trx('blocked')
                    .where({ url })
                    .del();
            }

           await logActivity(email, 'reject', { url, removePersonal }, trx);
        });
        
        res.json({ success: true, message: 'הבקשה נדחתה בהצלחה' });
    } catch (err) {
        console.error('Error in reject:', err);
        res.status(500).json({ success: false, message: err.message });
    }
            wsService.broadcastRefresh();
});

router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
         await db.transaction(async trx => {
        const pendingRequests = await db('pending_images')
            .join('pixelated_images', 'pixelated_images.image_id', 'pending_images.image_id')
            .select('pending_images.url', 'pending_images.image_id','pending_images.image_filename', 'pixelated_images.pixelated_filename', 'pending_images.email', 'pending_images.created_at')
            .orderBy('pending_images.created_at', 'desc');
            console.log(pendingRequests);
        res.json(pendingRequests);
        });
    } catch (err) {
        console.error('Error getting pending requests:', err);
        res.status(500).json({ error: 'שגיאה בקבלת הבקשות הממתינות' });
    }
    
});

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const stats = await db.transaction(async trx => {
            const [
                totalUsers,
                totalAdmins,
                totalBlocked,
                totalPending,
                totalGlobal
            ] = await Promise.all([
                trx('users').count('* as count').first(),
                trx('users').where('isadmin', true).count('* as count').first(),
                trx('blocked').count('* as count').first(),
                trx('pending_images').count('* as count').first(),
                trx('global_blocked').count('* as count').first()
            ]);

            return {
                users: totalUsers.count,
                admins: totalAdmins.count,
                blocked: totalBlocked.count,
                pending: totalPending.count,
                global: totalGlobal.count
            };
        });

        console.log('Stats:', stats);
        res.json(stats);
    } catch (err) {
        console.error('Error getting stats:', err);
        res.status(500).json({ error: 'שגיאה בקבלת הסטטיסטיקות' });
    }
});
router.get('/global-blocked', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const globalBlocked = await db('global_blocked')
            .select('url', 'image_id', 'created_at')
            .orderBy('created_at', 'desc');

        res.json(globalBlocked);
    } catch (err) {
        console.error('Error getting global blocked:', err);
        res.status(500).json({ error: 'שגיאה בקבלת החסימות הגלובליות' });
    }
});
router.post('/remove_global_block', authenticateToken, requireAdmin, async (req, res) => {
    const { url } = req.body;
    const email = req.user.email;

    try {
         await db.transaction(async trx => {
        await db('global_blocked')
            .where({ url })
            .del();
        await db('blocked')
            .where({ url })
            .del();

        await logActivity(email, 'remove_global_block', { url }, trx);
        res.json({ success: true, message: 'החסימה הוסרה בהצלחה' });
        });
   
        } catch (err) {
        console.error('Error in remove_global_block:', err);
        res.status(500).json({ success: false, message: err.message });
    }
            wsService.broadcastRefresh();
});

router.get('/activity', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const activities = await db('activity_log')
            .select('email', 'action', 'details', 'created_at')
            .orderBy('created_at', 'desc');

        res.json(activities);
    } catch (err) {
        console.error('Error getting activity log:', err);
        res.status(500).json({ error: 'שגיאה בקבלת יומן הפעילות' });
    }
});


module.exports = router;