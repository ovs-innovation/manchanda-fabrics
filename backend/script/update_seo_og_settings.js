const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Setting = require('../models/Setting');

  const update = {
    'setting.seo.favicon': 'https://res.cloudinary.com/tu23xpla/image/upload/v1790414112/brand/manchanda_favicon.png',
    'setting.seo.meta_title': "Manchanda Fab — Wholesale & Retail Ladies' Suits | Chandni Chowk, Delhi",
    'setting.seo.meta_description': "Wholesale Ladies' Suits & Unstitched Fabrics — Chosen with care, from our family to yours since 1990. Located at Chandni Chowk, Delhi. Fast PAN-India Delivery.",
    'setting.seo.meta_img': 'https://res.cloudinary.com/tu23xpla/image/upload/v1790413952/seo/manchanda_og_preview.jpg',
    'setting.seo.meta_keywords': "wholesale ladies suits, unstitched suit material, salwar suits chandni chowk, cotton suits, pure silk suits, party wear suits, manchanda fabrics, manchanda fab",
    'setting.seo.meta_url': 'https://manchandafabric.in/',
    'setting.navbar.logo': 'https://res.cloudinary.com/tu23xpla/image/upload/v1790414111/brand/manchanda_logo.png'
  };

  const result = await Setting.updateOne({ name: 'storeCustomizationSetting' }, { $set: update });
  console.log('Update result:', result);

  const doc = await Setting.findOne({ name: 'storeCustomizationSetting' });
  console.log('Verified SEO in DB:', JSON.stringify(doc?.setting?.seo, null, 2));
  console.log('Verified Navbar Logo in DB:', doc?.setting?.navbar?.logo);

  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
