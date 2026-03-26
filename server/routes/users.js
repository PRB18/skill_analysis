/**
 * Users Routes
 * Handles user creation and management
 * Base path: /api/users
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST /api/users
 * Creates a new user with name and skills
 * Body: { name: String, skills: [String] }
 * Returns: Created user object
 */
router.post('/', async (req, res) => {
  try {
    const { name, skills } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        error: 'Skills must be an array'
      });
    }

    if (skills.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Too many skills provided. Maximum is 50.'
      });
    }

    // Create new user
    const user = new User({
      name,
      skills
    });

    // Save to database
    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

/**
 * GET /api/users
 * Retrieves all users
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

module.exports = router;
