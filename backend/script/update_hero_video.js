const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Setting = require('../models/Setting');

  const videoUrl = 'https://res.cloudinary.com/tu23xpla/video/upload/v1790419681/homepage/hero_banner_video.mp4';

  const res = await Setting.updateOne(
    { name: 'storeCustomizationSetting' },
    { $set: { 'setting.manchandaHomepage.heroVideo': videoUrl } }
  );
  console.log('Update result:', res);

  const doc = await Setting.findOne({ name: 'storeCustomizationSetting' });
  console.log('Verified heroVideo in DB:', doc?.setting?.manchandaHomepage?.heroVideo);

  process.exit(0);
}

run().catch(err => {
  console.error('Update error:', err);
  process.exit(1);
});
