/**
 * Auth Routes
 * Handles user registration, login, profile load, and profile update.
 * Base path: /api/auth
 *
 * Public:
 *   POST /api/auth/register  — create account
 *   POST /api/auth/login     — get JWT token
 *
 * Protected (requires Bearer token):
 *   GET  /api/auth/profile   — load saved skills + name
 *   PUT  /api/auth/profile   — save/update skills
 */

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const JWT_SECRET  = process.env.JWT_SECRET  || 'dev_jwt_secret_change_in_prod';
const TOKEN_TTL   = '30d'; // token lasts 30 days

// ── Middleware: verify user JWT ─────────────────────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Login required' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired — please log in again' });
  }
}

// ── POST /api/auth/register ─────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered — please log in' });
    }

    // passwordHash field is auto-hashed in User pre-save hook
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      skills: []
    });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, skills: user.skills }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Must explicitly select passwordHash (it has select: false on schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account with that email — register first' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, skills: user.skills }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/profile ───────────────────────────────────────────────

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/auth/profile ───────────────────────────────────────────────

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, skills } = req.body;
    const update = {};
    if (name)   update.name   = name.trim();
    if (skills) update.skills = skills.map(s => String(s).toLowerCase().trim()).filter(Boolean);

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
