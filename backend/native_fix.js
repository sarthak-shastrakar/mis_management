const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function nativeFix() {
  try {
    const client = await mongoose.connect(process.env.MONGO_URI);
    const db = client.connection.db;
    const managerCollection = db.collection('managers');
    const projectCollection = db.collection('projects');

    console.log('Connected to DB');

    // 1. Clear all assignedProject fields that are NOT valid ObjectIds (like "None")
    const managers = await managerCollection.find({}).toArray();
    for (const m of managers) {
        if (m.assignedProject && typeof m.assignedProject === 'string' && m.assignedProject.length !== 24) {
            console.log(`Clearing invalid assignedProject: "${m.assignedProject}" for manager ${m.fullName}`);
            await managerCollection.updateOne({ _id: m._id }, { $set: { assignedProject: null } });
        }
    }

    // 2. Fix bidirectional based on current Project collections
    const projects = await projectCollection.find({ manager: { $ne: null } }).toArray();
    for (const prj of projects) {
        if (prj.manager) {
            console.log(`Syncing Manager ${prj.manager} to Project ${prj.name}`);
            await managerCollection.updateOne({ _id: prj.manager }, { $set: { assignedProject: prj._id } });
        }
    }

    console.log('Native fix complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

nativeFix();
