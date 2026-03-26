const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using MONGODB_URI from environment variables
 * Falls back to localhost if MONGODB_URI is not set
 * With retry logic for Docker container startup
 */
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch';
    
    // Cloud MongoDB Atlas robust connection options per API design scaling principles
    const mongooseOptions = {
      maxPoolSize: 10,           // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000,    // Close sockets after 45 seconds of inactivity
      family: 4                  // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(mongoURI, mongooseOptions);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    if (retries > 0) {
      console.log(`⏳ MongoDB not ready. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      return connectDB(retries - 1);
    } else {
      console.error('❌ MongoDB Connection Error:', error.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
