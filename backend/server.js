const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const requireDbConnection = require('./middleware/dbCheck');

// Load environment variables from backend/.env (with fallback to process.cwd())
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();

// Allowed Origins for CORS (Support Vite default port 5173 on localhost & 127.0.0.1, plus CLIENT_URL)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((o) => o.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, postman, same-origin/proxy)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any localhost / 127.0.0.1 port in non-production
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS error: Origin ${origin} not allowed by Access-Control-Allow-Origin.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(morgan('dev'));

// API Health Check (reports database readiness state)
app.get('/api/health', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  res.status(isDbReady ? 200 : 503).json({
    status: isDbReady ? 'ok' : 'degraded',
    app: 'The IMovies API',
    database: isDbReady ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState,
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes (with DB guard to prevent buffering timeouts when database is unavailable)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', requireDbConnection, require('./routes/movieRoutes'));
app.use('/api/theatres', requireDbConnection, require('./routes/theatreRoutes'));
app.use('/api/showtimes', requireDbConnection, require('./routes/showtimeRoutes'));
app.use('/api/bookings', requireDbConnection, require('./routes/bookingRoutes'));
app.use('/api/admin', requireDbConnection, require('./routes/adminRoutes'));

// 404 Handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message || err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

// Start Express server after awaiting MongoDB connection
const startServer = async () => {
  try {
    // 1. Await database connection before accepting traffic
    await connectDB();
    console.log('✅ Database connection established before accepting incoming requests.');
  } catch (error) {
    console.error('⚠️ MongoDB connection could not be established prior to server start.');
    console.error('💡 The server is running in degraded mode. Database-dependent endpoints will return HTTP 503 until connection is established.');
  }

  // 2. Start listening only after connection attempt has been awaited
  const server = app.listen(PORT, () => {
    console.log(`🎬 The IMovies Server is running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });

  return server;
};

startServer();

