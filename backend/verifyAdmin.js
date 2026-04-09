const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./src/modules/admin/models/adminModel');

async function verifyAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    let admin = await Admin.findOne({ username: '@admin' });
    
    if (admin) {
      console.log('Admin user @admin found. Resetting password to admin123...');
      admin.password = 'admin123';
      await admin.save();
      console.log('Password reset successfully.');
    } else {
      console.log('Admin user @admin not found. Creating it...');
      await Admin.create({
        name: 'Super Admin',
        username: '@admin',
        password: 'admin123'
      });
      console.log('Admin created with username: @admin and password: admin123');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

verifyAdmin();
