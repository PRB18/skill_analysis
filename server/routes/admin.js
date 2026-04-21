/**
 * Admin Routes
 * All routes protected by JWT admin authentication.
 * Base path: /api/admin
 *
 * The admin panel is the operations backbone — manage listings,
 * trigger data refreshes, view stats, manage users.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { fetchAllJobs } = require('../utils/externalApiService');
const { requireAdmin, JWT_SECRET } = require('../middleware/adminAuth');

// ─── AUTH ──────────────────────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Authenticates the admin with the secret key.
 * Returns a JWT token valid for 24 hours.
 * Body: { secretKey: string }
 */
router.post('/login', (req, res) => {
  const { secretKey } = req.body;
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin123';

  if (!secretKey || secretKey !== ADMIN_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid secret key' });
  }

  const token = jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ success: true, token, message: 'Admin access granted' });
});

// All routes below this line require a valid admin JWT
router.use(requireAdmin);

// ─── STATS ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns high-level platform statistics.
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalOpportunities,
      totalUsers,
      hackathonCount,
      internshipCount,
      activeCount,
      newestOpportunity
    ] = await Promise.all([
      Opportunity.countDocuments(),
      User.countDocuments(),
      Opportunity.countDocuments({ type: 'hackathon' }),
      Opportunity.countDocuments({ type: 'internship' }),
      Opportunity.countDocuments({ isActive: true }),
      Opportunity.findOne().sort({ fetchedAt: -1 }).select('fetchedAt source').lean()
    ]);

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const lastFetch = newestOpportunity?.fetchedAt || null;

    // Source breakdown
    const sourceBreakdown = await Opportunity.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalOpportunities,
        activeCount,
        hackathonCount,
        internshipCount,
        totalUsers,
        dbStatus,
        lastFetch,
        sourceBreakdown
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ─── OPPORTUNITIES ─────────────────────────────────────────────────────

/**
 * POST /api/admin/opportunities/refresh
 * Triggers a fresh fetch from all external APIs.
 * Uses upsert to avoid duplicates.
 */
router.post('/opportunities/refresh', async (req, res) => {
  try {
    console.log('🔄 Admin triggered data refresh...');
    const newJobs = await fetchAllJobs();

    if (newJobs.length === 0) {
      return res.json({ success: true, message: 'No new opportunities found', upserted: 0 });
    }

    // Upsert by applyUrl to prevent duplicates
    let upsertedCount = 0;
    for (const job of newJobs) {
      await Opportunity.findOneAndUpdate(
        { applyUrl: job.applyUrl },
        { $set: { ...job, fetchedAt: new Date() } },
        { upsert: true, new: true, runValidators: true }
      );
      upsertedCount++;
    }

    console.log(`✅ Admin refresh: ${upsertedCount} opportunities upserted`);
    res.json({
      success: true,
      message: `Refreshed ${upsertedCount} opportunities`,
      upserted: upsertedCount
    });
  } catch (error) {
    console.error('Admin refresh error:', error);
    res.status(500).json({ success: false, error: 'Refresh failed' });
  }
});

/**
 * GET /api/admin/opportunities
 * Returns all opportunities (paginated) with optional filters.
 * Query: ?page=1&limit=20&type=internship&source=devpost&active=true
 */
router.get('/opportunities', async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const filter = {};

    if (req.query.type)   filter.type   = req.query.type;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }

    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Opportunity.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch opportunities' });
  }
});

/**
 * POST /api/admin/opportunities
 * Manually add a new opportunity.
 * Body: { title, company, type, requiredSkills, optionalSkills, applyUrl, description, location }
 */
router.post('/opportunities', async (req, res) => {
  try {
    const { title, company, type, requiredSkills, optionalSkills, applyUrl, description, location } = req.body;

    if (!title || !company || !type || !applyUrl) {
      return res.status(400).json({
        success: false,
        error: 'title, company, type, and applyUrl are required'
      });
    }

    const opportunity = await Opportunity.create({
      title: title.trim(),
      company: company.trim(),
      type,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      optionalSkills: Array.isArray(optionalSkills) ? optionalSkills : [],
      applyUrl: applyUrl.trim(),
      description: description || '',
      location: location || 'Remote',
      source: 'manual',
      isActive: true,
      fetchedAt: new Date()
    });

    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Admin create opportunity error:', error);
    res.status(500).json({ success: false, error: 'Failed to create opportunity' });
  }
});

/**
 * PATCH /api/admin/opportunities/:id
 * Update an opportunity (e.g., deactivate it).
 */
router.patch('/opportunities/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    const updated = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update opportunity' });
  }
});

/**
 * DELETE /api/admin/opportunities/:id
 * Hard-delete an opportunity.
 */
router.delete('/opportunities/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    const deleted = await Opportunity.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' });
    }

    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete opportunity' });
  }
});

// ─── USERS ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Returns all saved user profiles.
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user profile.
 */
router.delete('/users/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

module.exports = router;
