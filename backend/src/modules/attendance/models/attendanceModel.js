const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer ID is required'],
    },
    projectId: {
      type: String,
      required: [true, 'Project is required'],
    },
    date: {
      type: Date,
      required: [true, 'Please add attendance date'],
    },
    photos: [
      {
        type: String, // Cloudinary URLs
        required: true,
      }
    ],
    videos: [
      {
        type: String, // Cloudinary URLs
      }
    ],
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'pending_approval', 'approved', 'rejected'],
      default: 'present',
    },
    // Late upload handling
    daysLate: {
      type: Number,
      default: 0,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    // Manager metadata
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for same trainer, project, and date (day-only check)
attendanceSchema.index({ trainerId: 1, projectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
