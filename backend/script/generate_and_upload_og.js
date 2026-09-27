const opentype = require('opentype.js');
const sharp = require('../../frontend/node_modules/sharp');
const fs = require('fs');
const pathLib = require('path');
require('dotenv').config({ path: pathLib.join(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  const buf700 = fs.readFileSync(pathLib.join(__dirname, 'CormorantGaramond-700.ttf'));
  const font700 = opentype.parse(buf700.buffer.slice(buf700.byteOffset, buf700.byteOffset + buf700.byteLength));

  const baseImgPath = pathLib.join(__dirname, '../../frontend/public/og-image.png');
  const baseImg = await sharp(baseImgPath).toBuffer();

  const boxW = 562;
  const boxH = 75;
  // Font size 67px, baseline at 61px relative to top=160 (exact baseline y=221 in 1200x630 canvas)
  const p = font700.getPath('Manchanda Fabrics', 2, 61, 67);
  const pathSvg = p.toSVG(2).replace('<path ', '<path fill="#2A201C" ');

  const svg = `
  <svg width="${boxW}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${boxW}" height="${boxH}" fill="#FAF6ED" />
    ${pathSvg}
  </svg>`;

  const textBuf = await sharp(Buffer.from(svg)).png().toBuffer();

  // Composite onto the 1200x630 card
  const newPngBuf = await sharp(baseImg)
    .composite([{
      input: textBuf,
      left: 618,
      top: 160
    }])
    .png({ compressionLevel: 8 })
    .toBuffer();

  const newJpgBuf = await sharp(newPngBuf)
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toBuffer();

  // Save to frontend/public
  const targetPng = pathLib.join(__dirname, '../../frontend/public/og-image.png');
  const targetJpg = pathLib.join(__dirname, '../../frontend/public/og-image.jpg');

  fs.writeFileSync(targetPng, newPngBuf);
  fs.writeFileSync(targetJpg, newJpgBuf);
  console.log('Saved frontend/public/og-image.png and og-image.jpg');

  // Upload to Cloudinary
  console.log('Uploading to Cloudinary...');

  // 1. Upload to new public_id for cache-busting
  const res1 = await cloudinary.uploader.upload(targetJpg, {
    folder: 'seo',
    public_id: 'manchanda_fabrics_og_preview',
    overwrite: true,
    resource_type: 'image'
  });
  console.log('Uploaded manchanda_fabrics_og_preview:');
  console.log('URL:', res1.secure_url);

  // 2. Also overwrite the previous manchanda_og_preview
  const res2 = await cloudinary.uploader.upload(targetJpg, {
    folder: 'seo',
    public_id: 'manchanda_og_preview',
    overwrite: true,
    resource_type: 'image'
  });
  console.log('Overwritten manchanda_og_preview:');
  console.log('URL:', res2.secure_url);
}

run().catch(console.error);
