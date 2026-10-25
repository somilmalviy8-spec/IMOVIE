require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const promoteUser = async () => {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('❌ Error: Please specify the user email to promote.');
    console.log('👉 Usage: npm run make-admin <user-email>');
    console.log('   Example: npm run make-admin alex@theimovies.com');
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in backend/.env');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const user = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!user) {
      console.error(`❌ User with email "${targetEmail}" was not found.`);
      console.log('💡 Tip: First register the user through the website, then run this command to elevate their role.');
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️ User "${user.email}" (${user.name}) is ALREADY an administrator.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log('==================================================');
    console.log(`🎉 SUCCESS: Elevated "${user.email}" to Administrator!`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🛡️ Role: ${user.role}`);
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to promote user:', err.message);
    process.exit(1);
  }
};

promoteUser();
