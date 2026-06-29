const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB cluster");
    
    // Get list of databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log("Databases on cluster:");
    dbs.databases.forEach(db => {
      console.log("-", db.name);
    });
    
    // Check collections in current database
    console.log("Current database:", mongoose.connection.db.databaseName);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in current database:");
    collections.forEach(c => {
      console.log("-", c.name);
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

run();
