const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Placeholder JWT auth middleware.
 * Extracts user from Bearer token if present.
 * In development, allows requests through with a mock user if no token.
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, attach a placeholder user ID for testing
      if (process.env.NODE_ENV === 'development') {
        req.userId = null; // No authenticated user
        return next();
      }
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
