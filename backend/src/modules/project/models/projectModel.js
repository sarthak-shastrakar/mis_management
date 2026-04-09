const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    projectCategory: {
      type: String,
      enum: ['PMAY-G STT Mode', 'PMAY-G RPL Mode', 'MoRTH RPL', 'BoCW RPL', 'None'],
      default: 'None',
    },
    workOrderNo: {
      type: String,
      required: [true, 'Please add work order number'],
      unique: true,
    },
    description: {
      type: String,
    },
    sanctionOrderUrl: {
      type: String, // Cloudinary URL for PDG/JPG
    },
    allocatedTarget: {
      type: Number,
      required: [true, 'Please add allocated target'],
    },
    trainingHours: {
      type: Number,
      enum: [360, 390, 72, 168, 120],
      required: [true, 'Please select training hours'],
    },
    trainingCostPerHour: {
      type: Number,
      enum: [38.5, 46.5, 53.5],
      default: 38.5
    },
    totalProjectCost: {
      type: Number,
      default: 0
    },
    
    // ── Installment 1 ────────────────────────────────────────
    installment1Status: {
      type: String,
      enum: ['Bill Submitted', 'Bill Under Process', 'Payment received', 'None'],
      default: 'None',
    },
    installment1Date: {
      type: Date,
    },

    // ── Assessment ──────────────────────────────────────────
    assessmentFeesPaidBy: {
      type: String,
      enum: ['SBSS', 'District', 'Block', 'State', 'None'],
      default: 'None',
    },
    assessmentStatus: {
      type: String,
      enum: [
        'Batch Enroll',
        'Batch Assign',
        'Batch Schedule',
        'Result Declare',
        'Result Yet to declare',
        'None'
      ],
      default: 'None',
    },
    assessmentDate: {
      type: Date,
    },
    totalPassOut: {
      type: Number,
      default: 0,
    },

    // ── Installment 2 ────────────────────────────────────────
    installment2Status: {
      type: String,
      enum: ['Bill Submitted', 'Bill Under Process', 'Payment received', 'None'],
      default: 'None',
    },
    installment2Date: {
      type: Date,
    },

    // ── Timeline ─────────────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, 'Please add project start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add project completion date'],
    },

    // ── Staff Engagement ─────────────────────────────────────
    maxDemonstrators: {
      type: Number,
      default: 1,
    },

    // ── Location ─────────────────────────────────────────────
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      taluka: { type: String, required: true },
      village: { type: String, required: true },
    },
    projectAddress: {
      type: String,
    },

    // ── Control & Status ─────────────────────────────────────
    progressStatus: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false, // Managers can input once, then locked. Admin can unlock.
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: false,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    projectId: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
