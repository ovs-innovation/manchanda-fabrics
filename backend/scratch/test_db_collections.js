const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function checkAll() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected! Current DB name:', mongoose.connection.db.databaseName);

    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    console.log('Databases in cluster:', databases.map(d => d.name));

    for (const dbInfo of databases) {
      if (['admin', 'local'].includes(dbInfo.name)) continue;
      const db = mongoose.connection.client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      console.log(`\nDB: "${dbInfo.name}" -> Collections:`, collections.map(c => c.name));
      const hasProds = collections.some(c => c.name === 'products');
      const hasCats = collections.some(c => c.name === 'categories');
      if (hasProds || hasCats) {
        const prodCount = hasProds ? await db.collection('products').countDocuments() : 0;
        const catCount = hasCats ? await db.collection('categories').countDocuments() : 0;
        console.log(`   --> products count: ${prodCount}, categories count: ${catCount}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAll();
