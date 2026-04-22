const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    registrationNo: {
      type: String,
      unique: true,
      required: [true, 'Please add a registration number'],
      trim: true,
    },
    houseOwnerName: {
      type: String,
      required: [true, 'Please add house owner name'],
    },
    location: {
      district: { type: String, required: true },
      block: { type: String, required: true },
      village: { type: String, required: true },
    },
    trainees: [
      {
        name: { type: String },
        mobileNumber: { type: String },
        aadharNumber: { type: String },
        bankAccountNo: { type: String },
        ifscCode: { type: String },
        result: { type: String }, // PASS/FAIL/ABSENT
      }
    ],
    batchId: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: false,
    },
    trainerNameFromExcel: {
      type: String, // Kept for reference or lookup
    },
    isCertified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
