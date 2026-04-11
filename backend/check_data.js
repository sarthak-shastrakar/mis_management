const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Manager = require('./src/modules/manager/models/managerModel');
const Project = require('./src/modules/project/models/projectModel');


async function checkProjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const projects = await Project.find().populate('manager');
    console.log(`Found ${projects.length} projects`);

    for (const prj of projects) {
      console.log(`Project: ${prj.name} (${prj._id})`);
      console.log(`  Manager Field: ${prj.manager ? prj.manager.fullName + ' (' + prj.manager._id + ')' : 'null'}`);
    }

    const managers = await Manager.find().populate('assignedProject');
    console.log(`\nFound ${managers.length} managers`);
    for (const m of managers) {
      console.log(`Manager: ${m.fullName} (${m._id})`);
      console.log(`  Assigned Project: ${m.assignedProject ? m.assignedProject.name + ' (' + m.assignedProject._id + ')' : 'null'}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProjects();
