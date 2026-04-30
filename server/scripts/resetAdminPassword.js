require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Authority = require('../models/Authority');

const resetAdminPassword = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const admin = await Authority.findOne({ role: 'admin' });
    if (!admin) {
      console.error('Admin account not found in Authority collection.');
      process.exit(1);
    }

    const newPassword = 'Admin@12345';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.password = hashedPassword;
    await admin.save();

    console.log('---------------------------------------------');
    console.log('Password reset successful!');
    console.log(`Admin Name:  ${admin.name}`);
    console.log(`Admin Phone: ${admin.phone}`);
    console.log(`New Password: ${newPassword}`);
    console.log('---------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Password reset failed:', error);
    process.exit(1);
  }
};

resetAdminPassword();
