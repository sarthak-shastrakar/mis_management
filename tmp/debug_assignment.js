const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Trainer = require('../backend/src/modules/trainer/models/trainerModel');
const Project = require('../backend/src/modules/project/models/projectModel');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const trainers = await Trainer.find().populate('assignedProjects').limit(5);
  trainers.forEach(t => {
    console.log(`Trainer: ${t.fullName} (${t.username})`);
    console.log(`Assigned Projects:`, t.assignedProjects.map(p => ({ id: p._id, projectId: p.projectId, name: p.name })));
    console.log('---');
  });

  const projects = await Project.find().limit(5);
  console.log('Sample Projects in DB:');
  projects.forEach(p => {
    console.log(`Project: ${p.name}, _id: ${p._id}, projectId: ${p.projectId}`);
  });

  process.exit();
}

debug();
