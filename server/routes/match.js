/**
 * Match Routes
 * Handles skill matching between users and opportunities
 * Base path: /api/match
 */

const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { calculateMatch } = require('../utils/matchingAlgorithm');

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
// Mock opportunities for fallback when database is unavailable
const mockOpportunities = [
  {
    _id: '1',
    title: 'Frontend Developer',
    company: 'Tech Startup Inc',
    type: 'internship',
    description: 'Build modern web applications with React',
    requiredSkills: ['react', 'javascript', 'css'],
    optionalSkills: ['typescript', 'redux', 'testing'],
    applyUrl: 'https://www.internshala.com/internships',
    source: 'internshala'
  },
  {
    _id: '2',
    title: 'Full Stack Engineer',
    company: 'Web Solutions Co',
    type: 'internship',
    description: 'Work on both frontend and backend systems',
    requiredSkills: ['javascript', 'node.js', 'mongodb'],
    optionalSkills: ['react', 'docker', 'aws'],
    applyUrl: 'https://www.internshala.com/internships',
    source: 'internshala'
  },
  {
    _id: '3',
    title: 'Backend Developer',
    company: 'Cloud Systems Ltd',
    type: 'hackathon',
    description: 'Develop scalable server applications',
    requiredSkills: ['node.js', 'python', 'sql'],
    optionalSkills: ['docker', 'kubernetes', 'graphql'],
    applyUrl: 'https://devpost.com/hackathons',
    source: 'devpost'
  },
  {
    _id: '4',
    title: 'Data Scientist',
    company: 'AI Innovations',
    type: 'hackathon',
    description: 'Analyze data and build ML models',
    requiredSkills: ['python', 'statistics', 'machine learning'],
    optionalSkills: ['tensorflow', 'sql', 'spark'],
    applyUrl: 'https://devpost.com/hackathons',
    source: 'devpost'
  },
  {
    _id: '5',
    title: 'DevOps Engineer',
    company: 'Infrastructure Pro',
    type: 'internship',
    description: 'Manage infrastructure and deployments',
    requiredSkills: ['docker', 'linux', 'ci/cd'],
    optionalSkills: ['kubernetes', 'aws', 'terraform'],
    applyUrl: 'https://www.internshala.com/internships',
    source: 'internshala'
  }
];

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

    let opportunities;
    try {
      // Try to fetch from database
      opportunities = await Opportunity.find();
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
        ...opportunity.toObject ? opportunity.toObject() : opportunity, // Handle both Mongoose docs and plain objects
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
