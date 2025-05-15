const db = require('../models/db');
const path = require('path');  // Fixed: remove .promises
const fs = require('fs').promises;  // Use fs.promises instead
const { createCanvas, loadImage } = require('canvas');

async function pixelateImage(buffer, initialBlockSize) {

   
    try {
        // המרת base64 לבאפר
      
        
        // טעינת התמונה מהבאפר
        const img = await loadImage(buffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        
        // חישוב גודל הבלוק המקסימלי (20% מהצד הקטן של התמונה)
        const minDimension = Math.min(img.width, img.height);
        const maxBlockSize = minDimension * 0.4;
        
        // התאמת גודל הבלוק
        let blockSize = initialBlockSize;
        while (blockSize > maxBlockSize) {
            blockSize = Math.floor(blockSize / 2);
        }

        console.log(`Original dimensions: ${img.width}x${img.height}`);
        console.log(`Min dimension: ${minDimension}`);
        console.log(`Max block size: ${maxBlockSize}`);
        console.log(`Initial block size: ${initialBlockSize}`);
        console.log(`Adjusted block size: ${blockSize}`);

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let y = 0; y < canvas.height; y += blockSize) {
            for (let x = 0; x < canvas.width; x += blockSize) {
                let r = 0, g = 0, b = 0, count = 0;

                // חישוב ממוצע צבעים לבלוק
                for (let dy = 0; dy < blockSize; dy++) {
                    for (let dx = 0; dx < blockSize; dx++) {
                        const px = x + dx;
                        const py = y + dy;
                        if (px >= canvas.width || py >= canvas.height) continue;
                        const i = (py * canvas.width + px) * 4;
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        count++;
                    }
                }

                const avgR = Math.round(r / count);
                const avgG = Math.round(g / count);
                const avgB = Math.round(b / count);

                // צביעת הבלוק בצבע הממוצע
                for (let dy = 0; dy < blockSize; dy++) {
                    for (let dx = 0; dx < blockSize; dx++) {
                        const px = x + dx;
                        const py = y + dy;
                        if (px >= canvas.width || py >= canvas.height) continue;
                        const i = (py * canvas.width + px) * 4;
                        data[i] = avgR;
                        data[i + 1] = avgG;
                        data[i + 2] = avgB;
                    }
                }
            }
        }
 
        ctx.putImageData(imageData, 0, 0);
        return {
            buffer: canvas.toBuffer(),
            actualBlockSize: blockSize,
            // החזרת התמונה המעובדת כ-base64
            base64: `data:image/png;base64,${canvas.toBuffer().toString('base64')}`,
        };
    } catch (err) {
        console.error('Error in pixelateImage:', err);
        throw err;
    }
}

async function processImage(imageData, baseDir) {
    if (!imageData?.startsWith('data:')) {
        throw new Error('Invalid image data');
    }

    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid image format');
    }

    const ext = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');
    
    // Generate unique ID
    const imageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const filename = `${imageId}.${ext}`;
    
    // Save original image
    const originalPath = path.join(baseDir, 'pending_images');
    await fs.mkdir(originalPath, { recursive: true });  // Using promises version
    await fs.writeFile(path.join(originalPath, filename), buffer);

    // Create pixelated version
    const pixelatedDir = path.join(originalPath, 'pixelated');
    await fs.mkdir(pixelatedDir, { recursive: true });  // Using promises version
    
    const blockSize = 100;
    const { buffer: pixelatedBuffer } = await pixelateImage(buffer, blockSize);
    const pixelatedFilename = `${imageId}.png`;
    await fs.writeFile(path.join(pixelatedDir, pixelatedFilename), pixelatedBuffer);

    return {
        filename,
        imageId,
        pixelatedFilename,
        actualBlockSize: blockSize
    };
}

module.exports = { processImage, pixelateImage };
