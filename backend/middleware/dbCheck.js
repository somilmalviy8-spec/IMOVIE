// ========================================================
// THE IMOVIES - MongoDB Connection State Guard Middleware
// ========================================================
const mongoose = require('mongoose');

/**
 * Middleware that verifies MongoDB connection is in connected state (readyState === 1).
 * Prevents incoming requests from queuing in Mongoose's 10,000ms operation buffer
 * when the database is unreachable or offline, returning immediate HTTP 503 instead.
 */
const requireDbConnection = (req, res, next) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please verify MongoDB connection and try again.',
      code: 'DATABASE_UNAVAILABLE',
    });
  }
  next();
};

module.exports = requireDbConnection;
