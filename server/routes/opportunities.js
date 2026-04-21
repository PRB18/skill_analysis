/**
 * Opportunities Routes
 * Handles CRUD operations for internship and hackathon opportunities.
 * Uses a 6-hour MongoDB cache — fetches fresh data automatically when stale.
 * Base path: /api/opportunities
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const { fetchAllJobs } = require('../utils/externalApiService');

// Cache TTL: 6 hours in milliseconds
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Check if cached data is stale (older than 6 hours).
 * @param {Date|null} fetchedAt - Timestamp of the last fetch
 * @returns {boolean}
 */
function isCacheStale(fetchedAt) {
  if (!fetchedAt) return true;
  return (Date.now() - new Date(fetchedAt).getTime()) > CACHE_TTL_MS;
}

/**
 * Fetch fresh data from external APIs and upsert into DB (no duplicates).
 * Returns the number of records upserted.
 */
async function refreshCache() {
  console.log('🔄 Cache stale — fetching fresh data from external APIs...');
  const jobs = await fetchAllJobs();

  let count = 0;
  for (const job of jobs) {
    // Upsert by applyUrl — prevents duplicate entries
    await Opportunity.findOneAndUpdate(
      { applyUrl: job.applyUrl },
      { $set: { ...job, fetchedAt: new Date() } },
      { upsert: true, new: true, runValidators: true }
    );
    count++;
  }
  console.log(`✅ Cache refreshed: ${count} opportunities upserted`);
  return count;
}

/**
 * GET /api/opportunities
 * Returns active, non-expired opportunities.
 * Auto-refreshes if cache is older than 6 hours.
 * Query params:
 *   ?type=internship|hackathon
 *   ?source=devpost|remotive|mlh|manual
 *   ?search=react (text search on title/company)
 */
router.get('/', async (req, res) => {
  try {
    // Find the most recent fetchedAt timestamp in the DB
    const newest = await Opportunity.findOne({ source: { $ne: 'manual' } })
      .sort({ fetchedAt: -1 })
      .select('fetchedAt')
      .lean();

    // Auto-refresh if cache is stale
    if (isCacheStale(newest?.fetchedAt)) {
      // Refresh in the background — don't block the response
      refreshCache().catch(err => console.error('Background refresh error:', err));
    }

    // Build query filter
    const filter = { isActive: true };

    // Filter out opportunities with a past deadline
    filter.$or = [
      { deadline: null },
      { deadline: { $gte: new Date() } }
    ];

    if (req.query.type)   filter.type   = req.query.type;
    if (req.query.source) filter.source = req.query.source;

    // Text search if provided
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const opportunities = await Opportunity.find(filter)
      .sort({ fetchedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: opportunities.length,
      cacheAge: newest?.fetchedAt
        ? Math.round((Date.now() - new Date(newest.fetchedAt).getTime()) / 60000) + ' minutes'
        : 'fresh',
      data: opportunities
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch opportunities' });
  }
});

/**
 * POST /api/opportunities/refresh
 * Manually trigger a data refresh (public endpoint for testing).
 */
router.post('/refresh', async (req, res) => {
  try {
    const count = await refreshCache();
    res.json({ success: true, message: `Refreshed ${count} opportunities` });
  } catch (error) {
    console.error('Manual refresh error:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh opportunities' });
  }
});

/**
 * GET /api/opportunities/:id
 * Retrieves a single opportunity by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid opportunity ID format' });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' });
    }

    res.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch opportunity' });
  }
});

module.exports = router;
