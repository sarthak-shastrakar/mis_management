const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    // Auto-generated unique ID (e.g. PMAYG12345678)
    beneficiaryId: {
      type: String,
      unique: true,
      required: true,
    },

    // ── Basic Details ──────────────────────────────────────────
    beneficiaryName: {
      type: String,
      required: [true, 'Please add beneficiary name'],
      trim: true,
    },
    fatherHusbandName: {
      type: String,
      required: [true, 'Please add father/husband name'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please add mobile number'],
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit mobile number'],
    },
    relation: {
      type: String,
      enum: ['Self', 'Father', 'Husband', 'Other'],
      default: 'Self',
    },

    // ── Location ───────────────────────────────────────────────
    address: {
      type: String,
      required: [true, 'Please add address'],
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    district: {
      type: String,
      required: [true, 'Please add district'],
    },
    block: {
      type: String,
      required: [true, 'Please add block'],
    },
    village: {
      type: String,
      required: [true, 'Please add village'],
    },

    // ── Config ─────────────────────────────────────────────────
    maxTraineeLimit: {
      type: Number,
      required: [true, 'Please set max trainee limit'],
      min: [1, 'Max trainee limit must be at least 1'],
      default: 5,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },

    // ── Ownership ──────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.PMBeneficiary || mongoose.model('PMBeneficiary', beneficiarySchema);

