const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend folder
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const migrateViewers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Define temporary schemas to avoid MODULE_NOT_FOUND
    const ProjectSchema = new mongoose.Schema({}, { strict: false });
    const ViewerSchema = new mongoose.Schema({}, { strict: false });

    const Project = mongoose.model('Project', ProjectSchema);
    const Viewer = mongoose.model('Viewer', ViewerSchema);

    const allProjects = await Project.find();
    const projectIds = allProjects.map(p => p._id);

    console.log(`Found ${projectIds.length} projects.`);

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
