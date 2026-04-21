/**
 * Skill Match Server - Main Entry Point
 * Express server with MongoDB connection for Skill-Based Matchmaking Platform
 */

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');

const app = express();

// ─── SECURITY ──────────────────────────────────────────────────────────

app.use(helmet());

// Rate Limiting — returns JSON (not HTML)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again in 15 minutes.'
    });
  }
});
app.use('/api/', apiLimiter);

// ─── CORS ───────────────────────────────────────────────────────────────

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ─── BODY PARSING ──────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));

// ─── DATABASE + STARTUP SEED ───────────────────────────────────────────

connectDB().then(async () => {
  // Seed real data on first boot if DB is empty
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) { // 1 = connected
      const Opportunity = require('./models/Opportunity');
      const { fetchAllJobs } = require('./utils/externalApiService');

      const count = await Opportunity.countDocuments();
      if (count === 0) {
        console.log('📥 No data in DB — seeding with real API data...');
        const jobs = await fetchAllJobs();
        for (const job of jobs) {
          await Opportunity.findOneAndUpdate(
            { applyUrl: job.applyUrl },
            { $set: { ...job, fetchedAt: new Date() } },
            { upsert: true, new: true, runValidators: true }
          );
        }
        console.log(`✅ Seeded ${jobs.length} real opportunities`);
      } else {
        console.log(`📋 DB has ${count} opportunities (using existing data)`);
      }
    }
  } catch (seedErr) {
    console.warn('⚠️  Startup seed failed (mock data will be used):', seedErr.message);
  }
});

// ─── ROUTES ────────────────────────────────────────────────────────────

const opportunityRoutes = require('./routes/opportunities');
const userRoutes        = require('./routes/users');
const matchRoutes       = require('./routes/match');
const adminRoutes       = require('./routes/admin');
const authRoutes        = require('./routes/auth');

app.use('/api/opportunities', opportunityRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/match',         matchRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/auth',          authRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SkillMatch server is running',
    timestamp: new Date().toISOString()
  });
});

// ─── ERROR HANDLING ────────────────────────────────────────────────────

// 404 — always return JSON
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  // Don't leak stack traces in production
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ─── START ─────────────────────────────────────────────────────────────

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API at http://localhost:${PORT}/api`);
    console.log(`🔐 Admin at http://localhost:${PORT}/api/admin`);
  });
}

module.exports = app;
