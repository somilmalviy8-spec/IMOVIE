const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verify JWT Bearer token and attach active user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No bearer token provided.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is missing.');
    return res.status(500).json({
      success: false,
      message: 'Server security configuration error. Please contact the administrator.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.',
        code: 'AUTH_USER_NOT_FOUND',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Please sign in again.',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource.',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Optional auth middleware: extracts user if token provided, but doesn't block unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return next();

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

/**
 * Restrict access to administrators only
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Administrator privileges required to access this resource.',
    code: 'ADMIN_ACCESS_REQUIRED',
  });
};

module.exports = { protect, optionalAuth, requireAdmin };
