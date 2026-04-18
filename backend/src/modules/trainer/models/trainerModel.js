const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const trainerSchema = new mongoose.Schema(
  {
    // ── Basic Info (filled by Manager) ──────────────────────
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
    staffId: { // Synced with trainerId for consistency in Staff Role
      type: String,
      unique: true,
    },
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      }
    ],
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    district: {
      type: String,
      required: [true, 'Please add district/city'],
    },
    placementLocation: {
      state: { type: String },
      district: { type: String },
      taluka: { type: String },
      village: { type: String },
    },

    // ── Auth ─────────────────────────────────────────────────
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
      default: 'trainer', // System level role
    },
    accountRole: { // Functional role from MIS doc
      type: String,
      enum: ['trainer', 'demonstrator', 'supervisor'],
      default: 'trainer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // ── First Login & Profile Completion Flags ───────────────
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // ── Bank & Identity Details (filled on onboarding) ───────
    email: {
      type: String,
      default: null,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    alternativeMobileNumber: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
      default: null,
    },
    alternativeEmail: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
      default: null,
    },
    dateOfBirth: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, 'Please add a valid 6-digit pincode'],
      default: null,
    },
    aadharNumber: {
      type: String,
      default: null,
      match: [/^[0-9]{12}$/, 'Please add a valid 12-digit Aadhar number'],
    },
    panCardNumber: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    accountNumber: {
      type: String,
      default: null,
    },
    ifscCode: {
      type: String,
      default: null,
    },

    // ── ToT (Training of Trainers) Details ────────────────────
    totStatus: {
      type: String,
      enum: ['NE', 'Planned', 'Certified', null],
      default: null,
    },
    totLevel: {
      type: String,
      enum: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', null],
      default: null,
    },

    // ── Profile Extras ────────────────────────────────────────
    residentCity: {
      type: String,
      default: null,
    },
    joiningLocation: {
      type: String,
      default: null,
    },
    qualification: {
      type: String,
      default: null,
    },
    profilePhoto: {
      type: String, // Selfie URL
      default: null,
    },
    taluka: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },

    // ── Management & Metrics ──────────────────────────────────
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    attendanceRate: {
      type: Number,
      default: 0,
    },
    totalUploads: {
      type: Number,
      default: 0,
    },
    oneSignalPlayerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Hash password before save ─────────────────────────────
trainerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password ──────────────────────────────────────
trainerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Trainer', trainerSchema);
