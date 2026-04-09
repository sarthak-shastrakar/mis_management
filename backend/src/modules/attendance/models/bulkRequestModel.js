const mongoose = require('mongoose');

const bulkRequestSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: true,
    },
    projectId: {
      type: String, // project UUID or ID
      required: true,
    },
    requestedDates: [
      {
        type: Date,
        required: true,
      }
    ],
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected'],
      default: 'Pending Approval',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    managerRemarks: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.BulkAttendanceRequest || mongoose.model('BulkAttendanceRequest', bulkRequestSchema);
