/**
 * Match Routes
 * Handles skill matching between users and opportunities
 * Base path: /api/match
 */

const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { calculateMatch } = require('../utils/matchingAlgorithm');
const mockOpportunities = require('../utils/mockData');

/**
 * POST /api/match
 * Runs matching algorithm against ALL opportunities
 * Body: { skills: [String] }
 * Returns: Array of opportunities with match data, sorted by readinessScore (descending)
 *
 * Response format for each opportunity:
 * {
 *   ...opportunity data,
 *   matchData: {
 *     matchedRequired: [...],
 *     matchedOptional: [...],
 *     missingSkills: [...],
 *     readinessScore: number
 *   }
 * }
 */
// Mock opportunities moved to utils/mockData.js

router.post('/', async (req, res) => {
  try {
    const { skills } = req.body;

    // Validate skills array
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Skills array is required and cannot be empty'
      });
    }

    if (skills.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Too many skills provided. Maximum is 50.'
      });
    }

    let opportunities;
    try {
      // Try to fetch from database, returning plain JS objects
      opportunities = await Opportunity.find().lean();
    } catch (dbError) {
      // Fallback to mock data if database is unavailable
      console.log('⚠️  Using mock data (database unavailable)');
      opportunities = mockOpportunities;
    }

    // Calculate match for each opportunity
    const matches = opportunities.map(opportunity => {
      // Run matching algorithm
      const matchData = calculateMatch(
        skills,
        opportunity.requiredSkills,
        opportunity.optionalSkills
      );

      // Return opportunity with match data merged
      return {
        ...opportunity,
        matchData
      };
    });

    // Sort by readinessScore descending (highest matches first)
    matches.sort((a, b) => b.matchData.readinessScore - a.matchData.readinessScore);

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('Error calculating matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate matches'
    });
  }
});

module.exports = router;
