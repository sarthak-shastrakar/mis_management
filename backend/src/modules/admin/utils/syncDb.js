const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Project = require(path.join(__dirname, '../../project/models/projectModel'));
const Manager = require(path.join(__dirname, '../../manager/models/managerModel'));

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const syncDatabase = async () => {
    try {
        console.log('🚀 Starting Database Repair & Synchronization...');
        
        // Use hardcoded URI if env fails for script
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mis_management';
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`📡 Connected to MongoDB: ${conn.connection.host}`);

        // 1. Reset all Manager assignedProjects arrays
        console.log('🧹 Clearing old assignment references...');
        await Manager.updateMany({}, { $set: { assignedProjects: [] } });

        // 2. Fetch all Projects
        const projects = await Project.find();
        console.log(`📦 Found ${projects.length} Projects to process.`);

        let syncCount = 0;

        // 3. Re-assign based on Project's manager field
        for (const prj of projects) {
            if (prj.manager) {
                await Manager.findByIdAndUpdate(prj.manager, {
                    $addToSet: { assignedProjects: prj._id }
                });
                syncCount++;
            }
        }

        console.log(`✅ Synchronization Complete!`);
        console.log(`📈 Successfully mapped ${syncCount} assignments to Manager documents.`);
        
        process.exit();
    } catch (err) {
        console.error('❌ Sync Failed:', err.message);
        process.exit(1);
    }
};

syncDatabase();
