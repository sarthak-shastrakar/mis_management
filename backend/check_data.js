const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'src/config/.env') });

const Trainer = require('./src/modules/trainer/models/trainerModel');
const Manager = require('./src/modules/manager/models/managerModel');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const trainers = await Trainer.find().lean();
    console.log(`\nFound ${trainers.length} trainers total.`);

    const managers = await Manager.find().lean();
    console.log(`Found ${managers.length} managers total.\n`);

    managers.forEach(m => {
      console.log(`Manager: ${m.fullName} (${m.username}) - ID: ${m._id}`);
    });

    console.log('\nTrainer Details:');
    trainers.forEach(t => {
      console.log(`- ${t.fullName} (${t.trainerId}):`);
      console.log(`  createdBy: ${t.createdBy}`);
      console.log(`  reportingManager: ${t.reportingManager}`);
      console.log(`  assignedProjects: ${t.assignedProjects}`);
    });

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
