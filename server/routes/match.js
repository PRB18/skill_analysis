/**
 * Match Routes
 * Handles skill matching between users and opportunities.
 * Base path: /api/match
 */

const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { calculateMatch } = require('../utils/matchingAlgorithm');
const { normalizeSkills } = require('../utils/skillAliases');
const mockOpportunities = require('../utils/mockData');

/**
 * POST /api/match
 * Runs matching algorithm against all active, non-expired opportunities.
 * Skills are normalized (js→javascript, py→python, etc.) before matching.
 *
 * Body: { skills: string[] }
 * Returns: Opportunities sorted by readinessScore descending, with matchData.
 */
router.post('/', async (req, res) => {
  try {
    const { skills } = req.body;

    // Manual validation — simple and reliable
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'skills must be a non-empty array of strings'
      });
    }
    if (skills.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 skills allowed'
      });
    }
    // Ensure every element is a non-empty string
    const invalid = skills.find(s => typeof s !== 'string' || s.trim().length === 0);
    if (invalid !== undefined) {
      return res.status(400).json({
        success: false,
        error: 'Each skill must be a non-empty string'
      });
    }

    // Normalize user skills using the alias map (js→javascript, py→python, etc.)
    const userSkills = normalizeSkills(skills);

    // Fetch opportunities — DB if available, mock data as fallback
    let opportunities;
    try {
      opportunities = await Opportunity.find({
        isActive: true,
        $or: [
          { deadline: null },
          { deadline: { $exists: false } },
          { deadline: { $gte: new Date() } }
        ]
      }).lean();

      // If DB is up but empty (no upserted data yet), use mock data
      if (opportunities.length === 0) {
        opportunities = mockOpportunities;
      }
    } catch (dbError) {
      console.log('⚠️  DB unavailable — using mock data:', dbError.message);
      opportunities = mockOpportunities;
    }

    // Calculate match for each opportunity
    const matches = opportunities.map(opportunity => {
      const matchData = calculateMatch(
        userSkills,
        opportunity.requiredSkills || [],
        opportunity.optionalSkills || []
      );
      return { ...opportunity, matchData };
    });

    // Sort: highest readinessScore first, then by optional skill count
    matches.sort((a, b) => {
      if (b.matchData.readinessScore !== a.matchData.readinessScore) {
        return b.matchData.readinessScore - a.matchData.readinessScore;
      }
      return b.matchData.matchedOptional.length - a.matchData.matchedOptional.length;
    });

    res.json({
      success: true,
      count: matches.length,
      normalizedSkills: userSkills,
      data: matches
    });

  } catch (error) {
    console.error('Match route error:', error);
    // Return actual error message in dev for easier debugging
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to calculate matches'
        : error.message
    });
  }
});


/**
 * GET /api/match/trends
 * Returns the top N most-demanded skills across all active opportunities.
 * Unique differentiator: shows students what skills to learn next.
 *
 * Query: ?limit=10 (default 10)
 */
router.get('/trends', async (req, res) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    // Aggregate skill frequency across all active opportunities
    const trends = await Opportunity.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { skill: '$_id', count: 1, _id: 0 } }
    ]);

    // If DB is empty, return sensible defaults
    const fallback = [
      { skill: 'javascript', count: 45 },
      { skill: 'python', count: 38 },
      { skill: 'react', count: 32 },
      { skill: 'node.js', count: 28 },
      { skill: 'sql', count: 25 },
      { skill: 'docker', count: 20 },
      { skill: 'machine learning', count: 18 },
      { skill: 'aws', count: 15 },
      { skill: 'git', count: 14 },
      { skill: 'css', count: 12 }
    ];

    res.json({
      success: true,
      data: trends.length > 0 ? trends : fallback
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trends' });
  }
});

module.exports = router;
