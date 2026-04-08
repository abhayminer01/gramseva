require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import new split models
const Authority = require('../models/Authority');
const Citizen = require('../models/Citizen');

const wipeAndReseed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected. Wiping databases...');

    // Wipe both collections
    await Authority.deleteMany({});
    await Citizen.deleteMany({});
    
    // Check if grievances model exists. If yes, wipe it too to avoid orphans.
    try {
       const Grievance = mongoose.model('Grievance');
       if(Grievance) await Grievance.deleteMany({});
    } catch(e) {
       // Grievance model not loaded yet, or might not exist
    }

    console.log('Collections cleared. Seeding Super Admin...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AbhayMiner@123', salt);

    const admin = await Authority.create({
      name: 'AbhayMiner',
      phone: '9074890577',
      password: hashedPassword,
      role: 'admin',
      district: 'System Base',
      localBodyType: 'System',
      localBodyName: 'State'
    });

    console.log('Super Admin successfully seeded inside Authority DB!');
    console.log(admin);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

wipeAndReseed();
