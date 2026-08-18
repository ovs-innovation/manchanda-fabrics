require("./env");
const mongoose = require("mongoose");

const dns = require("dns");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables. Please set MONGO_URI in your .env file.");
    }

    // Set fallback public DNS servers for reliable mongodb+srv:// SRV record resolution
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (e) {
      // Ignore if setServers is not supported in environment
    }
    
    // Cleanup URI (remove any trailing spaces or hidden characters)
    const mongoUri = process.env.MONGO_URI.trim();

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error Message:", err.message);
    
    if (err.message.includes("MongooseServerSelectionError") || err.message.includes("Could not connect to any servers")) {
      console.warn("\n💡 TIP: This usually means your IP address is not whitelisted in MongoDB Atlas.");
      console.warn("Please go to MongoDB Atlas -> Security -> Network Access and add your current IP.\n");
    } else if (err.message.includes("ENOTFOUND")) {
      console.warn("\n💡 TIP: DNS resolution failed. Check your internet connection or DNS settings.\n");
    }
    
    throw err;
  }
};

// Reuse the default connection to avoid spawning a second connection pool
const mongo_connection = mongoose.connection;

module.exports = {
  connectDB,
  mongo_connection,
};
