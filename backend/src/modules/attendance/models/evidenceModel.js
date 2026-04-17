const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      required: [true, 'Trainer ID is required'],
    },
    projectId: {
      type: String, // Storing as String to match current project referencing pattern
      required: [true, 'Project ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Evidence date is required'],
      default: Date.now
    },
    photos: [
      {
        type: String, // Cloudinary URLs
        required: true,
      }
    ],
    video: {
      type: String, // Single Cloudinary URL
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster lookups
evidenceSchema.index({ trainerId: 1, projectId: 1, date: -1 });

module.exports = mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema);
