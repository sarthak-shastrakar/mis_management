const mongoose = require('mongoose');

const beneficiaryAssignmentSchema = new mongoose.Schema(
  {
    // ── Core References ────────────────────────────────────────
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainee',
      required: [true, 'Trainee is required'],
    },
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PMBeneficiary',
      required: [true, 'Beneficiary is required'],
    },

    // ── Who submitted the request ──────────────────────────────
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },

    // ── Manager who needs to approve ──────────────────────────
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },

    // ── Assignment Config ──────────────────────────────────────
    maxTraineeToAssign: {
      type: Number,
      required: [true, 'Please enter max trainee to assign'],
      min: [1, 'Must be at least 1'],
    },

    // ── Manager Decision ───────────────────────────────────────
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    managerRemarks: {
      type: String,
      default: null,
    },

    // ── Auto-generated on Approval ─────────────────────────────
    generatedTraineeCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.BeneficiaryAssignment || mongoose.model('BeneficiaryAssignment', beneficiaryAssignmentSchema);
