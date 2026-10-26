const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded if db.js is invoked independently
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

/**
 * Safely redact credentials from MongoDB connection URI
 * e.g. mongodb+srv://user:secret@cluster0.mongodb.net/imovies -> mongodb+srv://user:****@cluster0.mongodb.net/imovies
 */
const sanitizeMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/gi, '$1****$3');
};

/**
 * Safely redact credentials and tokens from error messages
 */
const sanitizeErrorMessage = (error) => {
  if (!error) return 'Unknown database error';
  const message = error.message || String(error);
  return message
    .replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/gi, '$1****$3')
    .replace(/(password|secret|token)=([^&]+)/gi, '$1=****');
};

/**
 * Check if MongoDB connection is ready
 * readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Connect to MongoDB instance using MONGODB_URI
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('your_mongodb_connection_string_here')) {
    const configError = new Error(
      'MONGODB_URI is not configured in backend/.env. Please paste your MongoDB Atlas connection string into backend/.env.'
    );
    console.error(`❌ MongoDB Configuration Error: ${configError.message}`);
    console.error('💡 To connect to MongoDB Atlas:');
    console.error('  1. Add your connection string in backend/.env:');
    console.error('     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    console.error('  2. In Atlas Network Access, whitelist your current IP address (or 0.0.0.0/0 for development).');
    throw configError;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if Atlas host is unreachable (instead of 30s default)
    });

    console.log(`✅ MongoDB Connected Successfully: Host = ${conn.connection.host}, Database = ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${sanitizeErrorMessage(error)}`);
    console.error('💡 Atlas Connection Troubleshooting Checklist:');
    console.error('  1. Network Access (IP Whitelist): In Atlas -> "Network Access" -> verify your IP (or 0.0.0.0/0) is active.');
    console.error('  2. Database User: In Atlas -> "Database Access" -> ensure user has readWrite privileges.');
    console.error('  3. Connection String: Verify syntax in backend/.env without quotes or brackets around username/password.');
    console.error('  4. Password Encoding: If password has special characters like @, #, $, or %, URL-encode them.');
    throw error;
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isDbConnected = isDbConnected;
module.exports.sanitizeMongoUri = sanitizeMongoUri;

