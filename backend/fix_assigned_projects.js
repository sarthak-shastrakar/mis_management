const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Manager = require('./src/modules/manager/models/managerModel');
const Project = require('./src/modules/project/models/projectModel');

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const managers = await Manager.find();
    console.log(`Found ${managers.length} managers`);

    for (const manager of managers) {
      console.log(`Checking manager: ${manager.fullName} (${manager.managerId})`);
      console.log(`  Current assignedProject: ${manager.assignedProject}`);

      // If it's a string like "None" or not a valid ObjectId, we should check Project model
      // But wait, the schema change already makes it null if it's not a valid ID?
      // Mongoose might have casted it to null if it wasn't a valid ObjectId.
      
      const project = await Project.findOne({ manager: manager._id });
      if (project) {
        console.log(`  Found project for this manager: ${project.name} (${project._id})`);
        if (!manager.assignedProject || manager.assignedProject.toString() !== project._id.toString()) {
          manager.assignedProject = project._id;
          await manager.save();
          console.log(`  Updated manager's assignedProject to: ${project._id}`);
        }
      } else {
        console.log(`  No project found for this manager in Project collection.`);
        // If no project found, ensure assignedProject is null
        if (manager.assignedProject) {
           manager.assignedProject = null;
           await manager.save();
           console.log(`  Cleared manager's assignedProject.`);
        }
      }
    }

    console.log('Data fix complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixData();
