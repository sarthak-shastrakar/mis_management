const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./src/modules/admin/models/adminModel');
const Manager = require('./src/modules/manager/models/managerModel');
const Trainer = require('./src/modules/trainer/models/trainerModel');

async function checkUsers() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await Admin.find({});
    const managers = await Manager.find({});
    const trainers = await Trainer.find({});

    console.log('--- Database Status ---');
    console.log('Admins:', admins.length);
    admins.forEach(a => console.log(`  - ${a.username}`));
    
    console.log('Managers:', managers.length);
    managers.forEach(m => console.log(`  - ${m.username}`));
    
    console.log('Trainers:', trainers.length);
    trainers.forEach(t => console.log(`  - ${t.username}`));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
