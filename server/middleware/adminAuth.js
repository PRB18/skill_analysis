/**
 * Admin Authentication Middleware
 * Protects all /api/admin routes with JWT verification.
 * Admin must login via POST /api/admin/login to get a token.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

/**
 * requireAdmin middleware
 * Checks for a valid Bearer JWT token in the Authorization header.
 * Rejects with 401 if missing, 403 if invalid/expired.
 */
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

module.exports = { requireAdmin, JWT_SECRET };
