const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Manager = require('./src/modules/manager/models/managerModel');
const Project = require('./src/modules/project/models/projectModel');

async function heavyFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Sync Project -> Manager
    // Every project with a manager ID should ensure that manager points back to this project
    const projects = await Project.find({ manager: { $ne: null } });
    console.log(`Checking ${projects.length} projects with managers...`);

    for (const prj of projects) {
        console.log(`Project: ${prj.name} assigned to Manager ID: ${prj.manager}`);
        const manager = await Manager.findById(prj.manager);
        if (manager) {
            console.log(`  Updating Manager: ${manager.fullName}`);
            manager.assignedProject = prj._id;
            await manager.save();
        } else {
            console.warn(`  Manager with ID ${prj.manager} not found! Cleaning project field.`);
            prj.manager = null;
            await prj.save();
        }
    }

    // 2. Sync Manager -> Project
    // Every manager with an assignedProject ID should ensure that project points back to this manager
    const managers = await Manager.find({ assignedProject: { $ne: null } });
    console.log(`\nChecking ${managers.length} managers with projects...`);

    for (const m of managers) {
        console.log(`Manager: ${m.fullName} assigned to Project ID: ${m.assignedProject}`);
        const project = await Project.findById(m.assignedProject);
        if (project) {
            console.log(`  Updating Project: ${project.name}`);
            project.manager = m._id;
            await project.save();
        } else {
            console.warn(`  Project with ID ${m.assignedProject} not found! Cleaning manager field.`);
            m.assignedProject = null;
            await m.save();
        }
    }

    console.log('\nHeavy fix complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

heavyFix();
