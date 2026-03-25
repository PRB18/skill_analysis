/**
 * Skill Match Server - Main Entry Point
 * Express server with MongoDB connection for Skill-Based Matchmaking Platform
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
// Enable CORS for all origins (frontend running on different port)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// MongoDB Connection
/**
 * Connects to MongoDB Atlas using MONGODB_URI from environment variables
 * Falls back to localhost if MONGODB_URI is not set
 * With retry logic for Docker container startup
 */
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch';
    await mongoose.connect(mongoURI);
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

// Connect to database
connectDB();

// Import Routes
const opportunityRoutes = require('./routes/opportunities');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/match');

// Route Middleware
// All API routes are prefixed with /api
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/match', matchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
