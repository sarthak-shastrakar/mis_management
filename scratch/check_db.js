const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function checkCollections() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/trainerdb';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in DB:');
    collections.forEach(c => console.log(' -', c.name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCollections();
