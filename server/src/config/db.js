const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to avoid local DNS SRV resolution failures
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️  MONGO_URI not set — MongoDB connection skipped. Set it in .env to enable database features.');
      return;
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️  Server will continue running without database. DB-dependent routes will fail.');
  }
};

module.exports = connectDB;
