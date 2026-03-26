/**
 * Skill Match Server - Main Entry Point
 * Express server with MongoDB connection for Skill-Based Matchmaking Platform
 */

const dotenv = require('dotenv');
// Load environment variables FIRST, before any module that reads process.env
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');

// Initialize Express app
const app = express();

// Security Headers
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Middleware
// Enable restricted CORS
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
// Parse JSON request bodies securely
app.use(express.json({ limit: '10kb' }));

// Connect to MongoDB
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
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
