const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const trainerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add full name'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please add mobile number'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
    },
    trainerId: {
      type: String,
      unique: true,
      required: [true, 'Please add trainer ID'],
    },
    assignedProject: {
      type: String,
      default: 'None',
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    district: {
      type: String,
      required: [true, 'Please add district/city'],
    },
    username: {
      type: String,
      unique: true,
      required: [true, 'Please add username'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    plainPassword: {
      type: String,
    },
    role: {
      type: String,
      default: 'trainer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
trainerSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match trainer entered password to hashed password in database
trainerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Trainer', trainerSchema);
