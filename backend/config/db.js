const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('your_mongodb_connection_string_here')) {
      throw new Error(
        'MONGODB_URI is not configured in backend/.env. Please paste your MongoDB Atlas connection string into backend/.env.'
      );
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Atlas Troubleshooting Tips:');
    console.error('  1. In MongoDB Atlas, go to "Network Access" and ensure your current IP address (or 0.0.0.0/0 for dev) is whitelisted.');
    console.error('  2. In MongoDB Atlas, verify your Database User has read/write privileges and correct password.');
    console.error('  3. In backend/.env, ensure your connection string format is:');
    console.error('     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    throw error;
  }
};

module.exports = connectDB;
