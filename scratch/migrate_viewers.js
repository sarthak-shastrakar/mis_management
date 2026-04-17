const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Viewer = require('../backend/src/modules/viewer/models/viewerModel');
const Project = require('../backend/src/modules/project/models/projectModel');

const migrateViewers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const allProjects = await Project.find();
    const projectIds = allProjects.map(p => p._id);

    const result = await Viewer.updateMany(
      {},
      { $set: { assignedProjects: projectIds } }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} viewers.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrateViewers();
