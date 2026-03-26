/**
 * Opportunities Routes
 * Handles CRUD operations for internship and hackathon opportunities
 * Base path: /api/opportunities
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const { fetchAllJobs } = require('../utils/externalApiService');

/**
 * POST /api/opportunities/refresh
 * Fetches fresh data from external APIs and caches in database
 * Useful for periodic updates
 */
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔄 Fetching jobs from external sources...');
    
    // Fetch from external APIs
    const newJobs = await fetchAllJobs();

    if (newJobs.length === 0) {
      return res.json({
        success: true,
        message: 'No new jobs fetched, using existing data',
        data: []
      });
    }

    // Insert new jobs first to ensure data reliability
    const saved = await Opportunity.insertMany(newJobs);
    
    // Once successful, clear old external data that we just replaced
    const savedIds = saved.map(job => job._id);
    await Opportunity.deleteMany({ 
      source: { $in: ['internshala', 'github', 'devpost', 'linkedin'] },
      _id: { $nin: savedIds }
    });

    console.log(`✅ Cached ${saved.length} jobs to database`);

    res.json({
      success: true,
      message: `Successfully cached ${saved.length} opportunities`,
      data: saved
    });
  } catch (error) {
    console.error('Error refreshing opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh opportunities'
    });
  }
});

/**
 * GET /api/opportunities
 * Retrieves all opportunities from the database
 * If database is empty, fetches from external sources
 * Returns: Array of opportunity objects
 */
router.get('/', async (req, res) => {
  try {
    // Check if opportunities exist in database
    let opportunities = await Opportunity.find().lean();

    // If no opportunities, fetch from external sources
    if (opportunities.length === 0) {
      console.log('📡 Database empty, fetching from external APIs...');
      const newJobs = await fetchAllJobs();
      
      if (newJobs.length > 0) {
        // Use create and then convert to plain objects with toObject, or re-query
        await Opportunity.insertMany(newJobs);
        opportunities = await Opportunity.find().lean();
        console.log(`✅ Cached ${opportunities.length} opportunities`);
      }
    }

    res.json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities'
    });
  }
});

/**
 * GET /api/opportunities/:id
 * Retrieves a single opportunity by ID
 */
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format to prevent Mongoose CastError
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID format'
      });
    }

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found'
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunity'
    });
  }
});

module.exports = router;
