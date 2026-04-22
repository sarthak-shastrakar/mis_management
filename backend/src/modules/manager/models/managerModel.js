const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const managerSchema = new mongoose.Schema(
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
    emailAddress: {
      type: String,
      required: [true, 'Please add email address'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    district: {
      type: String,
      required: [true, 'Please add district'],
    },
    assignedProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending',
    },
    managerId: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
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
      default: 'manager',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
managerSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match manager entered password to hashed password in database
managerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Manager', managerSchema);
