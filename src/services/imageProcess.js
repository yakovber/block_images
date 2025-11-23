const db = require('../models/db');
const path = require('path');
const fs = require('fs').promises;
const { createCanvas, loadImage } = require('canvas');

// הגדרת נתיב קבוע ללוגו
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

async function pixelateImage(buffer, blocksX = 3, blocksY = 3) {
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const blockSizeW = Math.floor(canvas.width / blocksX);
    const blockSizeH = Math.floor(canvas.height / blocksY);

    const remainderW = canvas.width % blocksX; // שארית רוחב
    const remainderH = canvas.height % blocksY; // שארית גובה

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < blocksY; y++) {
        for (let x = 0; x < blocksX; x++) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;

            const currentBlockSizeW = x === blocksX - 1 ? blockSizeW + remainderW : blockSizeW;
            const currentBlockSizeH = y === blocksY - 1 ? blockSizeH + remainderH : blockSizeH;

            for (let dy = 0; dy < currentBlockSizeH; dy++) {
                for (let dx = 0; dx < currentBlockSizeW; dx++) {
                    const px = x * blockSizeW + dx;
                    const py = y * blockSizeH + dy;

                    if (px < canvas.width && py < canvas.height) {
                        const i = (py * canvas.width + px) * 4;
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        a += data[i + 3];
                        count++;
                    }
                }
            }

            const avgR = Math.round(r / count);
            const avgG = Math.round(g / count);
            const avgB = Math.round(b / count);
            const avgA = Math.round(a / count);

            for (let dy = 0; dy < currentBlockSizeH; dy++) {
                for (let dx = 0; dx < currentBlockSizeW; dx++) {
                    const px = x * blockSizeW + dx;
                    const py = y * blockSizeH + dy;

                    if (px < canvas.width && py < canvas.height) {
                        const i = (py * canvas.width + px) * 4;
                        data[i] = avgR;
                        data[i + 1] = avgG;
                        data[i + 2] = avgB;
                        data[i + 3] = avgA;
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // הוספת לוגו אם קיים
    const logo = await loadImage(LOGO_PATH);
    const logoWidth = canvas.width * 0.2; // גודל הלוגו (20% מרוחב התמונה)
    const logoHeight = (logo.height / logo.width) * logoWidth; // שמירה על יחס גובה-רוחב
    const logoX = (canvas.width/2) - (logoWidth/2) ; // מיקום הלוגו (ימין למטה)
    const logoY = (canvas.height/2) - (logoHeight/2);

    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

    return {
        buffer: canvas.toBuffer(),
        base64: `data:image/png;base64,${canvas.toBuffer().toString('base64')}`,
    };
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
    await fs.mkdir(originalPath, { recursive: true });
    await fs.writeFile(path.join(originalPath, filename), buffer);

    // Create pixelated version with logo
    const pixelatedDir = path.join(originalPath, 'pixelated');
    await fs.mkdir(pixelatedDir, { recursive: true });
    
    const { buffer: pixelatedBuffer } = await pixelateImage(buffer, 3, 3);

    const pixelatedFilename = `${imageId}.png`;
    await fs.writeFile(path.join(pixelatedDir, pixelatedFilename), pixelatedBuffer);

    return {
        filename,
        imageId,
        pixelatedFilename
    };
}

async function getImageAsBase64(imagePath) {
  const buffer = await fs.readFile(imagePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

module.exports = { processImage, pixelateImage , getImageAsBase64};