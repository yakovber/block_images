const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { processImage , getImageAsBase64} = require('../services/imageProcess');
const db = require('../models/db');
//const wsService = require('../services/config/websocket');
const {broadcastUpdate} = require('../services/websocket');
//const { emitDataChanged} = require('../services/refresh-blocks');
const { logActivity } = require('../utils/activity_logs');



router.post('/block', authenticateToken, async (req, res) => {
    const { url, imageData } = req.body;
    const email = req.user.email;
    
    try {
        const exists = await db('blocked').where({ email, url }).first();
        if (exists) {
            return res.json({ success: true, message: 'כבר חסום' });
        }

        if (!imageData) {
            return res.status(400).json({ success: false, message: 'חסר מידע של תמונה' });
        }

        const { filename, imageId, pixelatedFilename } = 
            await processImage(imageData, __dirname);

        await db('pixelated_images').insert({
            image_id: imageId,
            original_filename: filename,
            pixelated_filename: `pixelated/${pixelatedFilename}`
        });

        await db('blocked').insert({ 
            email, 
            url, 
            image_id: imageId,
            image_filename: filename
        });

     
        
        res.json({ success: true, message: 'נחסם', imageId });
    } catch (err) {
        console.error('Error in /block:', err);
        res.status(500).json({ success: false, message: 'שגיאת שרת' });
    }
});

router.get('/blocked', authenticateToken, async (req, res) => {
    try {
        const blocked = await db('blocked')
            .where({ email: req.user.email })
            .select('url', 'image_id', 'image_filename', 'created_at');
            
        const global = await db('global_blocked')
            .select('url', 'image_id', 'created_at');
            
        res.json([...blocked, ...global]);
    } catch (err) {
        console.error('Error getting blocked:', err);
        res.status(500).json({ error: 'שגיאה בקבלת חסימות' });
    }
});

router.post('/request-global', authenticateToken, async (req, res) => {
    const { url, imageData } = req.body;
    const email = req.user.email;
    
    try {
        const exists = await db('pending_images').where({ url }).first();
        if (exists) {
            return res.json({ success: true, message: 'כבר קיימת בקשה' });
        }

        const globalExists = await db('global_blocked').where({ url }).first();
        if (globalExists) {
            return res.json({ success: true, message: 'כבר חסום גלובלית' });
        }

        if (!imageData) {
            return res.status(400).json({ success: false, message: 'חסר מידע של תמונה' });
        }

     const { filename, imageId, pixelatedFilename } = 
            await processImage(imageData, __dirname);

        await db('pending_images').insert({ 
            url,
            image_id: imageId,
            image_filename: filename,
            email,
            status: 'pending'
        });
         await db('pixelated_images').insert({
            image_id: imageId,
            original_filename: filename,
            pixelated_filename: pixelatedFilename
        });
        await db('blocked').insert({ 
            email, 
            url, 
            image_id: imageId,
            image_filename: filename
        });
        
       broadcastUpdate('refresh-blocks')
        res.json({ success: true, message: 'הבקשה התקבלה', imageId ,filename, imageId, pixelatedFilename , filename});

        //WebSocketService.broadcastRefresh();
    } catch (err) {
        console.error('Error in /request-global:', err);
        res.status(500).json({ success: false, message: 'שגיאת שרת' });
    }

});

router.get('/pixelated/:imageId', async (req, res) => {
    const imageId = req.params.imageId;
   
    const email = req.query.email;
    
    try {
   

       const pixelatedImage = await db('pixelated_images')
            .select('image_id')
            .where({ image_id: imageId })
            .first();
        
        
       const globalBlocked = await db('global_blocked')
            .select('image_id')
            .where({ image_id: imageId })
            .first();

        if (!pixelatedImage&&!globalBlocked) {
            return res.status(404).json({ 
                success: false, 
                message: 'תמונה מפוקסלת לא נמצאה' 
            });
        }

   

const imagePath = path.join(__dirname, './pending_images/pixelated', `${imageId}.png`);
    
const base64 = await getImageAsBase64(imagePath);

//res.json( JSON.stringify(base64));
res.sendFile(imagePath)
    } catch (err) {
        console.error('Error in /pixelated:', err);
        res.status(500).json({ 
            success: false, 
            message: 'שגיאת שרת בקבלת תמונה מפוקסלת' 
        });
    }
});

router.get('/original-images/:imageId',  async (req, res) => {
  
    const { imageId } = req.params;

    try {
        const originalImages = await db('blocked')
            .where({ image_id: imageId })
            .select('image_filename');
        console.log('originalImages:', originalImages);
        
        if (!originalImages || originalImages.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'תמונה מקורית לא נמצאה' 
            });
        }

        const imagePath = path.join(__dirname, './pending_images', `${originalImages[0].image_filename}`);
        res.sendFile(imagePath);
    } catch (err) {
        console.error('Error getting original images:', err);
        res.status(500).json({ error: 'שגיאה בקבלת התמונות המקוריות' });
    }
});

router.get('/', async (req, res) => {
try{res.send("hello")}catch{res.status(500)}
});
router.get('/robot_test', async (req, res) => {
try{res.send(`<p>nsfw</p>`)}catch{res.status(500)}
});

router.get('/proxy.pac', async (req, res) => {
try{res.sendFile(path.join(__dirname, '../../proxy.pac'))}catch{res.status(500)}
});

router.get('/a.js', async (req, res) => {
try{res.sendFile(path.join(__dirname, '../middleware/a.js'))}catch{res.status(500)}
});

router.get('/private_policy', async (req, res) => {
  res.redirect('/privacy_policy');
});

router.get('/privacy_policy', async (req, res) => {
   res.sendFile(path.join(__dirname, '../../private_policy.html'));
});

router.get('/favicon.ico', async (req, res) => {
    res.sendFile(path.join(__dirname, '../../favicon.ico'));
});

module.exports = router;
