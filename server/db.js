const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using MONGODB_URI from environment variables.
 * Does NOT crash the server on failure — app continues using mock data.
 * Reduced timeouts so startup is fast.
 */
const connectDB = async (retries = 2) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch';

    const mongooseOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000, // Fail fast — 3s max
      socketTimeoutMS: 30000,
      family: 4                        // Use IPv4
    };

    await mongoose.connect(mongoURI, mongooseOptions);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    if (retries > 0) {
      console.log(`⏳ MongoDB not ready. Retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(retries - 1);
    } else {
      // IMPORTANT: Don't exit — server still works with mock/fallback data
      console.warn('⚠️  MongoDB unavailable — running with mock data fallback');
      console.warn('   Check MONGODB_URI in server/.env');
    }
  }
};

module.exports = connectDB;

