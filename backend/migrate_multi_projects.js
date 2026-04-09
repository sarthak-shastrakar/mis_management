const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const managers = await db.collection('managers').find({}).toArray();

    console.log(`Found ${managers.length} managers to check.`);

    for (const m of managers) {
      if (m.assignedProject !== undefined) {
        console.log(`Migrating manager: ${m.fullName}`);
        
        const projects = m.assignedProject ? [m.assignedProject] : [];
        
        await db.collection('managers').updateOne(
          { _id: m._id },
          { 
            $set: { assignedProjects: projects },
            $unset: { assignedProject: "" }
          }
        );
        console.log(`  Moved ${projects.length} project(s) to assignedProjects array.`);
      }
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
