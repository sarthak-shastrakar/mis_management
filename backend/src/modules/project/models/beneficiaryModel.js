const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: String,
      required: [true, 'Beneficiary ID is required'],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Beneficiary name is required'],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project association is required'],
    },
    location: {
      state: String,
      district: String,
      taluka: String,
      village: String,
    },
    contactNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Beneficiary || mongoose.model('Beneficiary', beneficiarySchema);
