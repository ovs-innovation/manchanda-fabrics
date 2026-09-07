const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function inspectProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).limit(5).toArray();
    console.log('Sample products count:', products.length);
    products.forEach((p, idx) => {
      console.log(`\n--- Product ${idx + 1} ---`);
      console.log('_id:', p._id);
      console.log('title:', p.title);
      console.log('status:', p.status);
      console.log('category:', p.category);
      console.log('categories:', p.categories);
      console.log('prices:', p.prices);
    });

    const statusCounts = await db.collection('products').aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    console.log('\nStatus counts in DB:', statusCounts);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectProducts();
