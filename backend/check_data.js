const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('./src/modules/location/models/locationModel');
const Project = require('./src/modules/project/models/projectModel');

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI);
  const locationCount = await Location.countDocuments();
  const projectLocations = await Project.distinct('location.state');
  console.log('Location Count:', locationCount);
  console.log('Unique States in Projects:', projectLocations);
  process.exit();
}

checkData();
